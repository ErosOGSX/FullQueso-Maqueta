// Intelligent Cache Manager for Full Queso
class CacheManager {
  constructor() {
    this.imageCache = new Map();
    this.dataCache = new Map();
    this.cacheExpiry = new Map();
    this.maxCacheSize = 50; // Maximum cached items
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes
  }

  // Image caching with preloading
  async cacheImage(url, priority = 'normal') {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const promise = new Promise((resolve, reject) => {
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Optimize image size
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to optimized blob
          canvas.toBlob((blob) => {
            const optimizedUrl = URL.createObjectURL(blob);
            this.imageCache.set(url, optimizedUrl);
            this.cleanupCache();
            resolve(optimizedUrl);
          }, 'image/webp', 0.8);
        };
        
        img.onerror = reject;
      });
      
      img.src = url;
      return await promise;
    } catch (error) {
      console.warn('Failed to cache image:', url, error);
      return url; // Return original URL as fallback
    }
  }

  // Preload critical images
  preloadImages(urls, priority = 'high') {
    const promises = urls.map(url => this.cacheImage(url, priority));
    return Promise.allSettled(promises);
  }

  // Data caching with TTL
  setData(key, data, ttl = this.defaultTTL) {
    this.dataCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
    this.cleanupCache();
  }

  getData(key) {
    if (!this.dataCache.has(key)) return null;
    
    const expiry = this.cacheExpiry.get(key);
    if (Date.now() > expiry) {
      this.dataCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    
    return this.dataCache.get(key);
  }

  // Cleanup old cache entries
  cleanupCache() {
    // Remove expired data
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (Date.now() > expiry) {
        this.dataCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }

    // Limit cache size (LRU-like)
    if (this.imageCache.size > this.maxCacheSize) {
      const entries = Array.from(this.imageCache.entries());
      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      
      toRemove.forEach(([key, url]) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
        this.imageCache.delete(key);
      });
    }
  }

  // Clear all caches
  clearAll() {
    // Revoke blob URLs to prevent memory leaks
    for (const url of this.imageCache.values()) {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    
    this.imageCache.clear();
    this.dataCache.clear();
    this.cacheExpiry.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      imageCache: this.imageCache.size,
      dataCache: this.dataCache.size,
      totalMemory: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let size = 0;
    
    // Estimate image cache size (rough approximation)
    size += this.imageCache.size * 100; // ~100KB per cached image
    
    // Estimate data cache size
    for (const data of this.dataCache.values()) {
      size += JSON.stringify(data).length * 2; // UTF-16 encoding
    }
    
    return Math.round(size / 1024); // Return in KB
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  cacheManager.clearAll();
});

// Periodic cleanup
setInterval(() => {
  cacheManager.cleanupCache();
}, 5 * 60 * 1000); // Every 5 minutes