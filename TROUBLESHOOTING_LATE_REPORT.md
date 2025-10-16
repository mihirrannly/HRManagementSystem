# Troubleshooting: Late Employees Report Not Showing

## Quick Fix Steps

### Step 1: Hard Refresh Your Browser
Press one of these key combinations:
- **Mac Chrome/Firefox**: `Cmd + Shift + R`
- **Mac Safari**: `Cmd + Option + R`
- **Windows Chrome/Firefox**: `Ctrl + Shift + R`
- **Windows Edge**: `Ctrl + F5`

### Step 2: Clear Browser Cache and Reload
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Right-click on the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 3: Check You're on the Correct Page
Navigate to: **Reports & Analytics**
- URL should be: `http://localhost:5175/reports` (or your frontend port)
- NOT the Attendance page
- NOT the Dashboard

### Step 4: Check Your User Role
The button only appears for users with these roles:
- ✅ Admin
- ✅ HR
- ✅ Manager
- ❌ Regular Employee (won't see the button)

To check your role:
1. Open browser console (F12)
2. Type: `localStorage.getItem('user')`
3. Look for the `role` field

### Step 5: Check Browser Console for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. If you see errors, share them for debugging

## What You Should See

When you navigate to Reports & Analytics page, at the top right you should see THREE buttons:
1. **"Late Employees Report"** (Orange/Warning colored button with warning icon)
2. **"Export"** (Outlined button)
3. **"Refresh"** (Blue contained button)

## Still Not Showing?

### Option A: Restart Frontend Server
1. Stop the frontend server (Ctrl+C in terminal)
2. Run: `cd client && npm run dev`
3. Wait for "Local: http://localhost:XXXX/"
4. Open that URL in browser

### Option B: Check File Changes Were Saved
Run this command to verify the button code is in the file:
```bash
grep -n "Late Employees Report" client/src/pages/Reports/Reports.jsx
```

You should see output like:
```
370:            Late Employees Report
898:            <Typography variant="h6">Late Employees Report</Typography>
```

### Option C: Force Restart Everything
```bash
# Kill all node processes
killall node

# Start fresh
npm run dev
```

## Visual Guide

### Expected Location:
```
┌─────────────────────────────────────────────────────┐
│  Reports & Analytics                                │
│                                [⚠️ Late Employees Report] [Export] [Refresh]
└─────────────────────────────────────────────────────┘
```

The orange "Late Employees Report" button should be visible immediately when you land on the Reports page.

## Screenshots to Take (if still not working)
1. Full page screenshot of Reports page
2. Browser console (F12) showing any errors
3. Network tab (F12) showing loaded files
4. Your user info from localStorage

Share these with support for further assistance.

