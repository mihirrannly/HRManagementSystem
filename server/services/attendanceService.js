const geolib = require('geolib');
const moment = require('moment');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { LeaveRequest } = require('../models/Leave');

class AttendanceService {
  constructor() {
    // Office location configuration
    this.officeConfig = {
      location: {
        latitude: 28.6139, // Default Delhi coordinates - should be configurable
        longitude: 77.2090
      },
      radius: 200, // 200 meters radius
      allowedIPs: [
        '192.168.1.0/24', // Office network
        '10.0.0.0/8',     // Internal network
        // Add more office IP ranges
      ],
      allowedWiFiMACs: [
        // Add office WiFi MAC addresses
        '00:11:22:33:44:55',
        '66:77:88:99:AA:BB'
      ],
      workingHours: {
        start: '09:00',
        end: '18:00',
        graceMinutes: 60 // 60 minutes grace period for testing
      }
    };
  }

  /**
   * Validate if employee is in office location
   */
  async validateOfficeLocation(locationData, ipAddress, wifiMAC = null) {
    const validation = {
      ipValid: false,
      geoValid: false,
      wifiValid: false,
      overall: false
    };

    // IP Address validation
    if (ipAddress) {
      validation.ipValid = this.isIPInOfficeRange(ipAddress);
    }

    // Geolocation validation
    if (locationData && locationData.latitude && locationData.longitude) {
      const distance = geolib.getDistance(
        { latitude: locationData.latitude, longitude: locationData.longitude },
        this.officeConfig.location
      );
      validation.geoValid = distance <= this.officeConfig.radius;
    }

    // WiFi MAC validation (if provided)
    if (wifiMAC) {
      validation.wifiValid = this.officeConfig.allowedWiFiMACs.includes(wifiMAC);
    }

    // Overall validation - at least one method should be valid
    validation.overall = validation.ipValid || validation.geoValid || validation.wifiValid;

    return validation;
  }

  /**
   * Check if IP is in office range
   */
  isIPInOfficeRange(ipAddress) {
    // Simple IP range check - in production, use proper CIDR validation
    return this.officeConfig.allowedIPs.some(range => {
      if (range.includes('/')) {
        // CIDR notation - simplified check
        const [network] = range.split('/');
        return ipAddress.startsWith(network.split('.').slice(0, 3).join('.'));
      }
      return ipAddress === range;
    });
  }

  /**
   * Check if employee is on leave today
   */
  async isEmployeeOnLeave(employeeId, date = new Date()) {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    const leaveRequest = await LeaveRequest.findOne({
      employee: employeeId,
      status: 'approved',
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay }
    });

