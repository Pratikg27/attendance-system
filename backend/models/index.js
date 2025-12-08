const sequelize = require('../config/database');

// Import models (all using sequelize.define pattern now)
const Admin = require('./Admin');
const AdminUser = require('./AdminUser');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Payroll = require('./Payroll');
const Overtime = require('./Overtime');

// Models object
const models = {
  Admin,
  AdminUser,
  Employee,
  Attendance,
  Leave,
  Payroll,
  Overtime
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Define manual associations
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    await sequelize.sync({ alter: false });
    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
  }
};

module.exports = {
  sequelize,
  models,
  syncDatabase,
  Admin,
  AdminUser,
  Employee,
  Attendance,
  Leave,
  Payroll,
  Overtime
};