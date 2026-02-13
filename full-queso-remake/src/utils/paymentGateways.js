// Sistema dual de pagos: Venecard + Stripe
import { loadStripe } from '@stripe/stripe-js';

// Configuración de pasarelas
const PAYMENT_CONFIG = {
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51234567890abcdef',
    apiUrl: 'https://api.stripe.com/v1',
    successUrl: import.meta.env.VITE_PAYMENT_SUCCESS_URL || `${window.location.origin}/payment-success`,
    cancelUrl: import.meta.env.VITE_PAYMENT_CANCEL_URL || `${window.location.origin}/cart`
  },
  venecard: {
    publicKey: import.meta.env.VITE_VENECARD_PUBLIC_KEY || 'vc_test_51234567890abcdef',
    apiUrl: import.meta.env.VITE_VENECARD_API_URL || 'https://api.venecard.com/v1',
    callbackUrl: import.meta.env.VITE_PAYMENT_CALLBACK_URL || `${window.location.origin}/payment-callback`
  }
};

// Detección automática de tipo de tarjeta
export const detectCardType = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Tarjetas venezolanas (BINs locales)
  const venezuelanBins = {
    // Banesco
    '589657': 'banesco_ve',
    '589658': 'banesco_ve',
    '589659': 'banesco_ve',
    // Mercantil
    '540711': 'mercantil_ve',
    '540712': 'mercantil_ve',
    // Provincial
    '456789': 'provincial_ve',
    // BDV
    '589900': 'bdv_ve',
    '589901': 'bdv_ve'
  };
  
  // Verificar BINs venezolanos
  for (const [bin, bank] of Object.entries(venezuelanBins)) {
    if (cleanNumber.startsWith(bin)) {
      return { type: 'venezuelan', bank, gateway: 'venecard' };
    }
  }
  
  // Tarjetas internacionales
  if (cleanNumber.startsWith('4')) {
    return { type: 'international', brand: 'visa', gateway: 'stripe' };
  }
  if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
    return { type: 'international', brand: 'mastercard', gateway: 'stripe' };
  }
  
  // Por defecto, asumir venezolana
  return { type: 'venezuelan', bank: 'unknown', gateway: 'venecard' };
};

// Procesador de pagos unificado
export class PaymentProcessor {
  constructor() {
    this.stripe = null;
    this.initializeGateways();
  }
  
  async initializeGateways() {
    try {
      this.stripe = await loadStripe(PAYMENT_CONFIG.stripe.publicKey);
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }
  
  async processPayment(paymentData) {
    const { cardNumber, amount, currency = 'USD' } = paymentData;
    const cardInfo = detectCardType(cardNumber);
    
    try {
      if (cardInfo.gateway === 'stripe') {
        return await this.processStripePayment(paymentData);
      } else {
        return await this.processVenecardPayment(paymentData);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        gateway: cardInfo.gateway
      };
    }
  }
  
  async processStripePayment(paymentData) {
    const { amount, currency, orderData } = paymentData;
    
    if (!this.stripe) {
      throw new Error('Stripe no está inicializado');
    }
    
    const { error } = await this.stripe.redirectToCheckout({
      lineItems: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Pedido Full Queso #${orderData.id}`,
            description: `${orderData.items?.length || 0} productos`
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      successUrl: `${PAYMENT_CONFIG.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderData.id}`,
      cancelUrl: PAYMENT_CONFIG.stripe.cancelUrl,
      metadata: {
        orderId: orderData.id,
        gateway: 'stripe',
        timestamp: new Date().toISOString()
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, gateway: 'stripe' };
  }
  
  async processVenecardPayment(paymentData) {
    const { cardNumber, expiryDate, cvv, amount, currency, orderData } = paymentData;
    
    const response = await fetch(`${PAYMENT_CONFIG.venecard.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYMENT_CONFIG.venecard.publicKey}`
      },
      body: JSON.stringify({
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv,
        amount: amount,
        currency: currency,
        order_id: orderData.id,
        description: `Pedido Full Queso #${orderData.id}`,
        callback_url: `${window.location.origin}/payment-callback`
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Error procesando pago con Venecard');
    }
    
    return {
      success: true,
      gateway: 'venecard',
      transactionId: result.transaction_id,
      redirectUrl: result.redirect_url
    };
  }
}

// Instancia global del procesador
export const paymentProcessor = new PaymentProcessor();