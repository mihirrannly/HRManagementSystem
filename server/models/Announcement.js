const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'policy', 'event', 'update', 'urgent', 'celebration'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'department', 'location', 'role'],
    default: 'all'
  },
  targetDepartments: [{
    type: String
  }],
  targetLocations: [{
    type: String
  }],
  targetRoles: [{
    type: String,
    enum: ['admin', 'hr', 'manager', 'employee']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  // Poll functionality
  isPoll: {
    type: Boolean,
    default: false
  },
  pollOptions: [{
    option: {
      type: String,
      required: function() { return this.isPoll; }
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  pollMultipleChoice: {
    type: Boolean,
    default: false
  },
  // Engagement tracking
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'celebrate', 'support', 'insightful']
    },
    reactedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ priority: 1, isActive: 1 });
announcementSchema.index({ isPinned: 1, isActive: 1 });

// Method to check if announcement is visible to user
announcementSchema.methods.isVisibleToUser = function(user, employee) {
  // Check if announcement is active
  if (!this.isActive) return false;
  
  // Check date range
  const now = new Date();
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  
  // Check target audience
  if (this.targetAudience === 'all') return true;
  
  if (this.targetAudience === 'role' && this.targetRoles.length > 0) {
    return this.targetRoles.includes(user.role);
  }
  
  if (employee) {
    if (this.targetAudience === 'department' && this.targetDepartments.length > 0) {
      return this.targetDepartments.includes(employee.employmentDetails?.department);
    }
    
    if (this.targetAudience === 'location' && this.targetLocations.length > 0) {
      return this.targetLocations.includes(employee.employmentDetails?.location);
    }
  }
  
  return true;
};

// Method to check if user has voted
announcementSchema.methods.hasUserVoted = function(userId) {
  if (!this.isPoll) return false;
  
  return this.pollOptions.some(option => 
    option.votes.some(vote => vote.user.toString() === userId.toString())
  );
};

// Method to get poll results
announcementSchema.methods.getPollResults = function() {
  if (!this.isPoll) return null;
  
  const totalVotes = this.pollOptions.reduce((sum, option) => sum + option.votes.length, 0);
  
  return this.pollOptions.map(option => ({
    option: option.option,
    votes: option.votes.length,
    percentage: totalVotes > 0 ? ((option.votes.length / totalVotes) * 100).toFixed(1) : 0
  }));
};

module.exports = mongoose.model('Announcement', announcementSchema);

