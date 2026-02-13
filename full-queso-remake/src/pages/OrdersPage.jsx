import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiCheck, FiTruck, FiShoppingBag, FiMapPin } from 'react-icons/fi'
import useOrdersStore from '../store/ordersStore'
import useCartStore from '../store/cartStore'
import useGPSTrackingStore from '../store/gpsTrackingStore'
import OrderProgressCard from '../components/order/OrderProgressCard'
import TimeAccuracyStats from '../components/order/TimeAccuracyStats'
import ExternalFactorsIndicator from '../components/order/ExternalFactorsIndicator'
import DeliveryTracker from '../components/tracking/DeliveryTracker'

const SimpleOrderCard = ({ order }) => {
    const { addProduct } = useCartStore()
    const { startTracking, getDeliveryTracking } = useGPSTrackingStore()
    const [showTracking, setShowTracking] = useState(false)
    
    const handleTrackOrder = () => {
        // Simular inicio de tracking para órdenes activas
        if (order.status === 'confirmed' || order.status === 'preparing') {
            const deliveryPersonId = Math.random() > 0.5 ? 'dp001' : 'dp002'
            startTracking(order.id, deliveryPersonId)
        }
        setShowTracking(true)
    }
    
    const isTrackable = ['confirmed', 'preparing', 'on_way'].includes(order.status) || order.progress
    const hasTracking = getDeliveryTracking(order.id)
    
    const reorderItems = () => {
        order.items.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                addProduct(item)
            }
        })
        alert(`${order.items.length} productos agregados al carrito`)
    }

    return (
        <div className='bg-neutral-surface rounded-lg shadow-md p-4 mb-4'>
            <div className='flex justify-between items-start mb-3'>
                <div>
                    <h3 className='font-display-alt text-lg text-brand-dark'>
                        Orden #{order.id.slice(-4)}
                    </h3>
                    <p className='font-body text-sm text-neutral-text-muted'>
                        {new Date(order.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-body font-bold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'on_way' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {order.status === 'delivered' ? 'Entregado' :
                     order.status === 'confirmed' ? 'Confirmado' :
                     order.status === 'preparing' ? 'Preparando' :
                     order.status === 'on_way' ? 'En camino' :
                     'Pendiente'}
                </span>
            </div>

            <div className='mb-3'>
                <p className='font-body text-sm text-neutral-text-muted mb-1'>
                    {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                </p>
                <div className='flex flex-wrap gap-1'>
                    {order.items.slice(0, 3).map((item, index) => (
                        <span key={index} className='font-body text-xs bg-neutral-border px-2 py-1 rounded'>
                            {item.quantity}x {item.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                    ))}
                    {order.items.length > 3 && (
                        <span className='font-body text-xs text-neutral-text-muted px-2 py-1'>
                            +{order.items.length - 3} más
                        </span>
                    )}
                </div>
            </div>

            <div className='flex justify-between items-center'>
                <span className='font-body font-bold text-lg text-brand-primary'>
                    ${order.total.toFixed(2)}
                </span>
                <div className='flex space-x-2'>
                    {(isTrackable || hasTracking) && (
                        <button
                            onClick={handleTrackOrder}
                            className='bg-blue-500 text-white font-body font-bold py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1'
                        >
                            <FiMapPin size={14} />
                            <span>Rastrear</span>
                        </button>
                    )}
                    <button
                        onClick={reorderItems}
                        className='bg-brand-primary text-white font-body font-bold py-2 px-4 rounded-lg hover:bg-brand-primary-light transition-colors text-sm'
                    >
                        Reordenar
                    </button>
                </div>
            </div>
            
            {/* Modal de tracking */}
            {showTracking && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <DeliveryTracker 
                        orderId={order.id} 
                        onClose={() => setShowTracking(false)} 
                    />
                </div>
            )}
        </div>
    )
}

const OrdersPage = () => {
    const { orders, clearOrders, initializeTimers } = useOrdersStore()
    const { getUserLocation } = useGPSTrackingStore()
    
    // Initialize timers on component mount
    useEffect(() => {
        initializeTimers();
    }, [initializeTimers]);

    if (orders.length === 0) {
        return (
            <div className="container mx-auto text-center p-8 flex flex-col items-center gap-6">
                <FiShoppingBag size={80} className="text-neutral-border" />
                <h1 className="font-display text-4xl text-brand-dark">Sin órdenes aún</h1>
                <p className="font-body text-neutral-text-muted max-w-md">
                    Cuando realices tu primer pedido, aparecerá aquí tu historial de órdenes.
                </p>
                <Link 
                    to='/menu' 
                    className="bg-brand-primary text-white font-bold font-body py-3 px-6 rounded-lg hover:bg-brand-primary-light transition-colors"
                >
                    Hacer mi primer pedido
                </Link>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 py-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='font-display text-4xl text-brand-dark mb-2'>
                        📋 Mis Órdenes
                    </h1>
                    <p className='font-body text-neutral-text-muted'>
                        {orders.length} orden{orders.length !== 1 ? 'es' : ''} realizada{orders.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button 
                    onClick={clearOrders}
                    className='font-body text-sm text-red-500 hover:underline'
                >
                    Limpiar historial
                </button>
            </div>

            {/* Factores externos */}
            <ExternalFactorsIndicator />
            
            {/* Estadísticas de precisión */}
            <TimeAccuracyStats />
            
            {/* Mensaje informativo */}
            <div className='bg-brand-yellow-light border-2 border-brand-yellow-dark rounded-lg p-4 mb-6'>
                <p className='font-body text-brand-dark text-sm'>
                    💡 <strong>Tip:</strong> Nuestros tiempos mejoran automáticamente con cada pedido. Usa "Reordenar" para repetir pedidos anteriores.
                </p>
            </div>

            {/* Lista de órdenes */}
            <div>
                {orders.map(order => {
                    // Check if order has new progress structure
                    if (order.progress && order.phase && order.phase !== 'completed') {
                        return <OrderProgressCard key={order.id} order={order} />;
                    } else {
                        return <SimpleOrderCard key={order.id} order={order} />;
                    }
                })}
            </div>
        </div>
    )
}

export default OrdersPage