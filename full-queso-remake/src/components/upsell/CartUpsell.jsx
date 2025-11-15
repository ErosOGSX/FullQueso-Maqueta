import React from 'react'
import { FiShoppingBag, FiPlus } from 'react-icons/fi'
import useUpsellStore from '../../store/upsellStore'
import useCartStore from '../../store/cartStore'
import useNotificationStore from '../../store/notificationStore'
import { menuProducts } from '../../data/products'

const CartUpsell = () => {
    const { items } = useCartStore()
    const { getRelatedProducts, getSuggestedCombos } = useUpsellStore()
    const { addProduct } = useCartStore()
    const { success } = useNotificationStore()

    if (items.length === 0) return null

    // Obtener productos únicos en el carrito
    const uniqueProductIds = [...new Set(items.map(item => {
        const id = typeof item.id === 'string' ? item.id.split('-')[0] : item.id
        return id.toString()
    }))]
    
    // Obtener todas las recomendaciones
    const allRecommendations = new Set()
    uniqueProductIds.forEach(productId => {
        const related = getRelatedProducts(productId)
        related.forEach(id => allRecommendations.add(id))
    })

    // Filtrar productos que no están en el carrito
    const recommendations = Array.from(allRecommendations)
        .filter(id => !uniqueProductIds.includes(id))
        .map(id => menuProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 3) // Máximo 3 recomendaciones

    if (recommendations.length === 0) return null

    const handleAddRecommendation = (product) => {
        addProduct(product)
        success('Producto Agregado', `${product.name} agregado al carrito`)
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <FiShoppingBag className="text-blue-600" size={16} />
                <h3 className="font-body font-bold text-blue-800">¿Te falta algo?</h3>
            </div>
            <p className="font-body text-sm text-blue-700 mb-3">
                Otros clientes también agregaron estos productos:
            </p>
            <div className="grid grid-cols-1 gap-2">
                {recommendations.map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-3">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div>
                                <h4 className="font-body font-bold text-brand-dark text-sm">{product.name}</h4>
                                <span className="font-body font-bold text-brand-primary text-sm">
                                    {product.price}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleAddRecommendation(product)}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CartUpsell