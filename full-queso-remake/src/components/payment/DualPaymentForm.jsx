import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Zap } from 'lucide-react';
import { detectCardType, paymentProcessor } from '../../utils/paymentGateways';
import { useCartStore } from '../../store/cartStore';
import { useNotificationStore } from '../../store/notificationStore';

const DualPaymentForm = ({ orderData, onSuccess, onCancel }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [cardInfo, setCardInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { total } = useCartStore();
  const { addNotification } = useNotificationStore();

  // Detectar tipo de tarjeta en tiempo real
  useEffect(() => {
    if (cardData.number.length >= 6) {
      const info = detectCardType(cardData.number);
      setCardInfo(info);
    } else {
      setCardInfo(null);
    }
  }, [cardData.number]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Número de tarjeta inválido';
    }
    
    if (!cardData.expiry || cardData.expiry.length < 5) {
      newErrors.expiry = 'Fecha de vencimiento inválida';
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    
    if (!cardData.name.trim()) {
      newErrors.name = 'Nombre del titular requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      const paymentData = {
        cardNumber: cardData.number.replace(/\s/g, ''),
        expiryDate: cardData.expiry,
        cvv: cardData.cvv,
        cardholderName: cardData.name,
        amount: total,
        currency: 'USD',
        orderData
      };
      
      const result = await paymentProcessor.processPayment(paymentData);
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: `Pago procesado exitosamente con ${result.gateway === 'stripe' ? 'Stripe' : 'Venecard'}`
        });
        
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          onSuccess(result);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Error procesando pago: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getGatewayInfo = () => {
    if (!cardInfo) return null;
    
    if (cardInfo.gateway === 'stripe') {
      return {
        name: 'Stripe',
        icon: <Shield className="w-4 h-4" />,
        color: 'text-blue-600',
        description: 'Tarjeta internacional - Procesado por Stripe'
      };
    } else {
      return {
        name: 'Venecard',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-green-600',
        description: 'Tarjeta venezolana - Procesado por Venecard'
      };
    }
  };

  const gatewayInfo = getGatewayInfo();

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold">Pagar con Tarjeta</h3>
      </div>

      {gatewayInfo && (
        <div className={`flex items-center gap-2 p-3 rounded-lg bg-gray-50 mb-4 ${gatewayInfo.color}`}>
          {gatewayInfo.icon}
          <span className="text-sm font-medium">{gatewayInfo.description}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta
          </label>
          <input
            type="text"
            value={cardData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`w-full p-3 border rounded-lg ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
            maxLength="19"
          />
          {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vencimiento
            </label>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/AA"
              className={`w-full p-3 border rounded-lg ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
              maxLength="5"
            />
            {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              className={`w-full p-3 border rounded-lg ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
              maxLength="4"
            />
            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Titular
          </label>
          <input
            type="text"
            value={cardData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Juan Pérez"
            className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              `Pagar $${total.toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <Shield className="w-4 h-4 inline mr-1" />
        Tus datos están protegidos con encriptación de nivel bancario
      </div>
    </div>
  );
};

export default DualPaymentForm;