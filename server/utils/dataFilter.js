/**
 * Data filtering utility for employee information based on access levels
 * Ensures sensitive information is hidden from reporting managers
 */

/**
 * Filter employee data based on access level
 * @param {Object} employeeData - Raw employee data
 * @param {string} accessLevel - Access level: 'full', 'manager', 'self'
 * @returns {Object} Filtered employee data
 */
const filterEmployeeData = (employeeData, accessLevel) => {
  if (!employeeData) return null;

  // Create a deep copy to avoid modifying original data
  const filteredData = JSON.parse(JSON.stringify(employeeData));

  // Full access - no filtering (Admin, HR)
  if (accessLevel === 'full') {
    return filteredData;
  }

  // Manager access - hide sensitive personal and financial information
  if (accessLevel === 'manager') {
    // Remove sensitive salary information
    if (filteredData.salaryInfo) {
      filteredData.salaryInfo = {
        // Keep only basic salary structure without actual amounts
        currentSalary: {
          // Hide actual salary amounts
          basic: null,
          hra: null,
          allowances: null,
          grossSalary: null,
          ctc: null
        },
        // Completely hide bank details
        bankDetails: null,
        // Hide tax information
        taxInfo: null
      };
    }

    // Remove sensitive personal information
    if (filteredData.personalInfo) {
      // Keep basic info but hide sensitive details
      filteredData.personalInfo = {
        firstName: filteredData.personalInfo.firstName,
        lastName: filteredData.personalInfo.lastName,
        // Hide date of birth, gender, marital status
        dateOfBirth: null,
        gender: null,
        maritalStatus: null
      };
    }

    // Remove sensitive contact information
    if (filteredData.contactInfo) {
      filteredData.contactInfo = {
        // Keep work email but hide personal details
        email: filteredData.contactInfo.email,
        // Hide personal email, phone, address, emergency contact
        personalEmail: null,
        phone: null,
        address: null,
        emergencyContact: null,
        alternatePhone: null
      };
    }

    // Remove address information
    if (filteredData.addressInfo) {
      filteredData.addressInfo = null;
    }

    // Remove employment history (may contain salary information)
    if (filteredData.employmentHistory) {
      filteredData.employmentHistory = null;
    }

    // Keep work-related information
    // employmentInfo, documents (work-related), skills, certifications are kept
  }

  // Self access - full access to own data
  if (accessLevel === 'self') {
    return filteredData;
  }

  return filteredData;
};

/**
 * Filter employee list data for managers
 * @param {Array} employees - Array of employee objects
 * @param {string} accessLevel - Access level
 * @returns {Array} Filtered array of employees
 */
const filterEmployeeList = (employees, accessLevel) => {
  if (!Array.isArray(employees)) return employees;
  
  return employees.map(employee => filterEmployeeData(employee, accessLevel));
};

/**
 * Check if user has reporting manager access to an employee
 * @param {Object} user - User object
 * @param {Object} targetEmployee - Target employee object
 * @returns {Object} Access information
 */
const checkReportingManagerAccess = async (user, targetEmployee) => {
  const Employee = require('../models/Employee');
  
  try {
    // Admin and HR have full access
    if (['admin', 'hr'].includes(user.role)) {
      return { hasAccess: true, accessLevel: 'full' };
    }

    // Check if user is a manager and target employee reports to them
    if (user.role === 'manager') {
      const userEmployee = await Employee.findOne({ user: user._id });
      if (userEmployee && targetEmployee.employmentInfo?.reportingManager?.toString() === userEmployee._id.toString()) {
        return { hasAccess: true, accessLevel: 'manager' };
      }
    }

    // Check if user is accessing their own data
    if (targetEmployee.user?.toString() === user._id.toString()) {
      return { hasAccess: true, accessLevel: 'self' };
    }

    return { hasAccess: false, accessLevel: null };
  } catch (error) {
    console.error('Error checking reporting manager access:', error);
    return { hasAccess: false, accessLevel: null };
  }
};

/**
 * Get sensitive fields that should be hidden from managers
 * @returns {Array} Array of field paths to hide
 */
const getSensitiveFields = () => {
  return [
    'salaryInfo.currentSalary.basic',
    'salaryInfo.currentSalary.hra',
    'salaryInfo.currentSalary.allowances',
    'salaryInfo.currentSalary.grossSalary',
    'salaryInfo.currentSalary.ctc',
    'salaryInfo.bankDetails',
    'salaryInfo.taxInfo',
    'personalInfo.dateOfBirth',
    'personalInfo.gender',
    'personalInfo.maritalStatus',
    'contactInfo.personalEmail',
    'contactInfo.phone',
    'contactInfo.address',
    'contactInfo.emergencyContact',
    'contactInfo.alternatePhone',
    'addressInfo',
    'employmentHistory'
  ];
};

/**
 * Check if a field path is sensitive
 * @param {string} fieldPath - Field path to check
 * @returns {boolean} True if field is sensitive
 */
const isSensitiveField = (fieldPath) => {
  const sensitiveFields = getSensitiveFields();
  return sensitiveFields.some(sensitiveField => 
    fieldPath.startsWith(sensitiveField) || sensitiveField.startsWith(fieldPath)
  );
};

module.exports = {
  filterEmployeeData,
  filterEmployeeList,
  checkReportingManagerAccess,
  getSensitiveFields,
  isSensitiveField
};
