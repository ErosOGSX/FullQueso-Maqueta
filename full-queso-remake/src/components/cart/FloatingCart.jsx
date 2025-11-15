import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import PriceDisplay from '../currency/PriceDisplay'

const FloatingCart = () => {
    const { items } = useCartStore()
    const navigate = useNavigate()
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price
        return sum + (price * item.quantity)
    }, 0)

    if (totalItems === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => navigate('/carrito')}
                className="bg-brand-primary text-white rounded-full p-4 shadow-lg hover:bg-brand-primary-dark transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
                <div className="relative">
                    <FiShoppingCart size={24} />
                    <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                    </span>
                </div>
                <div className="hidden md:block">
                    <PriceDisplay dollarAmount={totalPrice} className="font-bold" />
                </div>
            </button>
        </div>
    )
}

export default FloatingCart