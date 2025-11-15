import React, { useEffect, useState } from 'react'
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi'

const Toast = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 10)
        
        // Start exit animation before removal
        const exitTimer = setTimeout(() => {
            setIsLeaving(true)
            setTimeout(() => onRemove(notification.id), 300)
        }, notification.duration - 300)

        return () => clearTimeout(exitTimer)
    }, [notification.duration, notification.id, onRemove])

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <FiCheck size={20} />
            case 'error': return <FiX size={20} />
            case 'warning': return <FiAlertTriangle size={20} />
            default: return <FiInfo size={20} />
        }
    }

    const getStyles = () => {
        const baseStyles = "border-l-4 shadow-lg"
        switch (notification.type) {
            case 'success': return `${baseStyles} bg-green-50 border-green-500 text-green-800`
            case 'error': return `${baseStyles} bg-red-50 border-red-500 text-red-800`
            case 'warning': return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`
            default: return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`
        }
    }

    const getIconColor = () => {
        switch (notification.type) {
            case 'success': return 'text-green-600'
            case 'error': return 'text-red-600'
            case 'warning': return 'text-yellow-600'
            default: return 'text-blue-600'
        }
    }

    return (
        <div
            className={`
                transform transition-all duration-300 ease-in-out mb-3 max-w-sm w-full
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                ${getStyles()}
                rounded-lg p-4 flex items-start gap-3
            `}
        >
            <div className={`flex-shrink-0 ${getIconColor()}`}>
                {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
                {notification.title && (
                    <h4 className="font-body font-bold text-sm mb-1">
                        {notification.title}
                    </h4>
                )}
                <p className="font-body text-sm">
                    {notification.message}
                </p>
            </div>
            
            <button
                onClick={() => {
                    setIsLeaving(true)
                    setTimeout(() => onRemove(notification.id), 300)
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <FiX size={16} />
            </button>
        </div>
    )
}

export default Toast