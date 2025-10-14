const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Announcement = require('../models/Announcement');
const Employee = require('../models/Employee');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/announcements
// @desc    Create a new announcement (HR/Admin only)
// @access  Private (HR, Admin)
router.post('/', [
  authenticate,
  authorize(['admin', 'hr']),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('content').notEmpty().trim().withMessage('Content is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().isIn(['general', 'policy', 'event', 'update', 'urgent', 'celebration']),
  body('targetAudience').optional().isIn(['all', 'department', 'location', 'role']),
  body('isPoll').optional().isBoolean(),
  body('pollOptions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      priority,
      category,
      targetAudience,
      targetDepartments,
      targetLocations,
      targetRoles,
      startDate,
      endDate,
      isPinned,
      isPoll,
      pollOptions,
      pollMultipleChoice
    } = req.body;

    // Get creator info
    const employee = await Employee.findOne({ user: req.user._id })
      .select('personalInfo.firstName personalInfo.lastName');
    
    const createdByName = employee 
      ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
      : req.user.email;

    // Create announcement
    const announcement = new Announcement({
      title,
      content,
      priority: priority || 'medium',
      category: category || 'general',
      targetAudience: targetAudience || 'all',
      targetDepartments: targetDepartments || [],
      targetLocations: targetLocations || [],
      targetRoles: targetRoles || [],
      createdBy: req.user._id,
      createdByName,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      isPinned: isPinned || false,
      isPoll: isPoll || false,
      pollOptions: isPoll && pollOptions ? pollOptions.map(opt => ({
        option: typeof opt === 'string' ? opt : opt.option,
        votes: []
      })) : [],
      pollMultipleChoice: pollMultipleChoice || false
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/announcements
// @desc    Get all announcements (visible to current user)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { showInactive, limit } = req.query;
    
    // Build query
    let query = {};
    
    // Only admin/HR can see inactive announcements
    if (!showInactive || !['admin', 'hr'].includes(req.user.role)) {
      query.isActive = true;
      
      // Filter by date range
      const now = new Date();
      query.$or = [
        { startDate: { $lte: now }, $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        { startDate: { $lte: now }, endDate: { $exists: false } }
      ];
    }

    // Fetch announcements
    let announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50);

    // Get employee info for filtering
    const employee = await Employee.findOne({ user: req.user._id });

    // Filter announcements based on visibility
    announcements = announcements.filter(announcement => 
      announcement.isVisibleToUser(req.user, employee)
    );

    // Add user-specific data
    const enrichedAnnouncements = announcements.map(announcement => {
      const announcementObj = announcement.toObject();
      
      // Check if user has viewed
      announcementObj.hasViewed = announcement.views.some(
        view => view.user.toString() === req.user._id.toString()
      );
      
      // Check if user has reacted
      announcementObj.userReaction = announcement.reactions.find(
        reaction => reaction.user.toString() === req.user._id.toString()
      )?.type || null;
      
      // Add poll results if it's a poll
      if (announcement.isPoll) {
        announcementObj.pollResults = announcement.getPollResults();
        announcementObj.hasVoted = announcement.hasUserVoted(req.user._id);
      }
      
      // Count reactions by type
      announcementObj.reactionCounts = announcement.reactions.reduce((counts, reaction) => {
        counts[reaction.type] = (counts[reaction.type] || 0) + 1;
        return counts;
      }, {});
      
      return announcementObj;
    });

    res.json({
      success: true,
      count: enrichedAnnouncements.length,
      announcements: enrichedAnnouncements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Get employee info for visibility check
    const employee = await Employee.findOne({ user: req.user._id });
    
    // Check visibility
    if (!announcement.isVisibleToUser(req.user, employee) && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Track view
    if (!announcement.views.some(view => view.user.toString() === req.user._id.toString())) {
      announcement.views.push({ user: req.user._id });
      await announcement.save();
    }

    // Prepare response with user-specific data
    const announcementObj = announcement.toObject();
    announcementObj.hasViewed = true;
    announcementObj.userReaction = announcement.reactions.find(
      reaction => reaction.user.toString() === req.user._id.toString()
    )?.type || null;
    
    if (announcement.isPoll) {
      announcementObj.pollResults = announcement.getPollResults();
      announcementObj.hasVoted = announcement.hasUserVoted(req.user._id);
    }
    
    announcementObj.reactionCounts = announcement.reactions.reduce((counts, reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      return counts;
    }, {});

    res.json({
      success: true,
      announcement: announcementObj
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement (HR/Admin only)
// @access  Private (HR, Admin)
router.put('/:id', [
  authenticate,
  authorize(['admin', 'hr']),
  body('title').optional().trim(),
  body('content').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().isIn(['general', 'policy', 'event', 'update', 'urgent', 'celebration'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'content', 'priority', 'category', 'targetAudience',
      'targetDepartments', 'targetLocations', 'targetRoles',
      'startDate', 'endDate', 'isPinned', 'isActive', 'isPoll'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        announcement[field] = req.body[field];
      }
    });

    // Handle poll options separately to preserve existing votes
    if (req.body.isPoll !== undefined) {
      if (req.body.isPoll && req.body.pollOptions) {
        // Update poll options
        const existingOptions = announcement.pollOptions || [];
        const newOptions = req.body.pollOptions.map((option, index) => {
          // If option text matches existing, preserve votes
          const existing = existingOptions.find(opt => opt.option === option);
          if (existing) {
            return existing;
          }
          // New option
          return { option, votes: [] };
        });
        announcement.pollOptions = newOptions;
      } else if (!req.body.isPoll) {
        // Remove poll if isPoll is set to false
        announcement.pollOptions = [];
      }
    }

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (HR/Admin only)
// @access  Private (HR, Admin)
router.delete('/:id', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/announcements/:id/react
// @desc    Add/update reaction to announcement
// @access  Private
router.post('/:id/react', [
  authenticate,
  body('type').isIn(['like', 'love', 'celebrate', 'support', 'insightful'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const { type } = req.body;

    // Remove existing reaction if any
    announcement.reactions = announcement.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );

    // Add new reaction
    announcement.reactions.push({
      user: req.user._id,
      type
    });

    await announcement.save();

    res.json({
      success: true,
      message: 'Reaction added successfully',
      reactionCounts: announcement.reactions.reduce((counts, reaction) => {
        counts[reaction.type] = (counts[reaction.type] || 0) + 1;
        return counts;
      }, {})
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/announcements/:id/vote
// @desc    Vote on a poll
// @access  Private
router.post('/:id/vote', [
  authenticate,
  body('optionIndex').isInt({ min: 0 }).withMessage('Valid option index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    if (!announcement.isPoll) {
      return res.status(400).json({
        success: false,
        message: 'This announcement is not a poll'
      });
    }

    const { optionIndex } = req.body;

    if (optionIndex >= announcement.pollOptions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option index'
      });
    }

    // Check if user has already voted
    const hasVoted = announcement.hasUserVoted(req.user._id);

    if (hasVoted && !announcement.pollMultipleChoice) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll'
      });
    }

    // If not multiple choice, remove previous vote
    if (!announcement.pollMultipleChoice) {
      announcement.pollOptions.forEach(option => {
        option.votes = option.votes.filter(
          vote => vote.user.toString() !== req.user._id.toString()
        );
      });
    }

    // Add vote
    announcement.pollOptions[optionIndex].votes.push({
      user: req.user._id
    });

    await announcement.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      pollResults: announcement.getPollResults()
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/announcements/stats/dashboard
// @desc    Get announcement statistics (HR/Admin only)
// @access  Private (HR, Admin)
router.get('/stats/dashboard', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const pinnedAnnouncements = await Announcement.countDocuments({ isPinned: true, isActive: true });
    const activePolls = await Announcement.countDocuments({ isPoll: true, isActive: true });

    // Get recent announcements with engagement stats
    const recentAnnouncements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title views reactions createdAt');

    const stats = {
      total: totalAnnouncements,
      active: activeAnnouncements,
      pinned: pinnedAnnouncements,
      polls: activePolls,
      recentAnnouncements: recentAnnouncements.map(a => ({
        id: a._id,
        title: a.title,
        views: a.views.length,
        reactions: a.reactions.length,
        createdAt: a.createdAt
      }))
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

