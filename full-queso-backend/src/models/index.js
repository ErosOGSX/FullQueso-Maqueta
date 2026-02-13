const Customer = require('./Customer');
const Order = require('./Order');
const Transaction = require('./Transaction');
const BankConfig = require('./BankConfig');

// Definir relaciones
Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Order.hasMany(Transaction, { foreignKey: 'orderId', as: 'transactions' });
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  Customer,
  Order,
  Transaction,
  BankConfig
};