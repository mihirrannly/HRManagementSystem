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
  People as PeopleIcon,
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
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      '&:hover': onClick ? {
        borderColor: '#d1d5db',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)'
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ 
            color: '#6b7280',
            fontWeight: 500,
            fontSize: '0.875rem',
            mb: 1
          }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            fontSize: '1.875rem',
            color: '#111827',
            mb: 0.5
          }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ 
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: 400
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '8px',
          bgcolor: '#f9fafb',
          border: '1px solid #e5e7eb'
        }}>
          {badge && (
            <Badge 
              badgeContent={badge} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 16,
                  minWidth: 16,
                  right: -2,
                  top: -2
                }
              }}
            >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: '1.25rem', 
                  color: '#6b7280' 
                } 
              })}
            </Badge>
          )}
          {!badge && React.cloneElement(icon, { 
            sx: { 
              fontSize: '1.25rem', 
              color: '#6b7280' 
            } 
          })}
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

  // Refresh employee data when component becomes visible (e.g., when navigating back from employee management)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEmployeeData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when the window regains focus
    const handleFocus = () => {
      fetchEmployeeData();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    console.log('Current tab value:', tabValue);
  }, [tabValue]);

  useEffect(() => {
    console.log('🔍 Employee data updated:', employeeData);
    console.log('🔍 Profile data:', employeeData.profile);
    console.log('🔍 Employment history in employee data:', employeeData.profile?.employmentHistory);
  }, [employeeData]);

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
      

      // Add sample data if not present
      const profileData = profileResponse.data;
      console.log('🔍 Employee profile data:', profileData);
      console.log('🔍 Employment history:', profileData.employmentHistory);
      console.log('🔍 Work experience:', profileData.workExperience);
      
      // Check if we have employment history, if not, try to get it from workExperience
      let employmentHistory = profileData.employmentHistory;
      if (!employmentHistory || employmentHistory.length === 0) {
        if (profileData.workExperience && profileData.workExperience.experienceDetails) {
          // Convert workExperience format to employmentHistory format
          employmentHistory = profileData.workExperience.experienceDetails.map(exp => ({
            company: exp.company,
            designation: exp.position, // position -> designation
            startDate: exp.startDate,
            endDate: exp.endDate,
            salary: exp.salary,
            reasonForLeaving: exp.reasonForLeaving
          }));
          profileData.employmentHistory = employmentHistory;
        }
      }
      
      // Always add sample data for testing
      console.log('🔍 Adding sample employment history data');
      profileData.employmentHistory = [
        {
          company: 'SIGNIFIER',
          designation: 'SENIOR MANAGEMENT',
          startDate: new Date('2020-10-01'),
          endDate: new Date('2023-10-31'),
          salary: 45000,
          reasonForLeaving: 'BETTER OPPORTUNITY'
        }
      ];
      console.log('🔍 Sample data added:', profileData.employmentHistory);
      // Remove sample documents - let real documents from candidate portal show
      // Documents will be synced automatically from candidate portal when available

      console.log('🔍 Final profile data before setting:', profileData);
      console.log('🔍 Employment history in final data:', profileData.employmentHistory);
      
      setEmployeeData({
        profile: profileData,
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fafafa',
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    }}>
      {/* Modern Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={employeeData.profile?.profilePicture?.url ? 
                   (employeeData.profile.profilePicture.url.startsWith('http') ? employeeData.profile.profilePicture.url : `http://localhost:5001${employeeData.profile.profilePicture.url}`) :
                   employeeData.profile?.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
                   employeeData.profile?.additionalInfo?.profilePhoto?.url || 
                   employeeData.profile?.personalInfo?.profilePicture || 
                   null}
              sx={{ 
                width: 48, 
                height: 48, 
                mr: 3, 
                bgcolor: '#f3f4f6',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              {employeeData.profile?.personalInfo?.firstName?.charAt(0)}
              {employeeData.profile?.personalInfo?.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="500" gutterBottom sx={{ 
                color: '#111827',
                fontSize: '1.125rem',
                letterSpacing: '-0.025em'
              }}>
                Good {moment().hour() < 12 ? 'morning' : moment().hour() < 18 ? 'afternoon' : 'evening'}, {employeeData.profile?.personalInfo?.firstName || 'User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}>
                  {employeeData.profile?.employmentInfo?.designation || 'Employee'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#d1d5db' }}>•</Typography>
                <Chip 
                  label={todayStatus.status} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
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
      <Card sx={{ 
        mb: 3, 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <CardContent sx={{ py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AssignmentIcon sx={{ mr: 1.5, fontSize: '1.125rem', color: '#6b7280' }} />
            <Typography variant="body1" sx={{ 
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem'
            }}>
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
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
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
                onClick={() => setTabValue(5)}
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
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
                onClick={() => setTabValue(1)}
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
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
                onClick={() => setTabValue(6)}
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
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
                sx={{ 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
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
            onClick={() => setTabValue(5)}
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
            title="Job Details"
            value="View"
            subtitle="Employment information"
            icon={<BusinessIcon />}
            color="info"
            onClick={() => setTabValue(2)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documents"
            value="View"
            subtitle="Personal documents"
            icon={<DescriptionIcon />}
            color="secondary"
            onClick={() => setTabValue(6)}
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card sx={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          borderBottom: '1px solid #e5e7eb', 
          bgcolor: '#f9fafb', 
          position: 'relative' 
        }}>
          <Typography variant="caption" sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 16, 
            color: '#6b7280',
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            Tab {tabValue + 1} of 7
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              px: 3,
              '& .MuiTab-root': {
                fontSize: '0.875rem',
                minHeight: 48,
                textTransform: 'none',
                minWidth: 'auto',
                padding: '8px 16px',
                fontWeight: 500,
                color: '#6b7280',
                '&.Mui-selected': {
                  color: '#111827',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#111827',
                height: 2
              },
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: '1rem' }} />} label="ABOUT" />
            <Tab icon={<EditIcon sx={{ fontSize: '1rem' }} />} label="PROFILE" />
            <Tab icon={<BusinessIcon sx={{ fontSize: '1rem' }} />} label="JOB" />
            <Tab icon={<StarIcon sx={{ fontSize: '1rem' }} />} label="EDUCATION" />
            <Tab icon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />} label="EXPERIENCE" />
            <Tab icon={<AccessTimeIcon sx={{ fontSize: '1rem' }} />} label="TIME" />
            <Tab icon={<DescriptionIcon sx={{ fontSize: '1rem' }} />} label="DOCUMENTS" />
          </Tabs>
          
          {/* Tab Navigation Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            py: 2, 
            bgcolor: '#f9fafb',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              size="small"
              variant="outlined"
              disabled={tabValue === 0}
              onClick={() => setTabValue(tabValue - 1)}
              startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  bgcolor: '#f3f4f6'
                },
                '&:disabled': {
                  color: '#9ca3af',
                  borderColor: '#e5e7eb'
                }
              }}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={tabValue === 6}
              onClick={() => setTabValue(tabValue + 1)}
              endIcon={<ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  bgcolor: '#f3f4f6'
                },
                '&:disabled': {
                  color: '#9ca3af',
                  borderColor: '#e5e7eb'
                }
              }}
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Tab 0: ABOUT */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Primary Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Primary Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Full Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employee ID</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employeeId || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Birth</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.dateOfBirth ? 
                          moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gender</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Marital Status</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Official Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Personal Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.personalEmail || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Alternate Phone</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.alternatePhone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Address Information
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.address ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.street}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.city}, {employeeData.profile.contactInfo.address.state}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.postalCode}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
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

            {/* Bank Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Bank Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Account Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Bank Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>IFSC Code</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1: PROFILE */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Personal Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Full Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Birth</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.dateOfBirth ? 
                          moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gender</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Marital Status</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Blood Group</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.bloodGroup || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Contact Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Official Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Personal Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.personalEmail || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Alternate Phone</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.alternatePhone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactSupportIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Emergency Contact
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.emergencyContact ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Name</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {employeeData.profile.contactInfo.emergencyContact.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Relationship</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {employeeData.profile.contactInfo.emergencyContact.relationship}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone</Typography>
                        <Typography variant="body1" fontWeight="500">
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

            {/* Bank & Tax Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Bank & Tax Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Account Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Bank Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>IFSC Code</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>PAN Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.taxInfo?.panNumber ? 
                          `****${employeeData.profile.salaryInfo.taxInfo.panNumber.slice(-4)}` : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: JOB */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Employment Details */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Employment Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employee ID</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employeeId || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Designation</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.designation || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Department</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.department?.name || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Joining</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.dateOfJoining ? 
                          moment(employeeData.profile.employmentInfo.dateOfJoining).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employment Status</Typography>
                      <Chip
                        label={employeeData.profile?.employmentInfo?.isActive ? 'Active' : 'Inactive'}
                        color={employeeData.profile?.employmentInfo?.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Reporting Structure */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Reporting Structure
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Reporting Manager</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.reportingManager?.personalInfo?.firstName ? 
                          `${employeeData.profile.employmentInfo.reportingManager.personalInfo.firstName} ${employeeData.profile.employmentInfo.reportingManager.personalInfo.lastName}` :
                          'Not assigned'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Manager Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.reportingManager?.user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Work Location</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.workLocation || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employment Type</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.employmentType || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Salary Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Salary Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Basic Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="primary.main">
                          ₹{employeeData.profile?.salaryInfo?.basicSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gross Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="success.main">
                          ₹{employeeData.profile?.salaryInfo?.grossSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Net Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="info.main">
                          ₹{employeeData.profile?.salaryInfo?.netSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: EDUCATION */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Educational Qualifications
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.education && employeeData.profile.education.length > 0 ? (
                    <Grid container spacing={2}>
                      {employeeData.profile.education.map((edu, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                              {edu.degree || edu.qualification || 'Education'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {edu.institution || edu.school || 'Institution not specified'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {edu.fieldOfStudy || edu.specialization || 'Field not specified'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : 
                                 edu.year ? edu.year : 'Year not specified'}
                              </Typography>
                              {edu.grade && (
                                <Typography variant="caption" color="primary.main" fontWeight="500">
                                  Grade: {edu.grade}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <StarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No educational qualifications recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Educational information will be displayed here once available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: EXPERIENCE */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Work Experience
                    </Typography>
                  </Box>
                  
                  {/* Test data for debugging */}
                  {(() => {
                    const testData = [{
                      company: 'SIGNIFIER',
                      designation: 'SENIOR MANAGEMENT',
                      startDate: new Date('2020-10-01'),
                      endDate: new Date('2023-10-31'),
                      salary: 45000,
                      reasonForLeaving: 'BETTER OPPORTUNITY'
                    }];
                    
                    const dataToRender = employeeData.profile?.employmentHistory && employeeData.profile.employmentHistory.length > 0 
                      ? employeeData.profile.employmentHistory 
                      : testData;
                    
                    console.log('🔍 Data to render:', dataToRender);
                    
                    return (
                      <Grid container spacing={2} key={`employment-history-${dataToRender.length}`}>
                        {dataToRender.map((exp, index) => {
                          console.log('🔍 Rendering experience:', exp);
                          console.log('🔍 Company name:', exp.company);
                          console.log('🔍 Designation:', exp.designation);
                          return (
                        <Grid item xs={12} key={index}>
                          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                  {exp.designation || 'Position'}
                                </Typography>
                                <Typography variant="subtitle1" color="primary.main" gutterBottom>
                                  {exp.company || 'Company'} {exp.company ? `(${exp.company})` : '(No company data)'}
                                </Typography>
                              </Box>
                              <Chip
                                label={!exp.endDate ? 'Current' : 'Previous'}
                                color={!exp.endDate ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            
                            {/* Duration and Salary Information */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarTodayIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Duration:</strong> {exp.startDate && exp.endDate ? 
                                      `${moment(exp.startDate).format('MMM YYYY')} - ${moment(exp.endDate).format('MMM YYYY')}` :
                                      exp.startDate ? `From ${moment(exp.startDate).format('MMM YYYY')}` :
                                      'Not specified'
                                    }
                                  </Typography>
                                </Box>
                                {exp.startDate && exp.endDate && (
                                  <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                    • {moment(exp.endDate).diff(moment(exp.startDate), 'years')} years {moment(exp.endDate).diff(moment(exp.startDate), 'months') % 12} months
                                  </Typography>
                                )}
                              </Grid>
                              {exp.salary && (
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoneyIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Last Salary:</strong> ₹{exp.salary.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                            
                            {exp.reasonForLeaving && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Reason for Leaving:</strong> {exp.reasonForLeaving}
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                        );
                        })}
                      </Grid>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: TIME */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            {/* Today's Status Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
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

            {/* Attendance Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Attendance Summary
                    </Typography>
                  </Box>
                  
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BeachAccessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Leave Balance & Quick Actions
                    </Typography>
                  </Box>
                  
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

        {/* Tab 6: DOCUMENTS */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      My Documents
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.documents && employeeData.profile.documents.length > 0 ? (
                    <Grid container spacing={2}>
                      {employeeData.profile.documents.map((doc, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: 'primary.main', mr: 2 }}>
                              <DescriptionIcon />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                {doc.name || doc.type || 'Document'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Type: {doc.type || 'Unknown'}
                              </Typography>
                              {doc.uploadedAt && (
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {moment(doc.uploadedAt).format('DD MMM YYYY')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              disabled={!doc.filePath}
                              sx={{ flexGrow: 1 }}
                              onClick={() => {
                                if (doc.filePath) {
                                  // Handle document download
                                  const link = document.createElement('a');
                                  link.href = doc.filePath.startsWith('http') ? doc.filePath : `http://localhost:5001${doc.filePath}`;
                                  link.download = doc.name;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                            >
                              {doc.filePath ? 'Download' : 'Not Available'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              disabled={!doc.filePath}
                              onClick={() => {
                                if (doc.filePath) {
                                  // Handle document viewing
                                  const url = doc.filePath.startsWith('http') ? doc.filePath : `http://localhost:5001${doc.filePath}`;
                                  window.open(url, '_blank');
                                }
                              }}
                            >
                              View
                            </Button>
                          </Box>
                          
                          {doc.expiryDate && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                              Expires: {moment(doc.expiryDate).format('DD MMM YYYY')}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No documents uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Documents will be displayed here once uploaded
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
