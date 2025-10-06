const mongoose = require('mongoose');

// Define all available modules and their possible actions
const MODULES = {
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  PERFORMANCE: 'performance',
  RECRUITMENT: 'recruitment',
  REPORTS: 'reports',
  ORGANIZATION: 'organization',
  ONBOARDING: 'onboarding',
  EXIT_MANAGEMENT: 'exit_management',
  ASSETS: 'assets',
  SETTINGS: 'settings',
  PERMISSIONS: 'permissions'
};

const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
  IMPORT: 'import'
};

// Permission Schema - defines what actions are available for each module
const permissionSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true,
    enum: Object.values(MODULES)
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  availableActions: [{
    action: {
      type: String,
      enum: Object.values(ACTIONS)
    },
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Role Schema - defines roles and their permissions
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  permissions: [{
    module: {
      type: String,
      enum: Object.values(MODULES)
    },
    actions: [{
      type: String,
      enum: Object.values(ACTIONS)
    }]
  }],
  isSystemRole: {
    type: Boolean,
    default: false // System roles cannot be deleted
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
roleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// User Role Assignment Schema - tracks role assignments to users
const userRoleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date, // Optional expiration
  isActive: {
    type: Boolean,
    default: true
  }
});

// Indexes
permissionSchema.index({ module: 1, isActive: 1 });
roleSchema.index({ name: 1, isActive: 1 });
userRoleSchema.index({ user: 1, isActive: 1 });
userRoleSchema.index({ role: 1, isActive: 1 });

const Permission = mongoose.model('Permission', permissionSchema);
const Role = mongoose.model('Role', roleSchema);
const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = {
  Permission,
  Role,
  UserRole,
  MODULES,
  ACTIONS
};
