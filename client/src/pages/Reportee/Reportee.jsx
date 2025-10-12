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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Alert,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Computer as ComputerIcon,
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
  Group as GroupIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Security as SecurityIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  WatchLater as WatchLaterIcon,
  DateRange as DateRangeIcon,
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

// Create a dedicated axios instance for Reportee with proper configuration
const reporteeApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Add request interceptor to include auth token
reporteeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

const Reportee = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [employeeDashboard, setEmployeeDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [accessLevel, setAccessLevel] = useState('manager');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states for attendance and leave
  const [attendanceFilter, setAttendanceFilter] = useState('thisMonth');
  const [leaveFilter, setLeaveFilter] = useState('thisYear');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Try the my-team endpoint first
      const response = await reporteeApi.get('/employees/my-team');
      
      if (response.data && response.data.teamMembers) {
        setTeamMembers(response.data.teamMembers || []);
        setAccessLevel('manager');
        
        if (response.data.teamMembers.length === 0) {
          toast.info('No direct reports found. This might be because reporting relationships are not set up yet.');
        }
      } else {
        setTeamMembers([]);
        toast.info('No team members found. This might be because reporting relationships are not set up yet.');
      }
      
    } catch (error) {
      console.error('Error fetching team members:', error);
      
      // Fallback: Try to get all employees (for Prajwal)
      try {
        const allEmployeesResponse = await reporteeApi.get('/employees/all-employees');
        if (allEmployeesResponse.data && allEmployeesResponse.data.success) {
          const employees = allEmployeesResponse.data.employees;
          console.log('All employees info:', employees);
          
          if (employees && employees.length > 0) {
            setTeamMembers(employees);
            setAccessLevel('manager');
            toast.success(`Found ${employees.length} employees (special access mode)`);
          } else {
            setTeamMembers([]);
            toast.info('No employees found.');
          }
        }
      } catch (allEmployeesError) {
        console.error('All employees request failed:', allEmployeesError);
        
        // Final fallback: Try debug reporting
        try {
          const debugResponse = await reporteeApi.get('/employees/debug-reporting');
          if (debugResponse.data) {
            const debug = debugResponse.data;
            console.log('Debug reporting info:', debug);
            
            if (debug.directReports && debug.directReports.length > 0) {
              const formattedMembers = debug.directReports.map(member => ({
                _id: member.id,
                employeeId: member.employeeId,
                personalInfo: {
                  firstName: member.name.split(' ')[0],
                  lastName: member.name.split(' ').slice(1).join(' ')
                },
                employmentInfo: {
                  designation: 'N/A',
                  department: { name: 'N/A' }
                },
                user: {
                  email: 'N/A',
                  role: 'employee'
                }
              }));
              
              setTeamMembers(formattedMembers);
              setAccessLevel('manager');
              toast.success(`Found ${formattedMembers.length} direct reports via debug endpoint`);
            } else {
              setTeamMembers([]);
              toast.info('No direct reports found. Please check reporting relationships in the database.');
            }
          }
        } catch (debugError) {
          console.error('Debug request failed:', debugError);
          toast.error('Failed to fetch team members. Please contact admin to check your access.');
          setTeamMembers([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDashboard = async (employeeId, attendancePeriod = null, leavePeriod = null) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (attendancePeriod) params.append('attendancePeriod', attendancePeriod);
      if (leavePeriod) params.append('leavePeriod', leavePeriod);
      
      // Add custom date range if applicable
      if (attendancePeriod === 'custom' && customDateRange.start && customDateRange.end) {
        params.append('startDate', customDateRange.start);
        params.append('endDate', customDateRange.end);
      }
      
      const url = `/employees/team-dashboard/${employeeId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await reporteeApi.get(url);
      setEmployeeDashboard(response.data);
      setAccessLevel(response.data.accessLevel);
    } catch (error) {
      console.error('Error fetching employee dashboard:', error);
      
      if (error.response?.status === 403) {
        const debugInfo = error.response.data?.debug;
        if (debugInfo) {
          console.log('Access denied debug info:', debugInfo);
          toast.error(`Access denied: ${error.response.data.message}. Check console for details.`);
        } else {
          toast.error('Access denied: You do not have permission to view this employee\'s dashboard.');
        }
      } else if (error.response?.status === 404) {
        toast.error('Employee not found.');
      } else {
        toast.error('Failed to fetch employee dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeDashboard(employee._id);
    setViewDialog(true);
  };

  const getAccessLevelInfo = (level) => {
    switch (level) {
      case 'full':
        return { label: 'Full Access', color: 'success', icon: <SecurityIcon /> };
      case 'manager':
        return { label: 'Manager Access', color: 'warning', icon: <SupervisorAccountIcon /> };
      case 'self':
        return { label: 'Self Access', color: 'info', icon: <PersonIcon /> };
      default:
        return { label: 'Limited Access', color: 'default', icon: <PersonIcon /> };
    }
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = !searchTerm || 
      member.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const attendancePercentage = employeeDashboard?.attendance?.totalWorkingDays > 0 
    ? Math.round((employeeDashboard.attendance.present / employeeDashboard.attendance.totalWorkingDays) * 100)
    : 0;

  const punctualityRate = employeeDashboard?.attendance?.present > 0 
    ? Math.round(((employeeDashboard.attendance.present - (employeeDashboard.attendance.late || 0)) / employeeDashboard.attendance.present) * 100)
    : 0;

  // Calculate leave metrics
  const totalAllocated = (employeeDashboard?.leaves?.leaveBalance?.casualLeave?.allocated || 0) +
                        (employeeDashboard?.leaves?.leaveBalance?.sickLeave?.allocated || 0) +
                        (employeeDashboard?.leaves?.leaveBalance?.specialLeave?.allocated || 0);
  const totalUsed = ((employeeDashboard?.leaves?.leaveBalance?.casualLeave?.allocated || 0) - (employeeDashboard?.leaves?.leaveBalance?.casualLeave?.available || 0)) +
                   ((employeeDashboard?.leaves?.leaveBalance?.sickLeave?.allocated || 0) - (employeeDashboard?.leaves?.leaveBalance?.sickLeave?.available || 0)) +
                   ((employeeDashboard?.leaves?.leaveBalance?.specialLeave?.allocated || 0) - (employeeDashboard?.leaves?.leaveBalance?.specialLeave?.available || 0));
  const utilizationRate = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  if (loading && !employeeDashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading reportee data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupervisorAccountIcon sx={{ mr: 2, fontSize: '2rem', color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Reportee Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage your direct reports' work-related information
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${filteredTeamMembers.length} Direct Reports`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTeamMembers}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Paper>


      {/* Search and Filter */}
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'grey.500' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              size="small"
              onClick={() => toast.info('Print feature coming soon')}
            >
              Print
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1 }} />
            Direct Reports ({filteredTeamMembers.length})
          </Typography>
          
          {filteredTeamMembers.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeamMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {member.personalInfo?.firstName?.charAt(0)}
                            {member.personalInfo?.lastName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {member.personalInfo?.firstName} {member.personalInfo?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {member.employmentInfo?.designation || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {member.employmentInfo?.department?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewEmployee(member)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GroupIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No direct reports found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Reporting relationships may not be set up yet'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTeamMembers}
                sx={{ mt: 2 }}
              >
                Refresh Data
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Employee Dashboard Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6">
                {selectedEmployee?.personalInfo?.firstName} {selectedEmployee?.personalInfo?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee?.employmentInfo?.designation} • {selectedEmployee?.employeeId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {accessLevel && (
              <Chip
                label={getAccessLevelInfo(accessLevel).label}
                color={getAccessLevelInfo(accessLevel).color}
                icon={getAccessLevelInfo(accessLevel).icon}
                size="small"
              />
            )}
            <IconButton onClick={() => setViewDialog(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {employeeDashboard && (
            <Grid container spacing={3}>
              {/* Employee Info */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Employee Information
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {employeeDashboard.employee?.personalInfo?.firstName} {employeeDashboard.employee?.personalInfo?.lastName}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Designation</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {employeeDashboard.employee?.employmentInfo?.designation || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {employeeDashboard.employee?.employmentInfo?.department?.name || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {employeeDashboard.employee?.employeeId || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Work Email</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {employeeDashboard.employee?.user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                  </CardContent>
                </Card>
              </Grid>

              {/* Attendance Summary */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        Attendance Summary
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Period</InputLabel>
                        <Select
                          value={attendanceFilter}
                          label="Period"
                          onChange={(e) => {
                            setAttendanceFilter(e.target.value);
                            if (selectedEmployee && e.target.value !== 'custom') {
                              fetchEmployeeDashboard(selectedEmployee._id, e.target.value, leaveFilter);
                            }
                          }}
                        >
                          <MenuItem value="thisMonth">This Month</MenuItem>
                          <MenuItem value="lastMonth">Last Month</MenuItem>
                          <MenuItem value="last3Months">Last 3 Months</MenuItem>
                          <MenuItem value="thisYear">This Year</MenuItem>
                          <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Custom Date Range */}
                    {attendanceFilter === 'custom' && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Start Date"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              value={customDateRange.start}
                              onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <TextField
                              fullWidth
                              size="small"
                              label="End Date"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              value={customDateRange.end}
                              onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              onClick={() => {
                                if (selectedEmployee && customDateRange.start && customDateRange.end) {
                                  fetchEmployeeDashboard(selectedEmployee._id, 'custom', leaveFilter);
                                } else {
                                  toast.error('Please select both start and end dates');
                                }
                              }}
                            >
                              Apply
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                          <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="success.main">
                            {employeeDashboard.attendance?.present || 0}
                          </Typography>
                          <Typography variant="caption" color="success.dark" fontWeight="500">
                            Present Days
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                          <CancelIcon sx={{ fontSize: 28, color: 'error.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="error.main">
                            {employeeDashboard.attendance?.absent || 0}
                          </Typography>
                          <Typography variant="caption" color="error.dark" fontWeight="500">
                            Absent Days
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.50' }}>
                          <WarningIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="warning.main">
                            {employeeDashboard.attendance?.late || 0}
                          </Typography>
                          <Typography variant="caption" color="warning.dark" fontWeight="500">
                            Late Days
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'info.main', borderRadius: 1, bgcolor: 'info.50' }}>
                          <TimerIcon sx={{ fontSize: 28, color: 'info.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="info.main">
                            {(employeeDashboard.attendance?.regularPresent || 0) - (employeeDashboard.attendance?.regularLate || 0)}
                          </Typography>
                          <Typography variant="caption" color="info.dark" fontWeight="500">
                            On-Time
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Additional Metrics */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Attendance Rate
                            </Typography>
                            <Typography variant="h6" fontWeight="700" color="primary.main">
                              {attendancePercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={attendancePercentage} 
                            sx={{ height: 8, borderRadius: 4 }}
                            color={attendancePercentage >= 90 ? 'success' : attendancePercentage >= 75 ? 'warning' : 'error'}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Punctuality Rate
                            </Typography>
                            <Typography variant="h6" fontWeight="700" color="success.main">
                              {punctualityRate}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={punctualityRate}
                            sx={{ height: 8, borderRadius: 4 }}
                            color="success"
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Detailed Stats */}
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Working Days
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {employeeDashboard.attendance?.totalWorkingDays || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Half Days
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {employeeDashboard.attendance?.halfDays || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Avg. Working Hours
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {employeeDashboard.attendance?.avgWorkingHours || '0.0'}h
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Overtime Hours
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="warning.main">
                            {employeeDashboard.attendance?.overtimeHours || '0.0'}h
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Leave Summary */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <BeachAccessIcon sx={{ mr: 1 }} />
                        Leave Summary
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Period</InputLabel>
                          <Select
                            value={leaveFilter}
                            label="Period"
                            onChange={(e) => {
                              setLeaveFilter(e.target.value);
                              if (selectedEmployee) {
                                fetchEmployeeDashboard(selectedEmployee._id, attendanceFilter, e.target.value);
                              }
                            }}
                          >
                            <MenuItem value="thisMonth">This Month</MenuItem>
                            <MenuItem value="lastMonth">Last Month</MenuItem>
                            <MenuItem value="thisQuarter">This Quarter</MenuItem>
                            <MenuItem value="thisYear">This Year</MenuItem>
                            <MenuItem value="all">All Time</MenuItem>
                          </Select>
                        </FormControl>
                        <Tooltip title="Export Leave Report">
                          <IconButton size="small" onClick={() => toast.info('Export feature coming soon')}>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {/* Leave Request Status */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
                          <EventIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="primary.main">
                            {employeeDashboard.leaves?.totalRequests || 0}
                          </Typography>
                          <Typography variant="caption" color="primary.dark" fontWeight="500">
                            Total Requests
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                          <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="success.main">
                            {employeeDashboard.leaves?.approved || 0}
                          </Typography>
                          <Typography variant="caption" color="success.dark" fontWeight="500">
                            Approved
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.50' }}>
                          <ScheduleIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="warning.main">
                            {employeeDashboard.leaves?.pending || 0}
                          </Typography>
                          <Typography variant="caption" color="warning.dark" fontWeight="500">
                            Pending
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                          <CancelIcon sx={{ fontSize: 28, color: 'error.main', mb: 0.5 }} />
                          <Typography variant="h5" fontWeight="700" color="error.main">
                            {employeeDashboard.leaves?.rejected || 0}
                          </Typography>
                          <Typography variant="caption" color="error.dark" fontWeight="500">
                            Rejected
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Leave Balance Breakdown */}
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                      Leave Balance by Type
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {employeeDashboard.leaves?.leaveBalance ? (
                        <>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Casual Leave
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                <Typography variant="h5" fontWeight="700" color="primary.main">
                                  {employeeDashboard.leaves.leaveBalance.casualLeave?.available || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  / {employeeDashboard.leaves.leaveBalance.casualLeave?.allocated || 0} days
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={employeeDashboard.leaves.leaveBalance.casualLeave?.allocated 
                                  ? ((employeeDashboard.leaves.leaveBalance.casualLeave.allocated - (employeeDashboard.leaves.leaveBalance.casualLeave.available || 0)) 
                                    / employeeDashboard.leaves.leaveBalance.casualLeave.allocated) * 100 
                                  : 0}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Used: {(employeeDashboard.leaves.leaveBalance.casualLeave?.allocated || 0) - (employeeDashboard.leaves.leaveBalance.casualLeave?.available || 0)} days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Sick Leave
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                <Typography variant="h5" fontWeight="700" color="warning.main">
                                  {employeeDashboard.leaves.leaveBalance.sickLeave?.available || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  / {employeeDashboard.leaves.leaveBalance.sickLeave?.allocated || 0} days
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={employeeDashboard.leaves.leaveBalance.sickLeave?.allocated 
                                  ? ((employeeDashboard.leaves.leaveBalance.sickLeave.allocated - (employeeDashboard.leaves.leaveBalance.sickLeave.available || 0)) 
                                    / employeeDashboard.leaves.leaveBalance.sickLeave.allocated) * 100 
                                  : 0}
                                sx={{ height: 6, borderRadius: 3 }}
                                color="warning"
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Used: {(employeeDashboard.leaves.leaveBalance.sickLeave?.allocated || 0) - (employeeDashboard.leaves.leaveBalance.sickLeave?.available || 0)} days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Special Leave
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                <Typography variant="h5" fontWeight="700" color="success.main">
                                  {employeeDashboard.leaves.leaveBalance.specialLeave?.available || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  / {employeeDashboard.leaves.leaveBalance.specialLeave?.allocated || 0} days
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={employeeDashboard.leaves.leaveBalance.specialLeave?.allocated 
                                  ? ((employeeDashboard.leaves.leaveBalance.specialLeave.allocated - (employeeDashboard.leaves.leaveBalance.specialLeave.available || 0)) 
                                    / employeeDashboard.leaves.leaveBalance.specialLeave.allocated) * 100 
                                  : 0}
                                sx={{ height: 6, borderRadius: 3 }}
                                color="success"
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Used: {(employeeDashboard.leaves.leaveBalance.specialLeave?.allocated || 0) - (employeeDashboard.leaves.leaveBalance.specialLeave?.available || 0)} days
                              </Typography>
                            </Box>
                          </Grid>
                        </>
                      ) : (
                        <Grid item xs={12}>
                          <Alert severity="info">
                            No leave balance information available for this employee.
                          </Alert>
                        </Grid>
                      )}
                    </Grid>

                    {/* Overall Leave Statistics */}
                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Allocated
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {totalAllocated} days
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Available
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="success.main">
                            {totalAllocated - totalUsed} days
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Used
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="error.main">
                            {totalUsed} days
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Utilization Rate
                          </Typography>
                          <Typography variant="h6" fontWeight="600" color="primary.main">
                            {utilizationRate}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => toast.info('Export feature coming soon')}
          >
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reportee;
