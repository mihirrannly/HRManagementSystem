/**
 * Test script for Salary Calculator with PF
 * Tests the exact breakdown calculation with PF as specified
 */

const { calculateSalaryBreakdown, formatSalary, getSalaryBreakdownTable } = require('./server/utils/salaryCalculator');

console.log('🧮 Testing Salary Calculator with PF\n');

// Test with the exact values from your new specification
const testCTC = 780000; // Annual CTC from your example (₹65,000 monthly × 12)
console.log(`Testing with CTC: ₹${testCTC.toLocaleString('en-IN')} (Annual)\n`);

try {
  // Calculate breakdown with PF
  const breakdown = calculateSalaryBreakdown(testCTC, true);
  
  console.log('📊 CALCULATED BREAKDOWN WITH PF:');
  console.log('='.repeat(50));
  
  // Monthly breakdown
  console.log('\n📅 MONTHLY BREAKDOWN:');
  console.log(`Basic Salary:     ₹${breakdown.monthly.basic.toLocaleString('en-IN')}`);
  console.log(`HRA:              ₹${breakdown.monthly.hra.toLocaleString('en-IN')}`);
  console.log(`Conveyance:       ₹${breakdown.monthly.conveyanceAllowance.toLocaleString('en-IN')}`);
  console.log(`Special Allowance: ₹${breakdown.monthly.specialAllowance.toLocaleString('en-IN')}`);
  console.log(`Gross (Part A):   ₹${breakdown.monthly.gross.toLocaleString('en-IN')}`);
  console.log(`PF (Part B):      ₹${breakdown.monthly.pfEmployer.toLocaleString('en-IN')}`);
  console.log(`Monthly CTC:      ₹${breakdown.monthly.ctc.toLocaleString('en-IN')}`);
  
  // Yearly breakdown
  console.log('\n📆 YEARLY BREAKDOWN:');
  console.log(`Basic Salary:     ₹${breakdown.yearly.basic.toLocaleString('en-IN')}`);
  console.log(`HRA:              ₹${breakdown.yearly.hra.toLocaleString('en-IN')}`);
  console.log(`Conveyance:       ₹${breakdown.yearly.conveyanceAllowance.toLocaleString('en-IN')}`);
  console.log(`Special Allowance: ₹${breakdown.yearly.specialAllowance.toLocaleString('en-IN')}`);
  console.log(`Gross (Part A):   ₹${breakdown.yearly.gross.toLocaleString('en-IN')}`);
  console.log(`PF (Part B):      ₹${breakdown.yearly.pfEmployer.toLocaleString('en-IN')}`);
  console.log(`Annual CTC:       ₹${breakdown.yearly.ctc.toLocaleString('en-IN')}`);
  
  // Verify against your specification
  console.log('\n✅ VERIFICATION AGAINST YOUR SPECIFICATION:');
  console.log('='.repeat(50));
  
  const expectedMonthly = {
    basic: 36840,
    hra: 14736,
    conveyance: 5526,
    special: 4298,
    gross: 61400,
    pf: 3600,
    ctc: 65000
  };
  
  const expectedYearly = {
    basic: 442080,  // 36840 * 12
    hra: 176832,    // 14736 * 12
    conveyance: 66312,  // 5526 * 12
    special: 51576,     // 4298 * 12
    gross: 736800,      // 61400 * 12
    pf: 43200,          // 3600 * 12
    ctc: 780000         // 65000 * 12
  };
  
  console.log('\n📋 EXPECTED vs CALCULATED (Monthly):');
  console.log(`Basic:     Expected: ₹${expectedMonthly.basic.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.basic.toLocaleString('en-IN')} | Match: ${breakdown.monthly.basic === expectedMonthly.basic ? '✅' : '❌'}`);
  console.log(`HRA:       Expected: ₹${expectedMonthly.hra.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.hra.toLocaleString('en-IN')} | Match: ${breakdown.monthly.hra === expectedMonthly.hra ? '✅' : '❌'}`);
  console.log(`Conveyance: Expected: ₹${expectedMonthly.conveyance.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.conveyanceAllowance.toLocaleString('en-IN')} | Match: ${breakdown.monthly.conveyanceAllowance === expectedMonthly.conveyance ? '✅' : '❌'}`);
  console.log(`Special:   Expected: ₹${expectedMonthly.special.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.specialAllowance.toLocaleString('en-IN')} | Match: ${breakdown.monthly.specialAllowance === expectedMonthly.special ? '✅' : '❌'}`);
  console.log(`Gross:     Expected: ₹${expectedMonthly.gross.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.gross.toLocaleString('en-IN')} | Match: ${breakdown.monthly.gross === expectedMonthly.gross ? '✅' : '❌'}`);
  console.log(`PF:        Expected: ₹${expectedMonthly.pf.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.pfEmployer.toLocaleString('en-IN')} | Match: ${breakdown.monthly.pfEmployer === expectedMonthly.pf ? '✅' : '❌'}`);
  console.log(`CTC:       Expected: ₹${expectedMonthly.ctc.toLocaleString('en-IN')} | Calculated: ₹${breakdown.monthly.ctc.toLocaleString('en-IN')} | Match: ${breakdown.monthly.ctc === expectedMonthly.ctc ? '✅' : '❌'}`);
  
  console.log('\n📋 EXPECTED vs CALCULATED (Yearly):');
  console.log(`Basic:     Expected: ₹${expectedYearly.basic.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.basic.toLocaleString('en-IN')} | Match: ${breakdown.yearly.basic === expectedYearly.basic ? '✅' : '❌'}`);
  console.log(`HRA:       Expected: ₹${expectedYearly.hra.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.hra.toLocaleString('en-IN')} | Match: ${breakdown.yearly.hra === expectedYearly.hra ? '✅' : '❌'}`);
  console.log(`Conveyance: Expected: ₹${expectedYearly.conveyance.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.conveyanceAllowance.toLocaleString('en-IN')} | Match: ${breakdown.yearly.conveyanceAllowance === expectedYearly.conveyance ? '✅' : '❌'}`);
  console.log(`Special:   Expected: ₹${expectedYearly.special.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.specialAllowance.toLocaleString('en-IN')} | Match: ${breakdown.yearly.specialAllowance === expectedYearly.special ? '✅' : '❌'}`);
  console.log(`Gross:     Expected: ₹${expectedYearly.gross.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.gross.toLocaleString('en-IN')} | Match: ${breakdown.yearly.gross === expectedYearly.gross ? '✅' : '❌'}`);
  console.log(`PF:        Expected: ₹${expectedYearly.pf.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.pfEmployer.toLocaleString('en-IN')} | Match: ${breakdown.yearly.pfEmployer === expectedYearly.pf ? '✅' : '❌'}`);
  console.log(`CTC:       Expected: ₹${expectedYearly.ctc.toLocaleString('en-IN')} | Calculated: ₹${breakdown.yearly.ctc.toLocaleString('en-IN')} | Match: ${breakdown.yearly.ctc === expectedYearly.ctc ? '✅' : '❌'}`);
  
  // Test percentage breakdown
  console.log('\n📊 PERCENTAGE BREAKDOWN:');
  console.log(`Basic:     ${breakdown.partABreakdown.basic.percentage}% of gross`);
  console.log(`HRA:       ${breakdown.partABreakdown.hra.percentage}% of gross`);
  console.log(`Conveyance: ${breakdown.partABreakdown.conveyanceAllowance.percentage}% of gross`);
  console.log(`Special:   ${breakdown.partABreakdown.specialAllowance.percentage}% of gross`);
  console.log(`Total:     ${breakdown.partABreakdown.basic.percentage + breakdown.partABreakdown.hra.percentage + breakdown.partABreakdown.conveyanceAllowance.percentage + breakdown.partABreakdown.specialAllowance.percentage}%`);
  
  // Test PF percentage
  const pfPercentage = (breakdown.monthly.pfEmployer / breakdown.monthly.basic) * 100;
  console.log(`PF:        ${pfPercentage.toFixed(1)}% of basic salary`);
  
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
  
  // Test without PF for comparison
  console.log('\n🔄 TESTING WITHOUT PF FOR COMPARISON:');
  console.log('='.repeat(50));
  
  const breakdownWithoutPF = calculateSalaryBreakdown(testCTC, false);
  
  console.log(`Without PF - Monthly Gross: ₹${breakdownWithoutPF.monthly.gross.toLocaleString('en-IN')}`);
  console.log(`With PF - Monthly Gross: ₹${breakdown.monthly.gross.toLocaleString('en-IN')}`);
  console.log(`Difference: ₹${(breakdownWithoutPF.monthly.gross - breakdown.monthly.gross).toLocaleString('en-IN')}`);
  
  // Test with different CTC values
  console.log('\n🧪 TESTING WITH DIFFERENT CTC VALUES:');
  console.log('='.repeat(50));
  
  const testValues = [600000, 900000, 1200000, 1500000];
  
  testValues.forEach(ctc => {
    const testBreakdown = calculateSalaryBreakdown(ctc, true);
    const monthlyCTC = ctc / 12;
    
    console.log(`\nCTC: ₹${ctc.toLocaleString('en-IN')} (Annual)`);
    console.log(`Monthly CTC: ₹${monthlyCTC.toLocaleString('en-IN')}`);
    console.log(`Gross: ₹${testBreakdown.monthly.gross.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.gross / monthlyCTC) * 100)}% of monthly CTC)`);
    console.log(`PF: ₹${testBreakdown.monthly.pfEmployer.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.pfEmployer / testBreakdown.monthly.basic) * 100)}% of basic)`);
    console.log(`Basic: ₹${testBreakdown.monthly.basic.toLocaleString('en-IN')} (${Math.round((testBreakdown.monthly.basic / testBreakdown.monthly.gross) * 100)}% of gross)`);
  });
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Error in salary calculation test:', error);
  process.exit(1);
}
