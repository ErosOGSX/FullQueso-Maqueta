import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu } from 'react-icons/fi'
import LoyaltyCard from '../loyalty/LoyaltyCard'
import RewardsModal from '../loyalty/RewardsModal'
import MobileMenu from './MobileMenu' 

//? Paleta de colores para referencia rápida
// brand-dark: '#3C1E46'
// brand-yellow: '#FACC15'
// brand-primary: '#EF4444'
// brand-dark-light: '#633C7A'
// neutral-surface: '#FFFFFF'
// brand-yellow-light: '#FDE047'


const Logo = () => (
    <NavLink to='/' className='text-2xl font-display-alt text-brand-dark'>Full <span className='text-brand-yellow'>Queso</span></NavLink>
)

const Header = () => {
    const navigate = useNavigate();
    const [showRewards, setShowRewards] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navLinkClasses = 'text-lg font-body font-bold text-black hover:text-brand-primary transition-colors duration-300'

    return (
        <header className='bg-white shadow-md sticky top-0 z-50'>
            
            <div className='container mx-auto px-4 py-3 flex justify-between items-center'> 
                
                <Logo /> 

                <nav className='hidden md:flex items-center gap-6'>

                    <NavLink to='/Menu' className={navLinkClasses}>Menú</NavLink>
                    <NavLink to='/promos' className={navLinkClasses}>Promos</NavLink>
                    <NavLink to='/party-box' className={navLinkClasses}>Party Box</NavLink>

                </nav>

                <div className='flex items-center gap-4'>

                    <div className='hidden md:block cursor-pointer' onClick={() => navigate('/fidelidad')}>
                        <LoyaltyCard compact />
                    </div>

                    <button 
                        onClick={() => {
                            try {
                                navigate('/cuenta');
                            } catch (error) {
                                console.error('Error navigating to cuenta:', error);
                            }
                        }} 
                        className='p-2 hover:bg-brand-yellow-light rounded-full transition-colors'
                    >
                        <FiUser size={24} className='text-neutral-text-muted' />
                    </button>

                    <button 
                        className='md:hidden p-2 hover:bg-brand-yellow-light rounded-full transition-colors'
                        onClick={() => setShowMobileMenu(true)}
                        aria-label="Abrir menú"
                    >
                        <FiMenu size={24} className='text-neutral-text-muted' />
                    </button>

                </div>
                
            </div>

            <RewardsModal 
                isOpen={showRewards} 
                onClose={() => setShowRewards(false)} 
            />

            <MobileMenu 
                isOpen={showMobileMenu} 
                onClose={() => setShowMobileMenu(false)} 
            />

        </header>
    )
}


export default Header

