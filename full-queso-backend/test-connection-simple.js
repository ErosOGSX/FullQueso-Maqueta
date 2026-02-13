require('dotenv').config();

async function testConnection() {
  console.log('🔄 Probando conexión básica...');
  
  // Mostrar configuración
  console.log('📋 Configuración actual:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Puerto: ${process.env.DB_PORT}`);
  console.log(`   Usuario: ${process.env.DB_USER}`);
  console.log(`   Contraseña: ${process.env.DB_PASSWORD ? '***' : 'NO CONFIGURADA'}`);
  console.log(`   Base de datos: ${process.env.DB_NAME}`);
  
  try {
    const { Sequelize } = require('sequelize');
    
    // Test 1: Conexión sin base de datos
    console.log('\n🧪 Test 1: Conexión al servidor...');
    const sequelize = new Sequelize('mysql', process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mariadb',
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('✅ Conexión al servidor exitosa');
    
    // Test 2: Listar bases de datos
    console.log('\n🧪 Test 2: Listando bases de datos...');
    const [results] = await sequelize.query('SHOW DATABASES');
    console.log('📋 Bases de datos disponibles:');
    results.forEach(db => console.log(`   - ${db.Database}`));
    
    // Test 3: Crear base de datos si no existe
    console.log('\n🧪 Test 3: Creando base de datos...');
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Base de datos '${process.env.DB_NAME}' lista`);
    
    await sequelize.close();
    
    // Test 4: Conexión a la base de datos específica
    console.log('\n🧪 Test 4: Conexión a base de datos específica...');
    const dbSequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mariadb',
      logging: false
    });
    
    await dbSequelize.authenticate();
    console.log('✅ Conexión a base de datos específica exitosa');
    
    await dbSequelize.close();
    
    console.log('\n🎉 ¡Todos los tests pasaron! MariaDB está listo.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('📋 Código de error:', error.original?.code || 'N/A');
    
    // Diagnósticos específicos
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUCIÓN: MariaDB no está corriendo');
      console.log('   1. Abre Servicios de Windows (services.msc)');
      console.log('   2. Busca "MySQL" o "MariaDB"');
      console.log('   3. Click derecho → Iniciar');
    }
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 SOLUCIÓN: Problema de autenticación');
      console.log('   1. Verifica la contraseña en .env');
      console.log('   2. Prueba conectar con HeidiSQL primero');
    }
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUCIÓN: Problema de conexión');
      console.log('   1. Verifica que el puerto 3306 esté libre');
      console.log('   2. Prueba cambiar DB_HOST=127.0.0.1');
    }
  }
}

testConnection();