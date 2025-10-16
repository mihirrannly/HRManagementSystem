# Final Checklist - Late Employees Report

## ✅ The Code IS in Your Application

Verified at these locations:
- Line 370: Button with "Late Employees Report" text
- Line 888-1005: Complete dialog implementation
- Backend: `/server/routes/attendance.js` line 2620-2979

## 🚀 TO SEE IT, FOLLOW THESE EXACT STEPS:

### Step 1: Check Your URL
Your app is running on: **http://localhost:5175**

Go to: **http://localhost:5175/reports**

### Step 2: Check Your User Role

**CRITICAL**: Only these roles can see Reports:
- ✅ admin
- ✅ hr
- ✅ manager
- ❌ employee (regular users)

To check your role:
1. Press F12 (open browser console)
2. Copy and paste this:
```javascript
JSON.parse(localStorage.getItem('user'))?.role
```
3. Press Enter
4. It will show your role

### Step 3: What You'll See Based on Role

#### If you DON'T have permission:
You'll see a message:
```
"You don't have permission to view reports."
```

#### If you DO have permission:
You'll see the full Reports page with THREE buttons at the top right:
```
[⚠️ Late Employees Report]  [Export]  [Refresh]
```

### Step 4: Hard Refresh
After confirming you're on the right page:
- Press `Cmd + Shift + R` (Mac)
- OR `Ctrl + Shift + R` (Windows)

## 🔧 Quick Role Fix

If you need to test with an admin account:
1. Log out from current account
2. Log in with an admin/HR/manager account
3. Navigate to Reports page

OR if you're developing, you can temporarily change your role in the database.

## 📸 Debug Information Needed

If you still don't see it, please provide:

1. **Your user role** (from console):
```javascript
JSON.parse(localStorage.getItem('user'))?.role
```

2. **Current URL** you're viewing

3. **Screenshot** of the Reports page

4. **Console errors** (F12 → Console tab, any red errors?)

## 🎯 Expected Behavior

### When button IS visible:
1. Orange "Late Employees Report" button at top right
2. Click it → Dialog opens
3. Select Excel or PDF format
4. Choose date range
5. Click "Download Report"
6. File downloads

### When button is NOT visible:
Most likely reason: You don't have admin/hr/manager role

## ✅ Verification Commands

Run these in your project directory:

```bash
# Verify the button code exists
grep -n "Late Employees Report" client/src/pages/Reports/Reports.jsx

# Should show 3 lines:
# 370: Late Employees Report (button text)
# 888: Comment
# 898: Dialog title

# Verify backend endpoint exists
grep -n "late-employees-report" server/routes/attendance.js

# Should show the route at line 2620
```

Both commands should return results, confirming the code is there.

