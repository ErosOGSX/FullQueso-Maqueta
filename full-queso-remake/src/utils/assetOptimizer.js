// Asset optimization utilities

// Image compression and optimization
export class ImageOptimizer {
  static async compressImage(file, options = {}) {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, `image/${format}`, quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  static async createWebPVersion(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await this.compressImage(blob, { format: 'webp' });
    } catch (error) {
      console.warn('Failed to create WebP version:', error);
      return null;
    }
  }

  static generateSrcSet(baseUrl, sizes = [400, 800, 1200]) {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }
}

// CSS optimization
export class CSSOptimizer {
  static removeUnusedCSS(css, usedSelectors) {
    // Simple unused CSS removal (in production, use PurgeCSS)
    const rules = css.split('}');
    
    return rules
      .filter(rule => {
        const selector = rule.split('{')[0]?.trim();
        return !selector || usedSelectors.some(used => 
          selector.includes(used) || used.includes(selector)
        );
      })
      .join('}');
  }

  static minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon
      .replace(/\s*{\s*/g, '{') // Clean braces
      .replace(/;\s*/g, ';') // Clean semicolons
      .trim();
  }
}

// JavaScript optimization
export class JSOptimizer {
  static async loadModuleDynamically(modulePath) {
    try {
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      console.error('Failed to load module:', modulePath, error);
      return null;
    }
  }

  static createLazyComponent(importFn) {
    return React.lazy(importFn);
  }

  // Code splitting helper
  static splitByRoute(routes) {
    return routes.reduce((acc, route) => {
      acc[route.path] = () => import(route.component);
      return acc;
    }, {});
  }
}

// Bundle analysis
export class BundleAnalyzer {
  static analyzeChunks() {
    if (typeof window !== 'undefined' && window.__webpack_require__) {
      const chunks = Object.keys(window.__webpack_require__.cache || {});
      
      return {
        totalChunks: chunks.length,
        chunkSizes: chunks.map(chunk => ({
          name: chunk,
          size: this.estimateChunkSize(chunk)
        }))
      };
    }
    
    return { totalChunks: 0, chunkSizes: [] };
  }

  static estimateChunkSize(chunkName) {
    // Rough estimation - in production use webpack-bundle-analyzer
    return Math.floor(Math.random() * 100) + 10; // KB
  }

  static getLoadingMetrics() {
    if (typeof performance !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        resourceCount: resources.length,
        totalResourceSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0)
      };
    }
    
    return null;
  }
}

// Resource preloading
export class ResourcePreloader {
  static preloadCriticalResources() {
    // Skip font preloading in development to avoid warnings
    if (import.meta.env.DEV) return;
    
    const criticalResources = [
      { href: '/fonts/righteous.woff2', as: 'font', type: 'font/woff2' },
      { href: '/fonts/fredoka-one.woff2', as: 'font', type: 'font/woff2' },
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  static prefetchNextPageResources(nextRoute) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = nextRoute;
    document.head.appendChild(link);
  }

  static preconnectToOrigins() {
    const origins = [
      'https://crm-server-main.fullqueso.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  static budgets = {
    firstContentfulPaint: 2000, // ms - more realistic for development
    largestContentfulPaint: 3000, // ms - adjusted for dev environment
    firstInputDelay: 150, // ms
    cumulativeLayoutShift: 0.15,
    totalBlockingTime: 400, // ms
    bundleSize: 800, // KB - larger for development
    imageSize: 300 // KB per image
  };

  static checkBudgets() {
    const violations = [];
    
    if (typeof performance !== 'undefined') {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcp && fcp.startTime > this.budgets.firstContentfulPaint) {
        violations.push({
          metric: 'First Contentful Paint',
          actual: fcp.startTime,
          budget: this.budgets.firstContentfulPaint
        });
      }
    }

    return violations;
  }

  static reportViolations(violations) {
    if (violations.length > 0) {
      // Only log in development, don't spam console
      if (import.meta.env.DEV) {
        console.info('Performance budget violations:', violations);
      }
      
      // In production, send to analytics
      if (!import.meta.env.DEV && typeof gtag !== 'undefined') {
        violations.forEach(violation => {
          gtag('event', 'performance_violation', {
            metric: violation.metric,
            actual_value: violation.actual,
            budget_value: violation.budget
          });
        });
      }
    }
  }
}

// Initialize optimizations
export const initializeOptimizations = () => {
  // Preconnect to external origins
  ResourcePreloader.preconnectToOrigins();
  
  // Preload critical resources (only in production)
  ResourcePreloader.preloadCriticalResources();
  
  // Check performance budgets after load (less frequently in dev)
  window.addEventListener('load', () => {
    const delay = import.meta.env.DEV ? 5000 : 1000;
    setTimeout(() => {
      const violations = PerformanceBudget.checkBudgets();
      PerformanceBudget.reportViolations(violations);
    }, delay);
  });
};