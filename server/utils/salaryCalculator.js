/**
 * Salary Calculator Utility
 * Implements the exact CTC breakdown calculation as specified
 */

/**
 * Calculate salary breakdown from CTC
 * @param {number} ctc - Cost to Company (annual)
 * @param {boolean} includePF - Whether to include PF as employer contribution
 * @returns {object} Salary breakdown with monthly and yearly components
 */
function calculateSalaryBreakdown(ctc, includePF = false) {
  // Validate input
  if (!ctc || ctc <= 0) {
    throw new Error('CTC must be a positive number');
  }

  // Calculate monthly CTC
  const monthlyCTC = ctc / 12;
  
  // If PF is included, we need to calculate gross first, then add PF
  let grossMonthly, basicMonthly, hraMonthly, conveyanceMonthly, specialAllowanceMonthly;
  let pfEmployer = 0;
  
  if (includePF) {
    // Use your exact specification as a template and scale it
    // Your specification: CTC = ₹65,000, Gross = ₹61,400, PF = ₹3,600
    // Scale factor = input CTC / 65,000
    
    const scaleFactor = monthlyCTC / 65000;
    
    // Scale all components from your specification
    grossMonthly = Math.round(61400 * scaleFactor);
    basicMonthly = Math.round(36840 * scaleFactor);
    hraMonthly = Math.round(14736 * scaleFactor);
    conveyanceMonthly = Math.round(5526 * scaleFactor);
    specialAllowanceMonthly = Math.round(4298 * scaleFactor);
    pfEmployer = Math.round(3600 * scaleFactor);
    
    // Verify the calculation
    const calculatedGross = basicMonthly + hraMonthly + conveyanceMonthly + specialAllowanceMonthly;
    const adjustment = grossMonthly - calculatedGross;
    specialAllowanceMonthly += adjustment;
  } else {
    // Original calculation without PF
    grossMonthly = monthlyCTC;
    
    // Calculate components based on exact percentages from your specification
    basicMonthly = Math.round(grossMonthly * 0.6); // 60% of gross
    hraMonthly = Math.round(grossMonthly * 0.24); // 24% of gross  
    conveyanceMonthly = Math.round(grossMonthly * 0.09); // 9% of gross
    specialAllowanceMonthly = Math.round(grossMonthly * 0.07); // 7% of gross
    
    // Verify the breakdown adds up to gross
    const calculatedGross = basicMonthly + hraMonthly + conveyanceMonthly + specialAllowanceMonthly;
    const adjustment = grossMonthly - calculatedGross;
    
    // Adjust special allowance to account for rounding differences
    specialAllowanceMonthly += adjustment;
  }
  
  // Part B: Employer's Contribution
  const gratuityEmployer = 0;
  const epicEmployer = 0;
  
  // Part C: Variable Pay (0 as per specification)
  const variablePay = 0;
  
  // Calculate yearly amounts
  const basicYearly = basicMonthly * 12;
  const hraYearly = hraMonthly * 12;
  const conveyanceYearly = conveyanceMonthly * 12;
  const specialAllowanceYearly = specialAllowanceMonthly * 12;
  const grossYearly = grossMonthly * 12;
  
  return {
    // Monthly breakdown
    monthly: {
      basic: basicMonthly,
      hra: hraMonthly,
      conveyanceAllowance: conveyanceMonthly,
      specialAllowance: specialAllowanceMonthly,
      gross: grossMonthly,
      pfEmployer: pfEmployer,
      gratuityEmployer: gratuityEmployer,
      epicEmployer: epicEmployer,
      variablePay: variablePay,
      ctc: monthlyCTC
    },
    
    // Yearly breakdown
    yearly: {
      basic: basicYearly,
      hra: hraYearly,
      conveyanceAllowance: conveyanceYearly,
      specialAllowance: specialAllowanceYearly,
      gross: grossYearly,
      pfEmployer: pfEmployer * 12,
      gratuityEmployer: gratuityEmployer * 12,
      epicEmployer: epicEmployer * 12,
      variablePay: variablePay * 12,
      ctc: ctc
    },
    
    // Summary
    summary: {
      partA: {
        name: "Gross Salary",
        monthly: grossMonthly,
        yearly: grossYearly
      },
      partB: {
        name: "Employer's Contribution",
        monthly: pfEmployer + gratuityEmployer + epicEmployer,
        yearly: (pfEmployer + gratuityEmployer + epicEmployer) * 12
      },
      partC: {
        name: "Variable Pay", 
        monthly: variablePay,
        yearly: variablePay * 12
      },
      totalCTC: {
        monthly: monthlyCTC,
        yearly: ctc
      }
    },
    
    // Component breakdown for Part A
    partABreakdown: {
      basic: {
        monthly: basicMonthly,
        yearly: basicYearly,
        percentage: 60
      },
      hra: {
        monthly: hraMonthly,
        yearly: hraYearly,
        percentage: 24
      },
      conveyanceAllowance: {
        monthly: conveyanceMonthly,
        yearly: conveyanceYearly,
        percentage: 9
      },
      specialAllowance: {
        monthly: specialAllowanceMonthly,
        yearly: specialAllowanceYearly,
        percentage: 7
      }
    }
  };
}

/**
 * Calculate salary breakdown from monthly gross salary
 * @param {number} monthlyGross - Monthly gross salary
 * @param {boolean} includePF - Whether to include PF as employer contribution
 * @returns {object} Salary breakdown
 */
function calculateFromMonthlyGross(monthlyGross, includePF = false) {
  const yearlyGross = monthlyGross * 12;
  return calculateSalaryBreakdown(yearlyGross, includePF);
}

/**
 * Calculate salary breakdown from basic salary
 * @param {number} basicSalary - Basic salary (monthly)
 * @param {boolean} includePF - Whether to include PF as employer contribution
 * @returns {object} Salary breakdown
 */
function calculateFromBasic(basicSalary, includePF = false) {
  // Basic is 60% of gross, so gross = basic / 0.6
  const monthlyGross = basicSalary / 0.6;
  return calculateFromMonthlyGross(monthlyGross, includePF);
}

/**
 * Validate salary breakdown
 * @param {object} breakdown - Salary breakdown object
 * @returns {boolean} True if valid
 */
function validateBreakdown(breakdown) {
  try {
    const { monthly, yearly } = breakdown;
    
    // Check if monthly and yearly are consistent
    const monthlyToYearly = monthly.basic * 12;
    if (Math.abs(monthlyToYearly - yearly.basic) > 1) {
      return false;
    }
    
    // Check if percentages add up correctly
    const totalPercentage = breakdown.partABreakdown.basic.percentage +
                           breakdown.partABreakdown.hra.percentage +
                           breakdown.partABreakdown.conveyanceAllowance.percentage +
                           breakdown.partABreakdown.specialAllowance.percentage;
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format salary for display
 * @param {number} amount - Amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol
 * @returns {string} Formatted amount
 */
function formatSalary(amount, showCurrency = true) {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return showCurrency ? `₹${formatted}` : formatted;
}

/**
 * Get salary breakdown table for display
 * @param {number} ctc - Cost to Company
 * @returns {array} Table rows for display
 */
function getSalaryBreakdownTable(ctc) {
  const breakdown = calculateSalaryBreakdown(ctc);
  
  return [
    {
      part: 'A',
      components: [
        { name: 'Basic', monthly: breakdown.monthly.basic, yearly: breakdown.yearly.basic },
        { name: 'HRA', monthly: breakdown.monthly.hra, yearly: breakdown.yearly.hra },
        { name: 'Conveyance Allowance', monthly: breakdown.monthly.conveyanceAllowance, yearly: breakdown.yearly.conveyanceAllowance },
        { name: 'Special Allowance', monthly: breakdown.monthly.specialAllowance, yearly: breakdown.yearly.specialAllowance },
        { name: 'Gross', monthly: breakdown.monthly.gross, yearly: breakdown.yearly.gross, isTotal: true }
      ]
    },
    {
      part: 'B',
      components: [
        { name: 'PF', monthly: breakdown.monthly.pfEmployer, yearly: breakdown.yearly.pfEmployer },
        { name: 'Gratuity', monthly: breakdown.monthly.gratuityEmployer, yearly: breakdown.yearly.gratuityEmployer },
        { name: 'EPIC', monthly: breakdown.monthly.epicEmployer, yearly: breakdown.yearly.epicEmployer }
      ]
    },
    {
      part: 'C',
      components: [
        { name: 'Variable Pay', monthly: breakdown.monthly.variablePay, yearly: breakdown.yearly.variablePay }
      ]
    },
    {
      part: 'Total',
      components: [
        { name: 'CTC', monthly: breakdown.monthly.ctc, yearly: breakdown.yearly.ctc, isTotal: true }
      ]
    }
  ];
}

module.exports = {
  calculateSalaryBreakdown,
  calculateFromMonthlyGross,
  calculateFromBasic,
  validateBreakdown,
  formatSalary,
  getSalaryBreakdownTable
};
