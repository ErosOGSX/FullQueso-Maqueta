import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useEnhancedTimeStore = create(
    persist(
        (set, get) => ({
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
            
            // Historial de precisiones para machine learning
            accuracyHistory: [],
            
            // Factores externos
            externalFactors: {
                peakHours: [12, 13, 19, 20, 21], // Horas pico
                weekendMultiplier: 1.2, // 20% más tiempo en fines de semana
                weatherDelay: 0, // Minutos extra por clima
                activeOrders: 0 // Número de pedidos activos
            },

            // Calcular tiempo de preparación dinámico con factores externos
            calculatePreparationTime: (items) => {
                const { preparationTimes, complexityFactor, getMLAdjustment } = get()
                
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
                totalTime += complexityBonus
                
                // Aplicar factores externos
                totalTime = get().applyExternalFactors(totalTime, 'preparation')
                
                // Aplicar ajuste de machine learning
                totalTime += getMLAdjustment('preparation')
                
                // Tiempo mínimo 5 minutos, máximo 45 minutos
                return Math.min(Math.max(Math.round(totalTime), 5), 45)
            },

            // Calcular tiempo de delivery dinámico con factores externos
            calculateDeliveryTime: (items, distance = null) => {
                const { baseDeliveryTime, getMLAdjustment } = get()
                
                // Tiempo base de delivery
                let deliveryTime = baseDeliveryTime

                // Ajustar por distancia si se proporciona
                if (distance) {
                    deliveryTime += Math.floor(distance * 2) // 2 min por km
                } else {
                    // Tiempo simulado basado en zona (15-30 min)
                    deliveryTime = 15 + Math.floor(Math.random() * 15)
                }

                // Ajustar por volumen del pedido
                const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                if (totalItems > 10) {
                    deliveryTime += 5 // 5 min extra para pedidos grandes
                }
                
                // Aplicar factores externos
                deliveryTime = get().applyExternalFactors(deliveryTime, 'delivery')
                
                // Aplicar ajuste de machine learning
                deliveryTime += getMLAdjustment('delivery')

                return Math.min(Math.max(Math.round(deliveryTime), 10), 60)
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
            },
            
            // Aplicar factores externos (horario, día, clima, carga)
            applyExternalFactors: (baseTime, phase) => {
                const { externalFactors } = get()
                let adjustedTime = baseTime
                
                // Factor de hora pico
                const currentHour = new Date().getHours()
                if (externalFactors.peakHours.includes(currentHour)) {
                    adjustedTime *= 1.3 // 30% más tiempo en horas pico
                }
                
                // Factor de fin de semana
                const isWeekend = [0, 6].includes(new Date().getDay())
                if (isWeekend) {
                    adjustedTime *= externalFactors.weekendMultiplier
                }
                
                // Factor de clima (simulado)
                adjustedTime += externalFactors.weatherDelay
                
                // Factor de carga de trabajo
                const loadFactor = Math.min(externalFactors.activeOrders * 0.5, 10)
                adjustedTime += loadFactor
                
                return adjustedTime
            },
            
            // Machine Learning: Obtener ajuste basado en historial
            getMLAdjustment: (phase) => {
                const { accuracyHistory } = get()
                
                if (accuracyHistory.length < 5) return 0 // Necesita más datos
                
                // Calcular promedio de desviaciones recientes
                const recentHistory = accuracyHistory.slice(-10)
                const phaseHistory = recentHistory.filter(h => h.phase === phase)
                
                if (phaseHistory.length === 0) return 0
                
                const avgDeviation = phaseHistory.reduce((sum, h) => sum + h.deviation, 0) / phaseHistory.length
                
                // Aplicar solo el 50% del ajuste para evitar sobrecompensación
                return Math.round(avgDeviation * 0.5)
            },
            
            // Registrar precisión para machine learning
            recordAccuracy: (phase, estimated, actual) => {
                const deviation = actual - estimated
                const accuracy = Math.abs(deviation) / estimated
                
                set((state) => ({
                    accuracyHistory: [
                        ...state.accuracyHistory.slice(-49), // Mantener últimos 50 registros
                        {
                            phase,
                            estimated,
                            actual,
                            deviation,
                            accuracy,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }))
            },
            
            // Actualizar factores externos
            updateExternalFactors: (factors) => {
                set((state) => ({
                    externalFactors: { ...state.externalFactors, ...factors }
                }))
            },
            
            // Obtener estadísticas de precisión
            getAccuracyStats: () => {
                const { accuracyHistory } = get()
                
                if (accuracyHistory.length === 0) {
                    return { avgAccuracy: 0, totalPredictions: 0, improvementTrend: 0 }
                }
                
                const avgAccuracy = accuracyHistory.reduce((sum, h) => sum + (1 - h.accuracy), 0) / accuracyHistory.length
                const recent = accuracyHistory.slice(-10)
                const older = accuracyHistory.slice(-20, -10)
                
                let improvementTrend = 0
                if (older.length > 0) {
                    const recentAvg = recent.reduce((sum, h) => sum + (1 - h.accuracy), 0) / recent.length
                    const olderAvg = older.reduce((sum, h) => sum + (1 - h.accuracy), 0) / older.length
                    improvementTrend = recentAvg - olderAvg
                }
                
                return {
                    avgAccuracy: Math.round(avgAccuracy * 100),
                    totalPredictions: accuracyHistory.length,
                    improvementTrend: Math.round(improvementTrend * 100)
                }
            },

            // Notificaciones proactivas
            scheduleProactiveNotifications: (orderId, estimatedTimes) => {
                const notifications = []
                
                // Notificación 5 min antes de estar listo
                const readyNotificationTime = (estimatedTimes.preparation - 5) * 60 * 1000
                if (readyNotificationTime > 0) {
                    setTimeout(() => {
                        if ('Notification' in window) {
                            new Notification('¡Casi listo!', {
                                body: `Tu pedido #${orderId.slice(-4)} estará listo en 5 minutos`,
                                icon: '/logo.svg'
                            })
                        }
                    }, readyNotificationTime)
                }
                
                // Notificación cuando sale para delivery
                const deliveryStartTime = estimatedTimes.preparation * 60 * 1000
                setTimeout(() => {
                    if ('Notification' in window) {
                        new Notification('¡En camino!', {
                            body: `Tu pedido #${orderId.slice(-4)} ya salió para entrega`,
                            icon: '/logo.svg'
                        })
                    }
                }, deliveryStartTime)
                
                return notifications
            },

            // Gamificación - calcular puntos por precisión
            calculatePrecisionPoints: (estimated, actual) => {
                const deviation = Math.abs(actual - estimated)
                const accuracy = 1 - (deviation / estimated)
                
                if (accuracy >= 0.95) return 10 // Muy preciso
                if (accuracy >= 0.85) return 7  // Preciso
                if (accuracy >= 0.75) return 5  // Aceptable
                if (accuracy >= 0.65) return 3  // Regular
                return 1 // Participación
            }
        }),
        {
            name: 'full-queso-enhanced-time',
            partialize: (state) => ({
                accuracyHistory: state.accuracyHistory,
                externalFactors: state.externalFactors
            })
        }
    )
)

export default useEnhancedTimeStore