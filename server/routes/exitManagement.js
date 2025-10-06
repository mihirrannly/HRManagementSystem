const express = require('express');
const { body, query, validationResult } = require('express-validator');
const ExitManagement = require('../models/ExitManagement');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Asset = require('../models/Asset');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');

const router = express.Router();

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
      reportingManager: employee.employmentInfo.reportingManager?._id,
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

module.exports = router;
