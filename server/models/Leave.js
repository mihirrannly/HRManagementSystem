const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  maxDaysPerYear: {
    type: Number,
    default: 0
  },
  carryForward: {
    type: Boolean,
    default: false
  },
  maxCarryForward: {
    type: Number,
    default: 0
  },
  encashable: {
    type: Boolean,
    default: false
  },
  applicableFor: {
    type: String,
    enum: ['all', 'male', 'female'],
    default: 'all'
  },
  minimumServiceDays: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3498db'
  }
});

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  // Casual Leave Balance
  casualLeave: {
    allocated: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 12 }
  },
  // Sick Leave Balance
  sickLeave: {
    allocated: { type: Number, default: 12 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 12 }
  },
  // Special Leave Balance (Marriage, Bereavement)
  specialLeave: {
    allocated: { type: Number, default: 3 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 3 }
  },
  // Monthly usage tracking
  monthlyUsage: [{
    month: { type: Number, required: true }, // 1-12
    casualUsed: { type: Number, default: 0 },
    sickUsed: { type: Number, default: 0 },
    specialUsed: { type: Number, default: 0 }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate available balances and update timestamp
leaveBalanceSchema.pre('save', function(next) {
  // Calculate available balances for each leave type
  this.casualLeave.available = this.casualLeave.allocated - this.casualLeave.used - this.casualLeave.pending;
  this.sickLeave.available = this.sickLeave.allocated - this.sickLeave.used - this.sickLeave.pending;
  this.specialLeave.available = this.specialLeave.allocated - this.specialLeave.used - this.specialLeave.pending;
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'marriage', 'bereavement'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partially_approved', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvalFlow: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    approverType: {
      type: String,
      enum: ['manager', 'hr'],
      required: true
    },
    level: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    actionDate: Date
  }],
  currentApprovalLevel: {
    type: Number,
    default: 1
  },
  finalApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  finalApprovalDate: Date,
  rejectionReason: String,
  attachments: [{
    filename: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEmergency: {
    type: Boolean,
    default: false
  },
  contactDuringLeave: {
    phone: String,
    email: String,
    address: String
  },
  handoverNotes: String,
  handoverTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
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

// Calculate total days before saving
leaveRequestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end dates
  }
  this.updatedAt = Date.now();
  next();
});

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['national', 'regional', 'optional', 'company'],
    default: 'company'
  },
  description: String,
  isOptional: {
    type: Boolean,
    default: false
  },
  applicableLocations: [String],
  applicableDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });
leaveRequestSchema.index({ employee: 1, startDate: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ leaveType: 1 });
holidaySchema.index({ date: 1 });

const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday
};

