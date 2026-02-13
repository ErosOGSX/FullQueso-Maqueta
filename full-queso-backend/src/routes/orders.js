const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Customer, Order, Transaction } = require('../models');

const router = express.Router();

// POST /api/orders - Crear nueva orden
router.post('/', [
  body('customerInfo.email').isEmail().withMessage('Email inválido'),
  body('customerInfo.phone').matches(/^(0414|0424|0412|0416|0426)\d{7}$/).withMessage('Teléfono inválido'),
  body('customerInfo.name').notEmpty().withMessage('Nombre requerido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('total').isFloat({ min: 0.01 }).withMessage('Total inválido'),
  body('deliveryAddress').notEmpty().withMessage('Dirección de entrega requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerInfo, items, total, currency = 'USD', deliveryAddress, deliveryNotes } = req.body;

    // Buscar o crear cliente
    let customer = await Customer.findOne({ where: { email: customerInfo.email } });
    
    if (!customer) {
      customer = await Customer.create({
        email: customerInfo.email,
        phone: customerInfo.phone,
        name: customerInfo.name,
        address: deliveryAddress
      });
    }

    // Calcular tiempo estimado de entrega (45 minutos por defecto)
    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);

    // Crear orden
    const order = await Order.create({
      customerId: customer.id,
      total,
      currency,
      items,
      deliveryAddress,
      deliveryNotes,
      estimatedDelivery,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customerId,
        total: order.total,
        currency: order.currency,
        status: order.status,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Error creando orden' });
  }
});

// GET /api/orders/:id - Obtener orden por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Transaction, as: 'transactions' }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        currency: order.currency,
        status: order.status,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: order.estimatedDelivery,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone
        },
        transactions: order.transactions,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Error obteniendo orden' });
  }
});

// PUT /api/orders/:id/status - Actualizar estado de orden
router.put('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled']).withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    await order.update({ status });

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updated_at
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Error actualizando estado de orden' });
  }
});

// GET /api/orders/customer/:email - Obtener órdenes por email de cliente
router.get('/customer/:email', async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      where: { email: req.params.email },
      include: [{
        model: Order,
        as: 'orders',
        include: [{ model: Transaction, as: 'transactions' }],
        order: [['created_at', 'DESC']]
      }]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({
      success: true,
      orders: customer.orders
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Error obteniendo órdenes del cliente' });
  }
});

module.exports = router;