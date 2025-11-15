import React from 'react'
import { FiClock, FiTruck, FiUser } from 'react-icons/fi'
import useEstimatedTimeStore from '../../store/estimatedTimeStore'

const EstimatedTime = ({ items, showDetails = false, className = "" }) => {
    const { getTotalEstimatedTime, getTimeRange, formatTime } = useEstimatedTimeStore()
    
    if (!items || items.length === 0) return null

    const timeEstimate = getTotalEstimatedTime(items)

    if (showDetails) {
        return (
            <div className={`bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center gap-2 mb-3">
                    <FiClock className="text-blue-600" size={16} />
                    <h3 className="font-body font-bold text-blue-800">Tiempo Estimado</h3>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiUser className="text-orange-500" size={14} />
                            <span className="font-body text-sm text-blue-700">Preparación:</span>
                        </div>
                        <span className="font-body font-bold text-sm text-blue-800">
                            {getTimeRange(timeEstimate.preparation)}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiTruck className="text-green-500" size={14} />
                            <span className="font-body text-sm text-blue-700">Delivery:</span>
                        </div>
                        <span className="font-body font-bold text-sm text-blue-800">
                            {getTimeRange(timeEstimate.delivery)}
                        </span>
                    </div>
                    
                    <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="font-body font-bold text-blue-800">Tiempo Total:</span>
                            <span className="font-body font-bold text-lg text-blue-900">
                                {getTimeRange(timeEstimate.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Vista compacta
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <FiClock className="text-blue-600" size={16} />
            <span className="font-body text-sm text-blue-700">
                Tiempo estimado: 
            </span>
            <span className="font-body font-bold text-sm text-blue-800">
                {getTimeRange(timeEstimate.total)}
            </span>
        </div>
    )
}

export default EstimatedTime