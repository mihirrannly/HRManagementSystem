# Attendance Export System - Complete Guide

## Overview
The attendance export system allows you to export attendance reports in **Excel** or **PDF** format with comprehensive filtering options. You can export data for single employees or all employees, with flexible date range selection.

## Features

### 1. **Export Formats**
- **Excel (.xlsx)**: Detailed spreadsheet with all attendance data, perfect for further analysis
- **PDF (.pdf)**: Formatted report with attendance summaries, ideal for printing and sharing

### 2. **Employee Selection**
- **All Employees**: Export attendance for all active employees
- **Single Employee**: Export attendance for a specific employee by selecting from the dropdown

### 3. **Time Period Options**
- **Daily**: Export today's attendance
- **Weekly**: Export current week's attendance (Monday to Sunday)
- **Monthly**: Export current month's attendance
- **Custom Date Range**: Select any start and end date for flexible reporting

### 4. **Data Included in Exports**

#### Excel Export Includes:
- Employee ID
- Employee Name
- Department
- Designation
- Daily attendance for each date:
  - Status (PRESENT, LATE, ABSENT, WEEKEND, ON-LEAVE)
  - Check-in time (HH:mm format)
  - Check-out time (HH:mm format)
  - Total hours worked
- Summary columns:
  - Total Present Days
  - Total Absent Days
  - Total Late Days
  - Total Hours Worked

#### PDF Export Includes:
- Employee details (ID, Name, Department, Designation)
- Daily attendance records with:
  - Date and day
  - Status
  - Check-in and check-out times
  - Hours worked
- Summary statistics per employee:
  - Present days count
  - Absent days count
  - Late days count
  - Total hours worked

## How to Use

### Step 1: Access the Export Feature
1. Navigate to the **Attendance** page
2. Click on the **Monthly Grid** tab
3. Click the **"Export Report"** button in the header controls

### Step 2: Configure Export Settings

#### Choose Export Format
- Select **Excel** for spreadsheet format with detailed data
- Select **PDF** for formatted report suitable for printing

#### Select Employee(s)
- Choose **"All Employees"** to export data for all active employees
- Or select a specific employee from the dropdown list

#### Choose Time Period
- **Today**: Exports today's attendance only
- **This Week**: Exports the current week (Mon-Sun)
- **This Month**: Exports the currently selected month
- **Custom Date Range**: 
  - Select this option to choose specific dates
  - Enter Start Date and End Date
  - Date range picker will appear

### Step 3: Preview Export Details
Before exporting, you'll see a summary showing:
- Selected date range (e.g., "01 Jan 2025 to 31 Jan 2025 (31 days)")
- Number of employees to be included
- Selected employee (if single employee export)

### Step 4: Export
1. Click the **"Export"** button
2. The file will be automatically downloaded to your default downloads folder
3. Filename format: `Attendance_Report_YYYY-MM-DD_to_YYYY-MM-DD.[xlsx|pdf]`

## Access Permissions

### Who Can Export?
- **Admin**: Can export all employees' attendance
- **HR**: Can export all employees' attendance
- **Manager**: Can export their team members' attendance only
- **Employee**: Cannot access export feature (feature is available only in Monthly Grid view which requires admin/hr/manager access)

## Use Cases

### 1. Monthly Payroll Processing
- Export: **Monthly**, **All Employees**, **Excel**
- Use the Excel file to calculate salaries based on hours worked and attendance status

### 2. Individual Employee Report
- Export: **Monthly**, **Single Employee**, **PDF**
- Generate a formatted report for performance reviews or HR records

### 3. Weekly Team Summary
- Export: **Weekly**, **All Employees**, **Excel**
- Track team attendance patterns and identify issues

### 4. Custom Period Analysis
- Export: **Custom Date Range**, **All Employees**, **Excel**
- Analyze attendance patterns for specific periods (e.g., before/after holidays)

### 5. Compliance Reports
- Export: **Monthly**, **All Employees**, **PDF**
- Generate professional reports for audits and compliance

## Excel File Format

