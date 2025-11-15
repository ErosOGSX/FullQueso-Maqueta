import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
    notifications: [],
    
    addNotification: (notification) => {
        const id = Date.now().toString()
        const newNotification = {
            id,
            type: 'info', // 'success', 'error', 'warning', 'info'
            title: '',
            message: '',
            duration: 4000,
            ...notification
        }
        
        set(state => ({
            notifications: [...state.notifications, newNotification]
        }))
        
        // Auto remove after duration
        setTimeout(() => {
            get().removeNotification(id)
        }, newNotification.duration)
        
        return id
    },
    
    removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),
    
    clearAll: () => set({ notifications: [] }),
    
    // Helper methods for different types
    success: (title, message, duration = 4000) => 
        get().addNotification({ type: 'success', title, message, duration }),
    
    error: (title, message, duration = 5000) => 
        get().addNotification({ type: 'error', title, message, duration }),
    
    warning: (title, message, duration = 4000) => 
        get().addNotification({ type: 'warning', title, message, duration }),
    
    info: (title, message, duration = 4000) => 
        get().addNotification({ type: 'info', title, message, duration })
}))

export default useNotificationStore