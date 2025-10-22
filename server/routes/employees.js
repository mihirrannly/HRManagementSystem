const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { authenticate, authorize, canAccessEmployee, canAccessEmployeeWithFilter } = require('../middleware/auth');
const { uploads, getFileUrl } = require('../middleware/s3Upload');

const router = express.Router();

// Use S3-enabled upload middleware
const upload = uploads.employee;

// @route   GET /api/employees/birthdays
// @desc    Get employee birthdays (current month and upcoming)
// @access  Private (All authenticated users)
router.get('/birthdays', authenticate, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;

    // Get all active employees with birthdays
    const employees = await Employee.find({
      'employmentInfo.isActive': true,
      'personalInfo.dateOfBirth': { $exists: true }
    })
      .select('personalInfo.firstName personalInfo.lastName personalInfo.dateOfBirth employeeId')
      .lean();

    const thisMonthBirthdays = [];
    const upcomingBirthdays = [];

    employees.forEach(employee => {
      const birthDate = new Date(employee.personalInfo.dateOfBirth);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      // Calculate age
      let age = currentYear - birthDate.getFullYear();
      
      // Check if birthday is this month
      if (birthMonth === currentMonth) {
        const birthdayThisYear = new Date(currentYear, birthMonth, birthDay);
        // Adjust age if birthday hasn't happened yet this year
        if (birthdayThisYear > currentDate) {
          age--;
        }
        thisMonthBirthdays.push({
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          age: age + 1, // Age they'll be/are this year
          birthdayDate: birthdayThisYear,
          dateOfBirth: employee.personalInfo.dateOfBirth
        });
      }
      // Check if birthday is next month
      else if (birthMonth === nextMonth) {
        const birthdayNextMonth = new Date(nextMonth === 0 ? currentYear + 1 : currentYear, birthMonth, birthDay);
        upcomingBirthdays.push({
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          age: nextMonth === 0 ? age + 1 : age + 1,
          birthdayDate: birthdayNextMonth,
          dateOfBirth: employee.personalInfo.dateOfBirth
        });
      }
    });

    // Sort by date
    thisMonthBirthdays.sort((a, b) => a.birthdayDate - b.birthdayDate);
    upcomingBirthdays.sort((a, b) => a.birthdayDate - b.birthdayDate);

    res.json({
      success: true,
      thisMonth: thisMonthBirthdays,
      upcoming: upcomingBirthdays
    });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch birthdays',
      error: error.message
    });
  }
});

// @route   GET /api/employees/anniversaries
// @desc    Get work anniversaries (current month and upcoming)
// @access  Private (All authenticated users)
router.get('/anniversaries', authenticate, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;

    // Get all active employees
    const employees = await Employee.find({
      'employmentInfo.isActive': true,
      'employmentInfo.dateOfJoining': { $exists: true }
    })
      .select('personalInfo.firstName personalInfo.lastName employmentInfo.dateOfJoining employeeId')
      .lean();

    const thisMonthAnniversaries = [];
    const upcomingAnniversaries = [];

    employees.forEach(employee => {
      const joiningDate = new Date(employee.employmentInfo.dateOfJoining);
      const joiningMonth = joiningDate.getMonth();
      const joiningDay = joiningDate.getDate();
      
      // Calculate years of service
      const yearsOfService = currentYear - joiningDate.getFullYear();
      
      // Skip if less than 1 year
      if (yearsOfService < 1) return;
      
      // Check if anniversary is this month
      if (joiningMonth === currentMonth) {
        const anniversaryDate = new Date(currentYear, joiningMonth, joiningDay);
        thisMonthAnniversaries.push({
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          yearsOfService,
          anniversaryDate,
          joiningDate: employee.employmentInfo.dateOfJoining
        });
      }
      // Check if anniversary is next month
      else if (joiningMonth === nextMonth) {
        const anniversaryDate = new Date(nextMonthYear, joiningMonth, joiningDay);
        upcomingAnniversaries.push({
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          yearsOfService,
          anniversaryDate,
          joiningDate: employee.employmentInfo.dateOfJoining
        });
      }
    });

    // Sort by date
    thisMonthAnniversaries.sort((a, b) => a.anniversaryDate - b.anniversaryDate);
    upcomingAnniversaries.sort((a, b) => a.anniversaryDate - b.anniversaryDate);

    res.json({
      success: true,
      thisMonth: thisMonthAnniversaries,
      upcoming: upcomingAnniversaries
    });
  } catch (error) {
    console.error('Error fetching anniversaries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anniversaries',
      error: error.message
    });
  }
});

// @route   GET /api/employees/on-probation
// @desc    Get employees currently on probation (within first 3 months from joining)
// @access  Private (All authenticated users)
router.get('/on-probation', authenticate, async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Calculate the date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Get all active employees who joined within the last 3 months
    const employees = await Employee.find({
      'employmentInfo.isActive': true,
      'employmentInfo.dateOfJoining': { 
        $exists: true,
        $gte: threeMonthsAgo,
        $lte: currentDate
      }
    })
      .select('personalInfo.firstName personalInfo.lastName employmentInfo.dateOfJoining employmentInfo.designation employmentInfo.department employeeId profilePicture')
      .populate('employmentInfo.department', 'name')
      .lean();

    // Calculate days remaining in probation for each employee
    const probationEmployees = employees.map(employee => {
      const joiningDate = new Date(employee.employmentInfo.dateOfJoining);
      
      // Calculate probation end date (3 months from joining)
      const probationEndDate = new Date(joiningDate);
      probationEndDate.setMonth(probationEndDate.getMonth() + 3);
      
      // Calculate days remaining
      const timeDiff = probationEndDate - currentDate;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      // Calculate days completed in probation
      const timeSinceJoining = currentDate - joiningDate;
      const daysCompleted = Math.floor(timeSinceJoining / (1000 * 60 * 60 * 24));
      
      return {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        firstName: employee.personalInfo.firstName,
        lastName: employee.personalInfo.lastName,
        designation: employee.employmentInfo.designation,
        department: employee.employmentInfo.department?.name || 'N/A',
        joiningDate: employee.employmentInfo.dateOfJoining,
        probationEndDate: probationEndDate,
        daysRemaining: Math.max(0, daysRemaining),
        daysCompleted,
        profilePicture: employee.profilePicture
      };
    });

    // Sort by days remaining (ascending)
    probationEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.json({
      success: true,
      count: probationEmployees.length,
      employees: probationEmployees
    });
  } catch (error) {
    console.error('Error fetching probation employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch probation employees',
      error: error.message
    });
  }
});

