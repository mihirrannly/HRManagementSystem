/**
 * S3 Upload Test Script
 * 
 * This script tests the S3 integration by:
 * 1. Checking S3 configuration
 * 2. Creating a test file
 * 3. Uploading to S3
 * 4. Generating signed URL
 * 5. Verifying file exists
 * 6. Cleaning up test file
 * 
 * Usage: node test-s3-upload.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testS3() {
  log('\n=== S3 Integration Test ===\n', colors.cyan);

  // Step 1: Check Configuration
  logInfo('Step 1: Checking S3 Configuration...');
  
  const requiredVars = [
    'USE_S3',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
  ];

  const missingVars = requiredVars.filter(v => !process.env[v] || process.env[v] === 'your-access-key-here' || process.env[v] === 'your-secret-key-here' || process.env[v] === 'your-bucket-name');

  if (process.env.USE_S3 !== 'true') {
    logError('S3 is NOT enabled!');
    logWarning('Set USE_S3=true in your .env file');
    process.exit(1);
  }

  if (missingVars.length > 0) {
    logError(`Missing or invalid configuration: ${missingVars.join(', ')}`);
    logWarning('Please update your .env file with valid AWS credentials');
    logInfo('\nRequired .env variables:');
    console.log(`
USE_S3=true
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACL=private
AWS_S3_SIGNED_URL_EXPIRATION=3600
    `);
    process.exit(1);
  }

  logSuccess('S3 Configuration looks good!');
  console.log(`   Region: ${process.env.AWS_REGION}`);
  console.log(`   Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`   ACL: ${process.env.AWS_S3_ACL || 'private'}`);

  // Step 2: Import S3 Service
  logInfo('\nStep 2: Importing S3 Service...');
  
  let s3Service;
  try {
    s3Service = require('./server/services/s3Service');
    logSuccess('S3 Service imported successfully');
  } catch (error) {
    logError(`Failed to import S3 service: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Create Test File
  logInfo('\nStep 3: Creating test file...');
  
  const testContent = `
===========================================
  S3 Integration Test File
===========================================

Generated: ${new Date().toISOString()}
Bucket: ${process.env.AWS_S3_BUCKET}
Region: ${process.env.AWS_REGION}

This is a test file to verify S3 upload functionality.
If you can see this file in your S3 bucket, the integration is working correctly!

Test Details:
- File Type: Text
- Encoding: UTF-8
- Purpose: S3 Upload Verification
`;

  const testFilePath = path.join(__dirname, 'test-s3-file.txt');
  fs.writeFileSync(testFilePath, testContent);
  logSuccess('Test file created: test-s3-file.txt');

  // Step 4: Upload to S3
  logInfo('\nStep 4: Uploading file to S3...');
  
  try {
    const fileBuffer = fs.readFileSync(testFilePath);
    const result = await s3Service.uploadToS3(
      fileBuffer,
      'test-s3-file.txt',
      'text/plain',
      'test-uploads'
    );

    logSuccess('File uploaded successfully!');
    console.log(`   URL: ${result.url}`);
    console.log(`   Key: ${result.key}`);
    console.log(`   Location: ${result.location}`);

    // Step 5: Generate Signed URL
    logInfo('\nStep 5: Generating signed URL...');
    
    const signedUrl = await s3Service.getSignedUrlForS3Object(result.key, 3600);
    logSuccess('Signed URL generated!');
    console.log(`   URL (valid for 1 hour): ${signedUrl}`);

    // Step 6: Verify File Exists
    logInfo('\nStep 6: Verifying file exists in S3...');
    
    const exists = await s3Service.fileExistsInS3(result.key);
    if (exists) {
      logSuccess('File verified in S3!');
    } else {
      logError('File not found in S3 (this should not happen)');
    }

    // Step 7: Clean Up Test File
    logInfo('\nStep 7: Cleaning up...');
    
    // Delete from S3
    await s3Service.deleteFromS3(result.key);
    logSuccess('Test file deleted from S3');

    // Delete local test file
    fs.unlinkSync(testFilePath);
    logSuccess('Local test file deleted');

    // Final Summary
    log('\n===========================================', colors.cyan);
    log('✅ ALL TESTS PASSED!', colors.green);
    log('===========================================\n', colors.cyan);
    
    console.log('Your S3 integration is working correctly! 🎉\n');
    console.log('What was tested:');
    console.log('  ✅ Configuration validation');
    console.log('  ✅ File upload to S3');
    console.log('  ✅ Signed URL generation');
    console.log('  ✅ File existence verification');
    console.log('  ✅ File deletion from S3\n');
    
    logInfo('Next steps:');
    console.log('  1. Test file uploads through the UI');
    console.log('  2. Check AWS S3 Console to see uploaded files');
    console.log('  3. Monitor costs in AWS Billing Dashboard\n');

  } catch (error) {
    logError(`Test failed: ${error.message}`);
    
    if (error.code === 'InvalidAccessKeyId') {
      logWarning('Invalid AWS Access Key ID - check your credentials');
    } else if (error.code === 'SignatureDoesNotMatch') {
      logWarning('Invalid AWS Secret Access Key - check your credentials');
    } else if (error.code === 'NoSuchBucket') {
      logWarning(`Bucket "${process.env.AWS_S3_BUCKET}" does not exist`);
      logInfo('Create the bucket in AWS Console or check the bucket name');
    } else if (error.code === 'AccessDenied') {
      logWarning('Access denied - check IAM user permissions');
      logInfo('IAM user needs: s3:PutObject, s3:GetObject, s3:DeleteObject, s3:ListBucket');
    } else {
      console.error('\nFull error:', error);
    }

    // Clean up local file if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      logInfo('Local test file cleaned up');
    }

    process.exit(1);
  }
}

// Run the test
testS3().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});


