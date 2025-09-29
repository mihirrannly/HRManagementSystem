const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'laptop',
      'desktop',
      'monitor',
      'keyboard',
      'mouse',
      'headphones',
      'mobile',
      'tablet',
      'printer',
      'scanner',
      'projector',
      'camera',
      'furniture',
      'software_license',
      'other'
    ]
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values but unique non-null values
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  vendor: {
    type: String,
    trim: true
  },
  warrantyExpiry: {
    type: Date
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'retired', 'lost'],
    default: 'available'
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    graphics: String,
    os: String,
    other: String
  },
  // Assignment tracking
  currentAssignment: {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    assignedDate: Date,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  // Assignment history
  assignmentHistory: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    assignedDate: Date,
    returnedDate: Date,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
    },
    notes: String,
    returnNotes: String
  }],
  // Maintenance records
  maintenanceHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['repair', 'upgrade', 'cleaning', 'inspection', 'other']
    },
    description: String,
    cost: Number,
    vendor: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Depreciation
  depreciationRate: {
    type: Number,
    default: 0 // Percentage per year
  },
  currentValue: {
    type: Number,
    min: 0
  },
  // Metadata
  tags: [String],
  images: [String], // URLs to asset images
  documents: [String], // URLs to related documents (invoices, manuals, etc.)
  isActive: {
    type: Boolean,
    default: true
  },
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

// Indexes for better performance
assetSchema.index({ assetId: 1 });
assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ 'currentAssignment.employee': 1 });
assetSchema.index({ serialNumber: 1 }, { sparse: true });
assetSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
assetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for calculating current depreciated value
assetSchema.virtual('depreciatedValue').get(function() {
  if (!this.purchasePrice || !this.purchaseDate || !this.depreciationRate) {
    return this.currentValue || this.purchasePrice || 0;
  }
  
  const yearsOld = (new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
  const depreciation = this.purchasePrice * (this.depreciationRate / 100) * yearsOld;
  return Math.max(0, this.purchasePrice - depreciation);
});

// Virtual for warranty status
assetSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyExpiry) return 'unknown';
  
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.warrantyExpiry - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'active';
});

// Method to assign asset to employee
assetSchema.methods.assignToEmployee = function(employeeId, assignedBy, notes = '') {
  // If already assigned, move current assignment to history
  if (this.currentAssignment.employee) {
    this.assignmentHistory.push({
      employee: this.currentAssignment.employee,
      assignedDate: this.currentAssignment.assignedDate,
      returnedDate: new Date(),
      assignedBy: this.currentAssignment.assignedBy,
      returnedBy: assignedBy,
      condition: this.condition,
      notes: this.currentAssignment.notes,
      returnNotes: 'Asset reassigned to another employee'
    });
  }
  
  // Set new assignment
  this.currentAssignment = {
    employee: employeeId,
    assignedDate: new Date(),
    assignedBy: assignedBy,
    notes: notes
  };
  
  this.status = 'assigned';
  this.updatedBy = assignedBy;
  
  return this.save();
};

// Method to return asset from employee
assetSchema.methods.returnFromEmployee = function(returnedBy, condition = 'good', returnNotes = '') {
  if (!this.currentAssignment.employee) {
    throw new Error('Asset is not currently assigned to any employee');
  }
  
  // Move current assignment to history
  this.assignmentHistory.push({
    employee: this.currentAssignment.employee,
    assignedDate: this.currentAssignment.assignedDate,
    returnedDate: new Date(),
    assignedBy: this.currentAssignment.assignedBy,
    returnedBy: returnedBy,
    condition: condition,
    notes: this.currentAssignment.notes,
    returnNotes: returnNotes
  });
  
  // Clear current assignment
  this.currentAssignment = {
    employee: null,
    assignedDate: null,
    assignedBy: null,
    notes: ''
  };
  
  this.status = 'available';
  this.condition = condition;
  this.updatedBy = returnedBy;
  
  return this.save();
};

// Method to add maintenance record
assetSchema.methods.addMaintenanceRecord = function(maintenanceData, performedBy) {
  this.maintenanceHistory.push({
    date: maintenanceData.date || new Date(),
    type: maintenanceData.type,
    description: maintenanceData.description,
    cost: maintenanceData.cost || 0,
    vendor: maintenanceData.vendor,
    performedBy: performedBy
  });
  
  this.updatedBy = performedBy;
  
  return this.save();
};

// Ensure virtual fields are serialized
assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
