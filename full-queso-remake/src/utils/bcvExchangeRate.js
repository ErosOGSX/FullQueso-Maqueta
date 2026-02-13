// Integración exclusiva con BCV para tasa de cambio oficial
class BCVExchangeService {
  constructor() {
    this.apiUrl = 'https://api.bcv.org.ve/api/v1/exchange-rates';
    this.fallbackUrl = 'https://bcv-api.herokuapp.com/api/v1/exchange-rates';
    this.cacheKey = 'bcv_exchange_rate';
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutos
  }

  async getCurrentRate() {
    try {
      // Verificar caché primero
      const cached = this.getCachedRate();
      if (cached && !this.isCacheExpired(cached.timestamp)) {
        return cached.rate;
      }

      // Obtener nueva tasa del BCV
      const rate = await this.fetchFromBCV();
      
      // Guardar en caché
      this.setCachedRate(rate);
      
      return rate;
    } catch (error) {
      console.error('Error obteniendo tasa BCV:', error);
      
      // Usar caché aunque esté expirado si hay error
      const cached = this.getCachedRate();
      if (cached) {
        return cached.rate;
      }
      
      // Tasa de emergencia (última conocida)
      return 233.04;
    }
  }

  async fetchFromBCV() {
    try {
      // Intentar API oficial del BCV
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FullQueso-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('API oficial no disponible');
      }

      const data = await response.json();
      return this.parseOfficialResponse(data);
      
    } catch (error) {
      // Fallback a API no oficial pero confiable
      return await this.fetchFromFallback();
    }
  }

  async fetchFromFallback() {
    const response = await fetch(this.fallbackUrl);
    
    if (!response.ok) {
      throw new Error('Todas las APIs fallan');
    }

    const data = await response.json();
    return this.parseFallbackResponse(data);
  }

  parseOfficialResponse(data) {
    // Estructura esperada de la API oficial del BCV
    if (data.rates && data.rates.USD) {
      return parseFloat(data.rates.USD.rate);
    }
    throw new Error('Formato de respuesta inválido');
  }

  parseFallbackResponse(data) {
    // Estructura de la API de fallback
    if (data.USD && data.USD.rate) {
      return parseFloat(data.USD.rate);
    }
    throw new Error('Formato de respuesta inválido');
  }

  getCachedRate() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  setCachedRate(rate) {
    try {
      const cacheData = {
        rate: rate,
        timestamp: Date.now(),
        source: 'BCV_OFICIAL'
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error guardando caché:', error);
    }
  }

  isCacheExpired(timestamp) {
    return Date.now() - timestamp > this.cacheExpiry;
  }

  // Convertir USD a VES
  usdToVes(usdAmount) {
    const rate = this.getCachedRate()?.rate || 233.04;
    return usdAmount * rate;
  }

  // Convertir VES a USD
  vesToUsd(vesAmount) {
    const rate = this.getCachedRate()?.rate || 233.04;
    return vesAmount / rate;
  }

  // Obtener información de la última actualización
  getLastUpdate() {
    const cached = this.getCachedRate();
    if (!cached) return null;

    return {
      rate: cached.rate,
      timestamp: cached.timestamp,
      source: cached.source,
      lastUpdate: new Date(cached.timestamp).toLocaleString('es-VE'),
      isExpired: this.isCacheExpired(cached.timestamp)
    };
  }
}

// Instancia global del servicio
export const bcvService = new BCVExchangeService();

// Hook para usar en componentes React
export const useBCVRate = () => {
  const [rate, setRate] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState(null);

  React.useEffect(() => {
    const loadRate = async () => {
      try {
        const currentRate = await bcvService.getCurrentRate();
        setRate(currentRate);
        setLastUpdate(bcvService.getLastUpdate());
      } catch (error) {
        console.error('Error cargando tasa BCV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRate();

    // Actualizar cada 30 minutos
    const interval = setInterval(loadRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { rate, loading, lastUpdate };
};