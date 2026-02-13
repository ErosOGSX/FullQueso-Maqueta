import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGPSTrackingStore = create(
  persist(
    (set, get) => ({
      // Estado del tracking
      activeDeliveries: {},
      userLocation: null,
      trackingEnabled: false,
      
      // Configuración
      updateInterval: 10000, // 10 segundos
      maxDistance: 50000, // 50km radio máximo
      
      // Datos del repartidor
      deliveryPersons: {
        'dp001': {
          id: 'dp001',
          name: 'Carlos Rodríguez',
          phone: '04141234567',
          vehicle: 'Moto Yamaha FZ',
          rating: 4.8,
          avatar: '🏍️'
        },
        'dp002': {
          id: 'dp002',
          name: 'María González',
          phone: '04161234567',
          vehicle: 'Bicicleta Eléctrica',
          rating: 4.9,
          avatar: '🚴‍♀️'
        }
      },

      // Inicializar tracking para un pedido
      startTracking: (orderId, deliveryPersonId) => {
        const deliveryPerson = get().deliveryPersons[deliveryPersonId];
        if (!deliveryPerson) return false;

        const tracking = {
          orderId,
          deliveryPersonId,
          deliveryPerson,
          status: 'preparing', // preparing, on_way, nearby, delivered
          startTime: new Date().toISOString(),
          estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          currentLocation: {
            lat: 10.4806, // Caracas centro
            lng: -66.9036,
            timestamp: new Date().toISOString()
          },
          route: [],
          distance: 0,
          eta: 45 // minutos
        };

        set((state) => ({
          activeDeliveries: {
            ...state.activeDeliveries,
            [orderId]: tracking
          }
        }));

        // Iniciar simulación de movimiento
        get().simulateDeliveryMovement(orderId);
        return true;
      },

      // Simular movimiento del repartidor
      simulateDeliveryMovement: (orderId) => {
        const { activeDeliveries, updateDeliveryLocation } = get();
        const delivery = activeDeliveries[orderId];
        
        if (!delivery) return;

        const interval = setInterval(() => {
          const currentDelivery = get().activeDeliveries[orderId];
          if (!currentDelivery || currentDelivery.status === 'delivered') {
            clearInterval(interval);
            return;
          }

          // Simular movimiento hacia el destino
          const progress = (Date.now() - new Date(currentDelivery.startTime).getTime()) / (45 * 60 * 1000);
          
          if (progress >= 1) {
            // Entregado
            updateDeliveryLocation(orderId, {
              lat: get().userLocation?.lat || 10.4906,
              lng: get().userLocation?.lng || -66.8936,
              status: 'delivered'
            });
            clearInterval(interval);
            return;
          }

          // Calcular nueva posición
          const startLat = 10.4806;
          const startLng = -66.9036;
          const endLat = get().userLocation?.lat || 10.4906;
          const endLng = get().userLocation?.lng || -66.8936;

          const newLat = startLat + (endLat - startLat) * progress;
          const newLng = startLng + (endLng - startLng) * progress;

          // Agregar variación aleatoria para simular movimiento real
          const variation = 0.001;
          const finalLat = newLat + (Math.random() - 0.5) * variation;
          const finalLng = newLng + (Math.random() - 0.5) * variation;

          // Determinar estado basado en progreso
          let status = 'on_way';
          if (progress > 0.8) status = 'nearby';
          if (progress > 0.95) status = 'arriving';

          updateDeliveryLocation(orderId, {
            lat: finalLat,
            lng: finalLng,
            status,
            eta: Math.max(1, Math.round(45 * (1 - progress)))
          });

        }, get().updateInterval);
      },

      // Actualizar ubicación del repartidor
      updateDeliveryLocation: (orderId, locationData) => {
        set((state) => {
          const delivery = state.activeDeliveries[orderId];
          if (!delivery) return state;

          const updatedDelivery = {
            ...delivery,
            currentLocation: {
              lat: locationData.lat,
              lng: locationData.lng,
              timestamp: new Date().toISOString()
            },
            status: locationData.status || delivery.status,
            eta: locationData.eta || delivery.eta,
            route: [...delivery.route, {
              lat: locationData.lat,
              lng: locationData.lng,
              timestamp: new Date().toISOString()
            }]
          };

          // Calcular distancia aproximada
          if (state.userLocation) {
            const distance = get().calculateDistance(
              locationData.lat,
              locationData.lng,
              state.userLocation.lat,
              state.userLocation.lng
            );
            updatedDelivery.distance = distance;
          }

          return {
            activeDeliveries: {
              ...state.activeDeliveries,
              [orderId]: updatedDelivery
            }
          };
        });
      },

      // Establecer ubicación del usuario
      setUserLocation: (location) => {
        set({ userLocation: location });
      },

      // Obtener ubicación del usuario
      getUserLocation: async () => {
        if (!navigator.geolocation) {
          console.error('Geolocation not supported');
          return false;
        }

        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutos
            });
          });

          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          get().setUserLocation(location);
          return location;
        } catch (error) {
          console.error('Error getting location:', error);
          return false;
        }
      },

      // Calcular distancia entre dos puntos
      calculateDistance: (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distancia en km
      },

      // Obtener tracking de un pedido
      getDeliveryTracking: (orderId) => {
        return get().activeDeliveries[orderId] || null;
      },

      // Finalizar tracking
      completeDelivery: (orderId) => {
        set((state) => {
          const { [orderId]: completed, ...remaining } = state.activeDeliveries;
          return { activeDeliveries: remaining };
        });
      },

      // Habilitar/deshabilitar tracking
      toggleTracking: () => {
        set((state) => ({ trackingEnabled: !state.trackingEnabled }));
      },

      // Estados de entrega con mensajes
      getStatusMessage: (status) => {
        const messages = {
          preparing: '👨‍🍳 Preparando tu pedido...',
          on_way: '🛵 En camino hacia ti',
          nearby: '📍 Muy cerca de tu ubicación',
          arriving: '🚪 Llegando a tu puerta',
          delivered: '✅ ¡Pedido entregado!'
        };
        return messages[status] || 'Estado desconocido';
      },

      // Obtener color del estado
      getStatusColor: (status) => {
        const colors = {
          preparing: 'orange',
          on_way: 'blue',
          nearby: 'yellow',
          arriving: 'green',
          delivered: 'green'
        };
        return colors[status] || 'gray';
      }
    }),
    {
      name: 'full-queso-gps-tracking',
      partialize: (state) => ({
        userLocation: state.userLocation,
        trackingEnabled: state.trackingEnabled
      })
    }
  )
);

export default useGPSTrackingStore;