import { create } from 'zustand'
import useInventoryStore from './inventoryStore'

const useCartStore = create((set) => ({
    items: [],
    
    // Agregar producto al carrito o incrementar cantidad si ya existe
    addProduct: (product) => {
        const inventoryStore = useInventoryStore.getState()
        const baseProductId = typeof product.id === 'string' ? product.id.split('-')[0] : product.id // Obtener ID base sin timestamp
        
        // Verificar disponibilidad antes de agregar
        if (!inventoryStore.isAvailable(baseProductId)) {
            return false
        }
        
        set((state) => {
            // Para productos con opciones personalizadas, usar ID completo
            // Para productos normales, buscar por ID base
            const existingItem = state.items.find(item => {
                if (product.customOptions && Object.keys(product.customOptions).length > 0) {
                    return item.id === product.id && 
                           JSON.stringify(item.customOptions) === JSON.stringify(product.customOptions)
                } else {
                    // Para productos sin personalización, comparar solo el ID base
                    const itemBaseId = typeof item.id === 'string' ? item.id.split('-')[0] : item.id
                    return itemBaseId == baseProductId && 
                           (!item.customOptions || Object.keys(item.customOptions).length === 0)
                }
            });
            
            if (existingItem) {
                // Verificar si hay suficiente stock para incrementar
                const newQuantity = existingItem.quantity + (product.quantity || 1)
                if (!inventoryStore.isAvailable(baseProductId, newQuantity)) {
                    return state // No cambiar si no hay stock
                }
                
                return {
                    items: state.items.map(item =>
                        item.id === existingItem.id 
                            ? { ...item, quantity: newQuantity } 
                            : item
                    )
                };
            } else {
                // Verificar stock para nuevo producto
                if (!inventoryStore.isAvailable(baseProductId, product.quantity || 1)) {
                    return state
                }
                
                return {
                    items: [...state.items, { ...product, quantity: product.quantity || 1 }]
                };
            }
        })
        
        return true
    },

    increaseQuantity: (productId) => set((state) => ({
        items: state.items.map(item =>
            item.id === productId ? {...item, quantity: item.quantity +1 } : item
        ),
    })),
    decreaseQuantity: (productId) => set((state) => ({
        items: state.items
            .map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter(item => item.quantity > 0),
    })),
    removeProduct: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
    })),
    clearCart: () => set({ items: [] }),
}))


export default useCartStore;