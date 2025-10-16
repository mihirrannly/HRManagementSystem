# How to See the Late Employees Report Button

## ✅ YOUR FRONTEND IS RUNNING ON PORT 5175

According to your terminal output, your app is at:
```
http://localhost:5175
```

## 🎯 Step-by-Step Instructions

### Step 1: Open Correct URL
Open your browser and go to:
```
http://localhost:5175/reports
```

**IMPORTANT**: Make sure you go to `/reports` NOT `/attendance`

### Step 2: Clear Browser Cache
Do a hard refresh:
- **Mac**: Press `Cmd + Shift + R`
- **Windows**: Press `Ctrl + Shift + R`

OR

Right-click on the refresh button → "Empty Cache and Hard Reload"

### Step 3: Look at Top Right Corner
You should see three buttons in this order:
```
[⚠️ Late Employees Report]  [Export]  [Refresh]
```

The first button should be ORANGE/WARNING colored.

## 🔍 Verification

The code is at these lines in Reports.jsx:
- Line 363-371: The button code
- Line 888-1005: The dialog code

To verify the file has the changes, run:
```bash
grep -n "Late Employees Report" client/src/pages/Reports/Reports.jsx
```

You should see output showing 3 matches.

## ❗ Important Notes

1. **Port**: Your app is on port 5175 (not 5173)
2. **Page**: Go to /reports (not /attendance)
3. **Role**: You must be Admin, HR, or Manager
4. **Cache**: Do a hard refresh (Cmd+Shift+R)

## 🖼️ What You Should See

When you open http://localhost:5175/reports, the top of the page should look like:

```
┌──────────────────────────────────────────────────────────────┐
│  Reports & Analytics                                          │
│                    [⚠️ Late Employees Report] [Export] [Refresh] │
└──────────────────────────────────────────────────────────────┘
```

## 🚨 If Still Not Visible

Try these in order:

### Option 1: Restart Everything
```bash
# In your terminal
killall node
npm run dev
```

### Option 2: Check Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for any red errors
4. Share the errors if you see any

### Option 3: Check Your User Role
In browser console (F12), type:
```javascript
JSON.parse(localStorage.getItem('user'))
```

Check if `role` is one of: 'admin', 'hr', or 'manager'

### Option 4: Force Browser Reload
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Refresh the page

## 📸 Take a Screenshot

If you still don't see it, please:
1. Go to http://localhost:5175/reports
2. Take a screenshot of the entire page
3. Share it so I can see what you're seeing

