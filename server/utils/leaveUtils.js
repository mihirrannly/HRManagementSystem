const moment = require('moment');
const { LeaveBalance } = require('../models/Leave');

/**
 * Calculate monthly available leaves with carry-forward logic
 * 
 * Rules:
 * - Base allocation: 1 casual leave + 1 sick leave per month
 * - Sick leaves: Always 1 per month, no carry forward
 * - Casual leaves: If unused for 2 consecutive months, carry forward to the 3rd month
 * - Example: If not used in June and July, employee gets 3 casual leaves in August (2 carried forward + 1 new)
 * 
 * @param {Object} leaveBalance - The employee's leave balance document
 * @param {Number} currentMonth - Current month (1-12)
 * @param {Number} currentYear - Current year
 * @returns {Object} - { casualAvailable, sickAvailable, casualCarryForward }
 */
function calculateMonthlyAvailableLeaves(leaveBalance, currentMonth, currentYear) {
  // Initialize if no monthly usage tracking exists
  if (!leaveBalance.monthlyUsage || leaveBalance.monthlyUsage.length === 0) {
    leaveBalance.monthlyUsage = [];
  }

  // Get or create current month's usage
  let currentMonthUsage = leaveBalance.monthlyUsage.find(m => m.month === currentMonth);
  if (!currentMonthUsage) {
    currentMonthUsage = {
      month: currentMonth,
      casualUsed: 0,
      casualPending: 0,
      sickUsed: 0,
      sickPending: 0,
      specialUsed: 0,
      specialPending: 0,
      casualAllocated: 1,
      casualCarryForward: 0,
      sickAllocated: 1
    };
    leaveBalance.monthlyUsage.push(currentMonthUsage);
  }

  // Check if there's carry forward from previous months
  let casualCarryForward = 0;
  
  // Only check carry forward if we're not in the first month of the year
  if (currentMonth > 2) {
    const prevMonth1 = currentMonth - 1;
    const prevMonth2 = currentMonth - 2;
    
    const prevMonth1Usage = leaveBalance.monthlyUsage.find(m => m.month === prevMonth1);
    const prevMonth2Usage = leaveBalance.monthlyUsage.find(m => m.month === prevMonth2);
    
    // Check if casual leave was not used in both previous months
    const month1NotUsed = !prevMonth1Usage || prevMonth1Usage.casualUsed === 0;
    const month2NotUsed = !prevMonth2Usage || prevMonth2Usage.casualUsed === 0;
    
    if (month1NotUsed && month2NotUsed) {
      // Carry forward 2 casual leaves (1 from each unused month)
      casualCarryForward = 2;
    } else if (month1NotUsed || month2NotUsed) {
      // Carry forward 1 casual leave (from one unused month)
      casualCarryForward = 1;
    }
  } else if (currentMonth === 2) {
    // In February, check only January
    const prevMonth1Usage = leaveBalance.monthlyUsage.find(m => m.month === 1);
    const month1NotUsed = !prevMonth1Usage || prevMonth1Usage.casualUsed === 0;
    
    if (month1NotUsed) {
      casualCarryForward = 1;
    }
  }
  // In January (month 1), no carry forward since it's the start of the year

  // Update current month's carry forward
  currentMonthUsage.casualCarryForward = casualCarryForward;
  
  // Calculate available leaves for current month (subtract both used AND pending)
  const casualAvailable = currentMonthUsage.casualAllocated + casualCarryForward - currentMonthUsage.casualUsed - (currentMonthUsage.casualPending || 0);
  const sickAvailable = currentMonthUsage.sickAllocated - currentMonthUsage.sickUsed - (currentMonthUsage.sickPending || 0);

  return {
    casualAvailable: Math.max(0, casualAvailable),
    sickAvailable: Math.max(0, sickAvailable),
    casualCarryForward,
    casualTotal: currentMonthUsage.casualAllocated + casualCarryForward,
    sickTotal: currentMonthUsage.sickAllocated,
    casualUsed: currentMonthUsage.casualUsed,
    casualPending: currentMonthUsage.casualPending || 0,
    sickUsed: currentMonthUsage.sickUsed,
    sickPending: currentMonthUsage.sickPending || 0
  };
}

/**
 * Get monthly leave summary for display
 * 
 * @param {Object} leaveBalance - The employee's leave balance document
 * @param {Number} currentMonth - Current month (1-12)
 * @param {Number} currentYear - Current year
 * @returns {Object} - Formatted leave summary
 */
