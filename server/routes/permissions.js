const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Permission, Role, UserRole, MODULES, ACTIONS } = require('../models/Permission');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();


// @route   GET /api/permissions/modules
// @desc    Get all available modules and actions
// @access  Private (Admin only)
router.get('/modules', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const modules = await Permission.find({ isActive: true }).sort({ module: 1 });
    
    res.json({
      modules: Object.values(MODULES),
      actions: Object.values(ACTIONS),
      moduleDetails: modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/permissions/roles
// @desc    Get all roles
// @access  Private (Admin only)
router.get('/roles', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    const roles = await Role.find(query)
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Role.countDocuments(query);

    res.json({
      roles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/permissions/roles
// @desc    Create new role
// @access  Private (Admin only)
router.post('/roles', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim().isLength({ min: 2, max: 50 }),
  body('displayName').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('permissions').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, displayName, description, permissions } = req.body;

    // Check if role name already exists
    const existingRole = await Role.findOne({ 
      name: name.toLowerCase().replace(/\s+/g, '_'),
      isActive: true 
    });
    
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already exists' });
    }

    // Validate permissions
    const validModules = Object.values(MODULES);
    const validActions = Object.values(ACTIONS);
    
    for (const perm of permissions) {
      if (!validModules.includes(perm.module)) {
        return res.status(400).json({ message: `Invalid module: ${perm.module}` });
      }
      for (const action of perm.actions) {
        if (!validActions.includes(action)) {
          return res.status(400).json({ message: `Invalid action: ${action}` });
        }
      }
    }

    const role = new Role({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      description,
      permissions,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await role.save();

    const populatedRole = await Role.findById(role._id)
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    res.status(201).json({
      message: 'Role created successfully',
      role: populatedRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/permissions/roles/:id
// @desc    Update role
// @access  Private (Admin only)
router.put('/roles/:id', [
  authenticate,
  authorize(['admin', 'hr']),
  body('displayName').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('permissions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.isSystemRole) {
      return res.status(400).json({ message: 'System roles cannot be modified' });
    }

    const { displayName, description, permissions } = req.body;

    if (permissions) {
      // Validate permissions
      const validModules = Object.values(MODULES);
      const validActions = Object.values(ACTIONS);
      
      for (const perm of permissions) {
        if (!validModules.includes(perm.module)) {
          return res.status(400).json({ message: `Invalid module: ${perm.module}` });
        }
        for (const action of perm.actions) {
          if (!validActions.includes(action)) {
            return res.status(400).json({ message: `Invalid action: ${action}` });
          }
        }
      }
      role.permissions = permissions;
    }

    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    role.updatedBy = req.user._id;

    await role.save();

    const populatedRole = await Role.findById(role._id)
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    res.json({
      message: 'Role updated successfully',
      role: populatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/permissions/roles/:id
// @desc    Delete role (soft delete)
// @access  Private (Admin only)
router.delete('/roles/:id', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.isSystemRole) {
      return res.status(400).json({ message: 'System roles cannot be deleted' });
    }

    // Check if role is assigned to any users
    const assignedUsers = await UserRole.countDocuments({ role: role._id, isActive: true });
    if (assignedUsers > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. It is assigned to ${assignedUsers} user(s)` 
      });
    }

    role.isActive = false;
    role.updatedBy = req.user._id;
    await role.save();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/permissions/users
// @desc    Get users with their roles
// @access  Private (Admin only)
router.get('/users', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    console.log('📥 Fetching users for permissions management...');
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    let userQuery = { isActive: true };
    if (search) {
      userQuery.email = { $regex: search, $options: 'i' };
    }

    console.log('🔍 User query:', userQuery);

    // Step 1: Get users
    const users = await User.find(userQuery, '-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`👥 Found ${users.length} users`);

    if (users.length === 0) {
      return res.json({
        users: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0,
          limit: parseInt(limit)
        }
      });
    }

    const userIds = users.map(u => u._id);
    console.log('🆔 User IDs:', userIds);

    // Step 2: Get role assignments (with error handling)
    let roleAssignments = [];
    try {
      roleAssignments = await UserRole.find({ 
        user: { $in: userIds }, 
        isActive: true 
      }).populate('role', 'name displayName permissions');
      console.log(`🎭 Found ${roleAssignments.length} role assignments`);
    } catch (roleError) {
      console.error('❌ Error fetching role assignments:', roleError);
      // Continue without role assignments
    }

    // Step 3: Get employee info (with error handling)
    let employees = [];
    try {
      employees = await Employee.find({ 
        user: { $in: userIds } 
      }, 'personalInfo.firstName personalInfo.lastName employeeId user');
      console.log(`👤 Found ${employees.length} employee profiles`);
    } catch (empError) {
      console.error('❌ Error fetching employee info:', empError);
      // Continue without employee info
    }

    // Step 4: Combine data safely
    const usersWithRoles = users.map(user => {
      const userRoles = roleAssignments.filter(ra => {
        try {
          return ra.user && ra.user.toString() === user._id.toString();
        } catch (err) {
          console.error('❌ Error filtering role assignments:', err);
          return false;
        }
      });

      const employee = employees.find(emp => {
        try {
          return emp.user && emp.user.toString() === user._id.toString();
        } catch (err) {
          console.error('❌ Error finding employee:', err);
          return false;
        }
      });
      
      return {
        ...user.toObject(),
        assignedRoles: userRoles.map(ra => ({
          _id: ra._id,
          role: ra.role ? {
            _id: ra.role._id,
            name: ra.role.name,
            displayName: ra.role.displayName
          } : null,
          assignedAt: ra.assignedAt
        })),
        employee: employee ? {
          name: `${employee.personalInfo?.firstName || ''} ${employee.personalInfo?.lastName || ''}`.trim() || 'Unknown',
          employeeId: employee.employeeId || 'N/A'
        } : null
      };
    });

    const total = await User.countDocuments(userQuery);

    console.log('✅ Successfully prepared user data');

    res.json({
      users: usersWithRoles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while fetching users', 
      details: error.message 
    });
  }
});

// @route   POST /api/permissions/users/:userId/roles
// @desc    Assign role to user
// @access  Private (Admin only)
router.post('/users/:userId/roles', [
  authenticate,
  authorize(['admin', 'hr']),
  body('roleId').isMongoId(),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { roleId, expiresAt } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role exists
    const role = await Role.findById(roleId);
    if (!role || !role.isActive) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if user already has this role
    const existingAssignment = await UserRole.findOne({
      user: userId,
      role: roleId,
      isActive: true
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'User already has this role' });
    }

    const userRole = new UserRole({
      user: userId,
      role: roleId,
      assignedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await userRole.save();

    const populatedUserRole = await UserRole.findById(userRole._id)
      .populate('role', 'name displayName permissions')
      .populate('assignedBy', 'email');

    res.status(201).json({
      message: 'Role assigned successfully',
      userRole: populatedUserRole
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/permissions/users/:userId/roles/:roleId
// @desc    Remove role from user
// @access  Private (Admin only)
router.delete('/users/:userId/roles/:roleId', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    const userRole = await UserRole.findOne({
      user: userId,
      role: roleId,
      isActive: true
    });

    if (!userRole) {
      return res.status(404).json({ message: 'Role assignment not found' });
    }

    userRole.isActive = false;
    await userRole.save();

    res.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/permissions/user-permissions/:userId
// @desc    Get effective permissions for a user
// @access  Private (Admin only)
router.get('/user-permissions/:userId', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active role assignments for user
    const roleAssignments = await UserRole.find({
      user: userId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).populate('role');

    // Combine all permissions from all roles
    const allPermissions = new Map();
    
    roleAssignments.forEach(assignment => {
      assignment.role.permissions.forEach(perm => {
        const key = perm.module;
        if (allPermissions.has(key)) {
          // Merge actions (union)
          const existing = allPermissions.get(key);
          const combined = [...new Set([...existing.actions, ...perm.actions])];
          allPermissions.set(key, { module: perm.module, actions: combined });
        } else {
          allPermissions.set(key, { module: perm.module, actions: [...perm.actions] });
        }
      });
    });

    const effectivePermissions = Array.from(allPermissions.values());

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      roles: roleAssignments.map(ra => ({
        _id: ra.role._id,
        name: ra.role.name,
        displayName: ra.role.displayName,
        assignedAt: ra.assignedAt,
        expiresAt: ra.expiresAt
      })),
      effectivePermissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
