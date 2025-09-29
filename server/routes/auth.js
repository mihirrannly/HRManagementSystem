const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (but should be restricted to admin/HR in production)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'hr', 'manager', 'employee'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      email,
      password,
      role: role || 'employee'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (supports both email and employee ID)
// @access  Public
router.post('/login', async (req, res) => {
  try {

    const { email: loginInput, password } = req.body;

    // Manual validation for email/employee ID
    if (!loginInput || !loginInput.trim()) {
      return res.status(400).json({ 
        message: 'Email or Employee ID is required' 
      });
    }

    // Validate input format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const employeeIdRegex = /^CODR\d+$/i;
    
    if (!emailRegex.test(loginInput) && !employeeIdRegex.test(loginInput)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address or employee ID (CODR###)' 
      });
    }

    let user = null;

    if (emailRegex.test(loginInput)) {
      // Login with email
      user = await User.findOne({ email: loginInput.toLowerCase() });
    } else if (employeeIdRegex.test(loginInput)) {
      // Login with employee ID - find the employee first, then get the user
      const Employee = require('../models/Employee');
      const employee = await Employee.findOne({ employeeId: loginInput.toUpperCase() })
        .populate('user');
      
      if (employee && employee.user) {
        user = employee.user;
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get employee info if exists
    const employee = await Employee.findOne({ user: user._id })
      .populate('employmentInfo.department', 'name code')
      .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.designation');

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        employee: employee ? {
          id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          designation: employee.employmentInfo.designation,
          department: employee.employmentInfo.department
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('employeeId personalInfo employmentInfo.designation employmentInfo.department employmentInfo.reportingManager');

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        isActive: req.user.isActive,
        lastLogin: req.user.lastLogin
      },
      employee
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  authenticate,
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Here we can log the logout event or implement token blacklisting if needed
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

