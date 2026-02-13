const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BankConfig = sequelize.define('BankConfig', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  supportedMethods: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'bank_configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = BankConfig;