function getMonthlyLeaveSummary(leaveBalance, currentMonth, currentYear) {
  const monthlyLeaves = calculateMonthlyAvailableLeaves(leaveBalance, currentMonth, currentYear);
  
  return {
    currentMonth: moment().month(currentMonth - 1).format('MMMM'),
    casual: {
      total: monthlyLeaves.casualTotal,
      available: monthlyLeaves.casualAvailable,
      used: monthlyLeaves.casualUsed,
      pending: monthlyLeaves.casualPending,
      carryForward: monthlyLeaves.casualCarryForward,
      base: 1
    },
    sick: {
      total: monthlyLeaves.sickTotal,
      available: monthlyLeaves.sickAvailable,
      used: monthlyLeaves.sickUsed,
      pending: monthlyLeaves.sickPending,
      base: 1
    },
    yearlyBalance: {
      casual: {
        allocated: leaveBalance.casualLeave.allocated,
        used: leaveBalance.casualLeave.used,
        pending: leaveBalance.casualLeave.pending,
        available: leaveBalance.casualLeave.available
      },
      sick: {
        allocated: leaveBalance.sickLeave.allocated,
        used: leaveBalance.sickLeave.used,
        pending: leaveBalance.sickLeave.pending,
        available: leaveBalance.sickLeave.available
      },
      special: {
        allocated: leaveBalance.specialLeave.allocated,
        used: leaveBalance.specialLeave.used,
        pending: leaveBalance.specialLeave.pending,
        available: leaveBalance.specialLeave.available
      }
    }
  };
}

/**
 * Validate leave request against monthly limits
 * 
 * @param {Object} leaveBalance - The employee's leave balance document
 * @param {String} leaveType - Type of leave (casual, sick, etc.)
 * @param {Number} requestedDays - Number of days requested
 * @param {Number} requestMonth - Month of the leave request (1-12)
 * @param {Number} requestYear - Year of the leave request
 * @returns {Object} - { valid: boolean, message: string, availableBalance: number }
 */
function validateMonthlyLeaveRequest(leaveBalance, leaveType, requestedDays, requestMonth, requestYear) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (leaveType === 'casual') {
    const monthlyLeaves = calculateMonthlyAvailableLeaves(leaveBalance, requestMonth, requestYear);
    
    if (requestedDays > monthlyLeaves.casualAvailable) {
      return {
        valid: false,
        message: `Insufficient casual leave for this month. Available: ${monthlyLeaves.casualAvailable} day(s) (${monthlyLeaves.casualCarryForward > 0 ? `including ${monthlyLeaves.casualCarryForward} carried forward` : 'base monthly allocation'}), Requested: ${requestedDays} day(s)`,
        availableBalance: monthlyLeaves.casualAvailable
      };
    }

    // Also check yearly balance
    if (requestedDays > leaveBalance.casualLeave.available) {
      return {
        valid: false,
        message: `Insufficient yearly casual leave balance. Available: ${leaveBalance.casualLeave.available} day(s), Requested: ${requestedDays} day(s)`,
        availableBalance: leaveBalance.casualLeave.available
      };
    }

    return {
      valid: true,
      message: 'Leave request is valid',
      availableBalance: monthlyLeaves.casualAvailable
    };

  } else if (leaveType === 'sick') {
    const monthlyLeaves = calculateMonthlyAvailableLeaves(leaveBalance, requestMonth, requestYear);
    
    if (requestedDays > monthlyLeaves.sickAvailable) {
      return {
        valid: false,
        message: `Insufficient sick leave for this month. Available: ${monthlyLeaves.sickAvailable} day(s), Requested: ${requestedDays} day(s)`,
        availableBalance: monthlyLeaves.sickAvailable
      };
    }

    // Also check yearly balance
    if (requestedDays > leaveBalance.sickLeave.available) {
      return {
        valid: false,
        message: `Insufficient yearly sick leave balance. Available: ${leaveBalance.sickLeave.available} day(s), Requested: ${requestedDays} day(s)`,
        availableBalance: leaveBalance.sickLeave.available
      };
    }

    return {
      valid: true,
      message: 'Leave request is valid',
      availableBalance: monthlyLeaves.sickAvailable
    };

  } else if (leaveType === 'marriage' || leaveType === 'bereavement') {
    // Special leaves don't have monthly limits, only yearly
    if (requestedDays > leaveBalance.specialLeave.available) {
      return {
        valid: false,
        message: `Insufficient special leave balance. Available: ${leaveBalance.specialLeave.available} day(s), Requested: ${requestedDays} day(s)`,
        availableBalance: leaveBalance.specialLeave.available
      };
    }

    // Special leaves can be max 3 days per request
    if (requestedDays > 3) {
      return {
        valid: false,
        message: 'Special leave cannot exceed 3 days per request',
        availableBalance: Math.min(leaveBalance.specialLeave.available, 3)
      };
    }

    return {
      valid: true,
      message: 'Leave request is valid',
      availableBalance: leaveBalance.specialLeave.available
    };
  }

  return {
    valid: false,
    message: 'Invalid leave type',
    availableBalance: 0
  };
}

module.exports = {
  calculateMonthlyAvailableLeaves,
  getMonthlyLeaveSummary,
  validateMonthlyLeaveRequest
};

