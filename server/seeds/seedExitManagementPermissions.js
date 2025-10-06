const mongoose = require('mongoose');
const { Permission, Role, MODULES, ACTIONS } = require('../models/Permission');

const seedExitManagementPermissions = async () => {
  try {
    console.log('🌱 Seeding Exit Management permissions...');

    // Create exit management permission
    const exitManagementPermission = new Permission({
      module: MODULES.EXIT_MANAGEMENT,
      name: 'Exit Management',
      description: 'Manage employee exit processes and procedures',
      availableActions: [
        {
          action: ACTIONS.READ,
          description: 'View exit management records'
        },
        {
          action: ACTIONS.CREATE,
          description: 'Create new exit management records'
        },
        {
          action: ACTIONS.UPDATE,
          description: 'Update exit management records'
        },
        {
          action: ACTIONS.APPROVE,
          description: 'Approve exit management records'
        },
        {
          action: ACTIONS.EXPORT,
          description: 'Export exit management data'
        }
      ],
      isActive: true
    });

    await exitManagementPermission.save();
    console.log('✅ Exit Management permission created');

    // Update existing roles to include exit management permissions
    const roles = await Role.find({ isActive: true });

    for (const role of roles) {
      let updated = false;

      // Admin role - all permissions
      if (role.name === 'admin' || role.name === 'Admin') {
        const hasExitManagement = role.permissions.some(p => p.module === MODULES.EXIT_MANAGEMENT);
        if (!hasExitManagement) {
          role.permissions.push({
            module: MODULES.EXIT_MANAGEMENT,
            actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT]
          });
          updated = true;
        }
      }

      // HR role - all permissions except approve (they can approve)
      if (role.name === 'hr' || role.name === 'HR') {
        const hasExitManagement = role.permissions.some(p => p.module === MODULES.EXIT_MANAGEMENT);
        if (!hasExitManagement) {
          role.permissions.push({
            module: MODULES.EXIT_MANAGEMENT,
            actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT]
          });
          updated = true;
        }
      }

      // Manager role - read and update permissions
      if (role.name === 'manager' || role.name === 'Manager') {
        const hasExitManagement = role.permissions.some(p => p.module === MODULES.EXIT_MANAGEMENT);
        if (!hasExitManagement) {
          role.permissions.push({
            module: MODULES.EXIT_MANAGEMENT,
            actions: [ACTIONS.READ, ACTIONS.UPDATE]
          });
          updated = true;
        }
      }

      if (updated) {
        await role.save();
        console.log(`✅ Updated ${role.name} role with exit management permissions`);
      }
    }

    console.log('🎉 Exit Management permissions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding exit management permissions:', error);
    throw error;
  }
};

module.exports = seedExitManagementPermissions;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedExitManagementPermissions();
    process.exit(0);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}
