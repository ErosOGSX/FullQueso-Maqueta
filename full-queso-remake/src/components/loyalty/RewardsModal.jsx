import React from 'react'
import { FiX, FiGift, FiStar } from 'react-icons/fi'
import useLoyaltyStore, { REWARDS } from '../../store/loyaltyStore'
import useNotificationStore from '../../store/notificationStore'

const RewardsModal = ({ isOpen, onClose }) => {
    const { points, redeemReward, getAvailableRewards, getUnusedRewards, getLevelInfo } = useLoyaltyStore()
    const { success, error } = useNotificationStore()
    
    const availableRewards = getAvailableRewards()
    const unusedRewards = getUnusedRewards()

    if (!isOpen) return null

    const handleRedeem = (rewardId) => {
        const result = redeemReward(rewardId)
        if (result.success) {
            const reward = REWARDS.find(r => r.id === rewardId)
            const message = result.code 
                ? `${reward.name} canjeada. Código: ${result.code}`
                : `${reward.name} agregada a tu cuenta`
            success('¡Recompensa Canjeada!', message)
        } else {
            error('Error', 'No tienes suficientes puntos')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-display-alt text-xl text-brand-dark">Full Pana - Recompensas</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-border rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-brand-yellow-light rounded-lg">
                        <FiStar className="text-brand-primary" size={20} />
                        <span className="font-body font-bold text-black">{points} puntos disponibles</span>
                    </div>

                    {unusedRewards.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-body font-bold text-brand-dark mb-3">Recompensas Canjeadas</h3>
                            <div className="space-y-2">
                                {unusedRewards.map((reward, index) => (
                                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <FiGift className="text-green-600" size={16} />
                                                <span className="font-body text-green-800">{reward.name}</span>
                                            </div>
                                            <span className="font-body text-xs text-green-600">Disponible</span>
                                        </div>
                                        {reward.code && (
                                            <div className="bg-white border border-green-300 rounded p-2 mt-2">
                                                <p className="font-body text-xs text-green-700 mb-1">Código:</p>
                                                <p className="font-mono text-sm font-bold text-green-800">{reward.code}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="font-body font-bold text-brand-dark mb-3">Canjear Puntos</h3>
                    <div className="space-y-3">
                        {REWARDS.map(reward => {
                            const canRedeem = points >= reward.points && 
                                (!reward.levelRequired || getLevelInfo().name.toLowerCase() === reward.levelRequired)
                            const isLevelLocked = reward.levelRequired && getLevelInfo().name.toLowerCase() !== reward.levelRequired
                            
                            return (
                                <div key={reward.id} className={`p-3 border rounded-lg ${
                                    canRedeem ? 'border-brand-primary' : 
                                    isLevelLocked ? 'border-yellow-400 bg-yellow-50' :
                                    'border-neutral-border opacity-50'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-body font-bold text-brand-dark">{reward.name}</h4>
                                            <p className="font-body text-sm text-neutral-text-muted">{reward.points} puntos</p>
                                            {reward.description && (
                                                <p className="font-body text-xs text-orange-600">{reward.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRedeem(reward.id)}
                                            disabled={!canRedeem}
                                            className={`px-4 py-2 rounded-lg font-body text-sm ${
                                                canRedeem 
                                                    ? 'bg-brand-primary text-white hover:bg-brand-secondary' 
                                                    : isLevelLocked
                                                    ? 'bg-yellow-400 text-yellow-800 cursor-not-allowed'
                                                    : 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                                            }`}
                                        >
                                            {isLevelLocked ? 'Nivel Oro Requerido' : 'Canjear'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RewardsModal