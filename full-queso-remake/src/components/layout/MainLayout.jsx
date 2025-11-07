import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

const MainLayout = () => {
    <div className='font-body bg-neutral-background min-h-screen'>
        <header />
        <main className='pb-20 md:pb-0'>
            <Outlet />
        </main>
        <BottomNav />    
    </div>
}

export default MainLayout