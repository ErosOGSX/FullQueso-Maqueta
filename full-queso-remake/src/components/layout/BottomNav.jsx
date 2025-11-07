import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiTag, FiClipboard, FiUser } from 'react-icons/fi'
import useCartStore from '../../store/cartStore';

const BottomNav = () => {
    const activeLinkStyle = { color: '#EF4444' }
    const items = useCartStore((state) => state.items);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return (
            <>
                <nav className='fixed bottom-0 left-0 right-0 bg-neutral-surface border-t border-neutral-border h-16 md:hidden'>
                    <div className='flex justify-around items-center h-full'>
                        <NavLink
                        to='/menu'
                        className='flex flex-col items center text-neutral-text-muted'
                        style={({ isActive }) => isActive ? activeLinkStyle : undefined}>

                            <FiHome size={24} />
                            <span className='text-xs font-body'>Menú</span>
                        </NavLink>

                        <NavLink
                        to='/promos'
                        className='flex flex-col items center text-neutral-text-muted'
                        style={({ isActive }) => isActive ? activeLinkStyle : undefined}>

                            <FiTag size={24} />
                            <span className='text-xs font-body'>Promo</span>
                        </NavLink>

                        <NavLink
                        to='/ordenes'
                        className='flex flex-col items center text-neutral-text-muted'
                        style={({ isActive }) => isActive ? activeLinkStyle : undefined}>

                            <FiClipboard size={24} />
                            <span className='text-xs font-body'>Órdenes</span>
                        </NavLink>

                        <NavLink
                        to='/cuenta'
                        className='flex flex-col items center text-neutral-text-muted'
                        style={({ isActive }) => isActive ? activeLinkStyle : undefined}>

                            <FiUser size={24} />
                            <span className='text-xs font-body'>Cuenta</span>
                        </NavLink>
                    </div>
                </nav>

                {totalItems > 0 && (
                    <NavLink to='/carrito' className='fixed bottom-20 md:bottom-6 right-6 z-50 bg-brand-primary text-white rounded-full p-4 shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200'>

                        <FiShoppingCart size={28} />

                        <span className='absolute -top-1 -right-1 h-6 w-6 rounded-full bg-brand-primary-dark text-white text-sm font-bold flex items-center justify-center border-2 border-neutral-surface'> {totalItems} </span>

                    </NavLink>
                )}

            </>
    )
}

export default BottomNav