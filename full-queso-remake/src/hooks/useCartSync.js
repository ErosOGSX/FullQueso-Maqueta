import { useEffect } from 'react'
import usePersistentCartStore from '../store/persistentCartStore'

const useCartSync = () => {
    const { syncWithServer, initializeDevice, scheduleReminders } = usePersistentCartStore()

    useEffect(() => {
        // Inicializar dispositivo al cargar
        initializeDevice()

        // Programar recordatorios iniciales
        scheduleReminders()

        // En desarrollo, no sincronizar con servidor
        // En producción, descomentar las líneas de sincronización
        
        return () => {
            // Cleanup si es necesario
        }
    }, [initializeDevice, scheduleReminders])

    // Suscribirse a cambios en el carrito para reprogramar recordatorios
    useEffect(() => {
        const unsubscribe = usePersistentCartStore.subscribe(
            (state) => state.items,
            (items) => {
                if (items.length > 0) {
                    scheduleReminders()
                }
            }
        )

        return unsubscribe
    }, [scheduleReminders])
}

export default useCartSync