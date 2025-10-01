# Fix Prajwal's Manager Access Issue

## Problem
Prajwal (CODR083) is logged in but cannot see the data of employees who are reporting to him.

## Root Causes
This issue typically occurs due to one or more of the following:

1. **User Role Issue**: Prajwal's user role is not set to "manager"
2. **Reporting Relationships**: No employees are set to report to Prajwal
3. **Employee Record**: Prajwal's employee record might be missing or incomplete

## Quick Fix Steps

### Step 1: Check Current Status
1. Login as an admin user
2. Go to: `http://localhost:5000/api/employees/debug-manager-access`
3. This will show you the current status of Prajwal's access

### Step 2: Fix the Issue

#### Option A: Use the Fix Script
1. Update the credentials in `fix-prajwal-manager-access.js`:
   ```javascript
   const PRAJWAL_EMAIL = 'prajwal@rannkly.com'; // Update with actual email
   const ADMIN_EMAIL = 'admin@rannkly.com'; // Update with admin email
   const ADMIN_PASSWORD = 'password123'; // Update with admin password
   ```

2. Run the script:
   ```bash
   node fix-prajwal-manager-access.js
   ```

#### Option B: Manual Database Fix

1. **Update User Role**:
   ```javascript
   // In MongoDB or through API
   db.users.updateOne(
     { email: "prajwal@rannkly.com" },
     { $set: { role: "manager" } }
   )
   ```

2. **Set Reporting Relationships**:
   ```javascript
   // Find Prajwal's employee ID first
   const prajwalEmployee = db.employees.findOne({ "user": prajwalUserId });
   
   // Set employees to report to Prajwal
   db.employees.updateMany(
     { employeeId: { $in: ["CODR084", "CODR085", "CODR086"] } }, // Add actual employee IDs
     { $set: { "employmentInfo.reportingManager": prajwalEmployee._id } }
   )
   ```

#### Option C: Use the API Endpoint
1. Login as admin
2. Make a POST request to `/api/employees/fix-manager-access`:
   ```json
   {
     "userEmail": "prajwal@rannkly.com",
     "setAsManager": true,
     "reportingManagerEmployeeIds": ["CODR084", "CODR085", "CODR086"]
   }
   ```

### Step 3: Verify the Fix
1. Login as Prajwal
2. Check if you can see the Team Dashboard
3. Verify that team members are visible
4. Test accessing individual employee dashboards

## Expected Results After Fix

- Prajwal should see the Team Dashboard instead of the regular employee dashboard
- Team members should be listed with their work-related information
- Sensitive data (salary, bank details, etc.) should be hidden from Prajwal's view
- Prajwal should be able to view individual team member dashboards with filtered data

## Troubleshooting

### If Still Not Working:

1. **Check User Role**:
   ```javascript
   db.users.findOne({ email: "prajwal@rannkly.com" })
   // Should show: { role: "manager" }
   ```

2. **Check Employee Record**:
   ```javascript
   db.employees.findOne({ "user": prajwalUserId })
   // Should show Prajwal's employee record
   ```

3. **Check Reporting Relationships**:
   ```javascript
   db.employees.find({ "employmentInfo.reportingManager": prajwalEmployeeId })
   // Should show employees reporting to Prajwal
   ```

4. **Check Active Status**:
   ```javascript
   db.employees.find({ 
     "employmentInfo.reportingManager": prajwalEmployeeId,
     "employmentInfo.isActive": true 
   })
   // Should show only active employees
   ```

## API Endpoints for Testing

- `GET /api/employees/debug-manager-access` - Debug current status
- `GET /api/employees/my-team` - Get team members
- `GET /api/employees/reporting-structure` - Get reporting structure
- `GET /api/employees/team-dashboard/:employeeId` - Get team member dashboard

## Contact
If the issue persists, check the server logs for any error messages and ensure all database connections are working properly.
