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
// ============================================
// GET ALL EMPLOYEES (for admin dropdown)
// ============================================
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching all employees for payroll');
    const connection = await getConnection();

   const [employees] = await connection.execute(
  `SELECT employee_id as id, name, email, department, employee_id 
   FROM employees 
   WHERE is_active = 1
   ORDER BY name`
);

    await connection.end();
    console.log('✅ Fetched employees:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Error fetching employees' });
  }
});

// ============================================
// GET ALL PAYROLL RECORDS (Admin view)
// ============================================
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching all payroll records');
    const connection = await getConnection();

    const [payrolls] = await connection.execute(
      `SELECT p.*, e.name, e.email, e.employee_id
       FROM payroll p
       JOIN employees e ON p.employee_id = e.employee_id
       ORDER BY p.created_at DESC`
    );

    await connection.end();
    console.log('✅ Fetched payrolls:', payrolls.length);
    res.json(payrolls);
  } catch (error) {
    console.error('❌ Error fetching payrolls:', error);
    res.status(500).json({ success: false, message: 'Error fetching payrolls' });
  }
});

// ============================================
// GET EMPLOYEE'S OWN SALARY SLIPS
// ============================================
router.get('/my-slips', authenticateToken, async (req, res) => {
  try {
    console.log('💰 Fetching salary slips for employee:', req.user.employee_id);
    
    const connection = await getConnection();
    const [payrolls] = await connection.execute(
      `SELECT p.*, e.name, e.email, e.department
       FROM payroll p
       JOIN employees e ON p.employee_id = e.employee_id
       WHERE p.employee_id = ?
       ORDER BY p.month DESC`,
      [req.user.employee_id]
    );

    await connection.end();
   console.log('✅ Fetched salary slips:', payrolls.length);

res.json({
  success: true,
  slips: payrolls  
});

  } catch (error) {
    console.error('❌ Error fetching salary slips:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salary slips' });
  }
});

// ============================================
// GENERATE SALARY SLIP (Manual - For Frontend Form)
// ============================================
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { employee_id, basic_salary, allowances, deductions, bonus } = req.body;
    
    console.log('💰 Generating salary slip:', { employee_id, basic_salary, allowances, deductions, bonus });

    if (!employee_id || !basic_salary) {
      return res.status(400).json({ success: false, error: 'Employee ID and Basic Salary are required' });
    }

    const connection = await getConnection();

    // Get employee details
    const [employee] = await connection.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (employee.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Calculate net salary
    const basic = parseFloat(basic_salary) || 0;
    const allow = parseFloat(allowances) || 0;
    const bon = parseFloat(bonus) || 0;
    const deduc = parseFloat(deductions) || 0;
    const gross_salary = basic + allow + bon;
    const net_salary = gross_salary - deduc;

    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Check if payroll already exists for this month
    const [existing] = await connection.execute(
      'SELECT * FROM payroll WHERE employee_id = ? AND month = ?',
      [employee_id, month]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ 
        success: false, 
        error: `Salary slip already exists for ${currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}` 
      });
    }

