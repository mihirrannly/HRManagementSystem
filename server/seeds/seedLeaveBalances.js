const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const { LeaveBalance } = require('../models/Leave');

const seedLeaveBalances = async () => {
  try {
    console.log('🌱 Starting leave balance seeding...');

    // Get all employees
    const employees = await Employee.find({});
    console.log(`📊 Found ${employees.length} employees`);

    const currentYear = new Date().getFullYear();
    let created = 0;
    let updated = 0;

    for (const employee of employees) {
      // Check if leave balance already exists for this employee and year
      let leaveBalance = await LeaveBalance.findOne({
        employee: employee._id,
        year: currentYear
      });

      if (!leaveBalance) {
        // Create new leave balance
        leaveBalance = new LeaveBalance({
          employee: employee._id,
          year: currentYear,
          casualLeave: {
            allocated: 12,
            used: 0,
            pending: 0,
            available: 12
          },
          sickLeave: {
            allocated: 12,
            used: 0,
            pending: 0,
            available: 12
          },
          specialLeave: {
            allocated: 3,
            used: 0,
            pending: 0,
            available: 3
          },
          monthlyUsage: []
        });

        await leaveBalance.save();
        created++;
        console.log(`✅ Created leave balance for ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName} (${employee.employeeId})`);
      } else {
        // Update existing leave balance if needed
        let needsUpdate = false;

        if (!leaveBalance.casualLeave || leaveBalance.casualLeave.allocated !== 12) {
          leaveBalance.casualLeave = {
            allocated: 12,
            used: leaveBalance.casualLeave?.used || 0,
            pending: leaveBalance.casualLeave?.pending || 0,
            available: 12 - (leaveBalance.casualLeave?.used || 0) - (leaveBalance.casualLeave?.pending || 0)
          };
          needsUpdate = true;
        }

        if (!leaveBalance.sickLeave || leaveBalance.sickLeave.allocated !== 12) {
          leaveBalance.sickLeave = {
            allocated: 12,
            used: leaveBalance.sickLeave?.used || 0,
            pending: leaveBalance.sickLeave?.pending || 0,
            available: 12 - (leaveBalance.sickLeave?.used || 0) - (leaveBalance.sickLeave?.pending || 0)
          };
          needsUpdate = true;
        }

        if (!leaveBalance.specialLeave || leaveBalance.specialLeave.allocated !== 3) {
          leaveBalance.specialLeave = {
            allocated: 3,
            used: leaveBalance.specialLeave?.used || 0,
            pending: leaveBalance.specialLeave?.pending || 0,
            available: 3 - (leaveBalance.specialLeave?.used || 0) - (leaveBalance.specialLeave?.pending || 0)
          };
          needsUpdate = true;
        }

        if (needsUpdate) {
          await leaveBalance.save();
          updated++;
          console.log(`🔄 Updated leave balance for ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName} (${employee.employeeId})`);
        } else {
          console.log(`⏭️  Leave balance already exists for ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName} (${employee.employeeId})`);
        }
      }
    }

    console.log(`\n📈 Leave balance seeding completed:`);
    console.log(`   ✅ Created: ${created} new leave balances`);
    console.log(`   🔄 Updated: ${updated} existing leave balances`);
    console.log(`   ⏭️  Skipped: ${employees.length - created - updated} unchanged records`);

  } catch (error) {
    console.error('❌ Error seeding leave balances:', error);
    throw error;
  }
};

module.exports = seedLeaveBalances;

// Run if called directly
if (require.main === module) {
  const runSeed = async () => {
    try {
      // Connect to MongoDB
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr';
      await mongoose.connect(mongoURI);
      console.log('📦 Connected to MongoDB');
      
      await seedLeaveBalances();
      console.log('🎉 Leave balance seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Leave balance seeding failed:', error);
      process.exit(1);
    }
  };

  runSeed();
}
