// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import React, { useState } from "react";
import { FiPlus } from 'react-icons/fi'
import useCartStore from '../../store/cartStore';
import useInventoryStore from '../../store/inventoryStore';
import useReviewsStore from '../../store/reviewsStore';
import useNotificationStore from '../../store/notificationStore';
import ProductModal from './ProductModal';
import { FiStar } from 'react-icons/fi';
import OptimizedImage from '../common/OptimizedImage';

const ProductCard = ({ product }) => {
    const addProduct = useCartStore((state) => state.addProduct);
    const { isAvailable, getStock, isLowStock } = useInventoryStore();
    const { getAverageRating, getReviewCount } = useReviewsStore();
    const { success } = useNotificationStore();
    const [showModal, setShowModal] = useState(false);
    const displayPrice = typeof product.price === 'string' ? product.price : `$${product.price.toFixed(2)}`;
    const available = isAvailable(product.id);
    const stock = getStock(product.id);
    const lowStock = isLowStock(product.id);
    const rating = parseFloat(getAverageRating(product.id));
    const reviewCount = getReviewCount(product.id);
    
    // Productos que necesitan personalización
    const needsCustomization = product.category === 'pastelitos' || 
                              (product.category === 'churros' && product.name.includes('Rellenos'));
    
    const handleAddToCart = () => {
        if (!available) return;
        
        if (needsCustomization) {
            setShowModal(true);
        } else {
            const result = addProduct(product);
            if (result !== false) {
                success('Producto Agregado', `${product.name} agregado al carrito`);
            } else {
                success('Sin Stock', 'No hay suficiente inventario disponible');
            }
        }
    };

    return(
        <motion.div className="bg-neutral-surface rounded-lg shadow-md overflow-hidden flex flex-col relative"
        initial={{ opacity: 0, y:30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}>



            <div className="relative">
                <OptimizedImage 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-40"
                    priority={product.isPopular ? 'high' : 'normal'}
                />
                
                {!available && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full font-body text-sm font-bold">
                            Agotado
                        </span>
                    </div>
                )}
                
                {lowStock && available && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full font-body text-xs font-bold">
                            ¡Últimas {stock}!
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col grow">

                <h3 className="font-display-alt text-xl text-brand-dark"> {product.name} </h3>
                {rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                        <FiStar className="text-yellow-500 fill-current" size={14} />
                        <span className="font-body text-sm text-neutral-text-muted">
                            {rating} ({reviewCount})
                        </span>
                    </div>
                )}
                <p className="font-body text-neutral-text-muted text-sm mt-1 grow"> {product.description} </p>

                <div className="flex justify-between items-center mt-4">

                    <span className="font-body font-bold text-lg text-brand-dark"> {displayPrice} </span>

                    <button 
                        onClick={handleAddToCart}
                        disabled={!available}
                        className={`rounded-full p-2 transform transition-all duration-200 ${
                            available
                                ? 'bg-brand-primary text-white hover:bg-brand-primary-light hover:scale-110'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        aria-label={available ? `Añadir ${product.name} al carrito` : 'Producto no disponible'}
                    > 
                        <FiPlus size={24} /> 
                    </button>

                </div>
            </div>
            
            {/* Modal de personalización */}
            <ProductModal 
                product={product}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </motion.div>
    )
}


export default ProductCard