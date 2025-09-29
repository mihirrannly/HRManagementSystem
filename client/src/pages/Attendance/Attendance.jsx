import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Group as TeamIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';
import IdleDetector from '../../components/IdleDetector';
import LocationValidator from '../../components/LocationValidator';

const Attendance = () => {
  const { user, isEmployee, forceLogout } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalHours: 0,
    averageHours: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [teamSummary, setTeamSummary] = useState(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [earlyLeaveReason, setEarlyLeaveReason] = useState('');
  const [currentAction, setCurrentAction] = useState(null); // 'checkin' or 'checkout'

  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceRecords();
    if (!isEmployee) {
      fetchTeamSummary();
    }
  }, []);

  useEffect(() => {
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchTodayStatus();
      if (!isEmployee) {
        fetchTeamSummary();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isEmployee]);

  const fetchTodayStatus = async () => {
    try {
      console.log('🔍 Fetching today status...');
      const token = localStorage.getItem('token');
      console.log('🔐 Token in localStorage:', !!token);
      
      // Decode token to see what user it belongs to
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔐 Token payload:', payload);
          console.log('🔐 Token userId:', payload.userId);
        } catch (e) {
          console.log('🔐 Could not decode token');
        }
      }
      
      const response = await axios.get('/attendance/today-status');
      console.log('✅ Today status response:', response.data);
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('❌ Error fetching today status:', error.response?.status, error.response?.data);
    }
  };

  const fetchTeamSummary = async () => {
    try {
      const response = await axios.get('/attendance/team-summary');
      setTeamSummary(response.data);
    } catch (error) {
      console.error('Error fetching team summary:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      console.log('🔍 Fetching attendance records...');
      console.log('🔐 Token in localStorage:', !!localStorage.getItem('token'));
      setLoading(true);
      const response = await axios.get('/attendance/summary');
      console.log('✅ Attendance records response:', response.data);
      setAttendanceRecords(response.data.records || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('❌ Error fetching attendance records:', error.response?.status, error.response?.data);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInClick = () => {
    // For testing: bypass location validation
    const mockLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Test Location - Office'
    };
    processCheckIn(mockLocation);
  };

  const handleCheckOutClick = () => {
    // For testing: bypass early checkout dialog and location validation
    const mockLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Test Location - Office'
    };
    processCheckOut(mockLocation);
  };

  const handleLocationValidated = useCallback((location) => {
    setLocationData(location);
    setShowLocationDialog(false);
    
    if (currentAction === 'checkin') {
      processCheckIn(location);
    } else if (currentAction === 'checkout') {
      processCheckOut(location);
    }
  }, [currentAction]);

  const handleLocationError = useCallback((error) => {
    toast.error(error);
    setShowLocationDialog(false);
    setCurrentAction(null);
  }, []);

  const processCheckIn = async (location) => {
    try {
      const response = await axios.post('/attendance/checkin', {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.isLate) {
          toast.warning(`You are ${response.data.lateMinutes} minutes late`);
        }
      }
      
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
    setCurrentAction(null);
  };

  const processCheckOut = async (location) => {
    try {
      const response = await axios.post('/attendance/checkout', {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        },
        earlyLeaveReason: earlyLeaveReason || undefined
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.isEarlyDeparture) {
          toast.warning(`Early departure: ${response.data.earlyMinutes} minutes`);
        }
      }
      
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
    setCurrentAction(null);
    setEarlyLeaveReason('');
  };

  const handleEarlyCheckout = () => {
    setCheckoutDialog(false);
    setCurrentAction('checkout');
    setShowLocationDialog(true);
  };

  const handleIdleSession = useCallback((idleData) => {
    console.log('Idle session recorded:', idleData);
    // Refresh attendance data after idle session
    fetchTodayStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'half-day':
        return 'info';
      case 'on-leave':
        return 'secondary';
      case 'weekend':
        return 'default';
      default:
        return 'default';
    }
  };

  const isCheckedIn = attendanceStatus?.checkIn?.time;
  const isCheckedOut = attendanceStatus?.checkOut?.time;
  
  // For testing: make check-in always available (unless already checked in)
  const canCheckIn = !isCheckedIn;
  const canCheckOut = isCheckedIn && !isCheckedOut;

  // Helper function to get card background color
  const getCardColor = () => {
    if (attendanceStatus?.status === 'on-leave') return 'secondary.main';
    if (attendanceStatus?.status === 'weekend') return 'grey.600';
    if (attendanceStatus?.isLate) return 'warning.main';
    return 'primary.main';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Attendance
          </Typography>
          <Chip 
            label="🧪 Testing Mode - Location Validation Disabled" 
            color="warning" 
            size="small" 
            sx={{ mt: 1 }}
          />
          <Chip 
            label={`🔐 Token: ${localStorage.getItem('token') ? 'EXISTS' : 'MISSING'}`}
            color={localStorage.getItem('token') ? 'success' : 'error'}
            size="small" 
            sx={{ mt: 1, ml: 1 }}
          />
          <Chip 
            label={`👤 User: ${user?.email || 'NONE'}`}
            color={user ? 'info' : 'error'}
            size="small" 
            sx={{ mt: 1, ml: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={forceLogout}
            sx={{ mr: 1 }}
          >
            🔧 Clear Auth & Reload
          </Button>
          <IconButton onClick={() => {
            fetchTodayStatus();
            fetchAttendanceRecords();
            if (!isEmployee) fetchTeamSummary();
          }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Today's Status Card for Employees */}
      {isEmployee && (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="500" gutterBottom>
                  Today's Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment().format('dddd, MMMM Do YYYY')}
                </Typography>
                {isCheckedIn && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Checked in at {moment(attendanceStatus.checkIn.time).format('HH:mm')}
                    </Typography>
                    {attendanceStatus.isLate && (
                      <Chip
                        label={`Late by ${attendanceStatus.lateMinutes} mins`}
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}
                {isCheckedOut && (
                  <Typography variant="caption" color="text.secondary">
                    Checked out at {moment(attendanceStatus.checkOut.time).format('HH:mm')}
                  </Typography>
                )}
                {attendanceStatus?.totalHours > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Total hours: {attendanceStatus.totalHours.toFixed(2)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CheckInIcon sx={{ fontSize: '1rem' }} />}
                    onClick={handleCheckInClick}
                    disabled={!canCheckIn}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Check In
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CheckOutIcon sx={{ fontSize: '1rem' }} />}
                    onClick={handleCheckOutClick}
                    disabled={!canCheckOut}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Check Out
                  </Button>
                </Box>
                
                {/* Status indicators */}
                {attendanceStatus?.status === 'on-leave' && (
                  <Chip
                    label="On Leave"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  />
                )}
                {attendanceStatus?.status === 'weekend' && (
                  <Chip
                    label="Weekend"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  />
                )}
                {isCheckedOut && (
                  <Chip
                    label="Day Completed"
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="500">
                {stats.presentDays}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Present Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="500">
                {stats.absentDays}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Absent Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="500">
                {stats.lateDays}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Late Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight="500">
                {stats.averageHours.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Hours/Day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Records Table */}
      {(isEmployee || tabValue === 0) && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            My Attendance Records
          </Typography>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Late Minutes</TableCell>
                  <TableCell>Idle Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      {moment(record.date).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      {record.checkIn?.time
                        ? moment(record.checkIn.time).format('HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkOut?.time
                        ? moment(record.checkOut.time).format('HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.totalHours ? record.totalHours.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {record.isLate ? record.lateMinutes : '-'}
                    </TableCell>
                    <TableCell>
                      {record.idleTime?.totalIdleMinutes 
                        ? `${Math.floor(record.idleTime.totalIdleMinutes / 60)}h ${record.idleTime.totalIdleMinutes % 60}m`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {attendanceRecords.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Team Summary Tab */}
      {!isEmployee && tabValue === 1 && teamSummary && (
        <>
          {/* Team Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {teamSummary.totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {teamSummary.present}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {teamSummary.absent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {teamSummary.late}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Team Members Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              Team Attendance - {moment(teamSummary.date).format('DD/MM/YYYY')}
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Late Minutes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamSummary.employees.map((emp) => (
                    <TableRow key={emp.employee._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {emp.employee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.employee.employeeId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {emp.checkInTime
                          ? moment(emp.checkInTime).format('HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {emp.checkOutTime
                          ? moment(emp.checkOutTime).format('HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {emp.totalHours ? emp.totalHours.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          color={getStatusColor(emp.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {emp.isLate ? emp.lateMinutes : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Location Validation Dialog */}
      <Dialog
        open={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon />
            Location Verification Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please verify your location to {currentAction === 'checkin' ? 'check in' : 'check out'}.
            You must be within office premises to mark attendance.
          </Typography>
          <LocationValidator
            onLocationValidated={handleLocationValidated}
            onValidationError={handleLocationError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowLocationDialog(false);
            setCurrentAction(null);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Early Checkout Dialog */}
      <Dialog
        open={checkoutDialog}
        onClose={() => setCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Early Checkout
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are checking out before the standard work hours (6:00 PM).
          </Alert>
          <TextField
            fullWidth
            label="Reason for early leave (optional)"
            multiline
            rows={3}
            value={earlyLeaveReason}
            onChange={(e) => setEarlyLeaveReason(e.target.value)}
            placeholder="Please provide a reason for leaving early..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleEarlyCheckout} variant="contained">
            Proceed with Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;
