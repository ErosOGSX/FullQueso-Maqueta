import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePromotionsStore = create(
  persist(
    (set, get) => ({
      activePromotions: [
        {
          id: 'weekend-2x1',
          name: '2x1 Tequeños Fin de Semana',
          description: 'Lleva 2 paga 1 en tequeños clásicos',
          type: 'buy-get',
          conditions: { buyQuantity: 2, getQuantity: 1, productIds: ['tequeño-clasico'] },
          validDays: [0, 6], // Domingo y Sábado
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          active: true
        },
        {
          id: 'combo-discount',
          name: '15% OFF Combos',
          description: '15% de descuento en todos los combos',
          type: 'percentage',
          conditions: { discount: 15, categories: ['combos'] },
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          active: true
        },
        {
          id: 'free-delivery-25',
          name: 'Delivery Gratis +$25',
          description: 'Delivery gratis en pedidos mayores a $25',
          type: 'free-delivery',
          conditions: { minAmount: 25 },
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          active: true
        }
      ],
      
      coupons: [
        {
          code: 'BIENVENIDO10',
          name: '10% Descuento Bienvenida',
          discount: 10,
          type: 'percentage',
          minAmount: 15,
          maxUses: 1,
          usedBy: [],
          expiryDate: '2024-12-31',
          active: true
        },
        {
          code: 'VIERNES20',
          name: '20% OFF Viernes',
          discount: 20,
          type: 'percentage',
          minAmount: 30,
          validDays: [5], // Solo viernes
          maxUses: 100,
          usedBy: [],
          expiryDate: '2024-12-31',
          active: true
        }
      ],
      
      // Verificar si una promoción es válida
      isPromotionValid: (promotionId) => {
        const promotion = get().activePromotions.find(p => p.id === promotionId)
        if (!promotion || !promotion.active) return false
        
        const now = new Date()
        const startDate = new Date(promotion.startDate)
        const endDate = new Date(promotion.endDate)
        
        if (now < startDate || now > endDate) return false
        
        // Verificar días válidos
        if (promotion.validDays && !promotion.validDays.includes(now.getDay())) {
          return false
        }
        
        return true
      },
      
      // Aplicar promociones a un carrito
      applyPromotions: (cartItems, subtotal) => {
        const validPromotions = get().activePromotions.filter(p => 
          get().isPromotionValid(p.id)
        )
        
        let totalDiscount = 0
        let appliedPromotions = []
        
        validPromotions.forEach(promotion => {
          switch (promotion.type) {
            case 'percentage':
              if (promotion.conditions.categories) {
                const categoryItems = cartItems.filter(item => 
                  promotion.conditions.categories.includes(item.category)
                )
                if (categoryItems.length > 0) {
                  const categoryTotal = categoryItems.reduce((sum, item) => 
                    sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0
                  )
                  const discount = categoryTotal * (promotion.conditions.discount / 100)
                  totalDiscount += discount
                  appliedPromotions.push({ ...promotion, discount })
                }
              }
              break
              
            case 'free-delivery':
              if (subtotal >= promotion.conditions.minAmount) {
                appliedPromotions.push({ ...promotion, discount: 2.5 })
              }
              break
          }
        })
        
        return { totalDiscount, appliedPromotions }
      },
      
      // Validar cupón
      validateCoupon: (code, subtotal, userId = 'guest') => {
        const coupon = get().coupons.find(c => c.code === code && c.active)
        if (!coupon) return { valid: false, message: 'Cupón no válido' }
        
        // Verificar fecha de expiración
        if (new Date() > new Date(coupon.expiryDate)) {
          return { valid: false, message: 'Cupón expirado' }
        }
        
        // Verificar monto mínimo
        if (coupon.minAmount && subtotal < coupon.minAmount) {
          return { valid: false, message: `Monto mínimo $${coupon.minAmount}` }
        }
        
        // Verificar día válido
        if (coupon.validDays && !coupon.validDays.includes(new Date().getDay())) {
          return { valid: false, message: 'Cupón no válido hoy' }
        }
        
        // Verificar usos máximos
        if (coupon.maxUses && coupon.usedBy.length >= coupon.maxUses) {
          return { valid: false, message: 'Cupón agotado' }
        }
        
        // Verificar si ya fue usado por este usuario
        if (coupon.usedBy.includes(userId)) {
          return { valid: false, message: 'Ya usaste este cupón' }
        }
        
        return { valid: true, coupon }
      },
      
      // Usar cupón
      useCoupon: (code, userId = 'guest') => {
        set(state => ({
          coupons: state.coupons.map(coupon =>
            coupon.code === code
              ? { ...coupon, usedBy: [...coupon.usedBy, userId] }
              : coupon
          )
        }))
      }
    }),
    {
      name: 'promotions-storage'
    }
  )
)

export default usePromotionsStore