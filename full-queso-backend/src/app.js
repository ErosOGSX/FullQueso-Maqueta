const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const sequelize = require('./config/database');

// Importar modelos y relaciones
require('./models');

// Importar rutas
const paymentsRoutes = require('./routes/payments');
const ordersRoutes = require('./routes/orders');
const webhooksRoutes = require('./routes/webhooks');

// Importar middleware
const { paymentLimiter, orderLimiter, validateSecurityHeaders, sanitizeInput } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
});
app.use(limiter);

// Middleware para parsing JSON
app.use('/api/webhooks', express.raw({ type: 'application/json' })); // Webhooks necesitan raw body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de seguridad
app.use(validateSecurityHeaders);
app.use(sanitizeInput);

// Rutas con rate limiting
app.use('/api/payments', paymentLimiter, paymentsRoutes);
app.use('/api/orders', orderLimiter, ordersRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MariaDB exitosa');

    // Sincronizar modelos (sin force en producción)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor Full Queso Backend ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();