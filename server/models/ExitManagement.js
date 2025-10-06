const mongoose = require('mongoose');

const exitManagementSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  // Exit Details
  exitType: {
    type: String,
    enum: ['resignation', 'termination', 'retirement', 'contract_end', 'layoff', 'death', 'other'],
    required: true
  },
  resignationDate: Date,
  lastWorkingDate: {
    type: Date,
    required: true
  },
  noticePeriod: {
    type: Number, // in days
    default: 0
  },
  reasonForLeaving: {
    type: String,
    required: true
  },
  detailedReason: String,

  // Exit Process Status
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'pending_clearance', 'pending_approval', 'completed', 'cancelled'],
    default: 'initiated'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initiatedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: Date,

  // Clearance Checklist
  clearance: {
    // IT Clearance
    itClearance: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String,
      items: [{
        item: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'not_applicable'],
          default: 'pending'
        },
        notes: String
      }]
    },

    // HR Clearance
    hrClearance: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String,
      items: [{
        item: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'not_applicable'],
          default: 'pending'
        },
        notes: String
      }]
    },

    // Finance Clearance
    financeClearance: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String,
      items: [{
        item: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'not_applicable'],
          default: 'pending'
        },
        notes: String
      }]
    },

    // Manager Clearance
    managerClearance: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String,
      items: [{
        item: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'not_applicable'],
          default: 'pending'
        },
        notes: String
      }]
    },

    // Admin Clearance
    adminClearance: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String,
      items: [{
        item: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'not_applicable'],
          default: 'pending'
        },
        notes: String
      }]
    }
  },

  // Financial Settlement
  financialSettlement: {
    // Salary Information
    lastSalary: {
      basic: Number,
      hra: Number,
      allowances: Number,
      grossSalary: Number,
      ctc: Number
    },
    
    // Outstanding Payments
    outstandingPayments: {
      pendingSalary: Number,
      bonus: Number,
      incentives: Number,
      overtime: Number,
      other: Number,
      total: Number
    },

    // Deductions
    deductions: {
      advanceSalary: Number,
      loanDeduction: Number,
      taxDeduction: Number,
      otherDeductions: Number,
      total: Number
    },

    // Final Settlement
    finalSettlement: {
      grossAmount: Number,
      totalDeductions: Number,
      netAmount: Number,
      paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'cheque', 'cash'],
        default: 'bank_transfer'
      },
      paymentDate: Date,
      paymentReference: String,
      status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
      }
    },

    // Benefits
    benefits: {
      gratuity: Number,
      providentFund: Number,
      leaveEncashment: Number,
      medicalBenefits: Number,
      otherBenefits: Number,
      total: Number
    }
  },

  // Asset Return
  assets: [{
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    assetName: String,
    assetType: String,
    serialNumber: String,
    assignedDate: Date,
    returnDate: Date,
    condition: {
      type: String,
      enum: ['good', 'fair', 'poor', 'damaged', 'lost'],
      default: 'good'
    },
    returnStatus: {
      type: String,
      enum: ['pending', 'returned', 'not_returned', 'damaged', 'lost'],
      default: 'pending'
    },
    notes: String,
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Document Collection
  documents: [{
    documentType: {
      type: String,
      enum: ['id_card', 'access_card', 'laptop', 'mobile', 'keys', 'uniform', 'certificate', 'other']
    },
    documentName: String,
    returnStatus: {
      type: String,
      enum: ['pending', 'returned', 'not_returned', 'lost'],
      default: 'pending'
    },
    returnDate: Date,
    notes: String,
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Knowledge Transfer
  knowledgeTransfer: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'not_required'],
      default: 'pending'
    },
    handoverTo: [{
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      employeeName: String,
      responsibilities: [String],
      handoverDate: Date,
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }],
    documentation: [{
      documentName: String,
      documentType: String,
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      },
      notes: String
    }],
    trainingProvided: [{
      topic: String,
      trainee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      traineeName: String,
      trainingDate: Date,
      duration: Number, // in hours
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }]
  },

  // Exit Interview
  exitInterview: {
    conducted: {
      type: Boolean,
      default: false
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    conductedDate: Date,
    interviewType: {
      type: String,
      enum: ['face_to_face', 'phone', 'online', 'written'],
      default: 'face_to_face'
    },
    responses: [{
      question: String,
      answer: String,
      category: {
        type: String,
        enum: ['work_environment', 'management', 'compensation', 'growth', 'work_life_balance', 'other']
      }
    }],
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    recommendations: String,
    rehireEligible: {
      type: Boolean,
      default: true
    },
    rehireNotes: String
  },

  // Exit Survey
  exitSurvey: {
    submitted: {
      type: Boolean,
      default: false
    },
    submittedDate: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Section 1: Compensation & Benefits
    compensationBenefits: {
      remunerationSatisfaction: {
        type: Number,
        min: 1,
        max: 10
      },
      achievementsRecognized: {
        type: String,
        enum: ['Yes', 'No']
      },
      recognitionFrequency: {
        type: Number,
        min: 1,
        max: 10
      },
      constructiveFeedback: {
        type: String,
        enum: ['Yes', 'No']
      }
    },
    // Section 2: Team and Work Environment
    workEnvironment: {
      trainingSatisfaction: {
        type: Number,
        min: 1,
        max: 10
      },
      workLifeBalance: {
        type: Number,
        min: 1,
        max: 10
      },
      skillsUtilization: {
        type: Number,
        min: 1,
        max: 10
      },
      jobHappiness: {
        type: Number,
        min: 1,
        max: 10
      },
      managerTreatment: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    // Section 3: Organization Culture
    organizationCulture: {
      companyHappiness: {
        type: Number,
        min: 1,
        max: 10
      },
      recommendLikelihood: {
        type: Number,
        min: 1,
        max: 10
      },
      rehireConsideration: {
        type: String,
        enum: ['Yes', 'No']
      }
    },
    // Section 4: Trigger/Reason
    triggerReason: {
      leavingReason: String,
      concernsShared: {
        type: String,
        enum: ['Yes', 'No']
      },
      improvementSuggestions: String,
      futureContact: {
        type: String,
        enum: ['Yes', 'No']
      }
    }
  },

  // Legal and Compliance
  legalCompliance: {
    nonDisclosureAgreement: {
      signed: Boolean,
      signedDate: Date,
      documentPath: String
    },
    nonCompeteAgreement: {
      signed: Boolean,
      signedDate: Date,
      documentPath: String,
      validityPeriod: Number // in months
    },
    confidentialityAgreement: {
      signed: Boolean,
      signedDate: Date,
      documentPath: String
    },
    dataProtectionCompliance: {
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      },
      clearedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      clearedDate: Date,
      notes: String
    }
  },

  // System Access Revocation
  systemAccess: {
    emailAccess: {
      revoked: Boolean,
      revokedDate: Date,
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    systemAccess: {
      revoked: Boolean,
      revokedDate: Date,
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    physicalAccess: {
      revoked: Boolean,
      revokedDate: Date,
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    phoneAccess: {
      revoked: Boolean,
      revokedDate: Date,
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },

  // Final Checklist
  finalChecklist: {
    allClearancesCompleted: {
      type: Boolean,
      default: false
    },
    assetsReturned: {
      type: Boolean,
      default: false
    },
    documentsCollected: {
      type: Boolean,
      default: false
    },
    knowledgeTransferCompleted: {
      type: Boolean,
      default: false
    },
    exitInterviewCompleted: {
      type: Boolean,
      default: false
    },
    legalComplianceCompleted: {
      type: Boolean,
      default: false
    },
    systemAccessRevoked: {
      type: Boolean,
      default: false
    },
    finalSettlementProcessed: {
      type: Boolean,
      default: false
    }
  },

  // Additional Information
  notes: String,
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit Trail
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
    },
    notes: String
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
exitManagementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
exitManagementSchema.index({ employee: 1 });
exitManagementSchema.index({ employeeId: 1 });
exitManagementSchema.index({ status: 1 });
exitManagementSchema.index({ lastWorkingDate: 1 });
exitManagementSchema.index({ exitType: 1 });
exitManagementSchema.index({ createdAt: -1 });

// Virtual for completion percentage
exitManagementSchema.virtual('completionPercentage').get(function() {
  const checklist = this.finalChecklist;
  const totalItems = Object.keys(checklist).length;
  const completedItems = Object.values(checklist).filter(Boolean).length;
  return Math.round((completedItems / totalItems) * 100);
});

// Virtual for days until last working date
exitManagementSchema.virtual('daysUntilExit').get(function() {
  if (!this.lastWorkingDate) return null;
  const today = new Date();
  const exitDate = new Date(this.lastWorkingDate);
  const diffTime = exitDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model('ExitManagement', exitManagementSchema);
