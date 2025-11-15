import React from 'react'
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import usePersistentCartStore from '../../store/persistentCartStore'
import useNotificationStore from '../../store/notificationStore'

const SavedItems = () => {
    const { savedForLater, moveToCart, removeProduct } = usePersistentCartStore()
    const { success } = useNotificationStore()

    if (savedForLater.length === 0) return null

    const handleMoveToCart = (productId) => {
        moveToCart(productId)
        success('Producto Agregado', 'Movido al carrito exitosamente')
    }

    const handleRemove = (productId) => {
        // Remover de savedForLater
        const updatedSaved = savedForLater.filter(item => item.id !== productId)
        // Actualizar el store directamente
        usePersistentCartStore.setState({ savedForLater: updatedSaved })
        success('Producto Eliminado', 'Removido de guardados')
    }

    const formatTimeAgo = (timestamp) => {
        const now = Date.now()
        const diff = now - timestamp
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor(diff / (1000 * 60))

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
        return 'hace un momento'
    }

    return (
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <FiHeart className="text-pink-600" size={16} />
                <h3 className="font-body font-bold text-pink-800">
                    Guardados para después ({savedForLater.length})
                </h3>
            </div>

            <div className="space-y-3">
                {savedForLater.map(item => (
                    <div key={item.id} className="bg-white rounded-lg p-3 border border-pink-200">
                        <div className="flex items-center gap-3">
                            <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div className="flex-1">
                                <h4 className="font-body font-bold text-brand-dark text-sm">{item.name}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="font-body font-bold text-brand-primary text-sm">
                                        {item.price}
                                    </span>
                                    <span className="font-body text-xs text-neutral-text-muted">
                                        {formatTimeAgo(item.savedAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMoveToCart(item.id)}
                                    className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-primary-dark transition-colors"
                                    title="Mover al carrito"
                                >
                                    <FiShoppingCart size={14} />
                                </button>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                    title="Eliminar"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 text-center">
                <button
                    onClick={() => {
                        savedForLater.forEach(item => moveToCart(item.id))
                        success('Todos los productos', 'Movidos al carrito')
                    }}
                    className="text-pink-600 hover:text-pink-800 font-body text-sm font-bold hover:underline"
                >
                    Mover todos al carrito
                </button>
            </div>
        </div>
    )
}

export default SavedItems