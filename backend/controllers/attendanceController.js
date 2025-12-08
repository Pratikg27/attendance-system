const db = require('../config/db');

// Clock In
const clockIn = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🕐 Clock In attempt for employee:', employee_id);

    // Check if already clocked in today
    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existing.length > 0 && existing[0].is_clocked_in) {
      return res.status(400).json({
        success: false,
        message: 'Already clocked in for today'
      });
    }

    const checkInTime = new Date();
    const workStartTime = new Date();
    workStartTime.setHours(10, 0, 0, 0); // 10:00 AM

    // Determine status based on clock-in time
    let status = 'Present';
    if (checkInTime > workStartTime) {
      status = 'Late';
    }

    if (existing.length > 0) {
      // Update existing record
      await db.query(
        'UPDATE attendance SET check_in = ?, status = ?, is_clocked_in = TRUE WHERE id = ?',
        [checkInTime, status, existing[0].id]
      );
    } else {
      // Create new record
      await db.query(
        'INSERT INTO attendance (employee_id, date, status, check_in, is_clocked_in) VALUES (?, ?, ?, ?, TRUE)',
        [employee_id, today, status, checkInTime]
      );
    }

    console.log('✅ Clocked in successfully');

    res.status(200).json({
      success: true,
      message: `Clocked in as ${status}`,
      checkInTime: checkInTime,
      status: status
    });
  } catch (error) {
    console.error('❌ Clock in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock in',
      error: error.message
    });
  }
};

// Clock Out
const clockOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🕐 Clock Out attempt for employee:', employee_id);

    // Check if clocked in today
    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND is_clocked_in = TRUE',
      [employee_id, today]
    );

    if (existing.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please clock in first'
      });
    }

    const record = existing[0];
    const checkOutTime = new Date();
    const checkInTime = new Date(record.check_in);

    // Calculate total hours
    const diffMs = checkOutTime - checkInTime;
    const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

    // Update record
    await db.query(
      'UPDATE attendance SET check_out = ?, total_hours = ?, is_clocked_in = FALSE WHERE id = ?',
      [checkOutTime, totalHours, record.id]
    );

    console.log('✅ Clocked out successfully. Total hours:', totalHours);

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      checkOutTime: checkOutTime,
      totalHours: parseFloat(totalHours)
    });
  } catch (error) {
    console.error('❌ Clock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock out',
      error: error.message
    });
  }
};

// Get Clock Status
const getClockStatus = async (req, res) => {
  try {
    const employee_id = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const [records] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (records.length === 0) {
      return res.status(200).json({
        success: true,
        isClockedIn: false,
        canClockIn: true,
        canClockOut: false
      });
    }

    const record = records[0];

    res.status(200).json({
      success: true,
      isClockedIn: record.is_clocked_in,
      canClockIn: !record.check_in,
      canClockOut: record.is_clocked_in && !record.check_out,
      checkIn: record.check_in,
      checkOut: record.check_out,
      totalHours: record.total_hours,
      status: record.status
    });
  } catch (error) {
    console.error('❌ Get clock status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get clock status'
    });
  }
};

// Mark Attendance (Manual)
const markAttendance = async (req, res) => {
  try {
    const { employee_id, status, date } = req.body;
    
    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    console.log('📋 Marking attendance:', { employee_id, status, date: attendanceDate });

    // Check if attendance already exists
    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, attendanceDate]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE attendance SET status = ? WHERE employee_id = ? AND date = ?',
        [status, employee_id, attendanceDate]
      );
    } else {
      // Insert new
      await db.query(
        'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
        [employee_id, attendanceDate, status]
      );
    }

    console.log('✅ Attendance marked successfully');

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${status}`
    });
  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Get My Attendance
const getMyAttendance = async (req, res) => {
  try {
    const employee_id = req.user.id;
    
    console.log('📊 Fetching attendance for employee:', employee_id);

    const [attendances] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC',
      [employee_id]
    );

    console.log(`✅ Found ${attendances.length} attendance records`);

    res.status(200).json({
      success: true,
      attendances: attendances
    });
  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  clockIn,
  clockOut,
  getClockStatus
};