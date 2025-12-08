require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Employee = require('./models/Employee');

async function testBcrypt() {
  try {
    await sequelize.authenticate();

    const employee = await Employee.findOne({ 
      where: { email: 'pratik@company.com' } 
    });

    console.log('Employee:', employee.name);
    console.log('Stored hash:', employee.password);
    console.log('Hash length:', employee.password.length);

    // Test multiple passwords
    const testPasswords = ['password123', 'Password123', 'PASSWORD123'];

    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, employee.password);
      console.log(`\nTesting "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    // Create a fresh hash
    const freshHash = await bcrypt.hash('password123', 10);
    console.log('\n--- Fresh Hash Test ---');
    console.log('Fresh hash:', freshHash);
    const freshTest = await bcrypt.compare('password123', freshHash);
    console.log('Fresh hash works:', freshTest ? '✅ YES' : '❌ NO');

    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testBcrypt();