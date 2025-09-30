const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const EmployeeShift = require('../models/EmployeeShift');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// Get all shifts
router.get('/', authenticate, async (req, res) => {
  try {
    const { active, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const shifts = await Shift.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ isDefault: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Shift.countDocuments(filter);
    
    res.json({
      shifts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Failed to fetch shifts' });
  }
});

// Get shift by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ message: 'Failed to fetch shift' });
  }
});

// Create new shift
router.post('/', authenticate, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const shiftData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const shift = new Shift(shiftData);
    await shift.save();
    
    await shift.populate('createdBy', 'name email');
    
    res.status(201).json({
      message: 'Shift created successfully',
      shift
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Shift code already exists' });
    }
    res.status(500).json({ message: 'Failed to create shift' });
  }
});

// Update shift
router.put('/:id', authenticate, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };
    
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name email');
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json({
      message: 'Shift updated successfully',
      shift
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: 'Failed to update shift' });
  }
});

// Delete shift
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Check if shift is assigned to any employees
    const assignedEmployees = await EmployeeShift.countDocuments({
      shift: req.params.id,
      isActive: true
    });
    
    if (assignedEmployees > 0) {
      return res.status(400).json({
        message: `Cannot delete shift. It is currently assigned to ${assignedEmployees} employee(s).`
      });
    }
    
    const shift = await Shift.findByIdAndDelete(req.params.id);
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: 'Failed to delete shift' });
  }
});

// Get employees assigned to a shift
router.get('/:id/employees', authenticate, async (req, res) => {
  try {
    const { active = true } = req.query;
    
    const employeeShifts = await EmployeeShift.find({
      shift: req.params.id,
      isActive: active === 'true'
    })
    .populate({
      path: 'employee',
      select: 'employeeId personalInfo employmentInfo',
      populate: {
        path: 'employmentInfo.department',
        select: 'name code'
      }
    })
    .populate('createdBy approvedBy', 'name email')
    .sort({ effectiveFrom: -1 });
    
    res.json(employeeShifts);
  } catch (error) {
    console.error('Error fetching shift employees:', error);
    res.status(500).json({ message: 'Failed to fetch shift employees' });
  }
});

// Assign shift to employee
router.post('/assign', authenticate, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const { employeeId, shiftId, effectiveFrom, effectiveTo, reason, notes, customSettings } = req.body;
    
    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Validate shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    // Deactivate current shift assignment if exists
    const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
    
    // Handle both old format (isActive: true) and new format (isApproved: true)
    await EmployeeShift.updateMany(
      { 
        employee: employeeId,
        $or: [
          // New format: isApproved = true and no effectiveTo or future effectiveTo
          {
            isApproved: true,
            $or: [
              { effectiveTo: { $exists: false } },
              { effectiveTo: null },
              { effectiveTo: { $gt: effectiveDate } }
            ]
          },
          // Old format: isActive = true
          { isActive: true }
        ]
      },
      { 
        effectiveTo: effectiveDate,
        isActive: false,
        updatedAt: new Date()
      }
    );
    
    // Create new shift assignment
    const employeeShift = new EmployeeShift({
      employee: employeeId,
      shift: shiftId,
      effectiveFrom: effectiveFrom || new Date(),
      effectiveTo: effectiveTo || null,
      reason: reason || 'initial_assignment',
      notes,
      customSettings,
      isApproved: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
      createdBy: req.user._id
    });
    
    await employeeShift.save();
    
    await employeeShift.populate([
      {
        path: 'employee',
        select: 'employeeId personalInfo employmentInfo'
      },
      {
        path: 'shift',
        select: 'name code startTime endTime'
      },
      {
        path: 'createdBy',
        select: 'name email'
      }
    ]);
    
    res.status(201).json({
      message: 'Shift assigned successfully',
      assignment: employeeShift
    });
  } catch (error) {
    console.error('Error assigning shift:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      employeeId,
      shiftId,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Duplicate assignment detected. Employee may already be assigned to this shift.',
        error: 'DUPLICATE_ASSIGNMENT'
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to assign shift',
        error: error.message 
      });
    }
  }
});

