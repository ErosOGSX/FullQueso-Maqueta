const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('stripe', 'venecard', 'pago_movil', 'bank_transfer'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('USD', 'VES'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'pending_verification'),
    allowNull: false,
    defaultValue: 'pending'
  },
  // Stripe
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Venecard
  venecardTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Pago Móvil / Transferencias
  bankReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    allowNull: true,
    defaultValue: 'pending'
  },
  // Metadata adicional
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Transaction;