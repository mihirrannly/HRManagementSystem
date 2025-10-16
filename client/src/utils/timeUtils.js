/**
 * Utility functions for time formatting
 */

/**
 * Convert minutes to hours and minutes format
 * @param {number} minutes - Total minutes
 * @returns {string} - Formatted string like "6h 28m" or "45m"
 */
export const formatMinutesToHoursAndMinutes = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Format late status message
 * @param {number} lateMinutes - Number of minutes late
 * @returns {string} - Formatted late status like "Late by 6h 28m"
 */
export const formatLateStatus = (lateMinutes) => {
  return `Late by ${formatMinutesToHoursAndMinutes(lateMinutes)}`;
};

