const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['employee', 'hr', 'admin', 'manager'],
    default: 'employee'
  },
  type: {
    type: String,
    enum: [
      'probation_reminder', // 7 days before completion
      'probation_completed', // On completion
      'leave_approval',
      'leave_rejection',
      'general',
      'attendance',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  metadata: {
    employeeId: String,
    employeeName: String,
    daysRemaining: Number,
    joiningDate: Date,
    probationEndDate: Date,
    department: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

