const cron = require('node-cron');
const moment = require('moment');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { LeaveRequest, Holiday } = require('../models/Leave');

class AttendanceScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the attendance scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Attendance scheduler is already running');
      return;
    }

    console.log('🕒 Starting Attendance Scheduler...');

    // Run daily at 11:59 PM to process the day's attendance
    cron.schedule('59 23 * * *', async () => {
      console.log('🔄 Running daily attendance processing...');
      await this.processDailyAttendance();
    });

    // Run every hour during work hours to check for auto-markings
    cron.schedule('0 9-18 * * 1-5', async () => {
      console.log('🔄 Running hourly attendance check...');
      await this.processHourlyChecks();
    });

    this.isRunning = true;
    console.log('✅ Attendance Scheduler started successfully');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.isRunning = false;
    console.log('⏹️ Attendance Scheduler stopped');
  }

  /**
   * Process daily attendance - mark leave, holidays, weekends
   */
  async processDailyAttendance() {
    try {
      const today = moment().startOf('day').toDate();
      const todayEnd = moment().endOf('day').toDate();

      console.log(`📅 Processing attendance for ${moment(today).format('YYYY-MM-DD')}`);

      // Get all active employees
      const employees = await Employee.find({
        'employmentInfo.isActive': true
      }).select('_id personalInfo.firstName personalInfo.lastName employeeId');

      let processedCount = 0;
      let leaveCount = 0;
      let holidayCount = 0;
      let weekendCount = 0;

      for (const employee of employees) {
        // Check if attendance record already exists
        const existingAttendance = await Attendance.findOne({
          employee: employee._id,
          date: today
        });

        if (existingAttendance) {
          continue; // Skip if already processed
        }

        // Check if employee is on leave
        const leaveRequest = await LeaveRequest.findOne({
          employee: employee._id,
          status: 'approved',
          startDate: { $lte: todayEnd },
          endDate: { $gte: today }
        }).populate('leaveType', 'name code');

        if (leaveRequest) {
          await this.markLeaveAttendance(employee, today, leaveRequest);
          leaveCount++;
          processedCount++;
          continue;
        }

        // Check if today is a holiday
        const holiday = await Holiday.findOne({
          date: {
            $gte: today,
            $lte: todayEnd
          }
        });

        if (holiday) {
          await this.markHolidayAttendance(employee, today, holiday);
          holidayCount++;
          processedCount++;
          continue;
        }

        // Check if today is weekend
        const dayOfWeek = moment(today).day();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          await this.markWeekendAttendance(employee, today);
          weekendCount++;
          processedCount++;
          continue;
        }

        // If no attendance record and not on leave/holiday/weekend, mark as absent
        const currentTime = new Date();
        if (currentTime.getHours() >= 19) { // After 7 PM, mark as absent if no check-in
          await this.markAbsentAttendance(employee, today);
          processedCount++;
        }
      }

      console.log(`✅ Daily attendance processing completed:`);
      console.log(`   - Total processed: ${processedCount}`);
      console.log(`   - On leave: ${leaveCount}`);
      console.log(`   - Holiday: ${holidayCount}`);
      console.log(`   - Weekend: ${weekendCount}`);

    } catch (error) {
      console.error('❌ Error in daily attendance processing:', error);
    }
  }

  /**
   * Process hourly checks during work hours
   */
  async processHourlyChecks() {
    try {
      const today = moment().startOf('day').toDate();
      const currentHour = moment().hour();

      // At 10 AM, send late arrival notifications
      if (currentHour === 10) {
        await this.processLateArrivals(today);
      }

      // At 6 PM, process early departures and auto-checkout
      if (currentHour === 18) {
        await this.processEndOfDay(today);
      }

    } catch (error) {
      console.error('❌ Error in hourly attendance checks:', error);
    }
  }

  /**
   * Mark attendance for employee on leave
   */
  async markLeaveAttendance(employee, date, leaveRequest) {
    try {
      const attendance = new Attendance({
        employee: employee._id,
        date: date,
        status: 'on-leave',
        leaveRequest: leaveRequest._id,
        notes: `On ${leaveRequest.leaveType.name} leave`,
        isManualEntry: true
      });

      await attendance.save();
      console.log(`📝 Marked ${employee.employeeId} as on leave for ${moment(date).format('YYYY-MM-DD')}`);

    } catch (error) {
      console.error(`❌ Error marking leave attendance for ${employee.employeeId}:`, error);
    }
  }

  /**
   * Mark attendance for holiday
   */
  async markHolidayAttendance(employee, date, holiday) {
    try {
      const attendance = new Attendance({
        employee: employee._id,
        date: date,
        status: 'holiday',
        notes: `Holiday: ${holiday.name}`,
        isManualEntry: true
      });

      await attendance.save();
      console.log(`🎉 Marked ${employee.employeeId} as holiday for ${moment(date).format('YYYY-MM-DD')}`);

    } catch (error) {
      console.error(`❌ Error marking holiday attendance for ${employee.employeeId}:`, error);
    }
  }

  /**
   * Mark attendance for weekend
   */
  async markWeekendAttendance(employee, date) {
    try {
      const attendance = new Attendance({
        employee: employee._id,
        date: date,
        status: 'weekend',
        notes: 'Weekend',
        isManualEntry: true
      });

      await attendance.save();
      console.log(`🏖️ Marked ${employee.employeeId} as weekend for ${moment(date).format('YYYY-MM-DD')}`);

    } catch (error) {
      console.error(`❌ Error marking weekend attendance for ${employee.employeeId}:`, error);
    }
  }

  /**
   * Mark attendance as absent
   */
  async markAbsentAttendance(employee, date) {
    try {
      const attendance = new Attendance({
        employee: employee._id,
        date: date,
        status: 'absent',
        notes: 'Auto-marked absent (no check-in recorded)',
        isManualEntry: true
      });

      await attendance.save();
      console.log(`❌ Marked ${employee.employeeId} as absent for ${moment(date).format('YYYY-MM-DD')}`);

    } catch (error) {
      console.error(`❌ Error marking absent attendance for ${employee.employeeId}:`, error);
    }
  }

  /**
   * Process late arrivals and send notifications
   */
  async processLateArrivals(date) {
    try {
      const lateAttendance = await Attendance.find({
        date: date,
        isLate: true,
        'checkIn.time': { $exists: true }
      }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName');

      if (lateAttendance.length > 0) {
        console.log(`⏰ Found ${lateAttendance.length} late arrivals for ${moment(date).format('YYYY-MM-DD')}`);
        
        // Here you could send notifications to HR/managers
        // await this.sendLateArrivalNotifications(lateAttendance);
      }

    } catch (error) {
      console.error('❌ Error processing late arrivals:', error);
    }
  }

  /**
   * Process end of day activities
   */
  async processEndOfDay(date) {
    try {
      // Find employees who checked in but haven't checked out
      const incompleteAttendance = await Attendance.find({
        date: date,
        'checkIn.time': { $exists: true },
        'checkOut.time': { $exists: false }
      }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName');

      console.log(`🕕 Found ${incompleteAttendance.length} employees who haven't checked out`);

      // Optionally auto-checkout employees at end of day
      // for (const attendance of incompleteAttendance) {
      //   await this.autoCheckout(attendance);
      // }

    } catch (error) {
      console.error('❌ Error processing end of day:', error);
    }
  }

  /**
   * Auto checkout employee (optional feature)
   */
  async autoCheckout(attendance) {
    try {
      const checkoutTime = moment().hour(18).minute(0).second(0).toDate();
      
      attendance.checkOut = {
        time: checkoutTime,
        method: 'auto',
        deviceInfo: { system: 'auto-checkout' },
        ipAddress: 'system'
      };

      attendance.notes = (attendance.notes || '') + ' | Auto-checkout at 6 PM';
      
      await attendance.save();
      
      console.log(`🚪 Auto-checked out ${attendance.employee.employeeId} at 6 PM`);

    } catch (error) {
      console.error(`❌ Error auto-checking out ${attendance.employee.employeeId}:`, error);
    }
  }

  /**
   * Manual trigger for daily processing (for testing)
   */
  async runDailyProcessing() {
    console.log('🔧 Manual trigger: Running daily attendance processing...');
    await this.processDailyAttendance();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRuns: {
        dailyProcessing: '23:59 daily',
        hourlyChecks: 'Every hour 9 AM - 6 PM (weekdays)'
      }
    };
  }
}

module.exports = new AttendanceScheduler();
