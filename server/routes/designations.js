const express = require('express');
const { body, validationResult } = require('express-validator');
const Designation = require('../models/Designation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/designations
// @desc    Get all designations
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const designations = await Designation.find(filter)
      .sort({ level: 1, name: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: designations.length,
      designations
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/designations/:id
// @desc    Get single designation
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    res.json({
      success: true,
      designation
    });
  } catch (error) {
    console.error('Error fetching designation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/designations
// @desc    Create new designation
// @access  Private (Admin, HR)
router.post('/', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim().withMessage('Designation name is required'),
  body('description').optional().trim(),
  body('level').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive', 'c-level'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, description, level } = req.body;
    
    // Check if designation already exists
    const existingDesignation = await Designation.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingDesignation) {
      return res.status(400).json({
        success: false,
        message: 'Designation with this name already exists'
      });
    }
    
    const designation = new Designation({
      name,
      description,
      level: level || 'mid',
      createdBy: req.user._id
    });
    
    await designation.save();
    
    console.log(`✅ Designation created: ${name} by ${req.user.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Designation created successfully',
      designation
    });
  } catch (error) {
    console.error('Error creating designation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/designations/:id
// @desc    Update designation
// @access  Private (Admin, HR)
router.put('/:id', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('level').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive', 'c-level']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const designation = await Designation.findById(req.params.id);
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    const { name, description, level, isActive } = req.body;
    
    // Check if new name conflicts with existing designation
    if (name && name !== designation.name) {
      const existingDesignation = await Designation.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingDesignation) {
        return res.status(400).json({
          success: false,
          message: 'Designation with this name already exists'
        });
      }
      
      designation.name = name;
    }
    
    if (description !== undefined) designation.description = description;
    if (level) designation.level = level;
    if (isActive !== undefined) designation.isActive = isActive;
    
    await designation.save();
    
    console.log(`✅ Designation updated: ${designation.name} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Designation updated successfully',
      designation
    });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/designations/:id
// @desc    Delete designation
// @access  Private (Admin, HR)
router.delete('/:id', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    
    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found'
      });
    }
    
    // Check if designation is being used by any employees
    const Employee = require('../models/Employee');
    const employeeCount = await Employee.countDocuments({
      'employmentInfo.designation': designation.name
    });
    
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete designation. It is currently assigned to ${employeeCount} employee(s). Please reassign them first.`
      });
    }
    
    await Designation.findByIdAndDelete(req.params.id);
    
    console.log(`🗑️ Designation deleted: ${designation.name} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Designation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting designation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/designations/seed
// @desc    Seed default designations
// @access  Private (Admin)
router.post('/seed', [
  authenticate,
  authorize(['admin'])
], async (req, res) => {
  try {
    const defaultDesignations = [
      { name: 'Software Engineer', level: 'mid', description: 'Develops software applications' },
      { name: 'Senior Software Engineer', level: 'senior', description: 'Senior level software development' },
      { name: 'Team Lead', level: 'lead', description: 'Leads a team of engineers' },
      { name: 'Engineering Manager', level: 'manager', description: 'Manages engineering team' },
      { name: 'Product Manager', level: 'manager', description: 'Manages product development' },
      { name: 'HR Manager', level: 'manager', description: 'Manages HR operations' },
      { name: 'HR Executive', level: 'mid', description: 'Handles HR tasks' },
      { name: 'Business Analyst', level: 'mid', description: 'Analyzes business requirements' },
      { name: 'Quality Assurance Engineer', level: 'mid', description: 'Tests software quality' },
      { name: 'DevOps Engineer', level: 'mid', description: 'Manages infrastructure and deployment' },
      { name: 'Data Analyst', level: 'mid', description: 'Analyzes data and creates reports' },
      { name: 'UI/UX Designer', level: 'mid', description: 'Designs user interfaces' },
      { name: 'Marketing Executive', level: 'mid', description: 'Handles marketing activities' },
      { name: 'Sales Executive', level: 'mid', description: 'Manages sales operations' },
      { name: 'Accountant', level: 'mid', description: 'Manages financial records' },
      { name: 'Finance Manager', level: 'manager', description: 'Manages finance department' },
      { name: 'Operations Manager', level: 'manager', description: 'Manages operations' },
      { name: 'Intern', level: 'entry', description: 'Training position' },
      { name: 'Trainee', level: 'entry', description: 'Entry-level training role' },
      { name: 'Associate', level: 'junior', description: 'Junior level position' }
    ];
    
    let created = 0;
    let skipped = 0;
    
    for (const designationData of defaultDesignations) {
      const existing = await Designation.findOne({
        name: { $regex: new RegExp(`^${designationData.name}$`, 'i') }
      });
      
      if (!existing) {
        await Designation.create({
          ...designationData,
          createdBy: req.user._id
        });
        created++;
      } else {
        skipped++;
      }
    }
    
    console.log(`📦 Designations seeded: ${created} created, ${skipped} skipped`);
    
    res.json({
      success: true,
      message: `Seeding complete: ${created} created, ${skipped} already existed`,
      created,
      skipped
    });
  } catch (error) {
    console.error('Error seeding designations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

