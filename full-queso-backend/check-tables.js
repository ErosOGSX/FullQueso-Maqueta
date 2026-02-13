require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...');
    
    // Listar todas las tablas
    const tables = await sequelize.query("SHOW TABLES", { type: sequelize.QueryTypes.SELECT });
    console.log('📋 Tablas encontradas:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Verificar si existe tabla customers
    const hasCustomers = tables.some(table => Object.values(table)[0] === 'customers');
    const hasOrders = tables.some(table => Object.values(table)[0] === 'orders');
    
    console.log('\n✅ Estado de las tablas:');
    console.log('👤 Customers:', hasCustomers ? 'Existe' : 'No existe');
    console.log('📦 Orders:', hasOrders ? 'Existe' : 'No existe');
    
    if (hasCustomers) {
      const customerColumns = await sequelize.query("DESCRIBE customers", { type: sequelize.QueryTypes.SELECT });
      console.log('\n👤 Columnas de customers:');
      customerColumns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

checkTables();