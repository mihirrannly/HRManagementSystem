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
    console.log('🔐 LOGIN ATTEMPT:', req.body.email || req.body.loginInput);

    const { email: loginInput, password } = req.body;

    // Manual validation for email/employee ID
    if (!loginInput || !loginInput.trim()) {
      return res.status(400).json({ 
        message: 'Please enter your email address or employee ID to login.' 
      });
    }

    // Validate input format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const employeeIdRegex = /^CODR\d+$/i;
    
    if (!emailRegex.test(loginInput) && !employeeIdRegex.test(loginInput)) {
      return res.status(400).json({ 
        message: 'Invalid format. Please enter a valid email address (user@rannkly.com) or employee ID (CODR037).' 
      });
    }

    // Validate password
    if (!password || !password.trim()) {
      return res.status(400).json({ 
        message: 'Please enter your password.' 
      });
    }

    let user = null;

    if (emailRegex.test(loginInput)) {
      // Login with email
      user = await User.findOne({ email: loginInput.toLowerCase() });
    } else if (employeeIdRegex.test(loginInput)) {
      // Login with employee ID - find the employee first, then get the user
      const Employee = require('../models/Employee');
      console.log('🔍 Looking up employee with ID:', loginInput.toUpperCase());
      
      const employee = await Employee.findOne({ employeeId: loginInput.toUpperCase() })
        .populate('user');
      
      console.log('🔍 Employee lookup result:', employee ? 'FOUND' : 'NOT FOUND');
      
      if (employee) {
        console.log('🔍 Employee details:', {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`,
          hasUser: !!employee.user
        });
        
        if (employee.user) {
          console.log('🔍 User details from employee:', {
            _id: employee.user._id,
            email: employee.user.email,
            role: employee.user.role,
            isActive: employee.user.isActive
          });
          
          user = employee.user;
          console.log('🔍 User assigned to variable:', user._id);
        }
      }
    }

    if (!user) {
      // Provide specific error message based on input type
      if (emailRegex.test(loginInput)) {
        return res.status(401).json({ 
          message: 'No account found with this email address. Please check your email or contact HR.' 
        });
      } else {
        return res.status(401).json({ 
          message: 'Employee ID not found. Please check your employee ID or contact HR.' 
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Your account has been deactivated. Please contact HR for assistance.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Incorrect password. Please check your password and try again.' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get employee info if exists - return complete data like /auth/me
    const employee = await Employee.findOne({ user: user._id })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('employeeId personalInfo contactInfo employmentInfo salaryInfo');

    console.log('🔍 Final user object before token generation:', {
      _id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Generate token
    const token = generateToken(user._id);
    console.log('🔍 Generated token for user ID:', user._id);

    console.log('✅ LOGIN SUCCESS:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      employeeId: employee?.employeeId
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      },
      employee: employee || null
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
    console.log('🔍 /me endpoint hit, user ID:', req.user._id);
    console.log('🔍 User details:', { email: req.user.email, role: req.user.role });
    
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('employeeId personalInfo contactInfo employmentInfo salaryInfo');

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