// @route   GET /api/employees/user/:userId
// @desc    Get employee and user details by user ID
// @access  Private
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch user details
    const user = await User.findById(userId).select('email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Fetch employee details if exists
    const employee = await Employee.findOne({ user: userId })
      .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department employmentInfo.designation profilePicture');
    
    res.json({
      success: true,
      user,
      employee
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// @route   GET /api/employees
// @desc    Get all employees with filtering, sorting, and pagination
// @access  Private (HR, Admin, Manager)
router.get('/', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 10000 }),
  query('department').optional().isMongoId(),
  query('isActive').optional().isBoolean(),
  query('search').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    let filter = {};
    
    // Default to showing only active employees unless explicitly requested otherwise
    if (req.query.isActive !== undefined) {
      filter['employmentInfo.isActive'] = req.query.isActive === 'true';
    } else {
      // By default, only show active employees
      filter['employmentInfo.isActive'] = true;
    }
    
    if (req.query.department) {
      filter['employmentInfo.department'] = req.query.department;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex },
        { employeeId: searchRegex },
        { 'employmentInfo.designation': searchRegex }
      ];
    }

    // If user is a manager, only show their team
    if (req.user.role === 'manager') {
      const managerEmployee = await Employee.findOne({ user: req.user._id });
      if (managerEmployee) {
        filter['employmentInfo.reportingManager'] = managerEmployee._id;
      }
    }

    const employees = await Employee.find(filter)
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive')
      .select('employeeId personalInfo contactInfo employmentInfo salaryInfo additionalInfo profilePicture user createdAt updatedAt')
      .sort({ 'personalInfo.firstName': 1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    // Determine access level for filtering
    let accessLevel = 'self';
    if (['admin', 'hr'].includes(req.user.role)) {
      accessLevel = 'full';
    } else if (req.user.role === 'manager') {
      accessLevel = 'manager';
    }

    // Return employees with full data (no filtering)
    res.json({
      employees: employees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/me
// @desc    Get current user's employee data
// @access  Private (Employee)
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log('🔍 /me endpoint hit, user ID:', req.user._id);
    
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    console.log('📋 Employee found:', employee ? employee.employeeId : 'Not found');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Check if we have onboarding data and sync documents if needed
    if (employee.additionalInfo?.onboardingId) {
      try {
        const Onboarding = require('../models/Onboarding');
        const onboarding = await Onboarding.findById(employee.additionalInfo.onboardingId);
        
        if (onboarding && onboarding.candidatePortal) {
          console.log('🔍 Found onboarding data, checking for candidate portal documents...');
          
          // Collect all documents from candidate portal
          const candidatePortalDocuments = [];
          
          // Add government documents
          if (onboarding.candidatePortal.governmentDocuments) {
            Object.entries(onboarding.candidatePortal.governmentDocuments).forEach(([type, doc]) => {
              if (doc && doc.url) {
                candidatePortalDocuments.push({
                  type: type === 'aadhaarImage' ? 'id-proof' : type === 'panImage' ? 'id-proof' : 'other',
                  name: doc.name || `${type} Document`,
                  filePath: doc.url,
                  uploadedAt: doc.uploadedAt || new Date(),
                  source: 'candidate-portal'
                });
              }
            });
          }
          
          // Add bank documents
          if (onboarding.candidatePortal.bankDocuments) {
            Object.entries(onboarding.candidatePortal.bankDocuments).forEach(([type, doc]) => {
              if (doc && doc.url) {
                candidatePortalDocuments.push({
                  type: 'other',
                  name: doc.name || `${type} Document`,
                  filePath: doc.url,
                  uploadedAt: doc.uploadedAt || new Date(),
                  source: 'candidate-portal'
                });
              }
            });
          }
          
          // Add education documents
          if (onboarding.candidatePortal.educationDocuments) {
            onboarding.candidatePortal.educationDocuments.forEach(doc => {
              if (doc && doc.url) {
                candidatePortalDocuments.push({
                  type: 'educational',
                  name: doc.name || 'Education Document',
                  filePath: doc.url,
                  uploadedAt: doc.uploadedAt || new Date(),
                  source: 'candidate-portal'
                });
              }
            });
          }
          
          // Add work experience documents
          if (onboarding.candidatePortal.workExperienceDocuments) {
            onboarding.candidatePortal.workExperienceDocuments.forEach(doc => {
              if (doc && doc.url) {
                candidatePortalDocuments.push({
                  type: 'experience',
                  name: doc.name || 'Work Experience Document',
                  filePath: doc.url,
                  uploadedAt: doc.uploadedAt || new Date(),
                  source: 'candidate-portal'
                });
              }
            });
          }
          
          // Add profile photo
          if (onboarding.candidatePortal.personalInfo?.profilePhoto?.url) {
            candidatePortalDocuments.push({
              type: 'other',
              name: 'Profile Photo',
              filePath: onboarding.candidatePortal.personalInfo.profilePhoto.url,
              uploadedAt: onboarding.candidatePortal.personalInfo.profilePhoto.uploadedAt || new Date(),
              source: 'candidate-portal'
            });
            
            // Also set the profile picture in personalInfo for easy access
            if (!employee.personalInfo) {
              employee.personalInfo = {};
            }
            employee.personalInfo.profilePicture = onboarding.candidatePortal.personalInfo.profilePhoto.url;
          }
          
          console.log(`📄 Found ${candidatePortalDocuments.length} documents from candidate portal`);
          
          // Merge with existing employee documents, avoiding duplicates
          const existingDocPaths = new Set(employee.documents.map(doc => doc.filePath));
          const newDocuments = candidatePortalDocuments.filter(doc => !existingDocPaths.has(doc.filePath));
          
          if (newDocuments.length > 0) {
            console.log(`📄 Adding ${newDocuments.length} new documents to employee profile`);
            employee.documents = [...employee.documents, ...newDocuments];
            
            // Update additional info to track the sync
            employee.additionalInfo = {
              ...employee.additionalInfo,
              lastDocumentSync: new Date(),
              candidatePortalDocumentsCount: candidatePortalDocuments.length
            };
            
            await employee.save();
            console.log('✅ Documents synced successfully');
          }
        }
      } catch (syncError) {
        console.error('⚠️ Error syncing candidate portal documents:', syncError);
        // Don't fail the request if sync fails
      }
    }

    res.json(employee);
  } catch (error) {
    console.error('Get my employee data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees/sync-documents
// @desc    Manually sync candidate portal documents to employee profile
// @access  Private (HR, Admin)
router.post('/sync-documents', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    const employee = await Employee.findOne({ employeeId })
      .populate('user', 'email role');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    if (!employee.additionalInfo?.onboardingId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No onboarding data found for this employee' 
      });
    }

    const Onboarding = require('../models/Onboarding');
    const onboarding = await Onboarding.findById(employee.additionalInfo.onboardingId);
    
    if (!onboarding || !onboarding.candidatePortal) {
      return res.status(404).json({ 
        success: false, 
        message: 'No candidate portal data found' 
      });
    }

    console.log(`🔄 Manually syncing documents for employee: ${employeeId}`);
    
    // Collect all documents from candidate portal
    const candidatePortalDocuments = [];
    
    // Add government documents
    if (onboarding.candidatePortal.governmentDocuments) {
      Object.entries(onboarding.candidatePortal.governmentDocuments).forEach(([type, doc]) => {
        if (doc && doc.url) {
          candidatePortalDocuments.push({
            type: type === 'aadhaarImage' ? 'id-proof' : type === 'panImage' ? 'id-proof' : 'other',
            name: doc.name || `${type} Document`,
            filePath: doc.url,
            uploadedAt: doc.uploadedAt || new Date(),
            source: 'candidate-portal'
          });
        }
      });
    }
    
    // Add bank documents
    if (onboarding.candidatePortal.bankDocuments) {
      Object.entries(onboarding.candidatePortal.bankDocuments).forEach(([type, doc]) => {
        if (doc && doc.url) {
          candidatePortalDocuments.push({
            type: 'other',
            name: doc.name || `${type} Document`,
            filePath: doc.url,
            uploadedAt: doc.uploadedAt || new Date(),
            source: 'candidate-portal'
          });
        }
      });
    }
    
    // Add education documents
    if (onboarding.candidatePortal.educationDocuments) {
      onboarding.candidatePortal.educationDocuments.forEach(doc => {
        if (doc && doc.url) {
          candidatePortalDocuments.push({
            type: 'educational',
            name: doc.name || 'Education Document',
            filePath: doc.url,
            uploadedAt: doc.uploadedAt || new Date(),
            source: 'candidate-portal'
          });
        }
      });
    }
    
    // Add work experience documents
    if (onboarding.candidatePortal.workExperienceDocuments) {
      onboarding.candidatePortal.workExperienceDocuments.forEach(doc => {
        if (doc && doc.url) {
          candidatePortalDocuments.push({
            type: 'experience',
            name: doc.name || 'Work Experience Document',
            filePath: doc.url,
            uploadedAt: doc.uploadedAt || new Date(),
            source: 'candidate-portal'
          });
        }
      });
    }
    
    // Add profile photo
    if (onboarding.candidatePortal.personalInfo?.profilePhoto?.url) {
      candidatePortalDocuments.push({
        type: 'other',
        name: 'Profile Photo',
        filePath: onboarding.candidatePortal.personalInfo.profilePhoto.url,
        uploadedAt: onboarding.candidatePortal.personalInfo.profilePhoto.uploadedAt || new Date(),
        source: 'candidate-portal'
      });
      
      // Also set the profile picture in personalInfo for easy access
      if (!employee.personalInfo) {
        employee.personalInfo = {};
      }
      employee.personalInfo.profilePicture = onboarding.candidatePortal.personalInfo.profilePhoto.url;
    }
    
    console.log(`📄 Found ${candidatePortalDocuments.length} documents from candidate portal`);
    
    // Merge with existing employee documents, avoiding duplicates
    const existingDocPaths = new Set(employee.documents.map(doc => doc.filePath));
    const newDocuments = candidatePortalDocuments.filter(doc => !existingDocPaths.has(doc.filePath));
    
    if (newDocuments.length > 0) {
      console.log(`📄 Adding ${newDocuments.length} new documents to employee profile`);
      employee.documents = [...employee.documents, ...newDocuments];
      
      // Update additional info to track the sync
      employee.additionalInfo = {
        ...employee.additionalInfo,
        lastDocumentSync: new Date(),
        candidatePortalDocumentsCount: candidatePortalDocuments.length,
        lastSyncBy: req.user._id
      };
      
      await employee.save();
      console.log('✅ Documents synced successfully');
    }

    res.json({
      success: true,
      message: `Documents synced successfully for employee ${employeeId}`,
      data: {
        employeeId: employee.employeeId,
        totalDocuments: employee.documents.length,
        newDocumentsAdded: newDocuments.length,
        candidatePortalDocuments: candidatePortalDocuments.length,
        syncedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Sync documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during document sync',
      error: error.message 
    });
  }
});

// MOVED TO END OF FILE - This route must be last because /:id catches all routes

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (HR, Admin)
router.post('/', [
  authenticate,
  authorize(['admin', 'hr']),
  body('user.email').isEmail().normalizeEmail(),
  body('user.password').isLength({ min: 6 }),
  body('personalInfo.firstName').notEmpty().trim(),
  body('personalInfo.lastName').notEmpty().trim(),
  body('employmentInfo.department').isMongoId(),
  body('employmentInfo.designation').notEmpty().trim(),
  body('employmentInfo.dateOfJoining').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user: userData, employeeId, ...employeeData } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Verify department exists
    const department = await Department.findById(employeeData.employmentInfo.department);
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Create user first
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role || 'employee'
    });
    await newUser.save();

    // Create employee (don't include employeeId - let model generate it)
    const employee = new Employee({
      ...employeeData,
      user: newUser._id
    });

    await employee.save();

    // Populate and return the created employee
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('user', 'email role isActive');

    res.status(201).json({
      message: 'Employee created successfully',
      employee: populatedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (HR, Admin, or self for limited fields)
router.put('/:id', [authenticate], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check permissions
    const canEdit = ['admin', 'hr'].includes(req.user.role) || 
                   employee.user.toString() === req.user._id.toString();
    
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If employee is updating their own record, limit fields they can update
    let allowedFields = req.body;
    if (employee.user.toString() === req.user._id.toString() && req.user.role === 'employee') {
      allowedFields = {
        'contactInfo.personalEmail': req.body.contactInfo?.personalEmail,
        'contactInfo.phone': req.body.contactInfo?.phone,
        'contactInfo.address': req.body.contactInfo?.address,
        'contactInfo.emergencyContact': req.body.contactInfo?.emergencyContact,
        'skills': req.body.skills,
        'certifications': req.body.certifications
      };
    }

    // Store original values for audit log
    const originalData = employee.toObject();

    // Update employee
    Object.keys(allowedFields).forEach(key => {
      if (key.includes('.')) {
        // Handle nested fields
        const keys = key.split('.');
        let current = employee;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = allowedFields[key];
      } else {
        employee[key] = allowedFields[key];
      }
    });

    // Add audit log entry
    employee.auditLog.push({
      action: 'update',
      field: 'employee_data',
      oldValue: originalData,
      newValue: employee.toObject(),
      modifiedBy: req.user._id
    });

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive');

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/all
// @desc    Delete all employees (admin only)
// @access  Private (Admin only)
router.delete('/all', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    console.log('Delete all employees request started');
    
    // Get all employees with populated user data
    const employees = await Employee.find({}).populate('user');
    console.log(`Found ${employees.length} employees to delete`);
    
    if (employees.length === 0) {
      return res.json({ message: 'No employees found to delete', deletedCount: 0 });
    }

    // Get all user IDs associated with employees (excluding admins)
    const userIds = employees
      .map(emp => emp.user)
      .filter(user => user && user.role !== 'admin')
      .map(user => user._id);
    
    console.log(`Found ${userIds.length} non-admin user accounts to delete`);

    // Delete all employees first
    const employeeDeleteResult = await Employee.deleteMany({});
    console.log(`Deleted ${employeeDeleteResult.deletedCount} employees`);
    
    // Delete associated user accounts (only non-admin users)
    let userDeleteResult = { deletedCount: 0 };
    if (userIds.length > 0) {
      userDeleteResult = await User.deleteMany({ 
        _id: { $in: userIds }
      });
      console.log(`Deleted ${userDeleteResult.deletedCount} user accounts`);
    }

    const responseMessage = `Successfully deleted ${employeeDeleteResult.deletedCount} employees and ${userDeleteResult.deletedCount} user accounts`;
    console.log(responseMessage);

    res.json({ 
      message: responseMessage,
      deletedEmployees: employeeDeleteResult.deletedCount,
      deletedUsers: userDeleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete all employees error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while deleting employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete)
// @access  Private (Admin, HR)
router.delete('/:id', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete - mark as inactive
    employee.employmentInfo.isActive = false;
    employee.employmentInfo.terminationDate = new Date();
    employee.employmentInfo.terminationReason = req.body.reason || 'Terminated by admin';

    // Also deactivate user account
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    // Add audit log
    employee.auditLog.push({
      action: 'deactivate',
      field: 'employee_status',
      oldValue: true,
      newValue: false,
      modifiedBy: req.user._id
    });

    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees/:id/upload
// @desc    Upload employee document
// @access  Private
router.post('/:id/upload', [
  authenticate,
  canAccessEmployee,
  upload.single('document')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = {
      type: req.body.type || 'other',
      name: req.body.name || req.file.originalname,
      filePath: req.file.path,
      url: `/uploads/employees/${req.file.filename}`, // Add proper URL for frontend access
      uploadedAt: new Date(),
      expiryDate: req.body.expiryDate || null
    };

    employee.documents.push(document);
    await employee.save();

    res.json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id/document/:documentId/name
// @desc    Update employee document name
// @access  Private
router.put('/:id/document/:documentId/name', [
  authenticate,
  canAccessEmployee
], async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Document name is required' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = employee.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.name = name.trim();
    await employee.save();

    res.json({
      success: true,
      message: 'Document name updated successfully',
      document: {
        _id: document._id,
        name: document.name,
        type: document.type,
        url: document.url
      }
    });
  } catch (error) {
    console.error('Update document name error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/pending-documents
// @desc    Get pending documents for current employee
// @access  Private (Employee)
router.get('/pending-documents', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Define required documents for employees
    const requiredDocuments = [
      { type: 'id-proof', name: 'ID Proof (Aadhaar/PAN)', required: true, description: 'Government issued ID proof' },
      { type: 'address-proof', name: 'Address Proof', required: true, description: 'Utility bill or bank statement' },
      { type: 'educational', name: 'Educational Certificates', required: true, description: 'Degree certificates and mark sheets' },
      { type: 'experience', name: 'Experience Certificates', required: false, description: 'Previous employment certificates' },
      { type: 'cancelled_cheque', name: 'Cancelled Cheque', required: true, description: 'For salary account verification' },
      { type: 'passbook', name: 'Bank Passbook', required: false, description: 'Bank account details' },
      { type: 'resume', name: 'Updated Resume', required: true, description: 'Current resume with latest information' },
      { type: 'offer-letter', name: 'Signed Offer Letter', required: true, description: 'Signed copy of offer letter' }
    ];

    // Check which documents are missing
    const existingDocuments = employee.documents || [];
    const missingDocuments = requiredDocuments.filter(required => {
      const hasDocument = existingDocuments.some(doc => 
        doc.type === required.type || 
        (required.type === 'id-proof' && (doc.type === 'aadhaar' || doc.type === 'pan'))
      );
      return !hasDocument;
    });

    res.json({
      success: true,
      pendingDocuments: missingDocuments,
      totalRequired: requiredDocuments.filter(doc => doc.required).length,
      totalSubmitted: existingDocuments.length,
      completionPercentage: Math.round(((requiredDocuments.filter(doc => doc.required).length - missingDocuments.filter(doc => doc.required).length) / requiredDocuments.filter(doc => doc.required).length) * 100)
    });
  } catch (error) {
    console.error('Get pending documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/employees/:id/document/:documentId
// @desc    Delete employee document
// @access  Private
router.delete('/:id/document/:documentId', [
  authenticate,
  canAccessEmployee
], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = employee.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Remove the document from the array
    employee.documents.pull(req.params.documentId);
    await employee.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id/document/:documentId/set-profile-picture
// @desc    Set employee document as profile picture
// @access  Private
router.put('/:id/document/:documentId/set-profile-picture', [
  authenticate,
  canAccessEmployee
], async (req, res) => {
  try {
    console.log('🔍 Set profile picture request:', {
      employeeId: req.params.id,
      documentId: req.params.documentId,
      userId: req.user.id
    });

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      console.log('❌ Employee not found:', req.params.id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = employee.documents.id(req.params.documentId);
    if (!document) {
      console.log('❌ Document not found:', req.params.documentId);
      return res.status(404).json({ message: 'Document not found' });
    }

    console.log('🔍 Found document:', {
      name: document.name,
      url: document.url,
      filePath: document.filePath,
      type: document.type
    });

    // Check if the document is an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const fileExtension = document.name.toLowerCase().substring(document.name.lastIndexOf('.'));
    console.log('🔍 File extension:', fileExtension);
    
    if (!imageExtensions.includes(fileExtension)) {
      console.log('❌ Not an image file:', fileExtension);
      return res.status(400).json({ message: 'Only image files can be set as profile picture' });
    }

    // Update the employee's profile picture
    // Use filePath if url is undefined (for backward compatibility)
    let imageUrl = document.url;
    if (!imageUrl && document.filePath) {
      // Extract filename from filePath and construct proper URL
      const filename = document.filePath.split('/').pop();
      imageUrl = `/uploads/employees/${filename}`;
    } else if (!imageUrl) {
      // Fallback to document name
      imageUrl = `/uploads/employees/${document.name}`;
    }
    
    employee.profilePicture = {
      documentId: document._id,
      url: imageUrl,
      name: document.name,
      setAt: new Date()
    };

    console.log('🔍 Constructed image URL:', imageUrl);
    console.log('🔍 Setting profile picture:', employee.profilePicture);
    await employee.save();
    console.log('✅ Profile picture updated successfully');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: employee.profilePicture
    });
  } catch (error) {
    console.error('❌ Set profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/org-chart
// @desc    Get organization chart
// @access  Private (HR, Admin, Manager)
router.get('/reports/org-chart', [
  authenticate,
  authorize(['admin', 'hr', 'manager'])
], async (req, res) => {
  try {
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('employeeId personalInfo employmentInfo.designation employmentInfo.department employmentInfo.reportingManager profilePicture');

    // Build hierarchical structure
    const buildOrgChart = (employees, managerId = null) => {
      return employees
        .filter(emp => {
          const reportingManagerId = emp.employmentInfo.reportingManager?._id?.toString();
          return reportingManagerId === managerId?.toString();
        })
        .map(emp => ({
          ...emp.toObject(),
          subordinates: buildOrgChart(employees, emp._id)
        }));
    };

    const orgChart = buildOrgChart(employees);

    res.json(orgChart);
  } catch (error) {
    console.error('Get org chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/my-team
// @desc    Get team members for current user (if they are a manager or have special access)
// @access  Private
router.get('/my-team', authenticate, async (req, res) => {
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id });
    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Find team members reporting to this employee
    // Also include special access for users like Prajwal regardless of role
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .populate('employmentInfo.department', 'name')
    .select('employeeId personalInfo employmentInfo profilePicture createdAt user')
    .sort({ 'personalInfo.firstName': 1 });

    // Get leave balances for team members
    const teamMembersWithLeaves = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const currentYear = new Date().getFullYear();
          const leaveBalance = await require('../models/Leave').LeaveBalance.findOne({
            employee: member._id,
            year: currentYear
          });

          return {
            ...member.toObject(),
            leaveBalance: leaveBalance ? {
              casualLeave: leaveBalance.casualLeave,
              sickLeave: leaveBalance.sickLeave,
              specialLeave: leaveBalance.specialLeave
            } : null
          };
        } catch (error) {
          return {
            ...member.toObject(),
            leaveBalance: null
          };
        }
      })
    );

    // Return team members with full data (no filtering)
    res.json({
      teamMembers: teamMembersWithLeaves,
      totalTeamSize: teamMembers.length,
      manager: {
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/reporting-structure
// @desc    Get reporting structure information for current user
// @access  Private
router.get('/reporting-structure', authenticate, async (req, res) => {
  console.log('🔍 Reporting structure endpoint hit!');
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo employmentInfo.designation')
      .populate('employmentInfo.department', 'name');

    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get team members (if user is a manager)
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .select('employeeId personalInfo employmentInfo.designation')
    .sort({ 'personalInfo.firstName': 1 });

    // Get peers (employees with same reporting manager)
    const peers = currentEmployee.employmentInfo?.reportingManager ? 
      await Employee.find({
        'employmentInfo.reportingManager': currentEmployee.employmentInfo.reportingManager._id,
        'employmentInfo.isActive': true,
        '_id': { $ne: currentEmployee._id }
      })
      .select('employeeId personalInfo employmentInfo.designation')
      .sort({ 'personalInfo.firstName': 1 }) : [];

    res.json({
      currentEmployee: {
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation,
        department: currentEmployee.employmentInfo?.department?.name,
        role: req.user.role
      },
      reportingManager: currentEmployee.employmentInfo?.reportingManager ? {
        employeeId: currentEmployee.employmentInfo.reportingManager.employeeId,
        name: `${currentEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${currentEmployee.employmentInfo.reportingManager.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo.reportingManager.employmentInfo?.designation
      } : null,
      teamMembers: teamMembers.map(member => ({
        employeeId: member.employeeId,
        name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
        designation: member.employmentInfo?.designation,
        role: member.user?.role
      })),
      peers: peers.map(peer => ({
        employeeId: peer.employeeId,
        name: `${peer.personalInfo?.firstName} ${peer.personalInfo?.lastName}`,
        designation: peer.employmentInfo?.designation
      })),
      statistics: {
        totalTeamSize: teamMembers.length,
        totalPeers: peers.length,
        isManager: teamMembers.length > 0
      }
    });
  } catch (error) {
    console.error('Get reporting structure error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/team-dashboard/:employeeId
// @desc    Get team member dashboard data for reporting managers (filtered)
// @access  Private (Reporting Manager and special access users)
router.get('/team-dashboard/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const Employee = require('../models/Employee');
    const Attendance = require('../models/Attendance');
    const { LeaveRequest } = require('../models/Leave');
    
    const employee = await Employee.findById(employeeId)
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check access permissions
    let accessLevel = 'self';
    
    console.log('🔍 Team Dashboard Access Check:', {
      currentUserEmail: req.user.email,
      currentUserRole: req.user.role,
      targetEmployeeId: employeeId,
      targetEmployeeName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
    });
    
    // Admin and HR can access all employee data without filtering
    if (['admin', 'hr'].includes(req.user.role)) {
      accessLevel = 'full';
      console.log('✅ Access granted: Admin/HR role');
    } else {
      // Check if current user is the employee's reporting manager
      const currentEmployee = await Employee.findOne({ user: req.user._id });
      
      console.log('🔍 Reporting manager check:', {
        hasCurrentEmployee: !!currentEmployee,
        currentEmployeeId: currentEmployee?._id,
        targetReportingManagerId: employee.employmentInfo.reportingManager?._id,
        isReportingManager: currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id)
      });
      
      if (currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id)) {
        accessLevel = 'manager';
        console.log('✅ Access granted: Reporting manager relationship');
      } else if (employee.user._id.equals(req.user._id)) {
        accessLevel = 'self';
        console.log('✅ Access granted: Self access');
      } else {
        // Special access for users like Prajwal
        const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
        if (specialAccessEmails.includes(req.user.email.toLowerCase())) {
          // For Prajwal, allow access to any employee for now (can be restricted later)
          accessLevel = 'manager';
          console.log('✅ Access granted: Special access');
        } else {
          console.log('❌ Access denied: No valid relationship found');
          return res.status(403).json({ 
            message: 'Access denied to this employee data.',
            debug: {
              currentUserRole: req.user.role,
              currentUserEmail: req.user.email,
              targetEmployeeId: employeeId,
              hasCurrentEmployee: !!currentEmployee,
              currentEmployeeId: currentEmployee?._id,
              targetReportingManagerId: employee.employmentInfo.reportingManager?._id,
        isReportingManager: currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id),
        isSelf: employee.user._id.equals(req.user._id),
              hasSpecialAccess: specialAccessEmails.includes(req.user.email.toLowerCase())
            }
          });
        }
      }
    }
    
    console.log('📊 Final access level:', accessLevel);

    // Calculate date range based on attendance period filter
    const attendancePeriod = req.query.attendancePeriod || 'thisMonth';
    let attendanceStartDate, attendanceEndDate;
    const now = new Date();

    switch (attendancePeriod) {
      case 'lastMonth':
        attendanceStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        attendanceEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last3Months':
        attendanceStartDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        attendanceEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'thisYear':
        attendanceStartDate = new Date(now.getFullYear(), 0, 1);
        attendanceEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'custom':
        if (req.query.startDate && req.query.endDate) {
          attendanceStartDate = new Date(req.query.startDate);
          attendanceEndDate = new Date(req.query.endDate + 'T23:59:59.999');
        } else {
          attendanceStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          attendanceEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        break;
      case 'thisMonth':
      default:
        attendanceStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        attendanceEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
    }

    console.log('📅 Attendance date range:', { attendancePeriod, attendanceStartDate, attendanceEndDate });

    // Get attendance summary for the employee
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: attendanceStartDate, $lte: attendanceEndDate }
    });

    console.log(`📊 Total attendance records found: ${attendanceRecords.length}`);
    
    // Log status breakdown of all records
    const statusBreakdown = {};
    attendanceRecords.forEach(record => {
      const status = record.status || 'undefined';
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });
    console.log(`📊 Status breakdown of all records:`, statusBreakdown);
    
    // Log detailed breakdown of status vs isLate flag for debugging
    const detailedBreakdown = {};
    attendanceRecords.forEach(record => {
      const key = `status:${record.status}, isLate:${record.isLate}`;
      detailedBreakdown[key] = (detailedBreakdown[key] || 0) + 1;
    });
    console.log(`📊 Detailed status+isLate breakdown:`, detailedBreakdown);
    
    // Log lateMinutes breakdown
    const lateMinutesBreakdown = {};
    attendanceRecords.forEach(record => {
      const key = `lateMinutes:${record.lateMinutes || 0}`;
      lateMinutesBreakdown[key] = (lateMinutesBreakdown[key] || 0) + 1;
    });
    console.log(`📊 LateMinutes breakdown:`, lateMinutesBreakdown);
    
    // Log which records have lateMinutes = 0
    const onTimeRecords = attendanceRecords.filter(r => !r.lateMinutes || r.lateMinutes === 0);
    console.log(`📊 Records with lateMinutes=0 (${onTimeRecords.length} total):`);
    onTimeRecords.forEach(r => {
      console.log(`  - ${r.date.toISOString().split('T')[0]}: status=${r.status}, lateMinutes=${r.lateMinutes}`);
    });

    // Filter out only non-working days based on STATUS (not date)
    // If someone worked on a Saturday, their status will be 'present' or 'late', not 'weekend'
    // So we should count those as working days
    const workingDayRecords = attendanceRecords.filter(record => 
      record.status !== 'weekend' && 
      record.status !== 'holiday' &&
      record.status !== 'on-leave'
    );
    
    console.log(`📊 Working day records (excluding holidays/leaves, INCLUDING weekends if worked): ${workingDayRecords.length}`);

    // Also include weekend records where employee actually checked in (worked)
    // These might have status='weekend' but have checkIn time
    const weekendWorkedRecords = attendanceRecords.filter(record => 
      record.status === 'weekend' && record.checkIn && record.checkIn.time
    );
    
    if (weekendWorkedRecords.length > 0) {
      console.log(`📊 Weekend records with check-in found: ${weekendWorkedRecords.length} (adding these to working days)`);
      // Add these to working day records
      workingDayRecords.push(...weekendWorkedRecords);
    }

    // Also include on-leave records where employee actually checked in (worked despite being on leave)
    const leaveWorkedRecords = attendanceRecords.filter(record => 
      record.status === 'on-leave' && record.checkIn && record.checkIn.time
    );
    
    if (leaveWorkedRecords.length > 0) {
      console.log(`📊 On-leave records with check-in found: ${leaveWorkedRecords.length} (employee worked despite being on leave - adding to working days)`);
      // Add these to working day records
      workingDayRecords.push(...leaveWorkedRecords);
    }

    console.log(`📊 Total working day records (after including weekend + leave work): ${workingDayRecords.length}`);

    // Calculate detailed attendance metrics
    // Present: Anyone who actually checked in, OR has status 'present', 'late', 'half-day'
    const presentRecords = workingDayRecords.filter(record => 
      // Has check-in (actually worked)
      (record.checkIn && record.checkIn.time) ||
      // OR has present/late/half-day status
      record.status === 'present' || 
      record.status === 'late' || 
      record.status === 'half-day'
    );
    
    // Late: Count based on lateMinutes > 0 (or some threshold like 5 minutes)
    // The Monthly Grid likely shows cells as "late" only if lateMinutes is significant
    // Even if isLate=true, if lateMinutes is 0 or very small, the Grid shows it as on-time
    const lateRecords = presentRecords.filter(record => 
      record.lateMinutes && record.lateMinutes > 0
    );
    
    // For on-time calculation, only count REGULAR working days (exclude weekend and on-leave work)
    // The Monthly Grid doesn't include weekend/on-leave work in the on-time count
    const regularPresentRecords = presentRecords.filter(record =>
      record.status !== 'weekend' && record.status !== 'on-leave'
    );
    
    const regularLateRecords = regularPresentRecords.filter(record =>
      record.lateMinutes && record.lateMinutes > 0
    );
    
    // Log the actual on-time regular records for debugging
    const regularOnTimeRecords = regularPresentRecords.filter(record =>
      !record.lateMinutes || record.lateMinutes === 0
    );
    
    console.log(`📊 Regular working days: Present=${regularPresentRecords.length}, Late=${regularLateRecords.length}, On-Time=${regularOnTimeRecords.length}`);
    console.log(`📊 Regular ON-TIME records (${regularOnTimeRecords.length}):`);
    regularOnTimeRecords.forEach(r => {
      console.log(`  - ${r.date.toISOString().split('T')[0]}: status=${r.status}, lateMinutes=${r.lateMinutes}, checkIn=${r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : 'N/A'}`);
    });
    
    // Absent: explicitly marked as absent OR no check-in and not present/late/half-day
    const absentRecords = workingDayRecords.filter(record => 
      record.status === 'absent' || 
      (!record.checkIn?.time && record.status !== 'present' && record.status !== 'late' && record.status !== 'half-day' && record.status !== 'weekend')
    );

    // Half days
    const halfDayRecords = workingDayRecords.filter(record =>
      record.status === 'half-day'
    );

    console.log(`📊 Attendance breakdown: Total Present=${presentRecords.length}, Total Late=${lateRecords.length}, Absent=${absentRecords.length}, HalfDay=${halfDayRecords.length}`);
    
    // Calculate working hours (only for records with check-in/out)
    let totalHours = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let daysWithHours = 0;

    presentRecords.forEach(record => {
      if (record.checkIn?.time && record.checkOut?.time) {
        const hours = (new Date(record.checkOut.time) - new Date(record.checkIn.time)) / (1000 * 60 * 60);
        totalHours += hours;
        daysWithHours++;
        
        // Assuming 9 hours is standard working day
        if (hours >= 9) {
          totalRegularHours += 9;
          totalOvertimeHours += (hours - 9);
        } else {
          totalRegularHours += hours;
        }
      } else if (record.totalHours) {
        // Use pre-calculated totalHours if check-in/out times are not available
        totalHours += record.totalHours;
        daysWithHours++;
        
        if (record.totalHours >= 9) {
          totalRegularHours += 9;
          totalOvertimeHours += (record.totalHours - 9);
        } else {
          totalRegularHours += record.totalHours;
        }
      }
    });

    const avgWorkingHours = daysWithHours > 0 
      ? (totalHours / daysWithHours).toFixed(1) 
      : '0.0';

    const attendanceSummary = {
      present: presentRecords.length, // ALL present days including weekend/on-leave work
      absent: absentRecords.length,
      late: lateRecords.length, // ALL late days (status='late')
      totalWorkingDays: workingDayRecords.length, // All working days including weekend/on-leave work
      halfDays: halfDayRecords.length,
      avgWorkingHours: avgWorkingHours,
      overtimeHours: totalOvertimeHours.toFixed(1),
      // Add separate fields for on-time calculation in frontend
      regularPresent: regularPresentRecords.length, // For frontend to calculate on-time correctly
      regularLate: regularLateRecords.length
    };

    console.log(`📊 Final attendance summary:`, attendanceSummary);

    // Calculate date range for leave requests based on leave period filter
    const leavePeriod = req.query.leavePeriod || 'thisYear';
    let leaveStartDate, leaveEndDate;

    switch (leavePeriod) {
      case 'thisMonth':
        leaveStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        leaveEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'lastMonth':
        leaveStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        leaveEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'thisQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        leaveStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        leaveEndDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      case 'all':
        // Get all leave requests (no date filter)
        leaveStartDate = null;
        leaveEndDate = null;
        break;
      case 'thisYear':
      default:
        leaveStartDate = new Date(now.getFullYear(), 0, 1);
        leaveEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    console.log('🏖️ Leave date range:', { leavePeriod, leaveStartDate, leaveEndDate });

    // Get leave summary
    const leaveQuery = {
      employee: employeeId
    };
    
    if (leaveStartDate && leaveEndDate) {
      leaveQuery.$or = [
        { startDate: { $gte: leaveStartDate, $lte: leaveEndDate } },
        { endDate: { $gte: leaveStartDate, $lte: leaveEndDate } },
        { 
          startDate: { $lte: leaveStartDate }, 
          endDate: { $gte: leaveEndDate } 
        }
      ];
    }

    const leaveRequests = await LeaveRequest.find(leaveQuery);

    // Get leave balance from employee record
    const leaveBalance = employee.leaveBalance || {};
    
    const leaveSummary = {
      totalRequests: leaveRequests.length,
      approved: leaveRequests.filter(leave => leave.status === 'approved').length,
      pending: leaveRequests.filter(leave => leave.status === 'pending').length,
      rejected: leaveRequests.filter(leave => leave.status === 'rejected').length,
      leaveBalance: {
        casualLeave: {
          allocated: leaveBalance.casualLeave?.allocated || 0,
          used: leaveBalance.casualLeave?.used || 0,
          available: (leaveBalance.casualLeave?.allocated || 0) - (leaveBalance.casualLeave?.used || 0)
        },
        sickLeave: {
          allocated: leaveBalance.sickLeave?.allocated || 0,
          used: leaveBalance.sickLeave?.used || 0,
          available: (leaveBalance.sickLeave?.allocated || 0) - (leaveBalance.sickLeave?.used || 0)
        },
        specialLeave: {
          allocated: leaveBalance.specialLeave?.allocated || 0,
          used: leaveBalance.specialLeave?.used || 0,
          available: (leaveBalance.specialLeave?.allocated || 0) - (leaveBalance.specialLeave?.used || 0)
        }
      }
    };

    // Return dashboard data with full employee information (no filtering)
    res.json({
      employee: employee,
      attendance: attendanceSummary,
      leaves: leaveSummary,
      accessLevel: accessLevel,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Get team dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/debug-team-dashboard-access/:employeeId
// @desc    Debug endpoint to check team dashboard access for a specific employee
// @access  Private (for debugging)
router.get('/debug-team-dashboard-access/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentUser = req.user;
    
    // Get current user's employee record
    const currentEmployee = await Employee.findOne({ user: currentUser._id });
    
    // Get target employee
    const targetEmployee = await Employee.findById(employeeId)
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');
    
    if (!targetEmployee) {
      return res.status(404).json({ message: 'Target employee not found' });
    }
    
    // Check access permissions step by step
    let accessLevel = 'none';
    let accessReason = '';
    
    // Check admin/HR access
    if (['admin', 'hr'].includes(currentUser.role)) {
      accessLevel = 'full';
      accessReason = 'User has admin/hr role';
    } else if (currentEmployee && targetEmployee.employmentInfo.reportingManager?.toString() === currentEmployee._id.toString()) {
      accessLevel = 'manager';
      accessReason = 'User is the reporting manager of the target employee';
    } else if (targetEmployee.user.toString() === currentUser._id.toString()) {
      accessLevel = 'self';
      accessReason = 'User is accessing their own data';
    } else {
      // Check special access
      const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
      if (specialAccessEmails.includes(currentUser.email.toLowerCase())) {
        accessLevel = 'manager';
        accessReason = 'User has special access via email whitelist';
      } else {
        accessReason = 'No access - user is not admin/hr, not the reporting manager, not accessing own data, and not in special access list';
      }
    }
    
    res.json({
      debug: {
        currentUser: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
          isActive: currentUser.isActive
        },
        currentEmployee: currentEmployee ? {
          id: currentEmployee._id,
          employeeId: currentEmployee.employeeId,
          name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
          designation: currentEmployee.employmentInfo?.designation
        } : null,
        targetEmployee: {
          id: targetEmployee._id,
          employeeId: targetEmployee.employeeId,
          name: `${targetEmployee.personalInfo?.firstName} ${targetEmployee.personalInfo?.lastName}`,
          designation: targetEmployee.employmentInfo?.designation,
          reportingManagerId: targetEmployee.employmentInfo?.reportingManager?._id,
          reportingManagerName: targetEmployee.employmentInfo?.reportingManager ? 
            `${targetEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${targetEmployee.employmentInfo.reportingManager.personalInfo?.lastName}` : null
        },
        accessCheck: {
          accessLevel,
          accessReason,
          hasAccess: accessLevel !== 'none',
          isAdminOrHR: ['admin', 'hr'].includes(currentUser.role),
          isReportingManager: currentEmployee && targetEmployee.employmentInfo.reportingManager?.toString() === currentEmployee._id.toString(),
          isSelf: targetEmployee.user.toString() === currentUser._id.toString(),
          hasSpecialAccess: ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'].includes(currentUser.email.toLowerCase())
        }
      }
    });
  } catch (error) {
    console.error('Debug team dashboard access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/employees/debug-manager-access
// @desc    Debug endpoint to check manager access and reporting relationships
// @access  Private (for debugging)
router.get('/debug-manager-access', authenticate, async (req, res) => {
  try {
    const currentUser = req.user;
    const currentEmployee = await Employee.findOne({ user: currentUser._id })
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!currentEmployee) {
      return res.status(404).json({ 
        message: 'Employee profile not found',
        user: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role
        }
      });
    }

    // Find team members reporting to this employee
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .select('employeeId personalInfo employmentInfo.designation user');

    // Check if user has manager role
    const hasManagerRole = currentUser.role === 'manager';

    // Get all employees to check reporting structure
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email role')
      .select('employeeId personalInfo employmentInfo.designation employmentInfo.reportingManager user');

    res.json({
      debug: {
        currentUser: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
          hasManagerRole
        },
        currentEmployee: {
          id: currentEmployee._id,
          employeeId: currentEmployee.employeeId,
          name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
          designation: currentEmployee.employmentInfo?.designation,
          department: currentEmployee.employmentInfo?.department?.name,
          reportingManager: currentEmployee.employmentInfo?.reportingManager ? {
            id: currentEmployee.employmentInfo.reportingManager._id,
            name: `${currentEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${currentEmployee.employmentInfo.reportingManager.personalInfo?.lastName}`,
            employeeId: currentEmployee.employmentInfo.reportingManager.employeeId
          } : null
        },
        teamMembers: {
          count: teamMembers.length,
          members: teamMembers.map(member => ({
            id: member._id,
            employeeId: member.employeeId,
            name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
            designation: member.employmentInfo?.designation,
            userRole: member.user?.role,
            userEmail: member.user?.email
          }))
        },
        reportingStructure: {
          totalEmployees: allEmployees.length,
          employeesReportingToCurrentUser: teamMembers.length,
          employeesWithNoReportingManager: allEmployees.filter(emp => !emp.employmentInfo.reportingManager).length
        },
        recommendations: {
          needsManagerRole: !hasManagerRole ? 'User needs "manager" role in User model' : null,
          needsReportingRelationships: teamMembers.length === 0 ? 'No employees are set to report to this user. Check reporting manager assignments.' : null,
          checkEmployeeData: teamMembers.length === 0 ? 'Verify that employees have employmentInfo.reportingManager set to this user\'s employee ID' : null
        }
      }
    });
  } catch (error) {
    console.error('Debug manager access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/employees/fix-manager-access
// @desc    Fix manager role and reporting relationships for a user
// @access  Private (Admin/HR only)
router.post('/fix-manager-access', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const { userEmail, setAsManager = true, reportingManagerEmployeeIds = [] } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the employee record
    const employee = await Employee.findOne({ user: user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const results = {
      user: {
        email: user.email,
        currentRole: user.role,
        employeeId: employee.employeeId
      },
      changes: []
    };

    // Update user role to manager if requested
    if (setAsManager && user.role !== 'manager') {
      await User.findByIdAndUpdate(user._id, { role: 'manager' });
      results.changes.push(`Updated user role from '${user.role}' to 'manager'`);
      results.user.newRole = 'manager';
    }

    // Set reporting relationships if provided
    if (reportingManagerEmployeeIds.length > 0) {
      let relationshipsSet = 0;
      
      for (const reportingManagerEmployeeId of reportingManagerEmployeeIds) {
        // Find the employee who should report to this manager
        const reportingEmployee = await Employee.findOne({ 
          employeeId: reportingManagerEmployeeId 
        });
        
        if (reportingEmployee) {
          // Set this employee to report to the manager
          await Employee.findByIdAndUpdate(reportingEmployee._id, {
            'employmentInfo.reportingManager': employee._id
          });
          relationshipsSet++;
          results.changes.push(`Set ${reportingEmployee.personalInfo?.firstName} ${reportingEmployee.personalInfo?.lastName} (${reportingEmployee.employeeId}) to report to ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`);
        }
      }
      
      if (relationshipsSet === 0) {
        results.changes.push('No valid employee IDs found to set as direct reports');
      }
    }

    // Get updated team members count
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': employee._id,
      'employmentInfo.isActive': true
    });

    results.teamMembers = {
      count: teamMembers.length,
      members: teamMembers.map(member => ({
        employeeId: member.employeeId,
        name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
        designation: member.employmentInfo?.designation
      }))
    };

    res.json({
      success: true,
      message: 'Manager access fixed successfully',
      results
    });

  } catch (error) {
    console.error('Fix manager access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/employees/reportee-data
// @desc    Get reportee data for users like Prajwal (bypasses role restrictions)
// @access  Private
router.get('/reportee-data', authenticate, async (req, res) => {
  try {
    const currentUser = req.user;
    const currentEmployee = await Employee.findOne({ user: currentUser._id })
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!currentEmployee) {
      return res.status(404).json({ 
        message: 'Employee profile not found',
        user: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role
        }
      });
    }

    // Find team members reporting to this employee
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .populate('employmentInfo.department', 'name')
    .select('employeeId personalInfo employmentInfo profilePicture createdAt user')
    .sort({ 'personalInfo.firstName': 1 });

    // Get leave balances for team members
    const teamMembersWithLeaves = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const currentYear = new Date().getFullYear();
          const leaveBalance = await require('../models/Leave').LeaveBalance.findOne({
            employee: member._id,
            year: currentYear
          });

          return {
            ...member.toObject(),
            leaveBalance: leaveBalance ? {
              casualLeave: leaveBalance.casualLeave,
              sickLeave: leaveBalance.sickLeave,
              specialLeave: leaveBalance.specialLeave
            } : null
          };
        } catch (error) {
          return {
            ...member.toObject(),
            leaveBalance: null
          };
        }
      })
    );

    // Filter data for reportee view (hide sensitive information)
    const filteredTeamMembers = teamMembersWithLeaves.map(member => {
      const filtered = { ...member };
      
      // Hide sensitive salary information
      if (filtered.salaryInfo) {
        filtered.salaryInfo = {
          currentSalary: {
            basic: null,
            hra: null,
            allowances: null,
            grossSalary: null,
            ctc: null
          },
          bankDetails: null,
          taxInfo: null
        };
      }

      // Hide sensitive personal information
      if (filtered.personalInfo) {
        filtered.personalInfo = {
          firstName: filtered.personalInfo.firstName,
          lastName: filtered.personalInfo.lastName,
          dateOfBirth: null,
          gender: null,
          maritalStatus: null
        };
      }

      // Hide sensitive contact information
      if (filtered.contactInfo) {
        filtered.contactInfo = {
          email: filtered.contactInfo.email,
          personalEmail: null,
          phone: null,
          address: null,
          emergencyContact: null,
          alternatePhone: null
        };
      }

      // Remove address information
      if (filtered.addressInfo) {
        filtered.addressInfo = null;
      }

      // Remove employment history
      if (filtered.employmentHistory) {
        filtered.employmentHistory = null;
      }

      return filtered;
    });

    res.json({
      success: true,
      currentEmployee: {
        id: currentEmployee._id,
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation,
        department: currentEmployee.employmentInfo?.department?.name,
        userRole: currentUser.role
      },
      teamMembers: filteredTeamMembers,
      totalTeamSize: teamMembers.length,
      accessLevel: 'reportee',
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get reportee data error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Special endpoint for Prajwal to get all employees (for testing)
router.get('/all-employees', authenticate, async (req, res) => {
  try {
    const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
    
    if (!specialAccessEmails.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ message: 'Access denied. This endpoint is for special users only.' });
    }

    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email role')
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo.firstName personalInfo.lastName')
      .select('employeeId personalInfo employmentInfo profilePicture createdAt user')
      .sort({ 'personalInfo.firstName': 1 });

    // Return all employees with full data (no filtering)
    res.json({
      success: true,
      employees: employees,
      totalCount: employees.length,
      accessLevel: 'manager',
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint to check reporting relationships
router.get('/debug-reporting', authenticate, async (req, res) => {
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id });
    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Find all employees and their reporting relationships
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo.firstName personalInfo.lastName')
      .select('employeeId personalInfo employmentInfo.reportingManager')
      .sort({ 'personalInfo.firstName': 1 });

    // Find employees reporting to current user
    const directReports = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .select('employeeId personalInfo employmentInfo.reportingManager');

    res.json({
      currentEmployee: {
        id: currentEmployee._id,
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`
      },
      directReports: directReports.map(emp => ({
        id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`
      })),
      allEmployees: allEmployees.map(emp => ({
        id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
        reportingManager: emp.employmentInfo?.reportingManager ? {
          id: emp.employmentInfo.reportingManager._id,
          employeeId: emp.employmentInfo.reportingManager.employeeId,
          name: `${emp.employmentInfo.reportingManager.personalInfo?.firstName} ${emp.employmentInfo.reportingManager.personalInfo?.lastName}`
        } : null
      }))
    });
  } catch (error) {
    console.error('Debug reporting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test routes removed - issue was with /:id route order

// @route   GET /api/employees/:id
// @desc    Get employee by ID with full data access
// @access  Private
// NOTE: This route MUST be last because /:id catches all routes
router.get('/:id', [authenticate, canAccessEmployee], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }


    // Return full employee data (no filtering)
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('🔥 EMPLOYEES ROUTES LOADED - INCLUDING NEW ENDPOINTS!');
console.log('🔥 Available routes: /my-team, /debug-manager-access, /team-dashboard/:id, /all-employees, /debug-reporting');
module.exports = router;

