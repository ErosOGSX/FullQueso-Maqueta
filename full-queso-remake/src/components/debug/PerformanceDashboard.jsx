import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performanceUtils';
import { cacheManager } from '../../utils/cacheManager';
import { useCacheManager } from '../../hooks/useServiceWorker';

const PerformanceDashboard = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState({});
  const [cacheStats, setCacheStats] = useState({});
  const { cacheSize, cacheInfo, clearAllCaches } = useCacheManager();

  useEffect(() => {
    if (isOpen) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateMetrics = () => {
    setMetrics(performanceMonitor.getMetrics());
    setCacheStats(cacheManager.getStats());
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Performance Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-mono text-blue-600">
                      {typeof value === 'number' ? formatTime(value) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cache Statistics */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Cache Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Image Cache:</span>
                  <span className="font-mono text-green-600">{cacheStats.imageCache || 0} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Cache:</span>
                  <span className="font-mono text-green-600">{cacheStats.dataCache || 0} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Usage:</span>
                  <span className="font-mono text-green-600">{cacheStats.totalMemory || 0} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SW Cache Size:</span>
                  <span className="font-mono text-green-600">{cacheSize} items</span>
                </div>
              </div>
            </div>

            {/* Service Worker Cache */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Service Worker Cache</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(cacheInfo).map(([cacheName, count]) => (
                  <div key={cacheName} className="flex justify-between">
                    <span className="text-gray-600 truncate">{cacheName}:</span>
                    <span className="font-mono text-purple-600">{count} items</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    cacheManager.clearAll();
                    updateMetrics();
                  }}
                  className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                >
                  Clear Memory Cache
                </button>
                <button
                  onClick={() => {
                    clearAllCaches();
                    updateMetrics();
                  }}
                  className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
                >
                  Clear SW Cache
                </button>
                <button
                  onClick={updateMetrics}
                  className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                >
                  Refresh Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;