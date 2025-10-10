# Exit Management CSV Import Guide

## 📥 How to Import Historical Exit Data

This guide will help you import your existing exit records from a CSV file into the Exit Management system.

---

## 🚀 Quick Start

### **Step 1: Prepare Your CSV File**
- Use the provided template: `EXIT_IMPORT_TEMPLATE.csv`
- Or format your existing data to match the required columns

### **Step 2: Import the File**
1. Go to **Exit Management** page
2. Click the **"📤 Import CSV"** button (top right, next to Export)
3. Select your CSV file
4. Wait for the import to complete
5. Check the success message

---

## 📋 CSV Format Requirements

### **Required Columns:**

| Column Name | Description | Required | Format | Example |
|------------|-------------|----------|---------|---------|
| **Employee ID** | Unique employee identifier | ✅ Yes | Text | EMP001 |
| **Employee Name** | Full name of employee | ✅ Yes | Text | John Doe |
| **Last Working Date** | Final day of employment | ✅ Yes | Date (YYYY-MM-DD) | 2024-12-31 |

### **Optional Columns:**

| Column Name | Description | Required | Format | Example |
|------------|-------------|----------|---------|---------|
| **Department** | Employee's department | ❌ No | Text | Engineering |
| **Designation** | Job title | ❌ No | Text | Senior Developer |
| **Exit Type** | Type of exit | ❌ No | Text | resignation |
| **Resignation Date** | Date resignation submitted | ❌ No | Date (YYYY-MM-DD) | 2024-12-01 |
| **Reason** | Brief reason for leaving | ❌ No | Text | Better opportunity |
| **Detailed Reason** | Comprehensive explanation | ❌ No | Text | Found better role... |
| **Notice Period** | Days of notice given | ❌ No | Number | 30 |
| **Status** | Current exit status | ❌ No | Text | completed |

---

## 📝 Column Details

### **Employee ID** ✅ Required
- **Format:** Text string
- **Example:** `EMP001`, `E-123`, `STAFF-456`
- **Notes:** 
  - Must be unique
  - System will try to match with existing employees
  - If match found, will auto-fill department & designation

### **Employee Name** ✅ Required
- **Format:** Text string
- **Example:** `John Doe`, `Jane Smith`
- **Notes:** 
  - Can be first + last name
  - Will be used as-is if no match found

### **Last Working Date** ✅ Required
- **Format:** Date (YYYY-MM-DD recommended)
- **Example:** `2024-12-31`, `12/31/2024`
- **Notes:** 
  - Must be a valid date
  - Can be past or future date
  - Used to determine if exit is completed

### **Exit Type** (Optional)
- **Format:** Text (case insensitive)
- **Valid Values:**
  - `resignation` - Employee resigned
  - `termination` - Terminated by company
  - `retirement` - Retired
  - `end_of_contract` - Contract ended
  - `other` - Other reasons
- **Default:** `other` if not provided or invalid

### **Status** (Optional)
- **Format:** Text (case insensitive)
- **Valid Values:**
  - `initiated` - Exit request received
  - `in_progress` - Notice period active
  - `pending_clearance` - Clearances in progress
  - `pending_approval` - Final review needed
  - `completed` - Exit finalized
  - `cancelled` - Exit cancelled
- **Default:** `completed` (for historical imports)
- **Recommendation:** Use `completed` for past exits

### **Notice Period** (Optional)
- **Format:** Number (days)
- **Example:** `30`, `60`, `90`, `0`
- **Default:** `0` if not provided

---

## 📄 CSV Template

```csv
Employee ID,Employee Name,Department,Designation,Exit Type,Last Working Date,Resignation Date,Reason,Detailed Reason,Notice Period,Status
EMP001,John Doe,Engineering,Senior Developer,resignation,2024-12-31,2024-12-01,Better opportunity,Found a senior role with better compensation,30,completed
EMP002,Jane Smith,Marketing,Marketing Manager,termination,2024-11-15,2024-11-01,Performance issues,Consistent underperformance,14,completed
```

