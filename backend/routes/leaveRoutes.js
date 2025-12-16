const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');

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
    
    let balance = await LeaveBalance.findOne({
      where: { employee_id: employeeId }
    });

    if (!balance) {
      console.log('⚠️ No balance found, creating default...');
      balance = await LeaveBalance.create({
        employee_id: employeeId,
        casual_leave: 12,
        sick_leave: 10,
        paid_leave: 15
      });

      return res.json({
        success: true,
        balance: {
          casual_leave: balance.casual_leave,
          sick_leave: balance.sick_leave,
          paid_leave: balance.paid_leave
        }
      });
    }

    console.log('✅ Balance found:', balance.toJSON());

    res.json({
      success: true,
      balance: {
        casual_leave: balance.casual_leave,
        sick_leave: balance.sick_leave,
        paid_leave: balance.paid_leave
      }
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
    
    const leaves = await Leave.findAll({
      where: { employee_id: employeeId },
      order: [['created_at', 'DESC']]
    });

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
    
    const leaves = await Leave.findAll({
      where: { status: 'Pending' },
      include: [{
        model: Employee,
        as: 'Employee',  // ← MUST match models/index.js (uppercase E)
        attributes: ['name', 'employee_code'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    console.log('✅ Found', leaves.length, 'pending leaves');

    // Format response
    const formattedLeaves = leaves.map(leave => ({
      ...leave.toJSON(),
      employee_name: leave.Employee?.name || 'N/A',
      employee_code: leave.Employee?.employee_code || 'N/A'
    }));

    res.json(formattedLeaves);

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
// GET ALL LEAVES (Admin - All statuses)
// ============================================
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching all leaves...');
    
    const leaves = await Leave.findAll({
      include: [{
        model: Employee,
        as: 'Employee',
        attributes: ['name', 'employee_code'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    console.log('✅ Found', leaves.length, 'total leaves');

    // Format response
    const formattedLeaves = leaves.map(leave => ({
      ...leave.toJSON(),
      employee_name: leave.Employee?.name || 'N/A',
      employee_code: leave.Employee?.employee_code || 'N/A'
    }));

    res.json(formattedLeaves);

  } catch (error) {
    console.error('❌ Error fetching all leaves:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaves',
      error: error.message
    });
  }
});

// ============================================
// CANCEL LEAVE (Employee cancels their own leave)
// ============================================
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const leaveId = req.params.id;
    console.log(`🚫 Employee ${req.user.id} canceling leave ${leaveId}...`);

    // Find the leave
    const leave = await Leave.findByPk(leaveId);

    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave not found' 
      });
    }

    // Check if employee owns this leave
    if (leave.employee_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only cancel your own leaves' 
      });
    }

    // Check if leave can be cancelled (only Pending or Approved leaves)
    if (!['Pending', 'Approved'].includes(leave.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel ${leave.status.toLowerCase()} leave` 
      });
    }

    // Cancel the leave
    await leave.update({ 
      status: 'Cancelled',
      updated_at: new Date()
    });

    console.log('✅ Leave cancelled successfully');

    res.json({ 
      success: true, 
      message: 'Leave cancelled successfully',
      leave: leave.toJSON()
    });

  } catch (error) {
    console.error('❌ Error cancelling leave:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling leave',
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
    const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (total_days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'End date must be after start date' 
      });
    }

    // Check leave balance
    const balance = await LeaveBalance.findOne({
      where: { employee_id: employeeId }
    });

    if (!balance) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave balance not found' 
      });
    }

    const availableLeaves = balance[leave_type];
    if (availableLeaves < total_days) {
      return res.status(400).json({ 
        success: false,
        message: `Insufficient ${leave_type.replace('_', ' ')} balance. Available: ${availableLeaves} days` 
      });
    }

    // Create leave request (using YOUR column names)
    await Leave.create({
      employee_id: employeeId,
      leave_type,
      start_date,
      end_date,
      days: total_days,
      reason,
      status: 'Pending'
    });

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
    const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (total_days <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'End date must be after start date' 
      });
    }

    // Check leave balance
    const balance = await LeaveBalance.findOne({
      where: { employee_id: employeeId }
    });

    if (!balance) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave balance not found' 
      });
    }

    const availableLeaves = balance[leave_type];
    if (availableLeaves < total_days) {
      return res.status(400).json({ 
        success: false,
        message: `Insufficient ${leave_type.replace('_', ' ')} balance. Available: ${availableLeaves} days` 
      });
    }

    // Create leave request (using YOUR column names)
    await Leave.create({
      employee_id: employeeId,
      leave_type,
      start_date,
      end_date,
      days: total_days,
      reason,
      status: 'Pending'
    });

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

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    leave.status = status;
    await leave.save();

    // Update leave balance if approved
    if (status === 'Approved') {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: leave.employee_id }
      });

      if (balance) {
        const leaveTypeMap = {
          'casual_leave': 'casual_leave',
          'sick_leave': 'sick_leave',
          'paid_leave': 'paid_leave'
        };

        const balanceField = leaveTypeMap[leave.leave_type];
        if (balanceField) {
          balance[balanceField] = Math.max(0, balance[balanceField] - leave.total_days);
          await balance.save();
          console.log('✅ Leave balance updated');
        }
      }
    }

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