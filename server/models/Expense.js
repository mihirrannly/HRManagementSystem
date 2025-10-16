const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },

  // Expense Details
  category: {
    type: String,
    required: true,
    enum: ['meals', 'travel', 'accommodation', 'transport', 'office', 'medical', 'communication', 'other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  expenseDate: {
    type: Date,
    required: true,
    index: true
  },

  // Receipts/Documents
  receipts: [{
    filename: String,
    originalName: String,
    url: String,
    key: String, // S3 key if using S3
    size: Number,
    mimetype: String,
    uploadedAt: Date
  }],

  // Status and Approval
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'reimbursed'],
    default: 'pending',
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  adminNotes: String,

  // Reimbursement Details
  reimbursement: {
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash'],
      default: 'bank_transfer'
    },
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    upiId: String
  },

  // Reimbursement Tracking
  reimbursedAmount: Number,
  reimbursedAt: Date,
  transactionId: String,

  // Additional Notes
  employeeNotes: String,

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
expenseSchema.index({ employee: 1, createdAt: -1 });
expenseSchema.index({ status: 1, createdAt: -1 });
expenseSchema.index({ expenseDate: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ isDeleted: 1 });

// Virtual for total reimbursed amount calculation
expenseSchema.virtual('effectiveAmount').get(function() {
  return this.reimbursedAmount || this.amount;
});

// Method to check if expense can be edited
expenseSchema.methods.canBeEdited = function() {
  return this.status === 'pending' && !this.isDeleted;
};

// Method to check if expense can be deleted
expenseSchema.methods.canBeDeleted = function() {
  return this.status === 'pending' && !this.isDeleted;
};

// Static method to get expense statistics
expenseSchema.statics.getStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: { isDeleted: false, ...query } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get category statistics
expenseSchema.statics.getCategoryStats = async function(query = {}) {
  const stats = await this.aggregate([
    { $match: { isDeleted: false, status: { $ne: 'rejected' }, ...query } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  return stats;
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;

