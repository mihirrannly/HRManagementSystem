const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['earning', 'deduction'],
    required: true
  },
  category: {
    type: String,
    enum: ['basic', 'allowance', 'statutory', 'voluntary', 'tax'],
    required: true
  },
  calculationType: {
    type: String,
    enum: ['fixed', 'percentage', 'formula'],
    default: 'fixed'
  },
  calculationBase: {
    type: String,
    enum: ['basic', 'gross', 'ctc', 'custom']
  },
  percentage: Number,
  formula: String,
  isTaxable: {
    type: Boolean,
    default: true
  },
  isStatutory: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const payrollCycleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  payDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'locked'],
    default: 'draft'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  totalEmployees: {
    type: Number,
    default: 0
  },
  totalGrossPay: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  totalNetPay: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const payslipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payrollCycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollCycle',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  workingDays: {
    type: Number,
    required: true
  },
  presentDays: {
    type: Number,
    required: true
  },
  absentDays: {
    type: Number,
    default: 0
  },
  paidLeaveDays: {
    type: Number,
    default: 0
  },
  unpaidLeaveDays: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  earnings: [{
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryComponent'
    },
    name: String,
    amount: {
      type: Number,
      required: true
    },
    calculatedAmount: Number,
    isProrated: {
      type: Boolean,
      default: false
    }
  }],
  deductions: [{
    component: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryComponent'
    },
    name: String,
    amount: {
      type: Number,
      required: true
    },
    calculatedAmount: Number,
    isProrated: {
      type: Boolean,
      default: false
    }
  }],
  grossPay: {
    type: Number,
    required: true
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  netPay: {
    type: Number,
    required: true
  },
  taxableIncome: {
    type: Number,
    required: true
  },
  taxDeducted: {
    type: Number,
    default: 0
  },
  pfEmployer: {
    type: Number,
    default: 0
  },
  pfEmployee: {
    type: Number,
    default: 0
  },
  esiEmployer: {
    type: Number,
    default: 0
  },
  esiEmployee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'approved', 'paid'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paidAt: Date,
  paymentMethod: {
    type: String,
    enum: ['bank-transfer', 'cash', 'cheque'],
    default: 'bank-transfer'
  },
  paymentReference: String,
  pdfPath: String,
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
payslipSchema.pre('save', function(next) {
  // Calculate gross pay
  this.grossPay = this.earnings.reduce((total, earning) => total + earning.amount, 0);
  
  // Calculate total deductions
  this.totalDeductions = this.deductions.reduce((total, deduction) => total + deduction.amount, 0);
  
  // Calculate net pay
  this.netPay = this.grossPay - this.totalDeductions;
  
  // Calculate taxable income
  this.taxableIncome = this.earnings
    .filter(earning => earning.isTaxable !== false)
    .reduce((total, earning) => total + earning.amount, 0);
  
  this.updatedAt = Date.now();
  next();
});

const salaryRevisionSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  revisionType: {
    type: String,
    enum: ['increment', 'promotion', 'adjustment', 'joining'],
    required: true
  },
  previousSalary: {
    basic: Number,
    hra: Number,
    allowances: Number,
    grossSalary: Number,
    ctc: Number
  },
  newSalary: {
    basic: {
      type: Number,
      required: true
    },
    hra: Number,
    allowances: Number,
    grossSalary: {
      type: Number,
      required: true
    },
    ctc: {
      type: Number,
      required: true
    }
  },
  incrementPercentage: Number,
  reason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
payrollCycleSchema.index({ month: 1, year: 1 }, { unique: true });
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payslipSchema.index({ payrollCycle: 1 });
salaryRevisionSchema.index({ employee: 1, effectiveDate: -1 });

const SalaryComponent = mongoose.model('SalaryComponent', salaryComponentSchema);
const PayrollCycle = mongoose.model('PayrollCycle', payrollCycleSchema);
const Payslip = mongoose.model('Payslip', payslipSchema);
const SalaryRevision = mongoose.model('SalaryRevision', salaryRevisionSchema);

module.exports = {
  SalaryComponent,
  PayrollCycle,
  Payslip,
  SalaryRevision
};

