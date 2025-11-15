import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUpsellStore = create(
    persist(
        (set, get) => ({
            // Datos de productos frecuentemente comprados juntos
            frequentlyBoughtTogether: {
                'tequeños-clasicos': ['salsa-guasacaca', 'refresco-coca-cola'],
                'pastelitos-carne': ['tequeños-clasicos', 'salsa-guasacaca'],
                'churros-rellenos': ['refresco-coca-cola', 'helado-vainilla'],
                'empanadas-pollo': ['tequeños-clasicos', 'salsa-guasacaca'],
                'combo-familiar': ['refresco-coca-cola', 'salsa-guasacaca'],
            },

            // Combos sugeridos automáticos
            suggestedCombos: [
                {
                    id: 'combo-tequeños-salsa',
                    name: 'Combo Tequeños + Salsa',
                    products: ['tequeños-clasicos', 'salsa-guasacaca'],
                    originalPrice: 8.50,
                    comboPrice: 7.50,
                    savings: 1.00,
                    description: '10 Tequeños + Salsa Guasacaca'
                },
                {
                    id: 'combo-pastelitos-bebida',
                    name: 'Combo Pastelitos + Bebida',
                    products: ['pastelitos-carne', 'refresco-coca-cola'],
                    originalPrice: 7.00,
                    comboPrice: 6.00,
                    savings: 1.00,
                    description: '5 Pastelitos + Refresco'
                },
                {
                    id: 'combo-churros-helado',
                    name: 'Combo Churros + Helado',
                    products: ['churros-rellenos', 'helado-vainilla'],
                    originalPrice: 9.00,
                    comboPrice: 8.00,
                    savings: 1.00,
                    description: 'Churros Rellenos + Helado'
                }
            ],

            // Descuentos por volumen
            volumeDiscounts: {
                'tequeños-clasicos': [
                    { quantity: 2, discount: 0.10, label: '10% OFF en 2+ unidades' },
                    { quantity: 3, discount: 0.15, label: '15% OFF en 3+ unidades' }
                ],
                'pastelitos-carne': [
                    { quantity: 2, discount: 0.12, label: '12% OFF en 2+ combos' }
                ],
                'empanadas-pollo': [
                    { quantity: 2, discount: 0.10, label: '10% OFF en 2+ unidades' }
                ]
            },

            // Obtener productos relacionados
            getRelatedProducts: (productId) => {
                const { frequentlyBoughtTogether } = get()
                return frequentlyBoughtTogether[productId] || []
            },

            // Obtener combos sugeridos para un producto
            getSuggestedCombos: (productId) => {
                const { suggestedCombos } = get()
                return suggestedCombos.filter(combo => 
                    combo.products.includes(productId)
                )
            },

            // Obtener descuento por volumen
            getVolumeDiscount: (productId, quantity) => {
                const { volumeDiscounts } = get()
                const discounts = volumeDiscounts[productId] || []
                
                // Encontrar el mayor descuento aplicable
                let applicableDiscount = null
                for (const discount of discounts.reverse()) {
                    if (quantity >= discount.quantity) {
                        applicableDiscount = discount
                        break
                    }
                }
                
                return applicableDiscount
            },

            // Calcular precio con descuento por volumen
            calculateVolumePrice: (basePrice, productId, quantity) => {
                const discount = get().getVolumeDiscount(productId, quantity)
                if (!discount) return basePrice * quantity
                
                const discountAmount = basePrice * quantity * discount.discount
                return (basePrice * quantity) - discountAmount
            }
        }),
        {
            name: 'upsell-storage'
        }
    )
)

export default useUpsellStore