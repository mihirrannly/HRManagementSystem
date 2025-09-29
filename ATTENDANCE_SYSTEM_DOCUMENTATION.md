# Comprehensive Attendance Management System

## Overview

This document describes the comprehensive attendance management system implemented for the HR Management platform. The system includes advanced features like location validation, idle detection, leave integration, and automated processing.

## Core Features Implemented

### 1. Login/Check-In Functionality ✅

**Features:**
- Location-based validation (GPS + IP address)
- Device information capture
- Real-time validation against office premises
- Screenshot capture (optional)
- Late arrival detection with grace period

**Implementation:**
- **Backend:** `AttendanceService.processCheckIn()`
- **Frontend:** `LocationValidator` component
- **API Endpoint:** `POST /api/attendance/checkin`

**Location Validation:**
- GPS coordinates within 200m radius of office
- IP address validation against office network ranges
- WiFi MAC address validation (optional)
- At least one validation method must pass

### 2. Logout/Check-Out Functionality ✅

**Features:**
- Location validation for check-out
- Early departure detection and reason capture
- Total hours calculation including break time
- Overtime calculation (>8 hours)

**Implementation:**
- **Backend:** `AttendanceService.processCheckOut()`
- **Frontend:** Early checkout dialog with reason
- **API Endpoint:** `POST /api/attendance/checkout`

### 3. Idle System Detection ✅

**Features:**
- Tracks user activity (mouse, keyboard, scroll, touch)
- 60-minute idle timeout before warning
- 5-10 minute warning period with countdown
- Auto-logout option after extended inactivity
- Idle time recording and break management

**Implementation:**
- **Frontend:** `IdleDetector` component
- **Backend:** `POST /api/attendance/idle-session`
- **Activity Events:** mousedown, mousemove, keypress, scroll, touchstart, click

**Idle Detection Flow:**
1. Track user activity continuously
2. After 60 minutes of inactivity → Mark as idle
3. After additional 5 minutes → Show warning dialog
4. 10-minute countdown with options:
   - "I'm Still Working" → Reset timer
   - "I'm on Break" → Record break time
   - Auto-logout after countdown expires

### 4. Location Restriction (Office Only) ✅

**Validation Methods:**
- **IP Address Validation:** Check against office IP ranges
- **Geofencing:** GPS-based location within office radius
- **WiFi MAC Binding:** Validate against office WiFi networks

**Configuration:**
```javascript
officeConfig: {
  location: {
    latitude: 28.6139,  // Office coordinates
    longitude: 77.2090
  },
  radius: 200,          // 200 meters
  allowedIPs: [
    '192.168.1.0/24',   // Office network
    '10.0.0.0/8'        // Internal network
  ],
  allowedWiFiMACs: [
    '00:11:22:33:44:55' // Office WiFi MAC
  ]
}
```

### 5. Attendance Summary Dashboard ✅

**Employee Dashboard:**
- Today's status with real-time updates
- Check-in/check-out buttons with location validation
- Monthly statistics (present, absent, late days)
- Detailed attendance history with idle time tracking
- Average hours per day calculation

**Manager/Admin Dashboard:**
- Team attendance overview
- Real-time team status
- Late arrivals and early departures tracking
- Bulk attendance management
- Manual attendance entry capabilities

### 6. Leave Integration ✅

**Features:**
- Automatic attendance marking for approved leaves
- Leave status validation before check-in
- Integration with leave request system
- Holiday and weekend auto-marking

**Automated Processing:**
- Daily scheduler marks attendance for employees on leave
- Prevents check-in when on approved leave
- Auto-marks holidays and weekends
- Marks absent employees after work hours

## Technical Architecture

### Backend Components

#### 1. Models
- **Attendance Model:** Enhanced with location, device info, idle tracking
- **Employee Model:** Integration with attendance system
- **Leave Model:** Integration for attendance validation

#### 2. Services
- **AttendanceService:** Core business logic for attendance processing
- **AttendanceScheduler:** Automated daily and hourly processing

#### 3. Routes
- **Attendance Routes:** RESTful API endpoints for all attendance operations
- **Authentication:** Role-based access control

### Frontend Components

#### 1. Core Components
- **Attendance.jsx:** Main attendance management interface
- **IdleDetector.jsx:** Real-time idle detection and warnings
- **LocationValidator.jsx:** GPS and location validation

#### 2. Features
- **Real-time Updates:** Auto-refresh every 5 minutes
- **Responsive Design:** Mobile and desktop compatible
- **Role-based UI:** Different views for employees, managers, admins

## API Endpoints

### Employee Endpoints
```
POST /api/attendance/checkin          # Check in with location validation
POST /api/attendance/checkout         # Check out with early leave handling
GET  /api/attendance/today-status     # Get today's attendance status
GET  /api/attendance/summary          # Get attendance summary for date range
POST /api/attendance/idle-session     # Record idle session
```

### Manager/Admin Endpoints
```
GET  /api/attendance/team-summary     # Get team attendance overview
PUT  /api/attendance/:id/manual-entry # Manual attendance entry
```

## Automated Scheduling

### Daily Processing (11:59 PM)
- Mark attendance for employees on approved leave
- Mark holidays and weekends
- Mark absent employees (no check-in after 7 PM)
- Generate daily attendance reports

### Hourly Processing (9 AM - 6 PM, Weekdays)
- **10 AM:** Process late arrivals and notifications
- **6 PM:** Process end-of-day activities and early departures

## Configuration

### Office Location Setup
Update the office configuration in `AttendanceService`:

```javascript
this.officeConfig = {
  location: {
    latitude: YOUR_OFFICE_LATITUDE,
    longitude: YOUR_OFFICE_LONGITUDE
  },
  radius: 200, // meters
  allowedIPs: [
    'YOUR_OFFICE_IP_RANGE'
  ],
  workingHours: {
    start: '09:00',
    end: '18:00',
    graceMinutes: 15
  }
};
```

### Environment Variables
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
```

## Security Features

### Data Protection
- IP address logging for audit trails
- Device information capture
- Location data encryption
- Screenshot capture with consent

### Access Control
- Role-based permissions (Employee, Manager, HR, Admin)
- JWT token authentication
- API rate limiting
- CORS protection

## Monitoring and Analytics

### Attendance Metrics
- Daily attendance rates
- Late arrival patterns
- Early departure tracking
- Idle time analysis
- Overtime calculations

### Reports Available
- Individual attendance summary
- Team attendance overview
- Monthly attendance reports
- Leave integration reports

## Mobile Support

### Features
- Responsive web interface
- GPS location access
- Touch-friendly UI
- Offline capability (limited)

### Browser Requirements
- Modern browsers with geolocation support
- JavaScript enabled
- Local storage support

## Troubleshooting

### Common Issues

#### Location Not Working
1. Check browser permissions for location access
2. Ensure HTTPS connection for geolocation API
3. Verify office coordinates configuration
4. Check network connectivity

#### Idle Detection Not Working
1. Verify JavaScript is enabled
2. Check for browser tab focus
3. Ensure event listeners are active
4. Check console for errors

#### Check-in/Check-out Failures
1. Verify location validation passes
2. Check network connectivity
3. Ensure user is not on leave
4. Verify working day (not weekend/holiday)

### Logs and Debugging
- Server logs: Check attendance processing logs
- Client logs: Browser console for frontend issues
- Database logs: MongoDB query performance
- Scheduler logs: Automated processing status

## Future Enhancements

### Planned Features
- Biometric integration
- QR code check-in
- Facial recognition
- Advanced analytics dashboard
- Mobile app development
- Integration with payroll system

### Performance Optimizations
- Database indexing improvements
- Caching for frequent queries
- Real-time notifications
- Bulk operations optimization

## Installation and Setup

### Prerequisites
- Node.js 14+
- MongoDB 4.4+
- Modern web browser

### Installation Steps
1. Install dependencies:
   ```bash
   npm install geolib node-cron
   ```

2. Configure office location in `AttendanceService`

3. Start the server:
   ```bash
   npm start
   ```

4. Access the application at `http://localhost:3000`

### Database Setup
The system will automatically create required collections and indexes on first run.

## Support and Maintenance

### Regular Maintenance
- Monitor scheduler logs daily
- Review attendance patterns weekly
- Update office location if moved
- Clean up old attendance records (>2 years)

### Support Contact
For technical support or feature requests, contact the development team.

---

**Last Updated:** September 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
