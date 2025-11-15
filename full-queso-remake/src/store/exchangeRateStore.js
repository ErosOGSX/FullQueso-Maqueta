import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useExchangeRateStore = create(
    persist(
        (set, get) => ({
            exchangeRate: 233.04, // Tasa inicial actualizada
            lastUpdated: null,
            isLoading: false,
            error: null,
            currency: 'USD',

            toggleCurrency: () => {
                set(state => ({
                    currency: state.currency === 'USD' ? 'VES' : 'USD'
                }))
            },

            updateExchangeRate: async () => {
                set({ isLoading: true, error: null })
                
                try {
                    // Usar API gratuita de ExchangeRate-API
                    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
                    const data = await response.json()
                    
                    // Si no hay VES, usar API alternativa
                    let rate = data.rates?.VES || data.rates?.VEF
                    
                    if (!rate) {
                        // API alternativa: Fixer.io (gratuita con límites)
                        const fallbackResponse = await fetch('https://api.fixer.io/latest?base=USD&symbols=VES')
                        const fallbackData = await fallbackResponse.json()
                        rate = fallbackData.rates?.VES
                    }
                    
                    if (!rate) {
                        // Si ambas APIs fallan, usar tasa actual conocida
                        rate = 233.04
                    }
                    
                    set({
                        exchangeRate: parseFloat(rate.toFixed(2)),
                        lastUpdated: new Date().toISOString(),
                        isLoading: false
                    })
                } catch (error) {
                    console.error('Error fetching exchange rate:', error)
                    // Usar tasa de respaldo si falla la API
                    set({
                        exchangeRate: 233.04,
                        lastUpdated: new Date().toISOString(),
                        isLoading: false,
                        error: 'Usando tasa de respaldo'
                    })
                }
            },

            convertToBolivares: (dollarAmount) => {
                const rate = get().exchangeRate
                return (dollarAmount * rate).toFixed(2)
            },

            formatBolivares: (amount) => {
                return new Intl.NumberFormat('es-VE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(amount)
            }
        }),
        {
            name: 'full-queso-exchange-rate',
            partialize: (state) => ({ 
                exchangeRate: state.exchangeRate, 
                lastUpdated: state.lastUpdated 
            })
        }
    )
)

export default useExchangeRateStore