require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,  // ← Added port
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway'  // ← Changed default
});

db.connect((err) => {
  if (err) {
    console.error('❌ Raw MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ Raw MySQL Connected (for Leave Module)');
});

module.exports = db;