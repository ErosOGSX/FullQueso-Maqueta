require('dotenv').config();

async function testFinal() {
  try {
    const { Sequelize } = require('sequelize');
    
    console.log('🔄 Test final de conexión...');
    
    // Conexión directa a la base de datos
    const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mariadb',
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a full_queso_db');
    
    // Test simple de query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Query test exitosa:', results[0].test);
    
    await sequelize.close();
    console.log('✅ Conexión cerrada correctamente');
    
    console.log('\n🎉 ¡MariaDB está listo para el backend!');
    console.log('📋 Próximos pasos:');
    console.log('   1. pnpm run db:setup (crear tablas)');
    console.log('   2. pnpm run dev (iniciar servidor)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFinal();