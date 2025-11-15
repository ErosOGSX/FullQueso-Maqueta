import React, { useState } from 'react'
import { FiMapPin, FiCheck, FiNavigation, FiHome, FiTrash2 } from 'react-icons/fi'
import useUserDataStore from '../../store/userDataStore'
import useNotificationStore from '../../store/notificationStore'

const LocationPicker = ({ onLocationSelect, currentLocation }) => {
    const [address, setAddress] = useState(currentLocation || '')
    const [addressName, setAddressName] = useState('')
    const [isSelecting, setIsSelecting] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [showSaveForm, setShowSaveForm] = useState(false)
    const { userData, addSavedAddress, removeSavedAddress, selectSavedAddress } = useUserDataStore()
    const { success, error } = useNotificationStore()
    
    // Validaciones para evitar errores
    const savedAddresses = userData?.savedAddresses || []

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada en este navegador')
            return
        }

        setIsGettingLocation(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                
                try {
                    // Usar servicio de geocodificación inversa gratuito
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
                    )
                    const data = await response.json()
                    
                    const fullAddress = data.locality 
                        ? `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
                        : `${data.principalSubdivision}, ${data.countryName}`
                    
                    setAddress(fullAddress)
                    setIsGettingLocation(false)
                } catch (error) {
                    console.error('Error getting address:', error)
                    // Fallback con coordenadas
                    setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`)
                    setIsGettingLocation(false)
                }
            },
            (error) => {
                console.error('Error getting location:', error)
                setIsGettingLocation(false)
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        error('Ubicación Denegada', 'Por favor, permite el acceso a tu ubicación en el navegador')
                        break
                    case error.POSITION_UNAVAILABLE:
                        error('Ubicación No Disponible', 'No se pudo obtener tu ubicación actual')
                        break
                    case error.TIMEOUT:
                        error('Tiempo Agotado', 'La búsqueda de ubicación tomó demasiado tiempo')
                        break
                    default:
                        error('Error de Ubicación', 'Ocurrió un error inesperado al obtener tu ubicación')
                        break
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )
    }

    const handleLocationSelect = () => {
        if (!address.trim()) return
        
        setIsSelecting(true)
        
        // Simular coordenadas de Venezuela
        const mockCoords = {
            lat: 10.4806 + (Math.random() - 0.5) * 0.01,
            lng: -66.9036 + (Math.random() - 0.5) * 0.01
        }
        
        setTimeout(() => {
            onLocationSelect({
                address: address.trim(),
                coords: mockCoords
            })
            setIsSelecting(false)
        }, 1000)
    }

    const handleSaveAddress = () => {
        if (!address.trim() || !addressName.trim()) return
        
        const mockCoords = {
            lat: 10.4806 + (Math.random() - 0.5) * 0.01,
            lng: -66.9036 + (Math.random() - 0.5) * 0.01
        }
        
        addSavedAddress({
            name: addressName.trim(),
            address: address.trim(),
            coords: mockCoords
        })
        
        setAddressName('')
        setShowSaveForm(false)
        success('Dirección Guardada', `"${addressName}" se ha guardado correctamente`)
    }

    const handleSelectSavedAddress = (savedAddress) => {
        setAddress(savedAddress.address)
        selectSavedAddress(savedAddress.id)
    }

    return (
        <div className="space-y-3">
            <label className="block font-body font-bold text-brand-dark">
                Dirección de entrega
            </label>
            
            <div className="relative">
                <input
                    type="text"
                    placeholder="Ingresa tu dirección completa..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 pl-10 border rounded-lg font-body focus:border-brand-primary focus:outline-none"
                />
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text-muted" size={18} />
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className={`flex-1 p-3 rounded-lg font-body font-bold transition-colors flex items-center justify-center gap-2 ${
                        isGettingLocation
                            ? 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                            : 'bg-brand-yellow text-black hover:bg-brand-yellow-light'
                    }`}
                >
                    {isGettingLocation ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-dark border-t-transparent"></div>
                            Obteniendo...
                        </>
                    ) : (
                        <>
                            <FiNavigation size={18} />
                            Acceder a ubicación
                        </>
                    )}
                </button>
                
                <button
                    onClick={handleLocationSelect}
                    disabled={!address.trim() || isSelecting}
                    className={`flex-1 p-3 rounded-lg font-body font-bold transition-colors flex items-center justify-center gap-2 ${
                        !address.trim() || isSelecting
                            ? 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                            : 'bg-brand-primary text-white hover:bg-brand-primary-light'
                    }`}
                >
                    {isSelecting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <FiCheck size={18} />
                            Confirmar
                        </>
                    )}
                </button>
            </div>
            
            {/* Direcciones guardadas */}
            {savedAddresses.length > 0 && (
                <div className="space-y-2">
                    <label className="block font-body font-bold text-brand-dark text-sm">
                        Direcciones guardadas
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {savedAddresses.map((savedAddress) => (
                            <div key={savedAddress.id} className="flex items-center justify-between p-2 border rounded-lg bg-neutral-surface">
                                <button
                                    onClick={() => handleSelectSavedAddress(savedAddress)}
                                    className="flex-1 text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiHome size={14} className="text-brand-primary" />
                                        <div>
                                            <p className="font-body font-bold text-brand-dark text-sm">{savedAddress.name}</p>
                                            <p className="font-body text-neutral-text-muted text-xs truncate">{savedAddress.address}</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => removeSavedAddress(savedAddress.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulario para guardar dirección */}
            {showSaveForm && (
                <div className="space-y-3 p-3 border rounded-lg bg-neutral-surface">
                    <label className="block font-body font-bold text-brand-dark text-sm">
                        Nombre para esta dirección
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: Casa, Trabajo, Casa de mamá..."
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        className="w-full p-2 border rounded-lg font-body focus:border-brand-primary focus:outline-none text-sm"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveAddress}
                            disabled={!address.trim() || !addressName.trim()}
                            className={`flex-1 p-2 rounded-lg font-body font-bold text-sm transition-colors ${
                                !address.trim() || !addressName.trim()
                                    ? 'bg-neutral-border text-neutral-text-muted cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            Guardar dirección
                        </button>
                        <button
                            onClick={() => {
                                setShowSaveForm(false)
                                setAddressName('')
                            }}
                            className="px-4 py-2 rounded-lg font-body font-bold text-sm bg-neutral-border text-neutral-text-muted hover:bg-neutral-surface"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Botón para mostrar formulario de guardado */}
            {address.trim() && !showSaveForm && (
                <button
                    onClick={() => setShowSaveForm(true)}
                    className="w-full p-2 rounded-lg font-body font-bold text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 flex items-center justify-center gap-2"
                >
                    <FiHome size={16} />
                    Guardar esta dirección
                </button>
            )}
            
            <div className="bg-brand-yellow-light p-3 rounded-lg">
                <p className="font-body text-brand-dark text-xs">
                    💡 Ingresa tu dirección manualmente, usa "Acceder a ubicación" o selecciona una dirección guardada.
                </p>
            </div>
            
            {currentLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <FiCheck className="text-green-600 mt-0.5" size={16} />
                        <div>
                            <p className="font-body font-bold text-green-800 text-sm">Ubicación guardada</p>
                            <p className="font-body text-green-700 text-xs">{currentLocation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LocationPicker