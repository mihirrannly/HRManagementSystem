const express = require('express');
const router = express.Router();
const ProbationFeedback = require('../models/ProbationFeedback');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { authenticate, authorize } = require('../middleware/auth');

// @route   GET /api/probation-feedback/my-feedback
// @desc    Get feedback form for logged-in employee
// @access  Private (Employee)
router.get('/my-feedback', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const feedback = await ProbationFeedback.findOne({ employee: employee._id })
      .sort({ createdAt: -1 })
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'No pending feedback form found'
      });
    }

    res.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('Error fetching employee feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback form',
      error: error.message
    });
  }
});

// @route   GET /api/probation-feedback/manager-feedback
// @desc    Get feedback forms for employees reporting to the logged-in manager
// @access  Private (Manager)
router.get('/manager-feedback', authenticate, async (req, res) => {
  try {
    const manager = await Employee.findOne({ user: req.user._id });
    
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Manager profile not found'
      });
    }

    const feedbacks = await ProbationFeedback.find({ 
      manager: manager._id,
      status: { $in: ['pending', 'employee_completed'] }
    })
    .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId profilePicture')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });

  } catch (error) {
    console.error('Error fetching manager feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback forms',
      error: error.message
    });
  }
});

// @route   GET /api/probation-feedback/:id
// @desc    Get specific feedback form by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const feedback = await ProbationFeedback.findById(req.params.id)
      .populate('employee', 'personalInfo employeeId profilePicture employmentInfo')
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback form not found'
      });
    }

    // Check if user has permission to view this feedback
    const employee = await Employee.findOne({ user: req.user._id });
    const isEmployee = employee && feedback.employee._id.toString() === employee._id.toString();
    const isManager = employee && feedback.manager && feedback.manager._id.toString() === employee._id.toString();
    const isHR = req.user.role === 'hr' || req.user.role === 'admin';

    if (!isEmployee && !isManager && !isHR) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this feedback'
      });
    }

    res.json({
      success: true,
      feedback,
      permissions: {
        canViewEmployeeFeedback: isEmployee || isManager || isHR,
        canViewManagerFeedback: isManager || isHR,
        canEditEmployeeFeedback: isEmployee && !feedback.employeeFeedback.submitted,
        canEditManagerFeedback: isManager && !feedback.managerFeedback.submitted
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/probation-feedback/:id/employee
// @desc    Submit employee self-assessment feedback
// @access  Private (Employee)
router.put('/:id/employee', authenticate, async (req, res) => {
  try {
    const feedback = await ProbationFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback form not found'
      });
    }

    // Verify that the logged-in user is the employee
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee || feedback.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own feedback'
      });
    }

    // Check if already submitted
    if (feedback.employeeFeedback.submitted) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted'
      });
    }

    // Update employee feedback
    feedback.employeeFeedback = {
      ...req.body,
      submitted: true,
      submittedAt: new Date()
    };

    await feedback.save();

    // Create notification for manager
    if (feedback.manager) {
      const notification = new Notification({
        recipient: feedback.manager,
        recipientRole: 'manager',
        type: 'probation_completed',
        title: `${feedback.employeeName} Completed Their Probation Feedback`,
        message: `${feedback.employeeName} has submitted their self-assessment. Please complete your manager assessment.`,
        relatedEmployee: feedback.employee,
        metadata: {
          feedbackId: feedback._id.toString(),
          employeeName: feedback.employeeName
        },
        actionRequired: true,
        actionUrl: `/probation-feedback/manager/${feedback._id}`,
        priority: 'high'
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Error submitting employee feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// @route   PUT /api/probation-feedback/:id/manager
// @desc    Submit manager assessment feedback
// @access  Private (Manager)
router.put('/:id/manager', authenticate, async (req, res) => {
  try {
    const feedback = await ProbationFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback form not found'
      });
    }

    // Verify that the logged-in user is the manager
    const manager = await Employee.findOne({ user: req.user._id });
    if (!manager || !feedback.manager || feedback.manager.toString() !== manager._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your team members'
      });
    }

    // Check if already submitted
    if (feedback.managerFeedback.submitted) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted'
      });
    }

    // Validate recommendation
    if (!req.body.recommendation) {
      return res.status(400).json({
        success: false,
        message: 'Recommendation is required'
      });
    }

    // Update manager feedback
    feedback.managerFeedback = {
      ...req.body,
      submitted: true,
      submittedAt: new Date(),
      submittedBy: manager._id
    };

    await feedback.save();

    // Create notification for HR
    const hrUsers = await Employee.find({
      'employmentInfo.isActive': true
    })
    .populate('user', 'role')
    .lean();

    for (const hrUser of hrUsers) {
      if (hrUser.user && (hrUser.user.role === 'hr' || hrUser.user.role === 'admin')) {
        const notification = new Notification({
          recipient: hrUser._id,
          recipientRole: hrUser.user.role,
          type: 'probation_completed',
          title: `Probation Review Completed - ${feedback.employeeName}`,
          message: `Both employee and manager feedbacks have been submitted for ${feedback.employeeName}. Review and take action.`,
          relatedEmployee: feedback.employee,
          metadata: {
            feedbackId: feedback._id.toString(),
            employeeName: feedback.employeeName,
            recommendation: feedback.managerFeedback.recommendation
          },
          actionRequired: true,
          actionUrl: `/probation-feedback/review/${feedback._id}`,
          priority: 'high'
        });
        await notification.save();
      }
    }

    res.json({
      success: true,
      message: 'Manager assessment submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Error submitting manager feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: error.message
    });
  }
});

