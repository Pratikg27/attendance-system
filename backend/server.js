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
app.use('/api/auth', require('./routes/authRoutes')); // No auth needed for login/register
app.use('/api/employee', authenticateToken, require('./routes/employeeRoutes')); // Protected
app.use('/api/admin', authenticateToken, require('./routes/adminRoutes')); // Protected
app.use('/api/attendance', authenticateToken, require('./routes/attendanceRoutes')); // Protected ✅
app.use('/api/leaves', authenticateToken, require('./routes/leaveRoutes')); // Protected
app.use('/api/documents', authenticateToken, documentRoutes); // Protected
app.use('/api/payroll', authenticateToken, payrollRoutes); // Protected
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Running', 
    endpoints: { 
      leaves_test: '/api/leaves/test',
      health: '/api/health',
      payroll: '/api/payroll/my-slips'
    } 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
    await sequelize.sync(); 
    console.log('✅ Tables synced!');
    app.listen(PORT, () => {
      console.log('🚀 Server running on port ' + PORT);
      console.log('🍃 Leave routes: /api/leaves/test');
      console.log('💰 Payroll routes: /api/payroll/my-slips');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

startServer();