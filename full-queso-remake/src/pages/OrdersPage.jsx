import React from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiCheck, FiTruck, FiShoppingBag } from 'react-icons/fi'
import useOrdersStore from '../store/ordersStore'
import useCartStore from '../store/cartStore'
import OrderProgress from '../components/order/OrderProgress'

const OrderCard = ({ order }) => {
    const { addProduct } = useCartStore()
    
    const getStatusInfo = (status) => {
        switch (status) {
            case 'preparando':
                return { icon: FiClock, text: 'Preparando', color: 'text-yellow-600', bg: 'bg-yellow-100' }
            case 'listo':
                return { icon: FiCheck, text: 'Listo', color: 'text-green-600', bg: 'bg-green-100' }
            case 'entregado':
                return { icon: FiTruck, text: 'Entregado', color: 'text-blue-600', bg: 'bg-blue-100' }
            default:
                return { icon: FiClock, text: 'Pendiente', color: 'text-gray-600', bg: 'bg-gray-100' }
        }
    }

    const statusInfo = getStatusInfo(order.status)
    const StatusIcon = statusInfo.icon
    const orderDate = new Date(order.date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })

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
            {/* Progreso de la orden si está activa */}
            {(order.status === 'preparando' || order.status === 'listo') && (
                <div className='mb-4'>
                    <OrderProgress order={order} />
                </div>
            )}
            
            <div className='flex justify-between items-start mb-3'>
                <div>
                    <h3 className='font-display-alt text-lg text-brand-dark'>
                        Orden #{order.id.slice(-6)}
                    </h3>
                    <p className='font-body text-sm text-neutral-text-muted'>{orderDate}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                    <StatusIcon size={16} className={statusInfo.color} />
                    <span className={`font-body text-sm font-bold ${statusInfo.color}`}>
                        {statusInfo.text}
                    </span>
                </div>
            </div>

            <div className='mb-3'>
                <p className='font-body text-sm text-neutral-text-muted mb-1'>
                    {order.items.length} producto{order.items.length !== 1 ? 's' : ''} • {order.store.name}
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
                <button
                    onClick={reorderItems}
                    className='bg-brand-primary text-white font-body font-bold py-2 px-4 rounded-lg hover:bg-brand-primary-light transition-colors text-sm'
                >
                    Reordenar
                </button>
            </div>
        </div>
    )
}

const OrdersPage = () => {
    const { orders, clearOrders } = useOrdersStore()

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

            {/* Mensaje informativo */}
            <div className='bg-brand-yellow-light border-2 border-brand-yellow-dark rounded-lg p-4 mb-6'>
                <p className='font-body text-brand-dark text-sm'>
                    💡 <strong>Tip:</strong> Tu historial se guarda en este dispositivo. Usa "Reordenar" para agregar los mismos productos al carrito.
                </p>
            </div>

            {/* Lista de órdenes */}
            <div>
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    )
}

export default OrdersPage