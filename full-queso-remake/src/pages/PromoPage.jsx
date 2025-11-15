import React from 'react'
import { menuProducts } from '../data/products'
import ProductGrid from '../components/products/ProductGrid'

const PromoPage = () => {
    // Filtrar solo productos en promoción
    const promoProducts = menuProducts.filter(product => product.isPromo)
    
    return (
        <div className='container mx-auto px-4 py-6'>
            <div className='text-center mb-8'>
                <h1 className='font-display text-4xl text-brand-dark mb-2'>
                    🏷️ Promociones Especiales
                </h1>
                <p className='font-body text-neutral-text-muted text-lg'>
                    ¡Aprovecha nuestras ofertas increíbles!
                </p>
            </div>

            {/* Banner promocional */}
            <div className='bg-gradient-to-r from-brand-primary to-brand-primary-light rounded-lg p-6 mb-8 text-white text-center'>
                <h2 className='font-display-alt text-2xl mb-2'>¡Ofertas Limitadas!</h2>
                <p className='font-body'>Combos especiales con descuentos únicos</p>
            </div>

            {/* Productos en promoción */}
            <div className='mb-6'>
                <h2 className='font-display-alt text-2xl text-brand-dark mb-4'>
                    Productos en Oferta ({promoProducts.length})
                </h2>
                <ProductGrid products={promoProducts} />
            </div>

            {/* Sección de beneficios */}
            <div className='bg-neutral-surface rounded-lg p-6 mt-8'>
                <h3 className='font-display-alt text-xl text-brand-dark mb-4'>
                    ¿Por qué elegir nuestras promociones?
                </h3>
                <div className='grid md:grid-cols-3 gap-4'>
                    <div className='text-center'>
                        <div className='text-3xl mb-2'>💰</div>
                        <h4 className='font-body font-bold text-brand-dark'>Mejor Precio</h4>
                        <p className='font-body text-neutral-text-muted text-sm'>
                            Ahorra hasta 30% en combos seleccionados
                        </p>
                    </div>
                    <div className='text-center'>
                        <div className='text-3xl mb-2'>🍽️</div>
                        <h4 className='font-body font-bold text-brand-dark'>Más Cantidad</h4>
                        <p className='font-body text-neutral-text-muted text-sm'>
                            Combos familiares perfectos para compartir
                        </p>
                    </div>
                    <div className='text-center'>
                        <div className='text-3xl mb-2'>⚡</div>
                        <h4 className='font-body font-bold text-brand-dark'>Entrega Rápida</h4>
                        <p className='font-body text-neutral-text-muted text-sm'>
                            Delivery express en todas las promociones
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PromoPage