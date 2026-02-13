const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.ENUM('USD', 'VES'),
    allowNull: false,
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveryNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;