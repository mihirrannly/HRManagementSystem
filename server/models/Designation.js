const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive', 'c-level'],
    default: 'mid'
  },
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
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
designationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
designationSchema.index({ name: 1 });
designationSchema.index({ isActive: 1 });
designationSchema.index({ level: 1 });

module.exports = mongoose.model('Designation', designationSchema);

