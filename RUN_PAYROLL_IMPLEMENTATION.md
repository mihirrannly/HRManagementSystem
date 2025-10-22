# Run Payroll Feature Implementation

## Overview
The "Run Payroll" feature has been successfully implemented in the Payroll section. This feature allows HR and Admin users to calculate and process monthly payroll for all active employees, taking into account their monthly salary and approved leaves during the payroll period.

## Features Implemented

### 1. Run Payroll UI Section ✅
- **Location**: Added to the main Payroll page (`client/src/pages/Payroll/Payroll.jsx`)
- **Access**: Only visible to HR and Admin users
- **Button**: "Run Payroll" button with play icon in the header
- **Dialog**: Comprehensive modal dialog for payroll configuration

### 2. Payroll Configuration Form ✅
The Run Payroll dialog includes:
- **Payroll Name**: Custom name for the payroll cycle
- **Month/Year Selection**: Dropdown for month and year input
- **Pay Period**: Start and end dates for the payroll period
- **Pay Date**: Date when employees will receive their salary
- **Preview Functionality**: Estimate payroll totals before processing

### 3. Payroll Calculation Logic ✅
The system calculates salary based on:
- **Employee Monthly Salary**: From employee profile (`salaryInfo.currentSalary`)
- **Attendance Data**: Present days during the payroll period
- **Approved Leaves**: Only fully approved leaves are considered
- **Proration**: Salary is prorated based on effective working days
- **Deductions**: PF, ESI, TDS calculations

### 4. Leave Integration ✅
The payroll calculation accurately reflects:
- **Approved Leaves**: Only leaves with status 'approved' are considered
- **Leave Types**: Casual, sick, marriage, bereavement leaves
- **Paid vs Unpaid**: All approved leaves are treated as paid
- **Overlap Calculation**: Proper calculation of leave days within payroll period

## Technical Implementation

### Frontend Changes
**File**: `client/src/pages/Payroll/Payroll.jsx`

#### New State Variables:
```javascript
const [runPayrollOpen, setRunPayrollOpen] = useState(false);
const [payrollProcessing, setPayrollProcessing] = useState(false);
const [payrollForm, setPayrollForm] = useState({
  name: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  payPeriodStart: '',
  payPeriodEnd: '',
  payDate: ''
});
const [payrollPreview, setPayrollPreview] = useState(null);
```

#### Key Functions:
1. **`handleRunPayroll()`**: Opens the dialog and initializes form
2. **`handlePreviewPayroll()`**: Shows estimated payroll totals
3. **`handleProcessPayroll()`**: Creates cycle and processes payroll
4. **`handlePayrollFormChange()`**: Updates form fields

#### UI Components Added:
- Run Payroll button in header (HR/Admin only)
- Comprehensive dialog with form fields
- Preview section showing estimated totals
- Processing indicators and validation

### Backend Integration
The feature integrates with existing backend endpoints:

#### 1. Create Payroll Cycle
```
POST /api/payroll/cycles
```
- Creates a new payroll cycle with specified parameters
- Validates month/year uniqueness
- Sets up pay period and pay date

#### 2. Process Payroll
```
POST /api/payroll/cycles/:id/process
```
- Processes payroll for all active employees
- Calculates salary with leave deductions
- Creates individual payslips
- Updates cycle totals

#### 3. Get Payslips
```
GET /api/payroll/payslips
```
- Retrieves generated payslips
- Supports filtering by employee, month, year
- Includes pagination

## Payroll Calculation Details

### Salary Components
1. **Basic Salary**: From employee profile
2. **HRA**: House Rent Allowance
3. **Allowances**: Other allowances
4. **Gross Pay**: Sum of all earnings

### Deductions
1. **PF Employee**: 12% of basic salary
2. **ESI Employee**: 0.75% of gross (if gross ≤ ₹25,000)
3. **TDS**: Income tax based on taxable income
4. **Total Deductions**: Sum of all deductions

### Leave Integration
```javascript
// Get approved leaves for the payroll period
const leaveRequests = await LeaveRequest.find({
  employee: employee._id,
  status: 'approved',
  startDate: { $lte: cycle.payPeriodEnd },
  endDate: { $gte: cycle.payPeriodStart }
});

// Calculate paid leave days
const paidLeaveDays = leaveRequests.reduce((total, leave) => {
  const leaveStart = moment.max(moment(leave.startDate), moment(cycle.payPeriodStart));
  const leaveEnd = moment.min(moment(leave.endDate), moment(cycle.payPeriodEnd));
  const overlapDays = leaveEnd.diff(leaveStart, 'days') + 1;
  return total + Math.max(0, overlapDays);
}, 0);
```

### Proration Logic
```javascript
// Calculate effective working days
const effectiveDays = presentDays + paidLeaveDays;
const prorationFactor = effectiveDays / workingDays;

// Apply proration to salary components
const earnings = [
  { name: 'Basic Salary', amount: basicSalary * prorationFactor },
  { name: 'HRA', amount: hra * prorationFactor },
  { name: 'Allowances', amount: allowances * prorationFactor }
];
```

## User Experience

### For HR/Admin Users:
1. **Access**: Navigate to Payroll section
2. **Run Payroll**: Click "Run Payroll" button
3. **Configure**: Fill in payroll details
4. **Preview**: See estimated totals before processing
5. **Process**: Click "Process Payroll" to generate payslips
6. **Review**: View generated payslips in the table

### Form Validation:
- All required fields must be filled
- Pay period dates must be valid
- Pay date must be after pay period end
- Month/year combination must be unique

### Error Handling:
- Network errors are caught and displayed
- Validation errors are shown inline
- Processing errors are logged and reported

## Testing

### Test Script
A test script has been created: `test-payroll-run.js`

**To run the test:**
1. Update the authorization token in the script
2. Ensure the server is running
3. Run: `node test-payroll-run.js`

### Test Scenarios:
1. **Create Payroll Cycle**: Test cycle creation with valid data
2. **Process Payroll**: Test payroll processing for all employees
3. **Verify Payslips**: Check generated payslips and calculations
4. **Leave Integration**: Verify leave deductions are applied correctly

## Security & Permissions

### Access Control:
- **HR Role**: Can run payroll and view all payslips
- **Admin Role**: Can run payroll and view all payslips
- **Employee Role**: Can only view their own payslips

### Data Validation:
- Server-side validation for all inputs
- Authorization checks for all endpoints
- Audit trail for payroll processing

## Future Enhancements

### Potential Improvements:
1. **Batch Processing**: Process payroll in smaller batches
2. **Custom Components**: Allow custom salary components
3. **Advanced Deductions**: More sophisticated tax calculations
4. **Reporting**: Detailed payroll reports and analytics
5. **Notifications**: Email notifications for payroll completion
6. **Approval Workflow**: Multi-level approval for payroll processing

## Troubleshooting

### Common Issues:
1. **No Employees Found**: Ensure employees have active status
2. **Missing Salary Data**: Check employee salary information
3. **Leave Calculation Errors**: Verify leave approval status
4. **Permission Denied**: Ensure user has HR/Admin role

### Debug Steps:
1. Check server logs for error details
2. Verify employee data completeness
3. Confirm leave approval workflow
4. Test with sample data first

## Conclusion

The Run Payroll feature has been successfully implemented with:
- ✅ Complete UI implementation
- ✅ Backend integration with existing payroll system
- ✅ Leave integration with proper deductions
- ✅ Comprehensive form validation
- ✅ Error handling and user feedback
- ✅ Security and permission controls
- ✅ Testing framework

The system now provides a complete payroll processing workflow that accurately calculates employee salaries while properly accounting for approved leaves during the payroll period.
