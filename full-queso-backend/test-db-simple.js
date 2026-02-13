require('dotenv').config();
const sequelize = require('./src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔄 Probando conexión a MariaDB...');
    console.log(`📍 Conectando a: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`👤 Usuario: ${process.env.DB_USER}`);
    console.log(`🗄️ Base de datos: ${process.env.DB_NAME}`);
    
    // Probar autenticación
    await sequelize.authenticate();
    console.log('✅ ¡Conexión exitosa a MariaDB!');
    
    // Probar una consulta simple
    const [results] = await sequelize.query('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Consulta exitosa:', results[0]);
    
    // Cerrar conexión
    await sequelize.close();
    console.log('🔒 Conexión cerrada exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('📋 Tipo de error:', error.name);
    
    if (error.original) {
      console.error('📋 Error original:', error.original.code);
      console.error('📋 SQL State:', error.original.sqlState);
      console.error('📋 Errno:', error.original.errno);
    }
    
    // Sugerencias de solución
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verificar que MariaDB esté corriendo: sc query mariadb');
    console.log('2. Verificar puerto: netstat -an | findstr :3306');
    console.log('3. Verificar credenciales en .env');
    console.log('4. Probar conexión directa: mysql -u root -p -h 127.0.0.1');
  }
}

testDatabaseConnection();