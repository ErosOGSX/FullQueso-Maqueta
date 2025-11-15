import React from 'react'
import useExchangeRateStore from '../../store/exchangeRateStore'

const PriceDisplay = ({ dollarAmount, showBoth = true, className = "" }) => {
    const { convertToBolivares, formatBolivares } = useExchangeRateStore()
    
    const bolivarAmount = convertToBolivares(dollarAmount)
    
    if (!showBoth) {
        return (
            <span className={className}>
                ${dollarAmount.toFixed(2)}
            </span>
        )
    }
    
    return (
        <div className={className}>
            <span className="font-bold text-brand-dark dark:text-white">${dollarAmount.toFixed(2)}</span>
            <span className="text-sm text-neutral-text-muted block">
                Bs. {formatBolivares(bolivarAmount)}
            </span>
        </div>
    )
}

export default PriceDisplay