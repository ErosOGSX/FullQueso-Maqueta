import React from "react";
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import useCartStore from '../../store/cartStore';

const CartItem = ({ item }) => {
    const { increaseQuantity, decreaseQuantity, removeProduct } = useCartStore();

    return (
        <div className="flex items-center gap-4 p-4 bg-nuetral-surface rounded-lg shadow">

            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover" />

            <div className="grow">
                <h3 className="font-display-alt text-lg text-brand-dark"> {item.name} </h3>
                <p className="font-body font-bold text-brand-primary"> ${(item.price * item.quantity).toFixed(2)} </p>
            </div>

            <div className="flex items-center gap-3">

                <button onClick={() => decreaseQuantity(item.id)} className="p-1 rounded-full bg-neutral-border hover:bg-brand-yellow-light"> <FiMinus className="text-brand-dark" /> </button>
                <span className="font-body font-bold text-lg w-6 text-center"> {item.quantity} </span>
                <button onClick={() => increaseQuantity(item.id)} className="p-1 rounded-full bg-neutral-border hover:bg-brand-yellow-light"> <FiPlus className="text-brand-dark" /> </button>

            </div>

            <button onClick={() => removeProduct(item.id)} className="p-2 rounded-full hover:bg-red-100"> <FiTrash2 className="text-red-500" /> </button>

        </div>
    )
}

export default CartItem