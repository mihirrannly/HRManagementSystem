# Attendance Data Import Guide

## Overview
The Attendance Import feature allows HR administrators to bulk import employee attendance data from Excel files (.xlsx or .xls). This is particularly useful for migrating historical attendance records or importing data from external systems.

## Access Requirements
- **Role Required**: Admin or HR
- **Access Path**: Navigate to Attendance → Import Attendance Data

## Step-by-Step Guide

### Step 1: Prepare Your Excel File

#### Required Columns
1. **Employee ID** (Required)
   - Must match existing employee IDs in the system
   - Example: `EMP001`, `EMP002`, etc.

2. **Date** (Required)
   - Format: `YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY`
   - Example: `2025-01-15`, `15/01/2025`

#### Optional Columns
3. **Check-in Time**
   - Format: `HH:MM` or `HH:MM:SS` or `HH:MM AM/PM`
   - Example: `09:30`, `09:30:00`, `9:30 AM`

4. **Check-out Time**
   - Format: Same as Check-in Time
   - Example: `18:00`, `18:00:00`, `6:00 PM`

5. **Status**
   - Valid values: `present`, `absent`, `late`, `half-day`, `holiday`, `weekend`, `on-leave`
   - If not provided, status will be auto-determined based on check-in/check-out times

#### Sample Excel Format

| Employee ID | Date       | Check-in | Check-out | Status  |
|-------------|------------|----------|-----------|---------|
| EMP001      | 2025-01-01 | 09:00    | 18:00     | present |
| EMP002      | 2025-01-01 | 09:30    | 18:00     | late    |
| EMP003      | 2025-01-01 |          |           | absent  |
| EMP001      | 2025-01-02 | 09:15    | 17:45     | present |

### Step 2: Upload File

1. Navigate to **Attendance** page
2. Click on **"Import Attendance"** button
3. Click **"Select File"** and choose your Excel file
4. Click **"Upload & Preview"** to analyze the file

**File Requirements:**
- File format: `.xlsx` or `.xls`
- Maximum file size: 10 MB
- First row must contain column headers

### Step 3: Map Columns

After uploading, you'll see:
- Your Excel headers displayed
- Suggested column mappings (auto-detected)
- Data preview showing first 10 rows

**Actions:**
1. Review the auto-detected column mappings
2. Adjust mappings if needed using the dropdown menus
3. Ensure **Employee ID** and **Date** columns are mapped (required)
4. Optional columns can be left unmapped if not available
5. Click **"Continue to Preview"**

**Visual Indicator:**
- Mapped columns are highlighted in green with a "Mapped" badge
- Unmapped columns appear in gray

### Step 4: Review & Confirm

Before importing, you'll see:
- **File Information**: Name, total rows, upload time
- **Column Mapping Summary**: How your data will be imported
- **Warning Message**: Existing records will be updated

**Important Notes:**
- Existing attendance records (same employee + date) will be **updated**
- New records will be **created**
- This action cannot be easily undone
- Review carefully before proceeding

Click **"Start Import"** to begin the import process.

### Step 5: View Results

After import completion, you'll see:
- **Success Count**: Records successfully imported
- **Failed Count**: Records that failed to import
- **Skipped Count**: Records that were skipped

**Detailed Results:**
1. **Created Records**: New attendance records added
2. **Updated Records**: Existing records that were modified
3. **Errors**: List of rows that failed with error messages

**Common Error Messages:**
- `Employee not found: [ID]` - Employee ID doesn't exist in system
- `Invalid date format: [date]` - Date format not recognized
- `Missing employee ID or date` - Required fields are empty

### Step 6: Next Steps

After successful import:
- Click **"Import Another File"** to import more data
- Click **"View Attendance Records"** to see imported data
- Navigate to Attendance page to verify records

## Data Processing Logic

### Time Calculation
- **Total Hours**: Automatically calculated from check-in to check-out
- **Regular Hours**: Up to 8 hours (standard working day)
- **Overtime Hours**: Hours beyond 8 hours

### Status Determination
1. If Status column is provided → Uses provided status
2. If no check-in/check-out times → Marked as `absent`
3. If check-in after 9:00 AM → Marked as `late`
4. Otherwise → Marked as `present`

### Late Detection
- Working hours start: 9:00 AM (configurable)
- If check-in is after 9:00 AM, marked as late
- Late minutes are automatically calculated

## Tips for Successful Import

### 1. Data Preparation
- ✅ Use consistent date format throughout the file
- ✅ Ensure employee IDs match exactly (case-sensitive)
- ✅ Remove any blank rows between data
- ✅ Use 24-hour format for times (e.g., 18:00 instead of 6:00 PM) for consistency

### 2. Large File Imports
- For files with 1000+ rows, consider splitting into smaller files
- Import month-wise for better organization
- Monitor the results for any errors

### 3. Data Validation
- Verify a small sample file first (10-20 rows)
- Check imported data in the Attendance page
- Keep a backup of your original Excel file

### 4. Common Mistakes to Avoid
- ❌ Using employee names instead of employee IDs
- ❌ Mixing date formats in the same file
- ❌ Including header rows multiple times
- ❌ Using non-existent employee IDs

## Month-wise Import Workflow

For importing data from January 2025 to September 2025:

1. **Organize Files**
   - `January_2025_Attendance.xlsx`
   - `February_2025_Attendance.xlsx`
   - ... and so on

2. **Import Process**
   - Start with January 2025
   - Review results before proceeding to next month
   - Continue sequentially through September 2025

3. **Verification**
   - After each month, verify a few sample records
   - Check attendance reports for accuracy
   - Address any errors before moving to next file

## Excel Time Format Notes

### Excel Serial Numbers
Excel stores times as decimal numbers:
- `0.375` = 9:00 AM (9/24 hours)
- `0.75` = 6:00 PM (18/24 hours)

The import system automatically handles both:
- Excel serial number format
- Text time format (HH:MM)

### Setting Time Format in Excel
1. Select time columns
2. Right-click → Format Cells
3. Choose "Time" category
4. Select format: `13:30` or `1:30 PM`

## Troubleshooting

### Issue: "File upload failed"
**Solution:**
- Check file size (must be < 10MB)
- Verify file extension (.xlsx or .xls)
- Try re-saving the file in Excel

### Issue: "Employee not found" errors
**Solution:**
- Verify employee IDs in your Excel match the system
- Check for extra spaces or special characters
- Employee must be active in the system

### Issue: "Invalid date format"
**Solution:**
- Use consistent date format: YYYY-MM-DD
- Avoid text like "Jan 15, 2025"
- Check for blank cells in date column

### Issue: Times not importing correctly
**Solution:**
- Use 24-hour format (18:00 instead of 6:00 PM)
- Format cells as "Time" in Excel
- Ensure no text characters in time columns

### Issue: Duplicate records
**Solution:**
- System updates existing records automatically
- Check if you're importing the same file twice
- Verify date ranges don't overlap

## API Endpoints

### Preview Upload
```
POST /api/attendance/import/preview
Headers: Authorization: Bearer <token>
Body: FormData with 'file' field
```

### Execute Import
```
POST /api/attendance/import/execute
Headers: Authorization: Bearer <token>
Body: {
  filePath: string,
  columnMapping: object
}
```

## Support

For issues or questions:
- Check error messages in the import results
- Review this guide for common solutions
- Contact system administrator for access issues
- Keep your Excel file for reference

## Security & Privacy

- Files are temporarily stored during import process
- Files are automatically deleted after import completion
- Only Admin and HR roles can import data
- All imports are logged with user information
- Imported records are marked as "Manual Entry"

## Best Practices

1. **Regular Backups**: Export existing data before large imports
2. **Test First**: Try with a small sample file
3. **Verify Data**: Check imported records in the system
4. **Document Changes**: Note what data was imported and when
5. **Clean Data**: Ensure source data is accurate before importing

## Version History

- **v1.0** (2025-01-10): Initial release
  - Support for Excel files (.xlsx, .xls)
  - Column mapping with auto-detection
  - Bulk create and update functionality
  - Detailed error reporting

