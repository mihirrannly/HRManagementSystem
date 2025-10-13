const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, s3Config, isS3Enabled } = require('../config/s3');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate a unique filename for S3
 * @param {string} originalname - Original filename
 * @param {string} folder - S3 folder path (e.g., 'employees', 'onboarding')
 * @returns {string} - S3 key
 */
const generateS3Key = (originalname, folder = 'uploads') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  return `${folder}/${timestamp}-${randomString}-${basename}${ext}`;
};

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalname - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} folder - S3 folder path
 * @returns {Promise<Object>} - Upload result with S3 key and URL
 */
const uploadToS3 = async (fileBuffer, originalname, mimetype, folder = 'uploads') => {
  if (!isS3Enabled()) {
    throw new Error('S3 is not configured. Please set up AWS credentials.');
  }

  const key = generateS3Key(originalname, folder);

  const uploadParams = {
    Bucket: s3Config.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    // ACL is now set via bucket policy or object ownership settings
    // ServerSideEncryption: 'AES256', // Optional: Enable server-side encryption
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate the S3 URL
    const s3Url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;

    console.log(`✅ File uploaded to S3: ${key}`);

    return {
      success: true,
      key: key,
      url: s3Url,
      bucket: s3Config.bucket,
      location: s3Url,
      originalname: originalname,
      mimetype: mimetype,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Generate a signed URL for private S3 objects
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
const getSignedUrlForS3Object = async (key, expiresIn = s3Config.signedUrlExpiration) => {
  if (!isS3Enabled()) {
    throw new Error('S3 is not configured. Please set up AWS credentials.');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} - Success status
 */
const deleteFromS3 = async (key) => {
  if (!isS3Enabled()) {
    throw new Error('S3 is not configured. Please set up AWS credentials.');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✅ File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Check if file exists in S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} - True if file exists
 */
const fileExistsInS3 = async (key) => {
  if (!isS3Enabled()) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
};

/**
 * Get file metadata from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} - File metadata
 */
const getS3FileMetadata = async (key) => {
  if (!isS3Enabled()) {
    throw new Error('S3 is not configured. Please set up AWS credentials.');
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error) {
    console.error('❌ Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};

/**
 * Extract S3 key from URL
 * @param {string} url - S3 URL or key
 * @returns {string} - S3 key
 */
const extractS3Key = (url) => {
  if (!url) return null;

  // If it's already a key (doesn't start with http)
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract key from S3 URL
  // Format: https://bucket.s3.region.amazonaws.com/key
  const urlObj = new URL(url);
  return urlObj.pathname.substring(1); // Remove leading '/'
};

/**
 * Get public URL for S3 object
 * @param {string} key - S3 object key
 * @returns {string} - Public URL
 */
const getPublicUrl = (key) => {
  if (!key) return null;
  return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;
};

module.exports = {
  uploadToS3,
  getSignedUrlForS3Object,
  deleteFromS3,
  fileExistsInS3,
  getS3FileMetadata,
  generateS3Key,
  extractS3Key,
  getPublicUrl,
  isS3Enabled
};

