import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from '../store/cartStore';
import useUserDataStore from '../store/userDataStore';
import useOrdersStore from '../store/ordersStore';
import useSelectionStore from '../store/selectionStore';
import useNotificationStore from '../store/notificationStore';
import CartItem from "../components/cart/CartItem";
import PaymentModal from "../components/payment/PaymentModal";
import AddressCarousel from "../components/location/AddressCarousel";
import PriceDisplay from "../components/currency/PriceDisplay";
import ExchangeRateIndicator from "../components/currency/ExchangeRateIndicator";
import PromoCodeInput from "../components/cart/PromoCodeInput";
import BonusIndicator from "../components/loyalty/BonusIndicator";
import CartUpsell from "../components/upsell/CartUpsell";
import ExpressCheckout from "../components/cart/ExpressCheckout";
import SavedItems from "../components/cart/SavedItems";
import EstimatedTime from "../components/order/EstimatedTime";
import usePersistentCartStore from '../store/persistentCartStore';
import pushNotifications from '../utils/pushNotifications';
import { FiShoppingCart, FiUser } from "react-icons/fi";

const CartPage = () => {
    const navigate = useNavigate();
    const { items, clearCart } = useCartStore();
    const { userData, isDataComplete } = useUserDataStore();
    const { addOrder } = useOrdersStore();
    const { service, store } = useSelectionStore();
    const { success, error } = useNotificationStore();
    const { initializeDevice, syncWithServer } = usePersistentCartStore();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    // Inicializar carrito persistente
    React.useEffect(() => {
        initializeDevice();
        // syncWithServer deshabilitado para desarrollo
    }, [initializeDevice]);

    const subtotal = items.reduce((total, item) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
        const validPrice = isNaN(itemPrice) ? 0 : itemPrice;
        return total + validPrice * (item.quantity || 0);
    }, 0);
    const deliveryFee = subtotal >= 5 ? 0 : 2.50;
    const discount = appliedDiscount ? appliedDiscount.amount : 0;
    const taxRate = 0.12;
    const taxes = subtotal * taxRate;
    const total = Math.max(0, subtotal + deliveryFee + taxes - discount);

    if (items.length === 0) {
        return (
            <div className="container mx-auto text-center p-8 flex flex-col items-center gap-6">
                <FiShoppingCart size={80} className="text-neutral-border" aria-hidden="true" focusable="false" />
                <h1 className="font-display text-4xl text-brand-dark dark:text-white">Tu carrito está vacío</h1>
                <p className="font-body text-neutral-text-muted dark:text-gray-300 max-w-md">Parece que aún no has añadido ningún producto. ¡Explora nuestro menú y llénalo de sabor!</p>
                <Link to='/menu' className="bg-brand-primary text-white font-bold font-body py-3 px-6 rounded-lg hover:bg-brand-primary-light transition-colors">Volver al Menú</Link>            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-display text-4xl text-brand-dark dark:text-white">Mi Carrito</h1>
                <button onClick={clearCart} className="font-body text-sm text-red-500 hover:underline">Vaciar Carrito</button>
            </div>

            <div className="flex flex-col gap-4"> {items.map(item => (
                    <CartItem key={item.id} item={item} />
                ))} 
            </div>

            {/* Items guardados para después */}
            <SavedItems />

            {/* Recomendaciones de upselling */}
            <CartUpsell />

            {/* Carrusel de direcciones */}
            <div className="mt-6">
                <AddressCarousel />
            </div>

            <div className="mt-8 p-6 bg-neutral-surface dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-display-alt text-2xl text-brand-dark dark:text-white">Resumen del Pedido</h2>
                    <ExchangeRateIndicator />
                </div>
                
                <BonusIndicator />
                
                {/* Tiempo estimado */}
                <EstimatedTime items={items} showDetails={true} className="mb-4" />
                
                <div className="space-y-2 font-body">
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-text-muted dark:text-gray-300">Subtotal</span>
                        <PriceDisplay dollarAmount={subtotal} className="text-right" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-text-muted dark:text-gray-300">Delivery</span>
                        {deliveryFee === 0 ? (
                            <span className="font-bold text-green-600">GRATIS</span>
                        ) : (
                            <PriceDisplay dollarAmount={deliveryFee} className="text-right" />
                        )}
                    </div>
                    {subtotal >= 5 && deliveryFee === 0 && (
                        <p className="text-xs text-green-600 italic">¡Delivery gratis por compra mayor a $5!</p>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-text-muted dark:text-gray-300">Impuestos (12%)</span>
                        <PriceDisplay dollarAmount={taxes} className="text-right" />
                    </div>
                    {appliedDiscount && (
                        <div className="flex justify-between items-center">
                            <span className="text-green-600">Descuento ({appliedDiscount.code})</span>
                            <PriceDisplay dollarAmount={-discount} className="text-right text-green-600" />
                        </div>
                    )}
                    <div className="border-t border-neutral-border my-2"></div>
                    <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-brand-dark dark:text-white">Total</span>
                        <PriceDisplay dollarAmount={total} className="text-right text-brand-primary" />
                    </div>
                </div>

                {/* Checkout Express */}
                <ExpressCheckout 
                    total={total}
                    onSuccess={(result) => {
                        try {
                            const orderId = result.orderId;
                            const shortOrderId = orderId.slice(-6);
                            success('Pedido Confirmado', `¡Pedido #${shortOrderId} confirmado!`);
                            navigate('/ordenes');
                        } catch (error) {
                            console.error('Error processing express checkout:', error);
                        }
                    }}
                />

                {/* Código de descuento */}
                <div className="mb-4">
                    <PromoCodeInput 
                        onDiscountApplied={setAppliedDiscount}
                        appliedDiscount={appliedDiscount}
                        subtotal={subtotal}
                    />
                </div>

                {/* Información del usuario */}
                {isDataComplete() ? (
                    <div className="bg-neutral-surface dark:bg-slate-700 border-2 border-neutral-border dark:border-gray-600 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiUser className="text-brand-primary" />
                            <h3 className="font-body font-bold text-brand-dark dark:text-white">Datos de entrega</h3>
                        </div>
                        <p className="font-body text-sm text-neutral-text-muted dark:text-gray-300">
                            <strong>{userData.fullName}</strong> • {userData.phone}
                        </p>
                        {userData.deliveryAddress && (
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-2 mt-2">
                                <p className="font-body text-xs text-green-800 dark:text-green-200 font-bold">Dirección de entrega:</p>
                                <p className="font-body text-xs text-green-700 dark:text-green-300">{userData.deliveryAddress}</p>
                            </div>
                        )}
                        {userData.address && (
                            <p className="font-body text-sm text-neutral-text-muted dark:text-gray-300">{userData.address}</p>
                        )}
                        <Link to="/cuenta" className="text-brand-primary text-sm hover:underline">
                            Editar datos
                        </Link>
                    </div>
                ) : (
                    <div className="bg-brand-yellow-light dark:bg-yellow-900 border-2 border-brand-yellow-dark dark:border-yellow-700 rounded-lg p-4 mb-4">
                        <p className="font-body font-bold text-brand-dark dark:text-white mb-2">Completa tus datos para continuar</p>
                        <Link 
                            to="/cuenta" 
                            className="bg-brand-primary text-white font-bold font-body py-2 px-4 rounded-lg hover:bg-brand-primary-light transition-colors inline-block"
                        >
                            Agregar mis datos
                        </Link>
                    </div>
                )}

                <button 
                    onClick={() => {
                        if (!isDataComplete()) {
                            error('Datos Incompletos', 'Por favor completa tus datos en "Mi Cuenta" antes de continuar');
                            return;
                        }
                        setShowPaymentModal(true);
                    }}
                    disabled={!isDataComplete()}
                    className={`w-full mt-6 font-bold font-body py-3 rounded-lg transition-colors text-lg ${
                        isDataComplete() 
                            ? 'bg-brand-primary text-white hover:bg-brand-primary-light' 
                            : 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                    }`}
                >
                    {isDataComplete() ? 'Proceder al Pago' : 'Completa tus datos primero'}
                </button>

                <PaymentModal 
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    total={total}
                    onPaymentSuccess={() => {
                        try {
                            console.log('Processing payment success...', { items, total, userData, service, store });
                            
                            // Crear orden
                            const result = addOrder({
                                items: items,
                                total: total,
                                customerInfo: userData,
                                service: service,
                                store: store
                            });
                            
                            console.log('Order created:', result);
                            
                            const orderId = result.orderId || result; // Compatibilidad
                            const pointsEarned = result.pointsEarned || 0;
                            
                            // Limpiar carrito
                            clearCart();
                            
                            // Mostrar confirmación y navegar
                            const shortOrderId = orderId.slice(-6);
                            const message = pointsEarned > 0 
                                ? `¡Pedido #${shortOrderId} confirmado! Ganaste ${pointsEarned} puntos`
                                : `¡Pedido #${shortOrderId} confirmado para ${userData.fullName}!`;
                            success('Pedido Confirmado', message);
                            
                            // Simular notificaciones push del pedido
                            setTimeout(() => pushNotifications.simulateOrderNotification('confirmed', shortOrderId), 1000);
                            setTimeout(() => pushNotifications.simulateOrderNotification('preparing', shortOrderId), 5000);
                            setTimeout(() => pushNotifications.simulateOrderNotification('ready', shortOrderId), 15000);
                            setTimeout(() => pushNotifications.simulateOrderNotification('delivered', shortOrderId), 30000);
                            
                            navigate('/ordenes');
                        } catch (error) {
                            console.error('Error processing payment:', error);
                            error('Error de Pago', 'No se pudo procesar el pago. Intenta de nuevo');
                        }
                    }}
                />

            </div>

        </div>
    )
} 

export default CartPage