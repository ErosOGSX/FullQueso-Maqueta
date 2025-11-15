import React from 'react'
import { FiClock, FiCalendar, FiGift } from 'react-icons/fi'

const BonusIndicator = () => {
    const now = new Date()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    const isHappyHour = now.getHours() >= 15 && now.getHours() <= 18
    const isBirthday = now.getDate() === 15 && now.getMonth() === 11 // Simulación

    const activeBonuses = []
    
    if (isWeekend) {
        activeBonuses.push({
            icon: FiCalendar,
            text: '¡Fin de Semana! +50% puntos',
            color: 'text-purple-600 bg-purple-50 border-purple-200'
        })
    }
    
    if (isHappyHour) {
        activeBonuses.push({
            icon: FiClock,
            text: '¡Happy Hour! +20% puntos',
            color: 'text-orange-600 bg-orange-50 border-orange-200'
        })
    }
    
    if (isBirthday) {
        activeBonuses.push({
            icon: FiGift,
            text: '¡Feliz Cumpleaños! Doble puntos',
            color: 'text-pink-600 bg-pink-50 border-pink-200'
        })
    }

    if (activeBonuses.length === 0) return null

    return (
        <div className="space-y-2 mb-4">
            {activeBonuses.map((bonus, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${bonus.color}`}>
                    <bonus.icon size={16} />
                    <span className="font-body text-sm font-bold">{bonus.text}</span>
                </div>
            ))}
        </div>
    )
}

export default BonusIndicator