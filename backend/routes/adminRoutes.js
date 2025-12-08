const express = require('express');
const router = express.Router();
const { Employee, Attendance, Admin } = require('../models');
const sequelize = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all employees
router.get('/employees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Get all attendance records
// router.get('/attendance', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { startDate, endDate, employeeId } = req.query;
    
//     let whereClause = {};
    
//     if (startDate && endDate) {
//       whereClause.clockIn = {
//         [Op.between]: [new Date(startDate), new Date(endDate)]
//       };
//     }
    
//     if (employeeId) {
//       whereClause.employeeId = employeeId;
//     }

//     const attendance = await Attendance.findAll({
//       where: whereClause,
//       include: [{
//         model: Employee,
//         attributes: ['id', 'name', 'employeeId', 'department']
//       }],
//       order: [['clockIn', 'DESC']],
//       limit: 100
//     });

//     res.json(attendance);
//   } catch (error) {
//     console.error('Get attendance error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      totalAttendanceToday
    ] = await Promise.all([
      Employee.count(),
      Employee.count({ where: { currentlyWorking: true } }),
      Attendance.count({
        where: {
          clockIn: { [Op.gte]: today },
          status: 'present'
        }
      }),
      Attendance.count({
        where: {
          clockIn: { [Op.gte]: today }
        }
      })
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      presentToday,
      absentToday: activeEmployees - presentToday,
      attendanceRate: activeEmployees > 0 
        ? ((presentToday / activeEmployees) * 100).toFixed(2) 
        : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee (Admin only)
router.post('/employees', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { employee_code, name, email, password, phone, department, designation, salary, hourly_rate } = req.body;

    const existingEmployee = await Employee.findOne({ 
      where: { 
        [Op.or]: [{ email }, { employee_code }]
      } 
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this email or employee code already exists' 
      });
    }

    const employee = await Employee.create({
      employee_code,
      name,
      email,
      password,
      phone,
      department,
      designation,
      salary: salary || 0,
      hourly_rate: hourly_rate || 150.00,
      join_date: new Date(),
      is_active: true
    });

    const employeeData = employee.toJSON();
    delete employeeData.password;

    res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeData
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee
router.put('/employees/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { name, email, phone, department, position, hourlyRate, currentlyWorking } = req.body;

    await employee.update({
      name: name || employee.name,
      email: email || employee.email,
      phone: phone || employee.phone,
      department: department || employee.department,
      position: position || employee.position,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : employee.hourlyRate,
      currentlyWorking: currentlyWorking !== undefined ? currentlyWorking : employee.currentlyWorking
    });

    const employeeData = employee.toJSON();
    delete employeeData.password;

    res.json({
      message: 'Employee updated successfully',
      employee: employeeData
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/employees/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.destroy();

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// ========== LEAVE MANAGEMENT ROUTES ==========

// Approve leave request
router.put('/leaves/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🟢 Approving leave ID:', id);

    // Get leave details
const leaves = await sequelize.query(
  'SELECT * FROM leaves WHERE leave_id = ?',
  { 
    replacements: [id],
    type: sequelize.QueryTypes.SELECT 
  }
);

console.log('🔍 Query result:', leaves);

if (!leaves || leaves.length === 0) {
  console.log('❌ Leave not found:', id);
  return res.status(404).json({ message: 'Leave request not found' });
}

const leave = leaves[0];
console.log('📋 Leave found:', leave);

    // Update leave status
    await sequelize.query(
      'UPDATE leaves SET status = ?, updated_at = NOW() WHERE leave_id = ?',
      { replacements: ['Approved', id] }
    );

    // Deduct leave balance
    const leaveTypeMap = {
      'Casual Leave': 'cl_balance',
      'Sick Leave': 'sl_balance',
      'Paid Leave': 'pl_balance'
    };

    const balanceColumn = leaveTypeMap[leave.leave_type];
    
    if (balanceColumn) {
      console.log(`🔄 Deducting ${leave.days} days from ${balanceColumn}`);
      await sequelize.query(
        `UPDATE employees SET ${balanceColumn} = ${balanceColumn} - ? WHERE employee_id = ?`,
        { replacements: [leave.days, leave.employee_id] }
      );
    }

    console.log('✅ Leave approved successfully');
    res.json({ 
      success: true,
      message: 'Leave approved successfully' 
    });

  } catch (error) {
    console.error('❌ Approve leave error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Reject leave request
router.put('/leaves/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔴 Rejecting leave ID:', id);

    // Check if leave exists
const leaves = await sequelize.query(
  'SELECT * FROM leaves WHERE leave_id = ?',
  { 
    replacements: [id],
    type: sequelize.QueryTypes.SELECT 
  }
);

console.log('🔍 Query result:', leaves);

if (!leaves || leaves.length === 0) {
  console.log('❌ Leave not found:', id);
  return res.status(404).json({ message: 'Leave request not found' });
}

    // Update leave status
    await sequelize.query(
      'UPDATE leaves SET status = ?, updated_at = NOW() WHERE leave_id = ?',
      { replacements: ['Rejected', id] }
    );

    console.log('✅ Leave rejected successfully');
    res.json({ 
      success: true,
      message: 'Leave rejected successfully' 
    });

  } catch (error) {
    console.error('❌ Reject leave error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});
// ========== LEAVE STATUS UPDATE ==========
router.put('/leaves/update-status/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    console.log(`📝 Updating leave ${id} to status: ${status}`);
    console.log(`💬 Admin remarks: ${admin_remarks || 'None'}`);

    // Validate status
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be Approved or Rejected' 
      });
    }

    // Get leave details
const leaves = await sequelize.query(
  'SELECT * FROM leaves WHERE leave_id = ?',
  { replacements: [id], type: sequelize.QueryTypes.SELECT }
);

console.log('🔍 Query result:', leaves);

if (!leaves || leaves.length === 0) {
  console.log('❌ Leave not found:', id);
  return res.status(404).json({ 
    success: false,
    message: 'Leave request not found' 
  });
}

const leave = leaves[0];
console.log('📋 Found leave:', leave);



    // Check if already processed
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave is already ${leave.status}`
      });
    }

    // Update leave status
    await sequelize.query(
      'UPDATE leaves SET status = ?, updated_at = NOW() WHERE leave_id = ?',
      { replacements: [status, id] }
    );

    // If approved, deduct leave balance
    if (status === 'Approved') {
      const leaveTypeMap = {
        'Casual Leave': 'cl_balance',
        'Sick Leave': 'sl_balance',
        'Paid Leave': 'pl_balance',
        'CL': 'cl_balance',
        'SL': 'sl_balance',
        'PL': 'pl_balance'
      };

      const balanceColumn = leaveTypeMap[leave.leave_type];
      
      if (balanceColumn) {
        console.log(`🔄 Deducting ${leave.days} days from ${balanceColumn}`);
        
        // Check current balance
const employees = await sequelize.query(
  `SELECT ${balanceColumn} FROM employees WHERE employee_id = ?`,
  { replacements: [leave.employee_id], type: sequelize.QueryTypes.SELECT }
);

const employee = employees[0];
console.log('👤 Employee balance:', employee);

if (employee && employee[balanceColumn] >= leave.days) {
          // Rollback status update
          await sequelize.query(
            'UPDATE leaves SET status = ? WHERE leave_id = ?',
            { replacements: ['Pending', id] }
          );
          return res.status(400).json({
            success: false,
            message: 'Employee has insufficient leave balance'
          });
        }
      }
    }

    console.log(`✅ Leave ${status.toLowerCase()} successfully`);
    
    res.json({ 
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('❌ Update leave status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});


// ========== GET ATTENDANCE RECORDS (FIXED) ==========
router.get('/attendance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    console.log('📊 Fetching attendance records...');
    console.log('Filters:', { startDate, endDate, employeeId });

    let query = `
      SELECT 
        a.attendance_id,
        e.employee_code,
        e.name,
        e.email,
        e.department,
        DATE_FORMAT(a.clock_in, '%Y-%m-%d') as date,
        TIME_FORMAT(a.clock_in, '%H:%i:%s') as clock_in_time,
        TIME_FORMAT(a.clock_out, '%H:%i:%s') as clock_out_time,
        a.total_hours,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      WHERE 1=1
    `;

    const replacements = [];

    if (startDate && endDate) {
      query += ' AND DATE(a.clock_in) BETWEEN ? AND ?';
      replacements.push(startDate, endDate);
    }

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      replacements.push(employeeId);
    }

    query += ' ORDER BY a.clock_in DESC LIMIT 100';

    const records = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Found ${records.length} records`);
    res.json({ success: true, records });

  } catch (error) {
    console.error('❌ Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== ATTENDANCE REPORT DOWNLOAD ==========
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Download Attendance Report (Excel)
router.get('/attendance/download/excel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    console.log('📊 Generating Excel report...');
    console.log('Filters:', { startDate, endDate, employeeId });

    // Build query
    let query = `
      SELECT 
        a.attendance_id,
        e.employee_code,
        e.name,
        e.email,
        e.department,
        DATE_FORMAT(a.clock_in, '%Y-%m-%d') as date,
        TIME_FORMAT(a.clock_in, '%H:%i:%s') as clock_in_time,
        TIME_FORMAT(a.clock_out, '%H:%i:%s') as clock_out_time,
        a.total_hours,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      WHERE 1=1
    `;

    const replacements = [];

    if (startDate && endDate) {
      query += ' AND DATE(a.clock_in) BETWEEN ? AND ?';
      replacements.push(startDate, endDate);
    }

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      replacements.push(employeeId);
    }

    query += ' ORDER BY a.clock_in DESC';

    const records = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Found ${records.length} records`);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Add header row
    worksheet.columns = [
      { header: 'Employee Code', key: 'employee_code', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Clock In', key: 'clock_in_time', width: 12 },
      { header: 'Clock Out', key: 'clock_out_time', width: 12 },
      { header: 'Total Hours', key: 'total_hours', width: 12 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows
    records.forEach(record => {
      worksheet.addRow(record);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Generate filename
    const filename = `Attendance_Report_${Date.now()}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    console.log('✅ Excel report generated successfully');
    res.end();

  } catch (error) {
    console.error('❌ Excel report error:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
});

// Download Attendance Report (PDF)
router.get('/attendance/download/pdf', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    console.log('📄 Generating PDF report...');

    // Build query (same as Excel)
    let query = `
      SELECT 
        e.employee_code,
        e.name,
        e.department,
        DATE_FORMAT(a.clock_in, '%Y-%m-%d') as date,
        TIME_FORMAT(a.clock_in, '%H:%i:%s') as clock_in_time,
        TIME_FORMAT(a.clock_out, '%H:%i:%s') as clock_out_time,
        a.total_hours,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      WHERE 1=1
    `;

    const replacements = [];

    if (startDate && endDate) {
      query += ' AND DATE(a.clock_in) BETWEEN ? AND ?';
      replacements.push(startDate, endDate);
    }

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      replacements.push(employeeId);
    }

    query += ' ORDER BY a.clock_in DESC LIMIT 100';

    const records = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Found ${records.length} records`);

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const filename = `Attendance_Report_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('ATTENDANCE REPORT', { align: 'center' });
    doc.moveDown(0.5);
    
    if (startDate && endDate) {
      doc.fontSize(10).font('Helvetica').text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    }
    
    doc.moveDown(1);

    // Table header
    const tableTop = doc.y;
    const colWidths = [60, 120, 80, 70, 60, 60, 60, 60];
    const headers = ['Emp Code', 'Name', 'Department', 'Date', 'In', 'Out', 'Hours', 'Status'];
    
    let x = 30;
    doc.fontSize(9).font('Helvetica-Bold');
    
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    doc.moveTo(30, tableTop + 15).lineTo(800, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 20;
    doc.font('Helvetica').fontSize(8);

    records.forEach((record, index) => {
      if (y > 500) { // New page if needed
        doc.addPage();
        y = 50;
      }

      x = 30;
      const rowData = [
        record.employee_code || 'N/A',
        record.name || 'N/A',
        record.department || 'N/A',
        record.date || 'N/A',
        record.clock_in_time || 'N/A',
        record.clock_out_time || 'N/A',
        record.total_hours || 'N/A',
        record.status || 'N/A'
      ];

      rowData.forEach((data, i) => {
        doc.text(data, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += 18;
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.text(`Total Records: ${records.length}`, { align: 'center' });

    doc.end();
    console.log('✅ PDF report generated successfully');

  } catch (error) {
    console.error('❌ PDF report error:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
});

module.exports = router;