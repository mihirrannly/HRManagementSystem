# Salary Data Fetching Troubleshooting Guide

## Issue: "Still the salary is not fetched in the payroll section from the salary section"

### 🔍 **Step-by-Step Debugging**

#### 1. **Check Server Status**
```bash
# Make sure server is running on correct port
curl http://localhost:5001/api/health
# Should return server status
```

#### 2. **Test API Endpoints Directly**

##### Test Employee Salaries Endpoint:
```bash
curl -X GET "http://localhost:5001/api/payroll/employee-salaries?month=10&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

##### Test Salary Management Endpoint:
```bash
curl -X GET "http://localhost:5001/api/salary-management" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for debug messages:
   - `🔍 Fetching employee salary data...`
   - `📊 Employee salary data received:`
   - `💰 Employee salary data found:`

#### 4. **Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click "View Details" on an employee
4. Look for API calls:
   - `/api/payroll/employee-salaries`
   - `/api/leave/requests`
   - `/api/attendance`

### 🛠️ **Common Issues and Solutions**

#### Issue 1: API Endpoint Not Found (404)
**Cause**: Route not properly registered
**Solution**: 
```bash
# Check if route is registered in server
grep -r "employee-salaries" server/
```

#### Issue 2: Authentication Error (401)
**Cause**: Missing or invalid token
**Solution**: 
- Check if user is logged in
- Verify token in localStorage
- Check user role (admin/hr/finance)

#### Issue 3: No Salary Data Found
**Cause**: No salary records in database
**Solution**: 
```bash
# Check if salary records exist
# Go to Salary Management section
# Create salary records for employees
```

#### Issue 4: CORS Error
**Cause**: Cross-origin request blocked
**Solution**: 
- Check server CORS configuration
- Verify API base URL in frontend

### 🔧 **Manual Verification Steps**

#### Step 1: Check Database
```javascript
// In browser console, check if salary data exists
fetch('/api/salary-management')
  .then(res => res.json())
  .then(data => console.log('Salary records:', data));
```

#### Step 2: Check Employee Data
```javascript
// In browser console, check employee data
fetch('/api/employees')
  .then(res => res.json())
  .then(data => console.log('Employees:', data));
```

#### Step 3: Test Payroll Endpoint
```javascript
// In browser console, test payroll endpoint
fetch('/api/payroll/employee-salaries?month=10&year=2024')
  .then(res => res.json())
  .then(data => console.log('Payroll data:', data));
```

### 📋 **Debug Checklist**

- [ ] Server is running (port 5001)
- [ ] User is logged in with correct role
- [ ] No console errors in browser
- [ ] API endpoints are accessible
- [ ] Salary records exist in database
- [ ] Employee records exist
- [ ] Network requests are successful
- [ ] Data is being returned from API

### 🚨 **Quick Fixes**

#### Fix 1: Restart Server
```bash
# Stop server (Ctrl+C)
# Clear port
lsof -ti:5001 | xargs kill -9
# Restart
npm run dev
```

#### Fix 2: Clear Browser Cache
```bash
# Hard refresh
Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
# Or clear cache in browser settings
```

#### Fix 3: Check User Role
```javascript
// In browser console
console.log('User role:', localStorage.getItem('userRole'));
console.log('User data:', JSON.parse(localStorage.getItem('user')));
```

### 🔍 **Advanced Debugging**

#### Check Server Logs
```bash
# Look for these messages in server logs:
# "GET /api/payroll/employee-salaries"
# "Employee salaries endpoint accessible"
# "Salary data found for employee"
```

#### Check Database Connection
```bash
# Verify MongoDB connection
# Check if SalaryDetails collection exists
# Verify employee records have salary data
```

#### Check API Response
```javascript
// Add this to handleEmployeeClick function
console.log('Full API response:', response);
console.log('Response status:', response.status);
console.log('Response data:', response.data);
```

### 📞 **If Still Not Working**

1. **Check Server Logs**: Look for error messages
2. **Verify Database**: Ensure salary records exist
3. **Test with Postman**: Test API endpoints directly
4. **Check Network**: Verify API calls are being made
5. **Review Console**: Look for JavaScript errors

### 🎯 **Expected Behavior**

When working correctly:
1. **Employee List**: Shows all employees with "View Details" button
2. **Click Employee**: Opens detailed dialog
3. **Salary Data**: Shows comprehensive salary breakdown
4. **Leave Data**: Shows approved leaves
5. **Attendance**: Shows attendance summary

### 📊 **Data Flow Verification**

1. **Frontend**: Calls `/api/payroll/employee-salaries`
2. **Backend**: Fetches employees and salary data
3. **Database**: Returns salary records from SalaryDetails
4. **Response**: Sends formatted salary data
5. **Frontend**: Displays salary information

---

**Note**: This guide covers the most common issues with salary data fetching. If you're still experiencing problems, please provide specific error messages from the browser console or server logs.
