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
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Group as TeamIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarTodayIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';
import IdleDetector from '../../components/IdleDetector';

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
  const [calendarData, setCalendarData] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(moment());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD')
  });
  // Location and checkout dialog states removed - functionality moved to dashboard only
  
  // Edit attendance states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    checkInTime: '',
    checkOutTime: '',
    status: '',
    notes: ''
  });

  // Calendar day detail modal states
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceRecords();
    if (!isEmployee) {
      fetchTeamSummary();
      fetchCalendarData();
    }
  }, []);

  useEffect(() => {
    if (!isEmployee && tabValue === 2) {
      fetchCalendarData();
    }
  }, [tabValue, calendarMonth, selectedEmployee]);

  useEffect(() => {
    if (!isEmployee && tabValue === 1) {
      fetchTeamSummary(selectedPeriod, customDateRange);
    }
  }, [selectedPeriod, customDateRange, tabValue]);

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

  const fetchTeamSummary = async (period = selectedPeriod, customRange = customDateRange) => {
    try {
      console.log('🔍 Fetching team summary for period:', period);
      
      let params = {};
      if (period === 'custom') {
        params = {
          startDate: customRange.startDate,
          endDate: customRange.endDate
        };
      } else {
        params = { period };
      }
      
      const response = await axios.get('/attendance/team-summary', { params });
      console.log('✅ Team summary response:', response.data);
      console.log('📊 Team summary stats:', response.data.stats);
      setTeamSummary(response.data);
    } catch (error) {
      console.error('❌ Error fetching team summary:', error);
      toast.error('Failed to fetch team summary');
    }
  };

  const fetchCalendarData = async (month = calendarMonth) => {
    try {
      console.log('🔍 Fetching calendar data for month:', month.format('YYYY-MM'));
      const startDate = month.clone().startOf('month').format('YYYY-MM-DD');
      const endDate = month.clone().endOf('month').format('YYYY-MM-DD');
      
      const params = { startDate, endDate };
      if (selectedEmployee !== 'all') {
        params.employeeId = selectedEmployee;
      }
      
      const response = await axios.get('/attendance/calendar', { params });
      console.log('✅ Calendar data response:', response.data);
      setCalendarData(response.data);
    } catch (error) {
      console.error('❌ Error fetching calendar data:', error);
      toast.error('Failed to fetch calendar data');
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

  // Check-in/Check-out handlers removed - functionality moved to dashboard only

  // Location validation and check-in/out processing functions removed - functionality moved to dashboard only

  // Early checkout handler removed - functionality moved to dashboard only

  const handleIdleSession = useCallback((idleData) => {
    console.log('Idle session recorded:', idleData);
    // Refresh attendance data after idle session
    fetchTodayStatus();
  }, []);

  // Handle calendar day card click
  const handleDayCardClick = (dayData) => {
    setSelectedDayData(dayData);
    setDayDetailModalOpen(true);
  };

  // Close day detail modal
  const handleCloseDayDetailModal = () => {
    setDayDetailModalOpen(false);
    setSelectedDayData(null);
  };

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

  // Helper function to format minutes to hours and minutes
  const formatLateMinutes = (minutes) => {
    if (!minutes || minutes === 0) return '-';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m late`;
    } else if (hours > 0) {
      return `${hours}h late`;
    } else {
      return `${remainingMinutes}m late`;
    }
  };

  const isCheckedIn = attendanceStatus?.checkIn?.time;
  const isCheckedOut = attendanceStatus?.checkOut?.time;
  
  // Check-in/out availability variables removed - functionality moved to dashboard only

  // Helper function to get card background color
  const getCardColor = () => {
    if (attendanceStatus?.status === 'on-leave') return 'secondary.main';
    if (attendanceStatus?.status === 'weekend') return 'grey.600';
    if (attendanceStatus?.isLate) return 'warning.main';
    return 'primary.main';
  };

  // Edit attendance functions
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditFormData({
      checkInTime: record.checkIn?.time ? moment(record.checkIn.time).format('HH:mm') : '',
      checkOutTime: record.checkOut?.time ? moment(record.checkOut.time).format('HH:mm') : '',
      status: record.status || '',
      notes: record.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingRecord(null);
    setEditFormData({
      checkInTime: '',
      checkOutTime: '',
      status: '',
      notes: ''
    });
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;

    try {
      const payload = {
        checkInTime: editFormData.checkInTime ? `${moment(editingRecord.date).format('YYYY-MM-DD')} ${editFormData.checkInTime}` : null,
        checkOutTime: editFormData.checkOutTime ? `${moment(editingRecord.date).format('YYYY-MM-DD')} ${editFormData.checkOutTime}` : null,
        status: editFormData.status,
        notes: editFormData.notes
      };

      await axios.put(`/api/attendance/${editingRecord._id}/manual-entry`, payload);
      toast.success('Attendance record updated successfully');
      
      // Refresh data
      fetchAttendanceRecords();
      if (!isEmployee) fetchTeamSummary();
      
      handleEditClose();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to update attendance record');
    }
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Enhanced Header Section */}
      <Box sx={{ mb: 3, borderBottom: '1px solid #e0e0e0', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1.4rem', mb: 0.5 }}>
              Attendance Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {moment().format('dddd, MMMM Do YYYY')} • {moment().format('HH:mm')}
              </Typography>
              <Chip 
                label="🧪 Testing" 
                size="small" 
                variant="outlined"
                sx={{ 
                  height: '18px', 
                  fontSize: '0.65rem',
                  '& .MuiChip-label': { px: 0.8 }
                }}
              />
              {user?.email && (
                <Chip 
                  label={user.email}
                  size="small" 
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    height: '18px', 
                    fontSize: '0.65rem',
                    '& .MuiChip-label': { px: 0.8 }
                  }}
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Last updated: {moment().format('HH:mm:ss')}
            </Typography>
            <IconButton 
              size="small"
              onClick={() => {
                fetchTodayStatus();
                fetchAttendanceRecords();
                if (!isEmployee) fetchTeamSummary();
              }}
              sx={{ p: 0.5 }}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
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
                {/* Check-in/Check-out buttons removed - these are now only available on the dashboard */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    Use dashboard for check-in/check-out
                  </Typography>
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

      {/* Enhanced Statistics Overview */}
      <Box sx={{ mb: 3 }}>
        {/* Primary Stats */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8',
              borderRadius: 1,
              '&:hover': { boxShadow: 1 }
            }}>
              <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50', mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.3 }}>
                {stats.presentDays}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Present Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8',
              borderRadius: 1,
              '&:hover': { boxShadow: 1 }
            }}>
              <CancelIcon sx={{ fontSize: 20, color: '#f44336', mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.3 }}>
                {stats.absentDays}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Absent Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8',
              borderRadius: 1,
              '&:hover': { boxShadow: 1 }
            }}>
              <ScheduleIcon sx={{ fontSize: 20, color: '#ff9800', mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.3 }}>
                {stats.lateDays}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Late Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8',
              borderRadius: 1,
              '&:hover': { boxShadow: 1 }
            }}>
              <TimeIcon sx={{ fontSize: 20, color: '#2196f3', mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 0.3 }}>
                {stats.averageHours.toFixed(1)}h
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Avg Hours/Day
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Secondary Stats */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {stats.totalHours.toFixed(0)}h
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Total Hours
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {((stats.presentDays / Math.max(stats.presentDays + stats.absentDays, 1)) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Attendance
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {((stats.lateDays / Math.max(stats.presentDays, 1)) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Late Rate
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {moment().format('MMM')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Period
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {moment().daysInMonth()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Work Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Paper sx={{ 
              p: 1.5, 
              textAlign: 'center', 
              border: '1px solid #e8e8e8', 
              bgcolor: '#fafafa',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {moment().date()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Today
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Tab Navigation for Admin Users */}
      {!isEmployee && (
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(event, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: '1px solid #e0e0e0' }}
          >
            <Tab 
              label="My Attendance Records" 
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label={
                <Badge 
                  badgeContent={teamSummary?.stats?.presentToday || 0} 
                  color="primary" 
                  sx={{ '& .MuiBadge-badge': { right: -12, top: -2 } }}
                >
                  Team Summary
                </Badge>
              } 
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="Calendar View" 
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Paper>
      )}

      {/* Enhanced Attendance Records Table */}
      {(isEmployee || tabValue === 0) && (
        <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0', 
            bgcolor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              My Attendance Records
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {attendanceRecords.length} records • Current month
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Check In
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Check Out
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Hours
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Late Time
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Break Time
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    bgcolor: '#f5f5f5',
                    py: 1.5
                  }}>
                    Overtime
                  </TableCell>
                  {!isEmployee && (
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5,
                      width: 80
                    }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record, index) => (
                  <TableRow 
                    key={record._id} 
                    hover 
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                      '&:hover': { bgcolor: '#f0f0f0' }
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {moment(record.date).format('DD/MM')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {moment(record.date).format('ddd')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      {record.checkIn?.time ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {moment(record.checkIn.time).format('HH:mm')}
                          </Typography>
                          {record.isLate && (
                            <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.65rem' }}>
                              Late
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      {record.checkOut?.time ? (
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {moment(record.checkOut.time).format('HH:mm')}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Working...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      {record.totalHours ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {record.totalHours.toFixed(1)}h
                          </Typography>
                          {record.totalHours >= 9 && (
                            <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem' }}>
                              Full day
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.65rem', 
                          height: '20px',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {record.isLate ? formatLateMinutes(record.lateMinutes) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {record.idleTime?.totalIdleMinutes 
                          ? `${Math.floor(record.idleTime.totalIdleMinutes / 60)}h ${record.idleTime.totalIdleMinutes % 60}m`
                          : '0m'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.75rem',
                          color: record.totalHours > 9 ? 'warning.main' : 'text.secondary'
                        }}
                      >
                        {record.totalHours > 9 ? `+${(record.totalHours - 9).toFixed(1)}h` : '0h'}
                      </Typography>
                    </TableCell>
                    {!isEmployee && (
                      <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(record)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {attendanceRecords.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={!isEmployee ? 9 : 8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        No attendance records found for this period
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Team Summary Tab */}
      {console.log('🎯 UI Debug:', { isEmployee, tabValue, hasTeamSummary: !!teamSummary, teamSummaryEmployees: teamSummary?.employees?.length, teamSummaryStats: teamSummary?.stats })}
      {!isEmployee && tabValue === 1 && (
        <>
          {/* Date Range Filter */}
          <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📅 Select Time Period
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    label="Time Period"
                  >
                    <MenuItem value="today">📅 Today</MenuItem>
                    <MenuItem value="yesterday">📅 Yesterday</MenuItem>
                    <MenuItem value="week">📅 This Week</MenuItem>
                    <MenuItem value="month">📅 This Month</MenuItem>
                    <MenuItem value="quarter">📅 This Quarter</MenuItem>
                    <MenuItem value="custom">📅 Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {selectedPeriod === 'custom' && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            {teamSummary?.dateRange && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  📊 Showing data from <strong>{moment(teamSummary.dateRange.startDate).format('MMM DD, YYYY')}</strong> to <strong>{moment(teamSummary.dateRange.endDate).format('MMM DD, YYYY')}</strong>
                  {teamSummary.dateRange.period !== 'custom' && (
                    <span> ({teamSummary.dateRange.period})</span>
                  )}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Team Statistics */}
          {teamSummary && teamSummary.stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {teamSummary.stats?.totalEmployees || 0}
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
                    {teamSummary.stats?.presentRecords || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {teamSummary.stats?.absentRecords || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {teamSummary.stats?.lateRecords || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {teamSummary.stats?.attendanceRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {teamSummary.stats?.totalHours || 0}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          )}

          {/* Daily Breakdown for Multi-day Periods */}
          {teamSummary?.attendanceByDate && Object.keys(teamSummary.attendanceByDate).length > 1 && (
            <Paper sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0', 
                bgcolor: '#f8f9fa'
              }}>
                <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  📊 Daily Breakdown
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {Object.values(teamSummary.attendanceByDate).map((dayData) => {
                  const presentCount = dayData.employees.filter(emp => emp.status === 'present' || emp.status === 'late').length;
                  const absentCount = dayData.employees.filter(emp => emp.status === 'absent').length;
                  const lateCount = dayData.employees.filter(emp => emp.status === 'late').length;
                  const weekendCount = dayData.employees.filter(emp => emp.status === 'weekend').length;
                  
                  return (
                    <Box key={dayData.date} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        {moment(dayData.date).format('dddd, MMM DD, YYYY')}
                        {dayData.isWeekend && <Chip label="Weekend" size="small" sx={{ ml: 1, bgcolor: '#9e9e9e', color: 'white' }} />}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main">{presentCount}</Typography>
                            <Typography variant="caption">Present</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="warning.main">{lateCount}</Typography>
                            <Typography variant="caption">Late</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="error">{absentCount}</Typography>
                            <Typography variant="caption">Absent</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">{weekendCount}</Typography>
                            <Typography variant="caption">Weekend</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}

          {/* Employee List */}
          {teamSummary && teamSummary.employees && (
            <>
              {/* Enhanced Team Members Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4, border: '1px solid #e0e0e0' }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #e0e0e0', 
              bgcolor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Team Attendance - {moment(teamSummary.date).format('DD/MM/YYYY')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {teamSummary.employees?.length || 0} employees • {teamSummary.stats?.presentToday || 0} present
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Check In
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Check Out
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Hours
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Late Time
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5
                    }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      bgcolor: '#f5f5f5',
                      py: 1.5,
                      width: 80
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamSummary.employees.map((emp, index) => (
                    <TableRow 
                      key={emp.employee._id} 
                      hover 
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                        '&:hover': { bgcolor: '#f0f0f0' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {emp.employee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {emp.employee.employeeId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {emp.checkInTime ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                              {moment(emp.checkInTime).format('HH:mm')}
                            </Typography>
                            {emp.isLate && (
                              <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.65rem' }}>
                                Late
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {emp.checkOutTime ? (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {moment(emp.checkOutTime).format('HH:mm')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {emp.status === 'present' || emp.status === 'late' ? 'Working...' : '-'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {emp.totalHours ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                              {emp.totalHours.toFixed(1)}h
                            </Typography>
                            {emp.totalHours >= 9 && (
                              <Typography variant="caption" color="success.main" sx={{ fontSize: '0.65rem' }}>
                                Full day
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Chip
                          label={emp.status}
                          color={getStatusColor(emp.status)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.65rem', 
                            height: '20px',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {emp.isLate ? formatLateMinutes(emp.lateMinutes) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {emp.employee.department || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick({
                            _id: emp._id || `${emp.employee._id}-${moment().format('YYYY-MM-DD')}`,
                            employee: emp.employee,
                            date: teamSummary.date,
                            checkIn: emp.checkInTime ? { time: emp.checkInTime } : null,
                            checkOut: emp.checkOutTime ? { time: emp.checkOutTime } : null,
                            status: emp.status,
                            totalHours: emp.totalHours,
                            isLate: emp.isLate,
                            lateMinutes: emp.lateMinutes,
                            notes: emp.notes || ''
                          })}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
            </>
          )}
        </>
      )}

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" component="span">
              Edit Attendance Record
            </Typography>
          </Box>
          {editingRecord && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {editingRecord.employee ? 
                `${editingRecord.employee.name} (${editingRecord.employee.employeeId})` : 
                'Personal Record'
              } • {moment(editingRecord.date).format('DD/MM/YYYY dddd')}
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check In Time"
                type="time"
                value={editFormData.checkInTime}
                onChange={(e) => handleFormChange('checkInTime', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                helperText="24-hour format (HH:MM)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check Out Time"
                type="time"
                value={editFormData.checkOutTime}
                onChange={(e) => handleFormChange('checkOutTime', e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                helperText="24-hour format (HH:MM)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="half-day">Half Day</MenuItem>
                  <MenuItem value="on-leave">On Leave</MenuItem>
                  <MenuItem value="weekend">Weekend</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={editFormData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                fullWidth
                size="small"
                placeholder="Add any notes or comments about this attendance record..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleEditClose} 
            variant="outlined" 
            startIcon={<CloseIcon />}
            size="small"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            size="small"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar View Tab - CUTTING-EDGE PROFESSIONAL DESIGN */}
      {!isEmployee && tabValue === 2 && (
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%', 
            overflow: 'hidden', 
            border: 'none',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}
        >
          {/* Modern Header with Gradient */}
          <Box sx={{ 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 3
          }}>
            {/* Enhanced Title with Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarTodayIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Attendance Calendar
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500
                }}>
                  {calendarMonth.format('MMMM YYYY')} • {calendarData?.totalWorkingDays || 0} Working Days
                </Typography>
              </Box>
            </Box>
            
            {/* Enhanced Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Modern Employee Filter */}
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                    }
                  }
                }}
              >
                <InputLabel sx={{ fontWeight: 500 }}>Filter by Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Filter by Employee"
                  startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon sx={{ fontSize: 18 }} />
                      All Employees ({calendarData?.employees?.length || 0})
                    </Box>
                  </MenuItem>
                  {calendarData?.employees?.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                          {emp.name?.charAt(0)}
                        </Avatar>
                        {emp.employeeId} - {emp.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Enhanced Month Navigation */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                p: 0.5
              }}>
                <IconButton 
                  onClick={() => {
                    const newMonth = calendarMonth.clone().subtract(1, 'month');
                    setCalendarMonth(newMonth);
                    fetchCalendarData(newMonth);
                  }}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    const today = moment();
                    setCalendarMonth(today);
                    fetchCalendarData(today);
                  }}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: 1.5,
                    px: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  Today
                </Button>
                
                <IconButton 
                  onClick={() => {
                    const newMonth = calendarMonth.clone().add(1, 'month');
                    setCalendarMonth(newMonth);
                    fetchCalendarData(newMonth);
                  }}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Enhanced Calendar Legend with Analytics */}
          <Box sx={{ 
            p: 3, 
            background: 'rgba(255, 255, 255, 0.98)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            <Grid container spacing={3} alignItems="center">
              {/* Legend */}
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Status Legend:
                  </Typography>
                  {[
                    { label: 'Present', color: '#10b981', icon: '✓', gradient: 'linear-gradient(45deg, #10b981, #059669)' },
                    { label: 'Late', color: '#f59e0b', icon: '⏰', gradient: 'linear-gradient(45deg, #f59e0b, #d97706)' },
                    { label: 'Absent', color: '#ef4444', icon: '✗', gradient: 'linear-gradient(45deg, #ef4444, #dc2626)' },
                    { label: 'Leave', color: '#3b82f6', icon: '🏖️', gradient: 'linear-gradient(45deg, #3b82f6, #2563eb)' },
                    { label: 'Holiday', color: '#8b5cf6', icon: '🎉', gradient: 'linear-gradient(45deg, #8b5cf6, #7c3aed)' }
                  ].map((item) => (
                    <Box key={item.label} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          background: item.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              
              {/* Quick Stats */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {calendarData && (
                    <>
                      <Chip 
                        label={`${calendarData.monthlyStats?.presentDays || 0} Present Days`}
                        sx={{ 
                          bgcolor: 'rgba(16, 185, 129, 0.1)', 
                          color: '#059669',
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                      <Chip 
                        label={`${((calendarData.monthlyStats?.presentDays || 0) / (calendarData.totalWorkingDays || 1) * 100).toFixed(1)}% Attendance`}
                        sx={{ 
                          bgcolor: 'rgba(102, 126, 234, 0.1)', 
                          color: '#667eea',
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Enhanced Calendar Content */}
          {calendarData ? (
            <Box sx={{ p: 3, background: 'rgba(255, 255, 255, 0.95)' }}>
              {/* Weekday Headers */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <Grid item xs key={day}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'text.secondary',
                        py: 1,
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: 1
                      }}
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Enhanced Calendar Days */}
              <Grid container spacing={1}>
                {calendarData.calendarData?.filter(dayData => {
                  const dayMoment = moment(dayData.date);
                  const dayOfWeek = dayMoment.day();
                  return dayOfWeek >= 1 && dayOfWeek <= 5;
                }).map((dayData) => {
                  const dayMoment = moment(dayData.date);
                  const isToday = dayMoment.isSame(moment(), 'day');
                  const isCurrentMonth = dayMoment.isSame(calendarMonth, 'month');
                  const totalEmployees = dayData.employees?.length || 0;
                  const presentCount = dayData.employees?.filter(emp => emp.attendance.status === 'present').length || 0;
                  const lateCount = dayData.employees?.filter(emp => emp.attendance.status === 'late').length || 0;
                  const absentCount = dayData.employees?.filter(emp => emp.attendance.status === 'absent').length || 0;
                  
                  return (
                    <Grid item xs key={dayData.date}>
                      <Card 
                        elevation={isToday ? 8 : 2}
                        onClick={() => handleDayCardClick(dayData)}
                        sx={{ 
                          minHeight: 160,
                          background: isToday ? 
                            'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' :
                            isCurrentMonth ? 'white' : 'rgba(248, 250, 252, 0.8)',
                          border: isToday ? '2px solid #667eea' : '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: 2,
                          opacity: isCurrentMonth ? 1 : 0.7,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #667eea'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          {/* Enhanced Date Header */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 1
                          }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700,
                                color: isToday ? '#667eea' : 'text.primary',
                                fontSize: '1.1rem'
                              }}
                            >
                              {dayMoment.format('D')}
                            </Typography>
                            {isToday && (
                              <Chip 
                                label="Today" 
                                size="small"
                                sx={{ 
                                  bgcolor: '#667eea',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}
                              />
                            )}
                          </Box>

                          {/* Day of Week */}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontWeight: 500,
                              mb: 1
                            }}
                          >
                            {dayMoment.format('dddd')}
                          </Typography>
                          
                          {/* Enhanced Employee Attendance */}
                          {dayData.employees && dayData.employees.length > 0 ? (
                            <Box sx={{ flex: 1 }}>
                              {selectedEmployee === 'all' ? (
                                // Enhanced Summary View
                                <Box>
                                  {/* Attendance Overview */}
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                      {totalEmployees} employees
                                    </Typography>
                                  </Box>
                                  
                                  {/* Status Chips */}
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {presentCount > 0 && (
                                      <Chip
                                        label={`${presentCount} Present`}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          background: 'linear-gradient(45deg, #10b981, #059669)',
                                          color: 'white',
                                          fontWeight: 600
                                        }}
                                      />
                                    )}
                                    {lateCount > 0 && (
                                      <Chip
                                        label={`${lateCount} Late`}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                          color: 'white',
                                          fontWeight: 600
                                        }}
                                      />
                                    )}
                                    {absentCount > 0 && (
                                      <Chip
                                        label={`${absentCount} Absent`}
                                        size="small"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 20,
                                          background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                                          color: 'white',
                                          fontWeight: 600
                                        }}
                                      />
                                    )}
                                  </Box>

                                  {/* Attendance Rate */}
                                  <Box sx={{ mt: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={(presentCount + lateCount) / totalEmployees * 100}
                                      sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          background: 'linear-gradient(45deg, #10b981, #059669)',
                                          borderRadius: 2
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ 
                                      fontSize: '0.65rem', 
                                      color: 'text.secondary',
                                      fontWeight: 500
                                    }}>
                                      {Math.round((presentCount + lateCount) / totalEmployees * 100)}% attendance
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                // Enhanced Individual Employee View
                                dayData.employees
                                  .filter(emp => selectedEmployee === 'all' || emp.employeeId === selectedEmployee)
                                  .map((emp) => (
                                    <Box key={emp.employeeId} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                          {emp.name?.charAt(0)}
                                        </Avatar>
                                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                                          {emp.employeeId}
                                        </Typography>
                                      </Box>
                                      
                                      <Chip
                                        label={emp.attendance.status.toUpperCase()}
                                        size="small"
                                        sx={{
                                          fontSize: '0.65rem',
                                          height: 18,
                                          mb: 0.5,
                                          background: emp.attendance.status === 'present' ? 
                                            'linear-gradient(45deg, #10b981, #059669)' : 
                                            emp.attendance.status === 'late' ? 
                                            'linear-gradient(45deg, #f59e0b, #d97706)' : 
                                            'linear-gradient(45deg, #ef4444, #dc2626)',
                                          color: 'white',
                                          fontWeight: 600
                                        }}
                                      />
                                      
                                      {emp.attendance.checkIn && (
                                        <Typography variant="caption" sx={{ 
                                          display: 'block', 
                                          fontSize: '0.65rem',
                                          color: 'text.secondary',
                                          fontWeight: 500
                                        }}>
                                          ⏰ In: {moment(emp.attendance.checkIn).format('HH:mm')}
                                        </Typography>
                                      )}
                                      {emp.attendance.checkOut && (
                                        <Typography variant="caption" sx={{ 
                                          display: 'block', 
                                          fontSize: '0.65rem',
                                          color: 'text.secondary',
                                          fontWeight: 500
                                        }}>
                                          🚪 Out: {moment(emp.attendance.checkOut).format('HH:mm')}
                                        </Typography>
                                      )}
                                      {emp.attendance.totalHours && (
                                        <Typography variant="caption" sx={{ 
                                          display: 'block', 
                                          fontSize: '0.65rem',
                                          color: 'primary.main',
                                          fontWeight: 600
                                        }}>
                                          📊 {emp.attendance.totalHours}h worked
                                        </Typography>
                                      )}
                                    </Box>
                                  ))
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              flex: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'text.secondary'
                            }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                No data
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <CircularProgress 
                sx={{ 
                  color: '#667eea',
                  mb: 2
                }}
              />
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1
              }}>
                Loading Calendar Data
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please wait while we fetch the attendance information...
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Calendar Day Detail Modal */}
      <Dialog
        open={dayDetailModalOpen}
        onClose={handleCloseDayDetailModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 0
          }
        }}
      >
        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          m: 1
        }}>
          {/* Modal Header */}
          <DialogTitle sx={{ 
            p: 3,
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarTodayIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {selectedDayData && moment(selectedDayData.date).format('dddd, MMMM Do, YYYY')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {selectedDayData?.employees?.length || 0} employees • Detailed attendance view
                </Typography>
              </Box>
              <IconButton 
                onClick={handleCloseDayDetailModal}
                sx={{ 
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          {/* Modal Content */}
          <DialogContent sx={{ p: 0 }}>
            {selectedDayData?.employees && selectedDayData.employees.length > 0 ? (
              <Box sx={{ p: 3 }}>
                {/* Summary Stats */}
                <Box sx={{ 
                  mb: 3,
                  p: 2,
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Daily Summary
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { 
                        label: 'Present', 
                        count: selectedDayData.employees.filter(emp => emp.attendance.status === 'present').length,
                        color: '#10b981',
                        gradient: 'linear-gradient(45deg, #10b981, #059669)'
                      },
                      { 
                        label: 'Late', 
                        count: selectedDayData.employees.filter(emp => emp.attendance.status === 'late').length,
                        color: '#f59e0b',
                        gradient: 'linear-gradient(45deg, #f59e0b, #d97706)'
                      },
                      { 
                        label: 'Absent', 
                        count: selectedDayData.employees.filter(emp => emp.attendance.status === 'absent').length,
                        color: '#ef4444',
                        gradient: 'linear-gradient(45deg, #ef4444, #dc2626)'
                      }
                    ].map((stat) => (
                      <Grid item xs={4} key={stat.label}>
                        <Box sx={{ 
                          textAlign: 'center',
                          bgcolor: 'white',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700,
                            background: stat.gradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                          }}>
                            {stat.count}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary',
                            fontWeight: 600
                          }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Employee List */}
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary'
                }}>
                  Employee Details
                </Typography>

                <Grid container spacing={2}>
                  {selectedDayData.employees.map((emp) => (
                    <Grid item xs={12} md={6} key={emp.employeeId}>
                      <Card sx={{ 
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          {/* Employee Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40,
                              background: emp.attendance.status === 'present' ? 
                                'linear-gradient(45deg, #10b981, #059669)' : 
                                emp.attendance.status === 'late' ? 
                                'linear-gradient(45deg, #f59e0b, #d97706)' : 
                                'linear-gradient(45deg, #ef4444, #dc2626)',
                              fontSize: 14,
                              fontWeight: 600
                            }}>
                              {emp.name?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'text.primary'
                              }}>
                                {emp.name}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontWeight: 500
                              }}>
                                {emp.employeeId}
                              </Typography>
                            </Box>
                            <Chip
                              label={emp.attendance.status.toUpperCase()}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: emp.attendance.status === 'present' ? 
                                  'linear-gradient(45deg, #10b981, #059669)' : 
                                  emp.attendance.status === 'late' ? 
                                  'linear-gradient(45deg, #f59e0b, #d97706)' : 
                                  'linear-gradient(45deg, #ef4444, #dc2626)',
                                color: 'white'
                              }}
                            />
                          </Box>

                          {/* Attendance Details */}
                          <Box sx={{ 
                            bgcolor: 'rgba(248, 250, 252, 0.8)',
                            borderRadius: 1,
                            p: 1.5
                          }}>
                            {emp.attendance.checkIn ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: '#10b981' 
                                }} />
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary'
                                }}>
                                  Check In: {moment(emp.attendance.checkIn).format('HH:mm A')}
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: '#ef4444' 
                                }} />
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 600,
                                  color: 'text.secondary'
                                }}>
                                  No Check In
                                </Typography>
                              </Box>
                            )}

                            {emp.attendance.checkOut ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: '#f59e0b' 
                                }} />
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary'
                                }}>
                                  Check Out: {moment(emp.attendance.checkOut).format('HH:mm A')}
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  bgcolor: '#94a3b8' 
                                }} />
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 600,
                                  color: 'text.secondary'
                                }}>
                                  No Check Out
                                </Typography>
                              </Box>
                            )}

                            {emp.attendance.totalHours && (
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                mt: 1,
                                pt: 1,
                                borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                              }}>
                                <TimeIcon sx={{ fontSize: 12, color: '#667eea' }} />
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 600,
                                  color: '#667eea'
                                }}>
                                  Total Hours: {emp.attendance.totalHours}h
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ 
                p: 6, 
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <PersonIcon sx={{ fontSize: 32, color: '#667eea' }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1
                }}>
                  No Attendance Data
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No employee attendance records found for this day.
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>

      {/* Location validation and checkout dialogs removed - functionality moved to dashboard only */}
    </Box>
  );
};

export default Attendance;
