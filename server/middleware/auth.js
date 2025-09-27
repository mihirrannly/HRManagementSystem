const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check user role
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    next();
  };
};

// Check specific permissions
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Admin and HR have all permissions
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      return next();
    }

    const userPermission = req.user.permissions.find(p => p.module === module);
    
    if (!userPermission || !userPermission.actions.includes(action)) {
      return res.status(403).json({ 
        message: `Permission denied. Required: ${action} access to ${module}` 
      });
    }

    next();
  };
};

// Check if user can access employee data
const canAccessEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const Employee = require('../models/Employee');
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Admin and HR can access all employee data
    if (['admin', 'hr'].includes(req.user.role)) {
      return next();
    }

    // Managers can access their team members' data
    if (req.user.role === 'manager') {
      const userEmployee = await Employee.findOne({ user: req.user._id });
      if (employee.employmentInfo.reportingManager?.toString() === userEmployee._id.toString()) {
        return next();
      }
    }

    // Employees can only access their own data
    if (employee.user.toString() === req.user._id.toString()) {
      return next();
    }

    res.status(403).json({ message: 'Access denied to this employee data.' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking employee access permissions.' });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  canAccessEmployee
};

