# Rannkly Attendance Report Import Guide

## 🎯 Overview

This specialized import tool is designed specifically for **Rannkly Monthly Attendance Reports** in wide/pivot format. Your file "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx" will be imported with **crystal-clear header visibility** throughout the process.

---

## 🚀 Quick Start

### **Access the Import Tool**
Navigate to: `http://localhost:3000/attendance/import-rannkly`

**Requirements:**
- Role: Admin or HR
- File format: Rannkly Monthly Attendance Report (.xlsx)
- File size: < 10MB

---

## 📊 Your File Structure

### **What Your Rannkly Report Looks Like:**

```
Row 1: Rannkly
Row 2: Monthly Performance Report 01 Jan 2025 - 31 Jan 2025
Row 3: [Date Range Header]
Row 4: HEADERS → Employee Number | Employee Name | Job Title | Department | ... | [Daily Columns]
Row 5+: DATA → Employee records with daily attendance
```

### **Column Structure:**

#### **Employee Information Columns (1-13):**
1. Employee Number
2. Employee Name
3. Job Title
4. Department
5. Sub Department
6. Location
7. Cost Center
8. Reporting Manager
9. Total Gross Hours
10. Avg Gross Hours
11. Total Effective Hours
12. Avg Effective Hours
13. Leave

#### **Daily Attendance Columns (Repeating for each day):**

For each day of the month, there are 9 columns:
1. **Shift Policy** - Employee's shift type
2. **Shift Start** - Scheduled start time
3. **Shift End** - Scheduled end time
4. **IN** ✅ - Check-in time (WILL BE IMPORTED)
5. **OUT** ✅ - Check-out time (WILL BE IMPORTED)
6. **Effective Hours** - Actual working hours
7. **Gross Hours** - Total hours including breaks
8. **Shift Hours** - Scheduled shift duration
9. **Status** ✅ - Attendance status (WILL BE IMPORTED)

**Total Columns:** 13 (employee info) + (31 days × 9 columns) = **292 columns**

---

## 📋 Import Process (4 Easy Steps)

### **Step 1: Upload File**

1. Click "Select File"
2. Choose your Rannkly report: `Jan 2025 - 31 Jan 2025 - Rannkly.xlsx`
3. Click "Analyze File"

**What Happens:**
- File is read and parsed
- Structure is analyzed
- Headers are identified
- Employee count is detected

---

### **Step 2: Verify Headers**

You'll see a **detailed breakdown** of your file structure:

#### **📄 File Information Card:**
- Title: Rannkly
- Report: Monthly Performance Report
- Period: 01-Jan-2025 - 31-Jan-2025
- Total Employees: [Number detected]
- Days of Data: 31

#### **👥 Employee Information Headers:**

All 13 employee info headers are displayed in a clear table:

| Column # | Header Name |
|----------|-------------|
| 1 | Employee Number ✅ |
| 2 | Employee Name |
| 3 | Job Title |
| 4 | Department |
| ... | ... |

#### **📅 Daily Attendance Structure:**

Expandable section showing the repeating pattern for each day:

| Field # | Header Name | Description |
|---------|-------------|-------------|
| 1 | Shift Policy | Employee's shift type |
| 2 | Shift Start | Shift start time |
| 3 | Shift End | Shift end time |
| 4 | **IN** ✅ | Check-in time (will be imported) |
| 5 | **OUT** ✅ | Check-out time (will be imported) |
| 6 | Effective Hours | Actual working hours |
| 7 | Gross Hours | Total hours |
| 8 | Shift Hours | Scheduled hours |
| 9 | **Status** ✅ | Attendance status (will be imported) |

**Visual Indicators:**
- ✅ Green chips = Will be imported
- 🔵 Blue chips = Reference only (not imported)
- All headers clearly labeled and organized

**Action:**
Click "Transform & Preview Data" to continue

---

### **Step 3: Preview Transformed Data**

#### **What the System Does:**

Your **WIDE format** (one row per employee with all days as columns):
```
Emp# | Name | 01-Jan-IN | 01-Jan-OUT | 02-Jan-IN | ...
E001 | John | 09:00     | 18:00      | 09:30     | ...
```

Is transformed to **LONG format** (one row per employee per day):
```
Emp# | Name | Date       | IN    | OUT   | Status
E001 | John | 2025-01-01 | 09:00 | 18:00 | present
E001 | John | 2025-01-02 | 09:30 | 18:00 | late
```

#### **Preview Display:**

You'll see:

**📊 Statistics Cards:**
- Total Records: [e.g., 1,240]
- Employees: [e.g., 40]
- Days: 31

**📋 Sample Data Table** (First 20 records):

| Employee ID | Employee Name | Date | Check-in | Check-out | Status |
|-------------|---------------|------|----------|-----------|--------|
| CODR011 | Sangita Gopal | 2025-01-01 | 09:00 | 18:00 | present |
| CODR011 | Sangita Gopal | 2025-01-02 | 09:30 | 18:00 | late |
| CODR021 | Priya Mishra | 2025-01-01 | 09:15 | 18:00 | present |
| ... | ... | ... | ... | ... | ... |

**Headers Are Crystal Clear:**
- Column names in bold
- Color-coded status chips
- Scrollable table with sticky headers
- All data values visible

**⚠️ Warning:**
> This will create or update [X] attendance records. Existing records for the same employee and date will be updated.

**Action:**
Click "Start Import" to begin importing

---

### **Step 4: View Results**

After import completion, you'll see:

#### **📊 Summary Statistics:**

Three large cards showing:
- **✅ Successful** (green): Records imported successfully
- **❌ Failed** (red): Records that failed to import
- **⚠️ Skipped** (yellow): Records that were skipped

#### **❌ Error Details (if any):**

Table showing failed records:

| Employee ID | Date | Error Message |
|-------------|------|---------------|
| EMP999 | 2025-01-15 | Employee not found: EMP999 |
| ... | ... | ... |

#### **Next Actions:**
- **Import Another File** → Import next month (Feb 2025)
- **View Attendance Records** → See imported data in Attendance page

---

## 🎯 What Gets Imported

From your Rannkly report, the system imports:

| Rannkly Column | Imported As | Notes |
|----------------|-------------|-------|
| Employee Number | Employee ID | Must match existing employee |
| Employee Name | Reference only | For verification |
| IN (for each day) | Check-in time | Parsed and converted |
| OUT (for each day) | Check-out time | Parsed and converted |
| Status (for each day) | Attendance status | Normalized to system format |

### **Auto-Calculated Fields:**
- **Total Hours**: Calculated from IN-OUT difference
- **Regular Hours**: Up to 8 hours
- **Overtime Hours**: Hours beyond 8
- **Late Status**: If IN > 9:00 AM
- **Late Minutes**: Difference from 9:00 AM

---

## 📅 Monthly Import Workflow

For importing all your attendance data (Jan-Sep 2025):

### **1. Organize Your Files:**
```
Jan 2025 - 31 Jan 2025 - Rannkly.xlsx
Feb 2025 - 28 Feb 2025 - Rannkly.xlsx
Mar 2025 - 31 Mar 2025 - Rannkly.xlsx
Apr 2025 - 30 Apr 2025 - Rannkly.xlsx
May 2025 - 31 May 2025 - Rannkly.xlsx
Jun 2025 - 30 Jun 2025 - Rannkly.xlsx
Jul 2025 - 31 Jul 2025 - Rannkly.xlsx
Aug 2025 - 31 Aug 2025 - Rannkly.xlsx
Sep 2025 - 30 Sep 2025 - Rannkly.xlsx
```

### **2. Import Sequence:**
1. **Start with January** → Upload → Verify Headers → Preview → Import
2. **Review Results** → Check success/error counts
3. **Verify Sample Records** → Check a few employees in Attendance page
4. **Continue to February** → Repeat process
5. **Complete all 9 months** → Sequential import

### **3. Time Estimate:**
- Per month: 3-5 minutes
- Total for 9 months: 30-45 minutes
- Plus verification: 15-20 minutes
- **Grand Total: ~1 hour for all data**

---

## 🔍 Header Visibility Features

### **Why Headers Are Crystal Clear:**

#### **1. Structured Display**
- Headers grouped by category
- Employee info separate from daily data
- Expandable accordions for details

#### **2. Visual Organization**
- Tables with clear column names
- Numbered lists showing sequence
- Color-coded chips for status

#### **3. Preview Tables**
- Sticky headers (stay visible when scrolling)
- Bold header text
- Background colors for emphasis

#### **4. Step-by-Step Verification**
- See headers before transformation
- Review data after transformation
- Confirm before import

### **Example: How Headers Are Shown**

**In Step 2 (Header Verification):**

```
┌────────────────────────────────────────────┐
│ 👥 Employee Information Headers (13)      │
├────────────────────────────────────────────┤
│ Column # │ Header Name                     │
├──────────┼─────────────────────────────────┤
│    1     │ [Employee Number] ← PRIMARY KEY │
│    2     │ [Employee Name]   ← FOR DISPLAY │
│    3     │ [Job Title]                     │
│    4     │ [Department]                    │
│   ...    │ ...                             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 📅 Daily Attendance Structure              │
├────────────────────────────────────────────┤
│ Field # │ Header      │ Will Import?       │
├─────────┼─────────────┼────────────────────┤
│    1    │ Shift Policy│ No (reference)     │
│    2    │ Shift Start │ No (reference)     │
│    3    │ Shift End   │ No (reference)     │
│    4    │ [IN] ✅     │ YES - Check-in     │
│    5    │ [OUT] ✅    │ YES - Check-out    │
│    6    │ Effective H.│ No (calculated)    │
│    7    │ Gross Hours │ No (calculated)    │
│    8    │ Shift Hours │ No (reference)     │
│    9    │ [Status] ✅ │ YES - Status       │
└────────────────────────────────────────────┘
```

