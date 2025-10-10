# Quick Start: Attendance Import

## 🚀 Getting Started in 5 Minutes

### Step 1: Access the Feature

1. Start your servers:
   ```bash
   npm run dev
   ```

2. Login as an **Admin** or **HR** user

3. Navigate to the import page:
   - **Option A**: Go directly to `http://localhost:3000/attendance/import`
   - **Option B**: Navigate to Attendance page and click "Import" button (when added)

### Step 2: Prepare Your Excel File

Use the provided template as a reference:
- Location: `sample-attendance-import-template.csv`
- Convert it to Excel (.xlsx) if needed

**Required Columns:**
- Employee ID (must match existing employees)
- Date (YYYY-MM-DD format recommended)

**Optional Columns:**
- Check-in Time (HH:MM format)
- Check-out Time (HH:MM format)
- Status (present/absent/late/etc.)

### Step 3: Import Your Data

1. **Upload**: Click "Select File" and choose your Excel file
2. **Preview**: Click "Upload & Preview" to see your data
3. **Map Columns**: Verify the auto-detected column mappings
4. **Review**: Check the summary before importing
5. **Import**: Click "Start Import" to process the data
6. **Results**: View success/error details

### Example Excel Format

| Employee ID | Date       | Check-in | Check-out | Status  |
|-------------|------------|----------|-----------|---------|
| EMP001      | 2025-01-01 | 09:00    | 18:00     | present |
| EMP002      | 2025-01-01 | 09:30    | 18:00     | late    |
| EMP003      | 2025-01-01 |          |           | absent  |

## 📋 Quick Tips

✅ **DO:**
- Use consistent date format (YYYY-MM-DD)
- Match employee IDs exactly
- Keep column headers in first row
- Use 24-hour time format (18:00 not 6:00 PM)

❌ **DON'T:**
- Use employee names instead of IDs
- Mix different date formats
- Include empty rows between data
- Exceed 10MB file size

## 🎯 For January-September 2025 Import

### Recommended Approach:

1. **Organize your files:**
   ```
   January_2025_Attendance.xlsx
   February_2025_Attendance.xlsx
   March_2025_Attendance.xlsx
   ... and so on
   ```

2. **Import sequentially:**
   - Start with January 2025
   - Review results
   - Continue with February, then March, etc.
   - Check a few sample records after each import

3. **Monitor progress:**
   - Note success/failure counts
   - Fix any errors before proceeding
   - Keep original files as backup

## 🔧 Troubleshooting

### "Employee not found"
→ Check that Employee ID exists in system (exact match required)

### "Invalid date format"
→ Use YYYY-MM-DD format (e.g., 2025-01-15)

### "File upload failed"
→ Ensure file is .xlsx or .xls and under 10MB

### Import button not showing
→ Ensure you're logged in as Admin or HR

## 📚 Full Documentation

For detailed information, see:
- **ATTENDANCE_IMPORT_GUIDE.md** - Complete user guide
- **ATTENDANCE_IMPORT_IMPLEMENTATION.md** - Technical details
- **test-attendance-import.js** - Testing examples

## 🎉 That's It!

You're ready to import attendance data. The system will:
- ✅ Auto-detect your column headers
- ✅ Show preview of your data
- ✅ Validate employee IDs
- ✅ Calculate working hours
- ✅ Update existing or create new records
- ✅ Provide detailed results

Happy importing! 🚀

