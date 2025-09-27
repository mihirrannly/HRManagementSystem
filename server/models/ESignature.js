const mongoose = require('mongoose');

// E-Signature Document Template Schema
const documentTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['offer_letter', 'employment_contract', 'nda', 'policy_acknowledgment', 'handbook_acknowledgment', 'other'],
    required: true
  },
  templateContent: {
    type: String, // HTML or plain text content
    required: true
  },
  fields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'signature', 'date', 'checkbox', 'dropdown']
    },
    required: Boolean,
    placeholder: String,
    options: [String], // For dropdown fields
    position: {
      x: Number,
      y: Number,
      page: Number
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// E-Signature Document Schema
const eSignatureDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Document Source
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate'
  },
  originalDocumentUrl: String, // URL to the original document
  finalDocumentUrl: String,    // URL to the signed document
  
  // Recipients (Signers)
  recipients: [{
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['signer', 'cc', 'approver'],
      default: 'signer'
    },
    order: {
      type: Number,
      default: 1
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    onboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Onboarding'
    }
  }],
  
  // E-Signature Provider Integration
  provider: {
    type: String,
    enum: ['docusign', 'dropbox_sign', 'internal'],
    default: 'internal'
  },
  providerEnvelopeId: String,    // DocuSign envelope ID or Dropbox Sign signature request ID
  providerDocumentId: String,    // Provider-specific document ID
  
  // Document Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'in_progress', 'completed', 'declined', 'cancelled', 'expired'],
    default: 'draft'
  },
  
  // Timestamps
  sentAt: Date,
  completedAt: Date,
  expiresAt: Date,
  
  // Signature Details
  signatures: [{
    recipientEmail: String,
    recipientName: String,
    signedAt: Date,
    signatureData: String,      // Base64 signature image
    ipAddress: String,
    userAgent: String,
    method: {
      type: String,
      enum: ['draw', 'type', 'upload', 'provider'],
      default: 'draw'
    },
    providerSignatureId: String // Provider-specific signature ID
  }],
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'sent', 'viewed', 'signed', 'declined', 'completed', 'cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    actor: {
      email: String,
      name: String,
      ipAddress: String,
      userAgent: String
    },
    details: String
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  tags: [String],
  customFields: [{
    name: String,
    value: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// E-Signature Configuration Schema
const eSignatureConfigSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Provider Configurations
  providers: {
    docusign: {
      enabled: {
        type: Boolean,
        default: false
      },
      integrationKey: String,
      secretKey: String,
      accountId: String,
      baseUrl: String,
      redirectUrl: String
    },
    dropboxSign: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: String,
      clientId: String,
      testMode: {
        type: Boolean,
        default: true
      }
    },
    internal: {
      enabled: {
        type: Boolean,
        default: true
      },
      requireDrawnSignature: {
        type: Boolean,
        default: false
      },
      allowTypedSignature: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Default Settings
  defaultExpiryDays: {
    type: Number,
    default: 30
  },
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    firstReminderDays: {
      type: Number,
      default: 3
    },
    subsequentReminderDays: {
      type: Number,
      default: 7
    }
  },
  
  // Branding
  branding: {
    companyName: String,
    logo: String,
    primaryColor: String,
    emailFromName: String,
    emailFromAddress: String
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

// Indexes for performance
documentTemplateSchema.index({ category: 1, isActive: 1 });
eSignatureDocumentSchema.index({ status: 1, createdAt: -1 });
eSignatureDocumentSchema.index({ 'recipients.email': 1 });
eSignatureDocumentSchema.index({ providerEnvelopeId: 1 });
eSignatureDocumentSchema.index({ createdBy: 1, createdAt: -1 });

// Pre-save middleware to update timestamps
documentTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

eSignatureDocumentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

eSignatureConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
eSignatureDocumentSchema.methods.addAuditEntry = function(action, actor, details) {
  this.auditTrail.push({
    action,
    actor,
    details,
    timestamp: new Date()
  });
};

eSignatureDocumentSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

eSignatureDocumentSchema.methods.canSign = function(email) {
  const recipient = this.recipients.find(r => r.email === email);
  return recipient && this.status === 'sent' && !this.isExpired();
};

// Create models
const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema);
const ESignatureDocument = mongoose.model('ESignatureDocument', eSignatureDocumentSchema);
const ESignatureConfig = mongoose.model('ESignatureConfig', eSignatureConfigSchema);

module.exports = {
  DocumentTemplate,
  ESignatureDocument,
  ESignatureConfig
};
