const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const authenticateToken = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// ============================================
// CLOCK IN ✅ FIXED
// ============================================
router.post('/clock-in', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user?.employee_id || req.user?.id || req.body.employee_id;

    if (!employee_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (existingAttendance && existingAttendance.clock_in) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already clocked in today' 
      });
    }

    const clockInTime = new Date();
    const currentHour = clockInTime.getHours();
    
    // Determine status based on time (Late if after 10 AM)
    let status = 'Present';
    if (currentHour >= 10) {
      status = 'Late';
    }

    let attendance;
    
    if (existingAttendance) {
      // Update existing record
      existingAttendance.clock_in = clockInTime;
      existingAttendance.status = status;
      existingAttendance.is_clocked_in = true;
      await existingAttendance.save();
      attendance = existingAttendance;
    } else {
      // Create new record
      attendance = await Attendance.create({
        employee_id,
        date: today,
        clock_in: clockInTime,
        status: status,
        is_clocked_in: true
      });
    }

    console.log('✅ Clocked in successfully:', attendance.id);

    res.status(201).json({
      success: true,
      message: `Clocked in as ${status}`,
      checkInTime: clockInTime,
      status: status,
      attendance
    });

  } catch (error) {
    console.error('❌ Clock in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// CLOCK OUT ✅ FIXED
// ============================================
router.post('/clock-out', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user?.employee_id || req.user?.id || req.body.employee_id;

    if (!employee_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (!attendance || !attendance.clock_in) {
      return res.status(404).json({ 
        success: false, 
        message: 'Please clock in first' 
      });
    }

    if (attendance.clock_out) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already clocked out today' 
      });
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(attendance.clock_in);
    const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

    attendance.clock_out = clockOutTime;
    attendance.total_hours = parseFloat(hoursWorked.toFixed(2));
    attendance.hours_worked = parseFloat(hoursWorked.toFixed(2)); // Keep both for compatibility
    attendance.is_clocked_in = false;
    await attendance.save();

    console.log('✅ Clocked out successfully. Hours:', attendance.total_hours);

    res.json({
      success: true,
      message: 'Clocked out successfully',
      checkOutTime: clockOutTime,
      totalHours: attendance.total_hours,
      attendance
    });

  } catch (error) {
    console.error('❌ Clock out error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET CLOCK STATUS ✅ NEW (Frontend needs this!)
// ============================================
router.get('/clock-status', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user?.employee_id || req.user?.id;

    if (!employee_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (!attendance) {
      return res.json({
        success: true,
        isClockedIn: false,
        canClockIn: true,
        canClockOut: false,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        status: null
      });
    }

    res.json({
      success: true,
      isClockedIn: attendance.is_clocked_in || false,
      canClockIn: !attendance.clock_in,
      canClockOut: (attendance.clock_in && !attendance.clock_out),
      checkIn: attendance.clock_in,
      checkOut: attendance.clock_out,
      totalHours: attendance.total_hours || attendance.hours_worked || 0,
      status: attendance.status
    });

  } catch (error) {
    console.error('❌ Get clock status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============================================
// GET TODAY'S ATTENDANCE
// ============================================
router.get('/today/:employee_id', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    res.json({
      success: true,
      attendance: attendance || null
    });

  } catch (error) {
    console.error('❌ Get today attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============================================
// MARK ATTENDANCE (UNIFIED ENDPOINT)
// ============================================
router.post('/mark', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user?.employee_id || req.user?.id || req.body.employee_id;
    const { status } = req.body;

    if (!employee_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    if (!status || !['Present', 'Absent', 'Half Day', 'Late'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required (Present, Absent, Half Day, Late)' 
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if already marked today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Auto-detect late (after 10 AM) only for Present status
    let finalStatus = status;
    if (status === 'Present' && currentHour >= 10) {
      finalStatus = 'Late';
    }

    let attendance;

    if (existingAttendance) {
      // Update existing
      existingAttendance.status = finalStatus;
      if (!existingAttendance.clock_in) {
        existingAttendance.clock_in = currentTime;
      }
      existingAttendance.hours_worked = status === 'Half Day' ? 4 : (status === 'Present' || status === 'Late' ? 8 : 0);
      existingAttendance.total_hours = existingAttendance.hours_worked;
      await existingAttendance.save();
      attendance = existingAttendance;
    } else {
      // Create new
      attendance = await Attendance.create({
        employee_id,
        date: today,
        clock_in: currentTime,
        status: finalStatus,
        hours_worked: status === 'Half Day' ? 4 : (status === 'Present' || status === 'Late' ? 8 : 0),
        total_hours: status === 'Half Day' ? 4 : (status === 'Present' || status === 'Late' ? 8 : 0)
      });
    }

    console.log('✅ Attendance marked:', finalStatus);

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${finalStatus}`,
      attendance
    });

  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET MY ATTENDANCE HISTORY
// ============================================
router.get('/my-attendance', authenticateToken, async (req, res) => {
  try {
    const employee_id = req.user?.employee_id || req.user?.id;

    if (!employee_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - Employee ID not found' 
      });
    }

    console.log('📋 Fetching attendance for employee:', employee_id);

    const attendances = await Attendance.findAll({
      where: { employee_id },
      order: [['date', 'DESC']],
      limit: 90 // Last 90 days
    });

    console.log('✅ Fetched attendance records:', attendances.length);

    // Ensure total_hours is set for display
    const formattedAttendances = attendances.map(att => {
      const plain = att.toJSON();
      plain.total_hours = plain.total_hours || plain.hours_worked || 0;
      return plain;
    });

    res.json({
      success: true,
      attendances: formattedAttendances
    });

  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;