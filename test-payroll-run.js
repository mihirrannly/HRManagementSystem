const axios = require('axios');

// Test script for Run Payroll functionality
const testPayrollRun = async () => {
  try {
    console.log('🧪 Testing Run Payroll functionality...\n');

    // Test 1: Create a payroll cycle
    console.log('1. Creating payroll cycle...');
    const cycleData = {
      name: 'Test Payroll January 2024',
      month: 1,
      year: 2024,
      payPeriodStart: '2024-01-01',
      payPeriodEnd: '2024-01-31',
      payDate: '2024-02-05'
    };

    const cycleResponse = await axios.post('http://localhost:5000/api/payroll/cycles', cycleData, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Payroll cycle created:', cycleResponse.data.cycle._id);

    // Test 2: Process payroll for the cycle
    console.log('\n2. Processing payroll...');
    const processResponse = await axios.post(
      `http://localhost:5000/api/payroll/cycles/${cycleResponse.data.cycle._id}/process`,
      {},
      {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payroll processed successfully');
    console.log('   - Processed employees:', processResponse.data.processedEmployees);
    console.log('   - Total gross pay:', processResponse.data.cycle.totalGrossPay);
    console.log('   - Total deductions:', processResponse.data.cycle.totalDeductions);
    console.log('   - Total net pay:', processResponse.data.cycle.totalNetPay);

    // Test 3: Get payslips
    console.log('\n3. Fetching payslips...');
    const payslipsResponse = await axios.get('http://localhost:5000/api/payroll/payslips', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('✅ Payslips retrieved:', payslipsResponse.data.payslips.length);
    
    if (payslipsResponse.data.payslips.length > 0) {
      const samplePayslip = payslipsResponse.data.payslips[0];
      console.log('\n📄 Sample Payslip Details:');
      console.log('   - Employee:', samplePayslip.employee?.personalInfo?.firstName, samplePayslip.employee?.personalInfo?.lastName);
      console.log('   - Gross Pay: ₹', samplePayslip.grossPay);
      console.log('   - Deductions: ₹', samplePayslip.totalDeductions);
      console.log('   - Net Pay: ₹', samplePayslip.netPay);
      console.log('   - Working Days:', samplePayslip.workingDays);
      console.log('   - Present Days:', samplePayslip.presentDays);
      console.log('   - Paid Leave Days:', samplePayslip.paidLeaveDays);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Note: Please update the authorization token in this script');
    }
  }
};

// Run the test
testPayrollRun();
