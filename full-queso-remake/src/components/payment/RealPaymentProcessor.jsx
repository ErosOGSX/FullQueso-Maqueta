import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building, DollarSign } from 'lucide-react';
import { getBankIcon } from './BankIcons';
import paymentService from '../../services/paymentService';
import useNotificationStore from '../../store/notificationStore';
import useCartStore from '../../store/cartStore';
import useOrdersStore from '../../store/ordersStore';

const RealPaymentProcessor = ({ orderData, onSuccess, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({});
  
  const { success, error } = useNotificationStore();
  const { clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Tarjeta Internacional',
      description: 'Visa, MasterCard, American Express',
      icon: CreditCard,
      currency: 'USD',
      fees: '3.5%'
    },
    {
      id: 'venecard',
      name: 'Tarjeta Nacional',
      description: 'Bancos venezolanos',
      icon: Building,
      currency: 'VES',
      fees: '2.5%'
    },
    {
      id: 'pago-movil',
      name: 'Pago Móvil',
      description: 'Transferencia desde tu banco',
      icon: Smartphone,
      currency: 'VES',
      fees: '1.0%'
    }
  ];

  const handlePaymentSubmit = async (formData) => {
    setIsProcessing(true);
    
    try {
      let result;
      
      switch (selectedMethod) {
        case 'stripe':
          // Crear sesión de Stripe
          const session = await paymentService.createStripeSession(orderData);
          if (!session.success) {
            throw new Error(session.error);
          }
          
          // Procesar pago
          result = await paymentService.processStripePayment(
            session.clientSecret,
            formData.paymentMethod
          );
          break;
          
        case 'venecard':
          result = await paymentService.processVenecardPayment(orderData, formData);
          break;
          
        case 'pago-movil':
          result = await paymentService.processPagoMovil(orderData, formData);
          break;
          
        default:
          throw new Error('Método de pago no válido');
      }

      if (result.success) {
        // Crear orden exitosa
        const newOrder = {
          ...orderData,
          id: `ORD-${Date.now()}`,
          status: 'confirmed',
          paymentMethod: selectedMethod,
          transactionId: result.transactionId,
          paymentDate: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString()
        };
        
        addOrder(newOrder);
        clearCart();
        
        success('¡Pago Exitoso!', `Tu pedido #${newOrder.id} ha sido confirmado`);
        onSuccess(newOrder);
        
      } else {
        throw new Error(result.error || 'Error procesando el pago');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      error('Error de Pago', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'stripe':
        return <StripePaymentForm onSubmit={handlePaymentSubmit} amount={orderData.total} />;
      case 'venecard':
        return <VenecardPaymentForm onSubmit={handlePaymentSubmit} amount={orderData.total} />;
      case 'pago-movil':
        return <PagoMovilForm onSubmit={handlePaymentSubmit} amount={orderData.total} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Procesar Pago</h2>
      
      {/* Resumen del pedido */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Resumen del Pedido</h3>
        <div className="space-y-1 text-sm">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 font-semibold flex justify-between">
            <span>Total:</span>
            <span>${orderData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Método de Pago</h3>
        <div className="grid gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <motion.button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon size={24} className="text-orange-500" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{method.currency}</div>
                    <div className="text-xs text-gray-500">Comisión: {method.fees}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Formulario de pago */}
      <div className="mb-6">
        {renderPaymentForm()}
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

// Componente para Stripe
const StripePaymentForm = ({ onSubmit, amount }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: ''
  });
  
  const [cardType, setCardType] = useState('');

  const detectInternationalCard = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) return 'amex';
    
    return 'unknown';
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setCardData({...cardData, number: formatted});
    setCardType(detectInternationalCard(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ paymentMethod: cardData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-orange-50 p-3 rounded-lg mb-4 flex items-center space-x-3">
        <div className="flex space-x-1">
          {getBankIcon('visa')}
          {getBankIcon('mastercard')}
          {getBankIcon('amex')}
        </div>
        <p className="text-sm text-orange-700">
          Acepta Visa, MasterCard y American Express
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Número de Tarjeta</label>
        <div className="relative">
          <input
            type="text"
            value={cardData.number}
            onChange={handleCardNumberChange}
            placeholder="4242 4242 4242 4242"
            className="w-full p-3 border rounded-lg pr-16"
            required
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {getBankIcon(cardType) || '💳'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mes</label>
          <input
            type="text"
            value={cardData.expMonth}
            onChange={(e) => setCardData({...cardData, expMonth: e.target.value})}
            placeholder="12"
            className="w-full p-3 border rounded-lg"
            maxLength="2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Año</label>
          <input
            type="text"
            value={cardData.expYear}
            onChange={(e) => setCardData({...cardData, expYear: e.target.value})}
            placeholder="2025"
            className="w-full p-3 border rounded-lg"
            maxLength="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVC</label>
          <input
            type="text"
            value={cardData.cvc}
            onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
            placeholder="123"
            className="w-full p-3 border rounded-lg"
            maxLength="4"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Titular</label>
        <input
          type="text"
          value={cardData.holderName}
          onChange={(e) => setCardData({...cardData, holderName: e.target.value})}
          placeholder="Juan Pérez"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
      >
        Pagar ${amount} USD
      </button>
    </form>
  );
};

// Componente para Venecard
const VenecardPaymentForm = ({ onSubmit, amount }) => {
  const [cardData, setCardData] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: ''
  });
  
  const [cardType, setCardType] = useState('');

  const detectVenezuelanBank = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Patrones de bancos venezolanos (primeros 6 dígitos)
    const bankPatterns = {
      banesco: ['601638', '627780', '589657'],
      mercantil: ['540711', '540712', '540713'],
      provincial: ['446517', '446518', '527023'],
      venezuela: ['484849', '484850', '527571'],
      bdt: ['627648', '627649'],
      tesoro: ['627770', '627771'],
      exterior: ['527572', '527573']
    };
    
    for (const [bank, patterns] of Object.entries(bankPatterns)) {
      if (patterns.some(pattern => cleanNumber.startsWith(pattern))) {
        return bank;
      }
    }
    
    return 'unknown';
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setCardData({...cardData, number: formatted});
    setCardType(detectVenezuelanBank(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center space-x-3">
        <div className="flex space-x-1">
          {getBankIcon('banesco')}
          {getBankIcon('mercantil')}
          {getBankIcon('provincial')}
          {getBankIcon('venezuela')}
          {getBankIcon('bdt')}
        </div>
        <p className="text-sm text-blue-700">
          Acepta tarjetas de todos los bancos venezolanos
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Número de Tarjeta</label>
        <div className="relative">
          <input
            type="text"
            value={cardData.number}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full p-3 border rounded-lg pr-16"
            required
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {getBankIcon(cardType) || '🏦'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mes</label>
          <input
            type="text"
            value={cardData.expMonth}
            onChange={(e) => setCardData({...cardData, expMonth: e.target.value})}
            placeholder="12"
            className="w-full p-3 border rounded-lg"
            maxLength="2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Año</label>
          <input
            type="text"
            value={cardData.expYear}
            onChange={(e) => setCardData({...cardData, expYear: e.target.value})}
            placeholder="2025"
            className="w-full p-3 border rounded-lg"
            maxLength="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVC</label>
          <input
            type="text"
            value={cardData.cvc}
            onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
            placeholder="123"
            className="w-full p-3 border rounded-lg"
            maxLength="3"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Titular</label>
        <input
          type="text"
          value={cardData.holderName}
          onChange={(e) => setCardData({...cardData, holderName: e.target.value})}
          placeholder="Juan Pérez"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
      >
        Pagar {(amount * 36).toFixed(2)} VES
      </button>
    </form>
  );
};

// Componente para Pago Móvil
const PagoMovilForm = ({ onSubmit, amount }) => {
  const [pagoData, setPagoData] = useState({
    phone: '',
    cedula: '',
    bank: '',
    reference: ''
  });

  const banks = [
    'Banesco', 'Mercantil', 'Provincial', 'Banco de Venezuela',
    'Bicentenario', 'Banco del Tesoro', 'Banco Exterior'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pagoData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-green-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-green-700">
          📱 Transfiere desde tu app bancaria y confirma el pago aquí
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          type="text"
          value={pagoData.phone}
          onChange={(e) => setPagoData({...pagoData, phone: e.target.value})}
          placeholder="04141234567"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Cédula</label>
        <input
          type="text"
          value={pagoData.cedula}
          onChange={(e) => setPagoData({...pagoData, cedula: e.target.value})}
          placeholder="12345678"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Banco</label>
        <select
          value={pagoData.bank}
          onChange={(e) => setPagoData({...pagoData, bank: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        >
          <option value="">Selecciona tu banco</option>
          {banks.map(bank => (
            <option key={bank} value={bank}>{bank}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Número de Referencia</label>
        <input
          type="text"
          value={pagoData.reference}
          onChange={(e) => setPagoData({...pagoData, reference: e.target.value})}
          placeholder="123456789"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
      >
        Confirmar Pago {(amount * 36).toFixed(2)} VES
      </button>
    </form>
  );
};

export default RealPaymentProcessor;