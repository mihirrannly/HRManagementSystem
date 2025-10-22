const mongoose = require('mongoose');
const { calculateSalaryBreakdown } = require('../utils/salaryCalculator');

const salaryDetailsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  
  // Employee Details (from CSV import)
  employeeName: String,
  dateOfJoining: Date,
  remunerationType: String, // Annual, Monthly, etc.
  employmentStatus: String, // Working, Resigned, etc.
  workerType: String, // Permanent, Contract, etc.
  jobTitle: String,
  department: String,
  subDepartment: String,
  location: String,
  businessUnit: String,
  costCenter: String,
  
  // Salary Period
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
  
  // Salary Components from CSV
  totalCTC: { type: Number, default: 0 },
  totalBonusAmount: { type: Number, default: 0 },
  totalPerkAmount: { type: Number, default: 0 },
  regularSalary: { type: Number, default: 0 },
  grossSalaryA: { type: Number, default: 0 }, // Gross(A) from CSV
  total: { type: Number, default: 0 }, // Total from CSV
  revisionEffectiveFrom: Date,
  lastUpdatedOn: Date,
  
  // Earnings
  earnings: {
    basicSalary: {
      type: Number,
      default: 0
    },
    hra: { // House Rent Allowance
      type: Number,
      default: 0
    },
    conveyanceAllowance: {
      type: Number,
      default: 0
    },
    medicalAllowance: {
      type: Number,
      default: 0
    },
    specialAllowance: {
      type: Number,
      default: 0
    },
    performanceBonus: {
      type: Number,
      default: 0
    },
    overtimePay: {
      type: Number,
      default: 0
    },
    otherAllowances: {
      type: Number,
      default: 0
    }
  },
  
  // Deductions
  deductions: {
    providentFund: { // PF
      type: Number,
      default: 0
    },
    employeeStateInsurance: { // ESI
      type: Number,
      default: 0
    },
    professionalTax: {
      type: Number,
      default: 0
    },
    incomeTax: { // TDS
      type: Number,
      default: 0
    },
    loanRepayment: {
      type: Number,
      default: 0
    },
    advanceDeduction: {
      type: Number,
      default: 0
    },
    lossOfPayDays: {
      type: Number,
      default: 0
    },
    lopAmount: { // Loss of Pay Amount
      type: Number,
      default: 0
    },
    otherDeductions: {
      type: Number,
      default: 0
    },
    pfEmployer: { // PF - Employer
      type: Number,
      default: 0
    },
    pfOtherCharges: { // PF - Other Charges
      type: Number,
      default: 0
    },
    healthInsurance: {
      type: Number,
      default: 0
    }
  },
  
  // Employer Contributions
  employerContributions: {
    providentFund: {
      type: Number,
      default: 0
    },
    esi: {
      type: Number,
      default: 0
    },
    gratuity: {
      type: Number,
      default: 0
    }
  },
  
  // Attendance Summary
  attendance: {
    totalWorkingDays: {
      type: Number,
      default: 0
    },
    daysPresent: {
      type: Number,
      default: 0
    },
    daysAbsent: {
      type: Number,
      default: 0
    },
    paidLeaves: {
      type: Number,
      default: 0
    },
    unpaidLeaves: {
      type: Number,
      default: 0
    },
    weeklyOffs: {
      type: Number,
      default: 0
    },
    holidays: {
      type: Number,
      default: 0
    }
  },
  
  // Calculated Totals
  grossSalary: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  ctc: { // Cost to Company (Annual)
    type: Number,
    default: 0
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'on-hold', 'cancelled'],
    default: 'pending'
  },
  paymentDate: Date,
  paymentMode: {
    type: String,
    enum: ['bank-transfer', 'cheque', 'cash', 'upi'],
    default: 'bank-transfer'
  },
  paymentReference: String,
  
  // Bank Details (at the time of payment - can change)
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String
  },
  
  // Notes and Remarks
  remarks: String,
  internalNotes: String,
  
  // Payslip Generation
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipUrl: String,
  payslipGeneratedAt: Date,
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Import metadata
  importedFrom: {
    type: String,
    enum: ['manual', 'csv', 'api', 'system'],
    default: 'manual'
  },
  importBatchId: String, // Group multiple records imported together
  
}, {
  timestamps: true
});

