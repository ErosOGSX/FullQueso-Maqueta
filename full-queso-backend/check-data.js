require('dotenv').config();
const sequelize = require('./src/config/database');

async function checkData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...');
    
    // Verificar clientes
    const customers = await sequelize.query("SELECT * FROM customers", { type: sequelize.QueryTypes.SELECT });
    console.log('\n👥 Clientes en la base de datos:');
    customers.forEach(customer => {
      console.log(`  📧 ${customer.email} - ${customer.name} (${customer.phone})`);
      console.log(`     ID: ${customer.id}`);
      console.log(`     Creado: ${customer.created_at}`);
    });
    
    // Verificar órdenes
    const orders = await sequelize.query("SELECT * FROM orders", { type: sequelize.QueryTypes.SELECT });
    console.log('\n📦 Órdenes en la base de datos:');
    orders.forEach(order => {
      console.log(`  🆔 ${order.id}`);
      console.log(`     Cliente: ${order.customerId}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Estado: ${order.status}`);
      console.log(`     Creado: ${order.created_at}`);
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`   👥 Total clientes: ${customers.length}`);
    console.log(`   📦 Total órdenes: ${orders.length}`);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();