const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Validate S3 configuration
const validateS3Config = () => {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  S3 Configuration Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  File uploads will fail until these are configured.');
    return false;
  }
  
  return true;
};

// Check if S3 is enabled
const isS3Enabled = () => {
  return process.env.USE_S3 === 'true' && validateS3Config();
};

// Create S3 client
const createS3Client = () => {
  if (!isS3Enabled()) {
    return null;
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('✅ S3 Client initialized successfully');
    console.log(`📦 Using S3 Bucket: ${process.env.AWS_S3_BUCKET}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION}`);
    
    return s3Client;
  } catch (error) {
    console.error('❌ Failed to initialize S3 Client:', error.message);
    return null;
  }
};

// S3 configuration
const s3Config = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  acl: process.env.AWS_S3_ACL || 'private', // private, public-read, etc.
  signedUrlExpiration: parseInt(process.env.AWS_S3_SIGNED_URL_EXPIRATION) || 3600, // 1 hour default
};

// Export S3 client and configuration
module.exports = {
  s3Client: createS3Client(),
  s3Config,
  isS3Enabled,
  validateS3Config
};

