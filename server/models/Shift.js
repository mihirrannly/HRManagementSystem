const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  
  // Timing Configuration
  startTime: {
    type: String, // Format: "HH:mm" (24-hour format)
    required: true
  },
  endTime: {
    type: String, // Format: "HH:mm" (24-hour format)
    required: true
  },
  
  // Break Configuration
  breaks: [{
    name: {
      type: String,
      required: true
    },
    startTime: {
      type: String, // Format: "HH:mm"
      required: true
    },
    endTime: {
      type: String, // Format: "HH:mm"
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    isPaid: {
      type: Boolean,
      default: true
    },
    isFlexible: {
      type: Boolean,
      default: false
    }
  }],
  
  // Working Days Configuration
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  
  // Flexibility Settings
  flexibility: {
    allowEarlyCheckIn: {
      type: Boolean,
      default: false
    },
    earlyCheckInBuffer: {
      type: Number, // in minutes
      default: 0
    },
    allowLateCheckIn: {
      type: Boolean,
      default: false
    },
    lateCheckInBuffer: {
      type: Number, // in minutes
      default: 15
    },
    allowEarlyCheckOut: {
      type: Boolean,
      default: false
    },
    earlyCheckOutBuffer: {
      type: Number, // in minutes
      default: 0
    },
    allowLateCheckOut: {
      type: Boolean,
      default: true
    },
    lateCheckOutBuffer: {
      type: Number, // in minutes
      default: 60
    },
    flexibleBreaks: {
      type: Boolean,
      default: false
    }
  },
  
  // Overtime Configuration
  overtime: {
    enabled: {
      type: Boolean,
      default: true
    },
    dailyThreshold: {
      type: Number, // in hours
      default: 8
    },
    weeklyThreshold: {
      type: Number, // in hours
      default: 40
    },
    multiplier: {
      type: Number,
      default: 1.5
    },
    requiresApproval: {
      type: Boolean,
      default: true
    }
  },
  
  // Location Settings
  location: {
    type: {
      type: String,
      enum: ['office', 'remote', 'hybrid', 'field'],
      default: 'office'
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    radius: {
      type: Number, // in meters
      default: 100
    }
  },
  
  // Holiday Configuration
  holidayPolicy: {
    includeWeekends: {
      type: Boolean,
      default: false
    },
    includePublicHolidays: {
      type: Boolean,
      default: true
    },
    customHolidays: [{
      name: String,
      date: Date,
      recurring: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#1976d2'
  },
  
  // Audit Fields
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

// Calculate total working hours
shiftSchema.virtual('totalHours').get(function() {
  const start = this.startTime.split(':');
  const end = this.endTime.split(':');
  
  let startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  let endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalMinutes = endMinutes - startMinutes;
  
  // Subtract break time
  const breakMinutes = this.breaks.reduce((total, brk) => {
    return total + (brk.isPaid ? 0 : brk.duration);
  }, 0);
  
  return Math.round(((totalMinutes - breakMinutes) / 60) * 100) / 100;
});

// Calculate break duration
shiftSchema.virtual('totalBreakTime').get(function() {
  return this.breaks.reduce((total, brk) => total + brk.duration, 0);
});

// Pre-save middleware
shiftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure only one default shift
  if (this.isDefault) {
    this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    ).exec();
  }
  
  next();
});

// Indexes
shiftSchema.index({ code: 1 }, { unique: true });
shiftSchema.index({ isActive: 1 });
shiftSchema.index({ isDefault: 1 });
shiftSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
