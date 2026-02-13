class VenecardService {
  constructor() {
    this.apiUrl = 'https://api.venecard.com/v1';
    this.apiKey = process.env.VENECARD_API_KEY;
    this.merchantId = process.env.VENECARD_MERCHANT_ID;
  }

  async processPayment(orderData, cardData) {
    try {
      // Simulación de API de Venecard (reemplazar con API real)
      const response = await this.simulateVenecardAPI(orderData, cardData);
      
      return response;
    } catch (error) {
      console.error('Venecard error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulación temporal - reemplazar con API real de Venecard
  async simulateVenecardAPI(orderData, cardData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simular validación de tarjeta
    const isValidCard = this.validateVenezuelanCard(cardData.number);
    
    if (!isValidCard) {
      return {
        success: false,
        error: 'Tarjeta no válida o no soportada'
      };
    }

    // Verificar si es una tarjeta que debe fallar
    const cleanNumber = cardData.number.replace(/\s/g, '');
    const failingCards = [
      '4000000000000002', // Tarjeta declinada
      '4000000000009995', // Fondos insuficientes
      '4000000000000069', // Tarjeta expirada
      '4000000000000127'  // CVC incorrecto
    ];
    
    const shouldFail = failingCards.includes(cleanNumber);
    const isSuccessful = !shouldFail && Math.random() > 0.1;
    
    if (isSuccessful) {
      return {
        success: true,
        transactionId: `VNC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        authorizationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'approved',
        amount: orderData.total,
        currency: 'VES'
      };
    } else {
      return {
        success: false,
        error: 'Transacción rechazada por el banco emisor'
      };
    }
  }

  validateVenezuelanCard(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Patrones de bancos venezolanos
    const venezuelanPatterns = [
      /^601638/, // Banesco
      /^627780/, // Banesco
      /^589657/, // Banesco
      /^540711/, // Mercantil
      /^540712/, // Mercantil
      /^540713/, // Mercantil
      /^446517/, // Provincial
      /^446518/, // Provincial
      /^527023/, // Provincial
      /^484849/, // BDV
      /^484850/, // BDV
      /^527571/, // BDV
      /^627648/, // BDT
      /^627649/, // BDT
      /^627770/, // Tesoro
      /^627771/, // Tesoro
      /^527572/, // Exterior
      /^527573/  // Exterior
    ];

    return venezuelanPatterns.some(pattern => pattern.test(cleanNumber));
  }

  async verifyTransaction(transactionId) {
    try {
      // Simulación - reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        status: 'verified',
        transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VenecardService();