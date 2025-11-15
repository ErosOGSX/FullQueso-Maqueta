import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

const usePersistentCartStore = create(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                // Estado del carrito
                items: [],
                savedForLater: [],
                lastUpdated: null,
                deviceId: null,
                
                // Configuración de checkout express
                expressCheckoutEnabled: false,
                defaultPaymentMethod: null,
                defaultAddress: null,
                
                // Recordatorios
                cartReminders: [],
                reminderSettings: {
                    enabled: true,
                    intervals: [30, 60, 1440] // 30min, 1h, 24h en minutos
                },

                // Inicializar dispositivo
                initializeDevice: () => {
                    const { deviceId } = get()
                    if (!deviceId) {
                        const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                        set({ deviceId: newDeviceId })
                    }
                },

                // Agregar producto
                addProduct: (product) => {
                    const { items } = get()
                    const existingItem = items.find(item => 
                        item.id === product.id && 
                        JSON.stringify(item.customOptions) === JSON.stringify(product.customOptions)
                    )

                    if (existingItem) {
                        set({
                            items: items.map(item =>
                                item.id === existingItem.id && 
                                JSON.stringify(item.customOptions) === JSON.stringify(existingItem.customOptions)
                                    ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                                    : item
                            ),
                            lastUpdated: Date.now()
                        })
                    } else {
                        set({
                            items: [...items, { ...product, quantity: product.quantity || 1 }],
                            lastUpdated: Date.now()
                        })
                    }
                    
                    get().scheduleReminders()
                },

                // Remover producto
                removeProduct: (productId) => {
                    set(state => ({
                        items: state.items.filter(item => item.id !== productId),
                        lastUpdated: Date.now()
                    }))
                },

                // Actualizar cantidad
                updateQuantity: (productId, quantity) => {
                    if (quantity <= 0) {
                        get().removeProduct(productId)
                        return
                    }
                    
                    set(state => ({
                        items: state.items.map(item =>
                            item.id === productId ? { ...item, quantity } : item
                        ),
                        lastUpdated: Date.now()
                    }))
                },

                // Limpiar carrito
                clearCart: () => {
                    set({ 
                        items: [], 
                        lastUpdated: Date.now(),
                        cartReminders: []
                    })
                },

                // Guardar para después
                saveForLater: (productId) => {
                    const { items, savedForLater } = get()
                    const item = items.find(i => i.id === productId)
                    if (item) {
                        set({
                            items: items.filter(i => i.id !== productId),
                            savedForLater: [...savedForLater, { ...item, savedAt: Date.now() }],
                            lastUpdated: Date.now()
                        })
                    }
                },

                // Mover de guardado a carrito
                moveToCart: (productId) => {
                    const { savedForLater, items } = get()
                    const item = savedForLater.find(i => i.id === productId)
                    if (item) {
                        const { savedAt, ...productData } = item
                        set({
                            savedForLater: savedForLater.filter(i => i.id !== productId),
                            items: [...items, productData],
                            lastUpdated: Date.now()
                        })
                    }
                },

                // Configurar checkout express
                setupExpressCheckout: (paymentMethod, address) => {
                    set({
                        expressCheckoutEnabled: true,
                        defaultPaymentMethod: paymentMethod,
                        defaultAddress: address
                    })
                },

                // Checkout express (1 click)
                expressCheckout: async () => {
                    const { items, defaultPaymentMethod, defaultAddress, expressCheckoutEnabled } = get()
                    
                    if (!expressCheckoutEnabled || !defaultPaymentMethod || !defaultAddress || items.length === 0) {
                        throw new Error('Express checkout no está configurado correctamente')
                    }

                    // Simular procesamiento de pago
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const orderId = `express_${Date.now()}`
                            get().clearCart()
                            resolve({ orderId, success: true })
                        }, 1000)
                    })
                },

                // Programar recordatorios
                scheduleReminders: () => {
                    const { items, reminderSettings, cartReminders } = get()
                    
                    if (!reminderSettings.enabled || items.length === 0) return

                    // Limpiar recordatorios existentes
                    cartReminders.forEach(reminder => {
                        if (reminder.timeoutId) {
                            clearTimeout(reminder.timeoutId)
                        }
                    })

                    // Programar recordatorios más cortos para desarrollo (30s, 60s, 120s)
                    const devIntervals = [0.5, 1, 2] // minutos
                    const newReminders = devIntervals.map(minutes => {
                        const timeoutId = setTimeout(() => {
                            get().triggerReminder(minutes)
                        }, minutes * 60 * 1000)

                        return {
                            id: `reminder_${minutes}`,
                            minutes,
                            timeoutId,
                            scheduledAt: Date.now()
                        }
                    })

                    set({ cartReminders: newReminders })
                },

                // Disparar recordatorio
                triggerReminder: (minutes) => {
                    const { items } = get()
                    if (items.length === 0) return

                    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
                    const message = `Tienes ${itemCount} productos en tu carrito. ¡No los olvides!`
                    
                    // Mostrar notificación del navegador
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Full Queso - Carrito Pendiente', {
                            body: message,
                            icon: '/favicon.ico',
                            tag: 'cart-reminder'
                        })
                    }
                    
                    // También disparar evento personalizado para la UI
                    window.dispatchEvent(new CustomEvent('cartReminder', {
                        detail: { message, minutes, itemCount }
                    }))
                },

                // Sincronizar con servidor (simulado)
                syncWithServer: async () => {
                    // Simulación deshabilitada para desarrollo
                    // En producción aquí iría la llamada real al API
                    return Promise.resolve()
                },

                // Obtener estadísticas del carrito
                getCartStats: () => {
                    const { items, savedForLater } = get()
                    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
                    const totalValue = items.reduce((sum, item) => {
                        const price = parseFloat(item.price.replace('$', ''))
                        return sum + (price * item.quantity)
                    }, 0)
                    
                    return {
                        totalItems,
                        totalValue,
                        savedItems: savedForLater.length,
                        isEmpty: items.length === 0
                    }
                }
            }),
            {
                name: 'persistent-cart-storage',
                version: 1
            }
        )
    )
)

export default usePersistentCartStore