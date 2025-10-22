const mongoose = require('mongoose');

const probationFeedbackSchema = new mongoose.Schema({
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
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  managerName: String,
  department: String,
  designation: String,
  joiningDate: {
    type: Date,
    required: true
  },
  probationEndDate: {
    type: Date,
    required: true
  },
  
  // Employee Self-Assessment
  employeeFeedback: {
    submitted: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    
    // Learning & Development
    skillsAcquired: String,
    trainingEffectiveness: {
      type: Number,
      min: 1,
      max: 10
    },
    learningChallenges: String,
    additionalTrainingNeeds: String,
    
    // Job Performance
    achievementsSummary: String,
    challengesFaced: String,
    supportReceived: {
      type: Number,
      min: 1,
      max: 10
    },
    clarityOfExpectations: {
      type: Number,
      min: 1,
      max: 10
    },
    
    // Work Environment
    teamIntegration: {
      type: Number,
      min: 1,
      max: 10
    },
    workLifeBalance: {
      type: Number,
      min: 1,
      max: 10
    },
    resourcesAvailability: {
      type: Number,
      min: 1,
      max: 10
    },
    
    // Future Outlook
    careerGoals: String,
    improvementAreas: String,
    continuationInterest: {
      type: String,
      enum: ['strongly_interested', 'interested', 'neutral', 'considering_options', 'not_interested']
    },
    additionalComments: String
  },
  
  // Manager Assessment
  managerFeedback: {
    submitted: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    
    // Performance Evaluation
    technicalSkills: {
      type: Number,
      min: 1,
      max: 10
    },
    workQuality: {
      type: Number,
      min: 1,
      max: 10
    },
    productivity: {
      type: Number,
      min: 1,
      max: 10
    },
    learningAbility: {
      type: Number,
      min: 1,
      max: 10
    },
    
    // Behavioral Assessment
    communication: {
      type: Number,
      min: 1,
      max: 10
    },
    teamwork: {
      type: Number,
      min: 1,
      max: 10
    },
    initiative: {
      type: Number,
      min: 1,
      max: 10
    },
    reliability: {
      type: Number,
      min: 1,
      max: 10
    },
    adaptability: {
      type: Number,
      min: 1,
      max: 10
    },
    
    // Overall Assessment
    keyStrengths: String,
    areasForImprovement: String,
    trainingRecommendations: String,
    specificAchievements: String,
    concernsOrIssues: String,
    
    // Recommendation
    recommendation: {
      type: String,
      enum: ['confirm', 'extend_probation', 'terminate'],
      required: true
    },
    extensionReason: String,
    extensionPeriod: Number, // in months
    confirmationComments: String,
    
    // Future Planning
    roleExpectations: String,
    developmentPlan: String
  },
  
  // Overall Status
  status: {
    type: String,
    enum: ['pending', 'employee_completed', 'manager_completed', 'both_completed', 'reviewed'],
    default: 'pending'
  },
  
  // Notifications
  notificationsSent: {
    employeeNotified: {
      type: Boolean,
      default: false
    },
    managerNotified: {
      type: Boolean,
      default: false
    },
    employeeReminderSent: {
      type: Boolean,
      default: false
    },
    managerReminderSent: {
      type: Boolean,
      default: false
    }
  },
  
  // HR Review
  hrReview: {
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    finalDecision: {
      type: String,
      enum: ['confirmed', 'extended', 'terminated']
    },
    hrComments: String
  }
  
}, {
  timestamps: true
});

// Indexes for faster queries
probationFeedbackSchema.index({ employee: 1, createdAt: -1 });
probationFeedbackSchema.index({ manager: 1, status: 1 });
probationFeedbackSchema.index({ status: 1, createdAt: -1 });
probationFeedbackSchema.index({ probationEndDate: 1 });

// Virtual for completion percentage
probationFeedbackSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  if (this.employeeFeedback.submitted) completed += 50;
  if (this.managerFeedback.submitted) completed += 50;
  return completed;
});

// Method to check if both feedbacks are completed
probationFeedbackSchema.methods.areBothCompleted = function() {
  return this.employeeFeedback.submitted && this.managerFeedback.submitted;
};

// Method to update status
probationFeedbackSchema.methods.updateStatus = function() {
  if (this.employeeFeedback.submitted && this.managerFeedback.submitted) {
    this.status = 'both_completed';
  } else if (this.managerFeedback.submitted) {
    this.status = 'manager_completed';
  } else if (this.employeeFeedback.submitted) {
    this.status = 'employee_completed';
  } else {
    this.status = 'pending';
  }
};

// Pre-save hook to auto-update status
probationFeedbackSchema.pre('save', function(next) {
  if (this.isModified('employeeFeedback.submitted') || this.isModified('managerFeedback.submitted')) {
    this.updateStatus();
  }
  next();
});

const ProbationFeedback = mongoose.model('ProbationFeedback', probationFeedbackSchema);

module.exports = ProbationFeedback;


