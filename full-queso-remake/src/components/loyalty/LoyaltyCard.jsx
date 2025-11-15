import React from 'react'
import { FiStar, FiGift } from 'react-icons/fi'
import useLoyaltyStore from '../../store/loyaltyStore'

const LoyaltyCard = ({ compact = false }) => {
    const { points, getLevelInfo } = useLoyaltyStore()
    const levelInfo = getLevelInfo()

    if (compact) {
        return (
            <div className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-red-600 p-2 rounded-lg text-white">
                <FiStar size={16} style={{ color: levelInfo.color }} />
                <span className="font-body text-sm font-bold">{points} pts</span>
                <span className="font-body text-xs opacity-80">{levelInfo.name}</span>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-r from-brand-primary to-red-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FiStar size={20} style={{ color: levelInfo.color }} />
                    <span className="font-display-alt text-lg">{levelInfo.name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiGift size={16} />
                    <span className="font-body text-sm">{points} puntos</span>
                </div>
            </div>
            
            {levelInfo.nextLevel && (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span>Progreso a {levelInfo.nextLevel.name}</span>
                        <span>{levelInfo.pointsToNext} pts restantes</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${levelInfo.progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoyaltyCard