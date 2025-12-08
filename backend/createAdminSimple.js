require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
  let connection;
  
  try {
    // Create direct MySQL connection
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

    if (existingAdmin.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE admins SET password = ?, name = ?, role = ? WHERE email = ?',
        [hashedPassword, 'Super Admin', 'Super Admin', 'admin@company.com']
      );
      console.log('✅ Admin password updated!');
    } else {
      // Create new admin
      await connection.execute(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@company.com', hashedPassword, 'Super Admin']
      );
      console.log('✅ Admin created!');
    }

    console.log('\n📧 Email: admin@company.com');
    console.log('🔑 Password: admin123\n');

    // Verify password
    const testValid = await bcrypt.compare('admin123', hashedPassword);
    console.log('Verification:', testValid ? '✅ SUCCESS' : '❌ FAILED');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

createAdmin();