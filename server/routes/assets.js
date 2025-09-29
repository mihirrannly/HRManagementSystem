const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');

const router = express.Router();

// @route   GET /api/assets
// @desc    Get all assets with filtering and pagination
// @access  Private (requires asset read permission)
router.get('/', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.READ),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('status').optional().isIn(['available', 'assigned', 'maintenance', 'retired', 'lost']),
  query('search').optional().isString(),
  query('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      category,
      status,
      search,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) query.category = category;
    if (status) query.status = status;
    if (assignedTo) query['currentAssignment.employee'] = assignedTo;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const assets = await Asset.find(query)
      .populate('currentAssignment.employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('currentAssignment.assignedBy', 'email')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Asset.countDocuments(query);

    // Get summary statistics
    const stats = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' }
        }
      }
    ]);

    const categoryStats = await Asset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      assets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: {
        byStatus: stats,
        byCategory: categoryStats,
        totalAssets: total
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Server error while fetching assets' });
  }
});

// @route   GET /api/assets/:id
// @desc    Get single asset by ID
// @access  Private (requires asset read permission)
router.get('/:id', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.READ),
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id)
      .populate('currentAssignment.employee', 'employeeId personalInfo.firstName personalInfo.lastName contactInfo.personalEmail')
      .populate('currentAssignment.assignedBy', 'email')
      .populate('assignmentHistory.employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('assignmentHistory.assignedBy', 'email')
      .populate('assignmentHistory.returnedBy', 'email')
      .populate('maintenanceHistory.performedBy', 'email')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ message: 'Server error while fetching asset' });
  }
});

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private (requires asset create permission)
router.post('/', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.CREATE),
  body('assetId').notEmpty().withMessage('Asset ID is required'),
  body('name').notEmpty().withMessage('Asset name is required'),
  body('category').isIn([
    'laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headphones',
    'mobile', 'tablet', 'printer', 'scanner', 'projector', 'camera',
    'furniture', 'software_license', 'other'
  ]).withMessage('Invalid category'),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('purchaseDate').optional().isISO8601(),
  body('warrantyExpiry').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if asset ID already exists
    const existingAsset = await Asset.findOne({ 
      assetId: req.body.assetId.toUpperCase(),
      isActive: true 
    });
    
    if (existingAsset) {
      return res.status(400).json({ message: 'Asset ID already exists' });
    }

    const assetData = {
      ...req.body,
      assetId: req.body.assetId.toUpperCase(),
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const asset = new Asset(assetData);
    await asset.save();

    // Populate the created asset
    await asset.populate('createdBy', 'email');

    res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Asset ID or Serial Number already exists' });
    }
    res.status(500).json({ message: 'Server error while creating asset' });
  }
});

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private (requires asset update permission)
router.put('/:id', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.UPDATE),
  param('id').isMongoId(),
  body('name').optional().notEmpty(),
  body('category').optional().isIn([
    'laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headphones',
    'mobile', 'tablet', 'printer', 'scanner', 'projector', 'camera',
    'furniture', 'software_license', 'other'
  ]),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('purchaseDate').optional().isISO8601(),
  body('warrantyExpiry').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'assetId' && req.body[key] !== undefined) {
        asset[key] = req.body[key];
      }
    });

    asset.updatedBy = req.user._id;
    await asset.save();

    // Populate the updated asset
    await asset.populate([
      { path: 'currentAssignment.employee', select: 'employeeId personalInfo.firstName personalInfo.lastName' },
      { path: 'updatedBy', select: 'email' }
    ]);

    res.json({
      message: 'Asset updated successfully',
      asset
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ message: 'Server error while updating asset' });
  }
});

// @route   POST /api/assets/:id/assign
// @desc    Assign asset to employee
// @access  Private (requires asset update permission)
router.post('/:id/assign', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.UPDATE),
  param('id').isMongoId(),
  body('employeeId').isMongoId().withMessage('Valid employee ID is required'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if employee exists
    const employee = await Employee.findById(req.body.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Assign asset
    await asset.assignToEmployee(req.body.employeeId, req.user._id, req.body.notes || '');

    // Populate the updated asset
    await asset.populate([
      { path: 'currentAssignment.employee', select: 'employeeId personalInfo.firstName personalInfo.lastName' },
      { path: 'currentAssignment.assignedBy', select: 'email' }
    ]);

    res.json({
      message: 'Asset assigned successfully',
      asset
    });
  } catch (error) {
    console.error('Error assigning asset:', error);
    res.status(500).json({ message: 'Server error while assigning asset' });
  }
});

