import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Global timer storage outside of Zustand
const activeTimers = new Map();

const useOrdersStore = create(
    persist(
        (set, get) => ({
            orders: [],

            addOrder: (orderData) => {
                // Usar sistema de tiempo mejorado si está disponible
                let timeEstimate;
                try {
                    const enhancedTimeStore = require('./enhancedTimeStore').default;
                    timeEstimate = enhancedTimeStore.getState().getTotalEstimatedTime(orderData.items);
                } catch (error) {
                    // Fallback a cálculo básico
                    const basePreparationTime = 15;
                    const baseDeliveryTime = 20;
                    const itemsCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
                    const additionalTime = Math.floor(itemsCount / 5) * 2;
                    
                    timeEstimate = {
                        preparation: basePreparationTime + additionalTime,
                        delivery: baseDeliveryTime,
                        total: basePreparationTime + additionalTime + baseDeliveryTime
                    };
                }
                
                const now = new Date()
                const estimatedReady = new Date(now.getTime() + timeEstimate.preparation * 60000)
                const estimatedDelivery = new Date(now.getTime() + timeEstimate.total * 60000)
                
                const newOrder = {
                    id: Date.now().toString(),
                    date: now.toISOString(),
                    status: 'preparando',
                    phase: 'preparation', // preparation, delivery, completed
                    items: orderData.items,
                    total: orderData.total,
                    customerInfo: orderData.customerInfo,
                    service: orderData.service,
                    store: orderData.store,
                    progress: {
                        preparation: { current: 0, total: timeEstimate.preparation, completed: false },
                        delivery: { current: 0, total: timeEstimate.delivery, completed: false }
                    },
                    estimatedTimes: {
                        preparation: timeEstimate.preparation,
                        delivery: timeEstimate.delivery,
                        total: timeEstimate.total,
                        estimatedReady: estimatedReady.toISOString(),
                        estimatedDelivery: estimatedDelivery.toISOString(),
                        startTime: now.toISOString()
                    }
                };
                
                // Start progress timer for this order
                get().startOrderTimer(newOrder.id);
                
                // Schedule proactive notifications
                try {
                    const enhancedTimeStore = require('./enhancedTimeStore').default;
                    enhancedTimeStore.getState().scheduleProactiveNotifications(newOrder.id, timeEstimate);
                } catch (error) {
                    console.warn('Could not schedule notifications:', error);
                }
                
                // Simular reducción de inventario y puntos (se manejará desde el componente)
                let pointsEarned = Math.floor(orderData.total); // 1 punto por dólar
                
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
            
            updateOrderProgress: (orderId, phase, progress) => set((state) => ({
                orders: state.orders.map(order =>
                    order.id === orderId 
                        ? { 
                            ...order, 
                            progress: {
                                ...order.progress,
                                [phase]: { ...order.progress[phase], current: progress }
                            }
                        } 
                        : order
                )
            })),
            
            completeOrderPhase: (orderId, phase) => {
                set((state) => ({
                    orders: state.orders.map(order => {
                        if (order.id === orderId) {
                            const updatedOrder = {
                                ...order,
                                progress: {
                                    ...order.progress,
                                    [phase]: { ...order.progress[phase], completed: true, current: order.progress[phase].total }
                                }
                            };
                            
                            // Update phase and status
                            if (phase === 'preparation') {
                                updatedOrder.phase = 'delivery';
                                updatedOrder.status = 'en_camino';
                            } else if (phase === 'delivery') {
                                updatedOrder.phase = 'completed';
                                updatedOrder.status = 'entregado';
                                
                                // Send delivery notification
                                if (typeof window !== 'undefined' && 'Notification' in window) {
                                    new Notification('¡Pedido Entregado!', {
                                        body: `Tu pedido #${orderId.slice(-4)} ha sido entregado exitosamente.`,
                                        icon: '/logo.svg'
                                    });
                                }
                            }
                            
                            return updatedOrder;
                        }
                        return order;
                    })
                }));
            },
            
            startOrderTimer: (orderId) => {
                // Clear existing timer if any
                if (activeTimers.has(orderId)) {
                    clearInterval(activeTimers.get(orderId));
                }
                
                const timer = setInterval(() => {
                    const order = get().getOrderById(orderId);
                    if (!order || order.phase === 'completed') {
                        clearInterval(timer);
                        activeTimers.delete(orderId);
                        return;
                    }
                    
                    const now = new Date();
                    const startTime = new Date(order.estimatedTimes.startTime);
                    const elapsedMinutes = (now - startTime) / (1000 * 60);
                    
                    if (order.phase === 'preparation') {
                        const prepProgress = Math.min(elapsedMinutes, order.progress.preparation.total);
                        get().updateOrderProgress(orderId, 'preparation', prepProgress);
                        
                        if (prepProgress >= order.progress.preparation.total && !order.progress.preparation.completed) {
                            get().completeOrderPhase(orderId, 'preparation');
                        }
                    } else if (order.phase === 'delivery') {
                        const deliveryStart = order.progress.preparation.total;
                        const deliveryProgress = Math.min(elapsedMinutes - deliveryStart, order.progress.delivery.total);
                        get().updateOrderProgress(orderId, 'delivery', Math.max(0, deliveryProgress));
                        
                        if (deliveryProgress >= order.progress.delivery.total && !order.progress.delivery.completed) {
                            get().completeOrderPhase(orderId, 'delivery');
                            // Stop timer when delivery is completed
                            get().stopOrderTimer(orderId);
                        }
                    }
                }, 1000); // Update every second
                
                activeTimers.set(orderId, timer);
            },
            
            stopOrderTimer: (orderId) => {
                if (activeTimers.has(orderId)) {
                    clearInterval(activeTimers.get(orderId));
                    activeTimers.delete(orderId);
                }
            },

            getOrderById: (orderId) => {
                const { orders } = get();
                return orders.find(order => order.id === orderId);
            },

            clearOrders: () => set({ orders: [] }),

            getOrdersCount: () => {
                const { orders } = get();
                return orders.length;
            },
            
            // Restart timers on app load
            initializeTimers: () => {
                const { orders } = get();
                orders.forEach(order => {
                    if (order.phase && order.phase !== 'completed') {
                        get().startOrderTimer(order.id);
                    }
                });
            }
        }),
        {
            name: 'full-queso-orders',
            partialize: (state) => ({ orders: state.orders })
        }
    )
)

export { useOrdersStore };
export default useOrdersStore