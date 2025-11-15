import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi'
import useSearchStore from '../../store/searchStore'
import { menuProducts } from '../../data/products'
import { debounce, memoize } from '../../utils/performanceUtils'

// Memoized search function for better performance
const getFilteredProducts = memoize((searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return menuProducts
        .filter(product => {
            const searchLower = searchTerm.toLowerCase();
            return product.name.toLowerCase().includes(searchLower) ||
                   product.description.toLowerCase().includes(searchLower) ||
                   product.category.toLowerCase().includes(searchLower);
        })
        .map(product => product.name)
        .slice(0, 5);
});

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Buscar productos..." }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const { searchHistory, popularSearches, addToHistory, removeFromHistory } = useSearchStore()
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    
    // Debounced search to avoid excessive filtering
    const debouncedSearch = useCallback(
        debounce((term) => {
            const filtered = getFilteredProducts(term);
            setSuggestions(filtered);
        }, 150),
        []
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (searchTerm.length > 0) {
            debouncedSearch(searchTerm);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, debouncedSearch])

    const handleClear = () => {
        onSearchChange('')
        setIsOpen(false)
    }

    const handleFocus = () => {
        setIsOpen(true)
    }

    const handleSuggestionClick = (suggestion) => {
        onSearchChange(suggestion)
        addToHistory(suggestion)
        setIsOpen(false)
        inputRef.current?.blur()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            addToHistory(searchTerm)
            setIsOpen(false)
            inputRef.current?.blur()
        }
    }

    // Memoize display items to avoid unnecessary re-renders
    const displayItems = useMemo(() => {
        return searchTerm.length > 0 ? suggestions : [...searchHistory, ...popularSearches];
    }, [searchTerm, suggestions, searchHistory, popularSearches]);
    
    const hasItems = displayItems.length > 0

    return (
        <div className='relative mb-6' ref={dropdownRef}>
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'>
                <FiSearch className='text-neutral-text-muted' size={20} />
            </div>
            
            <input
                ref={inputRef}
                type='text'
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className='w-full pl-10 pr-10 py-3 font-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:border-brand-primary focus:outline-none transition-all duration-200 focus:shadow-lg'
            />
            
            {searchTerm && (
                <button
                    onClick={handleClear}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-border rounded-full transition-colors z-10'
                    aria-label="Limpiar búsqueda"
                >
                    <FiX className='text-neutral-text-muted' size={16} />
                </button>
            )}

            {/* Dropdown de sugerencias */}
            {isOpen && hasItems && (
                <div className='absolute top-full left-0 right-0 bg-white border border-neutral-border rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-200'>
                    {searchTerm.length === 0 && searchHistory.length > 0 && (
                        <div className='p-3 border-b border-neutral-border'>
                            <div className='flex items-center justify-between mb-2'>
                                <h4 className='font-body font-bold text-sm text-brand-dark flex items-center gap-2'>
                                    <FiClock size={14} />
                                    Búsquedas recientes
                                </h4>
                            </div>
                            {searchHistory.slice(0, 5).map((item, index) => (
                                <div key={index} className='flex items-center justify-between py-1 hover:bg-neutral-border rounded px-2 -mx-2 group search-item'>
                                    <button
                                        onClick={() => handleSuggestionClick(item)}
                                        className='flex-1 text-left font-body text-sm text-brand-dark capitalize'
                                    >
                                        {item}
                                    </button>
                                    <button
                                        onClick={() => removeFromHistory(item)}
                                        className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all'
                                    >
                                        <FiX size={12} className='text-red-500' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchTerm.length === 0 && popularSearches.length > 0 && (
                        <div className='p-3'>
                            <h4 className='font-body font-bold text-sm text-brand-dark mb-2 flex items-center gap-2'>
                                <FiTrendingUp size={14} />
                                Búsquedas populares
                            </h4>
                            {popularSearches.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(item)}
                                    className='block w-full text-left py-1 px-2 -mx-2 hover:bg-neutral-border rounded font-body text-sm text-brand-dark capitalize search-item'
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}

                    {searchTerm.length > 0 && suggestions.length > 0 && (
                        <div className='p-3'>
                            <h4 className='font-body font-bold text-sm text-brand-dark mb-2'>Sugerencias</h4>
                            {suggestions.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(item)}
                                    className='block w-full text-left py-2 px-2 -mx-2 hover:bg-neutral-border rounded font-body text-sm text-brand-dark search-item'
                                >
                                    <span className='font-medium'>{item}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchBar