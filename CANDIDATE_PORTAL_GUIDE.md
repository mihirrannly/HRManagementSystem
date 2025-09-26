# Candidate Portal System

## Overview
The Candidate Portal is a secure system that allows new joiners to complete their onboarding information independently. Once a candidate has joined, HR can create portal access for them to fill in their personal details, education, work experience, and other required information.

## How It Works

### 1. Creating Portal Access (HR Side)
1. Navigate to the **Organization > Onboardings** section
2. Find the candidate in the onboarding table
3. Click the **More Actions** button (⋮) for the candidate
4. Select **"Create Portal Access"**
5. The system will generate:
   - Unique Candidate ID (usually their employee ID)
   - Temporary password
   - Portal URL

### 2. Candidate Access
1. Candidate receives their credentials (Candidate ID and Password)
2. They visit the portal URL: `/candidate-portal/{candidateId}`
3. Login with provided credentials
4. Complete the multi-step form:
   - **Step 1**: Personal Information (name, contact, address)
   - **Step 2**: Education History (degrees, institutions, grades)
   - **Step 3**: Work Experience (previous jobs, responsibilities)
   - **Step 4**: Review & Submit

### 3. Portal Features
- **Secure Authentication**: Each candidate has unique credentials
- **Progress Saving**: Candidates can save progress and return later
- **Multi-step Form**: Organized workflow for better UX
- **Data Validation**: Required fields and format validation
- **Mobile Friendly**: Responsive design works on all devices

### 4. HR Monitoring
- **Portal Status Column**: Shows if portal is created and if candidate submitted info
  - 🔑 **Not Created**: Portal access not yet created
  - ⏳ **Pending**: Portal created, waiting for candidate submission
  - ✅ **Completed**: Candidate has submitted all information
- **Automatic Integration**: Submitted data automatically updates the onboarding record
- **Step Progress**: Employee info step is marked complete when candidate submits

## Portal Status Indicators

| Status | Icon | Description |
|--------|------|-------------|
| Not Created | - | Portal access hasn't been created yet |
| Pending | 🔑 | Portal created, candidate can access but hasn't submitted |
| Completed | ✅ | Candidate has successfully submitted all information |

## API Endpoints

### Candidate Portal Routes
- `POST /api/candidate-portal/authenticate` - Candidate login
- `PUT /api/candidate-portal/:candidateId/save` - Save progress
- `POST /api/candidate-portal/:candidateId/submit` - Submit final information
- `GET /api/candidate-portal/:candidateId/status` - Check submission status

### HR Management Routes
- `POST /api/onboarding/:id/create-portal-access` - Create portal credentials

## Security Features
- **Password Hashing**: All passwords are securely hashed using bcrypt
- **Unique Access**: Each candidate can only access their own data
- **Session Management**: Secure authentication flow
- **Data Validation**: Server-side validation for all submitted data

## Data Integration
When a candidate submits their information:
1. Data is stored in the `candidatePortal` field of the onboarding record
2. Main onboarding fields are updated with submitted information
3. Employee info step is marked as completed
4. Onboarding status may be updated (e.g., from 'offer_accepted' to 'employee_info_completed')
5. A system note is added to track the submission

## Usage Flow
```
1. HR creates onboarding record
2. HR creates portal access → System generates credentials
3. Candidate receives credentials (via email in production)
4. Candidate logs into portal
5. Candidate fills information step by step
6. Candidate submits final information
7. HR sees updated status and can proceed with next onboarding steps
```

## Production Considerations
- **Email Integration**: In production, credentials should be sent via email
- **Password Reset**: Implement password reset functionality
- **Audit Trail**: Log all portal access and submissions
- **File Uploads**: Add document upload capability to the portal
- **Notifications**: Email notifications for HR when candidates submit information

## Development Notes
- Portal is accessible at `/candidate-portal` and `/candidate-portal/:candidateId`
- Success page shown at `/submission-success` after completion
- All portal routes are public (no authentication required for the main app)
- Uses separate authentication system from main HR application
