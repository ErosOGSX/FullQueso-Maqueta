const rateLimit = require('express-rate-limit');

// Rate limiting específico para pagos
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de pago por IP
  message: {
    error: 'Demasiados intentos de pago. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para creación de órdenes
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 órdenes por IP
  message: {
    error: 'Demasiadas órdenes creadas. Intenta de nuevo en 5 minutos.'
  }
});

// Validar headers de seguridad
const validateSecurityHeaders = (req, res, next) => {
  const userAgent = req.get('User-Agent');
  const origin = req.get('Origin');
  
  // En desarrollo, ser menos restrictivo
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Verificar que viene del frontend autorizado
  if (origin && origin !== process.env.FRONTEND_URL) {
    return res.status(403).json({ error: 'Origen no autorizado' });
  }
  
  // Verificar User-Agent básico (evitar bots simples)
  if (!userAgent || userAgent.length < 10) {
    return res.status(403).json({ error: 'User-Agent inválido' });
  }
  
  next();
};

// Sanitizar entrada de datos
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  paymentLimiter,
  orderLimiter,
  validateSecurityHeaders,
  sanitizeInput
};