// Bulk assign shifts
router.post('/bulk-assign', authenticate, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const { employeeIds, shiftId, effectiveFrom, reason, notes } = req.body;
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'Employee IDs array is required' });
    }
    
    // Validate shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    const results = [];
    const errors = [];
    
    for (const employeeId of employeeIds) {
      try {
        // Validate employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          errors.push({ employeeId, error: 'Employee not found' });
          continue;
        }
        
        // Deactivate current shift assignment
        const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();
        
        // Handle both old format (isActive: true) and new format (isApproved: true)
        await EmployeeShift.updateMany(
          { 
            employee: employeeId,
            $or: [
              // New format: isApproved = true and no effectiveTo or future effectiveTo
              {
                isApproved: true,
                $or: [
                  { effectiveTo: { $exists: false } },
                  { effectiveTo: null },
                  { effectiveTo: { $gt: effectiveDate } }
                ]
              },
              // Old format: isActive = true
              { isActive: true }
            ]
          },
          { 
            effectiveTo: effectiveDate,
            isActive: false,
            updatedAt: new Date()
          }
        );
        
        // Create new shift assignment
        const employeeShift = new EmployeeShift({
          employee: employeeId,
          shift: shiftId,
          effectiveFrom: effectiveFrom || new Date(),
          reason: reason || 'initial_assignment',
          notes,
          isApproved: true,
          approvedBy: req.user._id,
          approvedAt: new Date(),
          createdBy: req.user._id
        });
        
        await employeeShift.save();
        results.push({ employeeId, success: true });
        
      } catch (error) {
        errors.push({ employeeId, error: error.message });
      }
    }
    
    res.json({
      message: `Bulk assignment completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk assign:', error);
    res.status(500).json({ message: 'Failed to bulk assign shifts' });
  }
});

// Get employee's current shift
router.get('/employee/:employeeId/current', authenticate, async (req, res) => {
  try {
    const currentShift = await EmployeeShift.getCurrentShift(req.params.employeeId);
    
    if (!currentShift) {
      return res.status(404).json({ message: 'No active shift found for employee' });
    }
    
    res.json(currentShift);
  } catch (error) {
    console.error('Error fetching employee shift:', error);
    res.status(500).json({ message: 'Failed to fetch employee shift' });
  }
});

// Get employee's shift history
router.get('/employee/:employeeId/history', authenticate, async (req, res) => {
  try {
    const shiftHistory = await EmployeeShift.getShiftHistory(req.params.employeeId);
    res.json(shiftHistory);
  } catch (error) {
    console.error('Error fetching shift history:', error);
    res.status(500).json({ message: 'Failed to fetch shift history' });
  }
});

// Get all employee shift assignments
router.get('/assignments/all', authenticate, async (req, res) => {
  try {
    const { active = true, page = 1, limit = 50, department, shift } = req.query;
    
    const filter = {};
    if (active !== undefined && active === 'true') {
      // Filter for truly active assignments (both old and new format)
      const currentDate = new Date();
      filter.$or = [
        // New format: isApproved = true and no effectiveTo or future effectiveTo
        {
          isApproved: true,
          $or: [
            { effectiveTo: { $exists: false } },
            { effectiveTo: null },
            { effectiveTo: { $gt: currentDate } }
          ]
        },
        // Old format: isActive = true and no effectiveTo or future effectiveTo
        {
          isActive: true,
          $or: [
            { effectiveTo: { $exists: false } },
            { effectiveTo: null },
            { effectiveTo: { $gt: currentDate } }
          ]
        }
      ];
    } else if (active !== undefined && active === 'false') {
      // Filter for inactive assignments
      const currentDate = new Date();
      filter.$or = [
        { isActive: false },
        { isApproved: false },
        { effectiveTo: { $lte: currentDate } }
      ];
    }
    if (shift) {
      filter.shift = shift;
    }
    
    let employeeFilter = {};
    if (department) {
      employeeFilter['employmentInfo.department'] = department;
    }
    
    const assignments = await EmployeeShift.find(filter)
      .populate({
        path: 'employee',
        match: employeeFilter,
        select: 'employeeId personalInfo employmentInfo',
        populate: {
          path: 'employmentInfo.department',
          select: 'name code'
        }
      })
      .populate('shift', 'name code startTime endTime color')
      .populate('createdBy approvedBy', 'name email')
      .sort({ effectiveFrom: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Filter out assignments where employee population failed
    const filteredAssignments = assignments.filter(assignment => assignment.employee);
    
    const total = await EmployeeShift.countDocuments(filter);
    
    res.json({
      assignments: filteredAssignments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching shift assignments:', error);
    res.status(500).json({ message: 'Failed to fetch shift assignments' });
  }
});

module.exports = router;
