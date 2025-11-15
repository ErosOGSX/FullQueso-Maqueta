import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const LOYALTY_LEVELS = {
  bronze: { name: 'Bronce', minPoints: 0, multiplier: 1.0, color: '#CD7F32' },
  silver: { name: 'Plata', minPoints: 500, multiplier: 1.25, color: '#C0C0C0' },
  gold: { name: 'Oro', minPoints: 1500, multiplier: 1.5, color: '#FFD700' }
}

const REWARDS = [
  { id: 'discount-5', name: '$5 de Descuento', points: 500, type: 'discount', value: 5, description: 'Compra mínima $10' },
  { id: 'discount-10', name: '$10 de Descuento', points: 1000, type: 'discount', value: 10, description: 'Compra mínima $20' },
  { id: 'free-delivery', name: 'Delivery Gratis', points: 250, type: 'delivery', value: 2.5 },
  { id: 'free-tequeño', name: 'Tequeño Gratis', points: 150, type: 'product', value: 'tequeño' },
  { id: 'free-drink', name: 'Bebida Gratis', points: 200, type: 'product', value: 'bebida' },
  { id: 'vip-combo', name: 'Combo VIP Exclusivo', points: 2000, type: 'vip', value: 'combo', levelRequired: 'gold' },
  { id: 'birthday-special', name: 'Especial Cumpleaños', points: 0, type: 'birthday', value: 15 }
]

const ACHIEVEMENTS = [
  { id: 'first-order', name: 'Primera Compra', description: 'Realizaste tu primer pedido', icon: '🎉', points: 50 },
  { id: 'frequent-customer', name: 'Cliente Frecuente', description: '10 pedidos completados', icon: '⭐', points: 200 },
  { id: 'menu-explorer', name: 'Explorador del Menú', description: 'Probaste 5 categorías diferentes', icon: '🗺️', points: 150 },
  { id: 'weekend-warrior', name: 'Guerrero de Fin de Semana', description: '5 pedidos en fin de semana', icon: '🏆', points: 100 },
  { id: 'big-spender', name: 'Gran Comprador', description: 'Pedido de más de $50', icon: '💎', points: 300 },
  { id: 'loyalty-master', name: 'Maestro de la Fidelidad', description: 'Alcanzaste nivel Oro', icon: '👑', points: 500 }
]

const CHALLENGES = [
  { id: 'try-3-categories', name: 'Explorador Semanal', description: 'Prueba 3 categorías diferentes esta semana', reward: 100, expires: 7 },
  { id: 'weekend-orders', name: 'Fin de Semana Activo', description: 'Haz 2 pedidos este fin de semana', reward: 150, expires: 2 },
  { id: 'new-product', name: 'Aventurero Culinario', description: 'Prueba un producto que nunca hayas pedido', reward: 75, expires: 14 }
]

