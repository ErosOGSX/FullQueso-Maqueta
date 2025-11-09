import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSelectionStore from '../store/selectionStore'
import { sampleProducts } from '../data/products'
import ProductCard from '../components/products/ProductCard'

const CategoryPill = ({ name, isActive }) => (
    <button className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-colors ${isActive ? 'bg-brand-primary text-white' : 'bg-neutral-surface text-brand-dark-light hover:bg-brand-yellow-light'}`}> {name} </button>
)

const MenuPage = () => {
    const navigate = useNavigate()
    const { service, city, store, clearSelection } = useSelectionStore()

    useEffect(() => {
        if (!store){
            navigate('/')
        }
    }, [store, navigate])

    const handleClearSelection = () => {
        clearSelection()
    }
    if (!store){
        return null;
    }

    const serviceNames = {delivery: 'Delivery', pickup: 'Entrega al Carro', 'in-store': 'Pedido en Tienda'};
    const serviceLabel = serviceNames[service] ?? 'Servicio';
    const cityName = city ?? store?.city ?? ''
    const locationIsImplicit = cityName && store.name.toLowerCase().includes(cityName.toLowerCase())
    const locationDisplay = cityName ? (locationIsImplicit ? store.name : `${store.name}, ${cityName}`) : store.name
    const categories = ['Todos', 'Party Box', 'Promos', 'Churros', 'Pastelitos', 'Tequeños', 'Bebidas', 'Quesos', 'Congelados'];

    return (
        <div className='container mx-auto px-4 py-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <p className='font-body text-sm text-neutral-text-muted'> {serviceLabel} en</p>
                    <h2 className='font-display-alt text-2xl text-brand-dark'> {locationDisplay} </h2>
                </div>
                <button onClick={handleClearSelection} className='font-body font-bold text-brand-primary text-sm'>Cambiar de Tienda</button>
            </div>

            <div className='flex gap-2 overflow-x-auto pb-4 -mx-4 px-4'> {categories.map((cat, index) => (
                    <CategoryPill key={cat} name={cat} isActive={index === 0} />
                ))} 
            </div>
            
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6'> 
                {sampleProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))} 
            </div>

        </div>
    )
}


export default MenuPage