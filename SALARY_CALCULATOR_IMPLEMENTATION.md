# Salary Calculator Implementation

## Overview

This document describes the implementation of the salary calculation system based on your exact specifications. The system calculates salary breakdown from CTC (Cost to Company) using the precise percentages you provided.

## Salary Breakdown Specification

Based on your requirements, the salary is calculated as follows:

### Part A: Gross Salary Components
- **Basic Salary**: 60% of gross salary
- **HRA (House Rent Allowance)**: 24% of gross salary  
- **Conveyance Allowance**: 9% of gross salary
- **Special Allowance**: 7% of gross salary

### Part B: Employer's Contribution
- **PF (Provident Fund)**: ₹0
- **Gratuity**: ₹0
- **EPIC**: ₹0

### Part C: Variable Pay
- **Variable Pay**: ₹0

### Total CTC
CTC = Part A + Part B + Part C = Gross Salary (since B and C are 0)

## Implementation Details

### Backend Implementation

#### 1. Salary Calculator Utility (`server/utils/salaryCalculator.js`)

**Key Functions:**
- `calculateSalaryBreakdown(ctc)` - Main calculation function
- `calculateFromMonthlyGross(monthlyGross)` - Calculate from monthly gross
- `calculateFromBasic(basicSalary)` - Calculate from basic salary
- `validateBreakdown(breakdown)` - Validate calculated breakdown
- `formatSalary(amount, showCurrency)` - Format currency display
- `getSalaryBreakdownTable(ctc)` - Generate breakdown table

**Example Usage:**
```javascript
const { calculateSalaryBreakdown } = require('./utils/salaryCalculator');

// Calculate for ₹9,00,000 annual CTC
const breakdown = calculateSalaryBreakdown(900000);

console.log(breakdown.monthly.basic);    // ₹45,000
console.log(breakdown.monthly.hra);       // ₹18,000
console.log(breakdown.monthly.gross);     // ₹75,000
```

#### 2. API Endpoints (`server/routes/salaryCalculator.js`)

**Available Endpoints:**
- `POST /api/salary-calculator/calculate` - Calculate salary breakdown
- `GET /api/salary-calculator/breakdown-table/:ctc` - Get formatted breakdown table
- `POST /api/salary-calculator/validate` - Validate salary breakdown
- `GET /api/salary-calculator/format/:amount` - Format salary amount

**Example API Call:**
```javascript
// Calculate salary breakdown
const response = await fetch('/api/salary-calculator/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    ctc: 900000,
    calculationType: 'ctc'
  })
});

const data = await response.json();
console.log(data.data.monthly.basic); // ₹45,000
```

#### 3. Database Integration (`server/models/SalaryDetails.js`)

**New Methods Added:**
- `SalaryDetails.createFromCTC(employeeId, ctc, month, year, additionalData)` - Create salary details from CTC
- `salaryDetails.recalculateFromCTC(ctc)` - Recalculate existing salary details

**Example Usage:**
```javascript
// Create salary details for an employee
const salaryDetails = await SalaryDetails.createFromCTC(
  employeeId, 
  900000, // Annual CTC
  1,      // January
  2024    // Year
);

// Recalculate existing salary details
await salaryDetails.recalculateFromCTC(1000000);
```

### Frontend Implementation

#### 1. Salary Calculator Component (`client/src/components/SalaryCalculator/SalaryCalculator.jsx`)

**Features:**
- Input field for CTC amount
- Calculation type selection (CTC, Monthly Gross, Basic Salary)
- Real-time calculation and display
- Formatted currency display
- Detailed breakdown table
- Responsive design

**Key Features:**
- **Input Options**: CTC (Annual), Monthly Gross, Basic Salary
- **Real-time Calculation**: Instant calculation on input change
- **Detailed Breakdown**: Shows all components with percentages
- **Formatted Display**: Indian currency formatting
- **Responsive Design**: Works on all screen sizes

#### 2. Navigation Integration

The Salary Calculator is accessible via:
- **Navigation Menu**: "Salary Calculator" under Payroll section
- **URL**: `/salary-calculator`
- **Access**: Admin, HR, and Finance roles

## Usage Examples

### Example 1: Calculate from Annual CTC

**Input:** ₹9,00,000 (Annual CTC)
**Output:**
- Monthly Gross: ₹75,000
- Basic Salary: ₹45,000 (60%)
- HRA: ₹18,000 (24%)
- Conveyance: ₹6,750 (9%)
- Special Allowance: ₹5,250 (7%)

