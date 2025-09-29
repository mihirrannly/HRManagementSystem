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
  Event as EventIcon,
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
    payroll: {
      currentSalary: 0,
      lastPayment: null,
      salaryBreakup: {},
      ytdEarnings: 0,
      tdsStatus: {},
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
  const [supportDialog, setSupportDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchEmployeeData();
    fetchTodayAttendance();
    fetchEmployeeAssets();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee profile
      const profileResponse = await axios.get('/employees/me');
      
      // Fetch attendance summary
      const attendanceResponse = await axios.get('/attendance/my-summary');
      
      // Fetch leave summary
      const leaveResponse = await axios.get('/leave/my-summary');
      
      // Fetch payroll info
      const payrollResponse = await axios.get('/payroll/my-info');

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
        payroll: payrollResponse.data || {
          currentSalary: 0,
          lastPayment: null,
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
        payroll: {
          currentSalary: 50000,
          lastPayment: new Date(),
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
      await axios.post('/attendance/mark', { type });
      fetchTodayAttendance();
      fetchEmployeeData();
    } catch (error) {
      console.error('Error marking attendance:', error);
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
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const isHoliday = false; // Check against holiday calendar
    
    if (isWeekend) return { status: 'Weekend', color: 'info' };
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
                Welcome, {employeeData.profile?.personalInfo?.firstName} {employeeData.profile?.personalInfo?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employeeData.profile?.employmentInfo?.designation} | 
                <Chip 
                  label={todayStatus.status} 
                  size="small" 
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                /> | 
                {moment().format('DD MMM YYYY')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Employee ID: {employeeData.profile?.employeeId} | {employeeData.profile?.employmentInfo?.department?.name} Department
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
            {!attendanceStatus?.checkedIn && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => markAttendance('check-in')}
              >
                Check In
              </Button>
            )}
            {attendanceStatus?.checkedIn && !attendanceStatus?.checkedOut && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ScheduleIcon />}
                onClick={() => markAttendance('check-out')}
              >
                Check Out
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Quick Action Panel */}
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="body2" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
            Quick Actions
          </Typography>
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
                startIcon={<AttachMoneyIcon sx={{ fontSize: '1rem' }} />}
                onClick={() => setTabValue(2)}
                sx={{ py: 1, fontSize: '0.8rem' }}
              >
                View Payslip
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
            title="Current Salary"
            value={`₹${employeeData.payroll.currentSalary?.toLocaleString() || '0'}`}
            subtitle="Monthly CTC"
            icon={<AttachMoneyIcon />}
            color="warning"
            onClick={() => setTabValue(2)}
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
            <Tab icon={<AttachMoneyIcon sx={{ fontSize: '1rem' }} />} label="Payroll" />
            <Tab icon={<EditIcon sx={{ fontSize: '1rem' }} />} label="Personal Info" />
            <Tab icon={<DescriptionIcon sx={{ fontSize: '1rem' }} />} label="Documents" />
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} />
                    Today's Status
                  </Typography>
                  
                  {attendanceStatus ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <CheckCircleIcon sx={{ mr: 2, color: 'grey.600' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Check In</Typography>
                          <Typography variant="h6" fontWeight="500">
                            {moment(attendanceStatus.checkIn).format('HH:mm A')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {attendanceStatus.checkOut ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                          <ScheduleIcon sx={{ mr: 2, color: 'grey.600' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Check Out</Typography>
                            <Typography variant="h6" fontWeight="500">
                              {moment(attendanceStatus.checkOut).format('HH:mm A')}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Currently checked in. Don't forget to check out!
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          Total Hours: {attendanceStatus.totalHours || 'In Progress'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Break Time: {attendanceStatus.breakTime || '0h 0m'}
                        </Typography>
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BeachAccessIcon sx={{ mr: 1 }} />
                    Leave Status
                  </Typography>
                  
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    Recent Notices & Announcements
                  </Typography>
                  
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
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Attendance Calendar
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      🟢 Present • 🟡 Late • 🔴 Absent • 🔵 Leave • ⚪ Weekend/Holiday
                    </Typography>
                  </Box>
                  {/* Calendar component would go here */}
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CalendarTodayIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Monthly calendar view coming soon
                    </Typography>
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
          </Grid>
        </TabPanel>

        {/* Tab 2: Payroll Snapshot */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ mr: 1 }} />
                    Current Salary Breakdown
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Basic Salary</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ₹{(employeeData.payroll.currentSalary * 0.5)?.toLocaleString() || '25,000'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>HRA</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ₹{(employeeData.payroll.currentSalary * 0.2)?.toLocaleString() || '10,000'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Special Allowance</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ₹{(employeeData.payroll.currentSalary * 0.15)?.toLocaleString() || '7,500'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Other Allowances</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ₹{(employeeData.payroll.currentSalary * 0.15)?.toLocaleString() || '7,500'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}><Divider /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Gross Salary</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            ₹{employeeData.payroll.currentSalary?.toLocaleString() || '50,000'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>PF Deduction</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            -₹{(employeeData.payroll.currentSalary * 0.12)?.toLocaleString() || '6,000'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>TDS</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            -₹{(employeeData.payroll.currentSalary * 0.1)?.toLocaleString() || '5,000'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}><Divider /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>Net Salary</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ₹{(employeeData.payroll.currentSalary * 0.78)?.toLocaleString() || '39,000'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DownloadIcon sx={{ mr: 1 }} />
                    Latest Payslip
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <DescriptionIcon sx={{ mr: 2, color: 'primary.dark' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold" color="primary.dark">
                        Payslip - {moment().format('MMMM YYYY')}
                      </Typography>
                      <Typography variant="body2" color="primary.dark">
                        Generated on {moment().format('DD MMM YYYY')}
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Payment Date: {moment().add(1, 'day').format('DD MMM YYYY')}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Year to Date Earnings
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Gross Earnings:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{(employeeData.payroll.currentSalary * 9)?.toLocaleString() || '4,50,000'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Deductions:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      ₹{(employeeData.payroll.currentSalary * 9 * 0.22)?.toLocaleString() || '99,000'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Net Earnings:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ₹{(employeeData.payroll.currentSalary * 9 * 0.78)?.toLocaleString() || '3,51,000'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    TDS Status: ₹{(employeeData.payroll.currentSalary * 9 * 0.1)?.toLocaleString() || '45,000'} deducted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Personal Information */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Personal Details
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {employeeData.profile?.personalInfo?.firstName} {employeeData.profile?.personalInfo?.lastName}
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 1 }} />
                    Address
                  </Typography>
                  
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactSupportIcon sx={{ mr: 1 }} />
                    Emergency Contact
                  </Typography>
                  
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    Bank Details & Tax Information
                  </Typography>
                  
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

        {/* Tab 4: Documents Section */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                My Documents
              </Typography>
              
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

        {/* Tab 5: Tasks & Notices */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    Assigned Tasks
                  </Typography>
                  
                  {employeeData.tasks?.length > 0 ? (
                    <List>
                      {employeeData.tasks.map((task, index) => (
                        <ListItem key={index} divider>
                          <ListItemIcon>
                            <AssignmentIcon color={task.priority === 'high' ? 'error' : 'primary'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={`Due: ${moment(task.dueDate).format('DD MMM YYYY')} • ${task.status}`}
                          />
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                          />
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
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    HR Notices & Events
                  </Typography>
                  
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

        {/* Tab 6: Performance/Goals */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    Key Result Areas (KRAs) & Goals
                  </Typography>
                  
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

        {/* Tab 7: Assets */}
        <TabPanel value={tabValue} index={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ComputerIcon sx={{ mr: 1 }} />
                Assigned Assets ({employeeData.assets?.length || 0})
              </Typography>
              
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
