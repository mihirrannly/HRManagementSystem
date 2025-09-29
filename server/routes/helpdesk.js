const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const Employee = require('../models/Employee');

const router = express.Router();

// Simple in-memory ticket storage (in production, use a database model)
let tickets = [];
let ticketCounter = 1000;

// @route   POST /api/helpdesk/tickets
// @desc    Create a new support ticket
// @access  Private (Employee)
router.post('/tickets', [
  authenticate,
  body('category').isIn(['payroll', 'it', 'hr', 'leave', 'other']),
  body('subject').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, subject, description, priority } = req.body;

    // Get employee info
    const employee = await Employee.findOne({ user: req.user._id })
      .select('employeeId personalInfo.firstName personalInfo.lastName');

    const ticket = {
      id: `TKT-${ticketCounter++}`,
      employeeId: employee?.employeeId || 'Unknown',
      employeeName: employee ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}` : 'Unknown',
      userId: req.user._id,
      category,
      subject,
      description,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedTo: null,
      responses: []
    };

    tickets.push(ticket);

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        category: ticket.category,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/helpdesk/tickets/my
// @desc    Get current user's tickets
// @access  Private (Employee)
router.get('/tickets/my', authenticate, async (req, res) => {
  try {
    const userTickets = tickets.filter(ticket => ticket.userId.toString() === req.user._id.toString());
    
    res.json({
      tickets: userTickets.map(ticket => ({
        id: ticket.id,
        category: ticket.category,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        responseCount: ticket.responses.length
      }))
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/helpdesk/tickets
// @desc    Get all tickets (HR/Admin only)
// @access  Private (HR, Admin)
router.get('/tickets', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    let filteredTickets = tickets;
    
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
    }
    
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    res.json({
      tickets: filteredTickets.map(ticket => ({
        id: ticket.id,
        employeeId: ticket.employeeId,
        employeeName: ticket.employeeName,
        category: ticket.category,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        assignedTo: ticket.assignedTo,
        responseCount: ticket.responses.length
      }))
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/helpdesk/tickets/:id
// @desc    Get ticket details
// @access  Private
router.get('/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is HR/Admin
    if (ticket.userId.toString() !== req.user._id.toString() && 
        !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/helpdesk/tickets/:id
// @desc    Update ticket status (HR/Admin only)
// @access  Private (HR, Admin)
router.put('/tickets/:id', [
  authenticate,
  authorize(['admin', 'hr']),
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed']),
  body('assignedTo').optional(),
  body('response').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { status, assignedTo, response } = req.body;
    
    if (status) tickets[ticketIndex].status = status;
    if (assignedTo) tickets[ticketIndex].assignedTo = assignedTo;
    
    if (response) {
      tickets[ticketIndex].responses.push({
        message: response,
        respondedBy: req.user._id,
        respondedAt: new Date()
      });
    }
    
    tickets[ticketIndex].updatedAt = new Date();

    res.json({
      message: 'Ticket updated successfully',
      ticket: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/helpdesk/stats
// @desc    Get helpdesk statistics (HR/Admin only)
// @access  Private (HR, Admin)
router.get('/stats', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      byCategory: {
        payroll: tickets.filter(t => t.category === 'payroll').length,
        it: tickets.filter(t => t.category === 'it').length,
        hr: tickets.filter(t => t.category === 'hr').length,
        leave: tickets.filter(t => t.category === 'leave').length,
        other: tickets.filter(t => t.category === 'other').length
      },
      byPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get helpdesk stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;