import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_BASE = 'http://localhost:3001/api';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.init();
  }

  async init() {
    this.stripe = await stripePromise;
  }

  // Crear orden primero
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear sesión de pago con Stripe
  async createStripeSession(orderData) {
    try {
      const response = await fetch(`${API_BASE}/payments/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          total: orderData.total,
          currency: 'USD',
          customerEmail: orderData.customerInfo.email,
          customerName: orderData.customerInfo.name
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      return { success: false, error: error.message };
    }
  }

  // Procesar pago con Stripe Elements
  async processStripePayment(clientSecret, paymentMethod) {
    try {
      if (!this.stripe) {
        await this.init();
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        paymentIntent,
        transactionId: paymentIntent.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Integración con Venecard
  async processVenecardPayment(orderData, cardData) {
    try {
      const response = await fetch(`${API_BASE}/payments/venecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          total: orderData.total,
          currency: 'VES',
          cardData
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error processing Venecard payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Pago Móvil
  async processPagoMovil(orderData, pagoMovilData) {
    try {
      const response = await fetch(`${API_BASE}/payments/pago-movil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          total: orderData.total,
          currency: 'VES',
          transferData: pagoMovilData
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Validar estado del pago
  async validatePaymentStatus(transactionId, paymentMethod) {
    try {
      let endpoint = '/api/validate-payment';
      
      if (paymentMethod === 'stripe') {
        endpoint = '/api/stripe/validate';
      } else if (paymentMethod === 'venecard') {
        endpoint = '/api/venecard/validate';
      }

      const response = await fetch(`${endpoint}/${transactionId}`);
      const result = await response.json();
      
      return {
        success: true,
        status: result.status,
        details: result.details
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new PaymentService();