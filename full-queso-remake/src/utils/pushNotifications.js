// Push Notifications Service
class PushNotificationService {
    constructor() {
        this.registration = null
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    }

    async init() {
        if (!this.isSupported) {
            console.warn('Push notifications not supported')
            return false
        }

        // Service Worker deshabilitado para desarrollo
        // En producción, crear el archivo sw.js en public/
        console.log('Push notifications initialized (SW disabled for dev)')
        return true
    }

    async requestPermission() {
        if (!this.isSupported) return false

        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }

    // Simulate push notifications for demo
    simulateOrderNotification(orderStatus, orderId) {
        if (!this.isSupported) return

        const notifications = {
            confirmed: {
                title: '🍕 Pedido Confirmado',
                body: `Tu pedido #${orderId} ha sido confirmado y está siendo preparado.`,
                icon: '/icon-192x192.png'
            },
            preparing: {
                title: '👨‍🍳 Preparando tu Pedido',
                body: `Tu pedido #${orderId} está siendo preparado con amor.`,
                icon: '/icon-192x192.png'
            },
            ready: {
                title: '🚚 Pedido Listo',
                body: `Tu pedido #${orderId} está listo y en camino.`,
                icon: '/icon-192x192.png'
            },
            delivered: {
                title: '✅ Pedido Entregado',
                body: `Tu pedido #${orderId} ha sido entregado. ¡Disfrútalo!`,
                icon: '/icon-192x192.png'
            }
        }

        const notification = notifications[orderStatus]
        if (notification && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                tag: `order-${orderId}`,
                requireInteraction: false
            })
        }
    }

    // Simulate promotional notifications
    simulatePromoNotification(promoType) {
        if (!this.isSupported || Notification.permission !== 'granted') return

        const promos = {
            discount: {
                title: '🎉 ¡Oferta Especial!',
                body: '20% de descuento en tu próximo pedido. ¡Solo por hoy!',
                icon: '/icon-192x192.png'
            },
            newProduct: {
                title: '🆕 Nuevo Producto',
                body: 'Prueba nuestros nuevos churros de chocolate. ¡Te van a encantar!',
                icon: '/icon-192x192.png'
            },
            reminder: {
                title: '🛒 Carrito Abandonado',
                body: 'Tienes productos esperándote. ¡Completa tu pedido!',
                icon: '/icon-192x192.png'
            }
        }

        const notification = promos[promoType]
        if (notification) {
            new Notification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                tag: `promo-${promoType}`,
                requireInteraction: true
            })
        }
    }
}

export default new PushNotificationService()