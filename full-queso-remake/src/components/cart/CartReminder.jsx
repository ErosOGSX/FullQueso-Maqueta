import React, { useEffect, useState } from 'react'
import { FiShoppingCart, FiX, FiBell } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import usePersistentCartStore from '../../store/persistentCartStore'

const CartReminder = () => {
    const [reminder, setReminder] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    const navigate = useNavigate()
    const { getCartStats } = usePersistentCartStore()

    useEffect(() => {
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Escuchar eventos de recordatorio
        const handleCartReminder = (event) => {
            const { message, minutes, itemCount } = event.detail
            setReminder({ message, minutes, itemCount })
            setIsVisible(true)
            
            // Auto-ocultar después de 10 segundos
            setTimeout(() => {
                setIsVisible(false)
            }, 10000)
        }

        window.addEventListener('cartReminder', handleCartReminder)
        
        return () => {
            window.removeEventListener('cartReminder', handleCartReminder)
        }
    }, [])

    const handleGoToCart = () => {
        setIsVisible(false)
        navigate('/carrito')
    }

    const handleDismiss = () => {
        setIsVisible(false)
    }

    if (!isVisible || !reminder) return null

    return (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
            <div className="bg-white border-2 border-brand-yellow rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-brand-yellow rounded-full p-2">
                        <FiBell className="text-brand-dark" size={16} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-body font-bold text-brand-dark text-sm mb-1">
                            ¡No olvides tu pedido!
                        </h4>
                        <p className="font-body text-xs text-neutral-text-muted mb-3">
                            {reminder.message}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGoToCart}
                                className="bg-brand-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-brand-primary-dark transition-colors flex items-center gap-1"
                            >
                                <FiShoppingCart size={12} />
                                Ver Carrito
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="text-neutral-text-muted hover:text-brand-dark text-xs px-2"
                            >
                                Después
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-neutral-text-muted hover:text-brand-dark p-1"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CartReminder