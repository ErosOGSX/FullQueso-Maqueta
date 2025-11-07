import React from "react";
import { Link } from "react-router-dom";
import useCartStore from '../store/cartStore';
import CartItem from "../components/cart/CartItem";
import { FiShoppingCart } from "react-icons/fi";

const CartPage = () => {
    const { items, clearCart } = useCartStore();

    const subtotal = items.reduce((total, item)=> total +item.price * item.quantity, 0);
    const taxRate = 0.12;
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    if (items.length === 0) {
        return (
            <div className="container mx-auto text-center p-8 flex flex-col items-center gap-6">
                <FiShoppingCart size={80} className="text-neutral-border" />
                <h1 className="font-display text-4xl text-brand-dark">Tú carrito está vacío</h1>
                <p className="font-body text-neutral-text-muted max-w-md">Parece que aún no ha añadido a ningún producto. ¡Explora nuestro menú y llénalo de sabor!</p>
                <Link to='/menu' className="bg-brand-primary text-white font-bold font-body py-3 px-6 rounded-lg hover:bg-brand-primary-light transition-colors">Volver al Menú</Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-display text-4xl text-brand-dark">Mi Carrito</h1>
                <button onClick={clearCart} className="font-body text-sm text-red-500 hover:underline">Vaciar Carrito</button>
            </div>

            <div className="flex flex-col gap-4"> {items.map(item => (
                    <CartItem key={item.id} item={item} />
                ))} 
            </div>

            <div className="mt-8 p-6 bg-neutral-surface rounded-lg shadow-lg">
                <h2 className="font-display-alt text-2xl text-brand-dark mb-4">Resumen del Pedido</h2>
                <div className="space-y-2 font-body">
                    <div className="flex justify-between">
                        <span className="text-neutral-text-muted">Subtotal</span>
                        <span className="font-bold"> ${subtotal.toFixed(2)} </span>
                    </div>

                    <div className="border-t border-neutral-border my-2"></div>
                    <div className="flex justify-between text-xl">
                        <span className="font-bold text-brand-dark">Total</span>
                        <span className="font-bold text-brand-primary"> ${total.toFixed(2)} </span>
                    </div>
                </div>

                <button className="w-full mt-6 bg-brand-primary text-white font-bold font-body py-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg">Proceder al Pago</button>

            </div>

        </div>
    )
} 

export default CartPage