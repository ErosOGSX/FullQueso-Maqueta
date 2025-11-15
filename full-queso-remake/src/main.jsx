import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { initializeOptimizations } from './utils/assetOptimizer'
import { performanceMonitor } from './utils/performanceUtils'

// Initialize performance optimizations
initializeOptimizations();

// Start performance monitoring
performanceMonitor.startMeasure('app-initialization');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// End performance monitoring
performanceMonitor.endMeasure('app-initialization');

// Log performance metrics in development (less frequently)
if (import.meta.env.DEV) {
  setTimeout(() => {
    const metrics = performanceMonitor.getMetrics();
    if (Object.keys(metrics).length > 0) {
      console.log('Performance Metrics:', metrics);
    }
  }, 5000);
}