---

## 🎯 Column Name Variations Supported

The import system is flexible and accepts different column name formats:

### **Employee ID:**
- `Employee ID`
- `employeeId`
- `employee_id`

### **Employee Name:**
- `Employee Name`
- `employeeName`
- `employee_name`

### **Last Working Date:**
- `Last Working Date`
- `lastWorkingDate`
- `last_working_date`

### **Exit Type:**
- `Exit Type`
- `exitType`
- `exit_type`

### **Reason:**
- `Reason`
- `Reason for Leaving`
- `reasonForLeaving`
- `reason`

*(Similar variations work for other columns)*

---

## 🔄 Import Process

### **What Happens During Import:**

1. **File Upload**
   - CSV file is uploaded to server
   - File is validated

2. **CSV Parsing**
   - System reads each row
   - Columns are mapped to database fields

3. **Data Validation**
   - Required fields are checked
   - Dates are validated
   - Exit types are validated

4. **Employee Matching**
   - System searches for employee by ID
   - If found, auto-fills missing data:
     - Department
     - Designation
     - Other employee details

5. **Record Creation**
   - **New Records:** Creates exit record
   - **Existing Records:** Updates the record
   - Clearance structure is initialized

6. **Result Summary**
   - Shows number of successful imports
   - Shows number of failures
   - Lists error details in console

---

## ✅ Success Indicators

After successful import, you'll see:

```
✅ Successfully imported 25 exit records!
```

If some records failed:

```
⚠️ 3 records failed to import. Check console for details.
```

---

## ❌ Common Errors & Solutions

### **Error: "Employee ID is required"**
- **Cause:** Missing or empty Employee ID column
- **Solution:** Ensure all rows have Employee ID filled

### **Error: "Employee Name is required"**
- **Cause:** Missing or empty Employee Name column
- **Solution:** Ensure all rows have Employee Name filled

### **Error: "Valid Last Working Date is required"**
- **Cause:** 
  - Missing date
  - Invalid date format
  - Unparseable date
- **Solution:** 
  - Use format: `YYYY-MM-DD` (e.g., `2024-12-31`)
  - Alternative: `MM/DD/YYYY` (e.g., `12/31/2024`)
  - Ensure date is valid

### **Error: "Invalid Exit Type"**
- **Cause:** Exit type not in valid list
- **Solution:** System automatically defaults to `other`

---

## 🎯 Best Practices

### **Before Import:**
1. **Backup:** Export current data as backup
2. **Validate:** Check CSV in Excel/Google Sheets
3. **Format:** Ensure dates are correct
4. **Remove:** Delete any test rows
5. **Save:** Save as UTF-8 encoded CSV

### **CSV Preparation:**
1. **Headers:** First row must contain column names
2. **No Empty Rows:** Remove blank rows
3. **Consistent Dates:** Use same date format throughout
4. **Quotes:** Text with commas should be in quotes
5. **Encoding:** Save as UTF-8 (not UTF-8 BOM)

### **Data Quality:**
1. **Employee IDs:** Must be unique
2. **Dates:** Must be valid calendar dates
3. **Exit Types:** Use standard values
4. **Status:** Use `completed` for past exits
5. **Completeness:** More data = better records

---

## 📊 Import Results

### **Success Message:**
```
Message: "Import completed: 23 records imported, 2 failed"
Imported: 23
Failed: 2
Total: 25
```

### **Console Details (for failures):**
```javascript
Failed records: [
  {
    row: 5,
    error: "Valid Last Working Date is required",
    data: { Employee ID: "EMP005", ... }
  },
  {
    row: 12,
    error: "Employee Name is required",
    data: { Employee ID: "EMP012", ... }
  }
]
```

---

## 🔍 Verification After Import

### **Check Imported Data:**
1. Go to **Exit Management**
2. Click **"Exited Employees"** tab
3. Verify records appear in list
4. Click on records to check details
5. Ensure all fields populated correctly

