require('dotenv').config();

async function createDatabase() {
  try {
    const { Sequelize } = require('sequelize');
    
    console.log('🔄 Creando base de datos...');
    
    // Conectar sin especificar base de datos
    const sequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mariadb',
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('✅ Conectado al servidor MariaDB');
    
    // Crear base de datos
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Base de datos '${process.env.DB_NAME}' creada`);
    
    await sequelize.close();
    console.log('✅ Listo para usar');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDatabase();