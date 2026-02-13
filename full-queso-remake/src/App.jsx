import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage'
import MainLayout from "./components/layout/MainLayout";
import CartPage from "./pages/CartPage";
import EventoPage from "./pages/EventoPage";
import MenuPage from './pages/MenuPage';
import AccountPage from './pages/AccountPage';
import PromoPage from './pages/PromoPage';
import OrdersPage from './pages/OrdersPage';
import LoyaltyPage from './pages/LoyaltyPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import ToastContainer from './components/notifications/ToastContainer';
import SupportChat from './components/chat/SupportChat';
import pushNotifications from './utils/pushNotifications';
import useExchangeRateStore from './store/exchangeRateStore';
import useCartSync from './hooks/useCartSync';
import { useServiceWorker, useOfflineStatus } from './hooks/useServiceWorker';
import useNotificationStore from './store/notificationStore';
import useOrdersStore from './store/ordersStore';


// Componentes de página temporales

// CuentaPage ahora usa AccountPage


function App () {
  const { updateExchangeRate } = useExchangeRateStore();
  const { info, warning } = useNotificationStore();
  const { initializeTimers } = useOrdersStore();
  
  // Inicializar sincronización del carrito
  useCartSync();
  
  // Inicializar service worker
  const { isSupported, isRegistered, updateAvailable, updateServiceWorker } = useServiceWorker();
  const isOnline = useOfflineStatus();
  
  // Show offline/online status
  useEffect(() => {
    if (!isOnline) {
      warning('Sin Conexión', 'Estás navegando sin conexión. Algunas funciones pueden estar limitadas.');
    } else {
      info('Conexión Restaurada', 'Ya tienes conexión a internet nuevamente.');
    }
  }, [isOnline, warning, info]);
  
  // Show update notification
  useEffect(() => {
    if (updateAvailable) {
      info('Actualización Disponible', 'Hay una nueva versión disponible. Recarga la página para actualizar.', {
        action: {
          label: 'Actualizar',
          onClick: updateServiceWorker
        }
      });
    }
  }, [updateAvailable, updateServiceWorker, info]);


  useEffect(() => {
    // Inicializar notificaciones push
    const initNotifications = async () => {
      await pushNotifications.init();
      const hasPermission = await pushNotifications.requestPermission();
      
      if (hasPermission) {
        console.log('Push notifications enabled');
        setTimeout(() => {
          pushNotifications.simulatePromoNotification('discount');
        }, 10000);
      }
    };
    
    // Actualizar tasa de cambio al iniciar
    updateExchangeRate();
    
    // Actualizar tasa cada 30 minutos
    const exchangeInterval = setInterval(updateExchangeRate, 30 * 60 * 1000);
    
    initNotifications();
    
    // Log service worker status
    if (import.meta.env.DEV) {
      console.log('Service Worker Support:', isSupported);
      console.log('Service Worker Registered:', isRegistered);
      console.log('Online Status:', isOnline);
    }
    
    return () => clearInterval(exchangeInterval);
  }, [updateExchangeRate, isSupported, isRegistered, isOnline]);
  
  // Initialize order timers separately
  useEffect(() => {
    initializeTimers();
  }, [initializeTimers]);

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evento" element={<EventoPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-callback" element={<PaymentCallbackPage />} />

        <Route element={<MainLayout />}>

            <Route path="/menu" element={<MenuPage />} />
            <Route path="/promos" element={<PromoPage />} />
            <Route path="/ordenes" element={<OrdersPage />} />
            <Route path="/fidelidad" element={<LoyaltyPage />} />
            <Route path="/cuenta" element={<AccountPage />} />          
            <Route path="/carrito" element={<CartPage />} />

        </Route>
      </Routes>
      <ToastContainer />
      <SupportChat />
    </BrowserRouter>
  )
}

export default App