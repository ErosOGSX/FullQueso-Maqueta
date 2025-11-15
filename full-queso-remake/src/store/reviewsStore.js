import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useReviewsStore = create(
  persist(
    (set, get) => ({
      reviews: {
        'tequeño-clasico': [
          { id: 1, rating: 5, comment: '¡Excelentes! Muy crujientes', author: 'María G.', date: '2024-01-15' },
          { id: 2, rating: 4, comment: 'Buenos, pero podrían tener más queso', author: 'Carlos R.', date: '2024-01-10' }
        ],
        'pastelito-combo': [
          { id: 3, rating: 5, comment: 'Perfectos para compartir', author: 'Ana L.', date: '2024-01-12' }
        ]
      },
      
      // Agregar reseña
      addReview: (productId, review) => {
        const newReview = {
          id: Date.now(),
          ...review,
          date: new Date().toISOString().split('T')[0]
        }
        
        set(state => ({
          reviews: {
            ...state.reviews,
            [productId]: [...(state.reviews[productId] || []), newReview]
          }
        }))
      },
      
      // Obtener reseñas de un producto
      getProductReviews: (productId) => {
        return get().reviews[productId] || []
      },
      
      // Calcular rating promedio
      getAverageRating: (productId) => {
        const productReviews = get().reviews[productId] || []
        if (productReviews.length === 0) return 0
        
        const sum = productReviews.reduce((acc, review) => acc + review.rating, 0)
        return (sum / productReviews.length).toFixed(1)
      },
      
      // Obtener total de reseñas
      getReviewCount: (productId) => {
        return (get().reviews[productId] || []).length
      },
      
      // Obtener productos mejor valorados
      getTopRatedProducts: (limit = 5) => {
        const reviews = get().reviews
        const ratings = Object.keys(reviews).map(productId => ({
          productId,
          rating: parseFloat(get().getAverageRating(productId)),
          reviewCount: get().getReviewCount(productId)
        }))
        
        return ratings
          .filter(item => item.reviewCount >= 2) // Mínimo 2 reseñas
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit)
      }
    }),
    {
      name: 'reviews-storage'
    }
  )
)

export default useReviewsStore