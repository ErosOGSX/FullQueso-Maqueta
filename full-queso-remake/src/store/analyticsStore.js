import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      metrics: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topProducts: {},
        categoryPerformance: {},
        hourlyStats: {},
        dailyStats: {},
        customerRetention: 0,
        conversionRate: 0
      },
      
      events: [],
      
      // Registrar evento
      trackEvent: (eventType, data) => {
        const event = {
          id: Date.now(),
          type: eventType,
          data,
          timestamp: new Date().toISOString(),
          sessionId: get().getSessionId()
        }
        
        set(state => ({
          events: [...state.events.slice(-999), event] // Mantener últimos 1000 eventos
        }))
        
        // Actualizar métricas según el evento
        get().updateMetrics(event)
      },
      
      // Obtener ID de sesión
      getSessionId: () => {
        let sessionId = sessionStorage.getItem('analytics-session')
        if (!sessionId) {
          sessionId = Math.random().toString(36).substr(2, 16)
          sessionStorage.setItem('analytics-session', sessionId)
        }
        return sessionId
      },
      
      // Actualizar métricas
      updateMetrics: (event) => {
        set(state => {
          const newMetrics = { ...state.metrics }
          
          switch (event.type) {
            case 'order_completed':
              newMetrics.totalOrders += 1
              newMetrics.totalRevenue += event.data.total
              newMetrics.averageOrderValue = newMetrics.totalRevenue / newMetrics.totalOrders
              
              // Actualizar productos más vendidos
              event.data.items.forEach(item => {
                newMetrics.topProducts[item.id] = (newMetrics.topProducts[item.id] || 0) + item.quantity
              })
              
              // Estadísticas por hora
              const hour = new Date().getHours()
              newMetrics.hourlyStats[hour] = (newMetrics.hourlyStats[hour] || 0) + 1
              
              // Estadísticas diarias
              const day = new Date().toDateString()
              newMetrics.dailyStats[day] = (newMetrics.dailyStats[day] || 0) + 1
              break
              
            case 'product_viewed':
              // Tracking de vistas de productos
              break
              
            case 'cart_abandoned':
              // Tracking de carritos abandonados
              break
          }
          
          return { metrics: newMetrics }
        })
      },
      
      // Obtener productos más vendidos
      getTopProducts: (limit = 10) => {
        const topProducts = get().metrics.topProducts
        return Object.entries(topProducts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit)
          .map(([productId, sales]) => ({ productId, sales }))
      },
      
      // Obtener estadísticas de ventas por hora
      getHourlyStats: () => {
        return get().metrics.hourlyStats
      },
      
      // Obtener estadísticas diarias
      getDailyStats: (days = 7) => {
        const dailyStats = get().metrics.dailyStats
        const last7Days = []
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateString = date.toDateString()
          last7Days.push({
            date: dateString,
            orders: dailyStats[dateString] || 0
          })
        }
        
        return last7Days
      },
      
      // Calcular tasa de conversión
      calculateConversionRate: () => {
        const events = get().events
        const sessions = new Set(events.map(e => e.sessionId)).size
        const orders = events.filter(e => e.type === 'order_completed').length
        
        return sessions > 0 ? ((orders / sessions) * 100).toFixed(2) : 0
      },
      
      // Obtener resumen de métricas
      getMetricsSummary: () => {
        const metrics = get().metrics
        const conversionRate = get().calculateConversionRate()
        
        return {
          ...metrics,
          conversionRate: parseFloat(conversionRate),
          topProducts: get().getTopProducts(5),
          recentStats: get().getDailyStats(7)
        }
      }
    }),
    {
      name: 'analytics-storage'
    }
  )
)

export default useAnalyticsStore