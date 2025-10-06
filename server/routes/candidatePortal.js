console.log('🔥 CANDIDATE PORTAL ROUTES LOADED - NEW VERSION!');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Onboarding = require('../models/Onboarding');
const Employee = require('../models/Employee');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/onboarding';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.fieldname === 'bankStatement') {
      // Allow images and PDFs for bank statements
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Bank statement must be an image or PDF file'));
      }
    } else {
      // Allow only images for other uploads
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  }
});

// Upload image file
router.post('/:candidateId/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { imageType, section } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Find the onboarding record
    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Create the image data object
    // Extract timestamp from the generated filename to ensure consistency
    const filenameTimestamp = req.file.filename.match(/(document|image)-(\d+)-/);
    const documentId = filenameTimestamp ? filenameTimestamp[2] : Date.now().toString();
    
    const imageData = {
      id: documentId,
      name: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date(),
      status: 'uploaded',
      url: `/uploads/onboarding/${req.file.filename}`, // Permanent URL
      filename: req.file.filename // Store the actual filename for direct lookup
    };

    // Initialize candidatePortal if it doesn't exist
    if (!onboarding.candidatePortal) {
      onboarding.candidatePortal = {};
    }

    // Update the appropriate section based on imageType and section
    if (section === 'personal' && imageType === 'profilePhoto') {
      if (!onboarding.candidatePortal.personalInfo) {
        onboarding.candidatePortal.personalInfo = {};
      }
      onboarding.candidatePortal.personalInfo.profilePhoto = imageData;
    } else if (section === 'government') {
      if (!onboarding.candidatePortal.governmentDocuments) {
        onboarding.candidatePortal.governmentDocuments = {};
      }
      onboarding.candidatePortal.governmentDocuments[imageType] = imageData;
    } else if (section === 'bank') {
      if (!onboarding.candidatePortal.bankDocuments) {
        onboarding.candidatePortal.bankDocuments = {};
      }
      onboarding.candidatePortal.bankDocuments[imageType] = imageData;
    } else if (section === 'education') {
      // Handle education document uploads
      console.log('📚 Processing education document upload for candidate:', candidateId);
      if (!onboarding.candidatePortal.educationDocuments) {
        onboarding.candidatePortal.educationDocuments = [];
        console.log('📚 Initialized educationDocuments array');
      }
      // Add to education documents array
      onboarding.candidatePortal.educationDocuments.push(imageData);
      console.log('📚 Added document to educationDocuments:', imageData.name);
      console.log('📚 Total education documents:', onboarding.candidatePortal.educationDocuments.length);
    } else if (section === 'work_experience') {
      // Handle work experience document uploads
      console.log('💼 Processing work experience document upload for candidate:', candidateId);
      if (!onboarding.candidatePortal.workExperienceDocuments) {
        onboarding.candidatePortal.workExperienceDocuments = [];
        console.log('💼 Initialized workExperienceDocuments array');
      }
      // Add to work experience documents array with type
      const workDocumentData = { ...imageData, type: imageType };
      onboarding.candidatePortal.workExperienceDocuments.push(workDocumentData);
      console.log('💼 Added document to workExperienceDocuments:', imageData.name, 'Type:', imageType);
      console.log('💼 Total work experience documents:', onboarding.candidatePortal.workExperienceDocuments.length);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid section or imageType'
      });
    }

    // Save the updated onboarding record
    console.log('💾 Saving onboarding record for candidate:', candidateId);
    console.log('💾 Section:', section, 'ImageType:', imageType);
    
    try {
    await onboarding.save();
      console.log('✅ Successfully saved onboarding record');
    } catch (saveError) {
      console.error('❌ Error saving onboarding record:', saveError);
      throw saveError;
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageData: imageData
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Authenticate candidate
router.post('/authenticate', async (req, res) => {
  try {
    const { candidateId, password } = req.body;

    if (!candidateId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Candidate ID and password are required' 
      });
    }

    // Find onboarding record by candidate ID
    const onboarding = await Onboarding.findOne({ 
      employeeId: candidateId,
      status: { $in: ['offer_sent', 'offer_accepted', 'documents_pending', 'in_progress', 'completed'] }
    });

    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid candidate ID or no active onboarding found' 
      });
    }

    // Fetch reporting manager information if available
    let reportingManagerName = '';
    const reportingManagerId = onboarding.reportingManager || onboarding.offerLetter?.reportingManager;
    if (reportingManagerId) {
      try {
        const manager = await Employee.findById(reportingManagerId).populate('user', 'profile');
        if (manager) {
          reportingManagerName = `${manager.personalInfo?.firstName || ''} ${manager.personalInfo?.lastName || ''}`.trim() ||
                                 `${manager.user?.profile?.firstName || ''} ${manager.user?.profile?.lastName || ''}`.trim() ||
                                 manager.employeeId || 'Unknown Manager';
        }
      } catch (error) {
        console.error('Error fetching reporting manager:', error);
      }
    }

    // Check if candidate portal password is set
    if (!onboarding.candidatePortal || !onboarding.candidatePortal.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Portal access not yet activated. Please contact HR.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, onboarding.candidatePortal.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Update last accessed time and increment access count
    onboarding.candidatePortal.lastAccessed = new Date();
    onboarding.candidatePortal.accessCount = (onboarding.candidatePortal.accessCount || 0) + 1;
    await onboarding.save();

    // Return candidate data with auto-filled information from onboarding record
    console.log('🔍 Loading candidate data for:', candidateId);
    console.log('📊 Onboarding record fields:');
    console.log('   - employeeName:', onboarding.employeeName);
    console.log('   - email:', onboarding.email);
    console.log('   - phone:', onboarding.phone);
    console.log('   - position:', onboarding.position);
    console.log('   - department:', onboarding.department);
    console.log('   - gender:', onboarding.gender);
    console.log('   - dateOfBirth:', onboarding.dateOfBirth);
    console.log('   - startDate:', onboarding.startDate);
    console.log('   - employmentType:', onboarding.employmentType);
    console.log('📊 Existing candidatePortal data:', JSON.stringify(onboarding.candidatePortal, null, 2));
    
    const candidateData = {
      personalInfo: {
        // Start with existing candidate portal data
        ...(onboarding.candidatePortal.personalInfo || {}),
        // Then auto-fill from onboarding record (this will override empty/missing fields)
        email: onboarding.email || onboarding.candidatePortal.personalInfo?.email || '',
        employeeCode: onboarding.employeeId || onboarding.candidatePortal.personalInfo?.employeeCode || '',
        fullName: onboarding.employeeName || onboarding.candidatePortal.personalInfo?.fullName || '',
        mobileNumber: onboarding.phone || onboarding.candidatePortal.personalInfo?.mobileNumber || '',
        alternatePhone: onboarding.alternatePhone || onboarding.candidatePortal.personalInfo?.alternatePhone || '',
        gender: onboarding.gender || onboarding.candidatePortal.personalInfo?.gender || '',
        maritalStatus: onboarding.maritalStatus || onboarding.candidatePortal.personalInfo?.maritalStatus || '',
        employeeDOB: onboarding.dateOfBirth || onboarding.candidatePortal.personalInfo?.employeeDOB || null,
        dateOfJoining: onboarding.startDate || onboarding.candidatePortal.personalInfo?.dateOfJoining || null,
        employmentStatus: onboarding.candidatePortal.personalInfo?.employmentStatus || onboarding.employmentType || 'permanent',
        panNumber: onboarding.panNumber || onboarding.candidatePortal.personalInfo?.panNumber || '',
        aadhaarNumber: onboarding.aadharNumber || onboarding.candidatePortal.personalInfo?.aadhaarNumber || '',
        nationality: onboarding.nationality || onboarding.candidatePortal.personalInfo?.nationality || 'Indian',
        designation: onboarding.position || onboarding.candidatePortal.personalInfo?.designation || '',
        department: onboarding.department || onboarding.candidatePortal.personalInfo?.department || '',
        reportingManager: reportingManagerName || onboarding.candidatePortal.personalInfo?.reportingManager || '',
        reportingManagerId: reportingManagerId || '',
        // Additional fields that might be missing
        fatherName: onboarding.fatherName || onboarding.candidatePortal.personalInfo?.fatherName || '',
        bloodGroup: onboarding.bloodGroup || onboarding.candidatePortal.personalInfo?.bloodGroup || '',
        personalEmailId: onboarding.personalEmailId || onboarding.candidatePortal.personalInfo?.personalEmailId || '',
        officialEmailId: onboarding.email || onboarding.candidatePortal.personalInfo?.officialEmailId || ''
      },
      addressInfo: {
        currentAddress: {
          // Prioritize onboarding record data over candidate portal data
          street: onboarding.currentAddress?.street || onboarding.candidatePortal?.addressInfo?.currentAddress?.street || '',
          city: onboarding.currentAddress?.city || onboarding.candidatePortal?.addressInfo?.currentAddress?.city || '',
          state: onboarding.currentAddress?.state || onboarding.candidatePortal?.addressInfo?.currentAddress?.state || '',
          pincode: onboarding.currentAddress?.pincode || onboarding.candidatePortal?.addressInfo?.currentAddress?.pincode || '',
          country: onboarding.currentAddress?.country || onboarding.candidatePortal?.addressInfo?.currentAddress?.country || 'India'
        },
        permanentAddress: {
          street: onboarding.permanentAddress?.street || onboarding.candidatePortal?.addressInfo?.permanentAddress?.street || '',
          city: onboarding.permanentAddress?.city || onboarding.candidatePortal?.addressInfo?.permanentAddress?.city || '',
          state: onboarding.permanentAddress?.state || onboarding.candidatePortal?.addressInfo?.permanentAddress?.state || '',
          pincode: onboarding.permanentAddress?.pincode || onboarding.candidatePortal?.addressInfo?.permanentAddress?.pincode || '',
          country: onboarding.permanentAddress?.country || onboarding.candidatePortal?.addressInfo?.permanentAddress?.country || 'India',
          sameAsPresent: onboarding.permanentAddress?.sameAsCurrent || onboarding.candidatePortal?.addressInfo?.permanentAddress?.sameAsPresent || false
        }
      },
      emergencyContacts: onboarding.emergencyContacts && onboarding.emergencyContacts.length > 0 
        ? onboarding.emergencyContacts 
        : (onboarding.candidatePortal.emergencyContacts || [{
            name: '',
            relationship: '',
            phone: '',
            email: '',
            address: ''
          }]),
      bankDetails: onboarding.candidatePortal.bankDetails && Array.isArray(onboarding.candidatePortal.bankDetails) && onboarding.candidatePortal.bankDetails.length > 0
        ? onboarding.candidatePortal.bankDetails
        : [{
            ifscCode: onboarding.bankDetails?.ifscCode || '',
            bankName: onboarding.bankDetails?.bankName || '',
            accountNumber: onboarding.bankDetails?.accountNumber || '',
            accountHolderName: onboarding.bankDetails?.accountHolderName || '',
            branch: onboarding.bankDetails?.branch || '',
            pfEligible: '',
            uanNumber: '',
            isPrimary: true
          }],
      educationQualifications: onboarding.candidatePortal.educationQualifications && Array.isArray(onboarding.candidatePortal.educationQualifications) && onboarding.candidatePortal.educationQualifications.length > 0
        ? onboarding.candidatePortal.educationQualifications
        : (onboarding.education && onboarding.education.length > 0 
          ? onboarding.education.map(edu => ({
              educationLevel: edu.educationLevel || 'other',
              degree: edu.degree || '',
              institution: edu.institution || '',
              yearOfPassing: edu.yearOfPassing || '',
              percentage: edu.percentage || '',
              specialization: edu.specialization || '',
              documents: []
            }))
          : []),
      workExperience: {
        totalExperience: onboarding.candidatePortal.workExperience?.totalExperience || '',
        experienceDetails: onboarding.candidatePortal.workExperience?.experienceDetails && Array.isArray(onboarding.candidatePortal.workExperience.experienceDetails) && onboarding.candidatePortal.workExperience.experienceDetails.length > 0
          ? onboarding.candidatePortal.workExperience.experienceDetails
          : (onboarding.experience && onboarding.experience.length > 0 
            ? onboarding.experience.map(exp => ({
                company: exp.company || '',
                position: exp.position || '',
                startDate: exp.startDate || null,
                endDate: exp.endDate || null,
                salary: exp.salary || '',
                reasonForLeaving: exp.reasonForLeaving || '',
                documents: {
                  experienceLetters: [],
                  relievingCertificate: [],
                  salarySlips: []
                }
              }))
            : [])
      },
      additionalInfo: {
        skills: '',
        languages: '',
        references: '',
        // Merge with any existing candidate portal data
        ...(onboarding.candidatePortal.additionalInfo || {})
      },
      uploadedDocuments: onboarding.candidatePortal.uploadedDocuments || []
    };

    console.log('🚀 Sending candidate data to frontend:');
    console.log('   - personalInfo.fullName:', candidateData.personalInfo.fullName);
    console.log('   - personalInfo.email:', candidateData.personalInfo.email);
    console.log('   - personalInfo.mobileNumber:', candidateData.personalInfo.mobileNumber);
    console.log('   - personalInfo.designation:', candidateData.personalInfo.designation);
    console.log('   - personalInfo.department:', candidateData.personalInfo.department);
    console.log('   - personalInfo.gender:', candidateData.personalInfo.gender);
    console.log('   - personalInfo.employeeDOB:', candidateData.personalInfo.employeeDOB);
    console.log('   - personalInfo.dateOfJoining:', candidateData.personalInfo.dateOfJoining);

    res.json({
      success: true,
      message: 'Authentication successful',
      candidateData,
      onboardingStatus: onboarding.status,
      isSubmitted: onboarding.candidatePortal.isSubmitted || false
    });

  } catch (error) {
    console.error('Candidate authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
});

