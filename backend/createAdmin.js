require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Admin = require('./models/Admin');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const existingAdmin = await Admin.findOne({ 
      where: { email: 'admin@company.com' } 
    });

    if (existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated!');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'Super Admin'
      });
      console.log('✅ Admin created successfully!');
    }

    console.log('\n📧 Email: admin@company.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();