### Sheet Structure:
```
Row 1: Attendance Report - [Date Range]
Row 2: [Empty]
Row 3: Headers (Employee ID, Name, Department, Designation, Date columns, Summary columns)
Row 4+: Employee data
```

### Cell Format for Daily Attendance:
```
STATUS | In: HH:mm | Out: HH:mm | Hrs: X.XX
```

Example:
```
PRESENT | In: 10:15 | Out: 19:30 | Hrs: 9.25
LATE | In: 10:45 | Out: 19:00 | Hrs: 8.25
ABSENT
WEEKEND
```

### Column Widths:
- Employee ID: 15 characters
- Employee Name: 25 characters
- Department: 20 characters
- Designation: 20 characters
- Date columns: 35 characters (to fit attendance details)
- Summary columns: 15 characters

## PDF File Format

### Layout:
- **Landscape orientation** (A4 size)
- **Per-employee sections** with:
  - Employee header (bold, larger font)
  - Department and designation
  - Daily attendance list (7 days per line for readability)
  - Summary statistics
  - Separator line between employees

### Font Sizes:
- Title: 16pt (Helvetica-Bold)
- Date range: 12pt
- Employee name: 11pt (Helvetica-Bold)
- Details: 9pt
- Daily attendance: 8pt

## Tips and Best Practices

### For Large Date Ranges
- If exporting more than 3 months of data, consider:
  - Using Excel format for better data handling
  - Breaking into smaller periods for PDF exports
  - Exporting specific employees instead of all employees

### For Quick Reports
- Use the **"This Month"** preset for fastest monthly reports
- Use **"This Week"** for weekly team meetings
- Save time by using presets instead of custom date ranges

### For Data Analysis
- Export to **Excel** for:
  - Pivot tables
  - Conditional formatting
  - Data filtering and sorting
  - Chart creation
  - Integration with other tools

### For Sharing and Printing
- Export to **PDF** for:
  - Email attachments
  - Printing physical copies
  - Archiving records
  - Read-only distribution

## Troubleshooting

### Export Button is Disabled
**Cause**: No attendance data available for the selected month
**Solution**: 
- Import attendance data first
- Check if the correct month is selected

### Export Takes Too Long
**Cause**: Large date range with many employees
**Solution**:
- Reduce the date range
- Export specific employees instead of all
- Export in smaller batches

### Downloaded File Won't Open
**Cause**: Browser download interruption or file corruption
**Solution**:
- Try exporting again
- Check your internet connection
- Try a different browser
- Ensure you have Excel/PDF viewer installed

### Missing Employee Data
**Cause**: Employee may be inactive or not have attendance for the period
**Solution**:
- Check employee status (active/inactive)
- Verify attendance has been imported for the period
- Check the date range selected

### Permission Denied Error
**Cause**: Insufficient access rights
**Solution**:
- Contact your admin/HR
- Verify your role has export permissions
- Managers can only export their team's data

## Technical Details

### Backend API
- **Endpoint**: `GET /api/attendance/export`
- **Required Parameters**:
  - `format`: 'excel' or 'pdf'
  - `startDate`: ISO 8601 date string
  - `endDate`: ISO 8601 date string
- **Optional Parameters**:
  - `employeeId`: Specific employee ID or 'all'
  - `period`: 'daily', 'weekly', 'monthly', or 'custom'

### File Generation Libraries
- **Excel**: `xlsx` library (SheetJS)
- **PDF**: `pdfkit` library

### Performance
- Excel exports: ~100ms per employee per month
- PDF exports: ~200ms per employee per month
- Recommended max: 50 employees for 1 month in a single export

## Future Enhancements

Potential features for future versions:
- Email export directly to recipients
- Schedule automatic exports
- Export templates customization
- Multiple export formats (CSV, JSON)
- Export filters (by department, designation, status)
- Graphical charts in PDF exports
- Comparison reports (month-over-month)

## Support

For issues or questions:
1. Check this documentation first
2. Contact your HR administrator
3. Submit a support ticket with:
   - Export settings used
   - Date range
   - Number of employees
   - Error message (if any)
   - Browser and version

---

**Last Updated**: October 2025
**Version**: 1.0.0


