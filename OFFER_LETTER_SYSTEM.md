# Offer Letter Management System

## Overview

The Offer Letter Management System is a comprehensive solution for creating, editing, sending, and tracking job offer letters within the Rannkly HR Management platform. This system streamlines the entire offer process from creation to candidate acceptance/rejection.

## Features

### ✅ **Completed Features**

1. **Offer Letter Creation & Editing**
   - Step-by-step guided interface for creating offer letters
   - Pre-populated candidate information
   - Customizable templates and content
   - Real-time preview functionality

2. **Comprehensive Offer Details**
   - Position and employment information
   - Salary and compensation details
   - Benefits and perks management
   - Terms and conditions
   - Custom messages and personalization

3. **Email Integration**
   - Automated email sending to candidates
   - Professional HTML email templates
   - Fallback mechanisms for email failures
   - Email delivery tracking

4. **Candidate Response Portal**
   - Secure candidate access via unique tokens
   - Digital signature support
   - Accept/reject functionality with comments
   - Mobile-responsive design

5. **Status Tracking & Analytics**
   - Real-time offer letter status updates
   - Dashboard integration with status chips
   - Progress tracking throughout the process
   - Analytics and reporting

6. **Backend API System**
   - RESTful API endpoints for all operations
   - Database integration with MongoDB
   - Authentication and authorization
   - Error handling and validation

## System Architecture

### Frontend Components

```
client/src/
├── components/
│   └── OfferLetterEditor.jsx          # Main offer letter creation/editing interface
├── pages/
│   ├── OfferAcceptance.jsx            # Candidate acceptance/rejection page
│   └── OfferLetterPage.jsx            # Standalone offer letter management page
└── pages/Organization/modules/
    ├── NewOnboardingsModule.jsx       # Dashboard with offer letter status
    └── onboarding/
        └── OnboardingWorkflowNew.jsx   # Integrated workflow component
```

### Backend Components

```
server/
├── models/
│   └── Onboarding.js                  # Database schema with offer letter support
├── routes/
│   └── onboarding.js                  # API endpoints for offer letter operations
└── services/
    └── emailService.js                # Email service for sending offer letters
```

## API Endpoints

### Offer Letter Management

- `POST /api/onboarding/offer-letter` - Create/update offer letter
- `GET /api/onboarding/:id/offer-letter` - Get offer letter details
- `POST /api/onboarding/:id/send-offer-letter` - Send offer letter to candidate
- `GET /api/onboarding/offer-letter-templates` - Get available templates
- `GET /api/onboarding/managers` - Get list of managers for reporting

### Candidate Portal (Public)

- `GET /api/onboarding/offer-acceptance/:token` - View offer letter
- `POST /api/onboarding/offer-acceptance/:token/accept` - Accept offer
- `POST /api/onboarding/offer-acceptance/:token/reject` - Reject offer

### Analytics & Reporting

- `GET /api/onboarding/analytics/dashboard` - Get offer letter statistics

## Database Schema

### Offer Letter Schema (within Onboarding)

```javascript
offerLetterSchema = {
  position: String,
  department: String,
  salary: Number,
  startDate: Date,
  reportingManager: String,
  workLocation: String,
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'intern'],
    default: 'full_time'
  },
  probationPeriod: Number, // in months
  benefits: [String],
  terms: [String],
  
  // Status tracking
  sentAt: Date,
  expiryDate: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  candidateSignature: String,
  acceptanceComments: String,
  rejectionReason: String,
  
  // Metadata
  generatedAt: Date,
  generatedBy: ObjectId
}
```

## User Interface

### 1. Offer Letter Editor

The main interface for creating and editing offer letters includes:

- **Step 1: Basic Information**
  - Candidate details (pre-populated)
  - Position and department
  - Start date and employment type
  - Reporting manager selection

- **Step 2: Compensation & Benefits**
  - Annual salary input
  - Benefits selection with predefined options
  - Custom benefit addition
  - Offer expiry date

- **Step 3: Terms & Conditions**
  - Standard terms selection
  - Custom terms addition
  - Personal message to candidate

- **Step 4: Review & Send**
  - Complete offer letter preview
  - Send confirmation dialog
  - Email delivery status

### 2. Candidate Portal

Candidates receive a secure link to:

- View complete offer letter details
- Accept offer with digital signature
- Reject offer with optional reason
- Track offer status and expiry

### 3. Dashboard Integration

The main dashboard shows:

- Offer letter status for each candidate
- Visual indicators (chips) for different states
- Quick actions for offer management
- Progress tracking integration

## Email System

### Configuration

Set up email service in `.env`:

```bash
# Gmail configuration (for development)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Company details
COMPANY_NAME=Your Company Name
HR_CONTACT_EMAIL=hr@yourcompany.com
CLIENT_URL=http://localhost:5173
```

### Email Templates

Professional HTML email templates include:

- **Offer Letter Notification**
  - Congratulations message
  - Position details summary
  - Secure link to view full offer
  - Contact information for questions

- **Reminder Emails** (Future enhancement)
  - Automatic reminders before offer expiry
  - Customizable reminder schedule

## Security Features

1. **Token-based Access**
   - Unique tokens for candidate access
   - Time-limited offer validity
   - Secure candidate identification

2. **Authentication & Authorization**
   - HR staff authentication required
   - Role-based access control
   - Audit trail for all actions

3. **Data Protection**
   - Encrypted sensitive information
   - Secure API endpoints
   - Input validation and sanitization

## Testing

### Manual Testing Checklist

- [ ] Create new onboarding record
- [ ] Generate offer letter with all details
- [ ] Preview offer letter content
- [ ] Send offer letter via email
- [ ] Candidate can access offer via link
- [ ] Accept offer functionality works
- [ ] Reject offer functionality works
- [ ] Status updates correctly in dashboard
- [ ] Analytics reflect current state

### Automated Testing

Use the provided test script:

```bash
node test-offer-letter-system.js
```

## Usage Instructions

### For HR Staff

1. **Creating an Offer Letter**
   - Navigate to Onboarding → Select candidate
   - Go to "Offer Letter Management" step
   - Fill in all required details step by step
   - Preview and send to candidate

2. **Tracking Offers**
   - View offer status in main dashboard
   - Monitor candidate responses
   - Follow up on pending offers

3. **Managing Templates**
   - Use predefined benefit and term options
   - Add custom benefits and terms as needed
   - Save frequently used configurations

### For Candidates

1. **Receiving Offer**
   - Check email for offer notification
   - Click secure link to view offer

2. **Reviewing Offer**
   - Review all position details
   - Check compensation and benefits
   - Read terms and conditions carefully

3. **Responding to Offer**
   - Accept: Provide digital signature and comments
   - Reject: Optionally provide reason
   - Submit response within validity period

## Future Enhancements

### Planned Features

1. **Advanced Templates**
   - Multiple offer letter templates
   - Template customization interface
   - Department-specific templates

2. **Approval Workflow**
   - Multi-level approval process
   - Manager approval before sending
   - Approval history tracking

3. **Advanced Analytics**
   - Offer acceptance rates
   - Time-to-acceptance metrics
   - Department-wise statistics

4. **Integration Features**
   - Calendar integration for start dates
   - Document management system integration
   - HRMS system synchronization

5. **Enhanced Communication**
   - SMS notifications
   - WhatsApp integration
   - Automated reminder system

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_APP_PASSWORD in .env
   - Verify Gmail app password is correct
   - Check network connectivity

2. **Candidate Can't Access Offer**
   - Verify token in URL is correct
   - Check offer hasn't expired
   - Ensure candidate is using correct link

3. **Status Not Updating**
   - Check database connection
   - Verify API endpoints are responding
   - Review browser console for errors

### Support

For technical support or feature requests:
- Check the GitHub repository for issues
- Review API documentation
- Contact the development team

## Conclusion

The Offer Letter Management System provides a complete solution for modern HR teams to efficiently manage job offers. With its user-friendly interface, automated workflows, and comprehensive tracking capabilities, it streamlines the entire offer process while maintaining professional standards and security.

The system is designed to be scalable, maintainable, and easily extensible for future enhancements, making it a valuable addition to any HR management platform.
