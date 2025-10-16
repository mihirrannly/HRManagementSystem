# S3 Integration - Step-by-Step UI Testing Guide

## 🎯 Goal
Test if files are uploading to AWS S3 (cloud storage) instead of local storage.

---

## ✅ Pre-Check: Is S3 Enabled?

### Step 1: Check Server Logs

Look at your backend server terminal (the one showing `[0]` messages).

**✅ S3 IS ENABLED if you see:**
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
🌍 Region: us-east-1
```

**❌ S3 IS NOT ENABLED if you see:**
```
⚠️  Using local disk storage for folder: employees (S3 not configured)
⚠️  Using local disk storage for folder: onboarding (S3 not configured)
```

**If NOT enabled**: See the "How to Enable S3" section at the bottom.

---

## 🧪 Test 1: Upload Employee Profile Photo

### Step 1: Open the Application
1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the login page

### Step 2: Login
1. Enter your admin credentials
2. Click **Login**
3. You should land on the dashboard

### Step 3: Navigate to Employees
1. Look at the left sidebar
2. Click on **"Employees"** menu item
3. You'll see a list of all employees

### Step 4: Select an Employee
1. Click on **any employee** from the list
2. You'll see the employee details page
3. Look for the **profile photo/avatar** section (usually at the top)

### Step 5: Upload Photo
1. Click on the **profile photo area** or **"Upload Photo"** button
2. A file picker will open
3. **Select any image file** (JPG, PNG, GIF, or WEBP)
4. Click **Open** or **Choose**

### Step 6: Verify Upload is Happening
**Open Browser DevTools** (Important!):
- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`

**Go to the Network tab**:
1. Click **"Network"** tab in DevTools
2. Look for an upload request (usually POST to `/api/employees/...`)
3. Click on that request
4. Look at the **Response** tab

### Step 7: Check the Response

**✅ S3 IS WORKING if you see a URL like:**
```json
{
  "success": true,
  "fileUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/employees/1728901234-abc123def-photo.jpg"
}
```

**❌ S3 IS NOT WORKING if you see:**
```json
{
  "success": true,
  "fileUrl": "/uploads/employees/photo-1728901234.jpg"
}
```

### Step 8: Verify Photo Displays
1. The uploaded photo should **display immediately** on the employee profile
2. If you see the photo, the upload was successful!

### Step 9: Verify in AWS Console (Optional but Recommended)
1. Open a new browser tab
2. Go to: **https://console.aws.amazon.com/s3/**
3. Login with your AWS credentials
4. Click on **your bucket name**
5. Look for the **"employees/"** folder
6. Open it - you should see your uploaded file there!

**File name format:**
```
1728901234567-abc123def456-original-name.jpg
```

---

## 🧪 Test 2: Upload Onboarding Documents

### Step 1: Navigate to Onboarding
1. From the dashboard, click **"Onboarding"** in the left sidebar
2. You'll see a list of candidates

### Step 2: Add New Candidate (or Edit Existing)
**Option A - Add New:**
1. Click **"Add Candidate"** button
2. Fill in basic details:
   - Name: `Test Candidate`
   - Email: `test@example.com`
   - Position: Any position
   - Department: Any department

**Option B - Edit Existing:**
1. Click on any existing candidate
2. Click **"Edit"** button

### Step 3: Upload Documents
Look for document upload fields (usually):
- **Profile Photo**
- **Resume**
- **Aadhaar Card**
- **PAN Card**
- **Degree/Certificate**
- **Previous Employer Documents**

**Upload any document:**
1. Click **"Upload"** or **"Choose File"** button
2. Select a file (PDF, JPG, PNG, or DOC)
3. Click **Open**

### Step 4: Check Upload Status
1. You should see a **progress indicator** or **success message**
2. The file name should appear below the upload button
3. **Keep DevTools Network tab open** to see the upload request

### Step 5: Verify Upload Response
1. In DevTools → Network tab
2. Find the upload request (POST to `/api/onboarding/...` or similar)
3. Check the Response

**✅ S3 Working:**
```json
{
  "success": true,
  "fileUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/onboarding/1728901234-abc-resume.pdf"
}
```

