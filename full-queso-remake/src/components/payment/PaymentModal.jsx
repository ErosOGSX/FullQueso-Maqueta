import React, { useState } from 'react'
import { FiX, FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi'
import SecurePaymentForm from './SecurePaymentForm'
import { useSecurityAudit } from '../../hooks/useSecurityAudit'

const PaymentModal = ({ isOpen, onClose, total, onPaymentSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [showSecureForm, setShowSecureForm] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const { logSecurityEvent } = useSecurityAudit()

    if (!isOpen) return null

    const handleSecurePayment = async (paymentData) => {
        try {
            logSecurityEvent('payment_attempt', {
                amount: total,
                method: 'card',
                encrypted: true
            });
            
            // Simulate secure payment processing
            setIsProcessing(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            logSecurityEvent('payment_success', {
                amount: total,
                token: paymentData.token
            });
            
            onPaymentSuccess();
            onClose();
        } catch (error) {
            logSecurityEvent('payment_error', {
                error: error.message,
                amount: total
            });
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayment = async () => {
        if (paymentMethod === 'card') {
            setShowSecureForm(true);
            return;
        }
        
        setIsProcessing(true);
        
        logSecurityEvent('payment_attempt', {
            amount: total,
            method: paymentMethod
        });
        
        // Simulate payment processing for non-card methods
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsProcessing(false);
        onPaymentSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="font-display-alt text-2xl text-brand-dark">Pagar Pedido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-border rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Total */}
                <div className="p-6 bg-brand-yellow-light">
                    <div className="text-center">
                        <p className="font-body text-brand-dark mb-2">Total a pagar</p>
                        <p className="font-display text-3xl text-brand-primary">${total.toFixed(2)}</p>
                    </div>
                </div>

                {/* Métodos de pago */}
                <div className="p-6">
                    <h3 className="font-body font-bold text-brand-dark mb-4">Método de pago</h3>
                    
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${
                                paymentMethod === 'card' 
                                    ? 'border-brand-primary bg-brand-primary text-white' 
                                    : 'border-neutral-border hover:bg-neutral-surface'
                            }`}
                        >
                            <FiCreditCard size={20} />
                            <span className="font-body font-bold">Tarjeta de Crédito/Débito</span>
                        </button>
                        
                        <button
                            onClick={() => setPaymentMethod('mobile')}
                            className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${
                                paymentMethod === 'mobile' 
                                    ? 'border-brand-primary bg-brand-primary text-white' 
                                    : 'border-neutral-border hover:bg-neutral-surface'
                            }`}
                        >
                            <FiSmartphone size={20} />
                            <span className="font-body font-bold">Pago Móvil</span>
                        </button>
                        
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${
                                paymentMethod === 'cash' 
                                    ? 'border-brand-primary bg-brand-primary text-white' 
                                    : 'border-neutral-border hover:bg-neutral-surface'
                            }`}
                        >
                            <FiDollarSign size={20} />
                            <span className="font-body font-bold">Pago en Efectivo</span>
                        </button>
                    </div>

                    {/* Secure Payment Form */}
                    {paymentMethod === 'card' && showSecureForm && (
                        <div className="mb-6">
                            <SecurePaymentForm
                                amount={total.toFixed(2)}
                                onPaymentSubmit={handleSecurePayment}
                                onCancel={() => setShowSecureForm(false)}
                            />
                        </div>
                    )}
                    
                    {/* Card payment notice */}
                    {paymentMethod === 'card' && !showSecureForm && (
                        <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-green-600">🔒</span>
                                <h4 className="font-body font-bold text-green-800">Pago 100% Seguro</h4>
                            </div>
                            <p className="font-body text-green-700 text-sm mb-3">
                                Tus datos de tarjeta están protegidos con encriptación de nivel bancario.
                            </p>
                            <ul className="font-body text-green-700 text-xs space-y-1">
                                <li>✓ Encriptación AES-256</li>
                                <li>✓ Validación en tiempo real</li>
                                <li>✓ Cumple con estándares PCI DSS</li>
                            </ul>
                        </div>
                    )}

                    {/* Datos para pago móvil */}
                    {paymentMethod === 'mobile' && (
                        <div className="bg-brand-yellow-light p-4 rounded-lg mb-6">
                            <h4 className="font-body font-bold text-brand-dark mb-3">Datos para Pago Móvil</h4>
                            <div className="space-y-2 text-sm font-body text-brand-dark">
                                <div className="flex justify-between">
                                    <span className="font-bold">Banco:</span>
                                    <span>Banco de Venezuela</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Teléfono:</span>
                                    <span>0414-1234567</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">RIF:</span>
                                    <span>J-12345678-9</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Titular:</span>
                                    <span>Full Queso C.A.</span>
                                </div>
                            </div>
                            <p className="font-body text-brand-dark text-xs mt-3 italic">
                                Realiza la transferencia y envía el comprobante por WhatsApp al +58 414-1234567
                            </p>
                        </div>
                    )}

                    {/* Mensaje para efectivo */}
                    {paymentMethod === 'cash' && (
                        <div className="bg-brand-yellow-light p-4 rounded-lg mb-6">
                            <p className="font-body text-brand-dark text-sm">
                                Pagarás en efectivo al recibir tu pedido. Asegúrate de tener el monto exacto.
                            </p>
                        </div>
                    )}

                    {/* Botón de pago */}
                    {!showSecureForm && (
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-lg font-body font-bold text-lg transition-colors ${
                                isProcessing
                                    ? 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                                    : 'bg-brand-primary text-white hover:bg-brand-primary-light'
                            }`}
                        >
                            {isProcessing ? 'Procesando...' : 
                             paymentMethod === 'card' ? 'Continuar con Pago Seguro' : 
                             `Pagar $${total.toFixed(2)}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentModal