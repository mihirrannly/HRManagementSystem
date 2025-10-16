import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  LocalAirport as LocalAirportIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Hotel as HotelIcon,
  DirectionsCar as DirectionsCarIcon,
  Business as BusinessIcon,
  LocalHospital as LocalHospitalIcon,
  Phone as PhoneIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ExpenseModule = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [stats, setStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: moment().format('YYYY-MM-DD'),
    employeeNotes: '',
    reimbursement: {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      upiId: '',
      paymentMethod: 'bank_transfer',
    },
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const categories = [
    { value: 'meals', label: 'Meals & Entertainment', icon: <RestaurantIcon /> },
    { value: 'travel', label: 'Travel', icon: <FlightTakeoffIcon /> },
    { value: 'accommodation', label: 'Accommodation', icon: <HotelIcon /> },
    { value: 'transport', label: 'Transport', icon: <DirectionsCarIcon /> },
    { value: 'office', label: 'Office Supplies', icon: <BusinessIcon /> },
    { value: 'medical', label: 'Medical', icon: <LocalHospitalIcon /> },
    { value: 'communication', label: 'Communication', icon: <PhoneIcon /> },
    { value: 'other', label: 'Other', icon: <CategoryIcon /> },
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'hr')) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The API returns { user: {...}, employee: {...} }, so we need to extract the user object
      const user = response.data.user || response.data;
      setCurrentUser(user);
      console.log('Current user loaded:', { email: user.email, role: user.role });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const expenses = response.data.expenses || [];
      setExpenses(expenses);
      console.log(`Fetched ${expenses.length} expenses`);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showSnackbar('Error fetching expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/expenses/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      description: '',
      expenseDate: moment().format('YYYY-MM-DD'),
      employeeNotes: '',
      reimbursement: {
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        upiId: '',
        paymentMethod: 'bank_transfer',
      },
    });
    setSelectedFiles([]);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleReimbursementChange = (field, value) => {
    setFormData({
      ...formData,
      reimbursement: { ...formData.reimbursement, [field]: value },
    });
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmitExpense = async () => {
    // Validation
    if (!formData.category || !formData.amount || !formData.description || !formData.expenseDate) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    if (selectedFiles.length === 0) {
      showSnackbar('Please attach at least one receipt', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();

      submitData.append('category', formData.category);
      submitData.append('amount', formData.amount);
      submitData.append('description', formData.description);
      submitData.append('expenseDate', formData.expenseDate);
      submitData.append('employeeNotes', formData.employeeNotes);
      submitData.append('reimbursement', JSON.stringify(formData.reimbursement));

      selectedFiles.forEach((file) => {
        submitData.append('receipts', file);
      });

      await axios.post(`${API_URL}/api/expenses`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      showSnackbar('Expense submitted successfully!', 'success');
      handleCloseDialog();
      fetchExpenses();
    } catch (error) {
      console.error('Error submitting expense:', error);
      showSnackbar(error.response?.data?.message || 'Error submitting expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setOpenViewDialog(true);
  };

  const handleOpenApprovalDialog = (expense, action) => {
    setSelectedExpense(expense);
    setApprovalAction(action);
    setRejectionReason('');
    setAdminNotes('');
    setOpenApprovalDialog(true);
  };

  const handleApproveReject = async () => {
    if (approvalAction === 'reject' && !rejectionReason) {
      showSnackbar('Please provide a rejection reason', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        approvalAction === 'approve'
          ? `${API_URL}/api/expenses/${selectedExpense._id}/approve`
          : `${API_URL}/api/expenses/${selectedExpense._id}/reject`;

      const data = approvalAction === 'approve' ? { adminNotes } : { rejectionReason, adminNotes };

      await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSnackbar(
        `Expense ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully!`,
        'success'
      );
      setOpenApprovalDialog(false);
      setOpenViewDialog(false);
      fetchExpenses();
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'hr')) {
        fetchStats();
      }
    } catch (error) {
      console.error(`Error ${approvalAction}ing expense:`, error);
      showSnackbar(error.response?.data?.message || `Error ${approvalAction}ing expense`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSnackbar('Expense deleted successfully!', 'success');
      setOpenViewDialog(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
      processing: { color: 'info', label: 'Processing' },
      reimbursed: { color: 'success', label: 'Reimbursed' },
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getCategoryIcon = (category) => {
    const categoryObj = categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.icon : <CategoryIcon />;
  };

  const getCategoryLabel = (category) => {
    const categoryObj = categories.find((cat) => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  };

  const getStatsValue = (statusKey) => {
    if (!stats || !stats.statusStats) return 0;
    const stat = stats.statusStats.find((s) => s._id === statusKey);
    return stat ? stat.count : 0;
  };

  const getTotalAmount = () => {
    if (!stats || !stats.statusStats) return 0;
    return stats.statusStats
      .filter((s) => s._id !== 'rejected')
      .reduce((sum, stat) => sum + (stat.totalAmount || 0), 0);
  };

  const isHROrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'hr');

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Expense & Travel Management
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Submit Expense
            </Button>
        </Box>

        {/* Stats Cards - Show for HR/Admin */}
        {isHROrAdmin && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', color: 'white' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <AttachMoneyIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  ₹{getTotalAmount().toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  Total Expenses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <ScheduleIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {getStatsValue('pending')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  Pending Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <CheckCircleIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {getStatsValue('approved')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)', color: 'white' }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <AccountBalanceIcon sx={{ fontSize: 32, mb: 0.5 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {getStatsValue('reimbursed')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                  Reimbursed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Expenses List */}
        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : expenses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No expenses found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Submit your first expense to get started
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
                Submit Expense
              </Button>
            </Box>
          ) : (
            <List>
              {expenses.map((expense, index) => (
                <React.Fragment key={expense._id}>
                  {index > 0 && <Divider />}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleViewExpense(expense)} sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getCategoryIcon(expense.category)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {expense.description}
                            </Typography>
                            {getStatusChip(expense.status)}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {isHROrAdmin && (
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500, 
                                  color: 'primary.main',
                                  mb: 0.5 
                                }}
                              >
                                👤 {expense.employeeName} ({expense.employeeId})
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {getCategoryLabel(expense.category)} • ₹
                              {expense.amount.toLocaleString()} •{' '}
                              {moment(expense.expenseDate).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {expense.receipts?.length || 0} receipt(s) attached • Submitted{' '}
                              {moment(expense.createdAt).fromNow()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold">
                          ₹{expense.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Add/Edit Expense Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Submit Expense
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => handleFormChange('category', e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cat.icon}
                          {cat.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Brief description of the expense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Expense Date"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => handleFormChange('expenseDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ height: '56px' }}
                >
                  Upload Receipts
                  <input type="file" hidden multiple accept="image/*,.pdf" onChange={handleFileSelect} />
                </Button>
              </Grid>

              {/* Display selected files */}
              {selectedFiles.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files ({selectedFiles.length}):
                  </Typography>
                  <Stack spacing={1}>
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {file.name}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={formData.employeeNotes}
                  onChange={(e) => handleFormChange('employeeNotes', e.target.value)}
                  placeholder="Any additional information"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Reimbursement Details (Optional)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.reimbursement.paymentMethod}
                    label="Payment Method"
                    onChange={(e) => handleReimbursementChange('paymentMethod', e.target.value)}
                  >
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  value={formData.reimbursement.accountHolderName}
                  onChange={(e) => handleReimbursementChange('accountHolderName', e.target.value)}
                />
              </Grid>
              {(formData.reimbursement.paymentMethod === 'bank_transfer' ||
                formData.reimbursement.paymentMethod === 'cheque') && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={formData.reimbursement.accountNumber}
                      onChange={(e) => handleReimbursementChange('accountNumber', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={formData.reimbursement.bankName}
                      onChange={(e) => handleReimbursementChange('bankName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      value={formData.reimbursement.ifscCode}
                      onChange={(e) => handleReimbursementChange('ifscCode', e.target.value)}
                    />
                  </Grid>
                </>
              )}
              {formData.reimbursement.paymentMethod === 'upi' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    value={formData.reimbursement.upiId}
                    onChange={(e) => handleReimbursementChange('upiId', e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitExpense}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              Submit Expense
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Expense Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedExpense && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getCategoryIcon(selectedExpense.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedExpense.description}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getCategoryLabel(selectedExpense.category)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={() => setOpenViewDialog(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {getStatusChip(selectedExpense.status)}
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₹{selectedExpense.amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Expense Date
                    </Typography>
                    <Typography variant="body1">
                      {moment(selectedExpense.expenseDate).format('MMM DD, YYYY')}
                    </Typography>
                  </Grid>

                  {isHROrAdmin && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Employee
                        </Typography>
                        <Typography variant="body1">{selectedExpense.employeeName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1">{selectedExpense.employeeId}</Typography>
                      </Grid>
                    </>
                  )}

                  {selectedExpense.employeeNotes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Employee Notes
                      </Typography>
                      <Typography variant="body1">{selectedExpense.employeeNotes}</Typography>
                    </Grid>
                  )}

                  {selectedExpense.adminNotes && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2" fontWeight="bold">
                          Admin Notes:
                        </Typography>
                        <Typography variant="body2">{selectedExpense.adminNotes}</Typography>
                      </Alert>
                    </Grid>
                  )}

                  {selectedExpense.rejectionReason && (
                    <Grid item xs={12}>
                      <Alert severity="error">
                        <Typography variant="body2" fontWeight="bold">
                          Rejection Reason:
                        </Typography>
                        <Typography variant="body2">{selectedExpense.rejectionReason}</Typography>
                      </Alert>
                    </Grid>
                  )}

                  {selectedExpense.reimbursement &&
                    selectedExpense.reimbursement.paymentMethod && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Reimbursement Details
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Method
                          </Typography>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {selectedExpense.reimbursement.paymentMethod.replace('_', ' ')}
                          </Typography>
                        </Grid>
                        {selectedExpense.reimbursement.accountHolderName && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Account Holder
                            </Typography>
                            <Typography variant="body1">
                              {selectedExpense.reimbursement.accountHolderName}
                            </Typography>
                          </Grid>
                        )}
                      </>
                    )}

                  {selectedExpense.receipts && selectedExpense.receipts.length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Receipts ({selectedExpense.receipts.length})
                      </Typography>
                      <ImageList cols={3} gap={8}>
                        {selectedExpense.receipts.map((receipt, index) => (
                          <ImageListItem key={index}>
                            {receipt.mimetype?.includes('image') ? (
                              <img
                                src={`${API_URL}${receipt.url}`}
                                alt={receipt.originalName}
                                style={{ height: 150, objectFit: 'cover' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: 150,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'grey.200',
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 60 }} />
                              </Box>
                            )}
                            <ImageListItemBar
                              title={receipt.originalName}
                              actionIcon={
                                <IconButton
                                  sx={{ color: 'white' }}
                                  onClick={() => window.open(`${API_URL}${receipt.url}`, '_blank')}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted: {moment(selectedExpense.createdAt).format('MMM DD, YYYY hh:mm A')}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                {selectedExpense.status === 'pending' &&
                  !isHROrAdmin &&
                  currentUser &&
                  selectedExpense.employee._id === (currentUser.id || currentUser._id) && (
                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteExpense(selectedExpense._id)}
                    >
                      Delete
                    </Button>
                  )}

                {selectedExpense.status === 'pending' && isHROrAdmin && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenApprovalDialog(selectedExpense, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenApprovalDialog(selectedExpense, 'approve')}
                    >
                      Approve
                    </Button>
                  </>
                )}

                <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Approval/Rejection Dialog */}
        <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {approvalAction === 'approve' ? 'Approve Expense' : 'Reject Expense'}
          </DialogTitle>
          <DialogContent>
            {approvalAction === 'reject' && (
              <TextField
                fullWidth
                required
                label="Rejection Reason"
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear reason for rejection"
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Admin Notes (Optional)"
              multiline
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Any additional notes"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenApprovalDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color={approvalAction === 'approve' ? 'success' : 'error'}
              onClick={handleApproveReject}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ExpenseModule;
