import React, { useState, useEffect } from 'react'
import { FiClock, FiUser, FiTruck, FiCheckCircle } from 'react-icons/fi'
import useEstimatedTimeStore from '../../store/estimatedTimeStore'

const OrderProgress = ({ order }) => {
    const [currentTime, setCurrentTime] = useState(new Date())
    const { formatTime } = useEstimatedTimeStore()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000) // Actualizar cada minuto

        return () => clearInterval(timer)
    }, [])

    if (!order || !order.estimatedTimes) return null

    const orderTime = new Date(order.date)
    const estimatedReady = new Date(order.estimatedTimes.estimatedReady)
    const estimatedDelivery = new Date(order.estimatedTimes.estimatedDelivery)
    
    const elapsedMinutes = Math.floor((currentTime - orderTime) / 60000)
    const remainingPrep = Math.max(0, Math.floor((estimatedReady - currentTime) / 60000))
    const remainingDelivery = Math.max(0, Math.floor((estimatedDelivery - currentTime) / 60000))

    const getStatusInfo = () => {
        switch (order.status) {
            case 'preparando':
                return {
                    icon: FiUser,
                    color: 'orange',
                    title: 'Preparando tu pedido',
                    subtitle: remainingPrep > 0 
                        ? `Listo en aproximadamente ${formatTime(remainingPrep)}`
                        : 'Casi listo...',
                    progress: Math.min(100, (elapsedMinutes / order.estimatedTimes.preparation) * 100)
                }
            case 'listo':
                return {
                    icon: FiTruck,
                    color: 'blue',
                    title: 'En camino',
                    subtitle: remainingDelivery > 0 
                        ? `Llegará en aproximadamente ${formatTime(remainingDelivery)}`
                        : 'Llegando pronto...',
                    progress: Math.min(100, ((elapsedMinutes - order.estimatedTimes.preparation) / order.estimatedTimes.delivery) * 100)
                }
            case 'entregado':
                return {
                    icon: FiCheckCircle,
                    color: 'green',
                    title: '¡Pedido entregado!',
                    subtitle: 'Esperamos que lo disfrutes',
                    progress: 100
                }
            default:
                return {
                    icon: FiClock,
                    color: 'gray',
                    title: 'Procesando pedido',
                    subtitle: 'Confirmando tu orden...',
                    progress: 0
                }
        }
    }

    const statusInfo = getStatusInfo()
    const IconComponent = statusInfo.icon

    return (
        <div className="bg-white border border-neutral-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full bg-${statusInfo.color}-100`}>
                    <IconComponent className={`text-${statusInfo.color}-600`} size={20} />
                </div>
                <div>
                    <h3 className="font-body font-bold text-brand-dark">{statusInfo.title}</h3>
                    <p className="font-body text-sm text-neutral-text-muted">{statusInfo.subtitle}</p>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-neutral-text-muted mb-1">
                    <span>Progreso</span>
                    <span>{Math.round(statusInfo.progress)}%</span>
                </div>
                <div className="w-full bg-neutral-border rounded-full h-2">
                    <div 
                        className={`bg-${statusInfo.color}-500 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${statusInfo.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
                <div className={`flex items-center gap-3 ${order.status === 'preparando' ? 'text-orange-600' : 'text-green-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'preparando' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <div className="flex-1">
                        <p className="font-body text-sm font-bold">Preparación</p>
                        <p className="font-body text-xs text-neutral-text-muted">
                            {formatTime(order.estimatedTimes.preparation)}
                        </p>
                    </div>
                    {order.status !== 'preparando' && <FiCheckCircle className="text-green-500" size={16} />}
                </div>

                <div className={`flex items-center gap-3 ${order.status === 'listo' ? 'text-blue-600' : order.status === 'entregado' ? 'text-green-600' : 'text-neutral-text-muted'}`}>
                    <div className={`w-3 h-3 rounded-full ${
                        order.status === 'listo' ? 'bg-blue-500 animate-pulse' : 
                        order.status === 'entregado' ? 'bg-green-500' : 'bg-neutral-border'
                    }`}></div>
                    <div className="flex-1">
                        <p className="font-body text-sm font-bold">Delivery</p>
                        <p className="font-body text-xs text-neutral-text-muted">
                            {formatTime(order.estimatedTimes.delivery)}
                        </p>
                    </div>
                    {order.status === 'entregado' && <FiCheckCircle className="text-green-500" size={16} />}
                </div>
            </div>

            {/* Tiempo total */}
            <div className="mt-4 pt-3 border-t border-neutral-border">
                <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-neutral-text-muted">Tiempo total estimado:</span>
                    <span className="font-body font-bold text-sm text-brand-dark">
                        {formatTime(order.estimatedTimes.total)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default OrderProgress