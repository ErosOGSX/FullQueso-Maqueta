import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu } from 'react-icons/fi' 

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
    const navLinkClasses = 'text-lg font-body font-bold text-brand-dark-light hover:text-brand-primary transition-colors duration-300'

    return (
        <header className='bg-neutral-surface shadow-md sticky top-0 z-50'>
            
            <div className='container mx-auto px-4 py-3 flex justify-between items-center'> 
                
                <Logo /> 

                <nav className='hidden md:flex items-center gap-6'>

                    <NavLink to='/Menu' className={navLinkClasses}>Menú</NavLink>
                    <NavLink to='/promos' className={navLinkClasses}>Promos</NavLink>
                    <NavLink to='/party-box' className={navLinkClasses}>Party Box</NavLink>

                </nav>

                <div className='flex items-center gap-4'>

                    <button className='p-2 hover:bg-brand-yellow-light rounded-full transition-colors'>

                        <FiUser size={24} className='text-brand-dark' />

                    </button>

                    <button className='md:hidden p-2'>

                        <FiMenu size={24} className='text-brand-dark' />

                    </button>

                </div>
                
            </div>

        </header>
    )
}


export default Header

