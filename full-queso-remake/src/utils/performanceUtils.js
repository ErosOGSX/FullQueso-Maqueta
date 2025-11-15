// Performance optimization utilities

// Debounce function for search and input events
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization for expensive calculations
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Virtual scrolling helper for large lists
export class VirtualScroller {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }

  getVisibleRange(scrollTop, totalItems) {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + this.buffer * 2);
    
    return { startIndex, endIndex, visibleCount };
  }

  getItemStyle(index) {
    return {
      position: 'absolute',
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: '100%'
    };
  }
}

// Batch DOM updates for better performance
export const batchDOMUpdates = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 100 });
  } else {
    requestAnimationFrame(callback);
  }
};

// Preload critical resources
export const preloadResource = (href, as = 'fetch', crossorigin = 'anonymous') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  document.head.appendChild(link);
};

// Web Workers for heavy computations
export class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workers = [];
    this.queue = [];
    this.activeJobs = new Map();
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = this.handleWorkerMessage.bind(this);
      this.workers.push({ worker, busy: false });
    }
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      const job = { data, resolve, reject, id: Date.now() + Math.random() };
      
      const availableWorker = this.workers.find(w => !w.busy);
      
      if (availableWorker) {
        this.assignJob(availableWorker, job);
      } else {
        this.queue.push(job);
      }
    });
  }

  assignJob(workerInfo, job) {
    workerInfo.busy = true;
    this.activeJobs.set(workerInfo.worker, job);
    workerInfo.worker.postMessage({ ...job.data, jobId: job.id });
  }

  handleWorkerMessage(event) {
    const worker = event.target;
    const job = this.activeJobs.get(worker);
    
    if (job) {
      if (event.data.error) {
        job.reject(new Error(event.data.error));
      } else {
        job.resolve(event.data.result);
      }
      
      this.activeJobs.delete(worker);
      const workerInfo = this.workers.find(w => w.worker === worker);
      workerInfo.busy = false;
      
      // Process next job in queue
      if (this.queue.length > 0) {
        const nextJob = this.queue.shift();
        this.assignJob(workerInfo, nextJob);
      }
    }
  }

  terminate() {
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];
    this.queue = [];
    this.activeJobs.clear();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startMeasure(name) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    this.metrics.set(name, measure.duration);
    
    return measure.duration;
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  observePerformance() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.set('LCP', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            this.metrics.set('FID', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const currentCLS = this.metrics.get('CLS') || 0;
            this.metrics.set('CLS', currentCLS + entry.value);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Performance observer not supported:', e);
      }
    }
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();

// Auto-start performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.observePerformance();
}