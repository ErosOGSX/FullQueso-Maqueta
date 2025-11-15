// Payment validation and security utilities
import { encryptionManager } from './encryption';

export class PaymentValidator {
  // Validate credit card number using Luhn algorithm
  static validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, error: 'Número de tarjeta inválido' };
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    const valid = sum % 10 === 0;
    return {
      valid,
      error: valid ? null : 'Número de tarjeta inválido',
      type: this.getCardType(cleaned)
    };
  }

  // Get card type from number
  static getCardType(cardNumber) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]|^2[2-7]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      dinersclub: /^3[068]/,
      jcb: /^35/,
      unionpay: /^62/,
      maestro: /^(5018|5020|5038|5893|6304|6759|6761|6762|6763)/,
      elo: /^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6504|6505|6516)/,
      hipercard: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
      banesco: /^5895/, // Banesco Venezuela
      mercantil: /^5896/, // Mercantil Venezuela  
      provincial: /^5897/, // Provincial Venezuela
      venezuela: /^5899/, // Banco de Venezuela
      bicentenario: /^5894/, // Banco Bicentenario
      tesoro: /^5893/, // Banco del Tesoro
      exterior: /^5892/ // Banco Exterior
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) return type;
    }
    return 'unknown';
  }

  // Validate expiry date
  static validateExpiryDate(month, year) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expMonth < 1 || expMonth > 12) {
      return { valid: false, error: 'Mes inválido' };
    }

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return { valid: false, error: 'Tarjeta expirada' };
    }

    return { valid: true, error: null };
  }

  // Validate CVV
  static validateCVV(cvv, cardType = 'visa') {
    const cleaned = cvv.replace(/\D/g, '');
    const fourDigitCards = ['amex', 'dinersclub'];
    const expectedLength = fourDigitCards.includes(cardType) ? 4 : 3;

    if (cleaned.length !== expectedLength) {
      return { 
        valid: false, 
        error: `CVV debe tener ${expectedLength} dígitos` 
      };
    }

    return { valid: true, error: null };
  }

  // Validate Venezuelan phone number
  static validateVenezuelanPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const patterns = [
      /^(0414|0424|0412|0416|0426)\d{7}$/, // Mobile
      /^(0212|0241|0243|0244|0245|0246|0247|0248|0249|0251|0252|0253|0254|0255|0256|0257|0258|0259|0261|0262|0263|0264|0265|0266|0267|0268|0269|0271|0272|0273|0274|0275|0276|0277|0278|0279|0281|0282|0283|0284|0285|0286|0287|0288|0289|0291|0292|0293|0294|0295)\d{7}$/ // Landline
    ];

    const valid = patterns.some(pattern => pattern.test(cleaned));
    return {
      valid,
      error: valid ? null : 'Número de teléfono venezolano inválido',
      formatted: valid ? this.formatVenezuelanPhone(cleaned) : phone
    };
  }

  // Format Venezuelan phone number
  static formatVenezuelanPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  // Validate Venezuelan CI/RIF
  static validateVenezuelanID(id) {
    const cleaned = id.replace(/\D/g, '');
    
    if (cleaned.length < 7 || cleaned.length > 9) {
      return { valid: false, error: 'Cédula inválida' };
    }

    return { valid: true, error: null };
  }

  // Comprehensive payment validation
  static async validatePaymentData(paymentData) {
    const errors = {};

    // Card validation
    if (paymentData.cardNumber) {
      const cardValidation = this.validateCardNumber(paymentData.cardNumber);
      if (!cardValidation.valid) {
        errors.cardNumber = cardValidation.error;
      }
    }

    // Expiry validation
    if (paymentData.expiryMonth && paymentData.expiryYear) {
      const expiryValidation = this.validateExpiryDate(
        paymentData.expiryMonth, 
        paymentData.expiryYear
      );
      if (!expiryValidation.valid) {
        errors.expiry = expiryValidation.error;
      }
    }

    // CVV validation
    if (paymentData.cvv) {
      const cvvValidation = this.validateCVV(paymentData.cvv);
      if (!cvvValidation.valid) {
        errors.cvv = cvvValidation.error;
      }
    }

    // Phone validation
    if (paymentData.phone) {
      const phoneValidation = this.validateVenezuelanPhone(paymentData.phone);
      if (!phoneValidation.valid) {
        errors.phone = phoneValidation.error;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Secure payment data handler
export class SecurePaymentHandler {
  // Encrypt payment data before storage
  static async encryptPaymentData(paymentData) {
    const sensitiveFields = ['cardNumber', 'cvv', 'phone', 'email'];
    const encrypted = { ...paymentData };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = await encryptionManager.encrypt(encrypted[field]);
      }
    }

    return encrypted;
  }

  // Decrypt payment data for processing
  static async decryptPaymentData(encryptedData) {
    const sensitiveFields = ['cardNumber', 'cvv', 'phone', 'email'];
    const decrypted = { ...encryptedData };

    for (const field of sensitiveFields) {
      if (decrypted[field]) {
        decrypted[field] = await encryptionManager.decrypt(decrypted[field]);
      }
    }

    return decrypted;
  }

  // Mask sensitive data for display
  static maskPaymentData(paymentData) {
    const masked = { ...paymentData };

    if (masked.cardNumber) {
      const cleaned = masked.cardNumber.replace(/\D/g, '');
      masked.cardNumber = `****-****-****-${cleaned.slice(-4)}`;
    }

    if (masked.phone) {
      masked.phone = `****-***-${masked.phone.slice(-4)}`;
    }

    if (masked.email) {
      const [user, domain] = masked.email.split('@');
      masked.email = `${user.slice(0, 2)}***@${domain}`;
    }

    delete masked.cvv; // Never display CVV

    return masked;
  }

  // Generate payment token for secure processing
  static generatePaymentToken() {
    return encryptionManager.generateToken(32);
  }

  // Validate payment amount
  static validateAmount(amount, currency = 'USD') {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Monto inválido' };
    }

    if (numAmount > 1000) {
      return { valid: false, error: 'Monto excede el límite permitido' };
    }

    return { valid: true, error: null };
  }
}