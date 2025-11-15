import React from 'react'
import { FiFilter, FiX } from 'react-icons/fi'

const FilterBar = ({ 
    sortBy, 
    onSortChange, 
    priceRange, 
    onPriceChange, 
    showFilters, 
    onToggleFilters,
    onClearFilters,
    activeFiltersCount,
    quickFilters,
    onToggleQuickFilter
}) => {
    const sortOptions = [
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'price-asc', label: 'Precio: Menor a Mayor' },
        { value: 'price-desc', label: 'Precio: Mayor a Menor' }
    ];

    return (
        <div className="mb-4">
            {/* Barra principal con ordenamiento y botón filtros */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-3 py-2 border-2 border-neutral-border rounded-lg font-body text-sm focus:border-brand-primary focus:outline-none"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onToggleFilters}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                        showFilters || activeFiltersCount > 0
                            ? 'bg-brand-primary text-white'
                            : 'bg-neutral-surface border-2 border-neutral-border text-brand-dark hover:bg-brand-yellow-light'
                    }`}
                >
                    <FiFilter size={16} />
                    <span>Filtros</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-brand-primary-dark text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
                <div className="bg-neutral-surface border-2 border-neutral-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-body font-bold text-brand-dark">Filtros Avanzados</h3>
                        <button
                            onClick={onClearFilters}
                            className="text-brand-primary font-body text-sm hover:underline"
                        >
                            Limpiar todo
                        </button>
                    </div>

                    {/* Filtro de precio */}
                    <div>
                        <label className="block font-body font-bold text-brand-dark mb-2">
                            Rango de Precio: ${priceRange[0]} - ${priceRange[1]}
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={priceRange[0]}
                                onChange={(e) => onPriceChange([parseInt(e.target.value), priceRange[1]])}
                                className="flex-1"
                            />
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={priceRange[1]}
                                onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex justify-between text-sm text-neutral-text-muted mt-1">
                            <span>$0</span>
                            <span>$50</span>
                        </div>
                    </div>

                    {/* Filtros rápidos */}
                    <div>
                        <label className="block font-body font-bold text-brand-dark mb-2">
                            Filtros Rápidos
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onToggleQuickFilter('promo')}
                                className={`px-3 py-1 rounded-full text-sm font-body transition-colors ${
                                    quickFilters.includes('promo')
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-neutral-surface border border-neutral-border text-brand-dark hover:bg-brand-yellow-light'
                                }`}
                            >
                                🏷️ En Promoción
                            </button>
                            <button
                                onClick={() => onToggleQuickFilter('popular')}
                                className={`px-3 py-1 rounded-full text-sm font-body transition-colors ${
                                    quickFilters.includes('popular')
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-neutral-surface border border-neutral-border text-brand-dark hover:bg-brand-yellow-light'
                                }`}
                            >
                                🔥 Más Vendidos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FilterBar