// Compound index for unique salary record per employee per month
salaryDetailsSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Pre-save hook to calculate totals
salaryDetailsSchema.pre('save', function(next) {
  // Calculate gross salary
  const earnings = this.earnings;
  this.grossSalary = 
    (earnings.basicSalary || 0) +
    (earnings.hra || 0) +
    (earnings.conveyanceAllowance || 0) +
    (earnings.medicalAllowance || 0) +
    (earnings.specialAllowance || 0) +
    (earnings.performanceBonus || 0) +
    (earnings.overtimePay || 0) +
    (earnings.otherAllowances || 0);
  
  // Calculate total deductions
  const deductions = this.deductions;
  this.totalDeductions = 
    (deductions.providentFund || 0) +
    (deductions.employeeStateInsurance || 0) +
    (deductions.professionalTax || 0) +
    (deductions.incomeTax || 0) +
    (deductions.loanRepayment || 0) +
    (deductions.advanceDeduction || 0) +
    (deductions.lopAmount || 0) +
    (deductions.otherDeductions || 0);
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  next();
});

// Virtual for month name
salaryDetailsSchema.virtual('monthName').get(function() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[this.month - 1];
});

// Virtual for salary period
salaryDetailsSchema.virtual('salaryPeriod').get(function() {
  return `${this.monthName} ${this.year}`;
});

// Enable virtuals in JSON
salaryDetailsSchema.set('toJSON', { virtuals: true });
salaryDetailsSchema.set('toObject', { virtuals: true });

// Static method to create salary details from CTC
salaryDetailsSchema.statics.createFromCTC = async function(employeeId, ctc, month, year, additionalData = {}) {
  try {
    // Calculate salary breakdown using our calculator
    const breakdown = calculateSalaryBreakdown(ctc);
    
    // Create salary details object
    const salaryDetails = {
      employee: employeeId,
      employeeId: employeeId,
      month: month,
      year: year,
      totalCTC: ctc,
      earnings: {
        basicSalary: breakdown.monthly.basic,
        hra: breakdown.monthly.hra,
        conveyanceAllowance: breakdown.monthly.conveyanceAllowance,
        specialAllowance: breakdown.monthly.specialAllowance,
        medicalAllowance: 0, // Not in our breakdown
        performanceBonus: 0, // Not in our breakdown
        overtimePay: 0, // Not in our breakdown
        otherAllowances: 0 // Not in our breakdown
      },
      deductions: {
        providentFund: 0, // Will be calculated separately
        employeeStateInsurance: 0, // Will be calculated separately
        professionalTax: 0, // Will be calculated separately
        incomeTax: 0, // Will be calculated separately
        loanRepayment: 0,
        advanceDeduction: 0,
        lopAmount: 0,
        otherDeductions: 0
      },
      grossSalary: breakdown.monthly.gross,
      totalCTC: ctc,
      ...additionalData
    };
    
    // Create or update the salary details
    const result = await this.findOneAndUpdate(
      { employee: employeeId, month: month, year: year },
      salaryDetails,
      { upsert: true, new: true }
    );
    
    return result;
  } catch (error) {
    console.error('Error creating salary details from CTC:', error);
    throw error;
  }
};

// Instance method to recalculate from CTC
salaryDetailsSchema.methods.recalculateFromCTC = function(ctc) {
  try {
    const breakdown = calculateSalaryBreakdown(ctc);
    
    // Update earnings
    this.earnings.basicSalary = breakdown.monthly.basic;
    this.earnings.hra = breakdown.monthly.hra;
    this.earnings.conveyanceAllowance = breakdown.monthly.conveyanceAllowance;
    this.earnings.specialAllowance = breakdown.monthly.specialAllowance;
    
    // Update totals
    this.grossSalary = breakdown.monthly.gross;
    this.totalCTC = ctc;
    
    return this;
  } catch (error) {
    console.error('Error recalculating salary from CTC:', error);
    throw error;
  }
};

module.exports = mongoose.model('SalaryDetails', salaryDetailsSchema);

