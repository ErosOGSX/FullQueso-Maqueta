class PagoMovilService {
  constructor() {
    this.supportedBanks = [
      'Banesco', 'Mercantil', 'BBVA Provincial', 
      'Banco de Venezuela', 'BDT', 'Banco del Tesoro', 'Banco Exterior'
    ];
  }

  async processTransfer(orderData, transferData) {
    try {
      // Validar datos de transferencia
      const validation = this.validateTransferData(transferData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Simular procesamiento de Pago Móvil
      const result = await this.simulatePagoMovil(orderData, transferData);
      
      return result;
    } catch (error) {
      console.error('Pago Móvil error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateTransferData(transferData) {
    // Validar teléfono venezolano
    const phoneRegex = /^(0414|0424|0412|0416|0426)\d{7}$/;
    if (!phoneRegex.test(transferData.phone)) {
      return {
        isValid: false,
        error: 'Número de teléfono inválido'
      };
    }

    // Validar cédula venezolana
    const cedulaRegex = /^\d{7,8}$/;
    if (!cedulaRegex.test(transferData.cedula)) {
      return {
        isValid: false,
        error: 'Número de cédula inválido'
      };
    }

    // Validar banco
    if (!this.supportedBanks.includes(transferData.bank)) {
      return {
        isValid: false,
        error: 'Banco no soportado'
      };
    }

    // Validar referencia
    if (!transferData.reference || transferData.reference.length < 6) {
      return {
        isValid: false,
        error: 'Número de referencia inválido'
      };
    }

    return { isValid: true };
  }

  async simulatePagoMovil(orderData, transferData) {
    // Simular delay de verificación
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Simular verificación exitosa (85% de éxito)
    const isSuccessful = Math.random() > 0.15;
    
    if (isSuccessful) {
      return {
        success: true,
        transactionId: `PM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reference: transferData.reference,
        bank: transferData.bank,
        status: 'pending_verification',
        amount: orderData.total,
        currency: 'VES',
        message: 'Pago móvil recibido, verificando con el banco...'
      };
    } else {
      return {
        success: false,
        error: 'No se pudo verificar la transferencia. Verifica los datos e intenta nuevamente.'
      };
    }
  }

  async verifyTransfer(transactionId, bankReference) {
    try {
      // Simular verificación con el banco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resultado de verificación (90% exitoso)
      const isVerified = Math.random() > 0.1;
      
      return {
        success: true,
        verified: isVerified,
        status: isVerified ? 'verified' : 'rejected',
        transactionId,
        bankReference
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getBankInfo(bankName) {
    const bankInfo = {
      'Banesco': {
        code: '0134',
        pagoMovilCode: '0134',
        supportsPagoMovil: true
      },
      'Mercantil': {
        code: '0105',
        pagoMovilCode: '0105',
        supportsPagoMovil: true
      },
      'BBVA Provincial': {
        code: '0108',
        pagoMovilCode: '0108',
        supportsPagoMovil: true
      },
      'Banco de Venezuela': {
        code: '0102',
        pagoMovilCode: '0102',
        supportsPagoMovil: true
      },
      'BDT': {
        code: '0175',
        pagoMovilCode: '0175',
        supportsPagoMovil: false
      }
    };

    return bankInfo[bankName] || null;
  }
}

module.exports = new PagoMovilService();