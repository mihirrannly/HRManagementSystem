const mongoose = require('mongoose');

const employeeShiftSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  
  // Effective Period
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveTo: {
    type: Date,
    default: null // null means indefinite
  },
  
  // Custom Overrides (if different from shift defaults)
  customSettings: {
    startTime: String, // Override shift start time
    endTime: String,   // Override shift end time
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    breaks: [{
      name: String,
      startTime: String,
      endTime: String,
      duration: Number,
      isPaid: Boolean,
      isFlexible: Boolean
    }],
    flexibility: {
      allowEarlyCheckIn: Boolean,
      earlyCheckInBuffer: Number,
      allowLateCheckIn: Boolean,
      lateCheckInBuffer: Number,
      allowEarlyCheckOut: Boolean,
      earlyCheckOutBuffer: Number,
      allowLateCheckOut: Boolean,
      lateCheckOutBuffer: Number,
      flexibleBreaks: Boolean
    }
  },
  
  // Status (deprecated - use isApproved and effectiveTo instead)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Reason for assignment/change
  reason: {
    type: String,
    enum: ['initial_assignment', 'promotion', 'department_change', 'request', 'disciplinary', 'operational_requirement', 'other'],
    default: 'initial_assignment'
  },
  notes: String,
  
  // Approval workflow
  isApproved: {
    type: Boolean,
    default: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure no overlapping active shifts for same employee
// Note: Removed strict unique constraint to allow manual conflict resolution
employeeShiftSchema.index({ 
  employee: 1, 
  effectiveFrom: 1
});

// Pre-save middleware
employeeShiftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-approve if created by admin
  if (this.isNew && !this.approvedBy) {
    this.approvalStatus = 'approved';
    this.approvedAt = new Date();
    this.approvedBy = this.createdBy;
  }
  
  next();
});

// Static method to get current shift for employee
employeeShiftSchema.statics.getCurrentShift = function(employeeId, date = new Date()) {
  return this.findOne({
    employee: employeeId,
    isActive: true,
    effectiveFrom: { $lte: date },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: date } }
    ]
  }).populate('shift');
};

// Static method to get shift history for employee
employeeShiftSchema.statics.getShiftHistory = function(employeeId) {
  return this.find({
    employee: employeeId
  })
  .populate('shift')
  .populate('createdBy', 'name email')
  .populate('approvedBy', 'name email')
  .sort({ effectiveFrom: -1 });
};

module.exports = mongoose.model('EmployeeShift', employeeShiftSchema);
