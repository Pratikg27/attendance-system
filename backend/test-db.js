const { sequelize, Employee } = require('./models');

async function checkEmployees() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const employees = await Employee.findAll();
    
    if (employees.length === 0) {
      console.log('📝 No employees found in database');
    } else {
      console.log(`📋 Found ${employees.length} employee(s):\n`);
      employees.forEach(emp => {
        console.log(`ID: ${emp.id}`);
        console.log(`Employee ID: ${emp.employeeId}`);
        console.log(`Name: ${emp.name}`);
        console.log(`Email: ${emp.email}`);
        console.log(`Department: ${emp.department}`);
        console.log('---');
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkEmployees();