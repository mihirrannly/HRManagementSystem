# How to View the New Reports Section

## Steps to Access Reports

1. **Log in** to the Employee Dashboard
2. **Navigate to Profile** section (the main dashboard area)
3. Click on the **"Time"** tab (6th tab with clock icon)
4. **Scroll down** past the "Today's Status", "Attendance Summary", and "Leave Balance" sections
5. Look for the divider that says **"Detailed Analytics & Reports"**

## What You Should See

After scrolling down in the Time tab, you should see:

### 1. Period Selector
Two buttons:
- Weekly View
- Monthly View

### 2. Working Hours Trend Chart
- Area chart (weekly) or Bar chart (monthly)
- Shows your working hours over time

### 3. Performance Metrics Dashboard
- Productivity Score with progress bar
- Daily Average Hours
- Weekly Average Hours  
- Overtime Hours
- Monthly Total Hours

### 4. Late Arrival Analysis
- Total late days
- Average minutes late
- Week-by-week bar chart

### 5. Attendance Pattern
- Line chart showing present vs late days
- Or daily breakdown in weekly view

### 6. Insights & Recommendations
- Smart alerts based on your performance
- Color-coded feedback cards

## Troubleshooting

### If you don't see the new sections:

1. **Check Console Logs:**
   - Open browser DevTools (F12 or Right-click → Inspect)
   - Go to Console tab
   - Look for these logs:
     - 🔍 Fetching detailed reports...
     - 📅 Fetching attendance from...
     - 📊 Received attendance records: X
     - ✅ Reports data updated

2. **Hard Refresh:**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Or `Cmd + Shift + R` (Mac)
   - This clears cache and reloads

3. **Check Tab:**
   - Make sure you're on the "Time" tab (has clock icon)
   - Count the tabs: About, Profile, Job, Education, Experience, **Time**, Documents

4. **Scroll Down:**
   - The new section is below the existing "Leave Balance" section
   - Look for "Detailed Analytics & Reports" divider

5. **Check for Data:**
   - The charts need attendance data to display
   - If you have no attendance records, you'll see "No data available" messages
   - But the metric cards should still show (with 0 values)

### If Data Shows as 0:

This is normal if:
- You haven't checked in/out in the last 30 days
- The attendance system was recently set up
- You're a new employee

The system will populate with real data as you use the attendance system.

## Expected Behavior

- **With Data:** Charts and metrics populate with your actual attendance records
- **Without Data:** Empty state messages appear, but the UI structure is visible
- **Loading:** Brief loading state when first opening the tab

## Console Debugging

Check the console for these messages:
- ✅ **Success:** "Reports data updated" - Everything is working
- ❌ **Error:** "Error fetching detailed reports" - API issue

If you see errors, check:
1. Backend server is running
2. You're logged in correctly
3. Your employee profile exists

