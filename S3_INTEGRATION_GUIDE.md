# AWS S3 Integration Guide

## Overview

This HR Management system now supports AWS S3 for cloud-based file storage. All file uploads (employee documents, onboarding files, candidate portal uploads) can be stored in S3 buckets instead of local storage.

## Features

✅ **Automatic Storage Selection**: Uses S3 if configured, falls back to local storage  
✅ **Seamless Integration**: Works with existing upload endpoints without code changes  
✅ **Secure Storage**: Supports private buckets with signed URLs  
✅ **Multiple File Types**: Supports images (JPEG, PNG, GIF, WEBP), documents (PDF, DOC, DOCX)  
✅ **Organized Storage**: Files are automatically organized by type (employees/, onboarding/, etc.)  
✅ **Flexible Configuration**: Easy toggle between S3 and local storage

---

## Quick Start

### 1. Create an AWS S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `your-company-hr-documents`)
   - **Region**: Select your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: Keep all options checked (recommended for security)
   - **Bucket Versioning**: Enable (optional, recommended for recovery)
   - **Encryption**: Enable default encryption with SSE-S3 (recommended)
5. Click **Create bucket**

### 2. Create IAM User with S3 Access

1. Navigate to **IAM** service in AWS Console
2. Click **Users** → **Add users**
3. Enter username (e.g., `hr-system-s3-user`)
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**
6. Choose **Attach existing policies directly**
7. Select **AmazonS3FullAccess** (or create a custom policy - see below)
8. Click **Next** until you reach **Create user**
9. **Important**: Save the **Access Key ID** and **Secret Access Key** (you won't see them again)

### 3. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Enable S3 storage
USE_S3=true

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here

# S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACL=private
AWS_S3_SIGNED_URL_EXPIRATION=3600
```

### 4. Restart Your Server

```bash
npm run server
```

You should see in the logs:
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
🌍 Region: us-east-1
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USE_S3` | Yes | `false` | Enable/disable S3 storage (`true` or `false`) |
| `AWS_ACCESS_KEY_ID` | Yes* | - | Your AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | Yes* | - | Your AWS secret access key |
| `AWS_REGION` | Yes* | - | AWS region (e.g., `us-east-1`, `ap-south-1`) |
| `AWS_S3_BUCKET` | Yes* | - | Your S3 bucket name |
| `AWS_S3_ACL` | No | `private` | Access control (private, public-read, etc.) |
| `AWS_S3_SIGNED_URL_EXPIRATION` | No | `3600` | Signed URL expiration in seconds (1 hour) |

\* Required only when `USE_S3=true`

---

## S3 Bucket Structure

Files are automatically organized in S3 with the following structure:

```
your-bucket-name/
├── employees/
│   └── 1234567890-abc123def456-document-name.pdf
├── onboarding/
│   ├── 1234567890-abc123def456-profile-photo.jpg
│   ├── 1234567890-abc123def456-aadhaar.pdf
│   └── 1234567890-abc123def456-degree.pdf
├── profiles/
│   └── 1234567890-abc123def456-avatar.jpg
├── documents/
│   └── 1234567890-abc123def456-policy.pdf
└── assets/
    └── 1234567890-abc123def456-laptop.jpg
```

**File Naming Convention**: `{timestamp}-{random-hash}-{sanitized-filename}.{ext}`

---

## Security Best Practices

### 1. Use IAM Policies (Recommended)

Instead of `AmazonS3FullAccess`, create a custom policy with minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### 2. Keep Bucket Private

- Keep **Block all public access** enabled
- Use signed URLs for file access (built into the system)
- Never make sensitive documents publicly accessible

### 3. Enable Bucket Versioning

- Protects against accidental deletion
- Allows recovery of previous versions
- Minimal cost increase

### 4. Enable Server-Side Encryption

- Use SSE-S3 or SSE-KMS encryption
- Ensures data is encrypted at rest
- Transparent to the application

### 5. Rotate Access Keys Regularly

- Rotate IAM access keys every 90 days
- Use AWS Secrets Manager for production (advanced)

---

## Usage Examples

### Backend (Automatic)

The system automatically handles S3 uploads. No code changes needed!

```javascript
// In any route file
const { uploads } = require('../middleware/s3Upload');

// Single file upload
router.post('/upload', uploads.employee.single('document'), async (req, res) => {
  const fileUrl = getFileUrl(req.file); // Works for both S3 and local
  // fileUrl is automatically the S3 URL or local path
});

// Multiple files
router.post('/upload-multi', uploads.employee.array('documents', 10), async (req, res) => {
  const files = req.files.map(file => ({
    url: getFileUrl(file),
    key: file.key, // S3 key for deletion
    name: file.originalname
  }));
});
```

### Frontend

No changes needed! Upload endpoints work the same way:

```javascript
const formData = new FormData();
formData.append('document', file);

await axios.post('/api/employees/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### File URLs

**With S3**:
```
https://your-bucket-name.s3.us-east-1.amazonaws.com/employees/1234567890-abc123-document.pdf
```

**Without S3** (local):
```
/uploads/employees/document-1234567890-abc123.pdf
```

The system handles both transparently.

---

## Advanced Features

### Generate Signed URLs

For private files, generate temporary signed URLs:

```javascript
const { getSignedUrlForS3Object } = require('../services/s3Service');

// Generate a signed URL valid for 1 hour (default)
const signedUrl = await getSignedUrlForS3Object('employees/file.pdf');

// Custom expiration (2 hours)
const signedUrl = await getSignedUrlForS3Object('employees/file.pdf', 7200);
```

### Delete Files from S3

```javascript
const { deleteFromS3 } = require('../services/s3Service');

await deleteFromS3('employees/1234567890-abc123-document.pdf');
```

### Check if File Exists

```javascript
const { fileExistsInS3 } = require('../services/s3Service');

const exists = await fileExistsInS3('employees/file.pdf');
```

### Upload Programmatically

```javascript
const { uploadToS3 } = require('../services/s3Service');

const result = await uploadToS3(
  fileBuffer,
  'original-filename.pdf',
  'application/pdf',
  'employees' // folder
);

console.log(result.url); // S3 URL
console.log(result.key); // S3 key for deletion
```

---

## Troubleshooting

### Issue: "S3 is not configured" Error

**Cause**: Missing or incorrect environment variables

**Solution**:
1. Check `.env` file has all required S3 variables
2. Ensure `USE_S3=true`
3. Verify credentials are correct (no extra spaces)
4. Restart the server after updating `.env`

### Issue: "Access Denied" Error

**Cause**: Insufficient IAM permissions

**Solution**:
1. Verify IAM user has S3 permissions
2. Check bucket policy doesn't block the IAM user
3. Ensure bucket name is correct in `.env`
4. Verify region matches bucket region

### Issue: Files Upload but Can't Access

**Cause**: Bucket is private and not using signed URLs

**Solution**:
- For private files: Use `getSignedUrlForS3Object()` to generate access URLs
- For public files: Set `AWS_S3_ACL=public-read` (not recommended for sensitive data)

### Issue: Large Files Fail to Upload

**Cause**: File size limit reached

**Solution**:
- Increase `MAX_FILE_SIZE` in `.env` (in bytes)
- Default is 10MB (10485760 bytes)
- For 50MB: `MAX_FILE_SIZE=52428800`

### Issue: Slow Uploads

**Cause**: Region mismatch or network latency

**Solution**:
- Use S3 bucket in region closest to your server
- Consider using AWS CloudFront CDN for global distribution

---

## Migration from Local Storage to S3

### Option 1: Start Fresh (Recommended for New Systems)

1. Configure S3 as described above
2. All new uploads will go to S3
3. Existing local files remain accessible

### Option 2: Migrate Existing Files

Create a migration script:

```javascript
const fs = require('fs');
const path = require('path');
const { uploadToS3 } = require('./server/services/s3Service');

async function migrateFiles() {
  const uploadsDir = './uploads';
  
  // Read all files from local uploads
  const files = getAllFilesRecursively(uploadsDir);
  
  for (const filePath of files) {
    const fileBuffer = fs.readFileSync(filePath);
    const relativePath = path.relative(uploadsDir, filePath);
    const folder = path.dirname(relativePath);
    const filename = path.basename(filePath);
    
    // Upload to S3
    const result = await uploadToS3(
      fileBuffer,
      filename,
      getMimeType(filename),
      folder
    );
    
    console.log(`Migrated: ${filePath} -> ${result.url}`);
    
    // Update database URLs (implement based on your schema)
    // await updateDatabaseUrl(filePath, result.url);
  }
}

function getAllFilesRecursively(dir) {
  // Implementation depends on your needs
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
```

---

## Cost Estimation

### AWS S3 Pricing (as of 2024)

**Storage** (Standard):
- First 50 TB: $0.023 per GB/month
- Example: 100GB = ~$2.30/month

**Data Transfer OUT**:
- First 1 GB: Free
- Next 9.999 TB: $0.09 per GB
- Example: 10GB out = ~$0.90

**Requests**:
- PUT/POST: $0.005 per 1,000 requests
- GET: $0.0004 per 1,000 requests

**Typical HR System**:
- 500 employees
- Average 10MB documents per employee
- Total: 5GB storage = ~$0.12/month
- Minimal transfer costs

⚠️ Prices vary by region. Check [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/) for current rates.

---

## Testing

### Test S3 Configuration

```bash
# Check if S3 is configured
curl http://localhost:5001/api/health
# Look for S3 client logs in console

# Test file upload
curl -X POST http://localhost:5001/api/employees/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@test-file.pdf"
```

### Development vs Production

**Development**:
```env
USE_S3=false  # Use local storage for faster testing
```

**Production**:
```env
USE_S3=true  # Use S3 for scalability and reliability
```

---

## Support & Resources

### AWS Documentation
- [S3 Getting Started](https://docs.aws.amazon.com/s3/latest/userguide/GetStartedWithS3.html)
- [IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

### Package Documentation
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [multer-s3](https://www.npmjs.com/package/multer-s3)

---

## Summary

Your HR Management system is now equipped with enterprise-grade cloud storage:

✅ **Easy Setup**: Configure 6 environment variables  
✅ **Zero Code Changes**: Existing upload endpoints work automatically  
✅ **Secure**: Private buckets with signed URLs  
✅ **Scalable**: Handle unlimited files without server storage concerns  
✅ **Cost-Effective**: Pay only for what you use  
✅ **Reliable**: 99.999999999% durability guaranteed by AWS  

Need help? Check the troubleshooting section or contact your system administrator.

