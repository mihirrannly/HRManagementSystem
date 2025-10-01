# Automatic Checkout System

## Overview

The Automatic Checkout System has been implemented to automatically check out employees who are inactive for more than 30 minutes, with an exception for lunch time (2 PM to 3 PM).

## Features

### 1. 30-Minute Idle Detection
- **Timeout**: 30 minutes of inactivity triggers the auto checkout process
- **Warning Period**: 2 minutes warning before auto checkout
- **Countdown**: 5 minutes total countdown time for user response

### 2. Lunch Time Exception
- **Lunch Hours**: 2:00 PM to 3:00 PM (14:00 - 15:00)
- **Behavior**: Auto checkout is completely disabled during lunch time
- **User Notification**: Users are informed when lunch time is detected

### 3. Activity Tracking
The system tracks the following user activities:
- Mouse movements (`mousemove`)
- Mouse clicks (`mousedown`, `click`)
- Keyboard input (`keypress`)
- Scroll events (`scroll`)
- Touch events (`touchstart`)

## Implementation Details

### Backend Changes

#### 1. New API Endpoint
- **Route**: `POST /api/attendance/auto-checkout`
- **Purpose**: Handles automatic checkout due to inactivity
- **Authentication**: Required (Bearer token)

#### 2. Database Schema Updates
- Added `isAutoCheckout` field to Attendance model
- Tracks whether checkout was automatic or manual

#### 3. Business Logic
- Validates working days (Monday to Friday)
- Checks lunch time exception (2 PM - 3 PM)
- Calculates total hours and early departure
- Records auto checkout with special reason

### Frontend Changes

#### 1. IdleDetector Component Updates
- **Timeout**: Reduced from 60 minutes to 30 minutes
- **Warning**: Reduced from 5 minutes to 2 minutes
- **Countdown**: Reduced from 10 minutes to 5 minutes
- **Auto Checkout**: Replaces auto logout functionality

#### 2. User Interface
- Updated warning dialog text
- Added lunch time exception notification
- Enhanced user feedback messages

## API Endpoints

### Auto Checkout
```http
POST /api/attendance/auto-checkout
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Automatic checkout completed at 14:30 due to inactivity",
  "isEarlyDeparture": false,
  "earlyMinutes": 0,
  "flexibleEndTime": "18:30",
  "checkOutTime": "14:30",
  "totalHours": 5.5,
  "workingHours": "5h 30m",
  "isAutoCheckout": true,
  "attendance": {
    "checkIn": { "time": "09:00" },
    "checkOut": { "time": "14:30" },
    "totalHours": 5.5
  }
}
```

**Response (Lunch Time Blocked):**
```json
{
  "success": false,
  "message": "Auto checkout is not allowed during lunch time (2 PM to 3 PM)",
  "currentTime": "14:15",
  "lunchTime": "14:00 - 15:00"
}
```

## Configuration

### Time Settings
```javascript
const IDLE_TIME = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning
const COUNTDOWN_TIME = 5 * 60 * 1000; // 5 minutes countdown
```

### Lunch Time Settings
```javascript
const lunchStartMinutes = 14 * 60; // 2 PM = 14:00
const lunchEndMinutes = 15 * 60;   // 3 PM = 15:00
```

## User Experience Flow

1. **Normal Activity**: User works normally, timer resets on activity
2. **30 Minutes Idle**: System detects inactivity
3. **Warning Dialog**: Shows 5-minute countdown with options
4. **User Options**:
   - "I'm Still Working" - Resets timer
   - "I'm on Break" - Records break time
5. **Auto Checkout**: If no response, automatically checks out
6. **Lunch Exception**: During 2-3 PM, auto checkout is skipped

## Testing

### Manual Testing
1. Check in to the system
2. Leave the system idle for 30+ minutes
3. Verify warning dialog appears
4. Test during lunch time (2-3 PM) to ensure exception works
5. Verify auto checkout functionality

### Automated Testing
Run the test script:
```bash
node test-auto-checkout.js
```

## Security Considerations

1. **Authentication**: All endpoints require valid authentication
2. **IP Validation**: Auto checkout respects office IP restrictions
3. **Working Days**: Only works on Monday to Friday
4. **Lunch Time**: Protected during lunch hours

## Monitoring and Logging

### Log Messages
- `🔄 Auto checkout request received`
- `✅ Auto checkout successful for employee: [ID] at [TIME]`
- `❌ Error in auto checkout: [ERROR]`

### Database Tracking
- `isAutoCheckout`: Boolean flag in attendance record
- `earlyLeaveReason`: "Automatic checkout due to inactivity (30+ minutes)"
- `method`: "auto-checkout" in checkout record

## Troubleshooting

### Common Issues

1. **Auto checkout not working**
   - Check if user is checked in
   - Verify it's a working day
   - Ensure not during lunch time

2. **Lunch time exception not working**
   - Verify system time is correct
   - Check timezone settings (Asia/Kolkata)

3. **Timer not resetting**
   - Check browser activity detection
   - Verify event listeners are working

### Debug Mode
In development mode, the IdleDetector shows debug information:
- Idle status
- Warning status
- Countdown timer
- Current timeout setting

## Future Enhancements

1. **Configurable Timeouts**: Allow admin to set custom idle times
2. **Department-Specific Rules**: Different rules for different departments
3. **Break Time Integration**: Better integration with break management
4. **Mobile Support**: Enhanced mobile activity detection
5. **Analytics**: Track auto checkout patterns and trends

## Support

For issues or questions about the auto checkout system:
1. Check the logs for error messages
2. Verify system configuration
3. Test with the provided test script
4. Contact the development team
