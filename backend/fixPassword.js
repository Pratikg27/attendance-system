require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Employee = require('./models/Employee');
const Admin = require('./models/Admin');

async function fixPasswords() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // ==========================================
    // FIX PRATIK'S PASSWORD
    // ==========================================
    const pratik = await Employee.findOne({ 
      where: { email: 'pratik@company.com' } 
    });

    if (pratik) {
      console.log('Found: Pratik Sharma');
      console.log('Old hash:', pratik.password.substring(0, 30) + '...');

      const newHash = await bcrypt.hash('password123', 10);
      pratik.password = newHash;
      await pratik.save();

      console.log('New hash:', newHash.substring(0, 30) + '...');
      
      // Verify it works
      const test = await bcrypt.compare('password123', newHash);
      console.log('Verification:', test ? '✅ SUCCESS' : '❌ FAILED');
      console.log('\n📧 Email: pratik@company.com');
      console.log('🔑 Password: password123\n');
    }

    // ==========================================
    // FIX JOHN'S PASSWORD
    // ==========================================
    const john = await Employee.findOne({ 
      where: { email: 'john.doe@company.com' } 
    });

    if (john) {
      console.log('Found: John Doe');
      const newHash = await bcrypt.hash('password123', 10);
      john.password = newHash;
      await john.save();
      console.log('✅ John\'s password updated');
      console.log('📧 Email: john.doe@company.com');
      console.log('🔑 Password: password123\n');
    }

    // ==========================================
    // CREATE/FIX ADMIN
    // ==========================================
    let admin = await Admin.findOne({ 
      where: { email: 'admin@company.com' } 
    });

    const adminHash = await bcrypt.hash('admin123', 10);

    if (admin) {
      admin.password = adminHash;
      await admin.save();
      console.log('✅ Admin password updated');
    } else {
      admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@company.com',
        password: adminHash,
        role: 'Super Admin'
      });
      console.log('✅ Admin created');
    }

    console.log('📧 Email: admin@company.com');
    console.log('🔑 Password: admin123\n');

    // ==========================================
    // VERIFY ALL PASSWORDS
    // ==========================================
    console.log('========================================');
    console.log('VERIFICATION TEST');
    console.log('========================================\n');

    const pratikCheck = await bcrypt.compare('password123', pratik.password);
    console.log('Pratik password:', pratikCheck ? '✅ WORKS' : '❌ BROKEN');

    if (john) {
      const johnCheck = await bcrypt.compare('password123', john.password);
      console.log('John password:', johnCheck ? '✅ WORKS' : '❌ BROKEN');
    }

    const adminCheck = await bcrypt.compare('admin123', admin.password);
    console.log('Admin password:', adminCheck ? '✅ WORKS' : '❌ BROKEN');

    console.log('\n✅ All passwords fixed!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPasswords();