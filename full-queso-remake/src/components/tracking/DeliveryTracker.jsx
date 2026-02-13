import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Star,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import useGPSTrackingStore from '../../store/gpsTrackingStore';
import useNotificationStore from '../../store/notificationStore';

const DeliveryTracker = ({ orderId, onClose }) => {
  const {
    getDeliveryTracking,
    getUserLocation,
    trackingEnabled,
    toggleTracking,
    getStatusMessage,
    getStatusColor,
    calculateDistance
  } = useGPSTrackingStore();

  const { info } = useNotificationStore();
  const [tracking, setTracking] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const updateTracking = () => {
      const currentTracking = getDeliveryTracking(orderId);
      setTracking(currentTracking);
      setLastUpdate(new Date());
    };

    updateTracking();
    const interval = setInterval(updateTracking, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, [orderId, getDeliveryTracking]);

  useEffect(() => {
    // Solicitar ubicación del usuario al montar
    getUserLocation();
  }, [getUserLocation]);

  if (!tracking) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Tracking no disponible</h3>
          <p className="text-gray-600">No se encontró información de seguimiento para este pedido.</p>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(tracking.status);
  const statusMessage = getStatusMessage(tracking.status);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className={`bg-${statusColor}-500 text-white p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Pedido #{orderId.slice(-6)}</h3>
            <p className="text-sm opacity-90">{statusMessage}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
          >
            ×
          </button>
        </div>
      </div>

      {/* Información del repartidor */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
            {tracking.deliveryPerson.avatar}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{tracking.deliveryPerson.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{tracking.deliveryPerson.vehicle}</span>
              <div className="flex items-center">
                <Star size={12} className="text-yellow-400 mr-1" />
                <span>{tracking.deliveryPerson.rating}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => info('Llamar', `Llamando a ${tracking.deliveryPerson.name}...`)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
          >
            <Phone size={16} />
          </button>
        </div>
      </div>

      {/* Información de tiempo y distancia */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{tracking.eta}</div>
            <div className="text-sm text-gray-600">minutos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {tracking.distance ? tracking.distance.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-600">km restantes</div>
          </div>
        </div>
      </div>

      {/* Mapa simulado */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100"
            initial={{ height: 0 }}
            animate={{ height: 192 }}
            exit={{ height: 0 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Simulación de mapa */}
                <div className="absolute inset-0 bg-gray-200 rounded-lg m-4">
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    {/* Ruta simulada */}
                    <svg className="absolute inset-0 w-full h-full">
                      <path
                        d="M 20 140 Q 80 60 160 100 T 280 80"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    </svg>
                    
                    {/* Ubicación del repartidor */}
                    <motion.div
                      className="absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      style={{
                        left: `${Math.min(80, (Date.now() - new Date(tracking.startTime).getTime()) / (45 * 60 * 1000) * 100)}%`,
                        top: '60%'
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      🛵
                    </motion.div>
                    
                    {/* Ubicación del usuario */}
                    <div className="absolute right-4 bottom-4 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      🏠
                    </div>
                  </div>
                </div>
                
                {/* Controles del mapa */}
                <div className="absolute top-6 right-6 flex flex-col space-y-2">
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md"
                  >
                    {showMap ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => getUserLocation()}
                    className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-md"
                  >
                    <Navigation size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progreso de entrega */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progreso de entrega</span>
          <span className="text-xs text-gray-500">
            Actualizado: {lastUpdate.toLocaleTimeString('es-VE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`bg-${statusColor}-500 h-2 rounded-full`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, ((Date.now() - new Date(tracking.startTime).getTime()) / (45 * 60 * 1000)) * 100)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Estados de progreso */}
        <div className="flex justify-between mt-3 text-xs">
          <div className={`flex flex-col items-center ${tracking.status === 'preparing' ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
            <span>Preparando</span>
          </div>
          <div className={`flex flex-col items-center ${['on_way', 'nearby', 'arriving'].includes(tracking.status) ? 'text-blue-500' : 'text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
            <span>En camino</span>
          </div>
          <div className={`flex flex-col items-center ${tracking.status === 'nearby' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
            <span>Cerca</span>
          </div>
          <div className={`flex flex-col items-center ${tracking.status === 'delivered' ? 'text-green-500' : 'text-gray-400'}`}>
            <div className="w-2 h-2 rounded-full bg-current mb-1"></div>
            <span>Entregado</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="p-4 bg-gray-50 flex space-x-3">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium"
        >
          {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
        </button>
        <button
          onClick={() => info('Compartir', 'Enlace de seguimiento copiado al portapapeles')}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
        >
          Compartir
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryTracker;