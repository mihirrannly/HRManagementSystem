const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  calculateSalaryBreakdown, 
  calculateFromMonthlyGross, 
  calculateFromBasic,
  validateBreakdown,
  formatSalary,
  getSalaryBreakdownTable 
} = require('../utils/salaryCalculator');

const router = express.Router();

// @route   POST /api/salary-calculator/calculate
// @desc    Calculate salary breakdown from CTC
// @access  Private (HR, Admin)
router.post('/calculate', [
  authenticate,
  authorize(['admin', 'hr', 'finance']),
  body('ctc').isFloat({ min: 0 }).withMessage('CTC must be a positive number'),
  body('calculationType').optional().isIn(['ctc', 'monthlyGross', 'basic']).withMessage('Invalid calculation type'),
  body('includePF').optional().isBoolean().withMessage('includePF must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { ctc, calculationType = 'ctc', includePF = false } = req.body;
    let breakdown;

    try {
      switch (calculationType) {
        case 'ctc':
          breakdown = calculateSalaryBreakdown(ctc, includePF);
          break;
        case 'monthlyGross':
          breakdown = calculateFromMonthlyGross(ctc, includePF);
          break;
        case 'basic':
          breakdown = calculateFromBasic(ctc, includePF);
          break;
        default:
          breakdown = calculateSalaryBreakdown(ctc, includePF);
      }
    } catch (error) {
      return res.status(400).json({ 
        message: 'Calculation failed',
        error: error.message 
      });
    }

    // Validate the breakdown
    if (!validateBreakdown(breakdown)) {
      return res.status(500).json({ 
        message: 'Invalid salary breakdown calculated' 
      });
    }

    // Format the response with currency formatting
    const formattedBreakdown = {
      ...breakdown,
      formatted: {
        monthly: {
          basic: formatSalary(breakdown.monthly.basic),
          hra: formatSalary(breakdown.monthly.hra),
          conveyanceAllowance: formatSalary(breakdown.monthly.conveyanceAllowance),
          specialAllowance: formatSalary(breakdown.monthly.specialAllowance),
          gross: formatSalary(breakdown.monthly.gross),
          ctc: formatSalary(breakdown.monthly.ctc)
        },
        yearly: {
          basic: formatSalary(breakdown.yearly.basic),
          hra: formatSalary(breakdown.yearly.hra),
          conveyanceAllowance: formatSalary(breakdown.yearly.conveyanceAllowance),
          specialAllowance: formatSalary(breakdown.yearly.specialAllowance),
          gross: formatSalary(breakdown.yearly.gross),
          ctc: formatSalary(breakdown.yearly.ctc)
        }
      },
      breakdownTable: getSalaryBreakdownTable(breakdown.yearly.ctc)
    };

    res.json({
      success: true,
      message: 'Salary breakdown calculated successfully',
      data: formattedBreakdown,
      calculationType,
      inputValue: ctc
    });

  } catch (error) {
    console.error('Salary calculation error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/salary-calculator/breakdown-table/:ctc
// @desc    Get formatted breakdown table for a given CTC
// @access  Private (HR, Admin)
router.get('/breakdown-table/:ctc', [
  authenticate,
  authorize(['admin', 'hr', 'finance'])
], async (req, res) => {
  try {
    const ctc = parseFloat(req.params.ctc);
    
    if (isNaN(ctc) || ctc <= 0) {
      return res.status(400).json({ 
        message: 'Invalid CTC value' 
      });
    }

    const breakdownTable = getSalaryBreakdownTable(ctc);
    
    res.json({
      success: true,
      ctc: ctc,
      breakdownTable: breakdownTable
    });

  } catch (error) {
    console.error('Get breakdown table error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/salary-calculator/validate
// @desc    Validate a salary breakdown
// @access  Private (HR, Admin)
router.post('/validate', [
  authenticate,
  authorize(['admin', 'hr', 'finance']),
  body('breakdown').isObject().withMessage('Breakdown must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { breakdown } = req.body;
    const isValid = validateBreakdown(breakdown);

    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Salary breakdown is valid' : 'Salary breakdown is invalid'
    });

  } catch (error) {
    console.error('Validate breakdown error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/salary-calculator/format/:amount
// @desc    Format a salary amount
// @access  Private (HR, Admin)
router.get('/format/:amount', [
  authenticate,
  authorize(['admin', 'hr', 'finance'])
], async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount);
    const showCurrency = req.query.currency !== 'false';
    
    if (isNaN(amount)) {
      return res.status(400).json({ 
        message: 'Invalid amount' 
      });
    }

    const formatted = formatSalary(amount, showCurrency);
    
    res.json({
      success: true,
      amount: amount,
      formatted: formatted
    });

  } catch (error) {
    console.error('Format salary error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
