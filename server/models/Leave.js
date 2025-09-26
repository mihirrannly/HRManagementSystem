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
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  used: {
    type: Number,
    default: 0
  },
  pending: {
    type: Number,
    default: 0
  },
  available: {
    type: Number,
    default: 0
  },
  carriedForward: {
    type: Number,
    default: 0
  },
  encashed: {
    type: Number,
    default: 0
  }
});

// Calculate available balance
leaveBalanceSchema.pre('save', function(next) {
  this.available = this.allocated + this.carriedForward - this.used - this.pending - this.encashed;
  next();
});

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
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
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
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
leaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });
leaveRequestSchema.index({ employee: 1, startDate: 1 });
leaveRequestSchema.index({ status: 1 });
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

