import React from 'react'
import { FiX, FiInfo, FiPhone, FiMapPin, FiHelpCircle, FiDollarSign, FiStar, FiShare2, FiFileText, FiShield } from 'react-icons/fi'
import useExchangeRateStore from '../../store/exchangeRateStore'

const MobileMenu = ({ isOpen, onClose }) => {
    const { currency, toggleCurrency } = useExchangeRateStore()

    if (!isOpen) return null

    const menuItems = [
        {
            icon: FiInfo,
            label: 'Sobre FullQueso',
            action: () => {
                window.open('https://fullqueso.com/about', '_blank')
                onClose()
            }
        },
        {
            icon: FiPhone,
            label: 'Contacto',
            action: () => {
                window.open('https://wa.me/584241234567?text=Hola, necesito ayuda con mi pedido', '_blank')
                onClose()
            }
        },
        {
            icon: FiMapPin,
            label: 'Ubicaciones',
            action: () => {
                window.open('https://maps.google.com/?q=FullQueso+Caracas', '_blank')
                onClose()
            }
        },
        {
            icon: FiHelpCircle,
            label: 'Preguntas Frecuentes',
            action: () => {
                window.open('https://fullqueso.com/faq', '_blank')
                onClose()
            }
        },

        {
            icon: FiDollarSign,
            label: `Moneda: ${currency}`,
            action: () => {
                toggleCurrency()
            }
        },
        {
            icon: FiStar,
            label: 'Calificar App',
            action: () => {
                if (navigator.userAgent.includes('iPhone')) {
                    window.open('https://apps.apple.com/app/fullqueso', '_blank')
                } else {
                    window.open('https://play.google.com/store/apps/details?id=com.fullqueso', '_blank')
                }
                onClose()
            }
        },
        {
            icon: FiShare2,
            label: 'Compartir App',
            action: () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'FullQueso - Delivery de Tequeños',
                        text: '¡Prueba la mejor app de delivery de tequeños en Venezuela!',
                        url: window.location.origin
                    })
                } else {
                    const shareUrl = `https://wa.me/?text=${encodeURIComponent('¡Prueba FullQueso! La mejor app de delivery de tequeños: ' + window.location.origin)}`
                    window.open(shareUrl, '_blank')
                }
                onClose()
            }
        },
        {
            icon: FiFileText,
            label: 'Términos y Condiciones',
            action: () => {
                window.open('https://fullqueso.com/terms', '_blank')
                onClose()
            }
        },
        {
            icon: FiShield,
            label: 'Política de Privacidad',
            action: () => {
                window.open('https://fullqueso.com/privacy', '_blank')
                onClose()
            }
        }
    ]

    return (
        <div className="fixed inset-0 z-50 md:hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-neutral-border">
                    <h2 className="font-display-alt text-xl text-brand-dark">Menú</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-border rounded-full transition-colors"
                    >
                        <FiX size={20} className="text-brand-dark" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-display-alt text-lg">FQ</span>
                            </div>
                            <div>
                                <h3 className="font-display-alt text-lg text-brand-dark">FullQueso</h3>
                                <p className="font-body text-sm text-neutral-text-muted">Delivery de Tequeños</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-border transition-colors text-left"
                            >
                                <item.icon size={20} className="text-brand-primary" />
                                <span className="font-body text-brand-dark">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-4 border-t border-neutral-border">
                        <p className="font-body text-xs text-neutral-text-muted text-center">
                            FullQueso v1.0.0
                        </p>
                        <p className="font-body text-xs text-neutral-text-muted text-center mt-1">
                            © 2024 FullQueso. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileMenu