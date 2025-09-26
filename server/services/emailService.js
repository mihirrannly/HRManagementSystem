const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER) {
    console.log('⚠️  Email not configured. Credentials will be shown in response instead.');
    return null;
  }

  // For development, you can use services like Gmail, Outlook, or email services like SendGrid, Mailgun
  return nodemailer.createTransport({
    // Gmail configuration (for development)
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_APP_PASSWORD // App password (not regular password)
    }
    
    // Alternative: SMTP configuration for custom email servers
    // host: process.env.SMTP_HOST,
    // port: process.env.SMTP_PORT || 587,
    // secure: false,
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS
    // }
    
    // Alternative: SendGrid configuration (recommended for production)
    // host: 'smtp.sendgrid.net',
    // port: 587,
    // auth: {
    //   user: 'apikey',
    //   pass: process.env.SENDGRID_API_KEY
    // }
  });
};

// Send candidate portal credentials
const sendPortalCredentials = async (candidateData) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), throw error to trigger fallback
    if (!transporter) {
      throw new Error('Email service not configured');
    }
    
    const { 
      candidateName, 
      candidateEmail, 
      candidateId, 
      temporaryPassword, 
      portalUrl,
      companyName = 'Rannkly HR',
      hrContactEmail = process.env.HR_CONTACT_EMAIL || 'hr@company.com'
    } = candidateData;

    const mailOptions = {
      from: `"${companyName} HR Team" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: `Welcome to ${companyName} - Complete Your Onboarding`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
            .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { margin: 10px 0; padding: 10px; border-left: 3px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${companyName}!</h1>
              <p>Complete Your Onboarding Process</p>
            </div>
            
            <div class="content">
              <h2>Dear ${candidateName},</h2>
              
              <p>Congratulations on joining our team! We're excited to have you aboard.</p>
              
              <p>To complete your onboarding process, please access your personal portal where you can provide your detailed information, education history, and work experience.</p>
              
              <div class="credentials-box">
                <h3>🔐 Your Portal Credentials</h3>
                <p><strong>Candidate ID:</strong> ${candidateId}</p>
                <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
                <p><strong>Portal URL:</strong> <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${portalUrl}">${process.env.CLIENT_URL || 'http://localhost:5173'}${portalUrl}</a></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Please keep these credentials secure and do not share them with anyone. You can change your password after logging in.
              </div>
              
              <div class="steps">
                <h3>📋 What to Complete in the Portal:</h3>
                <div class="step">
                  <strong>Step 1:</strong> Personal Information (Contact details, address, etc.)
                </div>
                <div class="step">
                  <strong>Step 2:</strong> Education History (Degrees, institutions, grades)
                </div>
                <div class="step">
                  <strong>Step 3:</strong> Work Experience (Previous jobs, responsibilities)
                </div>
                <div class="step">
                  <strong>Step 4:</strong> Review and Submit
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${portalUrl}" class="button">
                  Access Your Portal Now
                </a>
              </div>
              
              <div class="warning">
                <h4>📅 Important Timeline:</h4>
                <p>Please complete your profile within <strong>7 days</strong> to ensure a smooth onboarding process. Your information will help us prepare your workspace, IT setup, and team introductions.</p>
              </div>
              
              <h3>🆘 Need Help?</h3>
              <p>If you have any questions or face technical difficulties:</p>
              <ul>
                <li>Contact HR Team: <a href="mailto:${hrContactEmail}">${hrContactEmail}</a></li>
                <li>Call HR Helpline: [Your HR Phone Number]</li>
                <li>Visit our FAQ: [Link to FAQ if available]</li>
              </ul>
              
              <p>We look forward to working with you!</p>
              
              <p>Best regards,<br>
              <strong>HR Team</strong><br>
              ${companyName}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this email.</p>
              <p>© 2024 ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      // Plain text version for email clients that don't support HTML
      text: `
Welcome to ${companyName}!

Dear ${candidateName},

Congratulations on joining our team! Please complete your onboarding by accessing your personal portal.

Your Portal Credentials:
- Candidate ID: ${candidateId}
- Temporary Password: ${temporaryPassword}
- Portal URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}${portalUrl}

Please keep these credentials secure and complete your profile within 7 days.

For help, contact HR at ${hrContactEmail}

Best regards,
HR Team
${companyName}
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Portal credentials email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending portal credentials email:', error);
    throw error;
  }
};

// Send reminder email
const sendPortalReminder = async (candidateData) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), throw error
    if (!transporter) {
      throw new Error('Email service not configured');
    }
    
    const { 
      candidateName, 
      candidateEmail, 
      candidateId, 
      portalUrl,
      companyName = 'Rannkly HR',
      daysRemaining = 3
    } = candidateData;

    const mailOptions = {
      from: `"${companyName} HR Team" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: `Reminder: Complete Your Onboarding - ${daysRemaining} Days Remaining`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
            .urgent { background: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Onboarding Reminder</h1>
            </div>
            <div class="content">
              <h2>Dear ${candidateName},</h2>
              <div class="urgent">
                <strong>⚠️ Action Required:</strong> You have ${daysRemaining} days remaining to complete your onboarding profile.
              </div>
              <p>We noticed you haven't completed your onboarding information yet. Please access your portal using:</p>
              <p><strong>Candidate ID:</strong> ${candidateId}</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${portalUrl}" class="button">
                  Complete Your Profile Now
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Portal reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending portal reminder email:', error);
    throw error;
  }
};

// Send offer letter email
const sendOfferLetterEmail = async (candidateData) => {
  try {
    const transporter = createTransporter();
    
    // If no transporter (email not configured), throw error to trigger fallback
    if (!transporter) {
      throw new Error('Email service not configured');
    }
    
    const { 
      candidateName, 
      candidateEmail, 
      candidateId, 
      position,
      department,
      offerLetterUrl,
      companyName = 'Rannkly HR',
      hrContactEmail = process.env.HR_CONTACT_EMAIL || 'hr@company.com'
    } = candidateData;

    const mailOptions = {
      from: `"${companyName} HR Team" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: `Job Offer - ${position} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2e7d32; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .offer-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2e7d32; }
            .button { display: inline-block; background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .highlight { background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .congratulations { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You have received a job offer from ${companyName}</p>
            </div>
            
            <div class="content">
              <div class="congratulations">
                <h2>Dear ${candidateName},</h2>
                <p style="font-size: 18px; color: #2e7d32; font-weight: bold;">
                  We are delighted to extend a formal offer of employment for the position of ${position} at ${companyName}!
                </p>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                  Your skills, experience, and enthusiasm make you an excellent fit for our ${department} team.
                </p>
              </div>
              
              <div class="offer-box">
                <h3>📋 Employment Offer Details</h3>
                <p><strong>Position Title:</strong> ${position}</p>
                <p><strong>Department:</strong> ${department}</p>
                <p><strong>Company:</strong> ${companyName}</p>
                <p><strong>Reference Number:</strong> HR/OL/${new Date().getFullYear()}/${candidateName.replace(/\s+/g, '').toUpperCase()}</p>
              </div>
              
              <div class="highlight">
                <h3>🔗 Review Your Offer Letter</h3>
                <p>Please click the link below to review your complete offer letter with all terms, conditions, and benefits:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${offerLetterUrl}" class="button">
                    View Offer Letter & Respond
                  </a>
                </div>
                
                <p><strong>Your Reference ID:</strong> ${candidateId}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
                <h3>⏰ Important Next Steps:</h3>
                <ol style="line-height: 1.8;">
                  <li><strong>Review Thoroughly:</strong> Click the secure link above to access your comprehensive offer letter with detailed terms, conditions, and benefits package</li>
                  <li><strong>Digital Response:</strong> Accept or decline the offer directly through our secure candidate portal with digital signature capability</li>
                  <li><strong>Response Timeline:</strong> This offer is time-sensitive. Please respond within the validity period mentioned in your offer letter</li>
                  <li><strong>Background Verification:</strong> Upon acceptance, we will initiate the background verification process as outlined in the terms</li>
                  <li><strong>Support Available:</strong> Our HR team is available to clarify any questions about the offer, benefits, or joining process</li>
                </ol>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>📞 Need Assistance or Have Questions?</h4>
                <p style="margin-bottom: 15px;">Our HR team is here to support you throughout the offer process:</p>
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                  <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${hrContactEmail}" style="color: #2e7d32; text-decoration: none;">${hrContactEmail}</a></p>
                  <p style="margin: 5px 0;"><strong>⚡ Response Time:</strong> Within 24 hours during business days</p>
                  <p style="margin: 5px 0;"><strong>🕐 Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                  <em>You can also reply directly to this email for immediate assistance.</em>
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2e7d32; margin-bottom: 15px;">🌟 Why Choose ${companyName}?</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px;">
                    <strong>🚀 Innovation Hub</strong><br>
                    <small>Cutting-edge technology and growth opportunities</small>
                  </div>
                  <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px;">
                    <strong>🤝 Inclusive Culture</strong><br>
                    <small>Collaborative and diverse work environment</small>
                  </div>
                  <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px;">
                    <strong>📈 Competitive Package</strong><br>
                    <small>Comprehensive benefits and compensation</small>
                  </div>
                  <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px;">
                    <strong>⚖️ Work-Life Balance</strong><br>
                    <small>Flexible policies and wellness programs</small>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #2e7d32;">
                <h3 style="color: #2e7d32; margin-bottom: 10px;">🎉 Welcome to Your Future!</h3>
                <p style="font-size: 16px; color: #666; margin: 0;">
                  We're thrilled about the possibility of you joining our team and contributing to our continued success.
                </p>
              </div>
              
              <p style="margin-top: 30px;">Best regards,<br>
              <strong>HR Team</strong><br>
              ${companyName}</p>
            </div>
            
            <div class="footer">
              <p>This offer is confidential and intended solely for ${candidateName}.</p>
              <p>© 2024 ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      // Plain text version
      text: `
🎉 CONGRATULATIONS ${candidateName.toUpperCase()}!

EMPLOYMENT OFFER LETTER
${companyName}
Reference: HR/OL/${new Date().getFullYear()}/${candidateName.replace(/\s+/g, '').toUpperCase()}

Dear ${candidateName},

We are delighted to extend a formal offer of employment for the position of ${position} at ${companyName}. Your skills, experience, and enthusiasm make you an excellent fit for our ${department} team.

SECURE OFFER LETTER ACCESS:
Please review your comprehensive offer letter by visiting:
${process.env.CLIENT_URL || 'http://localhost:5173'}${offerLetterUrl}

Your Reference ID: ${candidateId}

IMPORTANT NEXT STEPS:
1. REVIEW THOROUGHLY: Access your detailed offer letter with complete terms, conditions, and benefits package
2. DIGITAL RESPONSE: Accept or decline the offer directly through our secure candidate portal
3. RESPONSE TIMELINE: This offer is time-sensitive - please respond within the validity period mentioned
4. BACKGROUND VERIFICATION: Upon acceptance, we will initiate verification process as outlined in terms
5. SUPPORT AVAILABLE: Contact our HR team for any questions about the offer or joining process

CONTACT INFORMATION:
Email: ${hrContactEmail}
Response Time: Within 24 hours during business days
Business Hours: Monday - Friday, 9:00 AM - 6:00 PM IST

WHY CHOOSE ${companyName}?
• Innovation Hub - Cutting-edge technology and growth opportunities
• Inclusive Culture - Collaborative and diverse work environment  
• Competitive Package - Comprehensive benefits and compensation
• Work-Life Balance - Flexible policies and wellness programs

We're thrilled about the possibility of you joining our team and contributing to our continued success!

Best regards,
HR Team
${companyName}

---
This offer is confidential and intended solely for ${candidateName}.
© 2024 ${companyName}. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Offer letter email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error sending offer letter email:', error);
    throw error;
  }
};

module.exports = {
  sendPortalCredentials,
  sendPortalReminder,
  sendOfferLetterEmail
};
