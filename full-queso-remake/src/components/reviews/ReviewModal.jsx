import React, { useState } from 'react'
import { FiX, FiStar } from 'react-icons/fi'
import useReviewsStore from '../../store/reviewsStore'
import useNotificationStore from '../../store/notificationStore'

const ReviewModal = ({ product, isOpen, onClose }) => {
    const { addReview } = useReviewsStore()
    const { success } = useNotificationStore()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [author, setAuthor] = useState('')

    if (!isOpen || !product) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (rating === 0) {
            return
        }

        addReview(product.id, {
            rating,
            comment,
            author: author || 'Usuario Anónimo'
        })

        success('¡Reseña Enviada!', 'Gracias por tu opinión')
        setRating(0)
        setComment('')
        setAuthor('')
        onClose()
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="font-display-alt text-xl text-brand-dark">Calificar Producto</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-border rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <h3 className="font-body font-bold text-brand-dark mb-2">{product.name}</h3>
                        <p className="font-body text-sm text-neutral-text-muted">¿Qué te pareció este producto?</p>
                    </div>

                    <div>
                        <label className="font-body font-bold text-brand-dark mb-2 block">Calificación</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <FiStar 
                                        size={24} 
                                        className={star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="font-body font-bold text-brand-dark mb-2 block">Tu nombre (opcional)</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Nombre"
                            className="w-full p-3 border border-neutral-border rounded-lg focus:border-brand-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-body font-bold text-brand-dark mb-2 block">Comentario (opcional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Cuéntanos tu experiencia..."
                            rows="3"
                            className="w-full p-3 border border-neutral-border rounded-lg focus:border-brand-primary focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-neutral-border rounded-lg font-body hover:bg-neutral-border transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0}
                            className={`flex-1 py-2 rounded-lg font-body font-bold transition-colors ${
                                rating > 0
                                    ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Enviar Reseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewModal