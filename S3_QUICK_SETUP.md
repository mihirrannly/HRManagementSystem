# AWS S3 Quick Setup Guide

## 5-Minute Setup

### Step 1: Create S3 Bucket
```
1. Go to AWS Console → S3
2. Create bucket with a unique name
3. Keep default security settings (private)
4. Note: bucket name and region
```

### Step 2: Create IAM User
```
1. Go to AWS Console → IAM → Users
2. Create user with programmatic access
3. Attach policy: AmazonS3FullAccess
4. Save Access Key ID and Secret Access Key
```

### Step 3: Configure .env
```env
USE_S3=true
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACL=private
AWS_S3_SIGNED_URL_EXPIRATION=3600
```

### Step 4: Restart Server
```bash
npm run server
```

### Step 5: Verify
Look for these logs:
```
✅ S3 Client initialized successfully
📦 Using S3 Bucket: your-bucket-name
🌍 Region: us-east-1
```

## Done! 🎉

All file uploads now go to S3 automatically. No code changes needed!

---

## Common Issues

**"S3 is not configured"**
- Check all env variables are set
- Ensure `USE_S3=true`
- Restart server

**"Access Denied"**
- Verify IAM permissions
- Check bucket name is correct
- Ensure region matches

**Want to disable S3?**
```env
USE_S3=false
```

**See full guide**: [S3_INTEGRATION_GUIDE.md](./S3_INTEGRATION_GUIDE.md)

