const { UserRole, Role, MODULES, ACTIONS } = require('../models/Permission');

/**
 * Enhanced permission checking middleware
 * Checks both legacy role-based permissions and new granular permissions
 */
const checkPermissions = (requiredModule, requiredAction) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Super admin and HR bypass for permission management
      if (req.user.role === 'admin' || (req.user.role === 'hr' && requiredModule === MODULES.PERMISSIONS)) {
        return next();
      }

      // Get user's active role assignments
      const userRoles = await UserRole.find({
        user: req.user._id,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }).populate('role');

      // Check if user has required permission through any assigned role
      let hasPermission = false;

      for (const userRole of userRoles) {
        if (!userRole.role || !userRole.role.isActive) continue;

        const rolePermissions = userRole.role.permissions || [];
        const modulePermission = rolePermissions.find(p => p.module === requiredModule);
        
        if (modulePermission && modulePermission.actions.includes(requiredAction)) {
          hasPermission = true;
          break;
        }
      }

      // Fallback to legacy role-based permissions for backward compatibility
      if (!hasPermission) {
        const legacyPermissions = {
          [MODULES.DASHBOARD]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager', 'employee']
          },
          [MODULES.EMPLOYEES]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr'],
            [ACTIONS.DELETE]: ['admin'],
            [ACTIONS.EXPORT]: ['admin', 'hr'],
            [ACTIONS.IMPORT]: ['admin', 'hr']
          },
          [MODULES.ATTENDANCE]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager', 'employee'],
            [ACTIONS.CREATE]: ['admin', 'hr', 'employee'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.APPROVE]: ['admin', 'hr', 'manager'],
            [ACTIONS.EXPORT]: ['admin', 'hr', 'manager']
          },
          [MODULES.LEAVE]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager', 'employee'],
            [ACTIONS.CREATE]: ['admin', 'hr', 'employee'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'employee'],
            [ACTIONS.APPROVE]: ['admin', 'hr', 'manager'],
            [ACTIONS.DELETE]: ['admin', 'hr']
          },
          [MODULES.PAYROLL]: {
            [ACTIONS.READ]: ['admin', 'hr'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr'],
            [ACTIONS.APPROVE]: ['admin'],
            [ACTIONS.EXPORT]: ['admin', 'hr']
          },
          [MODULES.PERFORMANCE]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager', 'employee'],
            [ACTIONS.CREATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.APPROVE]: ['admin', 'hr']
          },
          [MODULES.RECRUITMENT]: {
            [ACTIONS.READ]: ['admin', 'hr'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr'],
            [ACTIONS.DELETE]: ['admin', 'hr']
          },
          [MODULES.REPORTS]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.EXPORT]: ['admin', 'hr', 'manager']
          },
          [MODULES.ORGANIZATION]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr'],
            [ACTIONS.DELETE]: ['admin']
          },
          [MODULES.ONBOARDING]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.APPROVE]: ['admin', 'hr']
          },
          [MODULES.EXIT_MANAGEMENT]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.APPROVE]: ['admin', 'hr'],
            [ACTIONS.EXPORT]: ['admin', 'hr']
          },
          [MODULES.ASSETS]: {
            [ACTIONS.READ]: ['admin', 'hr', 'manager'],
            [ACTIONS.CREATE]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin', 'hr', 'manager'],
            [ACTIONS.DELETE]: ['admin', 'hr'],
            [ACTIONS.EXPORT]: ['admin', 'hr', 'manager']
          },
          [MODULES.SETTINGS]: {
            [ACTIONS.READ]: ['admin', 'hr'],
            [ACTIONS.UPDATE]: ['admin']
          },
          [MODULES.PERMISSIONS]: {
            [ACTIONS.READ]: ['admin'],
            [ACTIONS.CREATE]: ['admin'],
            [ACTIONS.UPDATE]: ['admin'],
            [ACTIONS.DELETE]: ['admin']
          }
        };

        const modulePerms = legacyPermissions[requiredModule];
        if (modulePerms && modulePerms[requiredAction]) {
          hasPermission = modulePerms[requiredAction].includes(req.user.role);
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          message: `Access denied. Required permission: ${requiredAction} on ${requiredModule}`,
          required: { module: requiredModule, action: requiredAction },
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};

/**
 * Get effective permissions for a user
 */
const getUserPermissions = async (userId) => {
  try {
    const userRoles = await UserRole.find({
      user: userId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).populate('role');

    const allPermissions = new Map();
    
    userRoles.forEach(userRole => {
      if (!userRole.role || !userRole.role.isActive) return;
      
      userRole.role.permissions.forEach(perm => {
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

    return Array.from(allPermissions.values());
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

/**
 * Check if user has specific permission
 */
const hasPermission = async (userId, module, action) => {
  try {
    const permissions = await getUserPermissions(userId);
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Middleware to add user permissions to request object
 */
const attachUserPermissions = async (req, res, next) => {
  try {
    if (req.user) {
      req.userPermissions = await getUserPermissions(req.user._id);
    }
    next();
  } catch (error) {
    console.error('Error attaching user permissions:', error);
    next();
  }
};

module.exports = {
  checkPermissions,
  getUserPermissions,
  hasPermission,
  attachUserPermissions,
  MODULES,
  ACTIONS
};
