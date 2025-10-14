# Test S3 Integration - Quick Start

## 🚀 3 Ways to Test S3

### Method 1: Automated Test Script (Fastest) ⚡

```bash
node test-s3-upload.js
```

**What it does:**
- ✅ Validates configuration
- ✅ Tests upload
- ✅ Generates signed URL
- ✅ Verifies file
- ✅ Cleans up automatically

**Expected Output:**
```
=== S3 Integration Test ===

ℹ️  Step 1: Checking S3 Configuration...
✅ S3 Configuration looks good!
   Region: us-east-1
   Bucket: your-bucket-name
   
✅ ALL TESTS PASSED! 🎉
```

---

### Method 2: UI Testing (Most Realistic) 🖥️

#### Test 1: Employee Photo Upload
1. Open http://localhost:5173
2. Login as admin
3. Go to **Employees**
4. Click any employee
5. Click profile picture area
6. Upload a photo
7. **Check:** Photo should display immediately
8. **Verify:** Open AWS Console → S3 → your-bucket → `employees/` folder

#### Test 2: Onboarding Documents
1. Go to **Onboarding** → **Add Candidate**
2. Fill basic details
3. Upload documents (Aadhaar, PAN, Photo)
4. Save candidate
5. **Verify:** AWS Console → S3 → `onboarding/` folder

#### Test 3: Offer Letter Logo
1. Go to **Offer Letters**
2. Create new offer letter
3. Upload company logo
4. **Verify:** Logo appears in preview
5. **Check:** AWS Console → S3 → `assets/` folder

---

### Method 3: API Testing (Developer) 🔧

**Using curl:**

```bash
# Get auth token first (login)
TOKEN="your-jwt-token-here"

# Test upload
curl -X POST http://localhost:5001/api/test/s3-upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.pdf"
```

**Using Postman:**
1. POST to `http://localhost:5001/api/employees/upload`
2. Headers: `Authorization: Bearer YOUR_TOKEN`
3. Body: form-data, key: `document`, value: file
4. Send request
5. Check response for S3 URL

---

## 🔍 How to Know S3 is Working

### ✅ Success Signs:

**1. Server Logs:**
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
🌍 Region: us-east-1
```

**NOT:**
```
⚠️  Using local disk storage for folder: employees (S3 not configured)
```

**2. File URLs:**
```
https://your-bucket.s3.us-east-1.amazonaws.com/employees/file.jpg
```

**NOT:**
```
/uploads/employees/file.jpg
```

**3. AWS Console:**
- Login to AWS Console
- Navigate to S3 → Your Bucket
- See folders: `employees/`, `onboarding/`, `profiles/`, `documents/`, `assets/`
- Files should be there!

---

## ⚠️ Troubleshooting

### Problem: Still seeing "⚠️ Using local disk storage"

**Solution:**
```bash
# 1. Check .env file
grep "USE_S3" .env

# Should output: USE_S3=true
# If not, add it to .env

# 2. Restart server
pkill -f "npm run dev"
npm run dev
```

### Problem: "Access Denied" Error

**Solution:**
1. Check IAM user permissions (need S3 access)
2. Verify bucket name in `.env` is correct
3. Ensure region matches bucket region

### Problem: "S3 is not configured" in test script

**Solution:**
Update `.env` file:
```env
USE_S3=true
AWS_ACCESS_KEY_ID=your-actual-key
AWS_SECRET_ACCESS_KEY=your-actual-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

Then restart: `npm run dev`

---

## 📋 Quick Setup Checklist

Before testing, ensure:

- [ ] AWS S3 bucket created
- [ ] IAM user created with S3FullAccess policy
- [ ] Access Key ID and Secret copied
- [ ] `.env` updated with AWS credentials
- [ ] `USE_S3=true` in `.env`
- [ ] Server restarted after `.env` changes
- [ ] Backend shows "✅ S3 Client initialized" in logs

---

## 📚 More Information

- **Full Setup Guide**: `S3_INTEGRATION_GUIDE.md`
- **Testing Guide**: `S3_TESTING_GUIDE.md`
- **Quick Setup**: `S3_QUICK_SETUP.md`

---

## 🎯 Recommended Test Order

1. ✅ Run `node test-s3-upload.js` (validates everything)
2. ✅ Test employee photo upload via UI
3. ✅ Check AWS Console to see files
4. ✅ Test onboarding document upload
5. ✅ Monitor for 1 day to ensure stability

---

## 💡 Pro Tips

1. **Cost Monitoring**: Check AWS Billing Dashboard weekly
2. **File Organization**: S3 auto-organizes by folder type
3. **Security**: Keep `AWS_S3_ACL=private` (default)
4. **Signed URLs**: Private files use signed URLs (1 hour expiry)
5. **Backup**: Enable S3 versioning for file recovery

---

**Ready? Run the test script:**
```bash
node test-s3-upload.js
```

**Or test via UI:**
```bash
# Open in browser
http://localhost:5173
```

Good luck! 🚀

