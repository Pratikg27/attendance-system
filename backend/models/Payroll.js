const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  month: {
    type: DataTypes.STRING(7),
    allowNull: false
  },
  basic_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  hra: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  da: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  other_allowances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  gross_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pf_deduction: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tax_deduction: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  other_deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  overtime_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  net_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  working_days: {
    type: DataTypes.INTEGER,
    defaultValue: 26
  },
  present_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  absent_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  leave_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  payment_status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Processing'),
    defaultValue: 'Pending'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  generated_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payroll',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'month']
    }
  ]
});

module.exports = Payroll;