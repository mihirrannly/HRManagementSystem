const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UserRole } = require('../models/Permission');

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

    // Get assigned roles from UserRole collection
    let effectiveRole = user.role; // Start with base role
    
    try {
      const roleAssignments = await UserRole.find({
        user: user._id,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }).populate('role', 'name');

      // Filter out any assignments where role didn't populate (deleted roles)
      const validAssignments = roleAssignments.filter(ra => ra.role && ra.role.name);
      const assignedRoleNames = validAssignments.map(ra => ra.role.name);
      
      // If user has HR-related roles, upgrade effective role
      if (assignedRoleNames.some(name => ['hr', 'hr_manager', 'hr_executive'].includes(name))) {
        effectiveRole = 'hr';
      }
      // If user has admin roles, upgrade to admin
      if (assignedRoleNames.some(name => ['admin', 'super_admin', 'global_admin'].includes(name))) {
        effectiveRole = 'admin';
      }
    } catch (roleError) {
      console.error('Error fetching user roles, using base role:', roleError.message);
      // Continue with base role if role fetching fails
    }

    // Add effectiveRole to user object
    req.user = user;
    req.user.effectiveRole = effectiveRole;
    
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

    // Use effectiveRole if available, otherwise fall back to role
    const userRole = req.user.effectiveRole || req.user.role;

    if (!roles.includes(userRole)) {
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

    // Use effectiveRole if available, otherwise fall back to role
    const userRole = req.user.effectiveRole || req.user.role;

    // Admin and HR have all permissions
    if (userRole === 'admin' || userRole === 'hr') {
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
    const employeeId = req.params.id || req.params.employeeId;
    const Employee = require('../models/Employee');
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Use effectiveRole if available, otherwise fall back to role
    const userRole = req.user.effectiveRole || req.user.role;

    // Admin and HR can access all employee data
    if (['admin', 'hr'].includes(userRole)) {
      return next();
    }

    // Managers can access their team members' data
    if (userRole === 'manager') {
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

// Check if user can access employee data with data filtering
const canAccessEmployeeWithFilter = async (req, res, next) => {
  try {
    const employeeId = req.params.id || req.params.employeeId;
    const Employee = require('../models/Employee');
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Use effectiveRole if available, otherwise fall back to role
    const userRole = req.user.effectiveRole || req.user.role;

    // Admin and HR can access all employee data without filtering
    if (['admin', 'hr'].includes(userRole)) {
      req.accessLevel = 'full';
      return next();
    }

    // Managers can access their team members' data with filtering
    if (userRole === 'manager') {
      const userEmployee = await Employee.findOne({ user: req.user._id });
      if (employee.employmentInfo.reportingManager?.toString() === userEmployee._id.toString()) {
        req.accessLevel = 'manager';
        return next();
      }
    }

    // Employees can only access their own data
    if (employee.user.toString() === req.user._id.toString()) {
      req.accessLevel = 'self';
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
  canAccessEmployee,
  canAccessEmployeeWithFilter
};

