const sequelize = require('../config/database');

// Importar modelos
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const BankConfig = require('../models/BankConfig');

async function setupDatabase() {
  try {
    console.log('🔄 Conectando a MariaDB...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    console.log('🔄 Creando tablas...');
    await sequelize.sync({ force: true }); // force: true recrea las tablas
    console.log('✅ Tablas creadas exitosamente');

    console.log('🔄 Insertando datos iniciales...');
    
    // Configuración de bancos venezolanos
    await BankConfig.bulkCreate([
      {
        bankName: 'Banesco',
        supportedMethods: ['cards', 'mobile_payment', 'transfers'],
        isActive: true
      },
      {
        bankName: 'Mercantil',
        supportedMethods: ['cards', 'mobile_payment', 'transfers'],
        isActive: true
      },
      {
        bankName: 'BBVA Provincial',
        supportedMethods: ['cards', 'mobile_payment', 'transfers'],
        isActive: true
      },
      {
        bankName: 'Banco de Venezuela',
        supportedMethods: ['mobile_payment', 'transfers'],
        isActive: true
      },
      {
        bankName: 'BDT',
        supportedMethods: ['cards', 'transfers'],
        isActive: true
      },
      {
        bankName: 'Banco del Tesoro',
        supportedMethods: ['transfers'],
        isActive: true
      },
      {
        bankName: 'Banco Exterior',
        supportedMethods: ['transfers'],
        isActive: true
      }
    ]);

    console.log('✅ Datos iniciales insertados');
    console.log('🎉 Base de datos configurada correctamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    process.exit(1);
  }
}

setupDatabase();