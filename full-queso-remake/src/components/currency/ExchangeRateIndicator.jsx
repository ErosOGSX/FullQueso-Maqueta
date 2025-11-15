import React from 'react'
import useExchangeRateStore from '../../store/exchangeRateStore'
import { FiRefreshCw } from 'react-icons/fi'

const ExchangeRateIndicator = () => {
    const { exchangeRate, lastUpdated, isLoading, updateExchangeRate } = useExchangeRateStore()
    
    const formatLastUpdated = () => {
        if (!lastUpdated) return 'No actualizado'
        
        const date = new Date(lastUpdated)
        const now = new Date()
        const diffMinutes = Math.floor((now - date) / (1000 * 60))
        
        if (diffMinutes < 1) return 'Ahora'
        if (diffMinutes < 60) return `Hace ${diffMinutes}m`
        
        const diffHours = Math.floor(diffMinutes / 60)
        if (diffHours < 24) return `Hace ${diffHours}h`
        
        return date.toLocaleDateString('es-VE')
    }
    
    return (
        <div className="flex items-center gap-2 text-xs text-neutral-text-muted">
            <span>1 USD = {exchangeRate} Bs.</span>
            <button
                onClick={updateExchangeRate}
                disabled={isLoading}
                className="flex items-center gap-1 hover:text-brand-primary transition-colors"
                title="Actualizar tasa"
            >
                <FiRefreshCw 
                    size={12} 
                    className={isLoading ? 'animate-spin' : ''} 
                />
                {formatLastUpdated()}
            </button>
        </div>
    )
}

export default ExchangeRateIndicator