const express = require('express');
const Stripe = require('stripe');
const { Transaction, Order } = require('../models');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/webhooks/stripe - Webhook de Stripe
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

async function handlePaymentSucceeded(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: [{ model: Order, as: 'order' }]
    });

    if (transaction) {
      await transaction.update({ status: 'captured' });
      await transaction.order.update({ status: 'confirmed' });
      
      console.log(`Payment succeeded for order ${transaction.orderId}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: [{ model: Order, as: 'order' }]
    });

    if (transaction) {
      await transaction.update({ status: 'failed' });
      
      console.log(`Payment failed for order ${transaction.orderId}`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: [{ model: Order, as: 'order' }]
    });

    if (transaction) {
      await transaction.update({ status: 'failed' });
      await transaction.order.update({ status: 'cancelled' });
      
      console.log(`Payment canceled for order ${transaction.orderId}`);
    }
  } catch (error) {
    console.error('Error handling payment canceled:', error);
  }
}

// POST /api/webhooks/verify-transfer - Webhook para verificar transferencias manuales
router.post('/verify-transfer', async (req, res) => {
  try {
    const { transactionId, verified, bankReference } = req.body;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [{ model: Order, as: 'order' }]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const newStatus = verified ? 'verified' : 'rejected';
    const orderStatus = verified ? 'confirmed' : 'cancelled';

    await transaction.update({
      verificationStatus: newStatus,
      status: verified ? 'captured' : 'failed'
    });

    await transaction.order.update({ status: orderStatus });

    res.json({
      success: true,
      transactionId,
      status: newStatus
    });

  } catch (error) {
    console.error('Verify transfer error:', error);
    res.status(500).json({ error: 'Error verificando transferencia' });
  }
});

module.exports = router;