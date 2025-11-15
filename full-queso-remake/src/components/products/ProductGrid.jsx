import React from 'react'
import ProductCard from './ProductCard'

const ProductGrid = ({ products, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-neutral-surface rounded-lg shadow-md overflow-hidden animate-pulse">
                        <div className="w-full h-40 bg-neutral-border"></div>
                        <div className="p-4">
                            <div className="h-4 bg-neutral-border rounded mb-2"></div>
                            <div className="h-3 bg-neutral-border rounded mb-4"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-neutral-border rounded w-16"></div>
                                <div className="w-8 h-8 bg-neutral-border rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className='text-center py-12'>
                <p className='font-body text-neutral-text-muted text-lg'>No se encontraron productos</p>
                <p className='font-body text-neutral-text-muted text-sm mt-2'>Intenta con otra categoría o término de búsqueda</p>
            </div>
        )
    }

    return (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6'>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

export default ProductGrid