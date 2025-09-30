const mongoose = require('mongoose');
const { Permission, Role, MODULES, ACTIONS } = require('../models/Permission');

const seedPermissions = async () => {
  try {
    console.log('🔐 Seeding permissions and roles...');

    // Clear existing permissions and roles
    await Permission.deleteMany({});
    await Role.deleteMany({});

    // Define module permissions
    const modulePermissions = [
      {
        module: MODULES.DASHBOARD,
        name: 'Dashboard Access',
        description: 'Access to main dashboard and analytics',
        availableActions: [
          { action: ACTIONS.READ, description: 'View dashboard and analytics' }
        ]
      },
      {
        module: MODULES.EMPLOYEES,
        name: 'Employee Management',
        description: 'Manage employee records and profiles',
        availableActions: [
          { action: ACTIONS.READ, description: 'View employee records' },
          { action: ACTIONS.CREATE, description: 'Create new employees' },
          { action: ACTIONS.UPDATE, description: 'Edit employee information' },
          { action: ACTIONS.DELETE, description: 'Delete employee records' },
          { action: ACTIONS.EXPORT, description: 'Export employee data' },
          { action: ACTIONS.IMPORT, description: 'Import employee data' }
        ]
      },
      {
        module: MODULES.ATTENDANCE,
        name: 'Attendance Management',
        description: 'Track and manage employee attendance',
        availableActions: [
          { action: ACTIONS.READ, description: 'View attendance records' },
          { action: ACTIONS.CREATE, description: 'Mark attendance' },
          { action: ACTIONS.UPDATE, description: 'Edit attendance records' },
          { action: ACTIONS.APPROVE, description: 'Approve attendance modifications' },
          { action: ACTIONS.EXPORT, description: 'Export attendance reports' }
        ]
      },
      {
        module: MODULES.LEAVE,
        name: 'Leave Management',
        description: 'Manage leave requests and approvals',
        availableActions: [
          { action: ACTIONS.READ, description: 'View leave requests' },
          { action: ACTIONS.CREATE, description: 'Apply for leave' },
          { action: ACTIONS.UPDATE, description: 'Edit leave requests' },
          { action: ACTIONS.APPROVE, description: 'Approve/reject leave requests' },
          { action: ACTIONS.DELETE, description: 'Cancel leave requests' }
        ]
      },
      {
        module: MODULES.PAYROLL,
        name: 'Payroll Management',
        description: 'Manage salary and payroll processing',
        availableActions: [
          { action: ACTIONS.READ, description: 'View payroll information' },
          { action: ACTIONS.CREATE, description: 'Generate payroll' },
          { action: ACTIONS.UPDATE, description: 'Edit payroll data' },
          { action: ACTIONS.APPROVE, description: 'Approve payroll' },
          { action: ACTIONS.EXPORT, description: 'Export payroll reports' }
        ]
      },
      {
        module: MODULES.PERFORMANCE,
        name: 'Performance Management',
        description: 'Track and evaluate employee performance',
        availableActions: [
          { action: ACTIONS.READ, description: 'View performance data' },
          { action: ACTIONS.CREATE, description: 'Create performance reviews' },
          { action: ACTIONS.UPDATE, description: 'Edit performance reviews' },
          { action: ACTIONS.APPROVE, description: 'Approve performance reviews' }
        ]
      },
      {
        module: MODULES.RECRUITMENT,
        name: 'Recruitment Management',
        description: 'Manage job postings and candidate applications',
        availableActions: [
          { action: ACTIONS.READ, description: 'View job postings and applications' },
          { action: ACTIONS.CREATE, description: 'Create job postings' },
          { action: ACTIONS.UPDATE, description: 'Edit job postings' },
          { action: ACTIONS.DELETE, description: 'Remove job postings' }
        ]
      },
      {
        module: MODULES.REPORTS,
        name: 'Reports & Analytics',
        description: 'Generate and view various reports',
        availableActions: [
          { action: ACTIONS.READ, description: 'View reports' },
          { action: ACTIONS.CREATE, description: 'Generate custom reports' },
          { action: ACTIONS.EXPORT, description: 'Export reports' }
        ]
      },
      {
        module: MODULES.ORGANIZATION,
        name: 'Organization Management',
        description: 'Manage organizational structure and departments',
        availableActions: [
          { action: ACTIONS.READ, description: 'View organization structure' },
          { action: ACTIONS.CREATE, description: 'Create departments/positions' },
          { action: ACTIONS.UPDATE, description: 'Edit organization structure' },
          { action: ACTIONS.DELETE, description: 'Remove departments/positions' }
        ]
      },
      {
        module: MODULES.ONBOARDING,
        name: 'Onboarding Management',
        description: 'Manage new employee onboarding process',
        availableActions: [
          { action: ACTIONS.READ, description: 'View onboarding progress' },
          { action: ACTIONS.CREATE, description: 'Create onboarding workflows' },
          { action: ACTIONS.UPDATE, description: 'Update onboarding status' },
          { action: ACTIONS.APPROVE, description: 'Approve onboarding completion' }
        ]
      },
      {
        module: MODULES.ASSETS,
        name: 'Asset Management',
        description: 'Manage company assets and assignments',
        availableActions: [
          { action: ACTIONS.READ, description: 'View assets and assignments' },
          { action: ACTIONS.CREATE, description: 'Create new assets' },
          { action: ACTIONS.UPDATE, description: 'Edit assets and assign to employees' },
          { action: ACTIONS.DELETE, description: 'Delete assets' },
          { action: ACTIONS.EXPORT, description: 'Export asset reports' }
        ]
      },
      {
        module: MODULES.SETTINGS,
        name: 'System Settings',
        description: 'Configure system settings and preferences',
        availableActions: [
          { action: ACTIONS.READ, description: 'View system settings' },
          { action: ACTIONS.UPDATE, description: 'Modify system settings' }
        ]
      },
      {
        module: MODULES.PERMISSIONS,
        name: 'Permission Management',
        description: 'Manage user roles and permissions',
        availableActions: [
          { action: ACTIONS.READ, description: 'View roles and permissions' },
          { action: ACTIONS.CREATE, description: 'Create new roles' },
          { action: ACTIONS.UPDATE, description: 'Edit roles and permissions' },
          { action: ACTIONS.DELETE, description: 'Delete roles' }
        ]
      }
    ];

    // Insert permissions
    await Permission.insertMany(modulePermissions);
    console.log('✅ Permissions created');

    // Define default roles
    const defaultRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        isSystemRole: true,
        permissions: Object.values(MODULES).map(module => ({
          module,
          actions: Object.values(ACTIONS)
        }))
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access to most system functions',
        isSystemRole: true,
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT, ACTIONS.IMPORT] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.UPDATE] },
          { module: MODULES.PAYROLL, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] },
          { module: MODULES.RECRUITMENT, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] },
          { module: MODULES.ORGANIZATION, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.ONBOARDING, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] },
          { module: MODULES.SETTINGS, actions: [ACTIONS.READ, ACTIONS.UPDATE] }
        ]
      },
      {
        name: 'hr',
        displayName: 'HR Manager',
        description: 'Human Resources management access',
        isSystemRole: true,
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.EXPORT] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.UPDATE] },
          { module: MODULES.PAYROLL, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE] },
          { module: MODULES.RECRUITMENT, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] },
          { module: MODULES.ONBOARDING, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] }
        ]
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Team management and supervisory access',
        isSystemRole: true,
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.APPROVE] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.APPROVE] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ] }
        ]
      },
      {
        name: 'employee',
        displayName: 'Employee',
        description: 'Basic employee access to personal functions',
        isSystemRole: true,
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.CREATE] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ] }
        ]
      }
    ];

    // Insert roles
    await Role.insertMany(defaultRoles);
    console.log('✅ Default roles created');

    console.log('🎉 Permission seeding completed successfully!');
    
    return {
      permissions: modulePermissions.length,
      roles: defaultRoles.length
    };
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedPermissions();
    })
    .then((result) => {
      console.log(`✅ Seeded ${result.permissions} permissions and ${result.roles} roles`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedPermissions;
