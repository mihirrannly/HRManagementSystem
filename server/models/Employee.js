const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    nationality: String,
    profilePicture: String
  },
  contactInfo: {
    personalEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  employmentInfo: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    employeeType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time'
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office'
    },
    dateOfJoining: {
      type: Date,
      required: true
    },
    probationEndDate: Date,
    confirmationDate: Date,
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    workShift: {
      type: String,
      enum: ['day', 'night', 'rotational'],
      default: 'day'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    terminationDate: Date,
    terminationReason: String
  },
  salaryInfo: {
    currentSalary: {
      basic: Number,
      hra: Number,
      allowances: Number,
      grossSalary: Number,
      ctc: Number
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String
    },
    taxInfo: {
      panNumber: String,
      aadharNumber: String,
      pfNumber: String,
      esiNumber: String,
      uanNumber: String
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'offer-letter', 'id-proof', 'address-proof', 'educational', 'experience', 'other']
    },
    name: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  employmentHistory: [{
    company: String,
    designation: String,
    startDate: Date,
    endDate: Date,
    salary: Number,
    reasonForLeaving: String
  }],
  education: [{
    degree: String,
    institution: String,
    yearOfPassing: Number,
    percentage: Number,
    specialization: String
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  auditLog: [{
    action: String,
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional Information (Dynamic fields from imports, forms, etc.)
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// Generate employee ID
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `CODR${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  const { firstName, middleName, lastName } = this.personalInfo;
  return middleName 
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;
});

// Virtual for years of experience
employeeSchema.virtual('experience').get(function() {
  if (this.employmentInfo.dateOfJoining) {
    const years = (Date.now() - this.employmentInfo.dateOfJoining.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years * 10) / 10; // Round to 1 decimal place
  }
  return 0;
});

// Indexes for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ 'employmentInfo.department': 1 });
employeeSchema.index({ 'employmentInfo.reportingManager': 1 });
employeeSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });

module.exports = mongoose.model('Employee', employeeSchema);

