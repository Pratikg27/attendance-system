require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('🔄 Syncing Admin table...');
    await Admin.sync({ alter: false }); // ✅ Don't alter - use existing table
    console.log('✅ Admin table synced');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // First, check if admin exists
    const existingAdmin = await Admin.findOne({
      where: { email: 'admin@company.com' }
    });

    if (existingAdmin) {
      console.log('\n⚠️  Admin already exists!');
      console.log('📧 Email: admin@company.com');
      console.log('\n💡 Updating password to: admin123\n');
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('✅ Password updated successfully!\n');
    } else {
      const admin = await Admin.create({
        name: 'System Admin',
        email: 'admin@company.com',
        password: hashedPassword
      });

      console.log('\n✅ Admin user created successfully!\n');
      console.log('========================');
      console.log('📧 Email: admin@company.com');
      console.log('🔒 Password: admin123');
      console.log('========================\n');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();