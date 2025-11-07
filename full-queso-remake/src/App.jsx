import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage'
import MainLayout from "./components/layout/MainLayout";
import CartPage from "./pages/CartPage";

const MenuPage = () => <div className="text-center p-10"><h1 className="font-display text-4xl">Nuestro Menú</h1></div>;
const PromosPage = () => <div className="text-center p-10"><h1 className="font-display text-4xl">Promociones</h1></div>;
const OrdenesPage = () => <div className="text-center p-10"><h1 className="font-display text-4xl">Mis Órdenes</h1></div>;
const CuentaPage = () => <div className="text-center p-10"><h1 className="font-display text-4xl">Mi Cuenta</h1></div>;
const EventoPage = () => <div className="text-center p-10"><h1 className="font-display text-4xl">Arma tu Evento</h1></div>;


function App () {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evento" element={<EventoPage />} />

        <Route element={<MainLayout />}>

            <Route path="/menu" element={<MenuPage />} />
            <Route path="/promos" element={<PromosPage />} />
            <Route path="/ordenes" element={<OrdenesPage />} />
            <Route path="/cuenta" element={<CuentaPage />} />          
            <Route path="/carrito" element={<CartPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App