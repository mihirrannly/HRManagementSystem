const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const { s3Client, s3Config, isS3Enabled } = require('../config/s3');
const { generateS3Key } = require('../services/s3Service');

/**
 * Create multer storage configuration
 * Uses S3 if enabled, otherwise falls back to local disk storage
 * @param {string} folder - Folder name for organizing uploads (e.g., 'employees', 'onboarding')
 * @returns {Object} - Multer storage configuration
 */
const createStorage = (folder = 'uploads') => {
  // Use S3 storage if enabled
  if (isS3Enabled()) {
    console.log(`✅ Using S3 storage for folder: ${folder}`);
    
    return multerS3({
      s3: s3Client,
      bucket: s3Config.bucket,
      // ACL is now managed via bucket policy
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
      },
      key: function (req, file, cb) {
        const key = generateS3Key(file.originalname, folder);
        cb(null, key);
      }
    });
  }

  // Fallback to local disk storage
  console.log(`⚠️  Using local disk storage for folder: ${folder} (S3 not configured)`);
  
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = `uploads/${folder}`;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

/**
 * File filter for images and documents
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents (JPEG, PNG, GIF, PDF, DOC, DOCX) are allowed'));
  }
};

/**
 * File filter for images only
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed'));
  }
};

/**
 * File filter for onboarding documents
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const onboardingFileFilter = (req, file, cb) => {
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
};

/**
 * Create multer upload instance
 * @param {string} folder - Folder name for organizing uploads
 * @param {Object} options - Additional multer options
 * @returns {Object} - Multer upload instance
 */
const createUpload = (folder = 'uploads', options = {}) => {
  const defaultOptions = {
    storage: createStorage(folder),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: options.fileFilter || fileFilter
  };

  return multer({ ...defaultOptions, ...options });
};

/**
 * Pre-configured upload instances for common use cases
 */
const uploads = {
  // Employee documents
  employee: createUpload('employees', {
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }),

  // Onboarding documents
  onboarding: createUpload('onboarding', {
    fileFilter: onboardingFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }),

  // Candidate portal uploads
  candidate: createUpload('onboarding', {
    fileFilter: onboardingFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }),

  // Profile images
  profile: createUpload('profiles', {
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }),

  // General documents
  document: createUpload('documents', {
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }),

  // Assets
  asset: createUpload('assets', {
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  })
};

/**
 * Get file URL based on storage type (S3 or local)
 * @param {Object} file - Multer file object
 * @returns {string} - File URL
 */
const getFileUrl = (file) => {
  if (!file) return null;

  // S3 file
  if (file.location) {
    return file.location;
  }

  // S3 file (multer-s3 format)
  if (file.key) {
    return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${file.key}`;
  }

  // Local file
  if (file.path) {
    // Convert Windows paths to URL format
    const urlPath = file.path.replace(/\\/g, '/');
    return `/${urlPath}`;
  }

  return null;
};

/**
 * Get file key for S3 or local path
 * @param {Object} file - Multer file object
 * @returns {string} - File key or path
 */
const getFileKey = (file) => {
  if (!file) return null;

  // S3 file
  if (file.key) {
    return file.key;
  }

  // Local file
  if (file.path) {
    return file.path;
  }

  if (file.filename) {
    return file.filename;
  }

  return null;
};

module.exports = {
  createStorage,
  createUpload,
  uploads,
  fileFilter,
  imageFilter,
  onboardingFileFilter,
  getFileUrl,
  getFileKey
};

