import React from 'react';
import { FiClock, FiSun, FiCloud, FiUsers } from 'react-icons/fi';
import useEnhancedTimeStore from '../../store/enhancedTimeStore';

const ExternalFactorsIndicator = () => {
  const { externalFactors } = useEnhancedTimeStore();
  const currentHour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  const isPeakHour = externalFactors.peakHours.includes(currentHour);

  const factors = [];

  // Factor de hora pico
  if (isPeakHour) {
    factors.push({
      icon: FiClock,
      text: 'Hora Pico',
      description: '+30% tiempo estimado',
      color: 'text-orange-600 bg-orange-100'
    });
  }

  // Factor de fin de semana
  if (isWeekend) {
    factors.push({
      icon: FiSun,
      text: 'Fin de Semana',
      description: '+20% tiempo estimado',
      color: 'text-blue-600 bg-blue-100'
    });
  }

  // Factor de clima
  if (externalFactors.weatherDelay > 0) {
    factors.push({
      icon: FiCloud,
      text: 'Clima Adverso',
      description: `+${externalFactors.weatherDelay} min`,
      color: 'text-gray-600 bg-gray-100'
    });
  }

  // Factor de carga de trabajo
  if (externalFactors.activeOrders > 5) {
    factors.push({
      icon: FiUsers,
      text: 'Alta Demanda',
      description: `${externalFactors.activeOrders} pedidos activos`,
      color: 'text-red-600 bg-red-100'
    });
  }

  if (factors.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-body text-sm text-green-800 font-medium">
            Condiciones óptimas - Tiempos normales
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="font-body text-sm text-yellow-800 font-medium">
          Factores que pueden afectar el tiempo:
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {factors.map((factor, index) => {
          const IconComponent = factor.icon;
          return (
            <div
              key={index}
              className={`flex items-center gap-1 px-2 py-1 rounded-full ${factor.color}`}
            >
              <IconComponent size={12} />
              <span className="text-xs font-body font-medium">
                {factor.text}
              </span>
              <span className="text-xs font-body opacity-75">
                ({factor.description})
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="font-body text-xs text-yellow-700 mt-2">
        💡 Los tiempos se ajustan automáticamente considerando estos factores.
      </p>
    </div>
  );
};

export default ExternalFactorsIndicator;