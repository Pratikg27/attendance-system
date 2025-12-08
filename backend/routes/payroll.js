const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all employees (for dropdown in admin payroll)
router.get('/employees', auth, async (req, res) => {
  try {
    // Only fetch users with role 'employee'
    const employees = await User.find({ role: 'employee' })
      .select('name email employeeId')
      .sort({ name: 1 });
    
    console.log('✅ Fetched employees:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Create/Generate salary slip
router.post('/generate', auth, async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, bonus, deductions, month, year } = req.body;

    // Validate required fields
    if (!employeeId || !basicSalary || !month || !year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate net salary
    const netSalary = parseFloat(basicSalary) + 
                     parseFloat(allowances || 0) + 
                     parseFloat(bonus || 0) - 
                     parseFloat(deductions || 0);

    // Check if payroll already exists for this month/year
    const existingPayroll = await Payroll.findOne({
      employee: employeeId,
      month,
      year
    });

    if (existingPayroll) {
      return res.status(400).json({ 
        message: `Salary slip already exists for ${month} ${year}` 
      });
    }

    // Create new payroll record
    const payroll = new Payroll({
      employee: employeeId,
      basicSalary: parseFloat(basicSalary),
      allowances: parseFloat(allowances || 0),
      bonus: parseFloat(bonus || 0),
      deductions: parseFloat(deductions || 0),
      netSalary,
      month,
      year,
      generatedBy: req.user.userId
    });

    await payroll.save();

    // Populate employee details
    await payroll.populate('employee', 'name email employeeId');

    console.log('✅ Payroll generated successfully:', payroll);
    res.status(201).json({ 
      message: 'Salary slip generated successfully', 
      payroll 
    });
  } catch (error) {
    console.error('❌ Error generating payroll:', error);
    res.status(500).json({ message: 'Error generating payroll', error: error.message });
  }
});

// Get all payroll records (Admin view)
router.get('/all', auth, async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'name email employeeId')
      .sort({ createdAt: -1 });
    
    console.log('✅ Fetched all payrolls:', payrolls.length);
    res.json(payrolls);
  } catch (error) {
    console.error('❌ Error fetching payrolls:', error);
    res.status(500).json({ message: 'Error fetching payrolls', error: error.message });
  }
});

// Get payroll records for specific employee
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const payrolls = await Payroll.find({ employee: employeeId })
      .populate('employee', 'name email employeeId')
      .sort({ year: -1, month: -1 });
    
    console.log(`✅ Fetched payrolls for employee ${employeeId}:`, payrolls.length);
    res.json(payrolls);
  } catch (error) {
    console.error('❌ Error fetching employee payrolls:', error);
    res.status(500).json({ message: 'Error fetching payrolls', error: error.message });
  }
});

// Get my salary slips (Employee view)
router.get('/my-salary', auth, async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user.userId })
      .populate('employee', 'name email employeeId')
      .sort({ year: -1, month: -1 });
    
    console.log(`✅ Fetched my salary slips for user ${req.user.userId}:`, payrolls.length);
    res.json(payrolls);
  } catch (error) {
    console.error('❌ Error fetching my salary:', error);
    res.status(500).json({ message: 'Error fetching salary slips', error: error.message });
  }
});

// Delete payroll record
router.delete('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    
    console.log('✅ Payroll deleted:', req.params.id);
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting payroll:', error);
    res.status(500).json({ message: 'Error deleting payroll', error: error.message });
  }
});

module.exports = router;