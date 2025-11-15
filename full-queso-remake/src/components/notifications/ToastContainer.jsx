import React from 'react'
import useNotificationStore from '../../store/notificationStore'
import Toast from './Toast'

const ToastContainer = () => {
    const { notifications, removeNotification } = useNotificationStore()

    if (notifications.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end">
            {notifications.map(notification => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                />
            ))}
        </div>
    )
}

export default ToastContainer