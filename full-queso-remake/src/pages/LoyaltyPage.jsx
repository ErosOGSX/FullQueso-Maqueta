import React, { useState } from 'react'
import { FiStar, FiGift, FiTrendingUp, FiCalendar, FiAward } from 'react-icons/fi'
import useLoyaltyStore, { ACHIEVEMENTS, CHALLENGES } from '../store/loyaltyStore'
import LoyaltyCard from '../components/loyalty/LoyaltyCard'
import RewardsModal from '../components/loyalty/RewardsModal'

const LoyaltyPage = () => {
    const { 
        points, 
        achievements, 
        activeChallenges, 
        getStats, 
        getLevelInfo,
        orderHistory 
    } = useLoyaltyStore()
    
    const [showRewards, setShowRewards] = useState(false)
    const stats = getStats()
    const levelInfo = getLevelInfo()

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="text-center mb-6">
                <h1 className="font-display text-3xl text-brand-dark mb-2">Full Pana</h1>
                <p className="font-body text-neutral-text-muted">
                    Gana puntos, desbloquea recompensas y disfruta beneficios exclusivos
                </p>
            </div>

            {/* Tarjeta principal */}
            <div className="mb-6">
                <LoyaltyCard />
                <button 
                    onClick={() => setShowRewards(true)}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark font-bold font-body py-3 rounded-lg hover:bg-brand-yellow-light transition-colors"
                >
                    <FiGift size={18} />
                    Ver Todas las Recompensas Full Pana
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border text-center">
                    <FiTrendingUp className="mx-auto mb-2 text-brand-primary" size={24} />
                    <p className="font-body text-2xl font-bold text-brand-dark">{stats.totalOrders}</p>
                    <p className="font-body text-sm text-neutral-text-muted">Pedidos</p>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <FiStar className="mx-auto mb-2 text-brand-yellow" size={24} />
                    <p className="font-body text-2xl font-bold text-brand-dark">{points}</p>
                    <p className="font-body text-sm text-neutral-text-muted">Puntos</p>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <FiCalendar className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="font-body text-2xl font-bold text-brand-dark">{stats.consecutiveOrders}</p>
                    <p className="font-body text-sm text-neutral-text-muted">Racha</p>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <FiAward className="mx-auto mb-2 text-purple-600" size={24} />
                    <p className="font-body text-2xl font-bold text-brand-dark">{achievements.length}</p>
                    <p className="font-body text-sm text-neutral-text-muted">Logros</p>
                </div>
            </div>

            {/* Logros */}
            <div className="mb-6">
                <h2 className="font-display-alt text-xl text-brand-dark mb-4">Mis Logros</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = achievements.includes(achievement.id)
                        return (
                            <div 
                                key={achievement.id}
                                className={`p-4 rounded-lg border ${
                                    isUnlocked 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{achievement.icon}</span>
                                    <div>
                                        <h3 className={`font-body font-bold ${
                                            isUnlocked ? 'text-green-800' : 'text-gray-600'
                                        }`}>
                                            {achievement.name}
                                        </h3>
                                        <p className={`font-body text-sm ${
                                            isUnlocked ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {achievement.description}
                                        </p>
                                        {isUnlocked && (
                                            <p className="font-body text-xs text-green-700 font-bold">
                                                +{achievement.points} puntos
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Desafíos activos */}
            <div className="mb-6">
                <h2 className="font-display-alt text-xl text-brand-dark mb-4">Desafíos Semanales</h2>
                <div className="space-y-3">
                    {CHALLENGES.map(challenge => (
                        <div key={challenge.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-body font-bold text-blue-800">{challenge.name}</h3>
                                    <p className="font-body text-sm text-blue-600">{challenge.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-body text-sm font-bold text-blue-800">+{challenge.reward} pts</p>
                                    <p className="font-body text-xs text-blue-600">{challenge.expires} días restantes</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Historial reciente */}
            <div>
                <h2 className="font-display-alt text-xl text-brand-dark mb-4">Historial Reciente</h2>
                <div className="space-y-2">
                    {orderHistory.slice(-5).reverse().map((order, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                            <div>
                                <p className="font-body text-sm text-brand-dark">
                                    Pedido de ${order.total.toFixed(2)}
                                </p>
                                <p className="font-body text-xs text-neutral-text-muted">
                                    {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-body text-sm font-bold text-green-600">
                                    +{order.points} pts
                                </p>
                            </div>
                        </div>
                    ))}
                    {orderHistory.length === 0 && (
                        <p className="text-center font-body text-neutral-text-muted py-8">
                            Aún no tienes pedidos. ¡Haz tu primera compra para empezar a ganar puntos!
                        </p>
                    )}
                </div>
            </div>

            <RewardsModal 
                isOpen={showRewards} 
                onClose={() => setShowRewards(false)} 
            />
        </div>
    )
}

export default LoyaltyPage