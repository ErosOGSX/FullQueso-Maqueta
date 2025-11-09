import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storeData } from '../data/stores'
import { FaMotorcycle, FaCar, FaStore } from 'react-icons/fa'
import useSelectionStore from '../store/selectionStore'

const SelectionButton = ({children, onClick, icon}) => (
    <button onClick={onClick} className='w-full max-w-sm flex items-center justify-center gap-4 p-4 rounded-lg bg-neutral-surface shadow-md border border-neutral-border font-body font-bold text-lg text-brand-dark hover:bg-brand-yellow-light hover:border-brand-yellow-dark transition-all duration-300 transform hover:scale-105'> {icon} {children} </button>
)

const HomePage = () => {
    const [step, setStep] = useState('service');
    const [selection, setSelection] = useState({
        service: null,
        city: null,
        store: null,
    })

    const navigate = useNavigate();
    const saveSelection = useSelectionStore((state) => state.setSelection);

    const handleServiceSelect = (service) => {
        setSelection({...selection, service: service})
        setStep('city')
    
    }

    const handleCitySelect = (city) => {
        if (!selection.service) {
            alert("Selecciona un servicio primero");
            return;
        }
        const storesInCity = storeData.stores?.[city] ?? [];
        const availableStores = storesInCity.filter(store => store.services.includes(selection.service));
        if (availableStores.length === 0) {
            alert("Ups! No tenemos disponible este servicio en " + city)
            return
        }
        setSelection(prev => ({ ...prev, city }));
        setStep('store')
    }
    const handleStoreSelect = (store) => {
        const finalSelection = { ...selection, store: store}
    if (step === 'store') {
        const storesInCity = storeData.stores?.[selection.city] ?? []
        const availableStores = storesInCity.filter(store => store.services.includes(selection.service))
            return (
                <div className='flex flex-col items-center gap-4 p-8'>

                    <h1 className='font-display-alt text-3xl text-brand-dark'>Elige una sucursal</h1>
                    {availableStores.map(store => (
                        <SelectionButton key={store.id} onClick={() => handleStoreSelect(store)}> {store.name} </SelectionButton>
                    ))}

                </div>
            )
        }
                </div>
            )
        }

        if (step === 'city') {
            return (
                <div className='flex flex-col items-center gap-4 p-8'>

                    <h1 className='font-display-alt text-3xl text-brand-dark'>Selecciona tu ciudad</h1>
                    {storeData.cities.map(city => (
                        <SelectionButton key={city} onClick={() => handleCitySelect(city)}> {city} </SelectionButton>
                    ))}

                </div>
                
            )
        }

        return (
            <div className='flex flex-col items-center gap-8 p-8'>
                <div className='text-center'>
                    <h1 className='font-display text-7xl text-brand-dark'>Hola</h1>
                    <p className='font-display text-xl text-neutral-text-muted mt-2'>¿Cómo podemos servirte hoy?</p>
                </div>

                <div className='flex flex-col items-center gap-4 w-full'>
                    <SelectionButton onClick={() => handleServiceSelect('delivery')} icon={<FaMotorcycle size={24} />}>Delivery</SelectionButton>

                    <SelectionButton onClick={() => handleServiceSelect('pickup')} icon={<FaCar size={24} />}>Entrega al Carro</SelectionButton>

                    <SelectionButton onClick={() => handleServiceSelect('in-store')} icon={<FaStore size={24} />}>Pedido en Tienda</SelectionButton>

                </div>
                <button onClick={() => navigate('/evento')} className='font-body font-bold text-brand-primary mt-8'>Arma tu Evento</button>

            </div>
        )
}

export default HomePage;