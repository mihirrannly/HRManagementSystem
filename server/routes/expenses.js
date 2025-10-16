const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const { authenticate } = require('../middleware/auth');
const { uploads, getFileUrl } = require('../middleware/s3Upload');

// Create expense upload middleware (for receipts)
const expenseUpload = uploads.document || require('multer')({ dest: 'uploads/expenses/' });

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private (Authenticated employees)
 */
router.post('/', authenticate, expenseUpload.array('receipts', 10), async (req, res) => {
  try {
    const { 
      category, 
      amount, 
      description, 
      expenseDate, 
      employeeNotes,
      reimbursement 
    } = req.body;

    // Validate required fields
    if (!category || !amount || !description || !expenseDate) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: category, amount, description, and expenseDate' 
      });
    }

    // Fetch employee information to get the name and employee ID
    const employee = await Employee.findOne({ user: req.user._id });
    let employeeName = req.user.email; // Fallback to email
    let employeeId = req.user._id.toString(); // Fallback to user ID

    if (employee) {
      employeeName = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`.trim();
      employeeId = employee.employeeId || req.user._id.toString();
    }

    // Process uploaded receipts
    const receipts = req.files ? req.files.map(file => ({
      filename: file.filename || file.key,
      originalName: file.originalname,
      url: getFileUrl(file),
      key: file.key || null,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    })) : [];

    // Parse reimbursement details if provided as string
    let reimbursementData = null;
    if (reimbursement) {
      try {
        reimbursementData = typeof reimbursement === 'string' 
          ? JSON.parse(reimbursement) 
          : reimbursement;
      } catch (error) {
        console.error('Error parsing reimbursement data:', error);
      }
    }

    // Create expense
    const expense = new Expense({
      employee: req.user._id,
      employeeName,
      employeeId,
      category,
      amount: parseFloat(amount),
      description,
      expenseDate: new Date(expenseDate),
      receipts,
      reimbursement: reimbursementData,
      employeeNotes,
      status: 'pending'
    });

    await expense.save();

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ 
      message: 'Error creating expense', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/expenses
 * @desc    Get expenses (employees see their own, HR/Admin see all)
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, startDate, endDate, category, page = 1, limit = 50 } = req.query;
    
    // Build query
    let query = { isDeleted: false };
    
    // Employees can only see their own expenses
    // HR and Admins can see all expenses
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      query.employee = req.user._id;
    }
    
    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('employee', 'name username email employeeId')
      .populate('approvedBy', 'name username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Expense.countDocuments(query);
    
    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ 
      message: 'Error fetching expenses', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/expenses/my
 * @desc    Get current user's expenses
 * @access  Private
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { 
      employee: req.user._id,
      isDeleted: false 
    };
    
    if (status) {
      query.status = status;
    }
    
    const expenses = await Expense.find(query)
      .populate('approvedBy', 'name username email')
      .sort({ createdAt: -1 });
    
    res.json({ expenses });
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    res.status(500).json({ 
      message: 'Error fetching expenses', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/expenses/stats
 * @desc    Get expense statistics
 * @access  Private (HR/Admin)
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Only HR and Admin can see stats
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const stats = await Expense.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const categoryStats = await Expense.aggregate([
      { $match: { isDeleted: false, status: { $ne: 'rejected' } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      statusStats: stats,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/expenses/:id
 * @desc    Get expense by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employee', 'name username email employeeId')
      .populate('approvedBy', 'name username email');
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Check access: employee can see own, HR/Admin can see all
    if (req.user.role !== 'admin' && 
        req.user.role !== 'hr' && 
        expense.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ 
      message: 'Error fetching expense', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update expense (only pending expenses can be updated by employee)
 * @access  Private
 */
router.put('/:id', authenticate, expenseUpload.array('receipts', 10), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Only the employee who created can update, and only if status is pending
    if (expense.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update expense that has been processed' 
      });
    }
    
    // Update fields
    const { category, amount, description, expenseDate, employeeNotes, reimbursement } = req.body;
    
    if (category) expense.category = category;
    if (amount) expense.amount = parseFloat(amount);
    if (description) expense.description = description;
    if (expenseDate) expense.expenseDate = new Date(expenseDate);
    if (employeeNotes !== undefined) expense.employeeNotes = employeeNotes;
    
    if (reimbursement) {
      try {
        expense.reimbursement = typeof reimbursement === 'string' 
          ? JSON.parse(reimbursement) 
          : reimbursement;
      } catch (error) {
        console.error('Error parsing reimbursement data:', error);
      }
    }
    
    // Add new receipts if uploaded
    if (req.files && req.files.length > 0) {
      const newReceipts = req.files.map(file => ({
        filename: file.filename || file.key,
        originalName: file.originalname,
        url: getFileUrl(file),
        key: file.key || null,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
      
      expense.receipts = [...expense.receipts, ...newReceipts];
    }
    
    await expense.save();
    
    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ 
      message: 'Error updating expense', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/expenses/:id/approve
 * @desc    Approve expense
 * @access  Private (HR/Admin only)
 */
router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    // Only HR and Admin can approve
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { adminNotes } = req.body;
    
    const expense = await Expense.findById(req.params.id)
      .populate('employee', 'name username email employeeId');
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending expenses can be approved' 
      });
    }
    
    expense.status = 'approved';
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    if (adminNotes) expense.adminNotes = adminNotes;
    
    await expense.save();
    
    res.json({
      message: 'Expense approved successfully',
      expense
    });
  } catch (error) {
    console.error('Error approving expense:', error);
    res.status(500).json({ 
      message: 'Error approving expense', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/expenses/:id/reject
 * @desc    Reject expense
 * @access  Private (HR/Admin only)
 */
router.put('/:id/reject', authenticate, async (req, res) => {
  try {
    // Only HR and Admin can reject
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { rejectionReason, adminNotes } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        message: 'Please provide a rejection reason' 
      });
    }
    
    const expense = await Expense.findById(req.params.id)
      .populate('employee', 'name username email employeeId');
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending expenses can be rejected' 
      });
    }
    
    expense.status = 'rejected';
    expense.rejectionReason = rejectionReason;
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    if (adminNotes) expense.adminNotes = adminNotes;
    
    await expense.save();
    
    res.json({
      message: 'Expense rejected',
      expense
    });
  } catch (error) {
    console.error('Error rejecting expense:', error);
    res.status(500).json({ 
      message: 'Error rejecting expense', 
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/expenses/:id/reimburse
 * @desc    Mark expense as reimbursed
 * @access  Private (HR/Admin only)
 */
router.put('/:id/reimburse', authenticate, async (req, res) => {
  try {
    // Only HR and Admin can mark as reimbursed
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { reimbursedAmount, transactionId, adminNotes } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    if (expense.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Only approved expenses can be reimbursed' 
      });
    }
    
    expense.status = 'reimbursed';
    expense.reimbursedAmount = reimbursedAmount || expense.amount;
    expense.reimbursedAt = new Date();
    if (transactionId) expense.transactionId = transactionId;
    if (adminNotes) expense.adminNotes = adminNotes;
    
    await expense.save();
    
    res.json({
      message: 'Expense marked as reimbursed',
      expense
    });
  } catch (error) {
    console.error('Error updating reimbursement:', error);
    res.status(500).json({ 
      message: 'Error updating reimbursement', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense (soft delete)
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Only the employee who created can delete, and only if status is pending
    // HR/Admin can delete any expense
    const isOwner = expense.employee.toString() === req.user._id.toString();
    const isHROrAdmin = req.user.role === 'admin' || req.user.role === 'hr';
    
    if (!isOwner && !isHROrAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (isOwner && expense.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot delete expense that has been processed' 
      });
    }
    
    expense.isDeleted = true;
    await expense.save();
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ 
      message: 'Error deleting expense', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/expenses/:expenseId/receipts/:receiptId
 * @desc    Delete a receipt from an expense
 * @access  Private
 */
router.delete('/:expenseId/receipts/:receiptId', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Only the employee who created can delete receipts, and only if status is pending
    if (expense.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (expense.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot modify expense that has been processed' 
      });
    }
    
    expense.receipts = expense.receipts.filter(
      receipt => receipt._id.toString() !== req.params.receiptId
    );
    
    await expense.save();
    
    res.json({ 
      message: 'Receipt deleted successfully',
      expense 
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ 
      message: 'Error deleting receipt', 
      error: error.message 
    });
  }
});

module.exports = router;


