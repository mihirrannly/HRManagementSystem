const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['resume', 'id_proof', 'address_proof', 'educational', 'education', 'experience', 'passport_photo', 'pan_card', 'bank_details', 'kyc', 'other'],
    required: true
  },
  name: String,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'verified', 'rejected'],
    default: 'pending'
  },
  comments: String
});

const taskSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  department: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
});

const offerLetterSchema = new mongoose.Schema({
  position: String,
  department: String,
  salary: Number,
  startDate: Date,
  reportingManager: String,
  workLocation: String,
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'intern'],
    default: 'full_time'
  },
  probationPeriod: Number, // in months
  benefits: [String],
  terms: [String],
  
  // Offer Letter Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  sentAt: Date,
  expiryDate: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  candidateSignature: {
    data: String,        // Base64 image data
    name: String,        // Candidate name
    method: String,      // 'draw' or 'type'
    timestamp: Date      // When signature was created
  },
  acceptanceComments: String,
  rejectionReason: String
});

const orientationSchema = new mongoose.Schema({
  scheduledDate: Date,
  duration: Number, // in hours
  conductor: String,
  topics: [String],
  location: String,
  completedAt: Date,
  attendanceMarked: { type: Boolean, default: false },

  materials: [{ name: String, url: String }]
});

const onboardingSchema = new mongoose.Schema({
  // Basic Information
  employeeId: { type: String, unique: true },
  employeeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  
  // Address Information
  currentAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    sameAsCurrent: { type: Boolean, default: false }
  },
  
  // Job Information
  department: { type: String, required: true },
  position: { type: String, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  startDate: { type: Date, required: true },
  employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
  probationPeriod: { type: Number, default: 6 }, // in months
  salary: { type: Number },
  
  // Onboarding Status
  status: { 
    type: String, 
    enum: ['draft', 'offer_sent', 'offer_accepted', 'offer_rejected', 'documents_pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  currentStep: { type: String, default: 'offer_letter' },
  progress: { type: Number, default: 0 }, // percentage
  employeeCreated: { type: Boolean, default: false },
  
  // Document submission tracking
  documentsSubmitted: { type: Boolean, default: false },
  documentsSubmittedAt: { type: Date },
  documentsStatus: { 
    type: String, 
    enum: ['pending', 'submitted_for_review', 'under_review', 'approved', 'rejected'], 
    default: 'pending' 
  },
  
  // Offer Letter
  offerLetter: offerLetterSchema,
  
  // Documents
  documents: [documentSchema],
  
  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  
  // Education
  education: [{
    degree: String,
    institution: String,
    yearOfPassing: Number,
    percentage: Number,
    specialization: String
  }],
  
  // Experience
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    salary: Number,
    reasonForLeaving: String
  }],
  
  // Bank Details
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String,
    branch: String
  },
  
  // Government IDs
  panNumber: String,
  aadharNumber: String,
  passportNumber: String,
  nationality: String,
  
  // Onboarding Tasks
  tasks: [taskSchema],
  
  // Orientation
  orientation: orientationSchema,
  
  // IT Setup
  itSetup: {
    hardware: {
      laptop: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String },
      monitor: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String },
      keyboard: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String },
      mouse: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String },
      headphones: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String },
      mobile: { assigned: { type: Boolean, default: false }, model: String, serialNumber: String, assignedDate: String }
    },
    software: {
      email: { setup: { type: Boolean, default: false }, account: String, setupDate: String },
      slack: { setup: { type: Boolean, default: false }, account: String, setupDate: String },
      vpn: { setup: { type: Boolean, default: false }, account: String, setupDate: String },
      development: { setup: { type: Boolean, default: false }, tools: [String], setupDate: String },
      office: { setup: { type: Boolean, default: false }, license: String, setupDate: String },
      security: { setup: { type: Boolean, default: false }, tools: [String], setupDate: String }
    },
    access: {
      building: { granted: { type: Boolean, default: false }, cardNumber: String, grantedDate: String },
      parking: { granted: { type: Boolean, default: false }, spotNumber: String, grantedDate: String },
      wifi: { granted: { type: Boolean, default: false }, credentials: String, grantedDate: String }
    },
    notes: String,
    completedBy: String,
    completedDate: String,
    // Legacy fields for backward compatibility
    laptopAssigned: { type: Boolean, default: false },
    laptopDetails: String,
    emailCreated: { type: Boolean, default: false },
    systemAccess: [String],
    softwareInstalled: [String],
    completedAt: Date
  },
  
  // HR Setup
  hrSetup: {
    processes: {
      employeeId: { completed: { type: Boolean, default: false }, notes: String, completedDate: String },
      policies: { completed: { type: Boolean, default: false }, notes: String, completedDate: String },
      handbook: { completed: { type: Boolean, default: false }, notes: String, completedDate: String },
      benefits: { completed: { type: Boolean, default: false }, notes: String, completedDate: String },
      payroll: { completed: { type: Boolean, default: false }, notes: String, completedDate: String }
    },
    documents: {
      contract: { provided: { type: Boolean, default: false }, notes: String, providedDate: String },
      nda: { provided: { type: Boolean, default: false }, notes: String, providedDate: String },
      handbook: { provided: { type: Boolean, default: false }, notes: String, providedDate: String },
      policies: { provided: { type: Boolean, default: false }, notes: String, providedDate: String }
    },
    notes: String,
    completedBy: String,
    completedDate: String,
    // Legacy fields for backward compatibility
    employeeIdAssigned: { type: Boolean, default: false },
    policiesShared: { type: Boolean, default: false },
    handbookProvided: { type: Boolean, default: false },
    benefitsExplained: { type: Boolean, default: false },
    completedAt: Date
  },
  
  // Notes and Comments
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['note', 'reminder', 'issue', 'update'], default: 'note' }
  }],
  
  // Workflow Steps Progress
  stepProgress: {
    offer_letter: { completed: { type: Boolean, default: false }, completedAt: Date },
    document_collection: { completed: { type: Boolean, default: false }, completedAt: Date },
    background_verification: { completed: { type: Boolean, default: false }, completedAt: Date },
    it_setup: { completed: { type: Boolean, default: false }, completedAt: Date },
    hr_setup: { completed: { type: Boolean, default: false }, completedAt: Date },
    orientation: { completed: { type: Boolean, default: false }, completedAt: Date },
    manager_introduction: { completed: { type: Boolean, default: false }, completedAt: Date },
    workspace_setup: { completed: { type: Boolean, default: false }, completedAt: Date },
    training_schedule: { completed: { type: Boolean, default: false }, completedAt: Date },
    completion: { completed: { type: Boolean, default: false }, completedAt: Date }
  },
  
  // Candidate Portal
  candidatePortal: {
    password: String, // Hashed password for candidate access
    plainTextPassword: String, // Store temporarily for HR reference (will be cleared after first access)
    isActive: { type: Boolean, default: false },
    isSubmitted: { type: Boolean, default: false },
    submittedAt: Date,
    lastAccessed: Date,
    lastUpdated: Date,
    createdAt: Date, // When credentials were first created
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // HR user who created credentials
    accessCount: { type: Number, default: 0 }, // Track how many times accessed
    
    // Candidate filled information
    personalInfo: {
      firstName: String,
      lastName: String,
      middleName: String,
      email: String,
      phone: String,
      alternatePhone: String,
      dateOfBirth: Date,
      gender: String,
      maritalStatus: String,
      nationality: String,
      bloodGroup: String,
      aadharNumber: String,
      panNumber: String,
      // Additional fields that were missing from schema
      fatherName: String,
      personalEmailId: String,
      officialEmailId: String,
      employeeCode: String,
      employmentStatus: String,
      dateOfJoining: Date,
      dobAsPerAadhaar: Date,
      profilePhoto: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      }
    },
    
    addressInfo: {
      currentAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String
      },
      permanentAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        sameAsCurrent: Boolean
      }
    },
    
    educationHistory: [{
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
      percentage: Number,
      cgpa: Number,
      description: String
    }],
    
    workExperience: {
      totalExperience: String,
      experienceDetails: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        salary: Number,
        reasonForLeaving: String,
        documents: {
          experienceLetters: [{
            id: String,
            name: String,
            size: Number,
            uploadedAt: Date,
            status: String
          }],
          relievingCertificate: [{
            id: String,
            name: String,
            size: Number,
            uploadedAt: Date,
            status: String
          }],
          salarySlips: [{
            id: String,
            name: String,
            size: Number,
            uploadedAt: Date,
            status: String
          }]
        }
      }]
    },
    
    emergencyContacts: [{
      name: String,
      relationship: String,
      phone: String,
      email: String,
      address: String
    }],

    bankDetails: [{
      ifscCode: String,
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      branch: String,
      pfEligible: String,
      uanNumber: String,
      isPrimary: Boolean
    }],
    
    additionalInfo: {
      hobbies: String,
      skills: String,
      languages: String,
      references: String,
      designation: String,
      department: String
    },
    
    // New fields for updated candidate portal
    educationQualifications: [{
      educationLevel: String,
      degree: String,
      institution: String,
      yearOfPassing: String,
      percentage: String,
      specialization: String,
      documents: [{
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String
      }]
    }],
    
    uploadedDocuments: [{
      id: String,
      type: String,
      name: String,
      size: Number,
      uploadedAt: Date,
      status: String
    }],

    // Government document images
    governmentDocuments: {
      aadhaarImage: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      },
      panImage: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      }
    },

    // Bank document images
    bankDocuments: {
      cancelledCheque: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      },
      passbook: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      },
      bankStatement: {
        id: String,
        name: String,
        size: Number,
        uploadedAt: Date,
        status: String,
        url: String
      }
    },

    // Education document images
    educationDocuments: [{
      id: { type: String },
      name: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date },
      status: { type: String },
      url: { type: String },
      filename: { type: String }
    }],

    // Work experience document images
    workExperienceDocuments: [{
      id: { type: String },
      name: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date },
      status: { type: String },
      url: { type: String },
      filename: { type: String },
      type: { type: String } // experienceLetters, relievingCertificate, salarySlips
    }]
  },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate employee ID if not provided - Use proper sequential numbering
onboardingSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    // Get all existing CODR employee IDs from both Onboarding and Employee collections
    const [onboardingIds, employeeIds] = await Promise.all([
      this.constructor.find(
        { employeeId: { $regex: /^CODR\d{3,4}$/ } },
        { employeeId: 1 }
      ),
      require('./Employee').find(
        { employeeId: { $regex: /^CODR\d{3,4}$/ } },
        { employeeId: 1 }
      )
    ]);
    
    let maxNumber = 0;
    
    // Extract numeric parts from both collections and find the maximum
    [...onboardingIds, ...employeeIds].forEach(record => {
      if (record.employeeId && record.employeeId.startsWith('CODR')) {
        const numericPart = parseInt(record.employeeId.replace('CODR', ''));
        if (!isNaN(numericPart) && numericPart > maxNumber) {
          maxNumber = numericPart;
        }
      }
    });
    
    // Ensure we start from at least 121 (after CODR120) and increment properly
    const nextNumber = Math.max(maxNumber + 1, 121);
    
    this.employeeId = `CODR${String(nextNumber).padStart(4, '0')}`;
    console.log(`🆔 Generated onboarding employee ID: ${this.employeeId} for ${this.employeeName} (highest existing: CODR${String(maxNumber).padStart(4, '0')})`);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to update step progress
