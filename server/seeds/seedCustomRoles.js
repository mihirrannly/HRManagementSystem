const mongoose = require('mongoose');
const { Role, UserRole, MODULES, ACTIONS } = require('../models/Permission');
const User = require('../models/User');

const seedCustomRoles = async () => {
  try {
    console.log('🎭 Creating custom organizational roles...');

    // Define custom roles with their permissions
    const customRoles = [
      {
        name: 'asset_manager',
        displayName: 'Asset Manager',
        description: 'An asset manager has all the permissions to manage the assets in the organization.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.ASSETS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT] },
          { module: MODULES.ORGANIZATION, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'expense_manager',
        displayName: 'Expense Manager',
        description: 'An Expense Manager has all permissions to manage expenses of all employees',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.PAYROLL, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'global_admin',
        displayName: 'Global Admin',
        description: 'A global admin has all permissions across the system including finances and executive dashboards.',
        permissions: Object.values(MODULES).map(module => ({
          module,
          actions: Object.values(ACTIONS)
        })),
        isSystemRole: false
      },
      {
        name: 'hr_executive',
        displayName: 'HR Executive',
        description: 'A HR Executive has access to manage all employee information except financial information.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT, ACTIONS.IMPORT] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.UPDATE] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE] },
          { module: MODULES.RECRUITMENT, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.ONBOARDING, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'hr_manager',
        displayName: 'HR Manager',
        description: 'A HR manager has access to manage all employee information including employee financial information.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT, ACTIONS.IMPORT] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.UPDATE] },
          { module: MODULES.PAYROLL, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.EXPORT] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE] },
          { module: MODULES.RECRUITMENT, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.ONBOARDING, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] },
          { module: MODULES.PERMISSIONS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] }
        ],
        isSystemRole: false
      },
      {
        name: 'it_admin',
        displayName: 'IT Admin',
        description: 'Role for IT administration with elevated privileges.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
          { module: MODULES.ORGANIZATION, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.SETTINGS, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
          { module: MODULES.PERMISSIONS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'learn_admin',
        displayName: 'Learn Admin',
        description: 'A Learn Admin has all permissions related to learn.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.PERFORMANCE, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'payroll_admin',
        displayName: 'Payroll Admin',
        description: 'A payroll administrator has all permissions to manage payroll',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.ATTENDANCE, actions: [ACTIONS.READ, ACTIONS.EXPORT] },
          { module: MODULES.LEAVE, actions: [ACTIONS.READ] },
          { module: MODULES.PAYROLL, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      },
      {
        name: 'travel_desk_manager',
        displayName: 'Travel Desk Manager',
        description: 'An travel desk admin has access to manage the travel booking requests made by employees.',
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.EMPLOYEES, actions: [ACTIONS.READ] },
          { module: MODULES.REPORTS, actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT] }
        ],
        isSystemRole: false
      }
    ];

    // Create roles
    console.log('📝 Creating custom roles...');
    for (const roleData of customRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.displayName}`);
      } else {
        console.log(`⚠️  Role already exists: ${roleData.displayName}`);
      }
    }

    console.log('🎉 Custom roles creation completed!');
    
    return customRoles.length;
  } catch (error) {
    console.error('❌ Error creating custom roles:', error);
    throw error;
  }
};

const assignRolesToUsers = async () => {
  try {
    console.log('👥 Assigning roles to specific users...');

    // Define user-role assignments
    const userRoleAssignments = [
      // Kashish Ahuja - HR roles
      { email: 'hr@rannkly.com', roles: ['asset_manager', 'hr_executive', 'hr_manager', 'it_admin', 'payroll_admin'] },
      { email: 'kashish@rannkly.com', roles: ['asset_manager', 'hr_executive', 'hr_manager', 'it_admin', 'payroll_admin'] },
      
      // Kunika Baghel - Finance roles
      { email: 'kunika@rannkly.com', roles: ['expense_manager', 'global_admin', 'payroll_admin'] },
      { email: 'kunika@gmail.com', roles: ['expense_manager', 'global_admin', 'payroll_admin'] },
      
      // Co-founders - Global Admin
      { email: 'mihir@rannkly.com', roles: ['global_admin'] },
      { email: 'mihir.bhardwaj@rannkly.com', roles: ['global_admin'] },
      { email: 'vishnu@rannkly.com', roles: ['global_admin'] },
      { email: 'vishnu.sharma@rannkly.com', roles: ['global_admin'] },
      { email: 'shobhit@rannkly.com', roles: ['global_admin'] },
      { email: 'shobhit.singh@rannkly.com', roles: ['global_admin'] }
    ];

    // Get admin user for assignment tracking
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found for role assignment tracking');
      return;
    }

    for (const assignment of userRoleAssignments) {
      const user = await User.findOne({ email: assignment.email, isActive: true });
      if (!user) {
        console.log(`⚠️  User not found: ${assignment.email}`);
        continue;
      }

      console.log(`👤 Processing user: ${user.email}`);

      for (const roleName of assignment.roles) {
        const role = await Role.findOne({ name: roleName });
        if (!role) {
          console.log(`⚠️  Role not found: ${roleName}`);
          continue;
        }

        // Check if user already has this role
        const existingAssignment = await UserRole.findOne({
          user: user._id,
          role: role._id,
          isActive: true
        });

        if (!existingAssignment) {
          const userRole = new UserRole({
            user: user._id,
            role: role._id,
            assignedBy: adminUser._id
          });
          await userRole.save();
          console.log(`✅ Assigned ${role.displayName} to ${user.email}`);
        } else {
          console.log(`⚠️  ${user.email} already has ${role.displayName}`);
        }
      }
    }

    console.log('🎉 Role assignments completed!');
  } catch (error) {
    console.error('❌ Error assigning roles:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr')
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedCustomRoles();
    })
    .then((roleCount) => {
      console.log(`✅ Created ${roleCount} custom roles`);
      return assignRolesToUsers();
    })
    .then(() => {
      console.log('🎉 Custom role setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { seedCustomRoles, assignRolesToUsers };
