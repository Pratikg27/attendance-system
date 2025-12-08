const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const AdminUser = require('./models/AdminUser');

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    console.log('🔄 Creating tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created!');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedEmployeePassword = await bcrypt.hash('pratik123', 10);

    // Create admin user
    console.log('🔄 Creating admin user...');
    await AdminUser.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: hashedAdminPassword,
      role: 'super_admin',
      phone: '1234567890',
      is_active: true
    });
    console.log('✅ Admin user created!');

    // Create sample employee
    console.log('🔄 Creating sample employee...');
    await Employee.create({
      employee_code: 'EMP001',
      name: 'Pratik Sharma',
      email: 'pratik@company.com',
      password: hashedEmployeePassword,
      phone: '9876543210',
      department: 'IT',
      designation: 'Software Developer',
      salary: 50000.00,
      join_date: new Date(),
      is_active: true
    });
    console.log('✅ Sample employee created!');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Portal:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Employee Portal:');
    console.log('  Email: pratik@company.com');
    console.log('  Password: pratik123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();