// Save candidate progress
router.put('/:candidateId/save', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidateData = req.body;

    console.log('💾 Saving candidate data for:', candidateId);
    console.log('📊 Data received:', JSON.stringify(candidateData, null, 2));

    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      console.error('❌ Onboarding record not found for:', candidateId);
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }

    // Update candidate portal data safely
    if (!onboarding.candidatePortal) {
      onboarding.candidatePortal = {};
    }
    
    // Process uploadedDocuments properly
    let processedUploadedDocuments = [];
    if (candidateData.uploadedDocuments) {
      if (Array.isArray(candidateData.uploadedDocuments)) {
        processedUploadedDocuments = candidateData.uploadedDocuments;
      } else if (typeof candidateData.uploadedDocuments === 'string') {
        try {
          processedUploadedDocuments = JSON.parse(candidateData.uploadedDocuments);
        } catch (e) {
          console.error('❌ Failed to parse uploadedDocuments string in save:', e);
          processedUploadedDocuments = [];
        }
      }
    }
    
    // Merge data safely to avoid schema conflicts
    const { uploadedDocuments, personalInfo, ...restCandidateData } = candidateData;
    
    // Apply the same field mapping logic as in submit endpoint
    let mappedPersonalInfo = {};
    console.log('🔍 SAVE ENDPOINT - personalInfo received:', personalInfo);
    console.log('🔍 SAVE ENDPOINT - personalInfo exists?', !!personalInfo);
    if (personalInfo) {
      console.log('🔍 SAVE ENDPOINT - Inside personalInfo mapping logic');
      
      // Map fullName to firstName/lastName (handle empty strings too)
      if (personalInfo.fullName !== undefined) {
        const nameParts = personalInfo.fullName.split(' ');
        mappedPersonalInfo.firstName = nameParts[0] || '';
        mappedPersonalInfo.lastName = nameParts.slice(1).join(' ') || '';
        console.log('🔍 SAVE ENDPOINT - Mapped name:', { firstName: mappedPersonalInfo.firstName, lastName: mappedPersonalInfo.lastName });
      }
      
      // Map other fields (handle empty strings and null values)
      if (personalInfo.mobileNumber !== undefined) mappedPersonalInfo.phone = personalInfo.mobileNumber;
      if (personalInfo.employeeDOB !== undefined && personalInfo.employeeDOB) mappedPersonalInfo.dateOfBirth = new Date(personalInfo.employeeDOB);
      if (personalInfo.aadhaarNumber !== undefined) mappedPersonalInfo.aadharNumber = personalInfo.aadhaarNumber;
      if (personalInfo.email !== undefined) mappedPersonalInfo.email = personalInfo.email;
      if (personalInfo.alternatePhone !== undefined) mappedPersonalInfo.alternatePhone = personalInfo.alternatePhone;
      if (personalInfo.gender !== undefined) mappedPersonalInfo.gender = personalInfo.gender;
      if (personalInfo.maritalStatus !== undefined) mappedPersonalInfo.maritalStatus = personalInfo.maritalStatus;
      if (personalInfo.nationality !== undefined) mappedPersonalInfo.nationality = personalInfo.nationality;
      if (personalInfo.bloodGroup !== undefined) mappedPersonalInfo.bloodGroup = personalInfo.bloodGroup;
      if (personalInfo.panNumber !== undefined) mappedPersonalInfo.panNumber = personalInfo.panNumber;
      
      // Map additional fields that were missing (handle empty strings and null values)
      if (personalInfo.fatherName !== undefined) mappedPersonalInfo.fatherName = personalInfo.fatherName;
      if (personalInfo.personalEmailId !== undefined) mappedPersonalInfo.personalEmailId = personalInfo.personalEmailId;
      if (personalInfo.officialEmailId !== undefined) mappedPersonalInfo.officialEmailId = personalInfo.officialEmailId;
      if (personalInfo.employeeCode !== undefined) mappedPersonalInfo.employeeCode = personalInfo.employeeCode;
      if (personalInfo.employmentStatus !== undefined) mappedPersonalInfo.employmentStatus = personalInfo.employmentStatus;
      if (personalInfo.dateOfJoining !== undefined && personalInfo.dateOfJoining) mappedPersonalInfo.dateOfJoining = new Date(personalInfo.dateOfJoining);
      if (personalInfo.dobAsPerAadhaar !== undefined && personalInfo.dobAsPerAadhaar) mappedPersonalInfo.dobAsPerAadhaar = new Date(personalInfo.dobAsPerAadhaar);
      
      console.log('🔍 SAVE ENDPOINT - Final mappedPersonalInfo:', mappedPersonalInfo);
      
      // Preserve existing profilePhoto if not in the new data
      console.log('🚨 SAVE ENDPOINT - personalInfo has profilePhoto?', !!personalInfo.profilePhoto);
      console.log('🚨 SAVE ENDPOINT - existing profilePhoto exists?', !!onboarding.candidatePortal.personalInfo?.profilePhoto);
      
      if (onboarding.candidatePortal.personalInfo?.profilePhoto && !personalInfo.profilePhoto) {
        console.log('🚨 SAVE ENDPOINT - Preserving existing profilePhoto');
        mappedPersonalInfo.profilePhoto = onboarding.candidatePortal.personalInfo.profilePhoto;
      } else if (personalInfo.profilePhoto && personalInfo.profilePhoto !== undefined) {
        console.log('🚨 SAVE ENDPOINT - Using new profilePhoto');
        mappedPersonalInfo.profilePhoto = personalInfo.profilePhoto;
      }
      // If no profilePhoto data, don't set the field at all to avoid undefined values
      console.log('🚨 SAVE ENDPOINT - profilePhoto preserved?', !!mappedPersonalInfo.profilePhoto);
    }
    
    // Handle additionalInfo for designation and department
    let additionalInfo = { ...onboarding.candidatePortal.additionalInfo };
    if (personalInfo?.designation) {
      additionalInfo.designation = personalInfo.designation;
    }
    if (personalInfo?.department) {
      additionalInfo.department = personalInfo.department;
    }
    
    // Build personalInfo carefully to avoid undefined values
    const newPersonalInfo = {
      ...(onboarding.candidatePortal.personalInfo || {}),
      ...mappedPersonalInfo
    };
    
    // Remove any undefined values that might cause validation issues
    Object.keys(newPersonalInfo).forEach(key => {
      if (newPersonalInfo[key] === undefined) {
        delete newPersonalInfo[key];
      }
    });
    
    // Safely merge data to avoid undefined values
    onboarding.candidatePortal = {
      ...onboarding.candidatePortal,
      personalInfo: newPersonalInfo,
      additionalInfo: additionalInfo,
      uploadedDocuments: processedUploadedDocuments,
      lastUpdated: new Date(),
      // Only include other fields if they're not undefined
      ...(restCandidateData.addressInfo !== undefined && { addressInfo: restCandidateData.addressInfo }),
      ...(restCandidateData.workExperience !== undefined && { workExperience: restCandidateData.workExperience }),
      ...(restCandidateData.governmentDocuments !== undefined && { governmentDocuments: restCandidateData.governmentDocuments }),
      ...(restCandidateData.bankDocuments !== undefined && { bankDocuments: restCandidateData.bankDocuments }),
      ...(restCandidateData.emergencyContacts !== undefined && { emergencyContacts: restCandidateData.emergencyContacts }),
      ...(restCandidateData.bankDetails !== undefined && { bankDetails: restCandidateData.bankDetails }),
      ...(restCandidateData.educationQualifications !== undefined && { educationQualifications: restCandidateData.educationQualifications })
    };

    // Try to save with validation first, then without if it fails
    try {
      await onboarding.save();
      console.log('✅ Candidate data saved successfully with validation for:', candidateId);
    } catch (saveError) {
      console.error('❌ Save error with validation:', saveError);
      try {
        await onboarding.save({ validateBeforeSave: false });
        console.log('✅ Candidate data saved successfully without validation for:', candidateId);
      } catch (noValidationError) {
        console.error('❌ Save error without validation:', noValidationError);
        throw noValidationError;
      }
    }

    res.json({
      success: true,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('❌ Save progress error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save progress',
      error: error.message 
    });
  }
});


