const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.countDocuments({ 
      'employmentInfo.isActive': true 
    });

    // Get new employees this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const newEmployeesThisMonth = await Employee.countDocuments({
      'employmentInfo.isActive': true,
      'employmentInfo.dateOfJoining': { $gte: currentMonth }
    });

    // Get total departments
    const totalDepartments = await Department.countDocuments();

    // Get employees on probation
    const employeesOnProbation = await Employee.countDocuments({
      'employmentInfo.isActive': true,
      'employmentInfo.probationEndDate': { $gte: new Date() }
    });

    // Get recent activities (mock data for now)
    const activities = [
      {
        id: 1,
        type: 'employee_joined',
        message: 'New employee joined the organization',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: 'HR Team'
      },
      {
        id: 2,
        type: 'department_created',
        message: 'New department was created',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        user: 'Admin'
      },
      {
        id: 3,
        type: 'employee_updated',
        message: 'Employee profile was updated',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        user: 'HR Team'
      }
    ];

    // Get departments with employee count
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'employmentInfo.department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          employeeCount: { 
            $size: {
              $filter: {
                input: '$employees',
                cond: { $eq: ['$$this.employmentInfo.isActive', true] }
              }
            }
          }
        }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      totalEmployees,
      newEmployeesThisMonth,
      totalDepartments,
      employeesOnProbation,
      activities,
      departments
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/attendance
// @desc    Get attendance report data
// @access  Private
router.get('/attendance', authenticate, async (req, res) => {
  try {
    // Mock attendance data for now
    const attendanceData = {
      summary: {
        totalEmployees: 135,
        presentToday: 127,
        absentToday: 8,
        attendanceRate: 94.1
      },
      trends: [
        { month: 'Jan', present: 85, absent: 15 },
        { month: 'Feb', present: 88, absent: 12 },
        { month: 'Mar', present: 92, absent: 8 },
        { month: 'Apr', present: 90, absent: 10 },
        { month: 'May', present: 87, absent: 13 },
        { month: 'Jun', present: 94, absent: 6 }
      ],
      departmentWise: [
        { department: 'Engineering', present: 42, absent: 3, rate: 93.3 },
        { department: 'Sales', present: 30, absent: 2, rate: 93.8 },
        { department: 'Marketing', present: 26, absent: 2, rate: 92.9 },
        { department: 'HR', present: 11, absent: 1, rate: 91.7 },
        { department: 'Finance', present: 18, absent: 0, rate: 100 }
      ]
    };

    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/leave
// @desc    Get leave report data
// @access  Private
router.get('/leave', authenticate, async (req, res) => {
  try {
    // Mock leave data for now
    const leaveData = {
      summary: {
        totalLeaves: 156,
        pendingApprovals: 15,
        approvedThisMonth: 45,
        rejectedThisMonth: 3
      },
      leaveTypes: [
        { type: 'Sick Leave', count: 45, approved: 40, pending: 5 },
        { type: 'Casual Leave', count: 78, approved: 70, pending: 8 },
        { type: 'Earned Leave', count: 65, approved: 63, pending: 2 },
        { type: 'Maternity Leave', count: 8, approved: 8, pending: 0 }
      ],
      monthlyTrends: [
        { month: 'Jan', leaves: 25 },
        { month: 'Feb', leaves: 18 },
        { month: 'Mar', leaves: 32 },
        { month: 'Apr', leaves: 28 },
        { month: 'May', leaves: 35 },
        { month: 'Jun', leaves: 18 }
      ]
    };

    res.json(leaveData);
  } catch (error) {
    console.error('Error fetching leave data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/payroll
// @desc    Get payroll report data
// @access  Private
router.get('/payroll', authenticate, async (req, res) => {
  try {
    // Check if user has permission to view payroll data
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    // Mock payroll data for now
    const payrollData = {
      summary: {
        totalPayroll: 1250000,
        employeeCount: 135,
        averageSalary: 92593,
        totalDeductions: 187500
      },
      departmentWise: [
        { department: 'Engineering', totalSalary: 562500, employeeCount: 45, avgSalary: 125000 },
        { department: 'Sales', totalSalary: 320000, employeeCount: 32, avgSalary: 100000 },
        { department: 'Marketing', totalSalary: 210000, employeeCount: 28, avgSalary: 75000 },
        { department: 'HR', totalSalary: 90000, employeeCount: 12, avgSalary: 75000 },
        { department: 'Finance', totalSalary: 135000, employeeCount: 18, avgSalary: 75000 }
      ],
      monthlyTrends: [
        { month: 'Jan', amount: 1200000 },
        { month: 'Feb', amount: 1225000 },
        { month: 'Mar', amount: 1250000 },
        { month: 'Apr', amount: 1275000 },
        { month: 'May', amount: 1250000 },
        { month: 'Jun', amount: 1300000 }
      ]
    };

    res.json(payrollData);
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;