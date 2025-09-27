const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Onboarding = require('../models/Onboarding');
const { sendPortalCredentials } = require('../services/emailService');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const { authenticate: auth, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/onboarding';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'document-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Helper function to generate random password
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to create Employee record from onboarding data
async function createEmployeeFromOnboarding(onboarding) {
  try {
    // Generate temporary password for the user
    const temporaryPassword = generateRandomPassword(12);
    
    // Create User account first
    const user = new User({
      email: onboarding.email,
      password: temporaryPassword,
      role: 'employee',
      isActive: true,
      profile: {
        firstName: onboarding.employeeName.split(' ')[0],
        lastName: onboarding.employeeName.split(' ').slice(1).join(' ') || ''
      }
    });
    await user.save();

    // Find or create department
    let department = await Department.findOne({ name: onboarding.department });
    if (!department) {
      department = new Department({
        name: onboarding.department,
        code: onboarding.department.toUpperCase().substring(0, 3),
        description: `${onboarding.department} Department`
      });
      await department.save();
    }

    // Parse name - prioritize candidatePortal data
    const candidatePersonalInfo = onboarding.candidatePortal?.personalInfo || {};
    const firstName = candidatePersonalInfo.firstName || onboarding.employeeName.split(' ')[0];
    const lastName = candidatePersonalInfo.lastName || onboarding.employeeName.split(' ').slice(-1)[0];
    const middleName = candidatePersonalInfo.middleName || 
      (onboarding.employeeName.split(' ').length > 2 ? onboarding.employeeName.split(' ').slice(1, -1).join(' ') : '');

    // Create comprehensive Employee record with all available data
    const employee = new Employee({
      user: user._id,
      personalInfo: {
        firstName: firstName,
        lastName: lastName,
        middleName: middleName,
        email: candidatePersonalInfo.email || candidatePersonalInfo.officialEmailId || onboarding.email,
        phone: candidatePersonalInfo.phone || onboarding.phone,
        alternatePhone: candidatePersonalInfo.alternatePhone || onboarding.alternatePhone,
        dateOfBirth: candidatePersonalInfo.dateOfBirth || onboarding.dateOfBirth,
        gender: candidatePersonalInfo.gender || onboarding.gender,
        maritalStatus: candidatePersonalInfo.maritalStatus || onboarding.maritalStatus,
        nationality: candidatePersonalInfo.nationality || onboarding.nationality || 'Indian',
        bloodGroup: candidatePersonalInfo.bloodGroup,
        currentAddress: onboarding.currentAddress || {},
        permanentAddress: onboarding.permanentAddress || {},
        emergencyContact: onboarding.emergencyContacts?.[0] ? {
          name: onboarding.emergencyContacts[0].name,
          relationship: onboarding.emergencyContacts[0].relationship,
          phone: onboarding.emergencyContacts[0].phone,
          email: onboarding.emergencyContacts[0].email
        } : {}
      },
      employmentInfo: {
        department: department._id,
        designation: onboarding.position,
        employeeType: onboarding.employmentType === 'full_time' ? 'full-time' : 
                     onboarding.employmentType === 'part_time' ? 'part-time' : 
                     onboarding.employmentType || 'full-time',
        dateOfJoining: candidatePersonalInfo.dateOfJoining || onboarding.startDate,
        probationEndDate: onboarding.probationPeriod ? 
          new Date(onboarding.startDate.getTime() + (onboarding.probationPeriod * 30 * 24 * 60 * 60 * 1000)) : 
          undefined,
        reportingManager: onboarding.reportingManager || null,
        isActive: true
      },
      salaryInfo: {
        currentSalary: {
          basic: onboarding.salary ? Math.round(onboarding.salary * 0.4) : 0,
          hra: onboarding.salary ? Math.round(onboarding.salary * 0.2) : 0,
          allowances: onboarding.salary ? Math.round(onboarding.salary * 0.1) : 0,
          grossSalary: onboarding.salary || 0,
          ctc: onboarding.salary || 0
        },
        bankDetails: onboarding.bankDetails ? {
          accountNumber: onboarding.bankDetails.accountNumber,
          bankName: onboarding.bankDetails.bankName,
          ifscCode: onboarding.bankDetails.ifscCode,
          accountHolderName: onboarding.bankDetails.accountHolderName || onboarding.employeeName
        } : {},
        taxInfo: {
          panNumber: candidatePersonalInfo.panNumber || onboarding.panNumber,
          aadharNumber: candidatePersonalInfo.aadharNumber || onboarding.aadharNumber,
          pfNumber: '', // To be filled later
          esiNumber: '', // To be filled later
          uanNumber: '' // To be filled later
        }
      },
      // Map education from both sources
      education: [
        ...(onboarding.education || []),
        ...(onboarding.candidatePortal?.educationQualifications?.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          yearOfPassing: parseInt(edu.yearOfPassing),
          percentage: parseFloat(edu.percentage) || parseFloat(edu.percent),
          specialization: edu.specialization || edu.educationLevel
        })) || [])
      ],
      // Map employment history from both sources
      employmentHistory: [
        ...(onboarding.experience || []),
        ...(onboarding.candidatePortal?.workExperience?.experienceDetails?.map(exp => ({
          company: exp.companyName,
          designation: exp.jobTitle,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          salary: parseFloat(exp.salary) || 0,
          reasonForLeaving: exp.reasonForLeaving
        })) || [])
      ],
      // Map documents from onboarding
      documents: [
        ...(onboarding.documents?.map(doc => ({
          type: doc.type === 'id_proof' ? 'id-proof' : 
                doc.type === 'address_proof' ? 'address-proof' : 
                doc.type === 'educational' ? 'educational' : 
                doc.type,
          name: doc.name,
          filePath: doc.url,
          uploadedAt: doc.uploadedAt
        })) || []),
        // Add candidate portal documents
        ...(onboarding.candidatePortal?.educationDocuments?.map(doc => ({
          type: 'educational',
          name: doc.name,
          filePath: doc.url,
          uploadedAt: doc.uploadedAt
        })) || []),
        ...(onboarding.candidatePortal?.workExperienceDocuments?.map(doc => ({
          type: 'experience',
          name: doc.name,
          filePath: doc.url,
          uploadedAt: doc.uploadedAt
        })) || [])
      ],
      additionalInfo: {
        onboardingId: onboarding._id,
        originalEmployeeId: onboarding.employeeId,
        onboardingCompletedAt: new Date(),
        temporaryPassword: temporaryPassword,
        
        // Personal details from candidate portal
        fatherName: candidatePersonalInfo.fatherName,
        personalEmailId: candidatePersonalInfo.personalEmailId,
        employeeCode: candidatePersonalInfo.employeeCode,
        employmentStatus: candidatePersonalInfo.employmentStatus,
        dobAsPerAadhaar: candidatePersonalInfo.dobAsPerAadhaar,
        
        // Store comprehensive onboarding data
        candidatePortalData: onboarding.candidatePortal || {},
        itSetupData: onboarding.itSetup || {},
        hrSetupData: onboarding.hrSetup || {},
        allEmergencyContacts: onboarding.emergencyContacts || [],
        passportNumber: onboarding.passportNumber,
        offerLetterData: onboarding.offerLetter || {},
        orientationData: onboarding.orientation || {},
        onboardingTasks: onboarding.tasks || [],
        stepProgress: onboarding.stepProgress || {},
        documentsStatus: onboarding.documentsStatus,
        documentsSubmittedAt: onboarding.documentsSubmittedAt,
        
        // Store detailed candidate portal data
        educationQualifications: onboarding.candidatePortal?.educationQualifications || [],
        workExperience: onboarding.candidatePortal?.workExperience || {},
        governmentDocuments: onboarding.candidatePortal?.governmentDocuments || {},
        bankDocuments: onboarding.candidatePortal?.bankDocuments || {},
        educationDocuments: onboarding.candidatePortal?.educationDocuments || [],
        workExperienceDocuments: onboarding.candidatePortal?.workExperienceDocuments || []
      }
    });

    // Don't set employeeId - let Employee model generate it automatically
    // This ensures proper sequential numbering starting from CODR0122

    await employee.save();
    console.log('✅ Created employee record:', employee.employeeId, 'for', onboarding.employeeName);

    return { 
      user, 
      employee, 
      department, 
      temporaryPassword,
      success: true,
      message: `Employee created successfully with ID: ${employee.employeeId}`
    };
  } catch (error) {
    console.error('Error creating employee from onboarding:', error);
    throw error;
  }
}

