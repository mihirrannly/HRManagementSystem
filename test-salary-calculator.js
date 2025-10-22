/**
 * Test script for Salary Calculator
 * Tests the exact breakdown calculation as specified
 */

const { calculateSalaryBreakdown, formatSalary, getSalaryBreakdownTable } = require('./server/utils/salaryCalculator');

console.log('🧮 Testing Salary Calculator\n');

// Test with the exact values from your specification
const testCTC = 900000; // Annual CTC (₹75,000 monthly × 12)
console.log(`Testing with CTC: ₹${testCTC.toLocaleString('en-IN')} (Annual)\n`);

try {
  // Calculate breakdown
  const breakdown = calculateSalaryBreakdown(testCTC);
  
  console.log('📊 CALCULATED BREAKDOWN:');
  console.log('='.repeat(50));
  
  // Monthly breakdown
  console.log('\n📅 MONTHLY BREAKDOWN:');
  console.log(`Basic Salary:     ₹${breakdown.monthly.basic.toLocaleString('en-IN')}`);
  console.log(`HRA:              ₹${breakdown.monthly.hra.toLocaleString('en-IN')}`);
  console.log(`Conveyance:       ₹${breakdown.monthly.conveyanceAllowance.toLocaleString('en-IN')}`);
  console.log(`Special Allowance: ₹${breakdown.monthly.specialAllowance.toLocaleString('en-IN')}`);
  console.log(`Gross (Part A):   ₹${breakdown.monthly.gross.toLocaleString('en-IN')}`);
  console.log(`Monthly CTC:      ₹${breakdown.monthly.ctc.toLocaleString('en-IN')}`);
  
  // Yearly breakdown
  console.log('\n📆 YEARLY BREAKDOWN:');
  console.log(`Basic Salary:     ₹${breakdown.yearly.basic.toLocaleString('en-IN')}`);
  console.log(`HRA:              ₹${breakdown.yearly.hra.toLocaleString('en-IN')}`);
  console.log(`Conveyance:       ₹${breakdown.yearly.conveyanceAllowance.toLocaleString('en-IN')}`);
  console.log(`Special Allowance: ₹${breakdown.yearly.specialAllowance.toLocaleString('en-IN')}`);
  console.log(`Gross (Part A):   ₹${breakdown.yearly.gross.toLocaleString('en-IN')}`);
  console.log(`Annual CTC:       ₹${breakdown.yearly.ctc.toLocaleString('en-IN')}`);
  
  // Verify against your specification
  console.log('\n✅ VERIFICATION AGAINST YOUR SPECIFICATION:');
  console.log('='.repeat(50));
  
  const expectedMonthly = {
    basic: 45000,
    hra: 18000,
    conveyance: 6750,
    special: 5250,
    gross: 75000
  };
  
  const expectedYearly = {
    basic: 540000,  // 45000 * 12
    hra: 216000,    // 18000 * 12
    conveyance: 81000,  // 6750 * 12
    special: 63000,     // 5250 * 12
    gross: 900000       // 75000 * 12
  };
  
  console.log('\n📋 EXPECTED vs CALCULATED (Monthly):');
  console.log(`Basic:     Expected: ₹${expectedMonthly.basic.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.basic.toLocaleString('en-IN')} | Match: ${breakdown.monthly.basic === expectedMonthly.basic ? '✅' : '❌'}`);
  console.log(`HRA:       Expected: ₹${expectedMonthly.hra.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.hra.toLocaleString('en-IN')} | Match: ${breakdown.monthly.hra === expectedMonthly.hra ? '✅' : '❌'}`);
  console.log(`Conveyance: Expected: ₹${expectedMonthly.conveyance.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.conveyanceAllowance.toLocaleString('en-IN')} | Match: ${breakdown.monthly.conveyanceAllowance === expectedMonthly.conveyance ? '✅' : '❌'}`);
  console.log(`Special:   Expected: ₹${expectedMonthly.special.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.specialAllowance.toLocaleString('en-IN')} | Match: ${breakdown.monthly.specialAllowance === expectedMonthly.special ? '✅' : '❌'}`);
  console.log(`Gross:     Expected: ₹${expectedMonthly.gross.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.gross.toLocaleString('en-IN')} | Match: ${breakdown.monthly.gross === expectedMonthly.gross ? '✅' : '❌'}`);
  
  console.log('\n📋 EXPECTED vs CALCULATED (Yearly):');
  console.log(`Basic:     Expected: ₹${expectedYearly.basic.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.basic.toLocaleString('en-IN')} | Match: ${breakdown.yearly.basic === expectedYearly.basic ? '✅' : '❌'}`);
  console.log(`HRA:       Expected: ₹${expectedYearly.hra.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.hra.toLocaleString('en-IN')} | Match: ${breakdown.yearly.hra === expectedYearly.hra ? '✅' : '❌'}`);
  console.log(`Conveyance: Expected: ₹${expectedYearly.conveyance.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.conveyanceAllowance.toLocaleString('en-IN')} | Match: ${breakdown.yearly.conveyanceAllowance === expectedYearly.conveyance ? '✅' : '❌'}`);
  console.log(`Special:   Expected: ₹${expectedYearly.special.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.specialAllowance.toLocaleString('en-IN')} | Match: ${breakdown.yearly.specialAllowance === expectedYearly.special ? '✅' : '❌'}`);
  console.log(`Gross:     Expected: ₹${expectedYearly.gross.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.gross.toLocaleString('en-IN')} | Match: ${breakdown.yearly.gross === expectedYearly.gross ? '✅' : '❌'}`);
  
  // Test percentage breakdown
  console.log('\n📊 PERCENTAGE BREAKDOWN:');
  console.log(`Basic:     ${breakdown.partABreakdown.basic.percentage}% of gross`);
  console.log(`HRA:       ${breakdown.partABreakdown.hra.percentage}% of gross`);
  console.log(`Conveyance: ${breakdown.partABreakdown.conveyanceAllowance.percentage}% of gross`);
  console.log(`Special:   ${breakdown.partABreakdown.specialAllowance.percentage}% of gross`);
  console.log(`Total:     ${breakdown.partABreakdown.basic.percentage + breakdown.partABreakdown.hra.percentage + breakdown.partABreakdown.conveyanceAllowance.percentage + breakdown.partABreakdown.specialAllowance.percentage}%`);
  
  // Test breakdown table
  console.log('\n📋 BREAKDOWN TABLE:');
  console.log('='.repeat(50));
  const breakdownTable = getSalaryBreakdownTable(testCTC);
  
  breakdownTable.forEach(part => {
    console.log(`\nPart ${part.part}:`);
    part.components.forEach(component => {
      console.log(`  ${component.name}: ₹${component.monthly.toLocaleString('en-IN')} (Monthly) | ₹${component.yearly.toLocaleString('en-IN')} (Yearly)`);
    });
  });
  
  // Test with different CTC values
  console.log('\n🧪 TESTING WITH DIFFERENT CTC VALUES:');
  console.log('='.repeat(50));
  
  const testValues = [300000, 500000, 1000000, 1500000];
  
  testValues.forEach(ctc => {
    const testBreakdown = calculateSalaryBreakdown(ctc);
    const monthlyCTC = ctc / 12;
    
    console.log(`\nCTC: ₹${ctc.toLocaleString('en-IN')} (Annual)`);
    console.log(`Monthly CTC: ₹${monthlyCTC.toLocaleString('en-IN')}`);
    console.log(`Basic: ₹${testBreakdown.monthly.basic.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.basic / monthlyCTC) * 100)}% of monthly CTC)`);
    console.log(`HRA: ₹${testBreakdown.monthly.hra.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.hra / monthlyCTC) * 100)}% of monthly CTC)`);
    console.log(`Gross: ₹${testBreakdown.monthly.gross.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.gross / monthlyCTC) * 100)}% of monthly CTC)`);
  });
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Error in salary calculation test:', error);
  process.exit(1);
}