onboardingSchema.methods.updateStepProgress = function(stepId, completed = true) {
  // Initialize stepProgress if it doesn't exist
  if (!this.stepProgress) {
    this.stepProgress = {};
  }
  
  // Initialize the specific step if it doesn't exist
  if (!this.stepProgress[stepId]) {
    this.stepProgress[stepId] = { completed: false, completedAt: null, status: 'pending' };
  }
  
  // Update step status and completion
  this.stepProgress[stepId].completed = completed;
  this.stepProgress[stepId].completedAt = completed ? new Date() : null;
  
  // Set step status based on completion and context
  if (completed) {
    this.stepProgress[stepId].status = 'completed';
  } else if (stepId === 'offer_letter' && this.offerLetter?.status === 'sent') {
    // Special case: offer letter is sent but not yet accepted
    this.stepProgress[stepId].status = 'in_progress';
  } else {
    this.stepProgress[stepId].status = 'pending';
  }
  
  // Calculate overall progress
  const steps = ['offer_letter', 'document_collection', 'background_verification', 'it_setup', 'hr_setup', 'orientation', 'manager_introduction', 'workspace_setup', 'training_schedule', 'completion'];
  
  // Initialize missing steps
  steps.forEach(step => {
    if (!this.stepProgress[step]) {
      this.stepProgress[step] = { completed: false, completedAt: null, status: 'pending' };
    }
  });
  
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => this.stepProgress[step] && this.stepProgress[step].completed).length;
  this.progress = Math.round((completedSteps / totalSteps) * 100);
  
  // Update status based on progress and current context
  if (this.progress === 100) {
    this.status = 'completed';
    this.currentStep = 'completed';
  } else if (stepId === 'offer_letter' && completed) {
    // Special case: when offer letter is accepted, status should be offer_accepted
    this.status = 'offer_accepted';
    // Find next incomplete step
    for (const step of steps) {
      if (!this.stepProgress[step] || !this.stepProgress[step].completed) {
        this.currentStep = step;
        break;
      }
    }
  } else if (stepId === 'offer_letter' && !completed) {
    // Special case: when offer letter is sent but not yet accepted
    this.status = 'offer_sent';
    this.currentStep = 'offer_letter';
  } else if (this.progress > 0) {
    this.status = 'in_progress';
    // Find next incomplete step
    for (const step of steps) {
      if (!this.stepProgress[step] || !this.stepProgress[step].completed) {
        this.currentStep = step;
        break;
      }
    }
  }
};

