const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createPaymentIntent(orderData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(orderData.total * 100), // Convertir a centavos
        currency: 'usd',
        metadata: {
          orderId: orderData.id,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        paymentIntent
      };
    } catch (error) {
      console.error('Stripe confirm error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);
      
      return {
        success: true,
        refund
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StripeService();