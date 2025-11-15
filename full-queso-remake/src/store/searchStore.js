import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSearchStore = create(
    persist(
        (set, get) => ({
            searchHistory: [],
            popularSearches: ['tequeños', 'pastelitos', 'churros', 'empanadas', 'combo'],
            
            addToHistory: (term) => {
                if (!term.trim()) return
                
                const { searchHistory } = get()
                const cleanTerm = term.trim().toLowerCase()
                
                // Remover si ya existe y agregarlo al inicio
                const newHistory = [cleanTerm, ...searchHistory.filter(item => item !== cleanTerm)]
                    .slice(0, 10) // Mantener solo los últimos 10
                
                set({ searchHistory: newHistory })
            },
            
            clearHistory: () => set({ searchHistory: [] }),
            
            removeFromHistory: (term) => {
                const { searchHistory } = get()
                set({ searchHistory: searchHistory.filter(item => item !== term) })
            }
        }),
        {
            name: 'search-storage'
        }
    )
)

export default useSearchStore