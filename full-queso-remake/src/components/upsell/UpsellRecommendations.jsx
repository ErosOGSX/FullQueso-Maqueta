import React from 'react'
import { FiPlus, FiUsers, FiTag, FiTrendingUp } from 'react-icons/fi'
import useUpsellStore from '../../store/upsellStore'
import useCartStore from '../../store/cartStore'
import useNotificationStore from '../../store/notificationStore'
import { menuProducts } from '../../data/products'

const UpsellRecommendations = ({ currentProduct, quantity = 1 }) => {
    const { getRelatedProducts, getSuggestedCombos, getVolumeDiscount } = useUpsellStore()
    const { addProduct } = useCartStore()
    const { success } = useNotificationStore()

    const relatedProductIds = getRelatedProducts(currentProduct.id)
    const suggestedCombos = getSuggestedCombos(currentProduct.id)
    const volumeDiscount = getVolumeDiscount(currentProduct.id, quantity)

    const relatedProducts = relatedProductIds
        .map(id => menuProducts.find(p => p.id === id))
        .filter(Boolean)

    const handleAddRelated = (product) => {
        addProduct(product)
        success('Producto Agregado', `${product.name} agregado al carrito`)
    }

    const handleAddCombo = (combo) => {
        combo.products.forEach(productId => {
            const product = menuProducts.find(p => p.id === productId)
            if (product) {
                addProduct({
                    ...product,
                    isCombo: true,
                    comboId: combo.id,
                    comboPrice: combo.comboPrice / combo.products.length
                })
            }
        })
        success('Combo Agregado', `${combo.name} agregado al carrito`)
    }

    if (!relatedProducts.length && !suggestedCombos.length && !volumeDiscount) {
        return null
    }

    return (
        <div className="space-y-4">
            {/* Descuento por volumen */}
            {volumeDiscount && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FiTrendingUp className="text-green-600" size={16} />
                        <h4 className="font-body font-bold text-green-800">¡Descuento por Volumen!</h4>
                    </div>
                    <p className="font-body text-sm text-green-700 mb-2">
                        {volumeDiscount.label}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                            AHORRA ${(parseFloat(currentProduct.price.replace('$', '')) * quantity * volumeDiscount.discount).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {/* Combos sugeridos */}
            {suggestedCombos.length > 0 && (
                <div className="border border-brand-yellow rounded-lg p-4 bg-brand-yellow-light">
                    <div className="flex items-center gap-2 mb-3">
                        <FiTag className="text-brand-dark" size={16} />
                        <h4 className="font-body font-bold text-brand-dark">Combos Recomendados</h4>
                    </div>
                    <div className="space-y-3">
                        {suggestedCombos.map(combo => (
                            <div key={combo.id} className="bg-white rounded-lg p-3 border border-neutral-border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-body font-bold text-brand-dark text-sm">{combo.name}</h5>
                                        <p className="font-body text-xs text-neutral-text-muted">{combo.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neutral-text-muted line-through">
                                                ${combo.originalPrice.toFixed(2)}
                                            </span>
                                            <span className="font-bold text-brand-primary">
                                                ${combo.comboPrice.toFixed(2)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-green-600 font-bold">
                                            Ahorra ${combo.savings.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddCombo(combo)}
                                    className="w-full bg-brand-primary text-white py-2 px-3 rounded-lg font-body font-bold text-sm hover:bg-brand-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiPlus size={14} />
                                    Agregar Combo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Productos relacionados */}
            {relatedProducts.length > 0 && (
                <div className="border border-neutral-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FiUsers className="text-brand-dark" size={16} />
                        <h4 className="font-body font-bold text-brand-dark">Otros también compraron</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {relatedProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-neutral-surface border border-neutral-border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded-lg"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                    <div>
                                        <h5 className="font-body font-bold text-brand-dark text-sm">{product.name}</h5>
                                        <p className="font-body text-xs text-neutral-text-muted line-clamp-1">
                                            {product.description}
                                        </p>
                                        <span className="font-body font-bold text-brand-primary text-sm">
                                            {product.price}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddRelated(product)}
                                    className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-primary-dark transition-colors"
                                >
                                    <FiPlus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UpsellRecommendations