    return leaveRequest;
  }

  /**
   * Check if today is weekend or holiday
   */
  isWeekendOrHoliday(date = new Date()) {
    const dayOfWeek = moment(date).day();
    // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * Calculate if check-in is late
   */
  isLateCheckIn(checkInTime) {
    const workStart = moment(checkInTime).clone().startOf('day')
      .add(moment.duration(this.officeConfig.workingHours.start));
    const graceTime = workStart.clone().add(this.officeConfig.workingHours.graceMinutes, 'minutes');
    
    return {
      isLate: moment(checkInTime).isAfter(graceTime),
      lateMinutes: Math.max(0, moment(checkInTime).diff(workStart, 'minutes'))
    };
  }

  /**
   * Calculate if check-out is early
   */
  isEarlyCheckOut(checkOutTime) {
    const workEnd = moment(checkOutTime).clone().startOf('day')
      .add(moment.duration(this.officeConfig.workingHours.end));
    
    return {
      isEarly: moment(checkOutTime).isBefore(workEnd),
      earlyMinutes: Math.max(0, workEnd.diff(moment(checkOutTime), 'minutes'))
    };
  }

  /**
   * Process check-in
   */
  async processCheckIn(employeeId, locationData, deviceInfo, ipAddress, screenshot = null) {
    try {
      const today = moment().startOf('day').toDate();
      
      // Check if employee is on leave
      const leaveRequest = await this.isEmployeeOnLeave(employeeId, today);
      if (leaveRequest) {
        throw new Error('Cannot check-in while on approved leave');
      }

      // Check if weekend
      if (this.isWeekendOrHoliday(today)) {
        // Allow weekend check-in but mark as weekend
      }

      // Check if already checked in today
      const existingAttendance = await Attendance.findOne({
        employee: employeeId,
        date: today
      });

      if (existingAttendance && existingAttendance.checkIn?.time) {
        throw new Error('Already checked in today');
      }

    // Validate location (relaxed for testing)
    const locationValidation = await this.validateOfficeLocation(locationData, ipAddress);
    
    // For testing: allow check-in from any location
    console.log('🧪 Testing mode: Location validation bypassed');
    locationValidation.overall = true;

      const checkInTime = new Date();
      const lateInfo = this.isLateCheckIn(checkInTime);

      // Create or update attendance record
      const attendanceData = {
        employee: employeeId,
        date: today,
        checkIn: {
          time: checkInTime,
          location: locationData,
          method: 'web',
          deviceInfo,
          ipAddress,
          screenshot,
          isValidLocation: locationValidation.overall,
          locationValidation: locationValidation
        },
        isLate: lateInfo.isLate,
        lateMinutes: lateInfo.lateMinutes,
        status: this.isWeekendOrHoliday(today) ? 'weekend' : (lateInfo.isLate ? 'late' : 'present')
      };

      let attendance;
      if (existingAttendance) {
        Object.assign(existingAttendance, attendanceData);
        attendance = await existingAttendance.save();
      } else {
        attendance = new Attendance(attendanceData);
        await attendance.save();
      }

      return {
        success: true,
        attendance,
        message: `Check-in successful at ${moment(checkInTime).format('HH:mm')}`,
        isLate: lateInfo.isLate,
        lateMinutes: lateInfo.lateMinutes
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Process check-out
   */
  async processCheckOut(employeeId, locationData, deviceInfo, ipAddress, earlyLeaveReason = null) {
    try {
      const today = moment().startOf('day').toDate();
      
      // Find today's attendance record
      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: today
      });

      if (!attendance || !attendance.checkIn?.time) {
        throw new Error('Please check-in first before checking out');
      }

      if (attendance.checkOut?.time) {
        throw new Error('Already checked out today');
      }

      // Validate location (optional for check-out, but log it)
      const locationValidation = await this.validateOfficeLocation(locationData, ipAddress);

      const checkOutTime = new Date();
      const earlyInfo = this.isEarlyCheckOut(checkOutTime);

      // Update attendance record
      attendance.checkOut = {
        time: checkOutTime,
        location: locationData,
        method: 'web',
        deviceInfo,
        ipAddress,
        earlyLeaveReason,
        isValidLocation: locationValidation.overall
      };

      attendance.earlyDeparture = earlyInfo.isEarly;
      attendance.earlyDepartureMinutes = earlyInfo.earlyMinutes;

      await attendance.save();

      return {
        success: true,
        attendance,
        message: `Check-out successful at ${moment(checkOutTime).format('HH:mm')}`,
        totalHours: attendance.totalHours,
        isEarlyDeparture: earlyInfo.isEarly,
        earlyMinutes: earlyInfo.earlyMinutes
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Record idle session
   */
  async recordIdleSession(employeeId, startTime, endTime, reason = 'idle', wasWarned = false, autoLogout = false) {
    try {
      const today = moment().startOf('day').toDate();
      
      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: today
      });

      if (!attendance) {
        throw new Error('No attendance record found for today');
      }

      const duration = moment(endTime).diff(moment(startTime), 'minutes');

      // Add idle session
      attendance.idleTime.idleSessions.push({
        startTime,
        endTime,
        duration,
        reason,
        wasWarned,
        autoLogout
      });

      // Update total idle time
      attendance.idleTime.totalIdleMinutes += duration;

      // If idle time is significant, add as break
      if (duration >= 60) { // 1 hour or more
        attendance.breaks.push({
          breakOut: startTime,
          breakIn: endTime,
          reason: 'Idle time',
          duration,
          type: 'idle',
          isAutoGenerated: true
        });
      }

      await attendance.save();

      return {
        success: true,
        idleDuration: duration,
        totalIdleToday: attendance.idleTime.totalIdleMinutes
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get attendance summary for employee
   */
  async getAttendanceSummary(employeeId, startDate, endDate) {
    try {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();

      const attendanceRecords = await Attendance.find({
        employee: employeeId,
        date: { $gte: start, $lte: end }
      }).sort({ date: -1 });

      // Calculate statistics
      const stats = {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        halfDays: 0,
        weekendDays: 0,
        holidayDays: 0,
        leaveDays: 0,
        totalHours: 0,
        averageHours: 0,
        totalIdleTime: 0,
        overtimeHours: 0
      };

      // Count working days in the period
      for (let d = moment(start); d.isSameOrBefore(end); d.add(1, 'day')) {
        if (!this.isWeekendOrHoliday(d.toDate())) {
          stats.totalDays++;
        }
      }

      attendanceRecords.forEach(record => {
        switch (record.status) {
          case 'present':
            stats.presentDays++;
            break;
          case 'late':
            stats.presentDays++;
            stats.lateDays++;
            break;
          case 'absent':
            stats.absentDays++;
            break;
          case 'half-day':
            stats.halfDays++;
            break;
          case 'weekend':
            stats.weekendDays++;
            break;
          case 'holiday':
            stats.holidayDays++;
            break;
          case 'on-leave':
            stats.leaveDays++;
            break;
        }

        if (record.totalHours) {
          stats.totalHours += record.totalHours;
        }
        if (record.overtimeHours) {
          stats.overtimeHours += record.overtimeHours;
        }
        if (record.idleTime?.totalIdleMinutes) {
          stats.totalIdleTime += record.idleTime.totalIdleMinutes;
        }
      });

      stats.averageHours = stats.presentDays > 0 ? stats.totalHours / stats.presentDays : 0;
      stats.attendancePercentage = stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0;

      return {
        records: attendanceRecords,
        stats
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get today's attendance status
   */
  async getTodayAttendanceStatus(employeeId) {
    try {
      const today = moment().startOf('day').toDate();
      
      // Check if on leave
      const leaveRequest = await this.isEmployeeOnLeave(employeeId, today);
      if (leaveRequest) {
        return {
          status: 'on-leave',
          leaveType: leaveRequest.leaveType,
          message: 'You are on approved leave today'
        };
      }

      // Check if weekend
      if (this.isWeekendOrHoliday(today)) {
        return {
          status: 'weekend',
          message: 'Today is weekend'
        };
      }

      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: today
      });

      if (!attendance) {
        return {
          status: 'not-checked-in',
          message: 'Not checked in yet'
        };
      }

      return {
        status: attendance.status,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes,
        breaks: attendance.breaks,
        idleTime: attendance.idleTime
      };

    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AttendanceService();
