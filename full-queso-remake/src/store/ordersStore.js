import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useLoyaltyStore from './loyaltyStore'
import useInventoryStore from './inventoryStore'
import useAnalyticsStore from './analyticsStore'
import useEstimatedTimeStore from './estimatedTimeStore'

const useOrdersStore = create(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (orderData) => {
                // Calcular tiempos estimados
                const estimatedTimeStore = useEstimatedTimeStore.getState()
                const timeEstimate = estimatedTimeStore.getTotalEstimatedTime(orderData.items)
                
                const now = new Date()
                const estimatedReady = new Date(now.getTime() + timeEstimate.preparation * 60000)
                const estimatedDelivery = new Date(now.getTime() + timeEstimate.total * 60000)
                
                const newOrder = {
                    id: Date.now().toString(),
                    date: now.toISOString(),
                    status: 'preparando', // preparando, listo, entregado
                    items: orderData.items,
                    total: orderData.total,
                    customerInfo: orderData.customerInfo,
                    service: orderData.service,
                    store: orderData.store,
                    estimatedTimes: {
                        preparation: timeEstimate.preparation,
                        delivery: timeEstimate.delivery,
                        total: timeEstimate.total,
                        estimatedReady: estimatedReady.toISOString(),
                        estimatedDelivery: estimatedDelivery.toISOString()
                    }
                };
                
                // Reducir inventario
                const inventoryStore = useInventoryStore.getState()
                orderData.items.forEach(item => {
                    inventoryStore.reduceStock(item.id, item.quantity)
                })
                
                // Otorgar puntos de fidelidad
                const loyaltyStore = useLoyaltyStore.getState()
                const categories = [...new Set(orderData.items.map(item => item.category))]
                const pointsEarned = loyaltyStore.addPoints(orderData.total, { categories })
                
                // Registrar analytics
                const analyticsStore = useAnalyticsStore.getState()
                analyticsStore.trackEvent('order_completed', {
                    total: orderData.total,
                    items: orderData.items,
                    categories
                })
                
                set((state) => ({
                    orders: [newOrder, ...state.orders]
                }));
                
                return { orderId: newOrder.id, pointsEarned };
            },

            updateOrderStatus: (orderId, status) => set((state) => ({
                orders: state.orders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                )
            })),

            getOrderById: (orderId) => {
                const { orders } = get();
                return orders.find(order => order.id === orderId);
            },

            clearOrders: () => set({ orders: [] }),

            getOrdersCount: () => {
                const { orders } = get();
                return orders.length;
            }
        }),
        {
            name: 'full-queso-orders',
            partialize: (state) => ({ orders: state.orders })
        }
    )
)

export default useOrdersStore