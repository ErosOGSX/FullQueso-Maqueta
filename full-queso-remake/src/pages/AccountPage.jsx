import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import useUserDataStore from '../store/userDataStore'
import LocationPicker from '../components/location/LocationPicker'
import LoyaltyCard from '../components/loyalty/LoyaltyCard'
import RewardsModal from '../components/loyalty/RewardsModal'
import { FiUser, FiPhone, FiMail, FiMapPin, FiMessageSquare, FiGift } from 'react-icons/fi'

const InputField = ({ id, label, register, required, error, type = 'text', icon: Icon, ...props }) => (
    <div className='w-full'>
        <label htmlFor={id} className='block font-body font-bold text-brand-dark mb-2 flex items-center gap-2'>
            {Icon && <Icon size={18} />}
            {label}
        </label>
        <input
            id={id}
            type={type}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...register(id, { required: required && 'Este campo es obligatorio' })}
            {...props}
            className={`w-full p-3 font-body bg-neutral-surface border-2 rounded-lg transition-colors ${
                error ? 'border-red-500 focus:border-red-500' : 'border-neutral-border focus:border-brand-primary'
            } focus:outline-none`}
        />
        {error && <p id={`${id}-error`} role='alert' className='text-red-500 text-sm mt-1'>{error.message}</p>}
    </div>
);

const AccountPage = () => {
    const { userData, updateUserData, clearUserData } = useUserDataStore()
    const [showRewards, setShowRewards] = useState(false)
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: userData
    })

    const onSubmit = (data) => {
        try {
            updateUserData(data)
            alert('¡Datos guardados correctamente!')
        } catch (error) {
            console.error('Error saving user data:', error)
            alert('Error al guardar los datos. Intenta de nuevo.')
        }
    }

    const handleClearData = () => {
        if (confirm('¿Estás seguro de que quieres borrar todos tus datos?')) {
            clearUserData()
            reset({
                fullName: '',
                phone: '',
                email: '',
                address: '',
                notes: ''
            })
        }
    }

    return (
        <div className='container mx-auto px-4 py-6 max-w-md'>
            <div className='text-center mb-8'>
                <h1 className='font-display text-3xl text-brand-dark mb-2'>Mi Cuenta</h1>
                <p className='font-body text-neutral-text-muted'>
                    Guarda tus datos para hacer pedidos más rápido
                </p>
            </div>

            {/* Tarjeta de Fidelidad */}
            <div className='mb-6'>
                <LoyaltyCard />
                <button 
                    onClick={() => setShowRewards(true)}
                    className='w-full mt-3 flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark font-bold font-body py-2 rounded-lg hover:bg-brand-yellow-light transition-colors'
                >
                    <FiGift size={18} />
                    Full Pana - Recompensas
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <InputField 
                    id='fullName' 
                    label='Nombre Completo' 
                    icon={FiUser}
                    register={register} 
                    required 
                    error={errors.fullName}
                    placeholder='Tu nombre completo'
                />

                <InputField 
                    id='phone' 
                    label='Teléfono' 
                    icon={FiPhone}
                    type='tel' 
                    register={register} 
                    required 
                    error={errors.phone}
                    placeholder='Tu número de teléfono'
                />

                <InputField 
                    id='email' 
                    label='Email (Opcional)' 
                    icon={FiMail}
                    type='email' 
                    register={register} 
                    error={errors.email}
                    placeholder='tu@email.com'
                />

                <InputField 
                    id='address' 
                    label='Dirección de Entrega (Opcional)' 
                    icon={FiMapPin}
                    register={register} 
                    error={errors.address}
                    placeholder='Tu dirección para delivery'
                />

                <LocationPicker 
                    currentLocation={userData.deliveryAddress}
                    onLocationSelect={(location) => {
                        updateUserData({
                            deliveryAddress: location.address,
                            deliveryCoords: location.coords
                        })
                    }}
                />

                <div className='w-full'>
                    <label htmlFor="notes" className='block font-body font-bold text-brand-dark mb-2 flex items-center gap-2'>
                        <FiMessageSquare size={18} />
                        Notas Especiales (Opcional)
                    </label>
                    <textarea
                        id="notes"
                        {...register('notes')}
                        rows="3"
                        placeholder='Preferencias, alergias, instrucciones especiales...'
                        className='w-full p-3 font-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:border-brand-primary focus:outline-none transition-colors'
                    />
                </div>

                <button 
                    type='submit' 
                    className='w-full bg-brand-primary text-white font-bold font-body py-3 rounded-lg hover:bg-brand-primary-light transition-colors text-lg'
                >
                    Guardar Datos
                </button>

                <div className='flex justify-between items-center pt-4'>
                    <button 
                        type='button' 
                        onClick={handleClearData}
                        className='font-body text-sm text-red-500 hover:underline'
                    >
                        Borrar todos los datos
                    </button>
                    <p className='font-body text-xs text-neutral-text-muted'>
                        Los datos se guardan en tu dispositivo
                    </p>
                </div>
            </form>

            <RewardsModal 
                isOpen={showRewards} 
                onClose={() => setShowRewards(false)} 
            />
        </div>
    )
}

export default AccountPage