### Step 6: Save Candidate
1. Click **"Save"** button
2. Candidate should be saved successfully

### Step 7: Verify Multiple Files in AWS
1. Go to AWS S3 Console
2. Open your bucket
3. Look for **"onboarding/"** folder
4. All uploaded documents should be there

---

## 🧪 Test 3: Verify File Access (Signed URLs)

### Purpose
If your S3 bucket is **private** (recommended for security), files are accessed via temporary signed URLs.

### Step 1: Upload a Document
1. Follow Test 1 or Test 2 above
2. Upload any file

### Step 2: View the File
1. After upload, try to **view or download** the file from the UI
2. Click on the file thumbnail or "View" button

### Step 3: Inspect the URL
1. Right-click on the displayed image/file
2. Select **"Copy Image Address"** or **"Copy Link Address"**
3. Paste it in a text editor

**✅ Signed URL looks like:**
```
https://your-bucket.s3.us-east-1.amazonaws.com/employees/file.jpg?
X-Amz-Algorithm=AWS4-HMAC-SHA256&
X-Amz-Credential=...&
X-Amz-Date=...&
X-Amz-Expires=3600&
X-Amz-Signature=...&
X-Amz-SignedHeaders=host
```

Notice the query parameters (`?X-Amz-...`) - these make it a signed URL.

### Step 4: Test URL Expiration (Optional)
1. Copy the signed URL
2. Paste it in a new browser tab
3. The file should open successfully
4. **Wait 1 hour** (or the configured expiration time)
5. Refresh the same URL
6. You should get an **"Access Denied"** error
7. This is correct behavior for security!

---

## 🧪 Test 4: Upload Offer Letter Company Logo

### Step 1: Navigate to Offer Letters
1. Click **"Offer Letters"** in the sidebar
2. Click **"Create New"** or edit an existing one

### Step 2: Upload Company Logo
1. Look for **"Company Logo"** upload section
2. Click **"Upload Logo"**
3. Select an image file
4. Upload should complete

### Step 3: Verify in Preview
1. The logo should appear in the **offer letter preview**
2. Check DevTools Network tab for S3 URL

### Step 4: Verify in AWS
1. AWS Console → S3 → Your Bucket
2. Look in **"assets/"** or **"documents/"** folder
3. Logo file should be there

---

## 📊 Summary Checklist

After completing all tests, verify:

- [ ] Employee photo uploads successfully
- [ ] Photo displays correctly in UI
- [ ] Onboarding documents upload successfully
- [ ] Multiple documents can be uploaded
- [ ] Files appear in AWS S3 Console
- [ ] Files are organized in correct folders (employees/, onboarding/, etc.)
- [ ] File URLs contain S3 bucket name
- [ ] Images/documents display correctly when viewing
- [ ] No errors in browser console
- [ ] No errors in backend server logs

---

## 🎨 Visual Indicators

### What Success Looks Like:

**Browser Network Tab:**
```
Request URL: http://localhost:5001/api/employees/upload
Status: 200 OK
Response: {
  "fileUrl": "https://bucket.s3.region.amazonaws.com/..."
}
```

**Browser Console:**
```
(No errors - should be clean)
```

**Backend Logs:**
```
✅ S3 Client initialized successfully
✅ File uploaded to S3: employees/1728901234-abc.jpg
```

**AWS S3 Console:**
```
Bucket: your-bucket-name
  └── employees/
      ├── 1728901234-abc123-photo1.jpg
      └── 1728901235-def456-photo2.jpg
  └── onboarding/
      ├── 1728901236-ghi789-resume.pdf
      └── 1728901237-jkl012-aadhaar.jpg
```

---

## 🐛 Troubleshooting

### Problem 1: "Upload failed" error in UI

**Check:**
1. Browser Console (F12) - any errors?
2. Backend logs - what does it say?
3. Network tab - what's the response?

**Common Causes:**
- S3 not configured (check server logs for warnings)
- Invalid AWS credentials
- Wrong bucket name
- No internet connection

### Problem 2: Upload succeeds but photo doesn't display

**Check:**
1. Right-click image → Inspect
2. Look at the `src` attribute
3. Copy the URL and paste in new tab
4. Does it load?