// Cleanup blob URLs endpoint
router.post('/:candidateId/cleanup-blob-urls', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }

    let cleaned = false;
    const cleanupLog = [];

    // Clean up blob URLs in candidatePortal
    if (onboarding.candidatePortal) {
      // Clean personalInfo profilePhoto
      if (onboarding.candidatePortal.personalInfo?.profilePhoto?.url?.startsWith('blob:')) {
        onboarding.candidatePortal.personalInfo.profilePhoto = null;
        cleaned = true;
        cleanupLog.push('Removed blob URL from personalInfo.profilePhoto');
      }

      // Clean governmentDocuments
      if (onboarding.candidatePortal.governmentDocuments) {
        ['aadhaarImage', 'panImage'].forEach(field => {
          if (onboarding.candidatePortal.governmentDocuments[field]?.url?.startsWith('blob:')) {
            onboarding.candidatePortal.governmentDocuments[field] = null;
            cleaned = true;
            cleanupLog.push(`Removed blob URL from governmentDocuments.${field}`);
          }
        });
      }

      // Clean bankDocuments
      if (onboarding.candidatePortal.bankDocuments) {
        ['cancelledCheque', 'passbook', 'bankStatement'].forEach(field => {
          if (onboarding.candidatePortal.bankDocuments[field]?.url?.startsWith('blob:')) {
            onboarding.candidatePortal.bankDocuments[field] = null;
            cleaned = true;
            cleanupLog.push(`Removed blob URL from bankDocuments.${field}`);
          }
        });
      }
    }

    if (cleaned) {
      await onboarding.save();
      res.json({
        success: true,
        message: 'Blob URLs cleaned up successfully',
        cleanupLog: cleanupLog
      });
    } else {
      res.json({
        success: true,
        message: 'No blob URLs found to clean up',
        cleanupLog: []
      });
    }

  } catch (error) {
    console.error('❌ Cleanup blob URLs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Cleanup failed',
      error: error.message 
    });
  }
});

// Debug endpoint to check stored data
router.get('/:candidateId/debug', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const onboarding = await Onboarding.findOne({ employeeId: candidateId }).lean();
    
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }
    
    // Test setting additionalInfo directly to see if it persists
    console.log('🔍 DEBUG - Current additionalInfo:', onboarding.candidatePortal?.additionalInfo);
    
    res.json({ 
      success: true, 
      employeeId: onboarding.employeeId,
      employeeName: onboarding.employeeName,
      rawCandidatePortal: onboarding.candidatePortal,
      uploadedDocuments: onboarding.candidatePortal?.uploadedDocuments,
      documentsSubmitted: onboarding.documentsSubmitted,
      documentsStatus: onboarding.documentsStatus,
      additionalInfoDebug: {
        exists: !!onboarding.candidatePortal?.additionalInfo,
        value: onboarding.candidatePortal?.additionalInfo,
        keys: onboarding.candidatePortal?.additionalInfo ? Object.keys(onboarding.candidatePortal.additionalInfo) : []
      }
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Debug endpoint error',
      error: error.message 
    });
  }
});






