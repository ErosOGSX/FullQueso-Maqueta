import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const { addNotification } = useNotificationStore();

  const transactionId = searchParams.get('transaction_id');
  const orderId = searchParams.get('order_id');
  const paymentStatus = searchParams.get('status');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Simular verificación del pago con Venecard
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (paymentStatus === 'success' || paymentStatus === 'approved') {
          setStatus('success');
          
          // Redirigir a página de éxito después de 2 segundos
          setTimeout(() => {
            navigate(`/payment-success?transaction_id=${transactionId}&order_id=${orderId}`);
          }, 2000);
        } else {
          setStatus('failed');
          
          addNotification({
            type: 'error',
            message: 'El pago no pudo ser procesado. Intenta nuevamente.'
          });
          
          // Redirigir al carrito después de 3 segundos
          setTimeout(() => {
            navigate('/cart');
          }, 3000);
        }
      } catch (error) {
        setStatus('failed');
        addNotification({
          type: 'error',
          message: 'Error verificando el pago. Contacta soporte si el problema persiste.'
        });
        
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      }
    };

    if (transactionId && orderId) {
      processCallback();
    } else {
      setStatus('failed');
      setTimeout(() => navigate('/cart'), 2000);
    }
  }, [transactionId, orderId, paymentStatus, navigate, addNotification]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verificando Pago
            </h1>
            <p className="text-gray-600">
              Estamos confirmando tu transacción con Venecard...
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Confirmado!
            </h1>
            <p className="text-gray-600">
              Redirigiendo a la confirmación del pedido...
            </p>
          </>
        );
      
      case 'failed':
        return (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pago No Procesado
            </h1>
            <p className="text-gray-600">
              Hubo un problema con tu pago. Redirigiendo al carrito...
            </p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {renderContent()}
        
        {transactionId && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              ID de transacción: {transactionId.substring(0, 20)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;