// Insert new payroll record
await connection.execute(
  `INSERT INTO payroll 
   (employee_id, month, basic_salary, hra, other_allowances, gross_salary, 
    other_deductions, total_deductions, net_salary, payment_status, generated_date)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
  [employee_id, month, basic, allow, bon, gross_salary, deduc, deduc, net_salary]
);

    await connection.end();
    console.log('✅ Salary slip generated successfully');

    res.json({
      success: true,
      message: 'Salary slip generated successfully',
      data: {
        employee_id,
        month,
        basic_salary: basic,
        allowances: allow,
        bonus: bon,
        deductions: deduc,
        gross_salary,
        net_salary
      }
    });

  } catch (error) {
    console.error('❌ Error generating salary slip:', error);
    res.status(500).json({ success: false, error: 'Failed to generate salary slip' });
  }
});

// ============================================
// MARK PAYROLL AS PAID
// ============================================
router.put('/:id/mark-paid', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💳 Marking payroll as paid:', id);

    const connection = await getConnection();

    // Check if payroll exists
    const [existing] = await connection.execute(
      'SELECT * FROM payroll WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, error: 'Payroll record not found' });
    }

    // Update payment status
    await connection.execute(
      'UPDATE payroll SET payment_status = ?, payment_date = NOW() WHERE id = ?',
      ['Paid', id]
    );

    await connection.end();
    console.log('✅ Payroll marked as paid');

    res.json({
      success: true,
      message: 'Payroll marked as paid successfully'
    });

  } catch (error) {
    console.error('❌ Error marking payroll as paid:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// ============================================
// CALCULATE MONTHLY SALARY
// ============================================
router.post('/calculate/:employeeId/:month', authenticateToken, async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    console.log('💰 Calculating salary for:', employeeId, month);

    const connection = await getConnection();

    // Get employee details
    const [employee] = await connection.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (employee.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const emp = employee[0];
    const basic_salary = parseFloat(emp.basic_salary) || 25000;
    const allowances = parseFloat(emp.allowances) || 5000;
    const overtime_rate = parseFloat(emp.overtime_rate) || 200;

    // Get attendance data for the month
    const [attendance] = await connection.execute(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as half_days,
        SUM(CASE WHEN is_late = 1 THEN 1 ELSE 0 END) as late_days
      FROM attendance 
      WHERE employee_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
      [employeeId, month]
    );

    const att = attendance[0];
    const total_days = 30;
    const present_days = parseInt(att.present_days) || 0;
    const absent_days = parseInt(att.absent_days) || 0;
    const half_days = parseInt(att.half_days) || 0;
    const late_days = parseInt(att.late_days) || 0;

    // Get overtime hours
    const [overtime] = await connection.execute(
      `SELECT COALESCE(SUM(hours), 0) as total_overtime 
       FROM overtime 
       WHERE employee_id = ? AND DATE_FORMAT(date, '%Y-%m') = ? AND status = 'Approved'`,
      [employeeId, month]
    );

    const overtime_hours = parseFloat(overtime[0].total_overtime) || 0;
    const overtime_amount = overtime_hours * overtime_rate;

    // Calculate deductions
    const per_day_salary = basic_salary / total_days;
    const absent_deduction = absent_days * per_day_salary;
    const half_day_deduction = half_days * (per_day_salary / 2);
    const late_deduction = late_days * 100;
    const total_deductions = absent_deduction + half_day_deduction + late_deduction;

    // Calculate final salary
    const gross_salary = basic_salary + allowances + overtime_amount;
    const net_salary = gross_salary - total_deductions;

    // Check if payroll already exists
    const [existing] = await connection.execute(
      'SELECT * FROM payroll WHERE employee_id = ? AND month = ?',
      [employeeId, month]
    );

    if (existing.length > 0) {
      // Update existing
      await connection.execute(
        `UPDATE payroll SET 
          basic_salary = ?, total_days = ?, present_days = ?, absent_days = ?, 
          late_days = ?, half_days = ?, overtime_hours = ?, overtime_amount = ?, 
          allowances = ?, deductions = ?, gross_salary = ?, net_salary = ?, status = 'Generated'
        WHERE employee_id = ? AND month = ?`,
        [basic_salary, total_days, present_days, absent_days, late_days, half_days, 
         overtime_hours, overtime_amount, allowances, total_deductions, gross_salary, net_salary, employeeId, month]
      );
    } else {
      // Insert new
      await connection.execute(
        `INSERT INTO payroll (employee_id, month, basic_salary, total_days, present_days, absent_days, 
         late_days, half_days, overtime_hours, overtime_amount, allowances, deductions, gross_salary, net_salary, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Generated')`,
        [employeeId, month, basic_salary, total_days, present_days, absent_days, late_days, half_days, 
         overtime_hours, overtime_amount, allowances, total_deductions, gross_salary, net_salary]
      );
    }

    await connection.end();
    console.log('✅ Salary calculated successfully');

    res.json({
      success: true,
      message: 'Salary calculated successfully',
      data: {
        basic_salary,
        allowances,
        overtime_amount,
        gross_salary,
        deductions: total_deductions,
        net_salary,
        present_days,
        absent_days,
        late_days,
        half_days
      }
    });

  } catch (error) {
    console.error('❌ Error calculating salary:', error);
    res.status(500).json({ success: false, message: 'Error calculating salary', error: error.message });
  }
});

// ============================================
// GET MY SALARY SLIPS (Employee)
// ============================================
router.get('/my-slips', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.user.id;
    console.log('📄 Fetching salary slips for employee:', employeeId);

    const connection = await getConnection();

    const [slips] = await connection.execute(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY month DESC',
      [employeeId]
    );

    await connection.end();
    console.log('✅ Found', slips.length, 'salary slips');

    res.json({ success: true, slips });

  } catch (error) {
    console.error('❌ Error fetching salary slips:', error);
    res.status(500).json({ success: false, message: 'Error fetching salary slips', error: error.message });
  }
});

// ============================================
// GET ALL PAYROLL (Admin)
// ============================================
router.get('/all', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching all payroll records...');

    const connection = await getConnection();

    const [payroll] = await connection.execute(
      `SELECT p.*, e.name, e.employee_code, e.email 
       FROM payroll p 
       JOIN employees e ON p.employee_id = e.employee_id 
       ORDER BY p.month DESC, e.name ASC`
    );

    await connection.end();
    console.log('✅ Found', payroll.length, 'payroll records');

    res.json({ success: true, payroll });

  } catch (error) {
    console.error('❌ Error fetching payroll:', error);
    res.status(500).json({ success: false, message: 'Error fetching payroll', error: error.message });
  }
});

// ============================================
// MARK SALARY AS PAID (Admin)
// ============================================
router.put('/:id/paid', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('💵 Marking salary as paid:', id);

    const connection = await getConnection();

    await connection.execute(
      'UPDATE payroll SET status = "Paid", paid_date = NOW() WHERE payroll_id = ?',
      [id]
    );

    await connection.end();
    console.log('✅ Salary marked as paid');

    res.json({ success: true, message: 'Salary marked as paid' });

  } catch (error) {
    console.error('❌ Error marking salary as paid:', error);
    res.status(500).json({ success: false, message: 'Error marking salary as paid', error: error.message });
  }
});

module.exports = router;