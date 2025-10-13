# Quick Guide: Recent Exits Dashboard Card

## Where to See the Changes

### Dashboard Location
1. **Log in** to the HR Management system
2. Navigate to **Dashboard** (main page after login)
3. Scroll down past the statistics cards and charts
4. Look for the **"Employee Overview"** section
5. The **"Recent Exits (Last 2 Months)"** card appears below the grid of cards showing:
   - Exits (active exits)
   - Onboarding
   - On Probation
   - Birthdays

### What You'll See

#### Card Header
```
Recent Exits (Last 2 Months)
Employees who left the organization in the last two months and their exit status
```

#### For Each Employee Who Left:
- **Name** (in bold)
- **Employee ID** • **Designation**
- **Department** • **Location**
- **Status Badge** (color-coded):
  - 🟢 Green = COMPLETED
  - 🟠 Orange = PENDING APPROVAL
  - 🔵 Blue = IN PROGRESS
  - ⚫ Gray = INITIATED
- **Last Working Day:** DD MMM YYYY
- **Days Since Exit:** X days ago
- **Exit Type:** RESIGNATION / TERMINATION / etc.
- **Completion:** XX%
- **Clearance Status Chips:**
  - IT: status
  - HR: status
  - FINANCE: status
  - MANAGER: status
  - ADMIN: status

### Example Display

```
┌─────────────────────────────────────────────────────────────┐
│ Recent Exits (Last 2 Months)                                │
│ Employees who left in the last two months and their exit   │
│ status                                                       │
├─────────────────────────────────────────────────────────────┤
│ John Doe                              [COMPLETED]           │
│ CODR001 • Senior Developer            Last Day: 15 Sep 2025 │
│ Engineering • Mumbai                  28 days ago           │
│                                                              │
│ Exit Type: RESIGNATION                                      │
│ Completion: 100%                                            │
│ [IT: completed] [HR: completed] [FINANCE: completed]       │
│ [MANAGER: completed] [ADMIN: completed]                    │
├─────────────────────────────────────────────────────────────┤
│ Jane Smith                            [IN PROGRESS]         │
│ CODR025 • Marketing Manager           Last Day: 01 Oct 2025 │
│ Marketing • Delhi                     12 days ago           │
│                                                              │
│ Exit Type: RESIGNATION                                      │
│ Completion: 75%                                             │
│ [IT: completed] [HR: in_progress] [FINANCE: pending]       │
│ [MANAGER: completed] [ADMIN: completed]                    │
└─────────────────────────────────────────────────────────────┘
```

### Visibility Rules

The card will **only appear** if:
- There are employees who left in the last 2 months
- You have permission to view exit management data (HR, Admin, Manager roles)

The card will **not appear** if:
- No employees left in the last 2 months
- You don't have proper permissions

### Color Coding

#### Status Badge Colors:
- **Green** (#4caf50): Exit process completed
- **Orange** (#ff9800): Pending approval
- **Blue** (#2196f3): In progress
- **Gray** (#9e9e9e): Initiated or other statuses

#### Clearance Status Colors:
- **Green** (#4caf50): Clearance completed
- **Blue** (#2196f3): Clearance in progress
- **Orange** (#ff9800): Clearance pending

## API Endpoint

### Endpoint Details
```
GET /api/exit-management/recent-exits
```

### Authentication Required
Yes - Bearer token

### Permissions Required
- Module: EXIT_MANAGEMENT
- Action: READ

### Response Format
```json
{
  "success": true,
  "count": 2,
  "exits": [
    {
      "employeeId": "CODR001",
      "employeeName": "John Doe",
      "designation": "Senior Developer",
      "department": "Engineering",
      "location": "Mumbai",
      "exitType": "resignation",
      "lastWorkingDate": "2025-09-15T00:00:00.000Z",
      "status": "completed",
      "clearanceStatus": {
        "itClearance": "completed",
        "hrClearance": "completed",
        "financeClearance": "completed",
        "managerClearance": "completed",
        "adminClearance": "completed"
      },
      "completionPercentage": 100,
      "daysSinceExit": 28
    }
  ]
}
```

## Troubleshooting

### Card Not Showing?
1. **Check if exits exist:**
   - Verify in Exit Management section if there are any exits with last working date in last 2 months
2. **Check permissions:**
   - Ensure your user role has EXIT_MANAGEMENT READ permissions
3. **Check console:**
   - Open browser console (F12)
   - Look for "Recent Exits Response" log
   - Check for any API errors

### Data Not Loading?
1. **Check network tab:**
   - Open browser DevTools (F12) → Network tab
   - Look for request to `/exit-management/recent-exits`
   - Check response status and data
2. **Check server logs:**
   - Look for "Error fetching recent exits" in server logs
3. **Verify authentication:**
   - Check if your session token is valid
   - Try logging out and back in

### Incorrect Data?
1. **Verify date calculation:**
   - Check if lastWorkingDate is within last 2 months
2. **Check clearance statuses:**
   - Verify in Exit Management detail page
3. **Refresh data:**
   - Force refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## Testing the Feature

### Test Case 1: With Recent Exits
1. Create an exit record with last working date within last 2 months
2. Navigate to Dashboard
3. Verify card appears with correct data

### Test Case 2: Without Recent Exits
1. Ensure no exits in last 2 months
2. Navigate to Dashboard
3. Verify card does not appear

### Test Case 3: Status Updates
1. Update exit status in Exit Management
2. Refresh Dashboard
3. Verify status is updated on card

### Test Case 4: Clearance Status
1. Mark some clearances as completed in Exit Management
2. Refresh Dashboard
3. Verify clearance chips show correct status with proper colors

## Additional Notes

- The card automatically fetches data on Dashboard load
- Data refreshes when navigating back to Dashboard
- No manual refresh button needed
- Card is responsive and works on mobile devices
- All dates are formatted as "DD MMM YYYY" (e.g., "15 Sep 2025")
- Days calculation is accurate and updates in real-time

