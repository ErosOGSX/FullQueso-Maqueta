import { create } from 'zustand'

const useCartStore = create ((set) => ({
    items: [],
    addProduct: (product) => set((state) =>{
        const existingItem = state.items.find(item => item.id === product.id);
        if (existingItem) {
            const updatedItems = state.item.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
            return { item: updatedItems };
        } else{
            const newItems = [...state.items, {...product, quantity: 1}];
            return {items: newItems};
        }
    }),

    icreaseQuantity: (productId) => set((state) => ({
        items: state.items.map(item =>
            item.id === productId ? {...item, quantity: item.quantity +1 } : item
        ),
    })),

    decreaseQuantity: (productId) => set((state) => ({
        items: state.items.map(item =>
            item.id === productId && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item
        ).filter(item => item.quantity > 0),
    })),

    removeProduct: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
    })),

    clearCart: () => set({ items: []}),


}))


export default useCartStore