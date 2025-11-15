import React from "react";
import { FiMinus, FiPlus, FiTrash2, FiHeart } from 'react-icons/fi'
import useCartStore from '../../store/cartStore';
import usePersistentCartStore from '../../store/persistentCartStore';
import useNotificationStore from '../../store/notificationStore';

const CartItem = ({ item }) => {
    const { increaseQuantity, decreaseQuantity, removeProduct } = useCartStore();
    const { saveForLater } = usePersistentCartStore();
    const { success } = useNotificationStore();
    const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
    const validPrice = isNaN(itemPrice) ? 0 : itemPrice;

    const handleSaveForLater = () => {
        saveForLater(item.id);
        success('Guardado', 'Producto guardado para después');
    };

    return (
        <div className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-neutral-surface dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-16 h-16 md:w-20 md:h-20 rounded-md object-cover flex-shrink-0" 
                onError={(e) => { e.target.style.display = 'none' }}
            />

            <div className="flex-1 min-w-0">
                <h3 className="font-display-alt text-sm md:text-lg text-white truncate"> {item.name} </h3>
                <p className="font-body font-bold text-brand-primary text-sm md:text-base">${(validPrice * item.quantity).toFixed(2)}</p>
                <button 
                    onClick={handleSaveForLater}
                    className="text-xs text-neutral-text-muted hover:text-pink-500 flex items-center gap-1 mt-1"
                >
                    <FiHeart size={12} />
                    Guardar para después
                </button>
            </div>

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">

                <button onClick={() => decreaseQuantity(item.id)} className="p-1 rounded-full bg-neutral-border dark:bg-gray-600 hover:bg-brand-yellow-light dark:hover:bg-gray-500"> <FiMinus className="text-brand-dark dark:text-white" size={14} /> </button>
                <span className="font-body font-bold text-sm md:text-lg w-6 text-center text-brand-dark dark:text-white"> {item.quantity} </span>
                <button onClick={() => increaseQuantity(item.id)} className="p-1 rounded-full bg-neutral-border dark:bg-gray-600 hover:bg-brand-yellow-light dark:hover:bg-gray-500"> <FiPlus className="text-brand-dark dark:text-white" size={14} /> </button>

            </div>

            <button onClick={() => removeProduct(item.id)} className="p-1 md:p-2 rounded-full hover:bg-red-100 flex-shrink-0"> <FiTrash2 className="text-red-500" size={16} /> </button>

        </div>
    )
}

export default CartItem