// @route   GET /api/probation-feedback/all
// @desc    Get all feedback forms (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/all/list', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const feedbacks = await ProbationFeedback.find(query)
      .populate('employee', 'personalInfo employeeId profilePicture')
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProbationFeedback.countDocuments(query);

    res.json({
      success: true,
      feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: error.message
    });
  }
});

// @route   PUT /api/probation-feedback/:id/hr-review
// @desc    Submit HR review and final decision
// @access  Private (HR/Admin)
router.put('/:id/hr-review', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const feedback = await ProbationFeedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback form not found'
      });
    }

    const { finalDecision, hrComments } = req.body;

    if (!finalDecision) {
      return res.status(400).json({
        success: false,
        message: 'Final decision is required'
      });
    }

    feedback.hrReview = {
      reviewed: true,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      finalDecision,
      hrComments
    };

    feedback.status = 'reviewed';

    await feedback.save();

    // Create notification for employee
    const notification = new Notification({
      recipient: feedback.employee,
      recipientRole: 'employee',
      type: 'probation_completed',
      title: 'Probation Review Completed',
      message: `Your probation review has been completed. Decision: ${finalDecision}`,
      metadata: {
        feedbackId: feedback._id.toString(),
        decision: finalDecision
      },
      priority: 'high'
    });
    await notification.save();

    res.json({
      success: true,
      message: 'HR review submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Error submitting HR review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit HR review',
      error: error.message
    });
  }
});

// @route   GET /api/probation-feedback/stats/overview
// @desc    Get probation feedback statistics
// @access  Private (HR/Admin)
router.get('/stats/overview', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const total = await ProbationFeedback.countDocuments();
    const pending = await ProbationFeedback.countDocuments({ status: 'pending' });
    const employeeCompleted = await ProbationFeedback.countDocuments({ status: 'employee_completed' });
    const managerCompleted = await ProbationFeedback.countDocuments({ status: 'manager_completed' });
    const bothCompleted = await ProbationFeedback.countDocuments({ status: 'both_completed' });
    const reviewed = await ProbationFeedback.countDocuments({ status: 'reviewed' });

    // Get recent feedbacks
    const recentFeedbacks = await ProbationFeedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employee', 'personalInfo employeeId profilePicture')
      .lean();

    // Get overdue feedbacks (older than 7 days and not completed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const overdue = await ProbationFeedback.countDocuments({
      status: { $in: ['pending', 'employee_completed', 'manager_completed'] },
      createdAt: { $lte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        employeeCompleted,
        managerCompleted,
        bothCompleted,
        reviewed,
        overdue
      },
      recentFeedbacks
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;

