# Work Anniversary Feature

## Overview
Added work anniversary cards to the dashboard that display employees celebrating work anniversaries this month and upcoming anniversaries. This feature is visible to all authenticated users.

## Features Implemented

### 1. Backend API Endpoint
**Endpoint:** `GET /api/employees/anniversaries`
- **Access:** All authenticated users
- **Location:** `server/routes/employees.js`

**Response Format:**
```json
{
  "success": true,
  "thisMonth": [
    {
      "employeeId": "CODR001",
      "name": "Rajesh Kumar",
      "yearsOfService": 5,
      "anniversaryDate": "2025-10-15T00:00:00.000Z",
      "joiningDate": "2020-10-15T00:00:00.000Z"
    }
  ],
  "upcoming": [
    {
      "employeeId": "CODR002",
      "name": "John Doe",
      "yearsOfService": 3,
      "anniversaryDate": "2025-11-20T00:00:00.000Z",
      "joiningDate": "2022-11-20T00:00:00.000Z"
    }
  ]
}
```

**Logic:**
- Fetches all active employees with valid joining dates
- Filters employees who have completed at least 1 year of service
- Separates anniversaries into two categories:
  - **This Month**: Anniversaries in the current month
  - **Upcoming**: Anniversaries in the next month
- Sorts by anniversary date

### 2. Frontend UI Components

#### Employee Dashboard (`client/src/pages/Dashboard/EmployeeDashboard.jsx`)
- Added anniversary state management
- Created `fetchAnniversaries()` function to retrieve data
- Displays two beautiful gradient cards:
  - 🎉 **This Month's Anniversaries** (Pink gradient)
  - 📅 **Upcoming Anniversaries** (Blue gradient)

**Features:**
- Shows employee initials in colored avatars
- Displays years of service with a badge
- Shows anniversary date
- Hover effects with smooth transitions
- Responsive design (stacks on mobile)

#### Admin Dashboard (`client/src/pages/Dashboard/Dashboard.jsx`)
- Same anniversary cards added for admin/HR users
- Consistent design and functionality across both dashboards

### 3. UI Design

**This Month's Anniversaries Card:**
- Background: Pink gradient (`#fff5f8` to `#ffffff`)
- Color scheme: `#d81b60` (pink)
- Icon: 🎉
- Shows all employees celebrating anniversaries in the current month

**Upcoming Anniversaries Card:**
- Background: Blue gradient (`#f0f9ff` to `#ffffff`)
- Color scheme: `#0288d1` (blue)
- Icon: 📅
- Shows up to 5 upcoming anniversaries in the next month

**Common Features:**
- Avatar with employee initials
- Employee name (bold)
- Years of service description
- Anniversary date
- Years badge (e.g., "5Y")
- Smooth hover animations
- Clean dividers between entries

## Files Modified

1. **Backend:**
   - `server/routes/employees.js` - Added `/anniversaries` endpoint

2. **Frontend:**
   - `client/src/pages/Dashboard/EmployeeDashboard.jsx` - Added anniversary cards
   - `client/src/pages/Dashboard/Dashboard.jsx` - Added anniversary cards

## Testing

### Manual Testing
1. Start the server: `npm run dev` or `./start-servers.sh`
2. Login to the application
3. Navigate to the Dashboard
4. The anniversary cards will appear below the stat cards if there are any anniversaries

### API Testing
Run the test script:
```bash
node test-anniversaries.js
```

Note: You'll need valid credentials for the test to work. Update the credentials array in the test file if needed.

## Data Requirements

For anniversaries to show:
1. Employees must have `employmentInfo.isActive = true`
2. Employees must have a valid `employmentInfo.dateOfJoining`
3. Employees must have completed at least 1 year of service
4. Anniversary month must match current month (for "This Month") or next month (for "Upcoming")

## Example Data

If an employee joined on October 15, 2020:
- In October 2025, they will appear in "This Month's Anniversaries" with 5 years of service
- In September 2025, they would appear in "Upcoming Anniversaries"

## Benefits

1. **Employee Recognition:** Celebrate work anniversaries and milestones
2. **Team Culture:** Promotes awareness of tenure achievements
3. **Engagement:** Encourages teams to congratulate colleagues
4. **Visibility:** Everyone can see upcoming celebrations
5. **Automated:** No manual tracking required

## Future Enhancements (Optional)

- Send email notifications for upcoming anniversaries
- Add birthday tracking
- Integration with Slack/Teams for automatic congratulations
- Export anniversary calendar
- Filter by department
- Custom messages/badges for milestone years (5, 10, 15, etc.)


