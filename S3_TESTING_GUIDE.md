# S3 Integration Testing Guide

## Current Status
❌ S3 is **NOT CONFIGURED** - System is using local storage

## Quick Setup & Testing Steps

### Step 1: Configure S3 Credentials in .env

Add these variables to your `.env` file:

```env
# Enable S3
USE_S3=true

# AWS Credentials (Get from AWS Console → IAM)
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACL=private
AWS_S3_SIGNED_URL_EXPIRATION=3600
```

### Step 2: Restart the Server

After updating `.env`, restart your dev servers:

```bash
# Stop current servers (Ctrl+C in terminal)
# Then restart
npm run dev
```

### Step 3: Verify S3 Connection

Look for these success messages in the backend logs:
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
🌍 Region: us-east-1
```

Instead of:
```
⚠️  Using local disk storage for folder: employees (S3 not configured)
```

---

## Testing S3 Upload

### Option 1: Use the UI (Recommended)

1. **Test Employee Document Upload:**
   - Go to: http://localhost:5173
   - Navigate to `Employees` section
   - Click on any employee
   - Upload a profile photo or document
   - Check browser Network tab for upload request
   - File URL should contain S3 bucket name

2. **Test Onboarding Document Upload:**
   - Go to `Onboarding` section
   - Create a new candidate
   - Upload documents (Aadhaar, PAN, Photo, etc.)
   - Documents should upload to S3

3. **Test Offer Letter Upload:**
   - Go to `Offer Letters` section
   - Create/edit an offer letter
   - Upload company logo
   - Should upload to S3

### Option 2: Use the Test Script

I've created a test script for you. Run it:

```bash
node test-s3-upload.js
```

This will:
- ✅ Check S3 configuration
- ✅ Test file upload to S3
- ✅ Generate signed URL
- ✅ Verify file exists
- ✅ Clean up test file

### Option 3: Use API Directly

Test with curl:

```bash
# Replace YOUR_AUTH_TOKEN with a valid JWT token
curl -X POST http://localhost:5001/api/test/s3-upload \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "file=@/path/to/test-file.pdf"
```

---

## What to Look For

### ✅ Success Indicators:

1. **Server Logs:**
   ```
   ✅ S3 Client initialized successfully
   📦 Using S3 Bucket: your-bucket-name
   ```

2. **File URLs in Database:**
   ```
   https://your-bucket-name.s3.us-east-1.amazonaws.com/employees/...
   ```
   Instead of:
   ```
   /uploads/employees/...
   ```

3. **AWS S3 Console:**
   - Login to AWS Console
   - Navigate to S3
   - Open your bucket
   - You should see folders: `employees/`, `onboarding/`, `profiles/`, etc.
   - Files should be organized in these folders

### ❌ Common Issues:

**Issue 1: "S3 is not configured" warning**
- Solution: Ensure `USE_S3=true` in `.env` and restart server

**Issue 2: "Access Denied" error**
- Solution: Check IAM user has S3 permissions (AmazonS3FullAccess)
- Verify bucket name is correct

**Issue 3: "Region mismatch" error**
- Solution: Ensure `AWS_REGION` matches your bucket's region

**Issue 4: "SignatureDoesNotMatch" error**
- Solution: Check AWS credentials (no extra spaces, correct values)

---

## Detailed Testing Scenarios

### Scenario 1: Employee Profile Photo Upload

```javascript
// Expected Flow:
1. User uploads photo via UI
2. Backend receives file
3. Multer-S3 middleware uploads to S3
4. Returns S3 URL: https://bucket.s3.region.amazonaws.com/employees/timestamp-hash-filename.jpg
5. URL saved in MongoDB
6. Frontend displays image from S3
```

**Test Steps:**
1. Go to Employees → Select employee → Upload photo
2. Open browser DevTools → Network tab
3. Look for upload request
4. Check response - should contain S3 URL
5. Image should display correctly
6. Go to AWS Console → S3 → Check file exists in `employees/` folder

### Scenario 2: Onboarding Documents

```javascript
// Expected Flow:
1. HR uploads candidate documents
2. Files go to S3 in onboarding/ folder
3. Organized by document type
4. Generates signed URLs for secure access
```

**Test Steps:**
1. Go to Onboarding → Add candidate
2. Upload multiple documents (Aadhaar, PAN, Photo, Resume)
3. Save candidate
4. All documents should be in S3
5. Check AWS Console → S3 → `onboarding/` folder

### Scenario 3: Signed URLs (Private Files)

S3 buckets are private by default. Files are accessed via signed URLs that expire after 1 hour (configurable).

**Test Steps:**
1. Upload a document
2. Check the URL in database
3. Try accessing URL directly - should work
4. URL is valid for 1 hour (default: 3600 seconds)
5. After expiration, URL returns "Access Denied"

---

## Monitoring S3 Usage

### AWS Console
1. Go to: S3 → Your Bucket → Metrics
2. View:
   - Total storage
   - Number of objects
   - Request count
   - Data transfer

### CloudWatch (Optional)
- Set up alerts for:
  - Storage threshold (e.g., > 10GB)
  - Unusual upload activity
  - Error rates

---

## Cost Monitoring

Check your AWS costs:
1. AWS Console → Billing Dashboard
2. S3 costs breakdown:
   - Storage: ~$0.023/GB/month
   - Requests: Minimal for typical HR usage
   - Data transfer: First 1GB free, then ~$0.09/GB

**Typical HR System Cost:**
- 500 employees, 10MB avg per employee
- Total: 5GB storage = ~$0.12/month
- Very affordable! 💰

---

## Troubleshooting Commands

### Check if files are uploading to S3:
```bash
# Login to AWS CLI (if installed)
aws s3 ls s3://your-bucket-name/ --recursive

# Check specific folder
aws s3 ls s3://your-bucket-name/employees/
```

### Download a file from S3 (for verification):
```bash
aws s3 cp s3://your-bucket-name/employees/filename.pdf ./test-download.pdf
```

### Check S3 bucket permissions:
```bash
aws s3api get-bucket-acl --bucket your-bucket-name
```

---

## Need Help?

1. **AWS Setup Issues**: See `S3_INTEGRATION_GUIDE.md` - Complete setup guide
2. **Quick Reference**: See `S3_QUICK_SETUP.md` - 5-minute setup
3. **Server Logs**: Check backend terminal for detailed error messages
4. **AWS Support**: Check AWS Console for IAM/S3 configuration issues

---

## Summary Checklist

- [ ] AWS S3 bucket created
- [ ] IAM user created with S3 permissions
- [ ] Access keys saved securely
- [ ] `.env` file updated with S3 credentials
- [ ] `USE_S3=true` set in `.env`
- [ ] Server restarted
- [ ] Success logs visible in console
- [ ] Test upload successful
- [ ] Files visible in AWS S3 Console
- [ ] Images/documents display correctly in UI

Once all checked, your S3 integration is working! ✅

---

## Next Steps

After successful testing:
1. ✅ Keep S3 enabled for development
2. ✅ Test all upload features in the system
3. ✅ Set up production S3 bucket (separate from dev)
4. ✅ Configure production `.env` with prod credentials
5. ✅ Enable S3 bucket versioning (for recovery)
6. ✅ Set up S3 lifecycle rules (optional - for auto-archiving old files)
7. ✅ Monitor costs via AWS Billing Dashboard

---

**Ready to test? Follow the steps above and let me know if you encounter any issues!** 🚀


