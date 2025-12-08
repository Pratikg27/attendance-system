const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const mysql = require('mysql2/promise');

// Database connection helper
const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'attendance_system'
  });
};

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Leave routes working!' });
});

// ============================================
// GET LEAVE BALANCE
// ============================================
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.id;
    console.log('📊 Fetching balance for employee:', employeeId);
    
    const connection = await getConnection();

    const [balance] = await connection.execute(
      'SELECT * FROM leave_balance WHERE employee_id = ?',
      [employeeId]
    );

    if (balance.length === 0) {
      console.log('⚠️ No balance found, creating default...');
      await connection.execute(
        'INSERT INTO leave_balance (employee_id, casual_leave, sick_leave, paid_leave) VALUES (?, 12, 10, 15)',
        [employeeId]
      );

      await connection.end();

      return res.json({
        success: true,
        balance: {
          casual_leave: 12,
          sick_leave: 10,
          paid_leave: 15
        }
      });
    }

    await connection.end();
    console.log('✅ Balance found:', balance[0]);

    res.json({
      success: true,
      balance: balance[0]
    });

  } catch (error) {
    console.error('❌ Error fetching leave balance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leave balance',
      error: error.message
    });
  }
});

// ============================================
// GET MY LEAVES
// ============================================
router.get('/my-leaves', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.id;
    console.log('📋 Fetching leaves for employee:', employeeId);
    
    const connection = await getConnection();

    const [leaves] = await connection.execute(
      'SELECT * FROM leaves WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );

    await connection.end();
    console.log('✅ Found', leaves.length, 'leaves');

    res.json(leaves);

  } catch (error) {
    console.error('❌ Error fetching leaves:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaves',
      error: error.message
    });
  }
});

// ============================================
// GET PENDING LEAVES (Admin)
// ============================================
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching pending leaves...');
    
    const connection = await getConnection();

    const [leaves] = await connection.execute(
      `SELECT l.*, e.name as employee_name, e.employee_code 
       FROM leaves l 
       JOIN employees e ON l.employee_id = e.employee_id 
       WHERE l.status = 'Pending' 
       ORDER BY l.created_at DESC`
    );

    await connection.end();
    console.log('✅ Found', leaves.length, 'pending leaves');

    res.json(leaves);

  } catch (error) {
    console.error('❌ Error fetching pending leaves:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending leaves',
      error: error.message
    });
  }
});

// ============================================
// APPLY LEAVE (Using /apply route)
// ============================================
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employeeId = req.user.id;

    console.log('📝 Applying leave:', { employeeId, leave_type, start_date, end_date });

    // Validate inputs
    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Calculate days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'End date must be after start date' 
      });
    }

    const connection = await getConnection();

    // Check leave balance
    const [balance] = await connection.execute(
      'SELECT * FROM leave_balance WHERE employee_id = ?',
      [employeeId]
    );

    if (balance.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false,
        message: 'Leave balance not found' 
      });
    }

    const availableLeaves = balance[0][leave_type];
    if (availableLeaves < days) {
      await connection.end();
      return res.status(400).json({ 
        success: false,
        message: `Insufficient ${leave_type.replace('_', ' ')} balance. Available: ${availableLeaves} days` 
      });
    }

    // Insert leave request
    await connection.execute(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [employeeId, leave_type, start_date, end_date, days, reason]
    );

    await connection.end();
    console.log('✅ Leave applied successfully');

    res.json({
      success: true,
      message: 'Leave application submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error applying leave:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error applying leave',
      error: error.message
    });
  }
});

// ============================================
// CREATE LEAVE REQUEST (Using /request route - same as /apply)
// ============================================
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employeeId = req.user.id;

    console.log('📝 Creating leave request for employee:', employeeId);
    console.log('Leave details:', { leave_type, start_date, end_date, reason });

    // Validate inputs
    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Calculate number of days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'End date must be after start date' 
      });
    }

    const connection = await getConnection();

    // Check leave balance
    const [balance] = await connection.execute(
      'SELECT * FROM leave_balance WHERE employee_id = ?',
      [employeeId]
    );

    if (balance.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false,
        message: 'Leave balance not found' 
      });
    }

    const availableLeaves = balance[0][leave_type];
    if (availableLeaves < days) {
      await connection.end();
      return res.status(400).json({ 
        success: false,
        message: `Insufficient ${leave_type.replace('_', ' ')} balance. Available: ${availableLeaves} days` 
      });
    }

    // Insert leave request
    await connection.execute(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, days)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [employeeId, leave_type, start_date, end_date, reason, days]
    );

    await connection.end();
    console.log('✅ Leave request created successfully');

    res.json({ 
      success: true,
      message: 'Leave request submitted successfully' 
    });

  } catch (error) {
    console.error('❌ Error creating leave request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating leave request', 
      error: error.message
    });
  }
});

// ============================================
// APPROVE/REJECT LEAVE (Admin)
// ============================================
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('✏️ Updating leave status:', { id, status });

    const connection = await getConnection();

    await connection.execute(
      'UPDATE leaves SET status = ? WHERE leave_id = ?',
      [status, id]
    );

    await connection.end();
    console.log('✅ Leave status updated');

    res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('❌ Error updating leave status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating leave status',
      error: error.message
    });
  }
});

module.exports = router;