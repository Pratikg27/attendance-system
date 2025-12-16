const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  casual_leave: {
    type: DataTypes.INTEGER,
    defaultValue: 12
  },
  sick_leave: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  paid_leave: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  }
}, {
  tableName: 'leave_balance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LeaveBalance;