### Example 2: Calculate from Monthly Gross

**Input:** ₹75,000 (Monthly Gross)
**Output:**
- Annual CTC: ₹9,00,000
- Basic Salary: ₹45,000 (60%)
- HRA: ₹18,000 (24%)
- Conveyance: ₹6,750 (9%)
- Special Allowance: ₹5,250 (7%)

### Example 3: Calculate from Basic Salary

**Input:** ₹45,000 (Monthly Basic)
**Output:**
- Monthly Gross: ₹75,000
- Annual CTC: ₹9,00,000
- HRA: ₹18,000 (24%)
- Conveyance: ₹6,750 (9%)
- Special Allowance: ₹5,250 (7%)

## Testing

### Test Script (`test-salary-calculator.js`)

The implementation includes a comprehensive test script that verifies:
- ✅ Exact percentage calculations
- ✅ Monthly and yearly breakdowns
- ✅ Currency formatting
- ✅ Different CTC values
- ✅ Breakdown table generation

**Run Tests:**
```bash
node test-salary-calculator.js
```

### Test Results

All tests pass with 100% accuracy:
- Monthly breakdown matches specification exactly
- Yearly calculations are correct (monthly × 12)
- Percentage breakdowns are accurate
- Currency formatting works correctly

## API Documentation

### POST /api/salary-calculator/calculate

**Request Body:**
```json
{
  "ctc": 900000,
  "calculationType": "ctc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salary breakdown calculated successfully",
  "data": {
    "monthly": {
      "basic": 45000,
      "hra": 18000,
      "conveyanceAllowance": 6750,
      "specialAllowance": 5250,
      "gross": 75000,
      "ctc": 75000
    },
    "yearly": {
      "basic": 540000,
      "hra": 216000,
      "conveyanceAllowance": 81000,
      "specialAllowance": 63000,
      "gross": 900000,
      "ctc": 900000
    },
    "formatted": {
      "monthly": {
        "basic": "₹45,000",
        "hra": "₹18,000",
        "conveyanceAllowance": "₹6,750",
        "specialAllowance": "₹5,250",
        "gross": "₹75,000",
        "ctc": "₹75,000"
      }
    }
  }
}
```

## Integration with Existing System

### Payroll Integration

The salary calculator integrates with the existing payroll system:

1. **SalaryDetails Model**: Enhanced with new calculation methods
2. **Payroll Processing**: Uses calculated breakdowns for payslip generation
3. **Employee Records**: Can update employee salary information

### Database Schema

The existing `SalaryDetails` schema supports the new calculation:
- `earnings.basicSalary` - Basic salary (60% of gross)
- `earnings.hra` - HRA (24% of gross)
- `earnings.conveyanceAllowance` - Conveyance (9% of gross)
- `earnings.specialAllowance` - Special allowance (7% of gross)
- `grossSalary` - Total gross salary
- `totalCTC` - Cost to Company

## Security and Access Control

### Authentication
- All API endpoints require authentication
- JWT token validation

### Authorization
- **Admin**: Full access to all features
- **HR**: Full access to all features
- **Finance**: Full access to all features
- **Manager/Employee**: No access (restricted)

## Future Enhancements

### Potential Improvements
1. **Tax Calculations**: Add TDS and other tax calculations
2. **Deductions**: Add PF, ESI, and other statutory deductions
3. **Variable Pay**: Support for variable pay components
4. **Multiple Structures**: Support for different salary structures
5. **Export Features**: Export calculations to Excel/PDF
6. **Bulk Calculations**: Calculate for multiple employees

### Configuration Options
1. **Custom Percentages**: Allow customization of component percentages
2. **Multiple Structures**: Support different salary structures per employee
3. **Regional Settings**: Support different currency and formatting options

## Troubleshooting

### Common Issues

1. **Calculation Mismatch**: Ensure CTC input is annual, not monthly
2. **Permission Denied**: Check user role and authentication
3. **API Errors**: Verify request format and authentication token

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG_SALARY_CALCULATOR=true
```

## Conclusion

The salary calculator implementation provides:
- ✅ Exact calculation matching your specifications
- ✅ Flexible input options (CTC, Monthly Gross, Basic)
- ✅ Comprehensive API endpoints
- ✅ User-friendly frontend interface
- ✅ Full integration with existing payroll system
- ✅ Comprehensive testing and validation

The system is ready for production use and can handle all salary calculation requirements based on your exact specifications.