**If Access Denied:**
- Bucket might be private (good!)
- System should generate signed URLs automatically
- Check backend logs for signed URL generation

### Problem 3: Files go to local storage instead of S3

**Verify:**
1. Backend logs show: `⚠️ Using local disk storage`
2. File URLs start with `/uploads/...`

**Solution:**
- S3 is not enabled
- See "How to Enable S3" section below

---

## 🔧 How to Enable S3

If S3 is not enabled, follow these steps:

### Step 1: Update .env File

Open `.env` file and add/update:

```env
# Enable S3
USE_S3=true

# AWS Credentials (replace with your actual values)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-actual-bucket-name

# Optional (has defaults)
AWS_S3_ACL=private
AWS_S3_SIGNED_URL_EXPIRATION=3600
```

### Step 2: Get AWS Credentials

**If you don't have them:**

1. Go to: https://console.aws.amazon.com/iam/
2. Click **Users** → **Add users**
3. Username: `hr-system-s3-user`
4. Access type: **Programmatic access**
5. Permissions: **AmazonS3FullAccess**
6. Create user
7. **Copy Access Key ID and Secret Access Key**
8. Paste them in `.env` file

### Step 3: Create S3 Bucket

**If you don't have a bucket:**

1. Go to: https://console.aws.amazon.com/s3/
2. Click **Create bucket**
3. Bucket name: `your-company-hr-files` (must be unique globally)
4. Region: `us-east-1` (or your preferred region)
5. **Block all public access**: Keep checked ✅
6. Click **Create bucket**
7. Copy bucket name to `.env` file

### Step 4: Restart Server

```bash
# Stop servers (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 5: Verify

Look for in backend logs:
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
```

Now go back to Test 1 and try uploading!

---

## 🎓 Understanding the Flow

### Upload Process:

```
1. User selects file in browser
   ↓
2. Frontend sends file to backend API
   ↓
3. Backend receives file via multer middleware
   ↓
4. Middleware checks: Is S3 enabled?
   ├─ Yes → Upload to S3
   └─ No → Save to local ./uploads/
   ↓
5. Return file URL to frontend
   ↓
6. Frontend displays file using URL
   ↓
7. Backend saves URL to MongoDB
```

### File Access:

**Public Buckets:**
- Direct URL: `https://bucket.s3.region.amazonaws.com/key`
- Anyone can access
- ⚠️ Not recommended for sensitive HR documents

**Private Buckets (Recommended):**
- Signed URL: `https://bucket.s3...?X-Amz-Signature=...`
- Temporary access (default: 1 hour)
- Secure and expires automatically

---

## 📞 Need Help?

If you encounter issues:

1. **Check server logs** - most helpful for diagnosing issues
2. **Check browser console** - shows frontend errors
3. **Check network tab** - shows API requests/responses
4. **Check AWS CloudWatch** - shows S3 access logs (advanced)
5. **Run test script**: `node test-s3-upload.js`

**Common Issues:**
- `ERR_CONNECTION_REFUSED`: Backend not running
- `404 Not Found`: Wrong API endpoint
- `403 Forbidden`: AWS permission issue
- `Access Denied`: Wrong bucket name or region
- `SignatureDoesNotMatch`: Wrong AWS credentials

---

## ✅ Success Criteria

You'll know S3 is working when:

1. ✅ Files upload without errors
2. ✅ URLs contain your S3 bucket name
3. ✅ Files visible in AWS S3 Console
4. ✅ Images/documents display in UI
5. ✅ Backend logs show "✅ S3 Client initialized"
6. ✅ No local files in `./uploads/` folder

---

## 🚀 Ready to Test?

1. Make sure servers are running: `npm run dev`
2. Open browser: http://localhost:5173
3. Login as admin
4. Follow **Test 1** step by step
5. Check results!

Good luck! You've got this! 💪

---

**Quick Links:**
- AWS S3 Console: https://console.aws.amazon.com/s3/
- AWS IAM Console: https://console.aws.amazon.com/iam/
- Test Script: `node test-s3-upload.js`
- Full Guide: `S3_TESTING_GUIDE.md`