// Get managers for onboarding form
router.get('/managers', auth, async (req, res) => {
  try {
    // Find employees who are managers (have other employees reporting to them)
    // or have manager/lead roles in their designation
    const managers = await Employee.find({
      'employmentInfo.isActive': true,
      $or: [
        // Employees with manager/lead in their designation
        { 'employmentInfo.designation': { $regex: /manager|lead|head|director|ceo|cto|cfo|vp|vice president/i } },
        // Employees who have direct reports (are reporting managers for others)
        { '_id': { $in: await Employee.distinct('employmentInfo.reportingManager', { 'employmentInfo.isActive': true }) } }
      ]
    })
    .populate('employmentInfo.department', 'name code')
    .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.designation employmentInfo.department')
    .sort({ 'personalInfo.firstName': 1 });

    // Format the response for dropdown usage
    const formattedManagers = managers.map(manager => ({
      _id: manager._id,
      employeeId: manager.employeeId,
      name: `${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`,
      designation: manager.employmentInfo.designation,
      department: manager.employmentInfo.department?.name || 'Unknown',
      displayText: `${manager.personalInfo.firstName} ${manager.personalInfo.lastName} - ${manager.employmentInfo.designation} (${manager.employeeId})`
    }));

    res.json({
      managers: formattedManagers,
      total: formattedManagers.length
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all onboardings
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const onboardings = await Onboarding.find(query)
      .populate('reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('createdBy', 'profile.firstName profile.lastName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Onboarding.countDocuments(query);

    res.json({
      onboardings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get onboardings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all completed onboarding records that haven't been converted to employees
router.get('/ready-for-employee-creation', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const readyOnboardings = await Onboarding.find({
      status: 'completed',
      employeeCreated: { $ne: true }
    })
    .populate('createdBy', 'email profile')
    .populate('reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: readyOnboardings.length,
      onboardings: readyOnboardings
    });

  } catch (error) {
    console.error('Get ready onboardings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get ready onboarding records',
      error: error.message 
    });
  }
});

// Get single onboarding
router.get('/:id', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId employmentInfo.designation')
      .populate('createdBy', 'profile.firstName profile.lastName email')
      .populate('tasks.assignedTo', 'profile.firstName profile.lastName email')
      .populate('tasks.completedBy', 'profile.firstName profile.lastName email');

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    res.json(onboarding);
  } catch (error) {
    console.error('Get onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new onboarding
router.post('/', auth, async (req, res) => {
  try {
    const onboardingData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Initialize step progress
    onboardingData.stepProgress = {
      offer_letter: { completed: false },
      document_collection: { completed: false },
      background_verification: { completed: false },
      it_setup: { completed: false },
      hr_setup: { completed: false },
      orientation: { completed: false },
      manager_introduction: { completed: false },
      workspace_setup: { completed: false },
      training_schedule: { completed: false },
      completion: { completed: false }
    };

    const onboarding = new Onboarding(onboardingData);
    await onboarding.save();

    res.status(201).json({
      message: 'Onboarding created successfully',
      onboarding
    });
  } catch (error) {
    console.error('Create onboarding error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee with this email or ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create comprehensive onboarding with all features
router.post('/comprehensive', auth, async (req, res) => {
  try {
    const onboardingData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Initialize comprehensive step progress for all 10 steps
    onboardingData.stepProgress = {
      offer_letter: { completed: false }, // Step 1
      pre_onboarding: { completed: false }, // Step 2
      employee_info: { completed: true }, // Step 3 - Already captured
      task_assignment: { completed: false }, // Step 4
      document_verification: { completed: false }, // Step 5
      departmental_intro: { completed: false }, // Step 6
      orientation: { completed: false }, // Step 7
      digital_welcome: { completed: false }, // Step 8
      hardware_software: { completed: false }, // Step 9
      completion: { completed: false } // Step 10
    };

    const onboarding = new Onboarding(onboardingData);
    await onboarding.save();

    res.status(201).json({
      message: 'Comprehensive onboarding created successfully',
      onboarding
    });
  } catch (error) {
    console.error('Create comprehensive onboarding error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee with this email or ID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update onboarding
router.put('/:id', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    res.json({
      message: 'Onboarding updated successfully',
      onboarding
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete onboarding
router.delete('/:id', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndDelete(req.params.id);

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    // Clean up uploaded files
    if (onboarding.documents && onboarding.documents.length > 0) {
      onboarding.documents.forEach(doc => {
        if (doc.url && fs.existsSync(doc.url)) {
          fs.unlinkSync(doc.url);
        }
      });
    }

    res.json({ message: 'Onboarding deleted successfully' });
  } catch (error) {
    console.error('Delete onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete onboarding step
router.put('/:id/steps/:stepId/complete', auth, async (req, res) => {
  try {
    const { stepId } = req.params;
    const { completed = true } = req.body;
    
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }
    
    // Update step progress
    onboarding.updateStepProgress(stepId, completed);
    
    // Check if this is the completion step and onboarding is now completed
    if (stepId === 'completion' && completed && onboarding.status === 'completed') {
      try {
        // Check if employee already exists to avoid duplicates
        const existingEmployee = await Employee.findOne({
          'additionalInfo.onboardingId': onboarding._id
        });
        
        if (!existingEmployee) {
          console.log('Creating employee record for completed onboarding:', onboarding.employeeName);
          const { user, employee, department } = await createEmployeeFromOnboarding(onboarding);
          
          // Update onboarding with employee reference
          onboarding.employeeCreated = true;
          onboarding.employeeId = employee.employeeId;
          onboarding.notes = onboarding.notes || [];
          onboarding.notes.push({
            content: `Employee record created successfully. Employee ID: ${employee.employeeId}`,
            createdBy: req.user._id,
            createdAt: new Date()
          });
          
          console.log('✅ Successfully created employee:', employee.employeeId, 'for onboarding:', onboarding._id);
        } else {
          console.log('Employee already exists for onboarding:', onboarding._id);
        }
      } catch (employeeError) {
        console.error('Error creating employee record:', employeeError);
        // Don't fail the step completion, but log the error
        onboarding.notes = onboarding.notes || [];
        onboarding.notes.push({
          content: `Error creating employee record: ${employeeError.message}`,
          createdBy: req.user._id,
          createdAt: new Date(),
          type: 'issue'
        });
      }
    }
    
    await onboarding.save();
    
    res.json({
      message: `Step ${stepId} ${completed ? 'completed' : 'marked incomplete'}`,
      onboarding
    });
  } catch (error) {
    console.error('Complete step error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload documents
router.post('/:id/documents', auth, upload.array('documents', 10), async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    const uploadedDocs = req.files.map(file => ({
      type: req.body.type || 'other',
      name: file.originalname,
      url: file.path,
      uploadedAt: new Date(),
      status: 'uploaded'
    }));

    onboarding.documents.push(...uploadedDocs);
    await onboarding.save();

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add task
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    const task = onboarding.addTask(req.body);
    await onboarding.save();

    res.status(201).json({
      message: 'Task added successfully',
      task
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task status
router.put('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    const task = onboarding.updateTaskStatus(req.params.taskId, status, req.user._id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await onboarding.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add note
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { content, type = 'note' } = req.body;
    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    const note = {
      content,
      type,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    onboarding.notes.push(note);
    await onboarding.save();

    res.status(201).json({
      message: 'Note added successfully',
      note
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Offer acceptance routes (public)
router.get('/offer-acceptance/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // For demo purposes, using employeeId as token
    // In production, use JWT or secure token mechanism
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: { $in: ['offer_sent', 'offer_accepted', 'offer_rejected'] }
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Offer not found or expired' });
    }

    // Return offer details without sensitive information
    const offerData = {
      employeeId: onboarding.employeeId,
      employeeName: onboarding.employeeName,
      position: onboarding.position,
      department: onboarding.department,
      startDate: onboarding.startDate,
      offerLetter: onboarding.offerLetter,
      status: onboarding.status
    };

    res.json(offerData);
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/offer-acceptance/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { candidateSignature, acceptanceComments } = req.body;
    
    // Validate required fields
    if (!candidateSignature || !candidateSignature.data || !candidateSignature.name) {
      return res.status(400).json({ message: 'Digital signature is required to accept the offer' });
    }
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: 'offer_sent'
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Offer not found or already processed' });
    }

    // Update offer letter data
    onboarding.offerLetter.acceptedAt = new Date();
    onboarding.offerLetter.candidateSignature = {
      ...candidateSignature,
      timestamp: new Date()
    };
    onboarding.offerLetter.acceptanceComments = acceptanceComments || '';
    onboarding.offerLetter.status = 'accepted';
    
    // Mark offer letter step as complete (this will also update the main status)
    onboarding.updateStepProgress('offer_letter', true);
    
    await onboarding.save();

    console.log(`✅ Offer accepted by ${candidateSignature.name} for position ${onboarding.position}`);

    res.json({
      message: 'Offer accepted successfully',
      nextSteps: 'You will receive document upload instructions shortly.'
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify offer acceptance status
router.get('/offer-acceptance/:token/status', async (req, res) => {
  try {
    const { token } = req.params;
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: { $in: ['offer_sent', 'offer_accepted', 'offer_rejected'] }
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const hasValidSignature = onboarding.offerLetter?.candidateSignature?.data && 
                             onboarding.offerLetter?.candidateSignature?.name;

    res.json({
      status: onboarding.status,
      offerLetterStatus: onboarding.offerLetter?.status,
      hasSignature: hasValidSignature,
      acceptedAt: onboarding.offerLetter?.acceptedAt,
      candidateSignature: hasValidSignature ? {
        name: onboarding.offerLetter.candidateSignature.name,
        method: onboarding.offerLetter.candidateSignature.method,
        timestamp: onboarding.offerLetter.candidateSignature.timestamp
      } : null
    });
  } catch (error) {
    console.error('Get offer status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/offer-acceptance/:token/reject', async (req, res) => {
  try {
    const { token } = req.params;
    const { rejectionReason } = req.body;
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: 'offer_sent'
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Offer not found or already processed' });
    }

    // Update offer rejection
    onboarding.status = 'offer_rejected';
    onboarding.offerLetter.rejectedAt = new Date();
    onboarding.offerLetter.rejectionReason = rejectionReason;
    
    await onboarding.save();

    res.json({
      message: 'We understand your decision. Thank you for your time.'
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Document submission routes (public)
router.get('/offer-acceptance/:token/documents', async (req, res) => {
  try {
    const { token } = req.params;
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: { $in: ['offer_sent', 'offer_accepted', 'in_progress'] }
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Document access not found. Please check the link or contact HR for assistance.' });
    }

    res.json({
      employeeName: onboarding.employeeName,
      documents: onboarding.documents || [],
      documentsSubmitted: onboarding.documentsSubmitted || false,
      documentsStatus: onboarding.documentsStatus || 'pending'
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/offer-acceptance/:token/documents', upload.array('documents', 10), async (req, res) => {
  try {
    const { token } = req.params;
    const { documentType } = req.body;
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: { $in: ['offer_sent', 'offer_accepted', 'in_progress'] }
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Access denied or invalid token' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedDocs = req.files.map(file => ({
      type: documentType || 'other',
      name: file.originalname,
      url: file.path,
      uploadedAt: new Date(),
      status: 'uploaded'
    }));

    onboarding.documents.push(...uploadedDocs);
    await onboarding.save();

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });
  } catch (error) {
    console.error('Upload candidate documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/offer-acceptance/:token/submit-documents', async (req, res) => {
  try {
    const { token } = req.params;
    
    const onboarding = await Onboarding.findOne({ 
      employeeId: token,
      status: { $in: ['offer_sent', 'offer_accepted', 'in_progress'] }
    });

    if (!onboarding) {
      return res.status(404).json({ message: 'Access denied or invalid token' });
    }

    // Mark documents as submitted
    onboarding.documentsSubmitted = true;
    onboarding.documentsSubmittedAt = new Date();
    onboarding.documentsStatus = 'submitted_for_review';
    onboarding.status = 'documents_pending';
    
    // Mark document collection step as complete
    onboarding.updateStepProgress('document_collection', true);
    
    await onboarding.save();

    res.json({
      message: 'Documents submitted successfully for HR review',
      status: 'submitted_for_review'
    });
  } catch (error) {
    console.error('Submit documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Document link recovery
router.post('/get-document-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const onboarding = await Onboarding.findOne({ 
      email: email.toLowerCase(),
      status: 'offer_accepted'
    });

    if (!onboarding) {
      return res.status(404).json({ 
        message: 'No pending document submission found for this email' 
      });
    }

    // Return the document link (in production, send via email)
    res.json({
      message: 'Document link found',
      employeeName: onboarding.employeeName,
      documentLink: `/candidate-documents/${onboarding.employeeId}`,
      employeeId: onboarding.employeeId
    });
  } catch (error) {
    console.error('Get document link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create/Update offer letter
router.post('/offer-letter', auth, async (req, res) => {
  try {
    const { onboardingId, ...offerData } = req.body;
    
    if (!onboardingId) {
      return res.status(400).json({ message: 'Onboarding ID is required' });
    }

    // Validate required fields for offer letter
    if (!offerData.reportingManager) {
      return res.status(400).json({ 
        message: 'Reporting Manager is required for offer letter creation',
        field: 'reportingManager'
      });
    }

    // Validate other essential fields
    const requiredFields = ['position', 'department', 'salary'];
    for (const field of requiredFields) {
      if (!offerData[field]) {
        return res.status(400).json({ 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          field: field
        });
      }
    }

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    // Verify that the reporting manager exists in the Employee collection
    const Employee = require('../models/Employee');
    const reportingManager = await Employee.findById(offerData.reportingManager);
    if (!reportingManager) {
      return res.status(400).json({ 
        message: 'Selected reporting manager not found',
        field: 'reportingManager'
      });
    }

    // Update or create offer letter
    onboarding.offerLetter = {
      ...onboarding.offerLetter,
      ...offerData,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };

    await onboarding.save();

    res.json({
      message: 'Offer letter saved successfully',
      offerLetter: onboarding.offerLetter
    });
  } catch (error) {
    console.error('Create/Update offer letter error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get offer letter by onboarding ID
router.get('/:id/offer-letter', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('createdBy', 'profile.firstName profile.lastName email');

    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    res.json({
      offerLetter: onboarding.offerLetter || null,
      candidateInfo: {
        employeeName: onboarding.employeeName,
        email: onboarding.email,
        phone: onboarding.phone,
        position: onboarding.position,
        department: onboarding.department,
        startDate: onboarding.startDate,
        salary: onboarding.salary
      }
    });
  } catch (error) {
    console.error('Get offer letter error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send offer letter to candidate
router.post('/:id/send-offer-letter', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    if (!onboarding.offerLetter) {
      return res.status(400).json({ message: 'Offer letter not created yet' });
    }

    // Update offer letter status and send timestamp
    onboarding.offerLetter.sentAt = new Date();
    onboarding.offerLetter.status = 'sent'; // Set offer letter status to 'sent'
    onboarding.status = 'offer_sent';
    onboarding.currentStep = 'offer_letter';

    // Mark offer letter step as in progress (not completed until accepted)
    onboarding.updateStepProgress('offer_letter', false);

    await onboarding.save();

    // Here you would integrate with email service to send the actual offer letter
    // For now, we'll simulate sending
    try {
      const { sendOfferLetterEmail } = require('../services/emailService');
      await sendOfferLetterEmail({
        candidateName: onboarding.employeeName,
        candidateEmail: onboarding.email,
        candidateId: onboarding.employeeId,
        position: onboarding.position,
        department: onboarding.department,
        offerLetterUrl: `/offer-acceptance/${onboarding.employeeId}`,
        companyName: process.env.COMPANY_NAME || 'Rannkly HR'
      });
      
      console.log('✅ Offer letter email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Don't fail the API call if email fails
    }

    res.json({
      message: 'Offer letter sent successfully',
      offerLetterUrl: `/offer-acceptance/${onboarding.employeeId}`,
      sentAt: onboarding.offerLetter.sentAt
    });
  } catch (error) {
    console.error('Send offer letter error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate offer letter (legacy endpoint for backward compatibility)
router.post('/generate-offer-letter', auth, async (req, res) => {
  try {
    const { onboardingId, ...offerData } = req.body;
    
    // Here you would integrate with PDF generation library
    // For now, we'll just save the offer letter data
    const onboarding = await Onboarding.findByIdAndUpdate(
      onboardingId,
      {
        offerLetter: {
          ...offerData,
          generatedAt: new Date(),
          generatedBy: req.user._id
        }
      },
      { new: true }
    );

    res.json({
      message: 'Offer letter generated successfully',
      offerLetter: onboarding.offerLetter
    });
  } catch (error) {
    console.error('Generate offer letter error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send document request
router.post('/:id/send-document-request', auth, async (req, res) => {
  try {
    const { checklist, candidateEmail } = req.body;
    
    // Here you would send email with document checklist
    // For now, we'll just update the onboarding record
    await Onboarding.findByIdAndUpdate(req.params.id, {
      documentRequestSent: true,
      documentRequestSentAt: new Date(),
      documentChecklist: checklist
    });

    res.json({
      message: 'Document request sent successfully'
    });
  } catch (error) {
    console.error('Send document request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send welcome kit
router.post('/:id/send-welcome-kit', auth, async (req, res) => {
  try {
    const { items, candidateEmail } = req.body;
    
    // Here you would send email with welcome kit materials
    // For now, we'll just update the onboarding record
    await Onboarding.findByIdAndUpdate(req.params.id, {
      welcomeKitSent: true,
      welcomeKitSentAt: new Date(),
      welcomeKitItems: items
    });

    res.json({
      message: 'Welcome kit sent successfully'
    });
  } catch (error) {
    console.error('Send welcome kit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update document status
router.put('/:id/document-status', auth, async (req, res) => {
  try {
    const { categoryId, documentId, status, comments } = req.body;
    
    // Here you would update the specific document status
    // This is a simplified implementation
    res.json({
      message: 'Document status updated successfully'
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks for onboarding
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    res.json({
      tasks: onboarding.tasks || []
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create tasks in bulk
router.post('/:id/tasks/bulk', auth, async (req, res) => {
  try {
    const { tasks } = req.body;
    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    const newTasks = tasks.map(task => ({
      ...task,
      id: new Date().getTime() + Math.random(),
      createdAt: new Date(),
      createdBy: req.user._id
    }));

    onboarding.tasks.push(...newTasks);
    await onboarding.save();

    res.json({
      message: 'Tasks created successfully',
      tasks: newTasks
    });
  } catch (error) {
    console.error('Create bulk tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create candidate portal credentials
router.post('/:id/create-portal-access', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    // Check if portal access already exists (allow regeneration)
    const isRegeneration = onboarding.candidatePortal && onboarding.candidatePortal.isActive;
    if (isRegeneration) {
      console.log('🔄 Regenerating existing portal credentials for:', onboarding.employeeId);
    }

    // Generate random password
    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Initialize or update candidatePortal with proper structure
    if (!onboarding.candidatePortal) {
      onboarding.candidatePortal = {};
    }
    
    // Set portal credentials and initialize structure
    onboarding.candidatePortal.password = hashedPassword;
    onboarding.candidatePortal.plainTextPassword = plainPassword; // Store for HR reference
    onboarding.candidatePortal.isActive = true;
    onboarding.candidatePortal.isSubmitted = false;
    onboarding.candidatePortal.lastUpdated = new Date();
    onboarding.candidatePortal.createdAt = new Date();
    onboarding.candidatePortal.createdBy = req.user._id;
    onboarding.candidatePortal.accessCount = 0;
    
    // Initialize nested objects only if they don't exist
    if (!onboarding.candidatePortal.personalInfo) {
      onboarding.candidatePortal.personalInfo = {};
    }
    if (!onboarding.candidatePortal.addressInfo) {
      onboarding.candidatePortal.addressInfo = {
        currentAddress: {},
        permanentAddress: {}
      };
    }
    if (!onboarding.candidatePortal.educationHistory) {
      onboarding.candidatePortal.educationHistory = [];
    }
    if (!onboarding.candidatePortal.workExperience) {
      onboarding.candidatePortal.workExperience = [];
    }
    if (!onboarding.candidatePortal.emergencyContacts) {
      onboarding.candidatePortal.emergencyContacts = [];
    }
    if (!onboarding.candidatePortal.bankDetails) {
      onboarding.candidatePortal.bankDetails = {};
    }
    if (!onboarding.candidatePortal.additionalInfo) {
      onboarding.candidatePortal.additionalInfo = {};
    }

    await onboarding.save();

    // Try to send credentials via email
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendPortalCredentials({
        candidateName: onboarding.employeeName,
        candidateEmail: onboarding.email,
        candidateId: onboarding.employeeId,
        temporaryPassword: plainPassword,
        portalUrl: `/candidate-portal/${onboarding.employeeId}`,
        companyName: process.env.COMPANY_NAME || 'Rannkly HR'
      });
      emailSent = true;
      console.log('✅ Portal credentials email sent successfully');
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr.message);
      emailError = emailErr.message.includes('not configured') 
        ? 'Email service not configured. Please set up EMAIL_USER and EMAIL_APP_PASSWORD in environment variables.'
        : 'Failed to send email. Please share credentials manually.';
    }

    // Always return success response (portal was created successfully)
    res.json({
      message: emailSent 
        ? (isRegeneration ? 'Portal credentials regenerated and sent via email' : 'Portal access created and credentials sent via email')
        : (isRegeneration ? 'Portal credentials regenerated successfully' : 'Portal access created successfully'),
      candidateId: onboarding.employeeId,
      temporaryPassword: emailSent ? undefined : plainPassword, // Only show password if email failed
      portalUrl: `/candidate-portal/${onboarding.employeeId}`,
      emailSent,
      emailError,
      isRegeneration
    });

  } catch (error) {
    console.error('Create portal access error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get portal credentials (for HR)
router.get('/:id/portal-credentials', auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('candidatePortal.createdBy', 'email')
      .select('employeeId employeeName email candidatePortal.password candidatePortal.plainTextPassword candidatePortal.isActive candidatePortal.createdAt candidatePortal.createdBy candidatePortal.lastAccessed candidatePortal.accessCount');
    
    if (!onboarding) {
      return res.status(404).json({ message: 'Onboarding not found' });
    }

    if (!onboarding.candidatePortal || !onboarding.candidatePortal.isActive) {
      return res.status(404).json({ 
        message: 'No portal credentials found for this candidate',
        hasPortalAccess: false
      });
    }

    // Return credentials info (excluding hashed password)
    res.json({
      candidateId: onboarding.employeeId,
      candidateName: onboarding.employeeName,
      candidateEmail: onboarding.email,
      portalUrl: `/candidate-portal/${onboarding.employeeId}`,
      credentials: {
        password: onboarding.candidatePortal.plainTextPassword || '[Credentials created before password storage was implemented - Please recreate portal access]',
        isActive: onboarding.candidatePortal.isActive,
        createdAt: onboarding.candidatePortal.createdAt,
        createdBy: onboarding.candidatePortal.createdBy?.email || 'Unknown',
        lastAccessed: onboarding.candidatePortal.lastAccessed,
        accessCount: onboarding.candidatePortal.accessCount || 0
      },
      hasPortalAccess: true
    });

  } catch (error) {
    console.error('Get portal credentials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get offer letter templates
router.get('/offer-letter-templates', auth, async (req, res) => {
  try {
    // Return predefined templates
    const templates = [
      { id: 'standard', name: 'Standard Template', description: 'Default offer letter template' },
      { id: 'executive', name: 'Executive Template', description: 'Template for executive positions' },
      { id: 'intern', name: 'Intern Template', description: 'Template for internship offers' }
    ];

    res.json({
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Analytics endpoints
router.get('/analytics/dashboard', auth, async (req, res) => {
  try {
    const [
      totalOnboardings,
      activeOnboardings,
      completedOnboardings,
      pendingReview,
      statusBreakdown,
      departmentBreakdown
    ] = await Promise.all([
      Onboarding.countDocuments(),
      Onboarding.countDocuments({ 
        status: { $in: ['in_progress', 'offer_accepted', 'offer_sent'] } 
      }),
      Onboarding.countDocuments({ status: 'completed' }),
      Onboarding.countDocuments({ status: 'documents_pending' }),
      Onboarding.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Onboarding.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      summary: {
        total: totalOnboardings,
        active: activeOnboardings,
        completed: completedOnboardings,
        pendingReview
      },
      statusBreakdown,
      departmentBreakdown
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual endpoint to create employee from completed onboarding
router.post('/:id/create-employee', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }

    // Check if onboarding is completed
    if (onboarding.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Onboarding must be completed before creating employee record' 
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      'additionalInfo.onboardingId': onboarding._id
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: `Employee already exists with ID: ${existingEmployee.employeeId}`,
        employee: existingEmployee,
        suggestion: 'Use sync-to-employee endpoint to update existing employee record'
      });
    }

    // Create employee record
    const result = await createEmployeeFromOnboarding(onboarding);
    
    // Update onboarding record
    onboarding.employeeCreated = true;
    onboarding.employeeId = result.employee.employeeId;
    onboarding.notes = onboarding.notes || [];
    onboarding.notes.push({
      content: `Employee record created manually by ${req.user.profile?.firstName || req.user.email}. Employee ID: ${result.employee.employeeId}. Temporary password: ${result.temporaryPassword}`,
      createdBy: req.user._id,
      createdAt: new Date()
    });
    
    await onboarding.save();

    // Send email with login credentials (optional - implement email service)
    // await sendEmployeeCredentialsEmail(result.employee, result.temporaryPassword);

    res.json({
      success: true,
      message: `Employee created successfully with ID: ${result.employee.employeeId}`,
      data: {
        employee: result.employee,
        user: {
          email: result.user.email,
          role: result.user.role,
          temporaryPassword: result.temporaryPassword
        },
        department: result.department
      }
    });

  } catch (error) {
    console.error('Manual employee creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create employee record',
      error: error.message 
    });
  }
});

// Helper function to sync onboarding data to existing employee record
async function syncOnboardingToEmployee(onboarding, employee, user) {
  try {
    const candidatePersonalInfo = onboarding.candidatePortal?.personalInfo || {};
    const changes = [];

    // Track changes for audit log
    const trackChange = (field, oldValue, newValue) => {
      if (oldValue !== newValue && newValue !== undefined && newValue !== null) {
        changes.push({ field, oldValue, newValue });
      }
    };

    // Update personal information
    const firstName = candidatePersonalInfo.firstName || onboarding.employeeName.split(' ')[0];
    const lastName = candidatePersonalInfo.lastName || onboarding.employeeName.split(' ').slice(-1)[0];
    
    trackChange('personalInfo.firstName', employee.personalInfo.firstName, firstName);
    trackChange('personalInfo.lastName', employee.personalInfo.lastName, lastName);
    
    employee.personalInfo.firstName = firstName;
    employee.personalInfo.lastName = lastName;
    
    if (candidatePersonalInfo.phone || onboarding.phone) {
      const newPhone = candidatePersonalInfo.phone || onboarding.phone;
      trackChange('personalInfo.phone', employee.personalInfo.phone, newPhone);
      employee.personalInfo.phone = newPhone;
    }

    if (candidatePersonalInfo.email || onboarding.email) {
      const newEmail = candidatePersonalInfo.email || onboarding.email;
      trackChange('personalInfo.email', employee.personalInfo.email, newEmail);
      employee.personalInfo.email = newEmail;
    }

    if (candidatePersonalInfo.dateOfBirth || onboarding.dateOfBirth) {
      const newDOB = candidatePersonalInfo.dateOfBirth || onboarding.dateOfBirth;
      trackChange('personalInfo.dateOfBirth', employee.personalInfo.dateOfBirth, newDOB);
      employee.personalInfo.dateOfBirth = newDOB;
    }

    // Update other personal fields
    const personalFields = ['gender', 'maritalStatus', 'nationality', 'bloodGroup', 'aadharNumber', 'panNumber'];
    personalFields.forEach(field => {
      if (candidatePersonalInfo[field]) {
        trackChange(`personalInfo.${field}`, employee.personalInfo[field], candidatePersonalInfo[field]);
        employee.personalInfo[field] = candidatePersonalInfo[field];
      }
    });

    // Update employment information
    if (onboarding.position) {
      trackChange('employmentInfo.designation', employee.employmentInfo.designation, onboarding.position);
      employee.employmentInfo.designation = onboarding.position;
    }

    if (candidatePersonalInfo.dateOfJoining || onboarding.startDate) {
      const newJoiningDate = candidatePersonalInfo.dateOfJoining || onboarding.startDate;
      trackChange('employmentInfo.dateOfJoining', employee.employmentInfo.dateOfJoining, newJoiningDate);
      employee.employmentInfo.dateOfJoining = newJoiningDate;
    }
    
    // Update reporting manager if available
    if (onboarding.reportingManager || onboarding.offerLetter?.reportingManager) {
      const newManager = onboarding.reportingManager || onboarding.offerLetter?.reportingManager;
      trackChange('employmentInfo.reportingManager', employee.employmentInfo.reportingManager, newManager);
      employee.employmentInfo.reportingManager = newManager;
    }

    // Update contact information
    if (candidatePersonalInfo.personalEmailId) {
      trackChange('contactInfo.personalEmail', employee.contactInfo.personalEmail, candidatePersonalInfo.personalEmailId);
      employee.contactInfo.personalEmail = candidatePersonalInfo.personalEmailId;
    }

    if (candidatePersonalInfo.alternatePhone) {
      trackChange('contactInfo.alternatePhone', employee.contactInfo.alternatePhone, candidatePersonalInfo.alternatePhone);
      employee.contactInfo.alternatePhone = candidatePersonalInfo.alternatePhone;
    }

    // Update address information
    if (onboarding.candidatePortal?.addressInfo) {
      const addressInfo = onboarding.candidatePortal.addressInfo;
      if (addressInfo.currentAddress) {
        employee.contactInfo.address = employee.contactInfo.address || {};
        employee.contactInfo.address.current = addressInfo.currentAddress;
        changes.push({ field: 'contactInfo.address.current', oldValue: 'previous', newValue: 'updated' });
      }
      if (addressInfo.permanentAddress) {
        employee.contactInfo.address = employee.contactInfo.address || {};
        employee.contactInfo.address.permanent = addressInfo.permanentAddress;
        changes.push({ field: 'contactInfo.address.permanent', oldValue: 'previous', newValue: 'updated' });
      }
    }

    // Update emergency contacts
    if (onboarding.candidatePortal?.emergencyContacts?.length > 0) {
      employee.contactInfo.emergencyContact = onboarding.candidatePortal.emergencyContacts.map(contact => ({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email,
        address: contact.address
      }));
      changes.push({ field: 'contactInfo.emergencyContact', oldValue: 'previous', newValue: `${onboarding.candidatePortal.emergencyContacts.length} contacts` });
    }

    // Update education and experience
    if (onboarding.candidatePortal?.educationQualifications?.length > 0) {
      employee.education = onboarding.candidatePortal.educationQualifications.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        yearOfPassing: edu.yearOfPassing,
        percentage: edu.percentage,
        specialization: edu.specialization
      }));
      changes.push({ field: 'education', oldValue: 'previous', newValue: `${onboarding.candidatePortal.educationQualifications.length} qualifications` });
    }

    if (onboarding.candidatePortal?.workExperience?.experienceDetails?.length > 0) {
      employee.experience = onboarding.candidatePortal.workExperience.experienceDetails.map(exp => ({
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate,
        salary: exp.salary,
        reasonForLeaving: exp.reasonForLeaving
      }));
      changes.push({ field: 'experience', oldValue: 'previous', newValue: `${onboarding.candidatePortal.workExperience.experienceDetails.length} experiences` });
    }

    // Update additional info with latest onboarding data
    employee.additionalInfo = {
      ...employee.additionalInfo,
      lastSyncedAt: new Date(),
      syncedBy: user._id,
      candidatePortalData: onboarding.candidatePortal || {},
      itSetupData: onboarding.itSetup || {},
      hrSetupData: onboarding.hrSetup || {},
      offerLetterData: onboarding.offerLetter || {},
      stepProgress: onboarding.stepProgress || {},
      educationQualifications: onboarding.candidatePortal?.educationQualifications || [],
      workExperience: onboarding.candidatePortal?.workExperience || {},
      governmentDocuments: onboarding.candidatePortal?.governmentDocuments || {},
      bankDocuments: onboarding.candidatePortal?.bankDocuments || {},
      educationDocuments: onboarding.candidatePortal?.educationDocuments || [],
      workExperienceDocuments: onboarding.candidatePortal?.workExperienceDocuments || []
    };

    // Add audit log entry
    employee.auditLog = employee.auditLog || [];
    employee.auditLog.push({
      action: 'sync_from_onboarding',
      field: 'employee_data',
      changes: changes,
      modifiedBy: user._id,
      modifiedAt: new Date(),
      source: 'onboarding_sync'
    });

    await employee.save();

    return {
      success: true,
      changesCount: changes.length,
      changes: changes,
      message: `Employee record synced successfully. ${changes.length} fields updated.`
    };

  } catch (error) {
    console.error('Error syncing onboarding to employee:', error);
    throw error;
  }
}

// New endpoint to sync onboarding changes to existing employee record
router.post('/:id/sync-to-employee', auth, authorize(['admin', 'hr']), async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }

    // Find existing employee
    const existingEmployee = await Employee.findOne({
      'additionalInfo.onboardingId': onboarding._id
    });

    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false, 
        message: 'No employee record found for this onboarding. Use create-employee endpoint first.',
        suggestion: 'Use POST /:id/create-employee to create the employee record'
      });
    }

    // Perform sync
    const syncResult = await syncOnboardingToEmployee(onboarding, existingEmployee, req.user);

    // Update onboarding record with sync info
    onboarding.notes = onboarding.notes || [];
    onboarding.notes.push({
      content: `Employee record synced by ${req.user.profile?.firstName || req.user.email}. ${syncResult.changesCount} fields updated.`,
      createdBy: req.user._id,
      createdAt: new Date()
    });
    
    await onboarding.save();

    // Get updated employee with populated fields
    const updatedEmployee = await Employee.findById(existingEmployee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive');

    res.json({
      success: true,
      message: syncResult.message,
      data: {
        employee: updatedEmployee,
        changes: syncResult.changes,
        changesCount: syncResult.changesCount,
        syncedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error syncing onboarding to employee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
