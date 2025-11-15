import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useSelectionStore from '../store/selectionStore'
import { menuProducts, categories } from '../data/products'
import ProductGrid from '../components/products/ProductGrid'
import SearchBar from '../components/products/SearchBar'
import FilterBar from '../components/products/FilterBar'
import { useImagePreloader } from '../hooks/useLazyImage'
import { memoize } from '../utils/performanceUtils'

const CategoryPill = ({ category, isActive, onClick }) => (
    <button 
        onClick={() => onClick(category.id)}
        className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
            isActive 
                ? 'bg-brand-primary text-white' 
                : 'bg-neutral-surface text-brand-dark-light hover:bg-brand-yellow-light'
        }`}
    >
        <span>{category.icon}</span>
        <span>{category.name}</span>
    </button>
)

// Memoized filter function for better performance
const filterProducts = memoize((products, activeCategory, searchTerm, priceRange, quickFilters, sortBy) => {
    return products
        .filter(product => {
            const matchesCategory = activeCategory === 'todos' || product.category === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const price = parseFloat(product.price.replace('$', ''));
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
            
            // Filtros rápidos
            const matchesQuickFilters = quickFilters.length === 0 || quickFilters.every(filter => {
                switch (filter) {
                    case 'promo': return product.isPromo;
                    case 'popular': return product.isPopular;
                    default: return true;
                }
            });
            
            return matchesCategory && matchesSearch && matchesPrice && matchesQuickFilters;
        })
        .sort((a, b) => {
            const priceA = parseFloat(a.price.replace('$', ''));
            const priceB = parseFloat(b.price.replace('$', ''));
            
            switch (sortBy) {
                case 'price-asc': return priceA - priceB;
                case 'price-desc': return priceB - priceA;
                case 'name': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });
});

const MenuPage = () => {
    const navigate = useNavigate()
    const { service, city, store, clearSelection } = useSelectionStore()
    const [activeCategory, setActiveCategory] = useState('todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [priceRange, setPriceRange] = useState([0, 50])
    const [showFilters, setShowFilters] = useState(false)
    const [quickFilters, setQuickFilters] = useState([])
    
    // Preload critical images (popular and promo products)
    const criticalImages = useMemo(() => {
        return menuProducts
            .filter(product => product.isPopular || product.isPromo)
            .map(product => product.image);
    }, []);
    
    const preloaded = useImagePreloader(criticalImages, 'high');

    useEffect(() => {
        if (!store) {
            navigate('/');
        }
    }, [store, navigate])

    const handleClearSelection = () => {
        try {
            clearSelection();
            navigate('/');
        } catch (error) {
            console.error('Error clearing selection:', error);
        }
    }
    if (!store) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <p className="font-body text-neutral-text-muted">Cargando...</p>
            </div>
        );
    }

    const serviceNames = {delivery: 'Delivery', pickup: 'Entrega al Carro', 'in-store': 'Pedido en Tienda'};
    const serviceLabel = serviceNames[service] ?? 'Servicio';
    const cityName = city ?? store?.city ?? ''
    const locationIsImplicit = cityName && store.name.toLowerCase().includes(cityName.toLowerCase())
    const locationDisplay = cityName ? (locationIsImplicit ? store.name : `${store.name}, ${cityName}`) : store.name
    
    // Memoized filtered products for better performance
    const filteredProducts = useMemo(() => {
        return filterProducts(menuProducts, activeCategory, searchTerm, priceRange, quickFilters, sortBy);
    }, [activeCategory, searchTerm, priceRange, quickFilters, sortBy]);
    
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
    };
    
    const clearFilters = () => {
        setActiveCategory('todos');
        setSearchTerm('');
        setSortBy('name');
        setPriceRange([0, 50]);
        setQuickFilters([]);
        setShowFilters(false);
    };
    
    const toggleQuickFilter = (filter) => {
        setQuickFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };
    
    // Memoized active filters count
    const activeFiltersCount = useMemo(() => {
        return [
            activeCategory !== 'todos',
            searchTerm !== '',
            priceRange[0] !== 0 || priceRange[1] !== 50,
            sortBy !== 'name',
            quickFilters.length > 0
        ].filter(Boolean).length;
    }, [activeCategory, searchTerm, priceRange, sortBy, quickFilters]);

    return (
        <div className='container mx-auto px-4 py-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <p className='font-body text-sm text-neutral-text-muted'> {serviceLabel} en</p>
                    <h2 className='font-display-alt text-2xl text-brand-dark'> {locationDisplay} </h2>
                </div>
                <button onClick={handleClearSelection} className='font-body font-bold text-brand-primary text-sm'>Cambiar de Tienda</button>
            </div>

            {/* Barra de búsqueda */}
            <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder='Buscar productos...'
            />

            {/* Filtros y ordenamiento */}
            <FilterBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
                quickFilters={quickFilters}
                onToggleQuickFilter={toggleQuickFilter}
            />

            {/* Categorías */}
            <div className='flex gap-2 overflow-x-auto pb-4 -mx-4 px-4'>
                {categories.map((category) => (
                    <CategoryPill 
                        key={category.id} 
                        category={category} 
                        isActive={activeCategory === category.id}
                        onClick={handleCategoryChange}
                    />
                ))}
            </div>

            {/* Chips de filtros activos */}
            {activeFiltersCount > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                    {activeCategory !== 'todos' && (
                        <span className='bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-body flex items-center gap-2'>
                            Categoría: {categories.find(c => c.id === activeCategory)?.name}
                            <button onClick={() => setActiveCategory('todos')} className='hover:bg-brand-primary-dark rounded-full p-1'>
                                ×
                            </button>
                        </span>
                    )}
                    {(priceRange[0] !== 0 || priceRange[1] !== 50) && (
                        <span className='bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-body flex items-center gap-2'>
                            Precio: ${priceRange[0]} - ${priceRange[1]}
                            <button onClick={() => setPriceRange([0, 50])} className='hover:bg-brand-primary-dark rounded-full p-1'>
                                ×
                            </button>
                        </span>
                    )}
                    {quickFilters.map(filter => (
                        <span key={filter} className='bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-body flex items-center gap-2'>
                            {filter === 'promo' ? '🏷️ En Promoción' : '🔥 Más Vendidos'}
                            <button onClick={() => toggleQuickFilter(filter)} className='hover:bg-brand-primary-dark rounded-full p-1'>
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            
            {/* Productos */}
            <ProductGrid products={filteredProducts} />

        </div>
    )
}


export default MenuPage