// @route   POST /api/assets/:id/return
// @desc    Return asset from employee
// @access  Private (requires asset update permission)
router.post('/:id/return', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.UPDATE),
  param('id').isMongoId(),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'damaged']),
  body('returnNotes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (!asset.currentAssignment.employee) {
      return res.status(400).json({ message: 'Asset is not currently assigned to any employee' });
    }

    // Return asset
    await asset.returnFromEmployee(
      req.user._id,
      req.body.condition || 'good',
      req.body.returnNotes || ''
    );

    res.json({
      message: 'Asset returned successfully',
      asset
    });
  } catch (error) {
    console.error('Error returning asset:', error);
    res.status(500).json({ message: 'Server error while returning asset' });
  }
});

// @route   POST /api/assets/:id/maintenance
// @desc    Add maintenance record
// @access  Private (requires asset update permission)
router.post('/:id/maintenance', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.UPDATE),
  param('id').isMongoId(),
  body('type').isIn(['repair', 'upgrade', 'cleaning', 'inspection', 'other']),
  body('description').notEmpty().withMessage('Description is required'),
  body('cost').optional().isFloat({ min: 0 }),
  body('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Add maintenance record
    await asset.addMaintenanceRecord(req.body, req.user._id);

    res.json({
      message: 'Maintenance record added successfully',
      asset
    });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    res.status(500).json({ message: 'Server error while adding maintenance record' });
  }
});

// @route   DELETE /api/assets/:id
// @desc    Delete (deactivate) asset
// @access  Private (requires asset delete permission)
router.delete('/:id', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.DELETE),
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.isActive) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check if asset is currently assigned
    if (asset.currentAssignment.employee) {
      return res.status(400).json({ 
        message: 'Cannot delete asset that is currently assigned. Please return the asset first.' 
      });
    }

    // Soft delete
    asset.isActive = false;
    asset.status = 'retired';
    asset.updatedBy = req.user._id;
    await asset.save();

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ message: 'Server error while deleting asset' });
  }
});

// @route   GET /api/assets/employee/:employeeId
// @desc    Get assets assigned to specific employee
// @access  Private (employees can view their own assets, others need asset read permission)
router.get('/employee/:employeeId', [
  authenticate,
  param('employeeId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employee exists
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check permissions: employees can only view their own assets
    // Find the employee record for the current user
    const userEmployee = await Employee.findOne({ user: req.user._id });
    const isOwnAssets = userEmployee && userEmployee._id.toString() === req.params.employeeId;
    const hasAssetPermission = req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'manager';
    
    if (!isOwnAssets && !hasAssetPermission) {
      return res.status(403).json({ message: 'Access denied. You can only view your own assets.' });
    }

    const assets = await Asset.find({
      'currentAssignment.employee': req.params.employeeId,
      isActive: true
    }).populate('currentAssignment.assignedBy', 'email');

    res.json({
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
      },
      assets
    });
  } catch (error) {
    console.error('Error fetching employee assets:', error);
    res.status(500).json({ message: 'Server error while fetching employee assets' });
  }
});

// @route   GET /api/assets/search/employees
// @desc    Search employees for asset assignment
// @access  Private (requires asset read permission)
router.get('/search/employees', [
  authenticate,
  checkPermissions(MODULES.ASSETS, ACTIONS.READ),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = { 'employmentInfo.isActive': true };

    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'contactInfo.personalEmail': { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .select('employeeId personalInfo.firstName personalInfo.lastName contactInfo.personalEmail employmentInfo.designation')
      .populate('employmentInfo.department', 'name')
      .limit(20)
      .sort({ 'personalInfo.firstName': 1 });

    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      email: emp.contactInfo.personalEmail,
      designation: emp.employmentInfo.designation,
      department: emp.employmentInfo.department?.name
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error searching employees:', error);
    res.status(500).json({ message: 'Server error while searching employees' });
  }
});

module.exports = router;
