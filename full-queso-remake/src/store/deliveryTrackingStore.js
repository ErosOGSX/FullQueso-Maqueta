import { create } from 'zustand'

const useDeliveryTrackingStore = create((set, get) => ({
  activeDeliveries: {},
  
  // Iniciar tracking de delivery
  startTracking: (orderId) => {
    const delivery = {
      orderId,
      status: 'preparing',
      estimatedTime: 30,
      currentLocation: { lat: 10.4806, lng: -66.9036 }, // Caracas centro
      driverName: 'Carlos Rodríguez',
      driverPhone: '+58 412-1234567',
      startTime: new Date().toISOString(),
      route: [
        { lat: 10.4806, lng: -66.9036, time: 0 },
        { lat: 10.4820, lng: -66.9050, time: 5 },
        { lat: 10.4835, lng: -66.9065, time: 10 },
        { lat: 10.4850, lng: -66.9080, time: 15 }
      ]
    }
    
    set(state => ({
      activeDeliveries: {
        ...state.activeDeliveries,
        [orderId]: delivery
      }
    }))
    
    // Simular movimiento del repartidor
    get().simulateDelivery(orderId)
  },
  
  // Simular progreso del delivery
  simulateDelivery: (orderId) => {
    const intervals = [
      { status: 'preparing', time: 5000 },
      { status: 'on-way', time: 10000 },
      { status: 'nearby', time: 15000 },
      { status: 'delivered', time: 20000 }
    ]
    
    intervals.forEach(({ status, time }) => {
      setTimeout(() => {
        set(state => {
          const delivery = state.activeDeliveries[orderId]
          if (delivery) {
            return {
              activeDeliveries: {
                ...state.activeDeliveries,
                [orderId]: {
                  ...delivery,
                  status,
                  estimatedTime: Math.max(0, delivery.estimatedTime - 5)
                }
              }
            }
          }
          return state
        })
      }, time)
    })
  },
  
  // Obtener delivery activo
  getDelivery: (orderId) => {
    return get().activeDeliveries[orderId]
  },
  
  // Actualizar ubicación del repartidor
  updateDriverLocation: (orderId, location) => {
    set(state => {
      const delivery = state.activeDeliveries[orderId]
      if (delivery) {
        return {
          activeDeliveries: {
            ...state.activeDeliveries,
            [orderId]: {
              ...delivery,
              currentLocation: location
            }
          }
        }
      }
      return state
    })
  }
}))

export default useDeliveryTrackingStore