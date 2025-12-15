require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const db = require('./config/db');
const documentRoutes = require('./routes/documentRoutes');
const payrollRoutes = require('./routes/payrollRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import authentication middleware
const authenticateToken = require('./middleware/authMiddleware');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employee', authenticateToken, require('./routes/employeeRoutes'));
app.use('/api/admin', authenticateToken, require('./routes/adminRoutes'));
app.use('/api/attendance', authenticateToken, require('./routes/attendanceRoutes'));
app.use('/api/leaves', authenticateToken, require('./routes/leaveRoutes'));
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/payroll', authenticateToken, payrollRoutes);
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'Database connected!', 
      database: process.env.DB_NAME,
      host: process.env.DB_HOST 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Attendance System API', 
    status: 'Running',
    environment: process.env.NODE_ENV,
    endpoints: { 
      health: '/api/health',
      test_db: '/api/test-db',
      auth: '/api/auth',
      leaves: '/api/leaves',
      payroll: '/api/payroll'
    } 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

const PORT = process.env.PORT || 5000;

// Create admin user if needed
const createAdminIfNeeded = async () => {
  const Admin = require('./models/Admin');
  const bcrypt = require('bcrypt');
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existingAdmin = await Admin.findOne({
      where: { email: 'admin@company.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user exists');
    } else {
      await Admin.create({
        name: 'System Admin',
        email: 'admin@company.com',
        password: hashedPassword
      });
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('⚠️ Admin creation error:', error.message);
  }
};

const startServer = async () => {
  try {
    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Sequelize connected to Railway MySQL!');
    
    // Sync tables (be careful in production!)
    await sequelize.sync({ alter: false }); // Don't alter existing tables
    console.log('✅ Database tables synced!');
    
    // Create admin user if needed
    await createAdminIfNeeded();
    
    // Start server
    app.listen(PORT, () => {
      console.log('🚀 Server running on port ' + PORT);
      console.log('🗄️ Database: ' + process.env.DB_NAME);
      console.log('🌐 Host: ' + process.env.DB_HOST);
      console.log('📊 Environment: ' + process.env.NODE_ENV);
    });
  } catch (error) {
    console.error('❌ Startup Error:', error.message);
    process.exit(1);
  }
};

startServer();