import React, { useEffect, useState } from 'react';
import { FiClock, FiTruck, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useNotificationStore from '../../store/notificationStore';

const OrderProgressCard = ({ order }) => {
  const { addProduct } = useCartStore();
  const { success } = useNotificationStore();
  
  // Ensure order has required structure
  if (!order || !order.progress) {
    return null;
  }

  const getProgressPercentage = (phase) => {
    if (!order.progress || !order.progress[phase]) return 0;
    if (order.progress[phase]?.completed || (phase === 'delivery' && order.phase === 'completed')) return 100;
    const current = order.progress[phase].current || 0;
    const total = order.progress[phase].total || 1;
    return Math.min((current / total) * 100, 100);
  };

  const getPhaseColor = (phase, isActive) => {
    if (order.progress[phase]?.completed || (phase === 'delivery' && order.phase === 'completed')) return 'text-green-600';
    if (isActive) return phase === 'preparation' ? 'text-orange-600' : 'text-purple-600';
    return 'text-gray-400';
  };

  const getProgressBarColor = (phase, isActive) => {
    if (order.progress[phase]?.completed || (phase === 'delivery' && order.phase === 'completed')) return 'bg-green-500';
    if (isActive) return phase === 'preparation' ? 'bg-orange-500' : 'bg-purple-500';
    return 'bg-gray-300';
  };

  const formatTime = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = (phase) => {
    if (!order.progress || !order.progress[phase]) return 'Calculando...';
    if (order.progress[phase].completed || (phase === 'delivery' && order.phase === 'completed')) return '¡Completado!';
    const current = order.progress[phase].current || 0;
    const total = order.progress[phase].total || 0;
    const remaining = total - current;
    
    // Si es delivery y el progreso está al 100%, marcar como completado
    if (phase === 'delivery' && current >= total) {
      return '¡Entregado!';
    }
    
    return remaining > 0 ? `${Math.ceil(remaining)} min restantes` : 'Finalizando...';
  };
  
  const reorderItems = () => {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addProduct(item);
      }
    });
    success('Productos Agregados', `${order.items.length} productos agregados al carrito`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display-alt text-lg text-brand-dark">
            Pedido #{order.id.slice(-4)}
          </h3>
          <p className="font-body text-sm text-neutral-text-muted">
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body font-bold text-brand-primary">${order.total.toFixed(2)}</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-body font-bold ${
            order.status === 'entregado' 
              ? 'bg-green-100 text-green-800'
              : order.status === 'en_camino'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {order.status === 'preparando' ? 'Preparando' : 
             order.status === 'en_camino' ? 'En Camino' : 'Entregado'}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        {/* Preparation Phase */}
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            order.progress.preparation?.completed 
              ? 'bg-green-500 text-white' 
              : order.phase === 'preparation'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {order.progress.preparation?.completed ? (
              <FiCheck size={16} />
            ) : (
              <FiClock size={16} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-body font-medium ${getPhaseColor('preparation', order.phase === 'preparation')}`}>
                Preparación
              </span>
              <span className="font-body text-xs text-neutral-text-muted">
                {order.progress.preparation?.completed 
                  ? '¡Completado!' 
                  : order.phase === 'preparation' 
                  ? getRemainingTime('preparation')
                  : `${order.progress.preparation?.total || 0} min`
                }
              </span>
            </div>
            
            <AnimatePresence>
              {(order.phase === 'preparation' || order.progress.preparation?.completed) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-gray-200 rounded-full h-2"
                >
                  <motion.div
                    className={`h-2 rounded-full ${getProgressBarColor('preparation', order.phase === 'preparation')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage('preparation')}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Delivery Phase */}
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            order.progress.delivery?.completed || order.phase === 'completed'
              ? 'bg-green-500 text-white' 
              : order.phase === 'delivery'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-300 text-gray-600'
          }`}>
            {order.progress.delivery?.completed || order.phase === 'completed' ? (
              <FiCheck size={16} />
            ) : (
              <FiTruck size={16} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-body font-medium ${getPhaseColor('delivery', order.phase === 'delivery')}`}>
                Delivery
              </span>
              <span className="font-body text-xs text-neutral-text-muted">
                {order.progress.delivery?.completed || order.phase === 'completed' || getProgressPercentage('delivery') >= 100
                  ? '¡Entregado!' 
                  : order.phase === 'delivery' 
                  ? getRemainingTime('delivery')
                  : `${order.progress.delivery?.total || 0} min`
                }
              </span>
            </div>
            
            <AnimatePresence>
              {(order.phase === 'delivery' || order.progress.delivery?.completed) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-gray-200 rounded-full h-2"
                >
                  <motion.div
                    className={`h-2 rounded-full ${getProgressBarColor('delivery', order.phase === 'delivery')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage('delivery')}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="font-body text-sm text-neutral-text-muted mb-2">
          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}:
        </p>
        <div className="flex flex-wrap gap-2">
          {order.items.slice(0, 3).map((item, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-body">
              {item.quantity}x {item.name}
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-gray-500 text-xs font-body">
              +{order.items.length - 3} más
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-right">
          <p className="font-body font-bold text-lg text-brand-primary">${order.total.toFixed(2)}</p>
        </div>
        <button
          onClick={reorderItems}
          className="bg-brand-primary text-white font-body font-bold py-2 px-4 rounded-lg hover:bg-brand-primary-light transition-colors text-sm flex items-center gap-2"
        >
          <FiRefreshCw size={16} />
          Reordenar
        </button>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {order.phase === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <FiCheck className="text-green-600" size={16} />
              <span className="font-body font-medium text-green-800">
                ¡Pedido entregado exitosamente!
              </span>
            </div>
            <p className="font-body text-sm text-green-700 mt-1">
              Gracias por elegir Full Queso. ¡Esperamos que disfrutes tu pedido!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderProgressCard;