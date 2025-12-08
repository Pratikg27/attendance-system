const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ============================================
// GET EMPLOYEE PROFILE
// ============================================
router.get('/profile/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { employee_id: req.params.id },
      attributes: { exclude: ['password'] }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.json({
      success: true,
      employee
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============================================
// GET EMPLOYEE ATTENDANCE HISTORY
// ============================================
router.get('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    let whereClause = { employee_id: id };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
      limit: 30
    });

    res.json({
      success: true,
      attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============================================
// GET EMPLOYEE LEAVES
// ============================================
router.get('/leaves/:id', async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { employee_id: req.params.id },
      order: [['applied_date', 'DESC']]
    });

    res.json({
      success: true,
      leaves
    });

  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============================================
// APPLY FOR LEAVE
// ============================================
router.post('/leave/apply', async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    // Validate input
    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Calculate total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (total_days <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after or equal to start date' 
      });
    }

    // Check leave balance
    const employee = await Employee.findOne({ 
      where: { employee_id } 
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    const balanceField = `${leave_type.toLowerCase()}_balance`;
    if (employee[balanceField] < total_days) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient ${leave_type} balance. Available: ${employee[balanceField]} days` 
      });
    }

    // Create leave application
    const leave = await Leave.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      total_days,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;