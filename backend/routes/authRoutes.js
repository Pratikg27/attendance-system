const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ============================================
// GENERAL LOGIN (Routes to Employee or Admin)
// ============================================
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  console.log('General login attempt:', { email, role });

  if (role === 'employee') {
    try {
      const employee = await Employee.findOne({ 
        where: { email: email.toLowerCase().trim() }
      });

      if (!employee) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, employee.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = jwt.sign(
        { 
          id: employee.employee_id, 
          employee_id: employee.employee_id,
          email: employee.email,
          role: 'employee'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: employee.employee_id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          role: 'employee'
        }
      });

    } catch (error) {
      console.error('Employee login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during login' 
      });
    }

  } else if (role === 'admin') {
    try {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'attendance_system'
      });

      const [admins] = await connection.execute(
        'SELECT * FROM admins WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      await connection.end();

      if (admins.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const admin = admins[0];
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin'
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during login' 
      });
    }

  } else {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid role. Must be "employee" or "admin"' 
    });
  }
});

// ============================================
// EMPLOYEE LOGIN
// ============================================
router.post('/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const employee = await Employee.findOne({ 
      where: { email: email.toLowerCase().trim() }
    });

    if (!employee) {
      console.log('Employee not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    console.log('Employee found:', employee.name);

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

  const token = jwt.sign(
  { 
    id: employee.employee_id,
    employee_id: employee.employee_id,  // ← ADD THIS
    email: employee.email,
    role: 'employee'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        employee_code: employee.employee_code,
        role: 'employee'
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ============================================
// ADMIN LOGIN
// ============================================
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Admin login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'attendance_system'
    });

    const [admins] = await connection.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    await connection.end();

    if (admins.length === 0) {
      console.log('Admin not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const admin = admins[0];
    console.log('Admin found:', admin.name);

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        admin_id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'Super Admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ============================================
// VERIFY TOKEN
// ============================================
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      user: decoded
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

module.exports = router;