const express = require('express');
const { body, validationResult } = require('express-validator');
const stripeService = require('../services/stripeService');
const venecardService = require('../services/venecardService');
const pagoMovilService = require('../services/pagoMovilService');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

const router = express.Router();

// Validaciones comunes
const orderValidation = [
  body('orderId').isUUID().withMessage('ID de orden inválido'),
  body('total').isFloat({ min: 0.01 }).withMessage('Total debe ser mayor a 0'),
  body('currency').isIn(['USD', 'VES']).withMessage('Moneda no válida')
];

// POST /api/payments/stripe - Crear payment intent de Stripe
router.post('/stripe', [
  ...orderValidation,
  body('customerEmail').isEmail().withMessage('Email inválido'),
  body('customerName').notEmpty().withMessage('Nombre requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, total, currency, customerEmail, customerName } = req.body;

    // Verificar que la orden existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Crear payment intent
    const result = await stripeService.createPaymentIntent({
      id: orderId,
      total,
      customerEmail,
      customerName
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Crear registro de transacción
    await Transaction.create({
      orderId,
      paymentMethod: 'stripe',
      amount: total,
      currency: 'USD',
      status: 'pending',
      stripePaymentIntentId: result.paymentIntentId
    });

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });

  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({ error: 'Error procesando pago con Stripe' });
  }
});

// POST /api/payments/venecard - Procesar pago con Venecard
router.post('/venecard', [
  ...orderValidation,
  body('cardData.number').notEmpty().withMessage('Número de tarjeta requerido'),
  body('cardData.expMonth').isInt({ min: 1, max: 12 }).withMessage('Mes de expiración inválido'),
  body('cardData.expYear').isInt({ min: 2024 }).withMessage('Año de expiración inválido'),
  body('cardData.cvc').isLength({ min: 3, max: 4 }).withMessage('CVC inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, total, cardData } = req.body;

    // Verificar que la orden existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Procesar pago con Venecard
    const result = await venecardService.processPayment({ id: orderId, total }, cardData);

    // Crear registro de transacción
    const transaction = await Transaction.create({
      orderId,
      paymentMethod: 'venecard',
      amount: total,
      currency: 'VES',
      status: result.success ? 'authorized' : 'failed',
      venecardTransactionId: result.transactionId || null,
      metadata: {
        authorizationCode: result.authorizationCode,
        cardLast4: cardData.number.slice(-4)
      }
    });

    if (result.success) {
      // Actualizar estado de la orden
      await order.update({ status: 'confirmed' });
    }

    res.json({
      success: result.success,
      transactionId: transaction.id,
      venecardTransactionId: result.transactionId,
      authorizationCode: result.authorizationCode,
      error: result.error
    });

  } catch (error) {
    console.error('Venecard payment error:', error);
    res.status(500).json({ error: 'Error procesando pago con Venecard' });
  }
});

// POST /api/payments/pago-movil - Procesar Pago Móvil
router.post('/pago-movil', [
  ...orderValidation,
  body('transferData.phone').matches(/^(0414|0424|0412|0416|0426)\d{7}$/).withMessage('Teléfono inválido'),
  body('transferData.cedula').matches(/^\d{7,8}$/).withMessage('Cédula inválida'),
  body('transferData.bank').notEmpty().withMessage('Banco requerido'),
  body('transferData.reference').isLength({ min: 6 }).withMessage('Referencia inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, total, transferData } = req.body;

    // Verificar que la orden existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Procesar Pago Móvil
    const result = await pagoMovilService.processTransfer({ id: orderId, total }, transferData);

    // Crear registro de transacción
    const transaction = await Transaction.create({
      orderId,
      paymentMethod: 'pago_movil',
      amount: total,
      currency: 'VES',
      status: result.success ? 'pending_verification' : 'failed',
      bankReference: transferData.reference,
      bankName: transferData.bank,
      verificationStatus: 'pending',
      metadata: {
        phone: transferData.phone,
        cedula: transferData.cedula
      }
    });

    res.json({
      success: result.success,
      transactionId: transaction.id,
      status: result.status,
      message: result.message,
      error: result.error
    });

  } catch (error) {
    console.error('Pago Móvil error:', error);
    res.status(500).json({ error: 'Error procesando Pago Móvil' });
  }
});

// GET /api/payments/transaction/:id - Obtener estado de transacción
router.get('/transaction/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: Order, as: 'order' }]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        orderId: transaction.orderId,
        paymentMethod: transaction.paymentMethod,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        verificationStatus: transaction.verificationStatus,
        createdAt: transaction.created_at
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Error obteniendo transacción' });
  }
});

module.exports = router;