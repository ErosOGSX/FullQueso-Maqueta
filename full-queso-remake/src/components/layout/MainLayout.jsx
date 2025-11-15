import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import CartReminder from '../cart/CartReminder'

const MainLayout = () => {
    return (
        <div className='font-body bg-neutral-background min-h-screen'>
            <Header />
            <main className='pb-20 md:pb-0'>
                <Outlet />
            </main>
            <BottomNav />
            <CartReminder />
        </div>
    )
}

export default MainLayout