const express = require('express');
const { body, query, validationResult } = require('express-validator');
const ExitManagement = require('../models/ExitManagement');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Asset = require('../models/Asset');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/temp/' });

// IMPORTANT: Define specific routes BEFORE parameterized routes (/:id)
// to prevent Express from matching them incorrectly

// @route   GET /api/exit-management/dashboard/stats
// @desc    Get exit management dashboard statistics
// @access  Private (HR, Admin, Manager)
router.get('/dashboard/stats', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.READ)
], async (req, res) => {
  try {
    const [
      totalExits,
      pendingExits,
      completedExits,
      exitsThisMonth,
      exitsByType,
      exitsByDepartment
    ] = await Promise.all([
      ExitManagement.countDocuments(),
      ExitManagement.countDocuments({ status: { $in: ['initiated', 'in_progress', 'pending_clearance', 'pending_approval'] } }),
      ExitManagement.countDocuments({ status: 'completed' }),
      ExitManagement.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      ExitManagement.aggregate([
        { $group: { _id: '$exitType', count: { $sum: 1 } } }
      ]),
      ExitManagement.aggregate([
        { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $group: { _id: '$dept.name', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalExits,
      pendingExits,
      completedExits,
      exitsThisMonth,
      exitsByType,
      exitsByDepartment
    });
  } catch (error) {
    console.error('Error fetching exit management stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exit-management/recent-exits
// @desc    Get employees who left in the last two months with their exit status
// @access  Private (HR, Admin, Manager)
router.get('/recent-exits', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.READ)
], async (req, res) => {
  try {
    // Calculate date from 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Find all exits where last working date is in the last 2 months
    const recentExits = await ExitManagement.find({
      lastWorkingDate: {
        $gte: twoMonthsAgo,
        $lte: new Date()
      }
    })
      .populate('employee', 'personalInfo employmentInfo')
      .populate('department', 'name')
      .populate('reportingManager', 'personalInfo')
      .sort({ lastWorkingDate: -1 })
      .lean();

    // Format the response
    const formattedExits = recentExits.map(exit => ({
      _id: exit._id,
      employeeId: exit.employeeId,
      employeeName: exit.employeeName,
      designation: exit.designation,
      department: exit.department?.name || 'N/A',
      location: exit.location || 'N/A',
      exitType: exit.exitType,
      lastWorkingDate: exit.lastWorkingDate,
      status: exit.status,
      reasonForLeaving: exit.reasonForLeaving,
      // Clearance status summary
      clearanceStatus: {
        itClearance: exit.clearance?.itClearance?.status || 'pending',
        hrClearance: exit.clearance?.hrClearance?.status || 'pending',
        financeClearance: exit.clearance?.financeClearance?.status || 'pending',
        managerClearance: exit.clearance?.managerClearance?.status || 'pending',
        adminClearance: exit.clearance?.adminClearance?.status || 'pending',
      },
      // Overall completion percentage
      completionPercentage: calculateCompletionPercentage(exit),
      // Days since exit
      daysSinceExit: Math.floor((new Date() - new Date(exit.lastWorkingDate)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      count: formattedExits.length,
      exits: formattedExits
    });
  } catch (error) {
    console.error('Error fetching recent exits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to calculate completion percentage
function calculateCompletionPercentage(exit) {
  const checklist = exit.finalChecklist || {};
  const checklistItems = [
    'allClearancesCompleted',
    'assetsReturned',
    'documentsCollected',
    'knowledgeTransferCompleted',
    'exitInterviewCompleted',
    'legalComplianceCompleted',
    'systemAccessRevoked',
    'finalSettlementProcessed'
  ];
  
  const completedItems = checklistItems.filter(item => checklist[item] === true).length;
  const totalItems = checklistItems.length;
  
  return Math.round((completedItems / totalItems) * 100);
}

// @route   GET /api/exit-management/export
// @desc    Export exit management records
// @access  Private (HR, Admin)
router.get('/export', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.EXPORT)
], async (req, res) => {
  try {
    const { format = 'csv', status, exitType, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (exitType) filter.exitType = exitType;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const exitRecords = await ExitManagement.find(filter)
      .populate('employee', 'personalInfo employmentInfo')
      .populate('department', 'name')
      .populate('reportingManager', 'personalInfo')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV data
      const csvData = exitRecords.map(record => ({
        'Employee ID': record.employeeId,
        'Employee Name': record.employeeName,
        'Department': record.department?.name || '',
        'Designation': record.designation,
        'Exit Type': record.exitType,
        'Last Working Date': record.lastWorkingDate.toISOString().split('T')[0],
        'Reason': record.reasonForLeaving,
        'Status': record.status,
        'Created Date': record.createdAt.toISOString().split('T')[0]
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=exit_management_records.csv');
      
      // Simple CSV generation
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      res.json(exitRecords);
    }
  } catch (error) {
    console.error('Error exporting exit management records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exit-management/import
// @desc    Import exit management records from CSV
// @access  Private (HR, Admin)
router.post('/import', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.CREATE),
  upload.single('file')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let imported = 0;
    let failed = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        // Process each row
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          
          try {
            // Map CSV columns to database fields - EXACT mapping for your CSV
            const exitData = {
              employeeId: row['Employee ID'] || row['employeeId'] || row['employee_id'],
              employeeName: row['Employee Name'] || row['employeeName'] || row['employee_name'],
              department: row['Department'] || row['department'],
              designation: row['Job Title'] || row['Designation'] || row['designation'],
              location: row['Location'] || row['location'],
              workEmail: row['Work email'] || row['Work Email'] || row['workEmail'],
              personalEmail: row['Personal email'] || row['Personal Email'] || row['personalEmail'],
              exitType: (row['Exit type'] || row['Exit Type'] || row['exitType'] || row['exit_type'] || '').toLowerCase(),
              lastWorkingDate: new Date(row['Last working day'] || row['Last Working Date'] || row['lastWorkingDate'] || row['last_working_date']),
              resignationDate: (row['Notice Date'] || row['Resignation Date'] || row['resignationDate']) ? new Date(row['Notice Date'] || row['Resignation Date'] || row['resignationDate']) : undefined,
              reasonForLeaving: row['Exit reason'] || row['Reason'] || row['Reason for Leaving'] || row['reasonForLeaving'] || row['reason'],
              detailedReason: row['Detailed Reason'] || row['detailedReason'] || row['Details'] || '',
              requestedBy: row['Requested by'] || row['Requested By'] || row['requestedBy'],
              reportingManagerName: row['Reporting Manager'] || row['Reporting manager'] || row['reportingManager'],
              noticePeriod: parseInt(row['Notice Period'] || row['noticePeriod'] || row['notice_period'] || 0),
              status: (row['Exit status'] || row['Status'] || row['status'] || 'completed').toLowerCase(),
              createdBy: req.user._id,
              // Additional fields
              mobilePhone: row['Mobile phone'] || row['Mobile Phone'] || row['mobilePhone'],
              currentAddress: row['Current address'] || row['Current Address'] || row['currentAddress'],
              dateOfJoining: (row['Date of joining'] || row['Date of Joining']) ? new Date(row['Date of joining'] || row['Date of Joining']) : undefined,
              okToRehire: (row['Ok to rehire'] || row['Ok to Rehire'] || '').toLowerCase() === 'yes',
              assetRecoveryStatus: row['Asset recovery'] || row['Asset Recovery'] || row['assetRecovery'],
              financeSettlementStatus: row['Finance settlement'] || row['Finance Settlement'] || row['financeSettlement'],
              exitSurveyStatus: row['Exit survey'] || row['Exit Survey'] || row['exitSurvey'],
              teamTransitionStatus: row['Team transition'] || row['Team Transition'] || row['teamTransition']
            };

            // Validate required fields
            if (!exitData.employeeId) {
              errors.push({ row: i + 1, error: 'Employee ID is required', data: row });
              failed++;
              continue;
            }

            if (!exitData.employeeName) {
              errors.push({ row: i + 1, error: 'Employee Name is required', data: row });
              failed++;
              continue;
            }

            if (!exitData.lastWorkingDate || isNaN(exitData.lastWorkingDate.getTime())) {
              errors.push({ row: i + 1, error: 'Valid Last Working Date is required', data: row });
              failed++;
              continue;
            }

            // Validate exit type
            const validExitTypes = ['resignation', 'termination', 'retirement', 'end_of_contract', 'other'];
            if (!validExitTypes.includes(exitData.exitType)) {
              exitData.exitType = 'other';
            }

            // Try to find the employee in the database
            const employee = await Employee.findOne({ employeeId: exitData.employeeId });
            
            if (employee) {
              exitData.employee = employee._id;
              if (!exitData.employeeName) exitData.employeeName = `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`;
              if (!exitData.department) exitData.department = employee.employmentInfo?.department;
              if (!exitData.designation) exitData.designation = employee.employmentInfo?.designation;
            }

            // Initialize clearance structure
            exitData.clearance = {
              itClearance: {
                status: 'pending',
                items: [
                  { item: 'Laptop/Computer Return', status: 'pending' },
                  { item: 'Email Account Deactivation', status: 'pending' },
                  { item: 'System Access Revocation', status: 'pending' },
                  { item: 'Software License Transfer', status: 'pending' }
                ]
              },
              hrClearance: {
                status: 'pending',
                items: [
                  { item: 'Exit Interview Scheduling', status: 'pending' },
                  { item: 'Final Documentation', status: 'pending' },
                  { item: 'Employee Record Updates', status: 'pending' },
                  { item: 'Experience Letter Issuance', status: 'pending' }
                ]
              },
              financeClearance: {
                status: 'pending',
                items: [
                  { item: 'Final Settlement Calculation', status: 'pending' },
                  { item: 'Expense Claim Settlement', status: 'pending' },
                  { item: 'Loan/Advance Recovery', status: 'pending' },
                  { item: 'Salary Processing', status: 'pending' }
                ]
              },
              managerClearance: {
                status: 'pending',
                items: [
                  { item: 'Work Handover', status: 'pending' },
                  { item: 'Knowledge Transfer', status: 'pending' },
                  { item: 'Project Closure', status: 'pending' },
                  { item: 'Team Briefing', status: 'pending' }
                ]
              },
              adminClearance: {
                status: 'pending',
                items: [
                  { item: 'Office Access Card Return', status: 'pending' },
                  { item: 'Parking Pass Return', status: 'pending' },
                  { item: 'Office Keys Return', status: 'pending' },
                  { item: 'Desk/Locker Clearance', status: 'pending' }
                ]
              }
            };

            // Check if record already exists
            const existingRecord = await ExitManagement.findOne({ employeeId: exitData.employeeId });
            
            if (existingRecord) {
              // Update existing record
              await ExitManagement.findByIdAndUpdate(existingRecord._id, exitData);
              imported++;
            } else {
              // Create new record
              await ExitManagement.create(exitData);
              imported++;
            }

          } catch (error) {
            console.error(`Error processing row ${i + 1}:`, error);
            errors.push({ row: i + 1, error: error.message, data: row });
            failed++;
          }
        }

        res.json({
          message: `Import completed: ${imported} records imported, ${failed} failed`,
          imported,
          failed,
          total: results.length,
          errors: errors.length > 0 ? errors : undefined
        });
      })
      .on('error', (error) => {
        // Delete the uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.error('Error reading CSV file:', error);
        res.status(500).json({ message: 'Error reading CSV file', error: error.message });
      });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error importing exit management records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/exit-management/update-missing-fields
// @desc    Update existing exit records with missing employee information
// @access  Private (HR, Admin)
router.post('/update-missing-fields', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE)
], async (req, res) => {
  try {
    console.log('🔄 Starting to update exit records with missing employee information...');
    
    // Find all exit records that have linked employees
    const exitRecords = await ExitManagement.find({ employee: { $ne: null } });
    
    let updated = 0;
    let failed = 0;
    const errors = [];
    
    for (const exitRecord of exitRecords) {
      try {
        // Check if any fields are missing
        const needsUpdate = !exitRecord.location || !exitRecord.workEmail || 
                           !exitRecord.personalEmail || 
                           (!exitRecord.reportingManager && !exitRecord.reportingManagerName);
        
        if (!needsUpdate) {
          continue; // Skip if all fields are populated
        }
        
        // Fetch the employee with populated fields
        const employee = await Employee.findById(exitRecord.employee)
          .populate('user', 'email')
          .populate('employmentInfo.department', 'name')
          .populate('employmentInfo.reportingManager', 'personalInfo');
        
        if (!employee) {
          console.log(`⚠️  Employee not found for exit record ${exitRecord.employeeId}`);
          continue;
        }
        
        // Update missing fields
        let hasChanges = false;
        
        if (!exitRecord.location && (employee.contactInfo?.address?.city || employee.employmentInfo?.workLocation)) {
          exitRecord.location = employee.contactInfo?.address?.city || employee.employmentInfo?.workLocation || '';
          hasChanges = true;
        }
        
        if (!exitRecord.workEmail && employee.user?.email) {
          exitRecord.workEmail = employee.user.email;
          hasChanges = true;
        }
        
        if (!exitRecord.personalEmail && employee.contactInfo?.personalEmail) {
          exitRecord.personalEmail = employee.contactInfo.personalEmail;
          hasChanges = true;
        }
        
        if (!exitRecord.reportingManager && employee.employmentInfo?.reportingManager) {
          exitRecord.reportingManager = employee.employmentInfo.reportingManager._id;
          hasChanges = true;
        }
        
        if (!exitRecord.reportingManagerName && employee.employmentInfo?.reportingManager) {
          exitRecord.reportingManagerName = `${employee.employmentInfo.reportingManager.personalInfo?.firstName || ''} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || ''}`.trim();
          hasChanges = true;
        }
        
        if (hasChanges) {
          await exitRecord.save();
          updated++;
          console.log(`✅ Updated exit record for ${exitRecord.employeeId}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating exit record ${exitRecord.employeeId}:`, error);
        failed++;
        errors.push({ employeeId: exitRecord.employeeId, error: error.message });
      }
    }
    
    console.log(`✅ Update completed: ${updated} records updated, ${failed} failed`);
    
    res.json({
      message: `Successfully updated ${updated} exit records`,
      updated,
      failed,
      total: exitRecords.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error updating exit records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/exit-management/import-json
// @desc    Import exit management records from JSON (parsed CSV data)
// @access  Private (HR, Admin)
router.post('/import-json', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.CREATE)
], async (req, res) => {
  try {
    const { exitRecords } = req.body;

    if (!exitRecords || !Array.isArray(exitRecords)) {
      return res.status(400).json({ message: 'Invalid data format. Expected array of exit records.' });
    }

    console.log('📥 Receiving', exitRecords.length, 'exit records for import');
    console.log('📋 Sample record (first one):', JSON.stringify(exitRecords[0], null, 2));

    const results = {
      imported: 0,
      failed: 0,
      total: exitRecords.length,
      errors: []
    };

    // Helper function to parse various date formats
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Try parsing as-is first
      let date = new Date(dateStr);
      
      // If invalid, try parsing "15 Sep, 2025" format
      if (isNaN(date.getTime())) {
        // Remove comma and parse
        const cleaned = dateStr.replace(',', '');
        date = new Date(cleaned);
      }
      
      return isNaN(date.getTime()) ? null : date;
    };

    // Process each record
    for (let i = 0; i < exitRecords.length; i++) {
      const row = exitRecords[i];
      
      try {
        // Get date strings - EXACT mapping for your CSV
        const lastWorkingDateStr = row['Last working day'] ||  // Your CSV exact column
                                   row['Last Working Date'] || 
                                   row['Last working day'] || 
                                   row['lastWorkingDate'] || 
                                   row['last_working_date'] ||
                                   row['Last Working Day'];
        
        const resignationDateStr = row['Notice Date'] ||  // Your CSV exact column
                                   row['Resignation Date'] || 
                                   row['resignationDate'];
        
        // Get and clean work email (sometimes has phone number mixed in)
        let workEmailRaw = row['Work email'] || row['Work Email'] || row['workEmail'] || '';
        let mobilePhoneRaw = row['Mobile phone'] || row['Mobile Phone'] || row['mobilePhone'] || '';
        
        // If work email contains a comma, it might have phone mixed in (e.g., "email@domain.com, 1234567890")
        if (workEmailRaw.includes(',')) {
          const parts = workEmailRaw.split(',').map(p => p.trim());
          // First part should be email, second might be phone
          workEmailRaw = parts[0];
          if (!mobilePhoneRaw && parts[1] && /^\d+$/.test(parts[1])) {
            mobilePhoneRaw = parts[1];
          }
        }
        
        // Map CSV columns to database fields - EXACT mapping for your CSV
        const exitData = {
          employeeId: row['Employee ID'] || row['employeeId'] || row['employee_id'],
          employeeName: row['Employee Name'] || row['employeeName'] || row['employee_name'],
          department: row['Department'] || row['department'],
          designation: row['Job Title'] || row['Designation'] || row['designation'],  // Job Title first
          location: row['Location'] || row['location'],
          workEmail: workEmailRaw,  // Cleaned email
          personalEmail: row['Personal email'] || row['Personal Email'] || row['personalEmail'],  // Personal email (lowercase 'e')
          exitType: (row['Exit type'] || row['Exit Type'] || row['exitType'] || row['exit_type'] || '').toLowerCase(),  // Exit type (lowercase 't')
          lastWorkingDate: parseDate(lastWorkingDateStr),
          resignationDate: resignationDateStr ? parseDate(resignationDateStr) : undefined,
          reasonForLeaving: row['Exit reason'] || row['Reason'] || row['Reason for Leaving'] || row['reasonForLeaving'] || row['reason'] || '',  // Exit reason first
          detailedReason: row['Detailed Reason'] || row['detailedReason'] || row['Details'] || '',
          requestedBy: row['Requested by'] || row['Requested By'] || row['requestedBy'],  // Requested by (lowercase 'b')
          reportingManagerName: row['Reporting Manager'] || row['Reporting manager'] || row['reportingManager'],
          noticePeriod: parseInt(row['Notice Period'] || row['noticePeriod'] || row['notice_period'] || 0),
          status: (row['Exit status'] || row['Status'] || row['status'] || 'completed').toLowerCase(),  // Exit status first
          initiatedBy: req.user._id
        };
        
        // Add additional fields from CSV
        // Mobile phone (use cleaned version that might have been extracted from email)
        if (mobilePhoneRaw) {
          exitData.mobilePhone = mobilePhoneRaw;
        }
        
        // Current address
        if (row['Current address'] || row['Current Address'] || row['currentAddress']) {
          exitData.currentAddress = row['Current address'] || row['Current Address'] || row['currentAddress'];
        }
        
        // Date of joining
        if (row['Date of joining'] || row['Date of Joining'] || row['dateOfJoining']) {
          const joiningDateStr = row['Date of joining'] || row['Date of Joining'] || row['dateOfJoining'];
          const joiningDate = parseDate(joiningDateStr);
          if (joiningDate) {
            exitData.dateOfJoining = joiningDate;
          }
        }
        
        // Ok to rehire
        if (row['Ok to rehire'] || row['Ok to Rehire'] || row['okToRehire']) {
          const rehireValue = (row['Ok to rehire'] || row['Ok to Rehire'] || row['okToRehire'] || '').toLowerCase();
          exitData.okToRehire = rehireValue === 'yes' || rehireValue === 'true' || rehireValue === '1';
        }
        
        // Asset recovery status
        if (row['Asset recovery'] || row['Asset Recovery'] || row['assetRecovery']) {
          exitData.assetRecoveryStatus = row['Asset recovery'] || row['Asset Recovery'] || row['assetRecovery'];
        }
        
        // Finance settlement status
        if (row['Finance settlement'] || row['Finance Settlement'] || row['financeSettlement']) {
          exitData.financeSettlementStatus = row['Finance settlement'] || row['Finance Settlement'] || row['financeSettlement'];
        }
        
        // Exit survey status
        if (row['Exit survey'] || row['Exit Survey'] || row['exitSurvey']) {
          exitData.exitSurveyStatus = row['Exit survey'] || row['Exit Survey'] || row['exitSurvey'];
        }
        
        // Team transition status
        if (row['Team transition'] || row['Team Transition'] || row['teamTransition']) {
          exitData.teamTransitionStatus = row['Team transition'] || row['Team Transition'] || row['teamTransition'];
        }
        
        // Debug log for first record
        if (i === 0) {
          console.log('🔍 Parsing first record:');
          console.log('  Raw CSV row:', row);
          console.log('  lastWorkingDateStr:', lastWorkingDateStr);
          console.log('  resignationDateStr:', resignationDateStr);
          console.log('  lastWorkingDate parsed:', exitData.lastWorkingDate);
          console.log('  resignationDate parsed:', exitData.resignationDate);
          console.log('  exitType:', exitData.exitType);
        }

        // Validate required fields
        if (!exitData.employeeId) {
          const error = { row: i + 1, error: 'Employee ID is required', data: row };
          console.log(`❌ Row ${i + 1}: Missing Employee ID. Available keys:`, Object.keys(row));
          results.errors.push(error);
          results.failed++;
          continue;
        }

        if (!exitData.employeeName) {
          const error = { row: i + 1, error: 'Employee Name is required', data: row };
          console.log(`❌ Row ${i + 1}: Missing Employee Name. employeeId:`, exitData.employeeId);
          results.errors.push(error);
          results.failed++;
          continue;
        }

        if (!exitData.lastWorkingDate) {
          const error = { row: i + 1, error: 'Valid Last Working Date is required', data: row };
          console.log(`❌ Row ${i + 1}: Invalid Last Working Date. Original value:`, lastWorkingDateStr);
          results.errors.push(error);
          results.failed++;
          continue;
        }

        // Validate exit type
        const validExitTypes = ['resignation', 'termination', 'retirement', 'end_of_contract', 'contract_end', 'other'];
        if (!validExitTypes.includes(exitData.exitType)) {
          exitData.exitType = 'other';
        }

        // Try to find the employee in the database
        const employee = await Employee.findOne({ employeeId: exitData.employeeId })
          .populate('user', 'email')
          .populate('employmentInfo.department', 'name')
          .populate('employmentInfo.reportingManager', 'personalInfo');
        
        if (employee) {
          // Employee found - link to the employee record and populate missing fields
          exitData.employee = employee._id;
          if (!exitData.employeeName) exitData.employeeName = `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`;
          if (!exitData.department) exitData.department = employee.employmentInfo?.department;
          if (!exitData.designation) exitData.designation = employee.employmentInfo?.designation;
          
          // Populate location, emails, and reporting manager from employee record if not in CSV
          if (!exitData.location) {
            exitData.location = employee.contactInfo?.address?.city || employee.employmentInfo?.workLocation || '';
          }
          if (!exitData.workEmail) {
            exitData.workEmail = employee.user?.email || '';
          }
          if (!exitData.personalEmail) {
            exitData.personalEmail = employee.contactInfo?.personalEmail || '';
          }
          if (!exitData.reportingManager && employee.employmentInfo?.reportingManager) {
            exitData.reportingManager = employee.employmentInfo.reportingManager._id;
          }
          if (!exitData.reportingManagerName && employee.employmentInfo?.reportingManager) {
            exitData.reportingManagerName = `${employee.employmentInfo.reportingManager.personalInfo?.firstName || ''} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || ''}`.trim();
          }
          
          console.log(`✅ Row ${i + 1}: Employee ${exitData.employeeId} found, linking to employee record`);
        } else {
          // Employee not found - create standalone exit record (for historical data)
          exitData.employee = null;
          console.log(`⚠️  Row ${i + 1}: Employee ${exitData.employeeId} (${exitData.employeeName}) not found - creating standalone exit record`);
        }
        
        // Handle department - need to find Department ObjectId by name
        if (exitData.department && typeof exitData.department === 'string') {
          const Department = require('../models/Department');
          const dept = await Department.findOne({ name: new RegExp(`^${exitData.department}$`, 'i') });
          if (dept) {
            exitData.department = dept._id;
          } else {
            console.log(`⚠️  Department "${exitData.department}" not found, removing from record`);
            delete exitData.department; // Remove the field entirely instead of setting to null
          }
        }

        // Initialize clearance structure
        exitData.clearance = {
          itClearance: {
            status: 'pending',
            items: [
              { item: 'Laptop/Computer Return', status: 'pending' },
              { item: 'Email Account Deactivation', status: 'pending' },
              { item: 'System Access Revocation', status: 'pending' },
              { item: 'Software License Transfer', status: 'pending' }
            ]
          },
          hrClearance: {
            status: 'pending',
            items: [
              { item: 'Exit Interview Scheduling', status: 'pending' },
              { item: 'Final Documentation', status: 'pending' },
              { item: 'Employee Record Updates', status: 'pending' },
              { item: 'Experience Letter Issuance', status: 'pending' }
            ]
          },
          financeClearance: {
            status: 'pending',
            items: [
              { item: 'Final Settlement Calculation', status: 'pending' },
              { item: 'Expense Claim Settlement', status: 'pending' },
              { item: 'Loan/Advance Recovery', status: 'pending' },
              { item: 'Salary Processing', status: 'pending' }
            ]
          },
          managerClearance: {
            status: 'pending',
            items: [
              { item: 'Work Handover', status: 'pending' },
              { item: 'Knowledge Transfer', status: 'pending' },
              { item: 'Project Closure', status: 'pending' },
              { item: 'Team Briefing', status: 'pending' }
            ]
          },
          adminClearance: {
            status: 'pending',
            items: [
              { item: 'Office Access Card Return', status: 'pending' },
              { item: 'Parking Pass Return', status: 'pending' },
              { item: 'Office Keys Return', status: 'pending' },
              { item: 'Desk/Locker Clearance', status: 'pending' }
            ]
          }
        };

        // Check if record already exists
        const existingRecord = await ExitManagement.findOne({ employeeId: exitData.employeeId });
        
        if (existingRecord) {
          // Update existing record - preserve dates if not provided in CSV
          console.log(`🔄 Updating record for ${exitData.employeeId}:`);
          console.log(`   Old resignationDate: ${existingRecord.resignationDate}`);
          console.log(`   New resignationDate: ${exitData.resignationDate}`);
          console.log(`   Old lastWorkingDate: ${existingRecord.lastWorkingDate}`);
          console.log(`   New lastWorkingDate: ${exitData.lastWorkingDate}`);
          
          // Don't overwrite resignationDate if it wasn't in the CSV but exists in DB
          if (!resignationDateStr && existingRecord.resignationDate) {
            console.log(`   ⚠️  Preserving existing resignationDate as it wasn't in CSV`);
            exitData.resignationDate = existingRecord.resignationDate;
          }
          
          await ExitManagement.findByIdAndUpdate(existingRecord._id, exitData);
          results.imported++;
        } else {
          // Create new record
          console.log(`➕ Creating new record for ${exitData.employeeId}:`);
          console.log(`   resignationDate: ${exitData.resignationDate}`);
          console.log(`   lastWorkingDate: ${exitData.lastWorkingDate}`);
          
          await ExitManagement.create(exitData);
          results.imported++;
        }

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.errors.push({ row: i + 1, error: error.message, data: row });
        results.failed++;
      }
    }

    res.json({
      message: `Import completed: ${results.imported} records imported, ${results.failed} failed`,
      imported: results.imported,
      failed: results.failed,
      total: results.total,
      errors: results.errors.length > 0 ? results.errors : undefined
    });

  } catch (error) {
    console.error('Error importing exit management records from JSON:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/exit-management
// @desc    Get all exit management records
// @access  Private (HR, Admin, Manager)
router.get('/', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.READ)
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      exitType,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (exitType) {
      filter.exitType = exitType;
    }
    
    if (department) {
      filter.department = department;
    }
    
    if (search) {
      filter.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [exitRecords, total] = await Promise.all([
      ExitManagement.find(filter)
        .populate('employee', 'personalInfo employmentInfo')
        .populate('department', 'name')
        .populate('reportingManager', 'personalInfo')
        .populate('initiatedBy', 'email')
        .populate('approvedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      ExitManagement.countDocuments(filter)
    ]);

    res.json({
      exitRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching exit management records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exit-management/:id
// @desc    Get exit management record by ID
// @access  Private (HR, Admin, Manager)
router.get('/:id', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.READ)
], async (req, res) => {
  try {
    const exitRecord = await ExitManagement.findById(req.params.id)
      .populate('employee', 'personalInfo employmentInfo contactInfo salaryInfo')
      .populate('department', 'name')
      .populate('reportingManager', 'personalInfo')
      .populate('initiatedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('assets.assetId', 'name type serialNumber')
      .populate('clearance.itClearance.clearedBy', 'email')
      .populate('clearance.hrClearance.clearedBy', 'email')
      .populate('clearance.financeClearance.clearedBy', 'email')
      .populate('clearance.managerClearance.clearedBy', 'email')
      .populate('clearance.adminClearance.clearedBy', 'email');

    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    res.json(exitRecord);
  } catch (error) {
    console.error('Error fetching exit management record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exit-management
// @desc    Create new exit management record
// @access  Private (HR, Admin)
router.post('/', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.CREATE),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('exitType').isIn(['resignation', 'termination', 'retirement', 'contract_end', 'layoff', 'death', 'other']).withMessage('Invalid exit type'),
  body('lastWorkingDate').isISO8601().withMessage('Valid last working date is required'),
  body('reasonForLeaving').notEmpty().withMessage('Reason for leaving is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employeeId,
      exitType,
      resignationDate,
      lastWorkingDate,
      noticePeriod,
      reasonForLeaving,
      detailedReason
    } = req.body;

    // Find employee
    const employee = await Employee.findOne({ employeeId })
      .populate('user', 'email')
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'personalInfo');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if exit record already exists
    const existingExit = await ExitManagement.findOne({ employee: employee._id });
    if (existingExit) {
      return res.status(400).json({ message: 'Exit management record already exists for this employee' });
    }

    // Get employee's assets
    const employeeAssets = await Asset.find({ assignedTo: employee._id });

    // Create exit management record
    const exitRecord = new ExitManagement({
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
      department: employee.employmentInfo.department._id,
      designation: employee.employmentInfo.designation,
      location: employee.contactInfo?.address?.city || employee.employmentInfo?.workLocation || '',
      workEmail: employee.user?.email || '',
      personalEmail: employee.contactInfo?.personalEmail || '',
      reportingManager: employee.employmentInfo.reportingManager?._id,
      reportingManagerName: employee.employmentInfo.reportingManager 
        ? `${employee.employmentInfo.reportingManager.personalInfo?.firstName || ''} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || ''}`.trim()
        : '',
      exitType,
      resignationDate: resignationDate ? new Date(resignationDate) : null,
      lastWorkingDate: new Date(lastWorkingDate),
      noticePeriod: noticePeriod || 0,
      reasonForLeaving,
      detailedReason,
      initiatedBy: req.user._id,
      assets: employeeAssets.map(asset => ({
        assetId: asset._id,
        assetName: asset.name,
        assetType: asset.type,
        serialNumber: asset.serialNumber,
        assignedDate: asset.assignedDate,
        returnStatus: 'pending'
      })),
      // Initialize clearance items
      clearance: {
        itClearance: {
          items: [
            { item: 'Laptop/Computer Return', status: 'pending' },
            { item: 'Email Account Deactivation', status: 'pending' },
            { item: 'System Access Revocation', status: 'pending' },
            { item: 'Software License Transfer', status: 'pending' }
          ]
        },
        hrClearance: {
          items: [
            { item: 'ID Card Return', status: 'pending' },
            { item: 'Access Card Return', status: 'pending' },
            { item: 'Uniform/Company Property Return', status: 'pending' },
            { item: 'Exit Interview Completion', status: 'pending' }
          ]
        },
        financeClearance: {
          items: [
            { item: 'Final Salary Settlement', status: 'pending' },
            { item: 'Outstanding Advances Recovery', status: 'pending' },
            { item: 'Tax Clearance', status: 'pending' },
            { item: 'Benefits Settlement', status: 'pending' }
          ]
        },
        managerClearance: {
          items: [
            { item: 'Work Handover', status: 'pending' },
            { item: 'Project Documentation', status: 'pending' },
            { item: 'Client Communication Transfer', status: 'pending' },
            { item: 'Team Knowledge Transfer', status: 'pending' }
          ]
        },
        adminClearance: {
          items: [
            { item: 'Office Keys Return', status: 'pending' },
            { item: 'Parking Access Revocation', status: 'pending' },
            { item: 'Cafeteria Access Revocation', status: 'pending' },
            { item: 'Other Admin Items', status: 'pending' }
          ]
        }
      }
    });

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'CREATE',
      field: 'exit_management_record',
      newValue: 'Created',
      modifiedBy: req.user._id,
      notes: 'Exit management record created'
    });

    await exitRecord.save();

    res.status(201).json({
      message: 'Exit management record created successfully',
      exitRecord: await ExitManagement.findById(exitRecord._id)
        .populate('employee', 'personalInfo employmentInfo')
        .populate('department', 'name')
        .populate('reportingManager', 'personalInfo')
    });
  } catch (error) {
    console.error('Error creating exit management record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id
// @desc    Update exit management record
// @access  Private (HR, Admin, Manager)
router.put('/:id', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE)
], async (req, res) => {
  try {
    const exitRecord = await ExitManagement.findById(req.params.id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    const updateData = req.body;
    const oldValues = {};

    // Track changes for audit log
    Object.keys(updateData).forEach(key => {
      if (exitRecord[key] !== undefined) {
        oldValues[key] = exitRecord[key];
      }
    });

    // Update the record
    Object.assign(exitRecord, updateData);
    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'UPDATE',
      field: 'general_update',
      oldValue: oldValues,
      newValue: updateData,
      modifiedBy: req.user._id,
      notes: 'Exit management record updated'
    });

    await exitRecord.save();

    res.json({
      message: 'Exit management record updated successfully',
      exitRecord: await ExitManagement.findById(exitRecord._id)
        .populate('employee', 'personalInfo employmentInfo')
        .populate('department', 'name')
        .populate('reportingManager', 'personalInfo')
    });
  } catch (error) {
    console.error('Error updating exit management record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id/clearance/:clearanceType
// @desc    Update clearance status
// @access  Private (HR, Admin, Manager)
router.put('/:id/clearance/:clearanceType', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE),
  body('status').isIn(['pending', 'in_progress', 'completed', 'not_applicable']).withMessage('Invalid status'),
  body('items').isArray().withMessage('Items must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, clearanceType } = req.params;
    const { status, items, notes } = req.body;

    const exitRecord = await ExitManagement.findById(id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    if (!exitRecord.clearance[clearanceType]) {
      return res.status(400).json({ message: 'Invalid clearance type' });
    }

    const oldStatus = exitRecord.clearance[clearanceType].status;
    const oldItems = [...exitRecord.clearance[clearanceType].items];

    // Update clearance
    exitRecord.clearance[clearanceType].status = status;
    exitRecord.clearance[clearanceType].items = items;
    if (notes) {
      exitRecord.clearance[clearanceType].notes = notes;
    }
    if (status === 'completed') {
      exitRecord.clearance[clearanceType].clearedBy = req.user._id;
      exitRecord.clearance[clearanceType].clearedDate = new Date();
    }

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'UPDATE',
      field: `clearance.${clearanceType}`,
      oldValue: { status: oldStatus, items: oldItems },
      newValue: { status, items, notes },
      modifiedBy: req.user._id,
      notes: `${clearanceType} clearance updated`
    });

    await exitRecord.save();

    res.json({
      message: `${clearanceType} clearance updated successfully`,
      clearance: exitRecord.clearance[clearanceType]
    });
  } catch (error) {
    console.error('Error updating clearance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id/asset/:assetIndex
// @desc    Update asset return status
// @access  Private (HR, Admin, Manager)
router.put('/:id/asset/:assetIndex', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE),
  body('returnStatus').isIn(['pending', 'returned', 'not_returned', 'damaged', 'lost']).withMessage('Invalid return status'),
  body('condition').isIn(['good', 'fair', 'poor', 'damaged', 'lost']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, assetIndex } = req.params;
    const { returnStatus, condition, notes, returnDate } = req.body;

    const exitRecord = await ExitManagement.findById(id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    if (assetIndex >= exitRecord.assets.length) {
      return res.status(400).json({ message: 'Invalid asset index' });
    }

    const oldAsset = { ...exitRecord.assets[assetIndex].toObject() };

    // Update asset
    exitRecord.assets[assetIndex].returnStatus = returnStatus;
    exitRecord.assets[assetIndex].condition = condition;
    if (notes) {
      exitRecord.assets[assetIndex].notes = notes;
    }
    if (returnDate) {
      exitRecord.assets[assetIndex].returnDate = new Date(returnDate);
    }
    if (returnStatus === 'returned') {
      exitRecord.assets[assetIndex].clearedBy = req.user._id;
    }

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'UPDATE',
      field: `assets.${assetIndex}`,
      oldValue: oldAsset,
      newValue: exitRecord.assets[assetIndex],
      modifiedBy: req.user._id,
      notes: `Asset ${exitRecord.assets[assetIndex].assetName} return status updated`
    });

    await exitRecord.save();

    res.json({
      message: 'Asset return status updated successfully',
      asset: exitRecord.assets[assetIndex]
    });
  } catch (error) {
    console.error('Error updating asset return status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id/exit-interview
// @desc    Update exit interview
// @access  Private (HR, Admin)
router.put('/:id/exit-interview', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE),
  body('conducted').isBoolean().withMessage('Conducted must be boolean'),
  body('responses').isArray().withMessage('Responses must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const interviewData = req.body;

    const exitRecord = await ExitManagement.findById(id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    const oldInterview = { ...exitRecord.exitInterview.toObject() };

    // Update exit interview
    Object.assign(exitRecord.exitInterview, interviewData);
    if (interviewData.conducted) {
      exitRecord.exitInterview.conductedBy = req.user._id;
      exitRecord.exitInterview.conductedDate = new Date();
    }

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'UPDATE',
      field: 'exitInterview',
      oldValue: oldInterview,
      newValue: exitRecord.exitInterview,
      modifiedBy: req.user._id,
      notes: 'Exit interview updated'
    });

    await exitRecord.save();

    res.json({
      message: 'Exit interview updated successfully',
      exitInterview: exitRecord.exitInterview
    });
  } catch (error) {
    console.error('Error updating exit interview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id/exit-survey
// @desc    Submit exit survey
// @access  Private (HR, Admin, Employee)
router.put('/:id/exit-survey', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.UPDATE),
  body('compensationBenefits').isObject().withMessage('Compensation benefits data is required'),
  body('workEnvironment').isObject().withMessage('Work environment data is required'),
  body('organizationCulture').isObject().withMessage('Organization culture data is required'),
  body('triggerReason').isObject().withMessage('Trigger reason data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const surveyData = req.body;

    const exitRecord = await ExitManagement.findById(id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    const oldSurvey = { ...exitRecord.exitSurvey.toObject() };

    // Update exit survey
    exitRecord.exitSurvey.submitted = true;
    exitRecord.exitSurvey.submittedDate = new Date();
    exitRecord.exitSurvey.submittedBy = req.user._id;
    exitRecord.exitSurvey.compensationBenefits = surveyData.compensationBenefits;
    exitRecord.exitSurvey.workEnvironment = surveyData.workEnvironment;
    exitRecord.exitSurvey.organizationCulture = surveyData.organizationCulture;
    exitRecord.exitSurvey.triggerReason = surveyData.triggerReason;

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'UPDATE',
      field: 'exitSurvey',
      oldValue: oldSurvey,
      newValue: exitRecord.exitSurvey,
      modifiedBy: req.user._id,
      notes: 'Exit survey submitted'
    });

    await exitRecord.save();

    res.json({
      message: 'Exit survey submitted successfully',
      exitSurvey: exitRecord.exitSurvey
    });
  } catch (error) {
    console.error('Error submitting exit survey:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exit-management/:id/approve
// @desc    Approve exit management record
// @access  Private (HR, Admin)
router.put('/:id/approve', [
  authenticate,
  checkPermissions(MODULES.EXIT_MANAGEMENT, ACTIONS.APPROVE)
], async (req, res) => {
  try {
    const exitRecord = await ExitManagement.findById(req.params.id);
    if (!exitRecord) {
      return res.status(404).json({ message: 'Exit management record not found' });
    }

    if (exitRecord.status === 'completed') {
      return res.status(400).json({ message: 'Exit record is already completed' });
    }

    const oldStatus = exitRecord.status;

    // Update status
    exitRecord.status = 'completed';
    exitRecord.approvedBy = req.user._id;
    exitRecord.approvedDate = new Date();

    // Update final checklist
    exitRecord.finalChecklist.allClearancesCompleted = true;
    exitRecord.finalChecklist.assetsReturned = exitRecord.assets.every(asset => 
      asset.returnStatus === 'returned' || asset.returnStatus === 'not_returned'
    );
    exitRecord.finalChecklist.documentsCollected = true;
    exitRecord.finalChecklist.knowledgeTransferCompleted = true;
    exitRecord.finalChecklist.exitInterviewCompleted = exitRecord.exitInterview.conducted;
    exitRecord.finalChecklist.legalComplianceCompleted = true;
    exitRecord.finalChecklist.systemAccessRevoked = true;
    exitRecord.finalChecklist.finalSettlementProcessed = true;

    await exitRecord.save();

    // Add audit log
    exitRecord.auditLog.push({
      action: 'APPROVE',
      field: 'status',
      oldValue: oldStatus,
      newValue: 'completed',
      modifiedBy: req.user._id,
      notes: 'Exit management record approved and completed'
    });

    await exitRecord.save();

    // Update employee status
    const employee = await Employee.findById(exitRecord.employee);
    if (employee) {
      employee.employmentInfo.isActive = false;
      employee.employmentInfo.terminationDate = exitRecord.lastWorkingDate;
      employee.employmentInfo.terminationReason = exitRecord.reasonForLeaving;
      await employee.save();
    }

    res.json({
      message: 'Exit management record approved successfully',
      exitRecord: await ExitManagement.findById(exitRecord._id)
        .populate('employee', 'personalInfo employmentInfo')
        .populate('department', 'name')
        .populate('reportingManager', 'personalInfo')
    });
  } catch (error) {
    console.error('Error approving exit management record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
