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
  const { user, isHR, isAdmin, isManager } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLeaveBalances(balancesRes.data || []);
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
      toast.error(`Failed to ${action} leave request`);
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
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const canApproveReject = (request) => {
    if (isHR || isAdmin) return true;
    if (isManager && request.employee?._id !== user?.employee?.id) return true;
    return false;
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
        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Leave Balances
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {leaveBalances.map((balance) => (
            <Grid item xs={12} sm={6} md={3} key={balance._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {balance.leaveType?.name}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {balance.available}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available out of {balance.allocated}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" display="block">
                      Used: {balance.used} | Pending: {balance.pending}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(balance.used / balance.allocated) * 100}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Leave Requests Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            Leave Requests
          </Typography>
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
                {leaveRequests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>
                      {request.employee?.personalInfo?.firstName} {request.employee?.personalInfo?.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.leaveType?.name}
                        size="small"
                        sx={{ bgcolor: request.leaveType?.color, color: 'white' }}
                      />
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
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {moment(request.appliedDate).format('DD/MM/YYYY')}
                    </TableCell>
                    {(isHR || isAdmin || isManager) && (
                      <TableCell>
                        {request.status === 'pending' && canApproveReject(request) && (
                          <Box>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveReject(request._id, 'approve')}
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleApproveReject(request._id, 'reject')}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {leaveRequests.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No leave requests found
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
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.name}
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
                />
              </Grid>
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