// Method to add task
onboardingSchema.methods.addTask = function(taskData) {
  const task = {
    id: new mongoose.Types.ObjectId().toString(),
    ...taskData
  };
  this.tasks.push(task);
  return task;
};

// Method to update task status
onboardingSchema.methods.updateTaskStatus = function(taskId, status, completedBy = null) {
  const task = this.tasks.id(taskId);
  if (task) {
    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
      task.completedBy = completedBy;
    }
  }
  return task;
};

// Virtual for full address
onboardingSchema.virtual('fullCurrentAddress').get(function() {
  const addr = this.currentAddress;
  if (!addr) return '';
  return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''} - ${addr.pincode || ''}`.trim();
});

// Pre-save validation to ensure offer_accepted status has valid signature
onboardingSchema.pre('save', function(next) {
  // If status is being set to offer_accepted, ensure there's a valid signature
  if (this.status === 'offer_accepted') {
    const hasValidSignature = this.offerLetter?.candidateSignature?.data && 
                             this.offerLetter?.candidateSignature?.name;
    
    if (!hasValidSignature) {
      console.warn(`⚠️  Preventing offer_accepted status for ${this.employeeId} without valid signature`);
      this.status = 'offer_sent';
      this.currentStep = 'offer_letter';
      if (this.offerLetter) {
        this.offerLetter.status = 'sent';
        this.offerLetter.acceptedAt = null;
      }
    }
  }
  next();
});

// Indexes for better performance
onboardingSchema.index({ employeeId: 1 });
onboardingSchema.index({ email: 1 });
onboardingSchema.index({ status: 1 });
onboardingSchema.index({ createdAt: -1 });
onboardingSchema.index({ department: 1 });

module.exports = mongoose.model('Onboarding', onboardingSchema);
