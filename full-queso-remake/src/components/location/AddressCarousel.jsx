import React, { useState } from 'react'
import { FiHome, FiPlus, FiCheck, FiBriefcase } from 'react-icons/fi'
import useUserDataStore from '../../store/userDataStore'
import useNotificationStore from '../../store/notificationStore'
import LocationPicker from './LocationPicker'

const AddressCarousel = () => {
    const { userData, selectSavedAddress, updateUserData } = useUserDataStore()
    const { success } = useNotificationStore()
    const [showAddAddress, setShowAddAddress] = useState(false)
    const [editingPreset, setEditingPreset] = useState(null) // 'home', 'work', or null
    
    // Validación de datos para evitar errores
    if (!userData) {
        return (
            <div className="mb-4">
                <h3 className="font-body font-bold text-brand-dark mb-3 flex items-center gap-2">
                    <FiHome size={18} />
                    Dirección de entrega
                </h3>
                <div className="p-4 bg-neutral-surface rounded-lg">
                    <p className="font-body text-neutral-text-muted text-sm">Cargando direcciones...</p>
                </div>
            </div>
        )
    }
    
    const savedAddresses = Array.isArray(userData.savedAddresses) ? userData.savedAddresses : []
    const currentDeliveryAddress = userData.deliveryAddress || ''
    const homeAddress = userData.homeAddress || ''
    const workAddress = userData.workAddress || ''

    const handleSelectAddress = (addressId) => {
        selectSavedAddress(addressId)
    }

    const handleAddressAdded = (locationData) => {
        if (editingPreset === 'home') {
            updateUserData({ 
                homeAddress: locationData.address,
                deliveryAddress: locationData.address,
                deliveryCoords: locationData.coords
            })
            setEditingPreset(null)
            success('Casa Actualizada', 'Tu dirección de casa se ha guardado correctamente')
        } else if (editingPreset === 'work') {
            updateUserData({ 
                workAddress: locationData.address,
                deliveryAddress: locationData.address,
                deliveryCoords: locationData.coords
            })
            setEditingPreset(null)
            success('Trabajo Actualizado', 'Tu dirección de trabajo se ha guardado correctamente')
        } else {
            setShowAddAddress(false)
        }
    }

    const handleSelectPresetAddress = (type) => {
        const address = type === 'home' ? homeAddress : workAddress
        if (address) {
            updateUserData({ 
                deliveryAddress: address,
                deliveryCoords: { lat: 10.4806, lng: -66.9036 } // Mock coords
            })
        } else {
            setEditingPreset(type)
        }
    }

    return (
        <div className="mb-4">
            <h3 className="font-body font-bold text-brand-dark mb-3 flex items-center gap-2">
                <FiHome size={18} />
                Dirección de entrega
            </h3>
            
            <div className="flex gap-3 overflow-x-auto pb-2 address-carousel">
                {/* Casa */}
                <button
                    onClick={() => handleSelectPresetAddress('home')}
                    className={`group flex-shrink-0 p-3 rounded-lg border-2 transition-colors min-w-[200px] text-left ${
                        currentDeliveryAddress === homeAddress && homeAddress
                            ? 'border-brand-primary bg-brand-primary text-white'
                            : 'border-dashed border-brand-primary bg-white hover:bg-brand-primary hover:text-white'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <FiHome size={16} className={`${currentDeliveryAddress === homeAddress && homeAddress ? 'text-white' : 'text-brand-primary'} group-hover:text-white`} />
                            <span className={`font-body font-bold text-sm ${
                                currentDeliveryAddress === homeAddress && homeAddress ? 'text-white' : 'text-brand-primary'
                            } group-hover:text-white`}>
                                Casa
                            </span>
                        </div>
                        {currentDeliveryAddress === homeAddress && homeAddress && (
                            <FiCheck size={16} className="text-white" />
                        )}
                    </div>
                    {homeAddress ? (
                        <p className={`font-body text-xs truncate ${
                            currentDeliveryAddress === homeAddress ? 'text-white' : 'text-neutral-text-muted'
                        } group-hover:text-white`}>
                            {homeAddress}
                        </p>
                    ) : (
                        <div className="text-center">
                            <p className="font-body text-xs text-brand-primary group-hover:text-white mb-1">Dirección vacía</p>
                            <p className="font-body text-xs font-bold text-brand-primary group-hover:text-white">Añadir +</p>
                        </div>
                    )}
                </button>

                {/* Trabajo */}
                <button
                    onClick={() => handleSelectPresetAddress('work')}
                    className={`group flex-shrink-0 p-3 rounded-lg border-2 transition-colors min-w-[200px] text-left ${
                        currentDeliveryAddress === workAddress && workAddress
                            ? 'border-brand-primary bg-brand-primary text-white'
                            : 'border-dashed border-brand-primary bg-white hover:bg-brand-primary hover:text-white'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <FiBriefcase size={16} className={`${currentDeliveryAddress === workAddress && workAddress ? 'text-white' : 'text-brand-primary'} group-hover:text-white`} />
                            <span className={`font-body font-bold text-sm ${
                                currentDeliveryAddress === workAddress && workAddress ? 'text-white' : 'text-brand-primary'
                            } group-hover:text-white`}>
                                Trabajo
                            </span>
                        </div>
                        {currentDeliveryAddress === workAddress && workAddress && (
                            <FiCheck size={16} className="text-white" />
                        )}
                    </div>
                    {workAddress ? (
                        <p className={`font-body text-xs truncate ${
                            currentDeliveryAddress === workAddress ? 'text-white' : 'text-neutral-text-muted'
                        } group-hover:text-white`}>
                            {workAddress}
                        </p>
                    ) : (
                        <div className="text-center">
                            <p className="font-body text-xs text-brand-primary group-hover:text-white mb-1">Dirección vacía</p>
                            <p className="font-body text-xs font-bold text-brand-primary group-hover:text-white">Añadir +</p>
                        </div>
                    )}
                </button>

                {/* Direcciones guardadas */}
                {savedAddresses.map((address) => (
                    <button
                        key={address.id}
                        onClick={() => handleSelectAddress(address.id)}
                        className={`group flex-shrink-0 p-3 rounded-lg border-2 transition-colors min-w-[200px] text-left ${
                            currentDeliveryAddress === address.address
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-neutral-border bg-white hover:bg-brand-primary hover:text-white'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`font-body font-bold text-sm ${
                                currentDeliveryAddress === address.address ? 'text-white' : 'text-brand-dark'
                            } group-hover:text-white`}>
                                {address.name}
                            </span>
                            {currentDeliveryAddress === address.address && (
                                <FiCheck size={16} className="text-white" />
                            )}
                        </div>
                        <p className={`font-body text-xs truncate ${
                            currentDeliveryAddress === address.address ? 'text-white' : 'text-neutral-text-muted'
                        } group-hover:text-white`}>
                            {address.address}
                        </p>
                    </button>
                ))}
                
                {/* Botón añadir dirección */}
                <button
                    onClick={() => setShowAddAddress(true)}
                    className="group flex-shrink-0 p-3 rounded-lg border-2 border-dashed border-brand-primary bg-white hover:bg-brand-primary hover:text-white transition-colors min-w-[200px] flex flex-col items-center justify-center gap-2"
                >
                    <FiPlus size={24} className="text-brand-primary group-hover:text-white" />
                    <span className="font-body font-bold text-sm text-brand-primary group-hover:text-white">
                        Añadir dirección
                    </span>
                </button>
            </div>

            {/* Modal para añadir dirección */}
            {(showAddAddress || editingPreset) && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-display-alt text-xl text-brand-dark">
                                {editingPreset === 'home' ? 'Dirección de Casa' : 
                                 editingPreset === 'work' ? 'Dirección de Trabajo' : 
                                 'Nueva Dirección'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowAddAddress(false)
                                    setEditingPreset(null)
                                }}
                                className="text-neutral-text-muted hover:text-brand-dark"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <LocationPicker 
                            onLocationSelect={handleAddressAdded}
                            currentLocation=""
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddressCarousel