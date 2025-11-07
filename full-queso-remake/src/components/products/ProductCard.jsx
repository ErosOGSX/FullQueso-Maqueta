// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import React from "react";
import { FiPlus } from 'react-icons/fi'
import useCartStore from '../../store/cartStore';

const ProductCard = ({ product }) => {

    const addProduct = useCartStore((state) => state.addProduct);

    return(
        <motion.div className="bg-neutral-surface rounded-lg shadow-md overflow-hidden flex flex-col"
        initial={{ opacity: 0, y:30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}>

            <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />

            <div className="p-4 flex flex-col grow">

                <h3 className="font-display-alt text-xl text-brand-dark"> {product.name} </h3>
                <p className="font-body text-neutral-text-muted text-sm mt-1 grow"> {product.description} </p>

                <div className="flex justify-between items-center mt-4">

                    <span className="font-body font-bold text-lg text-brand-dark"> ${product.price.toFixed(2)} </span>

                    <button onClick={() => addProduct(product)} className='bg-brand-primary text-white rounded-full p-2 hover:bg-brand-primary-light transform hover:scale-110 transition-all duration-200' aria-label={`Añadir ${product.name} al carrito`}> <FiPlus size={24} /> </button>

                </div>
            </div>
        </motion.div>
    )
}


export default ProductCard