const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const { authenticateWebhook } = require('../middleware/webhookAuth');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

/**
 * @route   POST /api/webhook/attendance
 * @desc    Receive attendance data via webhook
 * @access  Protected (requires valid x-auth-key header)
 */
router.post('/attendance', authenticateWebhook, async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('📥 Webhook received - Attendance Data:');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request Headers:', {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    });

    // Process the attendance data
    const data = req.body;
    const processedRecords = [];
    const errors = [];

    // Handle both single record and array of records
    const records = Array.isArray(data) ? data : [data];

    for (const record of records) {
      try {
        // Parse the record data (flexible format support)
        const employeeId = record.employeeId || record.employee_id || record.userId || record.user_id || record.empId || record.emp_code;
        const timestamp = record.timestamp || record.punchTime || record.punch_time || record.time || record.dateTime || record.log_date_time || record.log_date;
        const type = (record.type || record.punchType || record.punch_type || record.action || '').toLowerCase();
        
        if (!employeeId) {
          errors.push({ record, error: 'Missing employee ID' });
          console.error('❌ Missing employee ID in record:', record);
          continue;
        }

        // Find employee by attendanceNumber (from biometric device) or employeeId
        // Handle both zero-padded (00000083) and non-padded (83) formats
        let employee = await Employee.findOne({ attendanceNumber: employeeId });
        
        // If not found, try removing leading zeros (e.g., "00000083" -> "83")
        if (!employee && employeeId.match(/^0+/)) {
          const unpaddedId = employeeId.replace(/^0+/, '');
          employee = await Employee.findOne({ attendanceNumber: unpaddedId });
        }
        
        // If not found, try adding leading zeros if it's a number (e.g., "83" -> "00000083")
        if (!employee && /^\d+$/.test(employeeId)) {
          const paddedId = employeeId.padStart(8, '0');
          employee = await Employee.findOne({ attendanceNumber: paddedId });
        }
        
        // If still not found by attendanceNumber, try by employeeId
        if (!employee) {
          employee = await Employee.findOne({ employeeId: employeeId });
        }
        
        if (!employee) {
          errors.push({ record, error: `Employee with attendance number/ID ${employeeId} not found` });
          console.error(`❌ Employee not found with attendance number/ID: ${employeeId}`);
          continue;
        }

        console.log(`✅ Found employee: ${employee.employeeId} - ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);

        // Parse timestamp - fingerprint device sends format: "10/10/2025 15:04:34" (MM/DD/YYYY HH:mm:ss)
        const officeTimezone = 'Asia/Kolkata';
        let punchTime;
        if (timestamp) {
          // Try multiple date formats
          const formats = [
            'MM/DD/YYYY HH:mm:ss',
            'DD/MM/YYYY HH:mm:ss',
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DDTHH:mm:ss'
          ];
          punchTime = moment.tz(timestamp, formats, officeTimezone);
          
          // If parsing failed, fallback to current time
          if (!punchTime.isValid()) {
            console.warn(`⚠️  Invalid timestamp format: ${timestamp}, using current time`);
            punchTime = moment().tz(officeTimezone);
          }
        } else {
          punchTime = moment().tz(officeTimezone);
        }

        const today = punchTime.clone().startOf('day').toDate();
        console.log(`📅 Punch time: ${punchTime.format('YYYY-MM-DD HH:mm:ss')}`);

        // Check if it's a weekend
        const dayOfWeek = punchTime.day();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Find or create today's attendance record
        let attendance = await Attendance.findOne({
          employee: employee._id,
          date: today
        });

        // Extract device information from the record
        const deviceName = record.device_name || record.deviceName || 'Biometric Device';
        const deviceSerialNumber = record.sr_no || record.serialNumber || '';

        // Check if this exact punch time already exists (prevent duplicates)
        if (attendance && attendance.punchRecords) {
          const existingPunch = attendance.punchRecords.find(punch => {
            const punchDiff = Math.abs(new Date(punch.time) - punchTime.toDate());
            return punchDiff < 2000; // Within 2 seconds = duplicate
          });

          if (existingPunch) {
            console.log(`⚠️  Duplicate punch detected for ${employeeId} at ${punchTime.format('HH:mm:ss')}`);
            continue;
          }
        }

        // Determine punch type (in/out) based on last punch
        let punchType = 'in'; // Default to 'in'
        if (attendance && attendance.punchRecords && attendance.punchRecords.length > 0) {
          // Sort existing punches to find the last one
          const sortedPunches = [...attendance.punchRecords].sort((a, b) => new Date(b.time) - new Date(a.time));
          const lastPunch = sortedPunches[0];
          // Alternate between in and out
          punchType = lastPunch.type === 'in' ? 'out' : 'in';
        }

        // Determine if this is check-in or check-out (for old logic compatibility)
        const isCheckOut = type.includes('out') || type === 'check-out' || type === 'checkout' || punchType === 'out';

        // NEW LOGIC: Simply add punch record, let pre-save middleware handle check-in/check-out
        
        // Create punch record
        const punchRecord = {
          time: punchTime.toDate(),
          type: punchType,
          method: 'biometric',
          deviceName: deviceName,
          deviceSerialNumber: deviceSerialNumber,
          notes: `Punch ${punchType} via fingerprint device`
        };

        // Calculate if late (office starts at 10:00 AM) - only for first punch (check-in)
        const workStart = moment.tz(punchTime.format('YYYY-MM-DD') + ' 10:00', officeTimezone);
        const isLate = !isWeekend && punchType === 'in' && punchTime.isAfter(workStart);
        const lateMinutes = isLate ? Math.ceil(punchTime.diff(workStart, 'minutes')) : 0;

        if (attendance) {
          // Add punch to existing attendance record
          if (!attendance.punchRecords) {
            attendance.punchRecords = [];
          }
          attendance.punchRecords.push(punchRecord);
          
          // Update status based on first punch
          if (attendance.punchRecords.length === 1) {
            attendance.status = isWeekend ? 'weekend' : (isLate ? 'late' : 'present');
            attendance.isLate = isWeekend ? false : isLate;
            attendance.lateMinutes = isWeekend ? 0 : lateMinutes;
            attendance.isWeekendWork = isWeekend;
          }
          
          // Mark punchRecords as modified to ensure pre-save hook runs
          attendance.markModified('punchRecords');
          await attendance.save();
        } else {
          // Create new attendance record
          attendance = new Attendance({
            employee: employee._id,
            date: today,
            punchRecords: [punchRecord],
            status: isWeekend ? 'weekend' : (isLate ? 'late' : 'present'),
            isLate: isWeekend ? false : isLate,
            lateMinutes: isWeekend ? 0 : lateMinutes,
            isWeekendWork: isWeekend
          });
          await attendance.save();
        }

        // Calculate total hours if there are multiple punches
        let totalHours = 0;
        if (attendance.punchRecords && attendance.punchRecords.length > 1) {
          const sortedPunches = [...attendance.punchRecords].sort((a, b) => new Date(a.time) - new Date(b.time));
          const firstPunch = sortedPunches[0];
          const lastPunch = sortedPunches[sortedPunches.length - 1];
          const diffMs = new Date(lastPunch.time) - new Date(firstPunch.time);
          totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        }

        console.log(`✅ Punch ${punchType.toUpperCase()} saved for ${employeeId} at ${punchTime.format('HH:mm')} | Total punches: ${attendance.punchRecords.length} | Hours in premise: ${totalHours || 0}h`);
        processedRecords.push({
          employeeId: employee.employeeId,
          type: `punch-${punchType}`,
          time: punchTime.format('HH:mm'),
          punchNumber: attendance.punchRecords.length,
          totalHours: totalHours,
          isLate: punchType === 'in' ? isLate : undefined,
          lateMinutes: punchType === 'in' ? lateMinutes : undefined
        });

      } catch (recordError) {
        errors.push({ record, error: recordError.message });
        console.error('❌ Error processing record:', recordError);
      }
    }

    // Return response
    const response = {
      success: true,
      message: `Processed ${processedRecords.length} record(s) successfully`,
      data: {
        processed: processedRecords.length,
        failed: errors.length,
        records: processedRecords,
        timestamp: new Date().toISOString()
      }
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.message += `, ${errors.length} failed`;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/webhook/health
 * @desc    Health check endpoint for webhook service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook service is operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

