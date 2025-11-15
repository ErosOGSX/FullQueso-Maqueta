import { useState, useEffect, useRef } from 'react';
import { cacheManager } from '../utils/cacheManager';

export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const imgRef = useRef();
  const observerRef = useRef();

  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYW5kby4uLjwvdGV4dD48L3N2Zz4=',
    threshold = 0.1,
    rootMargin = '50px',
    priority = 'normal'
  } = options;

  useEffect(() => {
    if (!src) return;

    // Check if image is already cached
    const cachedSrc = cacheManager.imageCache.get(src);
    if (cachedSrc) {
      setImageSrc(cachedSrc);
      setIsLoading(false);
      return;
    }

    // Set placeholder initially
    setImageSrc(placeholder);

    // Create intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        async (entries) => {
          const [entry] = entries;
          
          if (entry.isIntersecting) {
            try {
              setIsLoading(true);
              const optimizedSrc = await cacheManager.cacheImage(src, priority);
              setImageSrc(optimizedSrc);
              setError(null);
            } catch (err) {
              setError(err);
              setImageSrc(src); // Fallback to original
            } finally {
              setIsLoading(false);
              observerRef.current?.disconnect();
            }
          }
        },
        { threshold, rootMargin }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      cacheManager.cacheImage(src, priority)
        .then(optimizedSrc => {
          setImageSrc(optimizedSrc);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setImageSrc(src);
          setIsLoading(false);
        });
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, placeholder, threshold, rootMargin, priority]);

  return {
    imgRef,
    src: imageSrc,
    isLoading,
    error
  };
};

// Hook for preloading critical images
export const useImagePreloader = (urls, priority = 'high') => {
  const [preloaded, setPreloaded] = useState(false);

  useEffect(() => {
    if (!urls?.length) return;

    cacheManager.preloadImages(urls, priority)
      .then(() => setPreloaded(true))
      .catch(console.warn);
  }, [urls, priority]);

  return preloaded;
};