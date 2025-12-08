const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'attendance_id'
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employee_id',
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  clock_in: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clock_in'
  },
  clock_out: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clock_out'
  },
  hours_worked: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'hours_worked'
  },
  total_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'total_hours'
  },
  is_clocked_in: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_clocked_in'
  },
  wages_earned: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'wages_earned'
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Late', 'Half Day', 'On Leave'),
    defaultValue: 'Present'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Attendance;