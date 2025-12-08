require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'attendance_system'
    });

    console.log('✅ Database connected\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Password hashed\n');

    // Check if admin exists
    const [existingAdmin] = await connection.execute(
      'SELECT * FROM admins WHERE email = ?',
      ['admin@company.com']
    );

    const now = new Date();

    if (existingAdmin.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE admins SET password = ?, name = ?, updatedAt = ? WHERE email = ?',
        [hashedPassword, 'Super Admin', now, 'admin@company.com']
      );
      console.log('✅ Admin password updated!');
      console.log('Admin ID:', existingAdmin[0].id);
    } else {
      // Create new admin
      const [result] = await connection.execute(
        'INSERT INTO admins (name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        ['Super Admin', 'admin@company.com', hashedPassword, now, now]
      );
      console.log('✅ Admin created!');
      console.log('Admin ID:', result.insertId);
    }

    console.log('\n📧 Email: admin@company.com');
    console.log('🔑 Password: admin123\n');

    // Verify password
    const testValid = await bcrypt.compare('admin123', hashedPassword);
    console.log('Password verification:', testValid ? '✅ SUCCESS' : '❌ FAILED');

    // Show final admin record
    const [finalAdmin] = await connection.execute(
      'SELECT id, name, email, LEFT(password, 30) as password_preview FROM admins WHERE email = ?',
      ['admin@company.com']
    );
    console.log('\n📋 Admin Record:');
    console.log(finalAdmin[0]);

    await connection.end();
    console.log('\n✅ All done!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

createAdmin();