# 📍 Import Buttons - Location Guide

## ✅ Import Buttons Added to Attendance Page!

### **Where to Find Them:**

When you open the **Attendance** page at `http://localhost:3000/attendance`, you'll now see TWO import buttons in the top-right corner of the page header.

---

## 📊 Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Attendance Management                                          │
│  Monday, October 8, 2025 • 17:30                               │
│                                                                 │
│                        [Import Rannkly Report] [Import Simple] │
│                        [Refresh Icon]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Two Import Options

### **1. Import Rannkly Report** (Primary Button - Purple/Blue)
**Appearance:**
- ☁️ Cloud upload icon
- Purple gradient background
- "Import Rannkly Report" text

**When to Use:**
- For your specific file: "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx"
- Wide format with 292 columns
- Monthly performance reports from Rannkly system

**Leads to:** `/attendance/import-rannkly`

---

### **2. Import Simple Format** (Secondary Button - Outlined)
**Appearance:**
- 📄 File upload icon
- Purple outlined border
- "Import Simple Format" text

**When to Use:**
- For simple long-format files
- Standard CSV/Excel with columns: Employee ID, Date, Check-in, Check-out, Status
- One row per employee per day

**Leads to:** `/attendance/import`

---

## 👀 Who Can See These Buttons?

**Visible for:**
✅ Admin users  
✅ HR users

**Hidden for:**
❌ Regular employees  
❌ Managers (unless they also have admin/HR role)

---

## 🚀 How to Use

### **Step 1: Navigate to Attendance Page**
```
http://localhost:3000/attendance
```

### **Step 2: Look at Top-Right Corner**
You'll see the import buttons next to the refresh icon.

### **Step 3: Choose Your Import Type**

#### **For Your Rannkly Files (Recommended):**
1. Click **"Import Rannkly Report"** button
2. Upload your file: "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx"
3. Follow the 4-step wizard
4. See all headers clearly in Step 2
5. Preview and import

#### **For Simple Format Files:**
1. Click **"Import Simple Format"** button
2. Upload a simple Excel/CSV file
3. Map columns
4. Preview and import

---

## 📷 What You'll See

### **Attendance Page Header:**

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  📊 Attendance Management                                          │
│     Monday, October 8, 2025 • 17:30                               │
│     🧪 Testing  mihir@example.com                                  │
│                                                                    │
│     ┌──────────────────────┐  ┌────────────────────┐             │
│     │ ☁️ Import Rannkly    │  │ 📄 Import Simple   │  │  🔄  │   │
│     │    Report            │  │    Format          │  │     │    │
│     └──────────────────────┘  └────────────────────┘  └─────┘    │
│          (Purple Button)         (Outlined Button)    (Refresh)   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Button Styles

### **Import Rannkly Report:**
- **Color**: Purple gradient (from #667eea to #764ba2)
- **Effect**: Subtle shadow and glow
- **Hover**: Gradient reverses direction
- **Icon**: Cloud upload ☁️
- **Size**: Small, compact

### **Import Simple Format:**
- **Color**: Purple outline
- **Effect**: Light purple background on hover
- **Border**: 1px purple border
- **Icon**: File upload 📄
- **Size**: Small, compact

---

## 💡 Quick Tips

### **For Your Monthly Imports:**
1. **Use "Import Rannkly Report"** - It's specifically designed for your file format
2. Buttons are always visible at the top of the Attendance page
3. No need to remember URLs - just click the button!

### **Navigation Flow:**
```
Attendance Page
    ↓ (Click "Import Rannkly Report")
Rannkly Import Page
    ↓ (Upload file)
See Headers Clearly (Step 2)
    ↓ (Preview)
Import Complete (Step 4)
    ↓ (Click "View Attendance Records")
Back to Attendance Page ✅
```

---

## 🔧 Technical Details

**Button Implementation:**
- Only shown when `!isEmployee && (role === 'admin' || role === 'hr')`
- Uses React Router's `useNavigate()` for navigation
- Styled with Material-UI `Button` component
- Includes gradient backgrounds and hover effects

**Location in Code:**
- File: `client/src/pages/Attendance/Attendance.jsx`
- Lines: ~413-454 (import buttons section)
- Position: Top-right header, before refresh button

---

## ✅ You're All Set!

**The import buttons are now visible on your Attendance page!**

### **To start importing:**

1. **Go to:** `http://localhost:3000/attendance`
2. **Look for:** Purple "Import Rannkly Report" button (top-right)
3. **Click it:** Takes you to import page
4. **Upload:** Your "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx" file
5. **Import:** Follow the wizard

---

## 📞 Need Help?

**Can't see the buttons?**
- Ensure you're logged in as Admin or HR
- Check that you're on the Attendance page
- Refresh the page (Ctrl/Cmd + R)

**Buttons not working?**
- Check browser console for errors
- Ensure routes are configured in `App.jsx`
- Restart dev server if needed

**Want different styling?**
- Buttons can be customized in the Attendance.jsx file
- Change colors, sizes, or positions as needed

---

## 🎉 Quick Access Summary

| Button | Color | Icon | Destination | For |
|--------|-------|------|-------------|-----|
| **Import Rannkly Report** | Purple Gradient | ☁️ | `/attendance/import-rannkly` | Your 292-column files |
| **Import Simple Format** | Purple Outline | 📄 | `/attendance/import` | Simple CSV/Excel |

**Both buttons are on the Attendance page top-right corner!** ✨

---

**Happy Importing!** 🚀🎊

