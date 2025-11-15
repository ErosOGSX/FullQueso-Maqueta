import React, { useState } from 'react'
import { FiZap, FiCreditCard, FiMapPin, FiSettings } from 'react-icons/fi'
import usePersistentCartStore from '../../store/persistentCartStore'
import useUserDataStore from '../../store/userDataStore'
import useNotificationStore from '../../store/notificationStore'
import useOrdersStore from '../../store/ordersStore'
import useCartStore from '../../store/cartStore'
import useSelectionStore from '../../store/selectionStore'

const ExpressCheckout = ({ total, onSuccess }) => {
    const { 
        expressCheckoutEnabled, 
        defaultPaymentMethod, 
        defaultAddress,
        setupExpressCheckout
    } = usePersistentCartStore()
    
    const { userData, isDataComplete } = useUserDataStore()
    const { success, error } = useNotificationStore()
    const { addOrder } = useOrdersStore()
    const { items, clearCart } = useCartStore()
    const { service, store } = useSelectionStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSetup, setShowSetup] = useState(false)

    const handleExpressCheckout = async () => {
        if (!expressCheckoutEnabled) {
            setShowSetup(true)
            return
        }

        setIsProcessing(true)
        try {
            // Crear orden en ordersStore
            const result = addOrder({
                items: items,
                total: total,
                customerInfo: userData,
                service: service,
                store: store
            })
            
            // Limpiar carrito
            clearCart()
            
            success('¡Pedido Confirmado!', `Orden ${result.orderId.slice(-6)} procesada exitosamente`)
            onSuccess(result)
        } catch (err) {
            error('Error en Checkout Express', err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSetupExpress = () => {
        if (!isDataComplete()) {
            error('Datos Incompletos', 'Completa tu perfil primero')
            return
        }

        // Configurar con datos del usuario
        setupExpressCheckout(
            { type: 'card', last4: '****' }, // Método de pago por defecto
            userData.deliveryAddress || userData.address
        )
        
        success('Checkout Express Activado', 'Ahora puedes comprar con 1 click')
        setShowSetup(false)
    }

    if (showSetup) {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <FiZap className="text-purple-600" size={16} />
                    <h3 className="font-body font-bold text-purple-800">Configurar Checkout Express</h3>
                </div>
                <p className="font-body text-sm text-purple-700 mb-4">
                    Configura tu método de pago y dirección para compras con 1 click
                </p>
                
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <FiCreditCard className="text-purple-600" size={16} />
                        <div>
                            <p className="font-body font-bold text-sm text-brand-dark">Método de Pago</p>
                            <p className="font-body text-xs text-neutral-text-muted">Tarjeta por defecto</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <FiMapPin className="text-purple-600" size={16} />
                        <div>
                            <p className="font-body font-bold text-sm text-brand-dark">Dirección</p>
                            <p className="font-body text-xs text-neutral-text-muted">
                                {userData.deliveryAddress || userData.address || 'No configurada'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSetupExpress}
                        disabled={!isDataComplete()}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-body font-bold text-sm hover:bg-purple-700 transition-colors disabled:bg-gray-300"
                    >
                        Activar Express
                    </button>
                    <button
                        onClick={() => setShowSetup(false)}
                        className="px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg font-body text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        )
    }

    if (!expressCheckoutEnabled) {
        return (
            <button
                onClick={() => setShowSetup(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-body font-bold text-sm hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 mb-3"
            >
                <FiSettings size={16} />
                Configurar Checkout Express
            </button>
        )
    }

    return (
        <div className="mb-4">
            <button
                onClick={handleExpressCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-4 rounded-lg font-body font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <FiZap size={20} />
                {isProcessing ? 'Procesando...' : `Comprar Ahora - $${total.toFixed(2)}`}
            </button>
            
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-neutral-text-muted">
                <div className="flex items-center gap-1">
                    <FiCreditCard size={12} />
                    <span>{defaultPaymentMethod?.last4 || '****'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiMapPin size={12} />
                    <span>{defaultAddress?.slice(0, 20)}...</span>
                </div>
            </div>
        </div>
    )
}

export default ExpressCheckout