const useLoyaltyStore = create(
  persist(
    (set, get) => ({
      points: 0,
      totalSpent: 0,
      level: 'bronze',
      redeemedRewards: [],
      achievements: [],
      activeChallenges: [],
      orderHistory: [],
      joinDate: new Date().toISOString(),
      lastOrderDate: null,
      consecutiveOrders: 0,
      categoriesTried: [],
      
      // Calcular puntos por compra con bonificaciones
      addPoints: (orderTotal, orderData = {}) => {
        const basePoints = Math.floor(orderTotal * 10) // 10 puntos por $1
        const currentLevel = get().level
        let multiplier = LOYALTY_LEVELS[currentLevel].multiplier
        
        // Bonificaciones por tiempo
        const now = new Date()
        const isWeekend = now.getDay() === 0 || now.getDay() === 6
        const isHappyHour = now.getHours() >= 15 && now.getHours() <= 18
        const isBirthday = get().isBirthday()
        
        if (isWeekend) multiplier *= 1.5 // 50% más puntos en fin de semana
        if (isHappyHour) multiplier *= 1.2 // 20% más en happy hour
        if (isBirthday) multiplier *= 2.0 // Doble puntos en cumpleaños
        
        const finalPoints = Math.floor(basePoints * multiplier)
        
        set(state => {
          const newPoints = state.points + finalPoints
          const newTotalSpent = state.totalSpent + orderTotal
          const newLevel = calculateLevel(newPoints)
          
          // Actualizar historial y racha
          const today = new Date().toDateString()
          const lastOrderDay = state.lastOrderDate ? new Date(state.lastOrderDate).toDateString() : null
          const isConsecutive = lastOrderDay && 
            Math.abs(new Date(today).getTime() - new Date(lastOrderDay).getTime()) <= 86400000 // 24 horas
          
          return {
            points: newPoints,
            totalSpent: newTotalSpent,
            level: newLevel,
            lastOrderDate: new Date().toISOString(),
            consecutiveOrders: isConsecutive ? state.consecutiveOrders + 1 : 1,
            orderHistory: [...state.orderHistory, {
              date: new Date().toISOString(),
              total: orderTotal,
              points: finalPoints,
              categories: orderData.categories || []
            }]
          }
        })
        
        // Verificar logros y desafíos
        get().checkAchievements(orderTotal, orderData)
        get().updateChallenges(orderData)
        
        return finalPoints
      },
      
      // Canjear recompensa
      redeemReward: (rewardId) => {
        const reward = REWARDS.find(r => r.id === rewardId)
        if (!reward) return false
        
        const currentPoints = get().points
        if (currentPoints < reward.points) return false
        
        // Generar código único para descuentos
        let code = null
        if (reward.type === 'discount') {
          code = `FQ${reward.value}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        }
        
        set(state => ({
          points: state.points - reward.points,
          redeemedRewards: [...state.redeemedRewards, {
            ...reward,
            code,
            redeemedAt: new Date().toISOString(),
            used: false
          }]
        }))
        
        return { success: true, code }
      },
      
      // Usar recompensa canjeada
      useReward: (rewardId) => {
        set(state => ({
          redeemedRewards: state.redeemedRewards.map(reward =>
            reward.id === rewardId ? { ...reward, used: true } : reward
          )
        }))
      },
      
      // Obtener recompensas disponibles
      getAvailableRewards: () => {
        const currentPoints = get().points
        return REWARDS.filter(reward => currentPoints >= reward.points)
      },
      
      // Obtener recompensas no usadas
      getUnusedRewards: () => {
        return get().redeemedRewards.filter(reward => !reward.used)
      },
      
      // Obtener información del nivel actual
      getLevelInfo: () => {
        const currentLevel = get().level
        const currentPoints = get().points
        const levelInfo = LOYALTY_LEVELS[currentLevel]
        
        // Calcular progreso al siguiente nivel
        const levels = Object.keys(LOYALTY_LEVELS)
        const currentIndex = levels.indexOf(currentLevel)
        const nextLevel = levels[currentIndex + 1]
        
        let progress = 100
        let pointsToNext = 0
        
        if (nextLevel) {
          const nextLevelPoints = LOYALTY_LEVELS[nextLevel].minPoints
          const currentLevelPoints = levelInfo.minPoints
          progress = ((currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
          pointsToNext = nextLevelPoints - currentPoints
        }
        
        return {
          ...levelInfo,
          progress: Math.min(progress, 100),
          pointsToNext,
          nextLevel: nextLevel ? LOYALTY_LEVELS[nextLevel] : null
        }
      },
      
      // Verificar si es cumpleaños
      isBirthday: () => {
        // Simulación - en producción usar fecha real del usuario
        const today = new Date()
        return today.getDate() === 15 && today.getMonth() === 11 // 15 de diciembre como ejemplo
      },
      
      // Verificar logros
      checkAchievements: (orderTotal, orderData) => {
        const state = get()
        const newAchievements = []
        
        // Primera compra
        if (state.orderHistory.length === 0 && !state.achievements.includes('first-order')) {
          newAchievements.push('first-order')
        }
        
        // Cliente frecuente (10 pedidos)
        if (state.orderHistory.length >= 9 && !state.achievements.includes('frequent-customer')) {
          newAchievements.push('frequent-customer')
        }
        
        // Gran comprador
        if (orderTotal > 50 && !state.achievements.includes('big-spender')) {
          newAchievements.push('big-spender')
        }
        
        // Maestro de fidelidad (nivel oro)
        if (state.level === 'gold' && !state.achievements.includes('loyalty-master')) {
          newAchievements.push('loyalty-master')
        }
        
        if (newAchievements.length > 0) {
          set(prevState => ({
            achievements: [...prevState.achievements, ...newAchievements],
            points: prevState.points + newAchievements.reduce((sum, id) => {
              const achievement = ACHIEVEMENTS.find(a => a.id === id)
              return sum + (achievement?.points || 0)
            }, 0)
          }))
        }
      },
      
      // Actualizar desafíos
      updateChallenges: (orderData) => {
        // Lógica para verificar progreso de desafíos
        // Implementación simplificada
      },
      
      // Obtener estadísticas
      getStats: () => {
        const state = get()
        return {
          totalOrders: state.orderHistory.length,
          averageOrder: state.orderHistory.length > 0 
            ? state.totalSpent / state.orderHistory.length 
            : 0,
          favoriteCategories: state.categoriesTried,
          consecutiveOrders: state.consecutiveOrders,
          daysAsCustomer: Math.floor(
            (new Date() - new Date(state.joinDate)) / (1000 * 60 * 60 * 24)
          )
        }
      }
    }),
    {
      name: 'loyalty-storage'
    }
  )
)

// Función auxiliar para calcular nivel
const calculateLevel = (points) => {
  if (points >= LOYALTY_LEVELS.gold.minPoints) return 'gold'
  if (points >= LOYALTY_LEVELS.silver.minPoints) return 'silver'
  return 'bronze'
}

export default useLoyaltyStore
export { LOYALTY_LEVELS, REWARDS, ACHIEVEMENTS, CHALLENGES }