import React, { useState } from 'react'
import { FiTag, FiCheck } from 'react-icons/fi'
import useLoyaltyStore from '../../store/loyaltyStore'
import useNotificationStore from '../../store/notificationStore'

const PromoCodeInput = ({ onDiscountApplied, appliedDiscount, subtotal }) => {
    const [code, setCode] = useState('')
    const { getUnusedRewards, useReward } = useLoyaltyStore()
    const { success, error } = useNotificationStore()

    const handleApplyCode = () => {
        if (!code.trim()) return

        const unusedRewards = getUnusedRewards()
        const validReward = unusedRewards.find(reward => 
            reward.code && reward.code.toLowerCase() === code.toLowerCase()
        )

        if (validReward) {
            // Validar monto mínimo
            const minAmount = validReward.value === 5 ? 10 : validReward.value === 10 ? 20 : 0
            if (subtotal < minAmount) {
                error('Monto Insuficiente', `Necesitas al menos $${minAmount} para usar este descuento`)
                return
            }
            
            useReward(validReward.id)
            onDiscountApplied({
                code: validReward.code,
                amount: validReward.value,
                name: validReward.name
            })
            success('¡Código Aplicado!', `Descuento de $${validReward.value} aplicado`)
            setCode('')
        } else {
            error('Código Inválido', 'El código no existe o ya fue usado')
        }
    }

    const handleRemoveDiscount = () => {
        onDiscountApplied(null)
        setCode('')
    }

    if (appliedDiscount) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center gap-2">
                    <FiCheck className="text-green-600" size={16} />
                    <span className="font-body text-green-800 dark:text-green-200 text-sm">
                        {appliedDiscount.name} aplicado
                    </span>
                </div>
                <button 
                    onClick={handleRemoveDiscount}
                    className="font-body text-xs text-red-500 hover:underline"
                >
                    Remover
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <label className="font-body font-bold text-brand-dark dark:text-white text-sm">Código de Descuento</label>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text-muted" size={16} />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Ingresa tu código"
                        className="w-full pl-10 pr-3 py-2 font-body border border-neutral-border dark:border-gray-600 bg-white dark:bg-slate-700 text-brand-dark dark:text-white rounded-lg focus:border-brand-primary focus:outline-none"
                    />
                </div>
                <button
                    onClick={handleApplyCode}
                    disabled={!code.trim()}
                    className={`px-4 py-2 font-body text-sm rounded-lg transition-colors ${
                        code.trim()
                            ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                            : 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                    }`}
                >
                    Aplicar
                </button>
            </div>
        </div>
    )
}

export default PromoCodeInput