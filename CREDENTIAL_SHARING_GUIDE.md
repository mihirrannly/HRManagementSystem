# Candidate Portal Credential Sharing Guide

## Overview
This guide explains different methods to share candidate portal credentials securely with new joiners.

## Method 1: Automated Email (Recommended) ✅

### Setup Instructions

1. **Configure Environment Variables**
   ```bash
   # In your .env file
   EMAIL_USER=your-hr-email@company.com
   EMAIL_APP_PASSWORD=your-app-specific-password
   HR_CONTACT_EMAIL=hr@company.com
   COMPANY_NAME=Your Company Name
   CLIENT_URL=https://your-hr-portal.com
   ```

2. **For Gmail Setup:**
   - Enable 2-Factor Authentication
   - Generate App Password: Google Account → Security → App passwords
   - Use the app password (not your regular password)

3. **For Other Email Providers:**
   ```javascript
   // In emailService.js, update the transporter:
   
   // For SendGrid
   const transporter = nodemailer.createTransporter({
     host: 'smtp.sendgrid.net',
     port: 587,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   });
   
   // For Outlook/Hotmail
   const transporter = nodemailer.createTransporter({
     service: 'hotmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_APP_PASSWORD
     }
   });
   ```

### How It Works
1. HR clicks "Create Portal Access" in the onboarding table
2. System generates unique credentials
3. Professional email is automatically sent to candidate
4. Email includes:
   - Welcome message
   - Login credentials
   - Portal link
   - Step-by-step instructions
   - HR contact information
   - Security guidelines

### Email Template Features
- **Professional Design**: Branded HTML email template
- **Security Warnings**: Reminds candidates to keep credentials secure
- **Clear Instructions**: Step-by-step onboarding process
- **Direct Links**: One-click access to portal
- **Support Information**: HR contact details for help

---

## Method 2: Manual Sharing (Fallback)

If email fails, the system provides credentials in the browser console and toast notifications.

### Steps:
1. Check browser console for credentials
2. Copy the information
3. Share via your preferred secure method:

#### Option A: Secure Internal Email
```
Subject: Your Onboarding Portal Access

Dear [Candidate Name],

Welcome to [Company]! Please use these credentials to complete your onboarding:

Candidate ID: [ID]
Password: [Password]
Portal Link: [URL]

Please complete within 7 days.

Best regards,
HR Team
```

#### Option B: SMS/WhatsApp
```
Welcome to [Company]! Complete your onboarding at:
Portal: [URL]
ID: [ID]
Password: [Password]
Questions? Call HR: [Phone]
```

#### Option C: Phone Call
- Call candidate directly
- Verify identity
- Share credentials verbally
- Send follow-up with portal link

---

## Method 3: HR Dashboard Integration

### Add Credentials Display in UI
You can enhance the system to show credentials in the HR interface:

```javascript
// Add to NewOnboardingsModule.jsx
const [credentialsDialog, setCredentialsDialog] = useState({ open: false, data: null });

// Show credentials in a dialog
const showCredentials = (onboarding) => {
  setCredentialsDialog({
    open: true,
    data: {
      candidateId: onboarding.employeeId,
      email: onboarding.email,
      portalUrl: `/candidate-portal/${onboarding.employeeId}`
    }
  });
};
```

---

## Method 4: QR Code Generation

### For Mobile-First Approach
```javascript
// Install qrcode package
npm install qrcode

// Generate QR code for portal access
const QRCode = require('qrcode');

const generatePortalQR = async (candidateId, password) => {
  const portalData = {
    url: `${process.env.CLIENT_URL}/candidate-portal/${candidateId}`,
    id: candidateId,
    password: password
  };
  
  const qrCodeData = await QRCode.toDataURL(JSON.stringify(portalData));
  return qrCodeData;
};
```

---

## Method 5: Integration with HR Systems

### HRMS Integration
```javascript
// Integrate with existing HR systems
const syncWithHRMS = async (candidateData) => {
  // Send to existing HR system
  await axios.post('https://your-hrms.com/api/candidates', {
    candidateId: candidateData.candidateId,
    portalAccess: {
      url: candidateData.portalUrl,
      credentials: 'sent_via_email'
    }
  });
};
```

---

## Security Best Practices

### 1. Password Security
- ✅ Passwords are auto-generated (8-10 characters)
- ✅ Passwords are hashed before storage
- ✅ Temporary passwords should be changed after first login
- ✅ No passwords stored in plain text

### 2. Email Security
- ✅ Use app-specific passwords, not regular passwords
- ✅ Enable 2FA on email accounts
- ✅ Use professional email addresses
- ✅ Include security warnings in emails

### 3. Access Control
- ✅ Each candidate can only access their own data
- ✅ Portal access expires after submission
- ✅ Track access attempts and login times
- ✅ Secure HTTPS connections only

### 4. Audit Trail
- ✅ Log when credentials are created
- ✅ Track email delivery status
- ✅ Monitor portal access attempts
- ✅ Record submission timestamps

---

## Troubleshooting

### Email Not Sending?
1. Check environment variables
2. Verify email provider settings
3. Check firewall/network restrictions
4. Test with a simple email first
5. Check spam folders

### Credentials Not Working?
1. Verify candidate ID format
2. Check password copying (no extra spaces)
3. Ensure portal is accessible
4. Check browser console for errors

### Common Issues:
- **Gmail**: Use app password, not regular password
- **Corporate Email**: May need IT approval for SMTP
- **Firewalls**: Port 587 might be blocked
- **Two-Factor**: Required for most email providers

---

## Production Recommendations

1. **Use Professional Email Service**
   - SendGrid, Mailgun, or AWS SES
   - Better deliverability and analytics
   - Higher sending limits

2. **Add Email Templates**
   - Multiple language support
   - Company branding
   - Mobile-responsive design

3. **Implement Reminders**
   - Send reminder after 3 days
   - Final reminder before deadline
   - Escalation to HR if not completed

4. **Add Analytics**
   - Track email open rates
   - Monitor portal access
   - Measure completion rates

5. **Security Enhancements**
   - Password expiry
   - Account lockout after failed attempts
   - IP restrictions if needed
   - Audit logs

---

## Email Provider Setup Examples

### Gmail Business
```env
EMAIL_USER=hr@yourcompany.com
EMAIL_APP_PASSWORD=your-16-char-app-password
```

### SendGrid
```env
SENDGRID_API_KEY=SG.your-api-key-here
```

### Mailgun
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.yourcompany.com
```

### AWS SES
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

The system is now ready to automatically send professional, secure emails to candidates with their portal credentials!