// Submit candidate information
router.post('/:candidateId/submit', async (req, res) => {
  console.log('🔥 SUBMIT ENDPOINT CALLED - FIXED VERSION!');
  console.log('🔥 SUBMIT - candidateData.personalInfo.profilePhoto:', JSON.stringify(req.body.personalInfo?.profilePhoto, null, 2));
  try {
    const { candidateId } = req.params;
    const candidateData = req.body;

    console.log('🚀 Submit request received for candidate:', candidateId);
    console.log('📊 Candidate data received:', JSON.stringify(candidateData, null, 2));

    // Find the onboarding record
    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding record not found' 
      });
    }

    // Allow resubmission for updates - just log the status
    const isResubmission = onboarding.candidatePortal && onboarding.candidatePortal.isSubmitted;
    if (isResubmission) {
      console.log('🔄 Resubmission detected - updating existing data for:', candidateId);
    } else {
      console.log('📝 First-time submission for:', candidateId);
    }

    // Ensure uploadedDocuments is properly formatted as an array
    let uploadedDocuments = [];
    if (candidateData.uploadedDocuments) {
      if (Array.isArray(candidateData.uploadedDocuments)) {
        uploadedDocuments = candidateData.uploadedDocuments;
      } else if (typeof candidateData.uploadedDocuments === 'string') {
        try {
          uploadedDocuments = JSON.parse(candidateData.uploadedDocuments);
        } catch (e) {
          console.error('❌ Failed to parse uploadedDocuments string:', e);
          uploadedDocuments = [];
        }
      }
    }

    // Update candidate portal data and mark as submitted
    // Merge existing data with new data to preserve all information
    const finalUploadedDocuments = Array.isArray(uploadedDocuments) ? uploadedDocuments : [];
    
    // Update the candidatePortal object directly to avoid spreading issues
    if (!onboarding.candidatePortal) {
      onboarding.candidatePortal = {};
    }
    
    // Preserve essential fields
    onboarding.candidatePortal.password = onboarding.candidatePortal.password;
    onboarding.candidatePortal.plainTextPassword = onboarding.candidatePortal.plainTextPassword;
    onboarding.candidatePortal.createdAt = onboarding.candidatePortal.createdAt;
    onboarding.candidatePortal.createdBy = onboarding.candidatePortal.createdBy;
    onboarding.candidatePortal.accessCount = onboarding.candidatePortal.accessCount || 0;
    onboarding.candidatePortal.lastAccessed = onboarding.candidatePortal.lastAccessed;
    
    // Update data fields - ensure all personalInfo fields are saved
    if (candidateData.personalInfo) {
      // Initialize personalInfo if it doesn't exist
      if (!onboarding.candidatePortal.personalInfo) {
        onboarding.candidatePortal.personalInfo = {};
      }
      
      // Log what we're about to save
      console.log('📝 About to save personalInfo:', candidateData.personalInfo);
      
      // Completely replace personalInfo with new data to ensure nothing is lost
      // Map client field names to schema field names
      const mappedPersonalInfo = {};
      
      if (candidateData.personalInfo.fullName) {
        // Split fullName into firstName and lastName
        const nameParts = candidateData.personalInfo.fullName.split(' ');
        mappedPersonalInfo.firstName = nameParts[0] || '';
        mappedPersonalInfo.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Map other fields
      if (candidateData.personalInfo.mobileNumber) mappedPersonalInfo.phone = candidateData.personalInfo.mobileNumber;
      if (candidateData.personalInfo.employeeDOB) mappedPersonalInfo.dateOfBirth = new Date(candidateData.personalInfo.employeeDOB);
      if (candidateData.personalInfo.aadhaarNumber) mappedPersonalInfo.aadharNumber = candidateData.personalInfo.aadhaarNumber;
      if (candidateData.personalInfo.email) mappedPersonalInfo.email = candidateData.personalInfo.email;
      if (candidateData.personalInfo.alternatePhone) mappedPersonalInfo.alternatePhone = candidateData.personalInfo.alternatePhone;
      if (candidateData.personalInfo.gender) mappedPersonalInfo.gender = candidateData.personalInfo.gender;
      if (candidateData.personalInfo.maritalStatus) mappedPersonalInfo.maritalStatus = candidateData.personalInfo.maritalStatus;
      if (candidateData.personalInfo.nationality) mappedPersonalInfo.nationality = candidateData.personalInfo.nationality;
      if (candidateData.personalInfo.bloodGroup) mappedPersonalInfo.bloodGroup = candidateData.personalInfo.bloodGroup;
      if (candidateData.personalInfo.panNumber) mappedPersonalInfo.panNumber = candidateData.personalInfo.panNumber;
      
      // Map additional fields that were missing
      if (candidateData.personalInfo.fatherName) mappedPersonalInfo.fatherName = candidateData.personalInfo.fatherName;
      if (candidateData.personalInfo.personalEmailId) mappedPersonalInfo.personalEmailId = candidateData.personalInfo.personalEmailId;
      if (candidateData.personalInfo.officialEmailId) mappedPersonalInfo.officialEmailId = candidateData.personalInfo.officialEmailId;
      if (candidateData.personalInfo.employeeCode) mappedPersonalInfo.employeeCode = candidateData.personalInfo.employeeCode;
      if (candidateData.personalInfo.employmentStatus) mappedPersonalInfo.employmentStatus = candidateData.personalInfo.employmentStatus;
      if (candidateData.personalInfo.dateOfJoining) mappedPersonalInfo.dateOfJoining = new Date(candidateData.personalInfo.dateOfJoining);
      if (candidateData.personalInfo.dobAsPerAadhaar) mappedPersonalInfo.dobAsPerAadhaar = new Date(candidateData.personalInfo.dobAsPerAadhaar);
      
      // CRITICAL FIX: Always preserve profilePhoto
      if (candidateData.personalInfo.profilePhoto && candidateData.personalInfo.profilePhoto.url) {
        console.log('🔥 SUBMIT - Using client profilePhoto:', JSON.stringify(candidateData.personalInfo.profilePhoto, null, 2));
        mappedPersonalInfo.profilePhoto = candidateData.personalInfo.profilePhoto;
      } else if (onboarding.candidatePortal.personalInfo?.profilePhoto && onboarding.candidatePortal.personalInfo.profilePhoto.url) {
        console.log('🔥 SUBMIT - Using existing profilePhoto:', JSON.stringify(onboarding.candidatePortal.personalInfo.profilePhoto, null, 2));
        mappedPersonalInfo.profilePhoto = onboarding.candidatePortal.personalInfo.profilePhoto;
      } else {
        console.log('🔥 SUBMIT - No valid profilePhoto found');
      }
      
      // Store designation and department in additionalInfo since they're not in personalInfo schema
      if (!onboarding.candidatePortal.additionalInfo) {
        onboarding.candidatePortal.additionalInfo = {};
      }
      if (candidateData.personalInfo.designation) {
        onboarding.candidatePortal.additionalInfo.designation = candidateData.personalInfo.designation;
      }
      if (candidateData.personalInfo.department) {
        onboarding.candidatePortal.additionalInfo.department = candidateData.personalInfo.department;
      }
      
      // Handle profilePhoto properly - ALWAYS preserve existing profilePhoto unless being replaced
      console.log('🚨 PROFILEPHOTO DEBUG: candidateData has profilePhoto?', !!candidateData.personalInfo?.profilePhoto);
      console.log('🚨 PROFILEPHOTO DEBUG: existing profilePhoto exists?', !!onboarding.candidatePortal.personalInfo?.profilePhoto);
      
      // Always preserve the existing profilePhoto first
      if (onboarding.candidatePortal.personalInfo?.profilePhoto) {
        console.log('🚨 PROFILEPHOTO DEBUG: Preserving existing profilePhoto');
        mappedPersonalInfo.profilePhoto = onboarding.candidatePortal.personalInfo.profilePhoto;
      }
      
      // Only override if client sends a new profilePhoto with valid URL
      if (candidateData.personalInfo?.profilePhoto && candidateData.personalInfo.profilePhoto.url) {
        console.log('🚨 PROFILEPHOTO DEBUG: Overriding with new profilePhoto');
        mappedPersonalInfo.profilePhoto = candidateData.personalInfo.profilePhoto;
      }
      
      console.log('🚨 PROFILEPHOTO DEBUG: Final profilePhoto set?', !!mappedPersonalInfo.profilePhoto);
      console.log('🚨 PROFILEPHOTO DEBUG: mappedPersonalInfo.profilePhoto:', JSON.stringify(mappedPersonalInfo.profilePhoto, null, 2));
      
      // Build personalInfo carefully to avoid undefined values
      const existingPersonalInfo = onboarding.candidatePortal.personalInfo || {};
      console.log('🚨 PROFILEPHOTO DEBUG: existingPersonalInfo.profilePhoto exists?', !!existingPersonalInfo.profilePhoto);
      
      const newPersonalInfo = {
        ...existingPersonalInfo,
        ...mappedPersonalInfo
      };
      
      console.log('🚨 PROFILEPHOTO DEBUG: newPersonalInfo.profilePhoto after spread:', JSON.stringify(newPersonalInfo.profilePhoto, null, 2));
      
      // Remove any undefined values that might cause validation issues
      Object.keys(newPersonalInfo).forEach(key => {
        if (newPersonalInfo[key] === undefined) {
          console.log(`🚨 PROFILEPHOTO DEBUG: Removing undefined key: ${key}`);
          delete newPersonalInfo[key];
        }
      });
      
      console.log('🚨 PROFILEPHOTO DEBUG: newPersonalInfo.profilePhoto after cleanup:', JSON.stringify(newPersonalInfo.profilePhoto, null, 2));
      
      onboarding.candidatePortal.personalInfo = newPersonalInfo;
      
      console.log('📝 Updated personalInfo:', onboarding.candidatePortal.personalInfo);
    }
    
    // Ensure governmentDocuments and bankDocuments are preserved (same logic as upload endpoint)
    if (candidateData.governmentDocuments) {
      console.log('🚨 DOCUMENTS DEBUG: Updating governmentDocuments');
      onboarding.candidatePortal.governmentDocuments = {
        ...(onboarding.candidatePortal.governmentDocuments || {}),
        ...candidateData.governmentDocuments
      };
    }
    
    if (candidateData.bankDocuments) {
      console.log('🚨 DOCUMENTS DEBUG: Updating bankDocuments');
      onboarding.candidatePortal.bankDocuments = {
        ...(onboarding.candidatePortal.bankDocuments || {}),
        ...candidateData.bankDocuments
      };
    }
    
    // Update addressInfo
    if (candidateData.addressInfo) {
      onboarding.candidatePortal.addressInfo = {
        currentAddress: {
          ...(onboarding.candidatePortal.addressInfo?.currentAddress || {}),
          ...(candidateData.addressInfo?.currentAddress || {})
        },
        permanentAddress: {
          ...(onboarding.candidatePortal.addressInfo?.permanentAddress || {}),
          ...(candidateData.addressInfo?.permanentAddress || {})
        }
      };
      console.log('📝 Updated addressInfo:', onboarding.candidatePortal.addressInfo);
    }
    
    // Update emergencyContacts
    if (candidateData.emergencyContacts) {
      onboarding.candidatePortal.emergencyContacts = candidateData.emergencyContacts;
      console.log('📝 Updated emergencyContacts:', onboarding.candidatePortal.emergencyContacts);
    }
    
    // Update bankDetails
    if (candidateData.bankDetails) {
      onboarding.candidatePortal.bankDetails = candidateData.bankDetails;
      console.log('📝 Updated bankDetails:', onboarding.candidatePortal.bankDetails);
    }
    
    // Update additionalInfo (including designation and department from personalInfo)
    // Preserve designation and department that were set during personalInfo processing
    const existingAdditionalInfo = onboarding.candidatePortal.additionalInfo || {};
    onboarding.candidatePortal.additionalInfo = {
      ...existingAdditionalInfo,
      ...(candidateData.additionalInfo || {})
    };
    
    // Update workExperience
    if (candidateData.workExperience) {
      onboarding.candidatePortal.workExperience = candidateData.workExperience;
      console.log('📝 Updated workExperience:', onboarding.candidatePortal.workExperience);
    }
    
    // Update educationQualifications
    if (candidateData.educationQualifications) {
      onboarding.candidatePortal.educationQualifications = candidateData.educationQualifications;
      console.log('📝 Updated educationQualifications:', onboarding.candidatePortal.educationQualifications);
    }
    
    // Set uploadedDocuments directly
    onboarding.candidatePortal.uploadedDocuments = finalUploadedDocuments;
    
    // Update submission status
    onboarding.candidatePortal.isActive = onboarding.candidatePortal.isActive !== false;
    onboarding.candidatePortal.isSubmitted = true;
    onboarding.candidatePortal.submittedAt = new Date();
    onboarding.candidatePortal.lastUpdated = new Date();

    // Update main onboarding fields with submitted data
    if (candidateData.personalInfo) {
      console.log('📝 Updating personal info fields...');
      onboarding.employeeName = candidateData.personalInfo.fullName || onboarding.employeeName;
      onboarding.email = candidateData.personalInfo.email || onboarding.email;
      onboarding.phone = candidateData.personalInfo.mobileNumber || onboarding.phone;
      
      // Handle date fields - convert Moment objects to Date objects if needed
      if (candidateData.personalInfo.employeeDOB) {
        onboarding.dateOfBirth = candidateData.personalInfo.employeeDOB._isAMomentObject ? 
          candidateData.personalInfo.employeeDOB.toDate() : 
          candidateData.personalInfo.employeeDOB;
      }
      
      if (candidateData.personalInfo.dateOfJoining) {
        onboarding.startDate = candidateData.personalInfo.dateOfJoining._isAMomentObject ? 
          candidateData.personalInfo.dateOfJoining.toDate() : 
          candidateData.personalInfo.dateOfJoining;
      }
      
      onboarding.gender = candidateData.personalInfo.gender || onboarding.gender;
      onboarding.maritalStatus = candidateData.personalInfo.maritalStatus || onboarding.maritalStatus;
      onboarding.nationality = candidateData.personalInfo.nationality || onboarding.nationality;
      onboarding.aadharNumber = candidateData.personalInfo.aadhaarNumber || onboarding.aadharNumber;
      onboarding.panNumber = candidateData.personalInfo.panNumber || onboarding.panNumber;
      onboarding.position = candidateData.personalInfo.designation || onboarding.position;
      onboarding.department = candidateData.personalInfo.department || onboarding.department;
    }

    // Update address information
    if (candidateData.addressInfo) {
      onboarding.currentAddress = candidateData.addressInfo.currentAddress || onboarding.currentAddress;
      onboarding.permanentAddress = candidateData.addressInfo.permanentAddress || onboarding.permanentAddress;
    }

    // Update education qualifications
    if (candidateData.educationQualifications && Array.isArray(candidateData.educationQualifications)) {
      console.log('📝 Updating education qualifications...');
      const educationArray = candidateData.educationQualifications.map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.specialization || '',
        startYear: edu.yearOfPassing ? parseInt(edu.yearOfPassing) : null,
        endYear: edu.yearOfPassing ? parseInt(edu.yearOfPassing) : null,
        percentage: edu.percentage ? parseFloat(edu.percentage) : null,
        description: `${edu.educationLevel || ''} - ${edu.degree || ''}`
      }));
      onboarding.education = educationArray;
    }

    // Update work experience
    if (candidateData.workExperience && candidateData.workExperience.experienceDetails) {
      console.log('📝 Updating work experience...');
      const experienceDetails = Array.isArray(candidateData.workExperience.experienceDetails) 
        ? candidateData.workExperience.experienceDetails 
        : [];
      
      const workExperienceArray = experienceDetails.map(exp => ({
        jobTitle: exp.position || '',
        company: exp.company || '',
        startDate: exp.startDate?._isAMomentObject ? exp.startDate.format('YYYY-MM-DD') : exp.startDate,
        endDate: exp.endDate?._isAMomentObject ? exp.endDate.format('YYYY-MM-DD') : exp.endDate,
        currentJob: !exp.endDate,
        salary: exp.salary || 0,
        description: exp.reasonForLeaving || '',
        reasonForLeaving: exp.reasonForLeaving || ''
      }));
      onboarding.workExperience = workExperienceArray;
    }

    // Update emergency contacts
    if (candidateData.emergencyContacts) {
      console.log('📝 Updating emergency contacts...');
      const emergencyContacts = Array.isArray(candidateData.emergencyContacts) ? candidateData.emergencyContacts : [];
      onboarding.emergencyContacts = emergencyContacts;
    }

    // Update bank details
    if (candidateData.bankDetails) {
      console.log('📝 Updating bank details...');
      if (Array.isArray(candidateData.bankDetails)) {
        const primaryBank = candidateData.bankDetails.find(bank => bank.isPrimary) || candidateData.bankDetails[0];
        if (primaryBank) {
          onboarding.bankDetails = {
            accountNumber: primaryBank.accountNumber,
            bankName: primaryBank.bankName,
            ifscCode: primaryBank.ifscCode,
            accountHolderName: primaryBank.accountHolderName,
            branchName: primaryBank.branch
          };
        }
      } else if (typeof candidateData.bankDetails === 'object' && candidateData.bankDetails !== null) {
        // Handle case where bankDetails is already an object
        onboarding.bankDetails = {
          accountNumber: candidateData.bankDetails.accountNumber || '',
          bankName: candidateData.bankDetails.bankName || '',
          ifscCode: candidateData.bankDetails.ifscCode || '',
          accountHolderName: candidateData.bankDetails.accountHolderName || '',
          branchName: candidateData.bankDetails.branch || candidateData.bankDetails.branchName || ''
        };
      }
    }

    // Update onboarding status
    if (onboarding.status === 'offer_accepted') {
      onboarding.status = 'in_progress';
    }

    // Update document submission status
    onboarding.documentsSubmitted = true;
    onboarding.documentsSubmittedAt = new Date();
    onboarding.documentsStatus = 'submitted_for_review';

    // Update step progress
    try {
      onboarding.updateStepProgress('document_collection', true);
      console.log('✅ Step progress updated successfully');
    } catch (stepError) {
      console.error('⚠️ Error updating step progress:', stepError);
    }

    console.log('💾 Saving onboarding record...');
    
    // Try to save with validation disabled to bypass schema issues
    try {
      await onboarding.save();
      console.log('✅ Onboarding record saved successfully');
    } catch (saveError) {
      console.error('❌ Save error with validation:', saveError);
      
      // Try to save without validation
      try {
        await onboarding.save({ validateBeforeSave: false });
        console.log('✅ Onboarding record saved without validation');
      } catch (noValidationError) {
        console.error('❌ Save error without validation:', noValidationError);
        throw noValidationError;
      }
    }
    
    // Verify what was actually saved
    const savedRecord = await Onboarding.findOne({ employeeId: candidateId });
    console.log('🔍 Saved candidatePortal.personalInfo after save:', JSON.stringify(savedRecord.candidatePortal.personalInfo, null, 2));

    res.json({
      success: true,
      message: isResubmission ? 'Information updated successfully' : 'Information submitted successfully',
      submittedAt: onboarding.candidatePortal.submittedAt,
      isResubmission: isResubmission
    });

  } catch (error) {
    console.error('❌ Submit candidate info error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit information'
    });
  }
});

