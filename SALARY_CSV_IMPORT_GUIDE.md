# Salary Management CSV Import Guide

## Overview
This guide explains how to import salary data for multiple employees using CSV files in the Rannkly HR Management System.

## CSV Format

### Required Columns
The following columns are **required** for a successful import:

- `employeeId` - Employee ID (e.g., CODR001, CODR002)
- `month` - Month number (1-12)
- `year` - Year (e.g., 2025)

### Optional Columns

#### Earnings (All optional, default to 0 if not provided)
- `basicSalary` - Basic salary amount
- `hra` - House Rent Allowance
- `conveyanceAllowance` - Conveyance/Transport allowance
- `medicalAllowance` - Medical allowance
- `specialAllowance` - Special allowance
- `performanceBonus` - Performance bonus
- `overtimePay` - Overtime payment
- `otherAllowances` - Other allowances

#### Deductions (All optional, default to 0 if not provided)
- `pf` or `providentFund` - Provident Fund deduction
- `esi` or `ESI` - Employee State Insurance
- `professionalTax` or `PT` - Professional Tax
- `incomeTax` or `TDS` - Income Tax/TDS
- `loanRepayment` - Loan repayment deduction
- `advanceDeduction` - Advance deduction
- `lopAmount` - Loss of Pay amount
- `lop_days` - Loss of Pay days
- `otherDeductions` - Other deductions

#### Attendance (All optional, default to 0 if not provided)
- `totalWorkingDays` or `Working_Days` - Total working days in the month
- `daysPresent` or `Present_Days` - Days employee was present
- `daysAbsent` or `Absent_Days` - Days employee was absent
- `paidLeaves` or `Paid_Leaves` - Paid leave days taken
- `unpaidLeaves` or `Unpaid_Leaves` - Unpaid leave days taken

#### Payment Information (Optional)
- `paymentStatus` - Status: pending, processing, paid, on-hold, cancelled (default: pending)
- `paymentDate` - Payment date (format: YYYY-MM-DD)
- `paymentMode` - Mode: bank-transfer, cheque, cash, upi (default: bank-transfer)
- `paymentReference` - Payment reference number
- `remarks` - Any remarks or notes

## Column Name Variations

The system supports multiple column name formats for flexibility:

### Employee ID
- `employeeId`
- `EmployeeID`
- `employee_id`

### Basic Salary
- `basicSalary`
- `basic_salary`
- `Basic`

### Provident Fund
- `providentFund`
- `pf`
- `PF`

And similar variations for other fields...

## Sample CSV Format

```csv
employeeId,month,year,basicSalary,hra,conveyanceAllowance,medicalAllowance,specialAllowance,performanceBonus,overtimePay,otherAllowances,pf,esi,professionalTax,incomeTax,loanRepayment,advanceDeduction,lopAmount,otherDeductions,totalWorkingDays,daysPresent,paidLeaves,paymentStatus,paymentMode,remarks
CODR001,1,2025,50000,10000,2000,1500,5000,0,0,0,6000,0,200,5000,0,0,0,0,22,22,0,pending,bank-transfer,Sample record
CODR002,1,2025,45000,9000,2000,1500,4000,5000,0,0,5400,0,200,4000,0,0,0,0,22,21,1,paid,bank-transfer,Paid on time
CODR003,1,2025,60000,12000,2000,1500,6000,10000,2000,0,7200,0,200,7000,0,0,0,0,22,22,0,pending,bank-transfer,
```

## Import Process

1. **Prepare your CSV file**
   - Use a spreadsheet application (Excel, Google Sheets, etc.)
   - Ensure column headers match the format above
   - Save as CSV (Comma-separated values)

2. **Download Template** (Recommended)
   - In the Salary Management page, click "Download CSV Template"
   - This provides the correct format with sample data
   - Fill in your employee data

3. **Upload CSV**
   - Click "Import from CSV" button
   - Select your CSV file
   - Click "Upload & Import"

4. **Review Results**
   - The system will show:
     - Total records processed
     - Successful imports
     - Failed imports with error details

## Important Notes

### Calculations
- **Gross Salary** is automatically calculated as the sum of all earnings
- **Total Deductions** is automatically calculated as the sum of all deductions
- **Net Salary** = Gross Salary - Total Deductions

### Duplicate Records
- If a salary record already exists for an employee for a specific month/year, it will be **updated** with new values
- No duplicate records will be created

### Validation Rules
1. Employee must exist in the system (by Employee ID)
2. Month must be between 1-12
3. Year must be a valid year
4. All amount fields must be numeric (0 or positive)

### Error Handling
- Invalid employee IDs will be skipped with an error message
- Invalid data formats will be reported
- Successfully processed records will be saved even if some records fail

## Tips for Best Results

1. **Test with Small Batch First**
   - Start with 5-10 records to verify format
   - Check results before importing large files

2. **Verify Employee IDs**
   - Ensure all employee IDs exist in the system
   - Use the exact format (e.g., CODR001)

3. **Use Consistent Date Formats**
   - For payment dates, use: YYYY-MM-DD (e.g., 2025-01-15)

4. **Check Data Types**
   - Amount fields: Numbers only (no currency symbols)
   - Status fields: Use exact values (pending, paid, etc.)

5. **Backup Before Import**
   - Consider backing up existing data before large imports
   - Review import summary carefully

## Common Errors and Solutions

### "Employee not found"
- **Cause**: Employee ID doesn't exist in system
- **Solution**: Verify employee ID is correct and employee exists

### "Salary record already exists"
- **Cause**: Record for that employee and month already exists
- **Solution**: This is normal - the system will update the existing record

### "Invalid month or year"
- **Cause**: Month not between 1-12 or invalid year format
- **Solution**: Check month and year values

### "Invalid payment status"
- **Cause**: Status value doesn't match allowed values
- **Solution**: Use: pending, processing, paid, on-hold, or cancelled

## Support

For any issues with CSV import:
1. Check this guide thoroughly
2. Download and examine the CSV template
3. Verify your data format matches the template
4. Contact system administrator if issues persist

---

**Last Updated**: January 2025
**System Version**: 1.0

