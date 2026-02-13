require('dotenv').config();
const sequelize = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a MariaDB...');
    console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`👤 Usuario: ${process.env.DB_USER}`);
    
    // Primero conectar sin base de datos específica
    const { Sequelize } = require('sequelize');
    const tempSequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mariadb',
      logging: false
    });
    
    await tempSequelize.authenticate();
    console.log('✅ ¡Conexión exitosa a MariaDB!');
    
    // Crear la base de datos
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Base de datos creada/verificada');
    
    await tempSequelize.close();
    
    // Ahora conectar a la base de datos específica
    console.log(`🗄️ Conectando a base de datos: ${process.env.DB_NAME}`);
    await sequelize.authenticate();
    console.log('✅ ¡Conexión exitosa a la base de datos!');
    
    // Cerrar conexión
    await sequelize.close();
    console.log('🔒 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.original) {
      console.error('📋 Detalles del error:', error.original.code);
      
      switch (error.original.code) {
        case 'ECONNREFUSED':
          console.log('💡 Solución: Asegúrate de que MariaDB esté corriendo');
          console.log('   Comando: net start mysql (como administrador)');
          break;
        case 'ER_ACCESS_DENIED_ERROR':
          console.log('💡 Solución: Verifica usuario y contraseña en .env');
          break;
        case 'ER_BAD_DB_ERROR':
          console.log('💡 Solución: La base de datos no existe, se creará automáticamente');
          break;
      }
    }
  }
}

testConnection();