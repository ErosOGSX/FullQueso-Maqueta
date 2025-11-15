import React, { useState } from 'react'
import { FiX, FiMinus, FiPlus } from 'react-icons/fi'
import useCartStore from '../../store/cartStore'
import useNotificationStore from '../../store/notificationStore'
import useUpsellStore from '../../store/upsellStore'
import UpsellRecommendations from '../upsell/UpsellRecommendations'
import './ProductModal.css'

const ProductModal = ({ product, isOpen, onClose }) => {
    const { addProduct } = useCartStore()
    const { success } = useNotificationStore()
    const { calculateVolumePrice, getVolumeDiscount } = useUpsellStore()
    const [quantity, setQuantity] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState({})

    if (!isOpen || !product) return null

    // Configuración de opciones por producto
    const getProductOptions = () => {
        if (product.category === 'pastelitos') {
            const isCombo = product.name.includes('5 unidades')
            
            if (isCombo) {
                return {
                    title: `Selecciona los sabores (${5 * quantity} unidades)`,
                    options: [
                        { id: 'carne', name: 'Carne', max: 5 * quantity },
                        { id: 'pollo', name: 'Pollo', max: 5 * quantity },
                        { id: 'pizza', name: 'Pizza', max: 5 * quantity },
                    ],
                    isMultiple: true,
                    totalRequired: 5 * quantity
                }
            } else {
                return {
                    title: 'Selecciona el sabor',
                    options: [
                        { id: 'carne', name: 'Carne' },
                        { id: 'pollo', name: 'Pollo' },
                        { id: 'pizza', name: 'Pizza' }
                    ],
                    isMultiple: false
                }
            }
        }
        
        if (product.category === 'churros' && product.name.includes('Rellenos')) {
            return {
                title: 'Selecciona el topping',
                options: [
                    { id: 'choco-arequipe', name: 'Choco Arequipe' },
                    { id: 'solo-arequipe', name: 'Solo Arequipe' },
                    { id: 'solo-chocolate', name: 'Solo Chocolate' },
                    { id: 'choco-blanco-oscuro', name: 'Choco Blanco - Choco Oscuro' }
                ],
                isMultiple: false
            }
        }
        
        return null
    }

    const productOptions = getProductOptions()
    const basePrice = parseFloat(product.price.replace('$', ''))
    const volumeDiscount = getVolumeDiscount(product.id, quantity)
    const finalPrice = calculateVolumePrice(basePrice, product.id, quantity)

    const handleOptionChange = (optionId, value) => {
        if (productOptions?.isMultiple) {
            const maxForOption = productOptions.options.find(opt => opt.id === optionId)?.max || 0
            setSelectedOptions(prev => ({
                ...prev,
                [optionId]: Math.max(0, Math.min(value, maxForOption))
            }))
        } else {
            setSelectedOptions({ [optionId]: true })
        }
    }

    const getTotalSelected = () => {
        if (!productOptions?.isMultiple) return 1
        return Object.values(selectedOptions).reduce((sum, val) => sum + (val || 0), 0)
    }

    const isValidSelection = () => {
        if (!productOptions) return true
        if (productOptions.isMultiple) {
            return getTotalSelected() === productOptions.totalRequired
        }
        return Object.keys(selectedOptions).length > 0
    }

    const handleAddToCart = () => {
        if (!isValidSelection()) return

        const customProduct = {
            ...product,
            customOptions: selectedOptions,
            quantity: quantity
        }

        // Si tiene opciones personalizadas, crear ID único
        if (Object.keys(selectedOptions).length > 0) {
            customProduct.id = `${product.id}-${Date.now()}`
        }

        const success_result = addProduct(customProduct)
        
        if (success_result !== false) {
            success('Producto Agregado', `${quantity}x ${product.name} agregado al carrito`)
            onClose()
            setQuantity(1)
            setSelectedOptions({})
        } else {
            success('Sin Stock', 'No hay suficiente inventario disponible')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto modal-scrollbar">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-border">
                    <h2 className="font-display-alt text-xl text-brand-dark">Personalizar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-border rounded-full">
                        <FiX size={20} className="text-brand-dark" />
                    </button>
                </div>

                {/* Imagen del producto */}
                <div className="p-4">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </div>

                {/* Información del producto */}
                <div className="px-4 pb-4">
                    <h3 className="font-display-alt text-lg text-brand-dark mb-2">{product.name}</h3>
                    <p className="font-body text-neutral-text-muted text-sm mb-4">{product.description}</p>
                </div>

                {/* Opciones de personalización */}
                {productOptions && (
                    <div className="px-4 pb-4">
                        <h4 className="font-body font-bold text-brand-dark mb-3">{productOptions.title}</h4>
                        
                        {productOptions.isMultiple ? (
                            // Múltiples opciones con contadores
                            <div className="space-y-3">
                                {productOptions.options.map(option => (
                                    <div key={option.id} className="flex items-center justify-between p-3 border border-neutral-border rounded-lg">
                                        <span className="font-body text-brand-dark">{option.name}</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleOptionChange(option.id, (selectedOptions[option.id] || 0) - 1)}
                                                className="p-1 rounded-full bg-neutral-border hover:bg-brand-yellow-light"
                                                disabled={!selectedOptions[option.id]}
                                            >
                                                <FiMinus size={16} className="text-brand-dark" />
                                            </button>
                                            <span className="font-body font-bold w-8 text-center text-brand-dark">
                                                {selectedOptions[option.id] || 0}
                                            </span>
                                            <button
                                                onClick={() => handleOptionChange(option.id, (selectedOptions[option.id] || 0) + 1)}
                                                className="p-1 rounded-full bg-neutral-border hover:bg-brand-yellow-light"
                                                disabled={(selectedOptions[option.id] || 0) >= option.max || getTotalSelected() >= productOptions.totalRequired}
                                            >
                                                <FiPlus size={16} className="text-brand-dark" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-sm text-neutral-text-muted text-center">
                                    {getTotalSelected()}/{productOptions.totalRequired} seleccionados
                                </p>
                            </div>
                        ) : (
                            // Opción única
                            <div className="space-y-2">
                                {productOptions.options.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionChange(option.id, true)}
                                        className={`w-full p-3 rounded-lg border text-left font-body transition-colors ${
                                            selectedOptions[option.id]
                                                ? 'border-brand-primary bg-brand-primary text-white'
                                                : 'border-neutral-border hover:bg-brand-yellow-light text-brand-dark'
                                        }`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Contador de cantidad */}
                <div className="px-4 pb-4">
                    <h4 className="font-body font-bold text-brand-dark mb-3">Cantidad</h4>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 rounded-full bg-neutral-border hover:bg-brand-yellow-light"
                        >
                            <FiMinus size={20} />
                        </button>
                        <span className="font-display-alt text-2xl text-brand-dark w-12 text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-3 rounded-full bg-neutral-border hover:bg-brand-yellow-light"
                        >
                            <FiPlus size={20} />
                        </button>
                    </div>
                </div>

                {/* Recomendaciones de upselling */}
                <div className="px-4 pb-4">
                    <UpsellRecommendations currentProduct={product} quantity={quantity} />
                </div>

                {/* Footer con precio y botón */}
                <div className="p-4 border-t bg-neutral-surface">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="font-body text-neutral-text-muted">Total:</span>
                            {volumeDiscount && (
                                <div className="text-xs text-green-600 font-bold">
                                    Ahorro: ${((basePrice * quantity) - finalPrice).toFixed(2)}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            {volumeDiscount && (
                                <div className="text-sm text-neutral-text-muted line-through">
                                    ${(basePrice * quantity).toFixed(2)}
                                </div>
                            )}
                            <span className="font-display-alt text-2xl text-brand-primary">
                                ${finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={!isValidSelection()}
                        className={`w-full py-3 rounded-lg font-body font-bold text-lg transition-colors ${
                            isValidSelection()
                                ? 'bg-brand-primary text-white hover:bg-brand-primary-light'
                                : 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                        }`}
                    >
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductModal