import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Alert,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Computer as ComputerIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  ContactSupport as ContactSupportIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick, badge }) => (
  <Card 
    sx={{ 
      height: '100%', 
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: 'none',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        borderColor: 'grey.400',
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Badge badgeContent={badge} color="error">
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: 1,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5
          }}>
            {React.cloneElement(icon, { sx: { fontSize: '1.2rem', color: 'grey.600' } })}
          </Box>
        </Badge>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="500" color="text.primary">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [employeeData, setEmployeeData] = useState({
    profile: null,
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      totalWorkingDays: 0,
      monthlyCalendar: [],
    },
    leaves: {
      available: 0,
      used: 0,
      pending: 0,
      upcoming: [],
      balance: {
        casualLeave: 0,
        sickLeave: 0,
        earnedLeave: 0,
      },
    },
    activities: [],
    assets: [],
    documents: [],
    tasks: [],
    notices: [],
    tickets: [],
    performance: {
      kras: [],
      appraisalTimeline: null,
      feedback: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [officeStatus, setOfficeStatus] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [supportDialog, setSupportDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [reportingStructure, setReportingStructure] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchEmployeeData();
    fetchTodayAttendance();
    fetchEmployeeAssets();
    // fetchReportingStructure(); // Temporarily disabled due to API issues
    fetchOfficeStatus();
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get('/leave/balance');
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Set default leave types if API fails
      setLeaveBalance([
        { leaveType: { name: 'Annual Leave', code: 'AL' }, allocated: 21, used: 5, available: 16 },
        { leaveType: { name: 'Sick Leave', code: 'SL' }, allocated: 12, used: 2, available: 10 },
        { leaveType: { name: 'Personal Leave', code: 'PL' }, allocated: 5, used: 1, available: 4 }
      ]);
    }
  };

  const fetchReportingStructure = async () => {
    try {
      console.log('🔍 Attempting to fetch reporting structure...');
      const response = await axios.get('/employees/reporting-structure');
      console.log('✅ Reporting structure response:', response.data);
      setReportingStructure(response.data);
      
      // If user is a manager, fetch team details
      if (response.data.statistics.isManager) {
        const teamResponse = await axios.get('/employees/my-team');
        setTeamMembers(teamResponse.data.teamMembers || []);
      }
    } catch (error) {
      console.error('❌ Error fetching reporting structure:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      // Set empty data to prevent repeated calls
      setReportingStructure({
        currentEmployee: { name: 'Unknown', role: 'employee' },
        statistics: { isManager: false }
      });
    }
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee profile
      const profileResponse = await axios.get('/employees/me');
      
      // Fetch attendance summary
      const attendanceResponse = await axios.get('/attendance/my-summary');
      
      // Fetch leave summary
      const leaveResponse = await axios.get('/leave/my-summary');
      

      setEmployeeData({
        profile: profileResponse.data,
        attendance: attendanceResponse.data || {
          present: 0,
          absent: 0,
          late: 0,
          totalWorkingDays: 0,
        },
        leaves: leaveResponse.data || {
          available: 0,
          used: 0,
          pending: 0,
        },
        activities: [],
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // If endpoints don't exist yet, show placeholder data
      setEmployeeData({
        profile: {
          employeeId: user.employee?.employeeId || 'N/A',
          personalInfo: {
            firstName: user.employee?.name?.split(' ')[0] || 'Employee',
            lastName: user.employee?.name?.split(' ').slice(1).join(' ') || '',
          },
          employmentInfo: {
            designation: user.employee?.designation || 'Employee',
            department: user.employee?.department || { name: 'N/A' },
          },
        },
        attendance: {
          present: 20,
          absent: 2,
          late: 1,
          totalWorkingDays: 23,
        },
        leaves: {
          available: 18,
          used: 6,
          pending: 1,
        },
        activities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/attendance/today');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchOfficeStatus = async () => {
    try {
      const response = await axios.get('/attendance/office-status');
      setOfficeStatus(response.data);
    } catch (error) {
      console.error('Error fetching office status:', error);
      setOfficeStatus({ isOfficeIP: false, message: 'Unable to verify office location' });
    }
  };

  const fetchEmployeeAssets = async () => {
    try {
      // First, we need to get the employee record for this user
      const employeeResponse = await axios.get('/employees/me');
      const employeeId = employeeResponse.data._id;
      
      if (employeeId) {
        const response = await axios.get(`/assets/employee/${employeeId}`);
        setEmployeeData(prev => ({
          ...prev,
          assets: response.data.assets || []
        }));
      } else {
        // If no employee record, set empty assets array
        setEmployeeData(prev => ({
          ...prev,
          assets: []
        }));
      }
    } catch (error) {
      console.error('Error fetching employee assets:', error);
      // Set empty array on error to prevent undefined issues
      setEmployeeData(prev => ({
        ...prev,
        assets: []
      }));
      // Don't show error to user as assets might not be available for all employees
    }
  };

  const markAttendance = async (type) => {
    try {
      const endpoint = type === 'check-in' ? '/attendance/checkin' : '/attendance/checkout';
      const response = await axios.post(endpoint, {
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (type === 'check-in' && response.data.isLate) {
          toast.warning(`You are ${response.data.lateMinutes} minutes late`);
        }
        if (type === 'check-out' && response.data.isEarlyDeparture) {
          toast.warning(`Early departure: ${response.data.earlyMinutes} minutes`);
        }
        if (type === 'check-out' && response.data.workingHours) {
          toast.info(`Total working hours: ${response.data.workingHours}`);
        }
        fetchTodayAttendance();
        fetchEmployeeData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Attendance marking only allowed from office premises');
      } else {
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
      }
    }
  };

  const attendancePercentage = employeeData.attendance.totalWorkingDays > 0 
    ? Math.round((employeeData.attendance.present / employeeData.attendance.totalWorkingDays) * 100)
    : 0;

  const leaveUsagePercentage = (employeeData.leaves.available + employeeData.leaves.used) > 0
    ? Math.round((employeeData.leaves.used / (employeeData.leaves.available + employeeData.leaves.used)) * 100)
    : 0;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSupportTicket = async () => {
    try {
      await axios.post('/helpdesk/tickets', ticketForm);
      setSupportDialog(false);
      setTicketForm({
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
      });
      // Refresh tickets
      fetchEmployeeData();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getTodayStatus = () => {
    const today = new Date();
    const isHoliday = false; // Check against holiday calendar
    
    // Allow attendance 7 days a week (removed weekend restriction)
    if (isHoliday) return { status: 'Holiday', color: 'warning' };
    if (attendanceStatus?.checkedIn) return { status: 'Present', color: 'success' };
    return { status: 'Not Checked In', color: 'error' };
  };

  const todayStatus = getTodayStatus();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ 
                width: 50, 
                height: 50, 
                mr: 2, 
                bgcolor: 'grey.300',
                color: 'grey.700',
                fontSize: '1.2rem'
              }}
            >
              {employeeData.profile?.personalInfo?.firstName?.charAt(0)}
              {employeeData.profile?.personalInfo?.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="500" gutterBottom>
                Welcome, {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {employeeData.profile?.employmentInfo?.designation || 'Employee'}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Chip 
                  label={todayStatus.status} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment().format('DD MMM YYYY')}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Employee ID: {employeeData.profile?.employeeId || 'N/A'} | {employeeData.profile?.employmentInfo?.department?.name || 'Unknown'} Department
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 }, flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            {officeStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={officeStatus.isOfficeIP ? 'Office Network' : 'Outside Office'}
                  size="small"
                  color={officeStatus.isOfficeIP ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!attendanceStatus?.checkedIn && attendanceStatus?.status !== 'weekend' && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => markAttendance('check-in')}
                  disabled={!officeStatus?.isOfficeIP}
                  title={!officeStatus?.isOfficeIP ? 'Check-in only allowed from office premises' : ''}
                >
                  Check In
                </Button>
              )}
              {attendanceStatus?.status === 'weekend' && (
                <Chip
                  label="Weekend - No Check-in Required"
                  size="small"
                  sx={{ bgcolor: '#9e9e9e', color: 'white', fontSize: '0.7rem' }}
                />
              )}
              {attendanceStatus?.checkedIn && !attendanceStatus?.checkedOut && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ScheduleIcon />}
                  onClick={() => markAttendance('check-out')}
                  disabled={!officeStatus?.isOfficeIP}
                  title={!officeStatus?.isOfficeIP ? 'Check-out only allowed from office premises' : ''}
                >
                  Check Out
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Quick Action Panel */}
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
            <Typography variant="body2" fontWeight="500" gutterBottom>
              Quick Actions
            </Typography>
          </Box>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<BeachAccessIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => navigate('/leave')}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                Apply Leave
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setTabValue(1)}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                View Timesheet
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setTabValue(3)}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                Update Profile
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<DescriptionIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setTabValue(4)}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                My Documents
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<ContactSupportIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setSupportDialog(true)}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                HR Support
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${attendancePercentage}%`}
            subtitle={`${employeeData.attendance.present}/${employeeData.attendance.totalWorkingDays} days`}
            icon={<AccessTimeIcon />}
            color="primary"
            onClick={() => setTabValue(1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Leaves"
            value={employeeData.leaves.available}
            subtitle={`${employeeData.leaves.used} used, ${employeeData.leaves.pending} pending`}
            icon={<BeachAccessIcon />}
            color="success"
            onClick={() => navigate('/leave')}
            badge={employeeData.leaves.pending}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Tasks"
            value={employeeData.tasks?.length || 0}
            subtitle="Assigned to you"
            icon={<AssignmentIcon />}
            color="info"
            onClick={() => setTabValue(5)}
            badge={employeeData.tasks?.filter(t => t.status === 'pending')?.length}
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ border: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'grey.200', bgcolor: 'grey.50' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              px: 2,
              '& .MuiTab-root': {
                fontSize: '0.8rem',
                minHeight: 48,
                textTransform: 'none'
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: '1rem' }} />} label="Overview" />
            <Tab icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />} label="Attendance" />
            <Tab icon={<EditIcon sx={{ fontSize: '1rem' }} />} label="Personal Info" />
            <Tab icon={<DescriptionIcon sx={{ fontSize: '1rem' }} />} label="Documents" />
            {/* Temporarily disabled due to API issues */}
            {/* <Tab icon={<BusinessIcon sx={{ fontSize: '1rem' }} />} label="Team & Reporting" /> */}
            <Tab icon={<AssignmentIcon sx={{ fontSize: '1rem' }} />} label="Tasks & Notices" />
            <Tab icon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />} label="Performance" />
            <Tab icon={<ComputerIcon sx={{ fontSize: '1rem' }} />} label="Assets" />
          </Tabs>
        </Box>

        {/* Tab 0: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Today's Status Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Today's Status
                    </Typography>
                  </Box>
                  
                  {attendanceStatus ? (
                    <Box>
                      {/* Check In/Out Times */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                              <Typography variant="body2" color="success.main" fontWeight="500">Check In</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="600">
                              {moment(attendanceStatus.checkIn).format('HH:mm A')}
                            </Typography>
                            {attendanceStatus.isLate && (
                              <Chip 
                                label={`Late by ${attendanceStatus.lateMinutes} min`} 
                                size="small" 
                                color="warning" 
                                sx={{ mt: 1 }} 
                              />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          {attendanceStatus.checkOut ? (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.main', borderRadius: 1, bgcolor: 'info.50' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                                <Typography variant="body2" color="info.main" fontWeight="500">Check Out</Typography>
                              </Box>
                              <Typography variant="h6" fontWeight="600">
                                {moment(attendanceStatus.checkOut).format('HH:mm A')}
                              </Typography>
                              {attendanceStatus.earlyDeparture && (
                                <Chip 
                                  label={`Early by ${attendanceStatus.earlyDepartureMinutes} min`} 
                                  size="small" 
                                  color="warning" 
                                  sx={{ mt: 1 }} 
                                />
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ mr: 1, color: 'grey.500', fontSize: 20 }} />
                                <Typography variant="body2" color="text.secondary" fontWeight="500">Check Out</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Still working...
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>

                      {/* Working Hours Summary */}
                      <Box sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 1, mb: 2 }}>
                        <Typography variant="subtitle2" color="primary.main" fontWeight="600" gutterBottom>
                          Today's Working Hours
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Total</Typography>
                            <Typography variant="h6" fontWeight="600" color="primary.main">
                              {attendanceStatus.totalHours ? `${attendanceStatus.totalHours.toFixed(1)}h` : 'In Progress'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Regular</Typography>
                            <Typography variant="h6" fontWeight="600" color="success.main">
                              {attendanceStatus.regularHours ? `${attendanceStatus.regularHours.toFixed(1)}h` : '0.0h'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Overtime</Typography>
                            <Typography variant="h6" fontWeight="600" color="warning.main">
                              {attendanceStatus.overtimeHours ? `${attendanceStatus.overtimeHours.toFixed(1)}h` : '0.0h'}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">Break Time</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {attendanceStatus.breakTime || '0h 0m'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Comp-off and Leave Options */}
                      {attendanceStatus.overtimeHours > 0 && (
                        <Box sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200', borderRadius: 1, mb: 2 }}>
                          <Typography variant="subtitle2" color="warning.main" fontWeight="600" gutterBottom>
                            Overtime Detected
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            You've worked {attendanceStatus.overtimeHours.toFixed(1)} extra hours today.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="warning"
                            startIcon={<EventIcon />}
                            sx={{ mr: 1 }}
                          >
                            Apply for Comp-off
                          </Button>
                        </Box>
                      )}

                      {/* Quick Actions */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<BeachAccessIcon />}
                          color="primary"
                        >
                          Apply Leave
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<AccessTimeIcon />}
                          color="secondary"
                        >
                          Break History
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        You haven't checked in today yet. Click the Check In button to mark your attendance.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Leave Status Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BeachAccessIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Leave Status
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="500">
                          {employeeData.leaves.balance?.casualLeave || 12}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Casual Leave</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="500">
                          {employeeData.leaves.balance?.sickLeave || 12}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Sick Leave</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="500">
                          {employeeData.leaves.balance?.earnedLeave || 21}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Earned Leave</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Leaves used this year:</Typography>
                    <Typography variant="body2" fontWeight="bold">{employeeData.leaves.used}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pending approvals:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {employeeData.leaves.pending}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<BeachAccessIcon />}
                    onClick={() => navigate('/leave')}
                    sx={{ mt: 2 }}
                  >
                    Apply for Leave
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Notices & Announcements */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Recent Notices & Announcements
                    </Typography>
                  </Box>
                  
                  {employeeData.notices?.length > 0 ? (
                    <List>
                      {employeeData.notices.slice(0, 3).map((notice, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <EventIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={notice.title}
                            secondary={`${notice.department} • ${moment(notice.date).fromNow()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <NotificationsIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No recent notices or announcements
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Check back later for updates from HR and management
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1: Attendance Overview */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  position: 'relative'
                }}
              >
                <CardContent sx={{ 
                  p: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3
                }}>
                  {/* Enhanced Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        My Attendance Calendar
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Track your monthly attendance pattern
                      </Typography>
                    </Box>
                  </Box>

                  {/* Enhanced Legend */}
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(102, 126, 234, 0.05)', 
                    borderRadius: 2, 
                    mb: 3,
                    border: '1px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Status Legend:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {[
                        { label: 'Present', color: '#10b981', icon: '✓' },
                        { label: 'Late', color: '#f59e0b', icon: '⏰' },
                        { label: 'Absent', color: '#ef4444', icon: '✗' },
                        { label: 'Leave', color: '#3b82f6', icon: '🏖️' },
                        { label: 'Holiday', color: '#8b5cf6', icon: '🎉' }
                      ].map((item) => (
                        <Box key={item.label} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          bgcolor: 'white',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: item.color,
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
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Coming Soon with Enhanced Design */}
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    borderRadius: 2,
                    border: '2px dashed rgba(102, 126, 234, 0.2)'
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1
                    }}>
                      Personal Calendar View
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary',
                      mb: 2,
                      maxWidth: 300,
                      mx: 'auto'
                    }}>
                      Your personalized monthly attendance calendar with detailed insights and analytics is coming soon!
                    </Typography>
                    <Box sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      px: 2,
                      py: 1,
                      borderRadius: 2
                    }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#667eea',
                        animation: 'pulse 2s infinite'
                      }} />
                      <Typography variant="caption" sx={{ 
                        color: '#667eea',
                        fontWeight: 600
                      }}>
                        In Development
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Present Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {employeeData.attendance.present}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Late Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {employeeData.attendance.late}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Absent Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {employeeData.attendance.absent}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Working Days:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {employeeData.attendance.totalWorkingDays}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendancePercentage} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" textAlign="center" color="text.secondary">
                    {attendancePercentage}% Attendance Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Leave Balance Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Leave Balance & Quick Actions
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {leaveBalance.map((leave, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            {leave.leaveType.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Available:</Typography>
                            <Typography variant="body2" fontWeight="500" color="success.main">
                              {leave.available} days
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Used:</Typography>
                            <Typography variant="body2" fontWeight="500" color="warning.main">
                              {leave.used} days
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Total:</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {leave.allocated} days
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(leave.used / leave.allocated) * 100} 
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            color={leave.used / leave.allocated > 0.8 ? 'error' : 'primary'}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Quick Leave Actions */}
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<BeachAccessIcon />}
                      color="primary"
                      size="small"
                    >
                      Apply for Leave
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<EventIcon />}
                      color="secondary"
                      size="small"
                    >
                      Request Comp-off
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<AccessTimeIcon />}
                      color="info"
                      size="small"
                    >
                      View Leave History
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<CalendarTodayIcon />}
                      color="success"
                      size="small"
                    >
                      Holiday Calendar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Personal Information */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Personal Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.dateOfBirth ? 
                        moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                        'Not provided'
                      }
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Marital Status</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.email || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.emergencyContact?.name || 'Not provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Address Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Current Address</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Street Address</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.addressInfo?.currentAddress?.street || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">City, State</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.addressInfo?.currentAddress?.city || 'Not provided'}, {employeeData.profile?.addressInfo?.currentAddress?.state || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">PIN Code</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.addressInfo?.currentAddress?.pinCode || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Bank Details</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Account Number</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Documents */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Personal Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.dateOfBirth ? 
                        moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                        'Not provided'
                      }
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Marital Status</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Official Email</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {user?.email}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Personal Email</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.personalEmail || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Alternate Phone</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.contactInfo?.alternatePhone || 'Not provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Address
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.address ? (
                    <Box>
                      <Typography variant="body1">
                        {employeeData.profile.contactInfo.address.street}
                      </Typography>
                      <Typography variant="body1">
                        {employeeData.profile.contactInfo.address.city}, {employeeData.profile.contactInfo.address.state}
                      </Typography>
                      <Typography variant="body1">
                        {employeeData.profile.contactInfo.address.postalCode}
                      </Typography>
                      <Typography variant="body1">
                        {employeeData.profile.contactInfo.address.country}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Address not provided
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ContactSupportIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Emergency Contact
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.emergencyContact ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile.contactInfo.emergencyContact.name}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Relationship</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile.contactInfo.emergencyContact.relationship}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile.contactInfo.emergencyContact.phone}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Emergency contact not provided
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Bank Details & Tax Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Bank Details</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Account Number</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Tax Information</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">PAN Number</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.taxInfo?.panNumber ? 
                            `****${employeeData.profile.salaryInfo.taxInfo.panNumber.slice(-4)}` : 
                            'Not provided'
                          }
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Aadhaar Number</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.taxInfo?.aadharNumber ? 
                            `****${employeeData.profile.salaryInfo.taxInfo.aadharNumber.slice(-4)}` : 
                            'Not provided'
                          }
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">UAN Number</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {employeeData.profile?.salaryInfo?.taxInfo?.uanNumber || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Documents Section */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  My Documents
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {[
                  { name: 'Offer Letter', type: 'offer-letter', icon: <DescriptionIcon /> },
                  { name: 'Employment Contract', type: 'contract', icon: <DescriptionIcon /> },
                  { name: 'ID Proof', type: 'id-proof', icon: <CreditCardIcon /> },
                  { name: 'Address Proof', type: 'address-proof', icon: <HomeIcon /> },
                  { name: 'Educational Certificates', type: 'educational', icon: <StarIcon /> },
                  { name: 'Previous Payslips', type: 'payslips', icon: <AttachMoneyIcon /> },
                ].map((doc, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>
                        {doc.icon}
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {doc.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        fullWidth
                        disabled
                      >
                        Download PDF
                      </Button>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Document not available
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab 4: Team & Reporting - Temporarily disabled due to API issues
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            Team & Reporting content temporarily disabled
          </Grid>
        </TabPanel>
        */}

        {/* Tab 4: Tasks & Notices (index adjusted) */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Assigned Tasks
                    </Typography>
                  </Box>
                  
                  {employeeData.tasks?.length > 0 ? (
                    <List>
                      {employeeData.tasks.map((task, index) => (
                        <ListItem key={index} divider sx={{ alignItems: 'flex-start' }}>
                          <ListItemIcon>
                            <AssignmentIcon color={task.priority === 'high' ? 'error' : 'primary'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={`Due: ${moment(task.dueDate).format('DD MMM YYYY')} • ${task.status}`}
                          />
                          <Box sx={{ ml: 2, mt: 0.5 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                            />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No tasks assigned
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're all caught up!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      HR Notices & Events
                    </Typography>
                  </Box>
                  
                  <List>
                    <ListItem divider>
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Annual Performance Review"
                        secondary="HR Department • 2 days ago"
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon>
                        <EventIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Team Building Event - Dec 15"
                        secondary="Management • 1 week ago"
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon>
                        <NotificationsIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="IT Security Training Mandatory"
                        secondary="IT Department • 2 weeks ago"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: Performance/Goals */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Key Result Areas (KRAs) & Goals
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TrendingUpIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Performance goals not set
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your manager will set up your KRAs and performance goals soon
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Appraisal Timeline
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Next Review</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      March 2025
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Review Type</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Annual Performance Review
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Reviewer</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.employmentInfo?.reportingManager?.personalInfo?.firstName || 'Not assigned'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Feedback History
                  </Typography>
                  
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No feedback history available
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 6: Assets */}
        <TabPanel value={tabValue} index={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ComputerIcon sx={{ mr: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Assigned Assets ({employeeData.assets?.length || 0})
                </Typography>
              </Box>
              
              {employeeData.assets && employeeData.assets.length > 0 ? (
                <Grid container spacing={2}>
                  {employeeData.assets.map((asset) => (
                    <Grid item xs={12} sm={6} md={4} key={asset._id}>
                      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ComputerIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {asset.assetId}
                          </Typography>
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          {asset.name}
                        </Typography>
                        {asset.brand && asset.model && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {asset.brand} {asset.model}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                            size="small"
                            color={asset.condition === 'excellent' ? 'success' : asset.condition === 'good' ? 'primary' : 'warning'}
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        {asset.currentAssignment?.assignedDate && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Assigned: {moment(asset.currentAssignment.assignedDate).format('MMM DD, YYYY')}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ComputerIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No assets assigned
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact IT department if you need equipment
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Floating Support Button */}
      <Fab
        color="primary"
        aria-label="support"
        onClick={() => setSupportDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <SupportIcon />
      </Fab>

      {/* Support Dialog */}
      <Dialog open={supportDialog} onClose={() => setSupportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <SupportIcon sx={{ mr: 1 }} />
          HR Support & Helpdesk
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={ticketForm.category}
                  label="Category"
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                >
                  <MenuItem value="payroll">Payroll</MenuItem>
                  <MenuItem value="it">IT Support</MenuItem>
                  <MenuItem value="hr">HR Query</MenuItem>
                  <MenuItem value="leave">Leave Management</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={ticketForm.priority}
                  label="Priority"
                  onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSupportTicket} 
            variant="contained"
            disabled={!ticketForm.category || !ticketForm.subject || !ticketForm.description}
          >
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
