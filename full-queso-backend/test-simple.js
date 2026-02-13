const mysql = require('mysql2/promise');

async function testSimpleConnection() {
  try {
    console.log('🔄 Probando conexión simple a MariaDB...');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Eros0140142d**',
      connectTimeout: 5000,
      acquireTimeout: 5000,
      timeout: 5000
    });
    
    console.log('✅ ¡Conexión exitosa!');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta exitosa:', rows);
    
    // Crear base de datos si no existe
    await connection.execute('CREATE DATABASE IF NOT EXISTS full_queso_db');
    console.log('✅ Base de datos creada/verificada');
    
    await connection.end();
    console.log('🔒 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Código:', error.code);
    console.error('📋 Errno:', error.errno);
  }
}

testSimpleConnection();