**In Step 3 (Data Preview):**

```
┌─────────────┬──────────────┬────────────┬──────────┬───────────┬─────────┐
│ Employee ID │ Employee Name│ Date       │ Check-in │ Check-out │ Status  │
├─────────────┼──────────────┼────────────┼──────────┼───────────┼─────────┤
│ CODR011     │ Sangita      │ 2025-01-01 │ 09:00    │ 18:00     │ present │
│ CODR011     │ Sangita      │ 2025-01-02 │ 09:30    │ 18:00     │ late    │
│ CODR021     │ Priya        │ 2025-01-01 │ 09:15    │ 18:00     │ present │
└─────────────┴──────────────┴────────────┴──────────┴───────────┴─────────┘
       ↑              ↑             ↑           ↑           ↑          ↑
    HEADER        HEADER        HEADER      HEADER      HEADER     HEADER
```

---

## 💡 Pro Tips

### ✅ DO:
- **Verify Employee IDs** - Ensure they match your system
- **Import Sequentially** - Month by month for easier tracking
- **Check Results** - Review success/error counts after each import
- **Keep Original Files** - Save backups of your Rannkly reports
- **Test First** - Try January before importing all months

### ❌ DON'T:
- **Skip Header Verification** - Always review Step 2
- **Ignore Errors** - Fix employee ID mismatches before continuing
- **Rush Through** - Take time to review each step
- **Delete Original Files** - Keep for reference

---

## 🔧 Troubleshooting

### Issue: "Employee not found: [ID]"
**Cause:** Employee ID in Rannkly report doesn't match system
**Solution:**
1. Check employee ID in your system
2. Update Rannkly report if needed
3. Or create employee in system first

### Issue: "Headers not detected correctly"
**Cause:** File format different from expected
**Solution:**
1. Ensure Row 4 has headers
2. Check for merged cells in header row
3. Verify file is unmodified Rannkly export

### Issue: "Dates not importing"
**Cause:** Date format in IN/OUT columns not recognized
**Solution:**
- System handles multiple formats automatically
- If issue persists, check for text in time columns

### Issue: "Import taking too long"
**Cause:** Large file with many employees
**Solution:**
- Import happens in batches of 50
- Wait for completion (progress shown)
- For 40 employees × 31 days = ~1-2 minutes

---

## 📊 Sample Data From Your File

Based on your actual "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx":

```
✅ Detected Employees (sample):
- CODR011: Sangita Gopal S (Sales, Noida)
- CODR021: Priya Mishra (Sales, Noida)
- CODR022: Ashutosh Kumar (IT, Noida)
- CODR024: Vishnu Sharma (CEO, Noida)
- CODR025: Shobhit Kumar S (CTO, Noida)

📊 Structure Identified:
- Employee Info Columns: 13
- Daily Attendance Sets: 31
- Total Columns: 292
- Total Records to Import: [Employees] × 31 days
```

---

## 🎯 Success Indicators

You'll know it's working when:

✅ **Step 1:** File uploads successfully, structure detected  
✅ **Step 2:** All headers displayed clearly in organized tables  
✅ **Step 3:** Preview shows correct employee-date-time combinations  
✅ **Step 4:** High success count, few/no errors  
✅ **Verification:** Records appear correctly in Attendance page

---

## 📞 Support

### Common Questions:

**Q: Can I import multiple months at once?**
A: No, import one month at a time for better tracking and error management.

**Q: What if some employees don't exist in the system?**
A: Those records will fail with "Employee not found" error. Add employees first, then re-import.

**Q: Will it overwrite existing data?**
A: Yes, if a record exists for the same employee + date, it will be updated with new data.

**Q: How do I verify the import worked?**
A: Go to Attendance page, filter by January 2025, and check a few sample employees.

**Q: What if I need to re-import?**
A: You can re-import any month - it will update existing records with new values.

---

## 🎉 You're Ready!

Your Rannkly attendance report is perfectly structured for import. The system will:

✅ Read all 292 columns  
✅ Display every header clearly  
✅ Transform wide format to database format  
✅ Import all employee attendance for the month  
✅ Provide detailed results

**Access the import tool:**  
`http://localhost:3000/attendance/import-rannkly`

**Your file is ready:**  
`Jan 2025 - 31 Jan 2025 - Rannkly.xlsx`

**Let's import!** 🚀

---

## 📁 Files Reference

- **Your Data**: `Jan 2025 - 31 Jan 2025 - Rannkly.xlsx`
- **This Guide**: `RANNKLY_ATTENDANCE_IMPORT_GUIDE.md`
- **Import Page**: `/attendance/import-rannkly`
- **General Import**: `/attendance/import` (for simple format)

---

**Happy Importing!** 🎊

For any issues, refer to this guide or contact your system administrator.

