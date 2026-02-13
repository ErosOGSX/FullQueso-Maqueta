import React from 'react';
import { FiTarget, FiTrendingUp, FiAward } from 'react-icons/fi';
import useEnhancedTimeStore from '../../store/enhancedTimeStore';

const TimeAccuracyStats = () => {
  const { getAccuracyStats } = useEnhancedTimeStore();
  const stats = getAccuracyStats();

  if (stats.totalPredictions === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FiTarget className="text-blue-600" size={16} />
          <h4 className="font-body font-bold text-blue-800">Precisión de Tiempos</h4>
        </div>
        <p className="font-body text-blue-700 text-sm">
          Realizando calibración inicial... Los tiempos mejorarán con cada pedido.
        </p>
      </div>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 95) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (accuracy >= 85) return { text: 'Muy Bueno', color: 'bg-blue-100 text-blue-800' };
    if (accuracy >= 75) return { text: 'Bueno', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Mejorando', color: 'bg-orange-100 text-orange-800' };
  };

  const badge = getAccuracyBadge(stats.avgAccuracy);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiTarget className="text-blue-600" size={16} />
          <h4 className="font-body font-bold text-gray-800">Precisión de Tiempos</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-body font-bold ${badge.color}`}>
          {badge.text}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Precisión Promedio */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getAccuracyColor(stats.avgAccuracy)}`}>
            {stats.avgAccuracy}%
          </div>
          <div className="text-xs text-gray-500 font-body">Precisión</div>
        </div>

        {/* Total de Predicciones */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">
            {stats.totalPredictions}
          </div>
          <div className="text-xs text-gray-500 font-body">Pedidos</div>
        </div>

        {/* Tendencia de Mejora */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <FiTrendingUp 
              className={stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'} 
              size={16} 
            />
            <span className={`text-lg font-bold ${
              stats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}%
            </span>
          </div>
          <div className="text-xs text-gray-500 font-body">Tendencia</div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <FiAward className="text-yellow-500" size={14} />
          <p className="font-body text-xs text-gray-600">
            {stats.avgAccuracy >= 90 
              ? '¡Excelente! Nuestros tiempos son muy precisos.'
              : stats.avgAccuracy >= 80
              ? 'Muy bien! Seguimos mejorando nuestras estimaciones.'
              : 'Trabajando para darte tiempos más precisos cada día.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeAccuracyStats;