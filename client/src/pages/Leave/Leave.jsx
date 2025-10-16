import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

const Leave = () => {
  const { user, employee, isHR, isAdmin, isManager } = useAuth();
  
  // Debug logging
  console.log('🔍 Leave component user data:', {
    user,
    employee,
    isHR,
    isAdmin,
    isManager
  });

  // Add a manual refresh button for debugging
  const handleForceRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState('all'); // 'all', 'own', 'others'
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
  });

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [requestsRes, typesRes, balancesRes] = await Promise.all([
        axios.get('/leave/requests'),
        axios.get('/leave/types'),
        axios.get('/leave/balance'),
      ]);

      setLeaveRequests(requestsRes.data.requests || []);
      setLeaveTypes(typesRes.data || []);
      
      // Handle new response format with monthly data
      if (balancesRes.data.balances) {
        setLeaveBalances(balancesRes.data.balances);
        setCurrentMonth(balancesRes.data.currentMonth);
        setCurrentYear(balancesRes.data.currentYear);
      } else {
        // Fallback for old format
        setLeaveBalances(balancesRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error('Failed to fetch leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeaveRequest = async () => {
    try {
      if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
        toast.error('Please fill all required fields');
        return;
      }

      await axios.post('/leave/request', {
        leaveType: formData.leaveType,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
        reason: formData.reason,
      });

      toast.success('Leave request submitted successfully');
      setOpenDialog(false);
      setFormData({ leaveType: '', startDate: null, endDate: null, reason: '' });
      fetchLeaveData();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleApproveReject = async (requestId, action, comments = '') => {
    try {
      await axios.put(`/leave/requests/${requestId}/approve`, {
        action,
        comments,
      });

      toast.success(`Leave request ${action}d successfully`);
      fetchLeaveData();
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      
      // Show detailed error message if available
      let errorMessage = `Failed to ${action} leave request`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to approve this leave request. Please check your permissions.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request. You may have already processed this request.';
      }
      
      toast.error(errorMessage, {
        autoClose: 8000, // Show longer for detailed messages
      });
      
      // Log detailed error information for debugging
      if (error.response?.data?.details) {
        console.log('📋 Authorization Details:', error.response.data.details);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'partially_approved':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'partially_approved':
        return 'Partially Approved';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canApproveReject = (request) => {
    if (!user || !request) return false;
    
    console.log('🔍 canApproveReject check:', {
      user: user,
      employee: employee,
      userRole: user?.role,
      employeeId: employee?._id,
      requestStatus: request.status,
      approvalFlow: request.approvalFlow,
      approvalFlowDetails: request.approvalFlow?.map(a => ({
        type: a.approverType,
        status: a.status,
        approverId: a.approver?._id,
        approverName: a.approver?.personalInfo ? `${a.approver.personalInfo.firstName} ${a.approver.personalInfo.lastName}` : 'Unknown'
      }))
    });
    
    // Check if user can approve based on the new approval workflow
    
    // Check if request is still pending or partially approved
    if (request.status !== 'pending' && request.status !== 'partially_approved') {
      console.log('❌ Request not in approvable state:', request.status);
      return false;
    }
    
    // Check if user has already approved/rejected this request
    if (request.approvalFlow && employee?._id) {
      const userApproval = request.approvalFlow.find(approval => {
        if (user?.role === 'hr' && approval.approverType === 'hr' && approval.approver._id === employee._id) return true;
        if (user?.role === 'admin' && approval.approverType === 'admin' && approval.approver._id === employee._id) return true;
        if (user?.role === 'manager' && approval.approverType === 'manager' && approval.approver._id === employee._id) return true;
        return false;
      });
      
      // If user has already processed this request, they can't do it again
      if (userApproval && userApproval.status !== 'pending') {
        console.log('❌ User already processed this request:', userApproval.status);
        return false;
      }
    }
    
    // HR users can approve HR approvals
    if (user?.role === 'hr') {
      const canApprove = request.approvalFlow?.some(approval => 
        approval.approverType === 'hr' && 
        approval.status === 'pending' &&
        approval.approver._id === employee?._id
      );
      console.log('✅ HR can approve:', canApprove);
      return canApprove;
    }
    
    // Admin users can approve if they are in the approval flow as managers or admins
    if (user?.role === 'admin') {
      console.log('🔍 Detailed admin check:', {
        employeeId: employee?._id,
        approvalFlowDetails: request.approvalFlow?.map(a => ({
          type: a.approverType,
          approverId: a.approver?._id,
          status: a.status,
          approverName: a.approver?.personalInfo ? `${a.approver.personalInfo.firstName} ${a.approver.personalInfo.lastName}` : 'Unknown',
          idMatch: a.approver?._id === employee?._id
        }))
      });
      
      // Admin can approve as manager (for their direct reports) or as admin (fallback for HR leaves)
      const canApprove = request.approvalFlow?.some(approval => 
        (approval.approverType === 'manager' || approval.approverType === 'admin') && 
        approval.status === 'pending' &&
        approval.approver?._id === employee?._id
      );
      console.log('✅ Admin can approve (manager or admin):', canApprove);
      return canApprove;
    }
    
    // Manager users can approve manager approvals
    if (user?.role === 'manager') {
      const canApprove = request.approvalFlow?.some(approval => 
        approval.approverType === 'manager' && 
        approval.status === 'pending' &&
        approval.approver._id === employee?._id
      );
      console.log('✅ Manager can approve:', canApprove);
      return canApprove;
    }
    
    console.log('❌ No approval permission found for role:', user?.role);
    return false;
  };

  const getApprovalButtonText = (request) => {
    if (!request.approvalFlow) return { approve: 'Approve', reject: 'Reject' };
    
    const userApproval = request.approvalFlow.find(approval => {
      if (isHR && approval.approverType === 'hr' && approval.approver._id === employee?._id) return true;
      if (isAdmin && (approval.approverType === 'admin' || approval.approverType === 'manager') && approval.approver._id === employee?._id) return true;
      if (isManager && approval.approverType === 'manager' && approval.approver._id === employee?._id) return true;
      return false;
    });
    
    if (userApproval && userApproval.status === 'approved') {
      return { approve: 'Already Approved', reject: 'Revoke & Reject' };
    }
    if (userApproval && userApproval.status === 'rejected') {
      return { approve: 'Approve', reject: 'Already Rejected' };
    }
    
    return { approve: 'Approve', reject: 'Reject' };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Leave Management
          </Typography>
          <Box>
            <IconButton onClick={fetchLeaveData}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ ml: 1 }}
            >
              Apply Leave
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        {/* Leave Balances */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Leave Balances
          </Typography>
          {currentMonth && (
            <Chip 
              label={`Current Month: ${currentMonth} ${currentYear}`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {leaveBalances.map((balance) => (
            <Grid item xs={12} sm={6} md={4} key={balance._id}>
              <Card sx={{ height: '100%', border: `2px solid ${balance.leaveType?.color}20` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: balance.leaveType?.color,
                        mr: 1
                      }} 
                    />
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 0 }}>
                      {balance.leaveType?.name}
                    </Typography>
                  </Box>

                  {/* Monthly allocation display for Casual and Sick leaves */}
                  {balance.monthly && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: `${balance.leaveType?.color}10`, borderRadius: 1 }}>
                      <Typography variant="caption" display="block" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                        This Month ({currentMonth})
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {balance.monthly.available}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / {balance.monthly.total} available
                        </Typography>
                      </Box>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                        Base: {balance.monthly.base} 
                        {balance.monthly.carryForward > 0 && (
                          <span style={{ color: balance.leaveType?.color, fontWeight: 'bold' }}>
                            {' '}+ {balance.monthly.carryForward} carry forward
                          </span>
                        )}
                      </Typography>
                      {balance.monthly.used > 0 || balance.monthly.pending > 0 ? (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Used: {balance.monthly.used || 0}
                          {balance.monthly.pending > 0 && (
                            <span style={{ color: 'orange', fontWeight: 'bold' }}>
                              {' '}| Pending: {balance.monthly.pending}
                            </span>
                          )}
                        </Typography>
                      ) : null}
                      {balance.monthly.carryForward > 0 && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'success.lighter', borderRadius: 0.5, border: '1px solid', borderColor: 'success.main' }}>
                          <Typography variant="caption" color="success.dark" fontWeight="bold">
                            🎉 Extra {balance.monthly.carryForward} leave(s) carried forward!
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Yearly allocation display */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                      Yearly Balance
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                      {balance.available}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Available out of {balance.allocated}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                      Used: {balance.used} | Pending: {balance.pending}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: `${balance.leaveType?.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: balance.leaveType?.color
                        }
                      }}
                    />
                  </Box>

                  {balance._id === 'special' && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Includes Marriage & Bereavement Leave
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Leave Requests Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Leave Requests
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2'
                  }}
                />
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  Your Requests: {leaveRequests.filter(req => req.employee?._id === employee?._id).length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#757575'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Other Employees: {leaveRequests.filter(req => req.employee?._id !== employee?._id).length}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={requestFilter === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setRequestFilter('all')}
                  sx={{ minWidth: 60 }}
                >
                  All
                </Button>
                <Button
                  size="small"
                  variant={requestFilter === 'own' ? 'contained' : 'outlined'}
                  onClick={() => setRequestFilter('own')}
                  sx={{ minWidth: 60 }}
                >
                  Yours
                </Button>
                <Button
                  size="small"
                  variant={requestFilter === 'others' ? 'contained' : 'outlined'}
                  onClick={() => setRequestFilter('others')}
                  sx={{ minWidth: 60 }}
                >
                  Others
                </Button>
              </Box>
            </Box>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied Date</TableCell>
                  {(isHR || isAdmin || isManager) && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests
                  .filter((request) => {
                    const isOwnRequest = request.employee?._id === employee?._id;
                    if (requestFilter === 'own') return isOwnRequest;
                    if (requestFilter === 'others') return !isOwnRequest;
                    return true; // 'all'
                  })
                  .map((request) => {
                    const isOwnRequest = request.employee?._id === employee?._id;
                  return (
                    <TableRow 
                      key={request._id} 
                      hover
                      sx={{
                        backgroundColor: isOwnRequest ? '#f8f9fa' : 'inherit',
                        '&:hover': {
                          backgroundColor: isOwnRequest ? '#e9ecef' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isOwnRequest ? (
                            <>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: '#1976d2',
                                  flexShrink: 0
                                }}
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: '#1976d2'
                                }}
                              >
                                {request.employee?.personalInfo?.firstName} {request.employee?.personalInfo?.lastName}
                              </Typography>
                              <Chip
                                label="You"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: '#757575',
                                  flexShrink: 0
                                }}
                              />
                              <Typography variant="body2">
                                {request.employee?.personalInfo?.firstName} {request.employee?.personalInfo?.lastName}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: request.leaveType?.color,
                            mr: 1
                          }} 
                        />
                        <Chip
                          label={request.leaveType?.name}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: request.leaveType?.color,
                            color: request.leaveType?.color
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {moment(request.startDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      {moment(request.endDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{request.totalDays}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={request.reason}
                      >
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                          {isOwnRequest && (
                            <Chip
                              label="Your Request"
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ 
                                fontSize: '0.7rem',
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          )}
                        </Box>
                        {request.status === 'partially_approved' && request.approvalFlow && (
                          <Box sx={{ mt: 1 }}>
                            {request.approvalFlow.map((approval, index) => (
                              <Typography key={index} variant="caption" display="block" color="text.secondary">
                                {approval.approverType === 'manager' ? '👨‍💼 Manager' : 
                                 approval.approverType === 'hr' ? '🏢 HR' : 
                                 approval.approverType === 'admin' ? '👑 Admin' : '❓ Unknown'}: {
                                  approval.status === 'approved' ? '✅ Approved' : 
                                  approval.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'
                                }
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {moment(request.appliedDate).format('DD/MM/YYYY')}
                    </TableCell>
                    {(isHR || isAdmin || isManager) && (
                      <TableCell>
                        {((request.status === 'pending' || request.status === 'partially_approved') && canApproveReject(request)) && (
                          <Box>
                            <Tooltip title={getApprovalButtonText(request).approve}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveReject(request._id, 'approve')}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={getApprovalButtonText(request).reject}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleApproveReject(request._id, 'reject')}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        {user?.role === 'admin' && (request.status === 'pending' || request.status === 'partially_approved') && !canApproveReject(request) && (
                          <Tooltip title="Admins can view all leave requests. They can only approve when they are the reporting manager for HR employees.">
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              👁️ View Only
                            </Typography>
                          </Tooltip>
                        )}
                        {request.status === 'approved' && (
                          <Typography variant="caption" color="success.main">
                            ✅ Fully Approved
                          </Typography>
                        )}
                        {request.status === 'rejected' && (
                          <Typography variant="caption" color="error.main">
                            ❌ Rejected
                          </Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
                {leaveRequests
                  .filter((request) => {
                    const isOwnRequest = request.employee?._id === employee?._id;
                    if (requestFilter === 'own') return isOwnRequest;
                    if (requestFilter === 'others') return !isOwnRequest;
                    return true; // 'all'
                  }).length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {requestFilter === 'own' ? 'No leave requests found for you' :
                       requestFilter === 'others' ? 'No leave requests found for other employees' :
                       'No leave requests found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Apply Leave Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Leave Type"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  helperText="Select the type of leave you want to apply for"
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: type.color,
                            mr: 2
                          }} 
                        />
                        <Box>
                          <Typography variant="body1">{type.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={moment()}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={formData.startDate || moment()}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  helperText="Please provide a detailed reason for your leave request"
                />
              </Grid>
              {formData.leaveType && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Leave Policy Information:
                    </Typography>
                    {(formData.leaveType === 'casual' || formData.leaveType === 'sick') && (
                      <Typography variant="body2" color="text.secondary">
                        • You can take maximum 1 {formData.leaveType} leave per month normally<br/>
                        • In special cases, maximum 4 leaves can be taken in a month<br/>
                        • Total {formData.leaveType} leaves per year: 12
                      </Typography>
                    )}
                    {(formData.leaveType === 'marriage' || formData.leaveType === 'bereavement') && (
                      <Typography variant="body2" color="text.secondary">
                        • Special leave can be taken maximum 3 days per year<br/>
                        • {formData.leaveType === 'marriage' ? 'For own marriage only' : 'For close family members only'}<br/>
                        • Total special leaves per year: 3 (combined for marriage and bereavement)
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitLeaveRequest}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Leave;