// Get candidate status (public endpoint for checking submission status)
router.get('/:candidateId/status', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const onboarding = await Onboarding.findOne({ 
      employeeId: candidateId 
    });

    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found' 
      });
    }

    // Fetch reporting manager information if available (same logic as authentication endpoint)
    let reportingManagerName = '';
    let reportingManagerId = '';
    const managerId = onboarding.reportingManager || onboarding.offerLetter?.reportingManager;
    if (managerId) {
      try {
        const manager = await Employee.findById(managerId).populate('user', 'profile');
        if (manager) {
          reportingManagerName = `${manager.personalInfo?.firstName || ''} ${manager.personalInfo?.lastName || ''}`.trim() ||
                                 `${manager.user?.profile?.firstName || ''} ${manager.user?.profile?.lastName || ''}`.trim() ||
                                 manager.employeeId || 'Unknown Manager';
          reportingManagerId = managerId.toString();
        }
      } catch (error) {
        console.error('Error fetching reporting manager in status endpoint:', error);
      }
    }

    // Apply the same data merging logic as authentication endpoint
    const candidatePortalData = {
      personalInfo: {
        // Start with existing candidate portal data
        ...(onboarding.candidatePortal?.personalInfo || {}),
        // Then auto-fill from onboarding record (this will override empty/missing fields)
        email: onboarding.email || onboarding.candidatePortal?.personalInfo?.email || '',
        employeeCode: onboarding.employeeId || onboarding.candidatePortal?.personalInfo?.employeeCode || '',
        fullName: onboarding.employeeName || onboarding.candidatePortal?.personalInfo?.fullName || '',
        mobileNumber: onboarding.phone || onboarding.candidatePortal?.personalInfo?.mobileNumber || '',
        alternatePhone: onboarding.alternatePhone || onboarding.candidatePortal?.personalInfo?.alternatePhone || '',
        gender: onboarding.gender || onboarding.candidatePortal?.personalInfo?.gender || '',
        maritalStatus: onboarding.maritalStatus || onboarding.candidatePortal?.personalInfo?.maritalStatus || '',
        employeeDOB: onboarding.dateOfBirth || onboarding.candidatePortal?.personalInfo?.employeeDOB || null,
        dateOfJoining: onboarding.startDate || onboarding.candidatePortal?.personalInfo?.dateOfJoining || null,
        employmentStatus: onboarding.candidatePortal?.personalInfo?.employmentStatus || onboarding.employmentType || 'permanent',
        panNumber: onboarding.panNumber || onboarding.candidatePortal?.personalInfo?.panNumber || '',
        aadhaarNumber: onboarding.aadharNumber || onboarding.candidatePortal?.personalInfo?.aadhaarNumber || '',
        nationality: onboarding.nationality || onboarding.candidatePortal?.personalInfo?.nationality || 'Indian',
        designation: onboarding.position || onboarding.candidatePortal?.personalInfo?.designation || '',
        department: onboarding.department || onboarding.candidatePortal?.personalInfo?.department || '',
        reportingManager: reportingManagerName || onboarding.candidatePortal?.personalInfo?.reportingManager || '',
        reportingManagerId: reportingManagerId || '',
        // Additional fields that might be missing
        fatherName: onboarding.fatherName || onboarding.candidatePortal?.personalInfo?.fatherName || '',
        bloodGroup: onboarding.bloodGroup || onboarding.candidatePortal?.personalInfo?.bloodGroup || '',
        personalEmailId: onboarding.personalEmailId || onboarding.candidatePortal?.personalInfo?.personalEmailId || '',
        officialEmailId: onboarding.email || onboarding.candidatePortal?.personalInfo?.officialEmailId || ''
      },
      addressInfo: {
        currentAddress: {
          // Prioritize onboarding record data over candidate portal data
          street: onboarding.currentAddress?.street || onboarding.candidatePortal?.addressInfo?.currentAddress?.street || '',
          city: onboarding.currentAddress?.city || onboarding.candidatePortal?.addressInfo?.currentAddress?.city || '',
          state: onboarding.currentAddress?.state || onboarding.candidatePortal?.addressInfo?.currentAddress?.state || '',
          pincode: onboarding.currentAddress?.pincode || onboarding.candidatePortal?.addressInfo?.currentAddress?.pincode || '',
          country: onboarding.currentAddress?.country || onboarding.candidatePortal?.addressInfo?.currentAddress?.country || 'India'
        },
        permanentAddress: {
          street: onboarding.permanentAddress?.street || onboarding.candidatePortal?.addressInfo?.permanentAddress?.street || '',
          city: onboarding.permanentAddress?.city || onboarding.candidatePortal?.addressInfo?.permanentAddress?.city || '',
          state: onboarding.permanentAddress?.state || onboarding.candidatePortal?.addressInfo?.permanentAddress?.state || '',
          pincode: onboarding.permanentAddress?.pincode || onboarding.candidatePortal?.addressInfo?.permanentAddress?.pincode || '',
          country: onboarding.permanentAddress?.country || onboarding.candidatePortal?.addressInfo?.permanentAddress?.country || 'India',
          sameAsPresent: onboarding.permanentAddress?.sameAsCurrent || onboarding.candidatePortal?.addressInfo?.permanentAddress?.sameAsPresent || false
        }
      },
      // Keep other existing portal data
      emergencyContacts: onboarding.candidatePortal?.emergencyContacts || [],
      bankDetails: onboarding.candidatePortal?.bankDetails || [],
      educationQualifications: onboarding.candidatePortal?.educationQualifications || [],
      workExperience: onboarding.candidatePortal?.workExperience || { experienceDetails: [] },
      additionalInfo: onboarding.candidatePortal?.additionalInfo || {},
      governmentDocuments: onboarding.candidatePortal?.governmentDocuments || {},
      bankDocuments: onboarding.candidatePortal?.bankDocuments || {},
      educationDocuments: onboarding.candidatePortal?.educationDocuments || [],
      workExperienceDocuments: onboarding.candidatePortal?.workExperienceDocuments || [],
      uploadedDocuments: onboarding.candidatePortal?.uploadedDocuments || [],
      isSubmitted: onboarding.candidatePortal?.isSubmitted || false,
      submittedAt: onboarding.candidatePortal?.submittedAt || null
    };

    // Include offer letter information if available
    let offerLetterData = null;
    if (onboarding.offerLetter && onboarding.offerLetter.status === 'accepted') {
      offerLetterData = {
        position: onboarding.offerLetter.position || onboarding.position,
        department: onboarding.offerLetter.department || onboarding.department,
        salary: onboarding.offerLetter.salary || onboarding.salary,
        startDate: onboarding.offerLetter.startDate || onboarding.startDate,
        acceptedAt: onboarding.offerLetter.acceptedAt,
        candidateSignature: onboarding.offerLetter.candidateSignature ? {
          name: onboarding.offerLetter.candidateSignature.name,
          method: onboarding.offerLetter.candidateSignature.method,
          timestamp: onboarding.offerLetter.candidateSignature.timestamp,
          // Don't include the actual signature data for security reasons in this endpoint
        } : null,
        acceptanceComments: onboarding.offerLetter.acceptanceComments
      };
    }

    res.json({
      success: true,
      status: onboarding.status,
      isSubmitted: onboarding.candidatePortal?.isSubmitted || false,
      submittedAt: onboarding.candidatePortal?.submittedAt || null,
      candidatePortal: {
        ...candidatePortalData,
        // Include IT setup data for the review page
        itSetup: onboarding.itSetup || null
      },
      offerLetter: offerLetterData
    });

  } catch (error) {
    console.error('Get candidate status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get signed offer letter document
router.get('/:candidateId/offer-letter', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const onboarding = await Onboarding.findOne({ 
      employeeId: candidateId 
    });

    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found' 
      });
    }

    if (!onboarding.offerLetter || onboarding.offerLetter.status !== 'accepted') {
      return res.status(404).json({ 
        success: false, 
        message: 'No accepted offer letter found' 
      });
    }

    if (!onboarding.offerLetter.candidateSignature || !onboarding.offerLetter.candidateSignature.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'No signature found in offer letter' 
      });
    }

    res.json({
      success: true,
      offerLetter: {
        // Basic offer details
        position: onboarding.offerLetter.position || onboarding.position,
        department: onboarding.offerLetter.department || onboarding.department,
        salary: onboarding.offerLetter.salary || onboarding.salary,
        startDate: onboarding.offerLetter.startDate || onboarding.startDate,
        employmentType: onboarding.offerLetter.employmentType || onboarding.employmentType,
        probationPeriod: onboarding.offerLetter.probationPeriod || onboarding.probationPeriod,
        reportingManager: onboarding.offerLetter.reportingManager,
        workLocation: onboarding.offerLetter.workLocation,
        
        // Company information (Codervalue specific)
        companyName: onboarding.offerLetter.companyName || 'CODERVALUE SOLUTIONS PRIVATE LIMITED',
        companyAddress: onboarding.offerLetter.companyAddress || 'Office 303, 3rd Floor, H-47, USIS BIZPARK, Sector 63, Gautam Buddha Nagar, Noida, Uttar Pradesh, 201309',
        cinNumber: onboarding.offerLetter.cinNumber || 'U72900UP2021PTC141154',
        
        // Employment terms (Codervalue specific)
        noticePeriodProbation: onboarding.offerLetter.noticePeriodProbation || 30,
        noticePeriodRegular: onboarding.offerLetter.noticePeriodRegular || 60,
        nonCompetePeriod: onboarding.offerLetter.nonCompetePeriod || 12,
        nonSolicitationPeriod: onboarding.offerLetter.nonSolicitationPeriod || 24,
        retirementAge: onboarding.offerLetter.retirementAge || 58,
        
        // Benefits and terms
        benefits: onboarding.offerLetter.benefits || [],
        terms: onboarding.offerLetter.terms || [],
        
        // Offer timeline
        expiryDate: onboarding.offerLetter.expiryDate,
        sentAt: onboarding.offerLetter.sentAt,
        acceptedAt: onboarding.offerLetter.acceptedAt,
        
        // Signature data
        candidateSignature: {
          name: onboarding.offerLetter.candidateSignature.name,
          method: onboarding.offerLetter.candidateSignature.method,
          timestamp: onboarding.offerLetter.candidateSignature.timestamp,
          data: onboarding.offerLetter.candidateSignature.data // Include signature image for viewing
        },
        acceptanceComments: onboarding.offerLetter.acceptanceComments
      },
      candidateInfo: {
        employeeName: onboarding.employeeName,
        email: onboarding.email,
        employeeId: onboarding.employeeId
      }
    });

  } catch (error) {
    console.error('Get signed offer letter error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get document file by ID and name (for documents without explicit URL)
router.get('/:candidateId/document/:documentId/:filename', async (req, res) => {
  try {
    const { candidateId, documentId, filename } = req.params;
    
    console.log('🔍 Document download request:', { candidateId, documentId, filename });
    
    // Find the candidate
    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    
    // First, try to find the document in the database to see if it has a URL and filename
    let documentUrl = null;
    let actualFilename = null;
    
    // Check government documents
    if (onboarding.candidatePortal?.governmentDocuments) {
      const govDocs = onboarding.candidatePortal.governmentDocuments;
      if (govDocs.aadhaarImage?.id === documentId) {
        documentUrl = govDocs.aadhaarImage.url;
        actualFilename = govDocs.aadhaarImage.filename;
      }
      if (govDocs.panImage?.id === documentId) {
        documentUrl = govDocs.panImage.url;
        actualFilename = govDocs.panImage.filename;
      }
    }
    
    // Check bank documents
    if (onboarding.candidatePortal?.bankDocuments) {
      const bankDocs = onboarding.candidatePortal.bankDocuments;
      if (bankDocs.cancelledCheque?.id === documentId) {
        documentUrl = bankDocs.cancelledCheque.url;
        actualFilename = bankDocs.cancelledCheque.filename;
      }
      if (bankDocs.passbook?.id === documentId) {
        documentUrl = bankDocs.passbook.url;
        actualFilename = bankDocs.passbook.filename;
      }
      if (bankDocs.bankStatement?.id === documentId) {
        documentUrl = bankDocs.bankStatement.url;
        actualFilename = bankDocs.bankStatement.filename;
      }
    }
    
    // Check profile photo
    if (onboarding.candidatePortal?.personalInfo?.profilePhoto?.id === documentId) {
      documentUrl = onboarding.candidatePortal.personalInfo.profilePhoto.url;
      actualFilename = onboarding.candidatePortal.personalInfo.profilePhoto.filename;
    }
    
    // Check education and work experience documents
    if (!documentUrl) {
      // Check education documents
      if (onboarding.candidatePortal?.educationQualifications) {
        for (const edu of onboarding.candidatePortal.educationQualifications) {
          if (edu.documents) {
            for (const doc of edu.documents) {
              if (doc.id === documentId) {
                documentUrl = doc.url;
                actualFilename = doc.filename;
                break;
              }
            }
          }
          if (documentUrl) break;
        }
      }
      
      // Check work experience documents
      if (!documentUrl && onboarding.candidatePortal?.workExperience?.experienceDetails) {
        for (const work of onboarding.candidatePortal.workExperience.experienceDetails) {
          if (work.documents) {
            for (const docType of ['experienceLetters', 'relievingCertificate', 'salarySlips']) {
              if (work.documents[docType]) {
                for (const doc of work.documents[docType]) {
                  if (doc.id === documentId) {
                    documentUrl = doc.url;
                    actualFilename = doc.filename;
                    break;
                  }
                }
              }
              if (documentUrl) break;
            }
          }
          if (documentUrl) break;
        }
      }
    }
    
    console.log('🔍 Found document URL in database:', documentUrl);
    
    // If we found a URL in the database, use it directly
    if (documentUrl || actualFilename) {
      let filePath;
      
      // If we have the actual filename, use it directly
      if (actualFilename) {
        filePath = `uploads/onboarding/${actualFilename}`;
        console.log('✅ Using stored filename directly:', filePath);
      } else if (documentUrl) {
        // Handle different URL formats
        if (documentUrl.startsWith('http://localhost:5001/uploads/')) {
          // Full URL - extract the path after the domain
          filePath = documentUrl.replace('http://localhost:5001/', '');
        } else if (documentUrl.startsWith('/uploads/')) {
          // Relative URL starting with /uploads
          filePath = documentUrl.substring(1); // Remove leading slash
        } else if (documentUrl.startsWith('uploads/')) {
          // Already a proper path
          filePath = documentUrl;
        } else {
          // Just a filename - assume it's in onboarding folder
          filePath = `uploads/onboarding/${documentUrl}`;
        }
        console.log('✅ Using database URL, converted to path:', filePath);
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found on disk', filePath });
      }
      
      // Set appropriate headers for file viewing/download
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      let disposition = 'attachment'; // Default to download
      
      // Set correct MIME type for images to allow inline viewing
      if (['.jpg', '.jpeg'].includes(ext)) {
        mimeType = 'image/jpeg';
        disposition = 'inline'; // Allow inline viewing
      } else if (ext === '.png') {
        mimeType = 'image/png';
        disposition = 'inline';
      } else if (ext === '.gif') {
        mimeType = 'image/gif';
        disposition = 'inline';
      } else if (ext === '.webp') {
        mimeType = 'image/webp';
        disposition = 'inline';
      } else if (ext === '.pdf') {
        mimeType = 'application/pdf';
        disposition = 'inline'; // PDFs can also be viewed inline
      }
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
      
      // Send the file
      return res.sendFile(path.resolve(filePath));
    }
    
    // Look for files in the uploads directory that match the pattern
    const uploadDir = 'uploads/onboarding';
    
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ success: false, message: 'Upload directory not found' });
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(uploadDir);
    
    // Try to find a file that matches the document ID (timestamp) and has the same extension
    const fileExtension = path.extname(filename);
    
    // First try exact match
    let matchingFiles = files.filter(file => {
      return file.includes(documentId) && file.endsWith(fileExtension);
    });
    
    console.log('🔍 Looking for exact match:', { documentId, fileExtension });
    console.log('🔍 Found exact matches:', matchingFiles);
    
    // Skip proximity matching for now to prevent wrong document returns
    // This will be re-enabled once we have a better document ID matching system
    if (matchingFiles.length === 0) {
      console.log('🔍 No exact match found. Proximity matching disabled to prevent wrong document returns.');
    }
    
    if (matchingFiles.length === 0) {
      // Check if this might be a metadata-only document (education/work experience)
      // These documents have IDs but no actual files uploaded
      console.log('❌ No file found for document ID:', documentId);
      console.log('📋 This might be a metadata-only document (education/work experience)');
      
      return res.status(404).json({ 
        success: false, 
        message: 'Document file not available',
        details: `This document (${filename}) exists as metadata but the actual file was not uploaded to the server. This commonly happens with education and work experience documents that are added as references but not physically uploaded.`,
        documentId,
        filename,
        suggestion: 'Please ask the candidate to re-upload this document using the image upload feature.'
      });
    }
    
    // Use the first matching file
    const matchedFile = matchingFiles[0];
    const filePath = path.join(uploadDir, matchedFile);
    
    console.log('✅ Found document file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }
    
    // Set appropriate headers for file viewing/download
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    let disposition = 'attachment'; // Default to download
    
    // Set correct MIME type for images to allow inline viewing
    if (['.jpg', '.jpeg'].includes(ext)) {
      mimeType = 'image/jpeg';
      disposition = 'inline'; // Allow inline viewing
    } else if (ext === '.png') {
      mimeType = 'image/png';
      disposition = 'inline';
    } else if (ext === '.gif') {
      mimeType = 'image/gif';
      disposition = 'inline';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
      disposition = 'inline';
    } else if (ext === '.pdf') {
      mimeType = 'application/pdf';
      disposition = 'inline'; // PDFs can also be viewed inline
    }
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    
    // Send the file
    res.sendFile(path.resolve(filePath));
    
        } catch (error) {
    console.error('❌ Document download error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update document name
router.put('/:candidateId/document/:documentId/name', async (req, res) => {
  try {
    const { candidateId, documentId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required'
      });
    }

    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    let documentUpdated = false;
    let updatePath = null;
    let updateObject = {};

    // Update document name in candidatePortal data
    if (onboarding.candidatePortal) {
      // Check profile photo
      if (onboarding.candidatePortal.personalInfo?.profilePhoto?.id === documentId) {
        updatePath = 'candidatePortal.personalInfo.profilePhoto';
        updateObject[`${updatePath}.name`] = name.trim();
        documentUpdated = true;
      }

      // Check government documents
      if (onboarding.candidatePortal.governmentDocuments) {
        ['aadhaarImage', 'panImage'].forEach(docType => {
          if (onboarding.candidatePortal.governmentDocuments[docType]?.id === documentId) {
            updatePath = `candidatePortal.governmentDocuments.${docType}`;
            updateObject[`${updatePath}.name`] = name.trim();
            documentUpdated = true;
          }
        });
      }

      // Check bank documents
      if (onboarding.candidatePortal.bankDocuments) {
        ['cancelledCheque', 'passbook', 'bankStatement'].forEach(docType => {
          if (onboarding.candidatePortal.bankDocuments[docType]?.id === documentId) {
            updatePath = `candidatePortal.bankDocuments.${docType}`;
            updateObject[`${updatePath}.name`] = name.trim();
            documentUpdated = true;
          }
        });
      }

      // Check education documents
      if (onboarding.candidatePortal.educationDocuments) {
        const docIndex = onboarding.candidatePortal.educationDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.educationDocuments.${docIndex}`;
          updateObject[`${updatePath}.name`] = name.trim();
          documentUpdated = true;
        }
      }

      // Check work experience documents
      if (onboarding.candidatePortal.workExperienceDocuments) {
        const docIndex = onboarding.candidatePortal.workExperienceDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.workExperienceDocuments.${docIndex}`;
          updateObject[`${updatePath}.name`] = name.trim();
          documentUpdated = true;
        }
      }

      // Check uploaded documents
      if (onboarding.candidatePortal.uploadedDocuments) {
        const docIndex = onboarding.candidatePortal.uploadedDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.uploadedDocuments.${docIndex}`;
          updateObject[`${updatePath}.name`] = name.trim();
          documentUpdated = true;
        }
      }
    }

    if (!documentUpdated) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Use $set to update the specific document name
    await Onboarding.findOneAndUpdate(
      { employeeId: candidateId },
      { $set: updateObject },
      { new: true }
    );

    console.log(`📋 Document ${documentId} name updated to: ${name.trim()} for candidate ${candidateId}`);

    res.json({
      success: true,
      message: 'Document name updated successfully',
      document: {
        id: documentId,
        name: name.trim()
      }
    });

  } catch (error) {
    console.error('❌ Update document name error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Document management endpoints for HR
router.put('/:candidateId/document/:documentId/status', async (req, res) => {
  try {
    const { candidateId, documentId } = req.params;
    const { status, comments } = req.body;

    if (!['pending', 'uploaded', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, uploaded, verified, or rejected'
      });
    }

    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    let documentUpdated = false;

    // Update document status in candidatePortal data
    if (onboarding.candidatePortal) {
      // Check profile photo
      if (onboarding.candidatePortal.personalInfo?.profilePhoto?.id === documentId) {
        onboarding.candidatePortal.personalInfo.profilePhoto.status = status;
        onboarding.candidatePortal.personalInfo.profilePhoto.comments = comments || '';
        onboarding.candidatePortal.personalInfo.profilePhoto.reviewedAt = new Date();
        documentUpdated = true;
      }

      // Check government documents
      if (onboarding.candidatePortal.governmentDocuments) {
        ['aadhaarImage', 'panImage'].forEach(docType => {
          if (onboarding.candidatePortal.governmentDocuments[docType]?.id === documentId) {
            onboarding.candidatePortal.governmentDocuments[docType].status = status;
            onboarding.candidatePortal.governmentDocuments[docType].comments = comments || '';
            onboarding.candidatePortal.governmentDocuments[docType].reviewedAt = new Date();
            documentUpdated = true;
          }
        });
      }

      // Check bank documents
      if (onboarding.candidatePortal.bankDocuments) {
        ['cancelledCheque', 'passbook', 'bankStatement'].forEach(docType => {
          if (onboarding.candidatePortal.bankDocuments[docType]?.id === documentId) {
            onboarding.candidatePortal.bankDocuments[docType].status = status;
            onboarding.candidatePortal.bankDocuments[docType].comments = comments || '';
            onboarding.candidatePortal.bankDocuments[docType].reviewedAt = new Date();
            documentUpdated = true;
          }
        });
      }

      // Check education documents
      if (onboarding.candidatePortal.educationDocuments) {
        const educationDoc = onboarding.candidatePortal.educationDocuments.find(doc => doc.id === documentId);
        if (educationDoc) {
          educationDoc.status = status;
          educationDoc.comments = comments || '';
          educationDoc.reviewedAt = new Date();
          documentUpdated = true;
        }
      }

      // Check work experience documents
      if (onboarding.candidatePortal.workExperienceDocuments) {
        const workDoc = onboarding.candidatePortal.workExperienceDocuments.find(doc => doc.id === documentId);
        if (workDoc) {
          workDoc.status = status;
          workDoc.comments = comments || '';
          workDoc.reviewedAt = new Date();
          documentUpdated = true;
        }
      }

      // Check uploaded documents
      if (onboarding.candidatePortal.uploadedDocuments) {
        const uploadedDoc = onboarding.candidatePortal.uploadedDocuments.find(doc => doc.id === documentId);
        if (uploadedDoc) {
          uploadedDoc.status = status;
          uploadedDoc.comments = comments || '';
          uploadedDoc.reviewedAt = new Date();
          documentUpdated = true;
        }
      }
    }

    if (!documentUpdated) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Create the update object with the specific document path
    let updatePath = null;
    let updateObject = {};
    
    // Find which document was updated and create the specific update path
    if (onboarding.candidatePortal) {
      // Check profile photo
      if (onboarding.candidatePortal.personalInfo?.profilePhoto?.id === documentId) {
        updatePath = 'candidatePortal.personalInfo.profilePhoto';
        updateObject[`${updatePath}.status`] = status;
        updateObject[`${updatePath}.comments`] = comments || '';
        updateObject[`${updatePath}.reviewedAt`] = new Date();
      }
      
      // Check government documents
      if (onboarding.candidatePortal.governmentDocuments) {
        ['aadhaarImage', 'panImage'].forEach(docType => {
          if (onboarding.candidatePortal.governmentDocuments[docType]?.id === documentId) {
            updatePath = `candidatePortal.governmentDocuments.${docType}`;
            updateObject[`${updatePath}.status`] = status;
            updateObject[`${updatePath}.comments`] = comments || '';
            updateObject[`${updatePath}.reviewedAt`] = new Date();
          }
        });
      }
      
      // Check bank documents
      if (onboarding.candidatePortal.bankDocuments) {
        ['cancelledCheque', 'passbook', 'bankStatement'].forEach(docType => {
          if (onboarding.candidatePortal.bankDocuments[docType]?.id === documentId) {
            updatePath = `candidatePortal.bankDocuments.${docType}`;
            updateObject[`${updatePath}.status`] = status;
            updateObject[`${updatePath}.comments`] = comments || '';
            updateObject[`${updatePath}.reviewedAt`] = new Date();
          }
        });
      }
      
      // Check education documents
      if (onboarding.candidatePortal.educationDocuments) {
        const docIndex = onboarding.candidatePortal.educationDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.educationDocuments.${docIndex}`;
          updateObject[`${updatePath}.status`] = status;
          updateObject[`${updatePath}.comments`] = comments || '';
          updateObject[`${updatePath}.reviewedAt`] = new Date();
        }
      }
      
      // Check work experience documents
      if (onboarding.candidatePortal.workExperienceDocuments) {
        const docIndex = onboarding.candidatePortal.workExperienceDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.workExperienceDocuments.${docIndex}`;
          updateObject[`${updatePath}.status`] = status;
          updateObject[`${updatePath}.comments`] = comments || '';
          updateObject[`${updatePath}.reviewedAt`] = new Date();
        }
      }
      
      // Check uploaded documents
      if (onboarding.candidatePortal.uploadedDocuments) {
        const docIndex = onboarding.candidatePortal.uploadedDocuments.findIndex(doc => doc.id === documentId);
        if (docIndex !== -1) {
          updatePath = `candidatePortal.uploadedDocuments.${docIndex}`;
          updateObject[`${updatePath}.status`] = status;
          updateObject[`${updatePath}.comments`] = comments || '';
          updateObject[`${updatePath}.reviewedAt`] = new Date();
        }
      }
    }
    
    // Use $set to update the specific fields
    await Onboarding.findOneAndUpdate(
      { employeeId: candidateId },
      { $set: updateObject },
      { new: true }
    );

    console.log(`📋 Document ${documentId} status updated to: ${status} for candidate ${candidateId}`);

    res.json({
      success: true,
      message: `Document status updated to ${status}`,
      document: {
        id: documentId,
        status,
        comments,
        reviewedAt: new Date()
      }
    });

          } catch (error) {
    console.error('❌ Update document status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Notify candidate that all documents are approved
router.post('/:candidateId/documents-approved', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Use $set to update the approval notification fields directly
    const updateObject = {
      'candidatePortal.documentsApproved': true,
      'candidatePortal.documentsApprovedAt': new Date(),
      'candidatePortal.documentsApprovalMessage': 'All your documents have been reviewed and approved by HR. You will be contacted regarding next steps.'
    };

    await Onboarding.findOneAndUpdate(
      { employeeId: candidateId },
      { $set: updateObject },
      { new: true }
    );

    console.log(`✅ All documents approved notification sent to candidate ${candidateId}`);

    res.json({
      success: true,
      message: 'Candidate notified of document approval',
      approvedAt: updateObject['candidatePortal.documentsApprovedAt']
    });

  } catch (error) {
    console.error('❌ Notify documents approved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get document rejection details for candidate
router.get('/:candidateId/document-rejections', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const onboarding = await Onboarding.findOne({ employeeId: candidateId });
    if (!onboarding) {
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found'
      });
    }

    const rejectedDocuments = [];

    if (onboarding.candidatePortal) {
      // Check profile photo
      if (onboarding.candidatePortal.personalInfo?.profilePhoto?.status === 'rejected') {
        rejectedDocuments.push({
          id: onboarding.candidatePortal.personalInfo.profilePhoto.id,
          name: onboarding.candidatePortal.personalInfo.profilePhoto.name,
          type: 'Profile Photo',
          category: 'personal',
          status: 'rejected',
          comments: onboarding.candidatePortal.personalInfo.profilePhoto.comments,
          reviewedAt: onboarding.candidatePortal.personalInfo.profilePhoto.reviewedAt,
          canReupload: true
        });
      }

      // Check government documents
      if (onboarding.candidatePortal.governmentDocuments) {
        ['aadhaarImage', 'panImage'].forEach(docType => {
          const doc = onboarding.candidatePortal.governmentDocuments[docType];
          if (doc?.status === 'rejected') {
            rejectedDocuments.push({
              id: doc.id,
              name: doc.name,
              type: docType === 'aadhaarImage' ? 'Aadhaar Card' : 'PAN Card',
              category: 'government',
              status: 'rejected',
              comments: doc.comments,
              reviewedAt: doc.reviewedAt,
              canReupload: true
            });
          }
        });
      }

      // Check bank documents
      if (onboarding.candidatePortal.bankDocuments) {
        ['cancelledCheque', 'passbook', 'bankStatement'].forEach(docType => {
          const doc = onboarding.candidatePortal.bankDocuments[docType];
          if (doc?.status === 'rejected') {
            const typeNames = {
              cancelledCheque: 'Cancelled Cheque',
              passbook: 'Bank Passbook',
              bankStatement: 'Bank Statement'
            };
            rejectedDocuments.push({
              id: doc.id,
              name: doc.name,
              type: typeNames[docType],
              category: 'bank',
              status: 'rejected',
              comments: doc.comments,
              reviewedAt: doc.reviewedAt,
              canReupload: true
            });
          }
        });
      }

      // Check education documents
      if (onboarding.candidatePortal.educationDocuments) {
        onboarding.candidatePortal.educationDocuments.forEach(doc => {
          if (doc.status === 'rejected') {
            rejectedDocuments.push({
              id: doc.id,
              name: doc.name,
              type: 'Education Document',
              category: 'education',
              status: 'rejected',
              comments: doc.comments,
              reviewedAt: doc.reviewedAt,
              canReupload: true
            });
          }
        });
      }

      // Check work experience documents
      if (onboarding.candidatePortal.workExperienceDocuments) {
        onboarding.candidatePortal.workExperienceDocuments.forEach(doc => {
          if (doc.status === 'rejected') {
            const typeNames = {
              experienceLetters: 'Experience Letter',
              relievingCertificate: 'Relieving Certificate',
              salarySlips: 'Salary Slip'
            };
            rejectedDocuments.push({
              id: doc.id,
              name: doc.name,
              type: typeNames[doc.type] || 'Work Experience Document',
              category: 'work_experience',
              status: 'rejected',
              comments: doc.comments,
              reviewedAt: doc.reviewedAt,
              canReupload: true
            });
          }
        });
      }

      // Check uploaded documents
      if (onboarding.candidatePortal.uploadedDocuments) {
        onboarding.candidatePortal.uploadedDocuments.forEach(doc => {
          if (doc.status === 'rejected') {
            rejectedDocuments.push({
              id: doc.id,
              name: doc.name,
              type: 'General Upload',
              category: 'portal',
              status: 'rejected',
              comments: doc.comments,
              reviewedAt: doc.reviewedAt,
              canReupload: true
            });
          }
        });
      }
    }

    res.json({
      success: true,
      rejectedDocuments,
      totalRejected: rejectedDocuments.length
    });
    
  } catch (error) {
    console.error('❌ Get document rejections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
