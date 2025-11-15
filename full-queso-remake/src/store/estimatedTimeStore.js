import { create } from 'zustand'

const useEstimatedTimeStore = create((set, get) => ({
    // Tiempos base de preparación por categoría (en minutos)
    preparationTimes: {
        'tequeños': 8,
        'churros': 6,
        'pastelitos': 10,
        'bebidas': 1,
        'quesos': 2,
        'party-box': 15,
        'promos': 12
    },

    // Tiempo base de delivery (en minutos)
    baseDeliveryTime: 20,

    // Factor de complejidad por cantidad de items
    complexityFactor: 0.5,

    // Calcular tiempo de preparación dinámico
    calculatePreparationTime: (items) => {
        const { preparationTimes, complexityFactor } = get()
        
        let totalTime = 0
        let itemCount = 0

        items.forEach(item => {
            const baseTime = preparationTimes[item.category] || 5
            const quantity = item.quantity || 1
            
            // Tiempo base + tiempo adicional por cantidad
            totalTime += baseTime + (quantity - 1) * 2
            itemCount += quantity
        })

        // Agregar complejidad por múltiples items
        const complexityBonus = Math.floor(itemCount * complexityFactor)
        
        // Tiempo mínimo 5 minutos, máximo 45 minutos
        return Math.min(Math.max(totalTime + complexityBonus, 5), 45)
    },

    // Calcular tiempo de delivery dinámico
    calculateDeliveryTime: (items, distance = null) => {
        const { baseDeliveryTime } = get()
        
        // Tiempo base de delivery
        let deliveryTime = baseDeliveryTime

        // Ajustar por distancia si se proporciona (simulado)
        if (distance) {
            deliveryTime += Math.floor(distance * 2) // 2 min por km
        } else {
            // Tiempo aleatorio entre 15-30 min si no hay distancia
            deliveryTime = 15 + Math.floor(Math.random() * 15)
        }

        // Ajustar por volumen del pedido
        const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        if (totalItems > 10) {
            deliveryTime += 5 // 5 min extra para pedidos grandes
        }

        return Math.min(Math.max(deliveryTime, 10), 60)
    },

    // Obtener tiempo total estimado
    getTotalEstimatedTime: (items, distance = null) => {
        const { calculatePreparationTime, calculateDeliveryTime } = get()
        
        const prepTime = calculatePreparationTime(items)
        const deliveryTime = calculateDeliveryTime(items, distance)
        
        return {
            preparation: prepTime,
            delivery: deliveryTime,
            total: prepTime + deliveryTime
        }
    },

    // Formatear tiempo para mostrar
    formatTime: (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`
        } else {
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
        }
    },

    // Obtener rango de tiempo estimado (±5 min)
    getTimeRange: (minutes) => {
        const { formatTime } = get()
        const min = Math.max(minutes - 5, 5)
        const max = minutes + 5
        return `${formatTime(min)} - ${formatTime(max)}`
    }
}))

export default useEstimatedTimeStore