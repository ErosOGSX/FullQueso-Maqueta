import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import { PaymentValidator, SecurePaymentHandler } from '../../utils/paymentValidation';
import { SecurityManager } from '../../utils/securityHeaders';
import useNotificationStore from '../../store/notificationStore';

const SecurePaymentForm = ({ onPaymentSubmit, onCancel, amount }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    phone: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardType, setCardType] = useState('');
  const { error: showError, success } = useNotificationStore();

  // Real-time validation
  useEffect(() => {
    const validateField = async (field, value) => {
      let validation = { valid: true, error: null };

      switch (field) {
        case 'cardNumber':
          validation = PaymentValidator.validateCardNumber(value);
          if (validation.valid) {
            setCardType(validation.type);
          }
          break;
        case 'cvv':
          validation = PaymentValidator.validateCVV(value, cardType);
          break;
        case 'phone':
          validation = PaymentValidator.validateVenezuelanPhone(value);
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          validation = {
            valid: emailRegex.test(value),
            error: emailRegex.test(value) ? null : 'Email inválido'
          };
          break;
      }

      setErrors(prev => ({
        ...prev,
        [field]: validation.error
      }));
    };

    // Validate changed fields with debounce
    const timeouts = {};
    Object.entries(formData).forEach(([field, value]) => {
      if (value) {
        clearTimeout(timeouts[field]);
        timeouts[field] = setTimeout(() => validateField(field, value), 500);
      }
    });

    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, [formData, cardType]);

  const handleInputChange = (field, value) => {
    // Sanitize input
    const sanitizedValue = SecurityManager.sanitizeInput(value);
    
    // Format specific fields
    let formattedValue = sanitizedValue;
    
    if (field === 'cardNumber') {
      // Remove non-digits and limit to 19 characters
      formattedValue = sanitizedValue.replace(/\D/g, '').slice(0, 19);
      // Add spacing for display
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'cvv') {
      formattedValue = sanitizedValue.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'expiryMonth') {
      formattedValue = sanitizedValue.replace(/\D/g, '').slice(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    } else if (field === 'expiryYear') {
      formattedValue = sanitizedValue.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'phone') {
      formattedValue = sanitizedValue.replace(/\D/g, '').slice(0, 11);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Comprehensive validation
      const validation = await PaymentValidator.validatePaymentData(formData);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        showError('Datos Inválidos', 'Por favor corrige los errores en el formulario');
        return;
      }

      // Validate amount
      const amountValidation = SecurePaymentHandler.validateAmount(amount);
      if (!amountValidation.valid) {
        showError('Monto Inválido', amountValidation.error);
        return;
      }

      // Generate payment token
      const paymentToken = SecurePaymentHandler.generatePaymentToken();
      
      // Encrypt sensitive data
      const encryptedData = await SecurePaymentHandler.encryptPaymentData(formData);
      
      // Prepare secure payment data
      const paymentData = {
        token: paymentToken,
        amount: parseFloat(amount),
        currency: 'USD',
        encryptedData,
        timestamp: new Date().toISOString(),
        fingerprint: navigator.userAgent
      };

      // Log security event
      SecurityManager.logSecurityEvent('payment_attempt', {
        amount,
        cardType,
        timestamp: paymentData.timestamp
      });

      // Submit payment
      await onPaymentSubmit(paymentData);
      
      success('Pago Procesado', 'Tu pago ha sido procesado exitosamente');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      showError('Error de Pago', 'Hubo un problema procesando tu pago. Intenta nuevamente.');
      
      SecurityManager.logSecurityEvent('payment_error', {
        error: error.message,
        amount
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardIcon = () => {
    const cardIcons = {
      visa: '💳',
      mastercard: '💳', 
      amex: '💳',
      discover: '💳',
      dinersclub: '💳',
      jcb: '💳',
      unionpay: '💳',
      maestro: '💳',
      elo: '💳',
      hipercard: '💳',
      banesco: '🏦', // Venezuelan banks
      mercantil: '🏦',
      provincial: '🏦',
      venezuela: '🏦',
      bicentenario: '🏦',
      tesoro: '🏦',
      exterior: '🏦',
      unknown: '💳'
    };
    return cardIcons[cardType] || '💳';
  };
  
  const getCardDisplayName = () => {
    const cardNames = {
      visa: 'Visa',
      mastercard: 'MasterCard',
      amex: 'American Express',
      discover: 'Discover',
      dinersclub: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay',
      maestro: 'Maestro',
      elo: 'Elo',
      hipercard: 'Hipercard',
      banesco: 'Banesco',
      mercantil: 'Mercantil',
      provincial: 'Provincial', 
      venezuela: 'Banco de Venezuela',
      bicentenario: 'Bicentenario',
      tesoro: 'Banco del Tesoro',
      exterior: 'Banco Exterior',
      unknown: 'Tarjeta'
    };
    return cardNames[cardType] || 'Tarjeta';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FiShield className="text-green-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Pago Seguro</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              maxLength="23"
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-1">
              <span className="text-xl">{getCardIcon()}</span>
              {cardType && cardType !== 'unknown' && (
                <span className="text-xs text-gray-500 font-medium">
                  {getCardDisplayName()}
                </span>
              )}
            </div>
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <input
              type="text"
              value={formData.expiryMonth}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              placeholder="MM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <input
              type="text"
              value={formData.expiryYear}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              placeholder="YYYY"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <div className="relative">
              <input
                type={showCvv ? 'text' : 'password'}
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                maxLength="4"
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute right-2 top-2.5 text-gray-400"
              >
                {showCvv ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.cvv && (
              <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
        {errors.expiry && (
          <p className="text-red-500 text-xs">{errors.expiry}</p>
        )}

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Titular
          </label>
          <input
            type="text"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="Juan Pérez"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="04141234567"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="juan@ejemplo.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 p-3 rounded-lg flex items-start gap-2">
          <FiShield className="text-green-600 mt-0.5" size={16} />
          <div className="text-sm text-green-700">
            <p className="font-medium">Pago 100% Seguro</p>
            <p>Tus datos están protegidos con encriptación de nivel bancario.</p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total a Pagar:</span>
            <span className="text-xl font-bold text-green-600">${amount}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <FiCreditCard size={16} />
                Pagar ${amount}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurePaymentForm;