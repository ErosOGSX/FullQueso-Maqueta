import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Clock } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useOrdersStore } from '../store/ordersStore';
import { useNotificationStore } from '../store/notificationStore';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const { addOrder } = useOrdersStore();
  const { addNotification } = useNotificationStore();

  const sessionId = searchParams.get('session_id');
  const transactionId = searchParams.get('transaction_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Procesar el pago exitoso
    if (sessionId || transactionId) {
      const order = {
        id: orderId || `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'confirmed',
        paymentMethod: sessionId ? 'stripe' : 'venecard',
        transactionId: sessionId || transactionId,
        estimatedTime: 25
      };

      addOrder(order);
      clearCart();
      
      addNotification({
        type: 'success',
        message: '¡Pago procesado exitosamente! Tu pedido está confirmado.'
      });
    }
  }, [sessionId, transactionId, orderId, addOrder, clearCart, addNotification]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu pedido ha sido confirmado y está siendo preparado
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Número de pedido:</span>
            <span className="font-mono text-sm font-bold">
              {orderId || `ORD-${Date.now()}`}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">ID de transacción:</span>
            <span className="font-mono text-xs text-gray-500">
              {(sessionId || transactionId || 'N/A').substring(0, 20)}...
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Tiempo estimado: 20-30 minutos
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Ver mis pedidos
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Recibirás una notificación cuando tu pedido esté listo
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;