### **What Gets Auto-Created:**
For each imported record, the system creates:
- ✅ Basic exit information
- ✅ 5 clearance sections (IT, HR, Finance, Manager, Admin)
- ✅ 20 clearance items (4 per section)
- ✅ Audit log entry
- ✅ Timestamps

---

## 🆕 Duplicate Handling

### **Existing Records:**
- System checks if Employee ID already exists
- **If exists:** Updates the existing record
- **If new:** Creates new record

### **Prevention:**
- Each employee can have only one exit record
- Subsequent imports will update, not duplicate

---

## 📈 Large Imports

### **Performance:**
- Can handle 100+ records
- Processing time: ~1-2 seconds per record
- Recommended batch size: 100-200 records

### **For Large Datasets (500+):**
1. Split CSV into batches of 200 records
2. Import each batch separately
3. Wait for each batch to complete
4. Verify each batch before next

---

## 🛠️ Troubleshooting

### **Issue: Import Button Not Working**
- **Check:** Browser console for errors
- **Solution:** Refresh page, try again

### **Issue: File Upload Fails**
- **Check:** File size (should be <5MB)
- **Check:** File format (must be .csv)
- **Solution:** Try re-saving CSV

### **Issue: All Records Fail**
- **Check:** CSV format matches template
- **Check:** Column names are correct
- **Check:** No encoding issues
- **Solution:** Re-download template, copy data

### **Issue: Partial Import Success**
- **Check:** Console for specific errors
- **Fix:** Errors in failed rows
- **Re-import:** Only the fixed rows

---

## 📋 Example CSV Files

### **Minimal CSV (Required Fields Only):**
```csv
Employee ID,Employee Name,Last Working Date
EMP001,John Doe,2024-12-31
EMP002,Jane Smith,2024-11-15
EMP003,Mike Johnson,2024-10-20
```

### **Complete CSV (All Fields):**
```csv
Employee ID,Employee Name,Department,Designation,Exit Type,Last Working Date,Resignation Date,Reason,Detailed Reason,Notice Period,Status
EMP001,John Doe,Engineering,Senior Developer,resignation,2024-12-31,2024-12-01,Better opportunity,Found a senior role with better compensation and growth opportunities,30,completed
```

---

## 🎓 Training Steps

### **For HR Team:**
1. Download template: `EXIT_IMPORT_TEMPLATE.csv`
2. Practice with 3-5 test records
3. Verify import results
4. Delete test records
5. Import actual data

### **For Large Teams:**
1. Start with 10 records (pilot)
2. Verify accuracy
3. Import next batch
4. Continue until complete

---

## ✅ Checklist Before Import

- [ ] CSV file prepared with correct format
- [ ] All required columns present
- [ ] Employee IDs are unique
- [ ] Dates are in valid format
- [ ] Exit types are valid values
- [ ] No empty rows in CSV
- [ ] File saved as UTF-8 CSV
- [ ] Backup of current data taken
- [ ] Tested with small batch first
- [ ] Ready to verify after import

---

## 📞 Support

### **Need Help?**
- **Email:** hr@company.com
- **Check:** Browser console for detailed errors
- **Review:** This guide for solutions

### **Report Issues:**
Include in your report:
1. Sample CSV row that failed
2. Error message from console
3. Screenshot of import attempt
4. CSV file format details

---

## 🎉 Success!

Once imported successfully:
- ✅ All historical exits are in the system
- ✅ Records appear in "Exited Employees" tab
- ✅ Full details available for each exit
- ✅ Exportable for reports
- ✅ Searchable and filterable
- ✅ Complete audit trail

---

**Template File:** `EXIT_IMPORT_TEMPLATE.csv`  
**Import Button:** Exit Management → Top Right → "📤 Import CSV"  
**Last Updated:** January 2025  

---

*Import your historical exit data in minutes! 🚀*

