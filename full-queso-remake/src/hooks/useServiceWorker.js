import { useEffect, useState } from 'react';

export const useServiceWorker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(registration);
      setIsRegistered(true);

      console.log('Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
            console.log('New service worker available');
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'CACHE_UPDATED') {
          // Handle cache updates
          console.log('Cache updated:', event.data.payload);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = async () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        setIsRegistered(false);
        setRegistration(null);
        console.log('Service Worker unregistered successfully');
      }
    }
  };

  // Cache management functions
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  };

  const getCacheInfo = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const cacheInfo = {};
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = {
          count: keys.length,
          urls: keys.map(request => request.url)
        };
      }
      
      return cacheInfo;
    }
    
    return {};
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    registration,
    updateServiceWorker,
    unregisterServiceWorker,
    clearCache,
    getCacheInfo
  };
};

// Hook for offline status
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook for cache management
export const useCacheManager = () => {
  const [cacheSize, setCacheSize] = useState(0);
  const [cacheInfo, setCacheInfo] = useState({});

  const updateCacheInfo = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      const info = {};
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        info[cacheName] = keys.length;
        totalSize += keys.length;
      }
      
      setCacheSize(totalSize);
      setCacheInfo(info);
    }
  };

  useEffect(() => {
    updateCacheInfo();
    
    // Update cache info periodically
    const interval = setInterval(updateCacheInfo, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const clearSpecificCache = async (cacheName) => {
    if ('caches' in window) {
      await caches.delete(cacheName);
      updateCacheInfo();
    }
  };

  const clearAllCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      updateCacheInfo();
    }
  };

  return {
    cacheSize,
    cacheInfo,
    updateCacheInfo,
    clearSpecificCache,
    clearAllCaches
  };
};