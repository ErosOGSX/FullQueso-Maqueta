import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useInventoryStore = create(
  persist(
    (set, get) => ({
      inventory: {
        // Tequeños
        '1': { stock: 8, minStock: 2 },  // Tequeños Clásicos (20 unidades)
        '2': { stock: 6, minStock: 1 },  // Tequeños Mini (10 unidades)
        '3': { stock: 3, minStock: 1 },  // Tequeños Jumbo (60 unidades)
        
        // Churros
        '4': { stock: 7, minStock: 2 },  // Churros con Nutella (15 unidades)
        '5': { stock: 5, minStock: 1 },  // Churros con Azúcar (12 unidades)
        '6': { stock: 4, minStock: 1 },  // Churros Rellenos (8 unidades)
        
        // Pastelitos
        '7': { stock: 6, minStock: 2 },  // Pastelitos (5 unidades)
        '8': { stock: 12, minStock: 3 }, // Pastelito (1 unidad)
        
        // Bebidas
        '10': { stock: 8, minStock: 2 }, // Té Lipton
        '11': { stock: 10, minStock: 3 }, // Refresco Lata
        '12': { stock: 6, minStock: 2 }, // Gatorade
        '13': { stock: 15, minStock: 5 }, // Agua Mineral
        
        // Quesos
        '14': { stock: 4, minStock: 1 }, // Queso Blanco (1kg)
        '15': { stock: 5, minStock: 1 }, // Queso Llanero (500g)
        
        // Party Box
        '16': { stock: 3, minStock: 1 }, // Party Box Familiar
        '17': { stock: 2, minStock: 1 }, // Party Box Grande
        
        // Promos
        '18': { stock: 4, minStock: 1 }, // Combo Resuelve
        '19': { stock: 3, minStock: 1 }  // Combo Merienda Duo
      },
      
      // Reducir stock al hacer pedido
      reduceStock: (productId, quantity = 1) => {
        set(state => {
          const currentStock = state.inventory[productId]?.stock || 0
          if (currentStock >= quantity) {
            return {
              inventory: {
                ...state.inventory,
                [productId]: {
                  ...state.inventory[productId],
                  stock: currentStock - quantity
                }
              }
            }
          }
          return state
        })
      },
      
      // Verificar disponibilidad
      isAvailable: (productId, quantity = 1) => {
        const item = get().inventory[productId]
        return item && item.stock >= quantity
      },
      
      // Obtener stock actual
      getStock: (productId) => {
        return get().inventory[productId]?.stock || 0
      },
      
      // Verificar si está en stock bajo
      isLowStock: (productId) => {
        const item = get().inventory[productId]
        return item && item.stock <= item.minStock
      },
      
      // Obtener productos agotados
      getOutOfStock: () => {
        const inventory = get().inventory
        return Object.keys(inventory).filter(id => inventory[id].stock === 0)
      },
      
      // Obtener productos con stock bajo
      getLowStock: () => {
        const inventory = get().inventory
        return Object.keys(inventory).filter(id => 
          inventory[id].stock > 0 && inventory[id].stock <= inventory[id].minStock
        )
      },
      
      // Reponer stock (para simulación)
      restockItem: (productId, quantity) => {
        set(state => ({
          inventory: {
            ...state.inventory,
            [productId]: {
              ...state.inventory[productId],
              stock: (state.inventory[productId]?.stock || 0) + quantity
            }
          }
        }))
      }
    }),
    {
      name: 'inventory-storage'
    }
  )
)

export default useInventoryStore