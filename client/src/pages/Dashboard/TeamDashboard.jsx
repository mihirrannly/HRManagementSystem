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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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

const TeamDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [employeeDashboard, setEmployeeDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [accessLevel, setAccessLevel] = useState('manager');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employees/my-team');
      setTeamMembers(response.data.teamMembers || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // If my-team fails, try to get debug information
      try {
        const debugResponse = await axios.get('/employees/debug-manager-access');
        if (debugResponse.data && debugResponse.data.debug) {
          const debug = debugResponse.data.debug;
          console.log('Debug info:', debug);
          
          if (debug.teamMembers && debug.teamMembers.count > 0) {
            setTeamMembers(debug.teamMembers.members.map(member => ({
              _id: member.id,
              employeeId: member.employeeId,
              personalInfo: {
                firstName: member.name.split(' ')[0],
                lastName: member.name.split(' ').slice(1).join(' ')
              },
              employmentInfo: {
                designation: member.designation
              }
            })));
          } else {
            toast.error('No team members found. Please check your manager role and reporting relationships.');
          }
        }
      } catch (debugError) {
        console.error('Debug request failed:', debugError);
        toast.error('Failed to fetch team members. Please contact admin to check your manager access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDashboard = async (employeeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/employees/team-dashboard/${employeeId}`);
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

  const attendancePercentage = employeeDashboard?.attendance?.totalWorkingDays > 0 
    ? Math.round((employeeDashboard.attendance.present / employeeDashboard.attendance.totalWorkingDays) * 100)
    : 0;

  if (loading && !employeeDashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading team dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 2, fontSize: '2rem', color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Team Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor your team members' work-related information
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${teamMembers.length} Team Members`}
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

      {/* Access Level Information */}
      <Alert 
        severity="info" 
        sx={{ mb: 2 }}
        icon={<SecurityIcon />}
      >
        <Typography variant="body2">
          <strong>Access Level:</strong> As a reporting manager, you have access to work-related information only. 
          Personal details like bank information, salary details, and sensitive personal data are restricted.
        </Typography>
      </Alert>

      {/* Team Members List */}
      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1 }} />
            Team Members ({teamMembers.length})
          </Typography>
          
          {teamMembers.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Balance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
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
                        {member.leaveBalance ? (
                          <Box>
                            <Typography variant="caption" display="block">
                              CL: {member.leaveBalance.casualLeave?.available || 0}/{member.leaveBalance.casualLeave?.allocated || 0} | SL: {member.leaveBalance.sickLeave?.available || 0}/{member.leaveBalance.sickLeave?.allocated || 0}
                            </Typography>
                            <Typography variant="caption" display="block">
                              EL: {member.leaveBalance.specialLeave?.available || 0}/{member.leaveBalance.specialLeave?.allocated || 0}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not available
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewEmployee(member)}
                        >
                          View Dashboard
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
                No team members found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any direct reports yet
              </Typography>
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

                    {/* Show restricted access message for sensitive fields */}
                    {accessLevel === 'manager' && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          Personal information like phone number, address, bank details, and salary information 
                          are restricted from manager view for privacy protection.
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Attendance Summary */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ mr: 1 }} />
                      Attendance Summary (This Month)
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                          <Typography variant="h6" fontWeight="600" color="success.main">
                            {employeeDashboard.attendance?.present || 0}
                          </Typography>
                          <Typography variant="caption" color="success.main">Present</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                          <Typography variant="h6" fontWeight="600" color="error.main">
                            {employeeDashboard.attendance?.absent || 0}
                          </Typography>
                          <Typography variant="caption" color="error.main">Absent</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={attendancePercentage} 
                        sx={{ mb: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {attendancePercentage}%
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Late Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {employeeDashboard.attendance?.late || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Working Days:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {employeeDashboard.attendance?.totalWorkingDays || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Leave Summary */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <BeachAccessIcon sx={{ mr: 1 }} />
                      Leave Summary (This Year)
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
                          <Typography variant="h6" fontWeight="600" color="primary.main">
                            {employeeDashboard.leaves?.totalRequests || 0}
                          </Typography>
                          <Typography variant="caption" color="primary.main">Total Requests</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                          <Typography variant="h6" fontWeight="600" color="success.main">
                            {employeeDashboard.leaves?.approved || 0}
                          </Typography>
                          <Typography variant="caption" color="success.main">Approved</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.50' }}>
                          <Typography variant="h6" fontWeight="600" color="warning.main">
                            {employeeDashboard.leaves?.pending || 0}
                          </Typography>
                          <Typography variant="caption" color="warning.main">Pending</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                          <Typography variant="h6" fontWeight="600" color="error.main">
                            {employeeDashboard.leaves?.rejected || 0}
                          </Typography>
                          <Typography variant="caption" color="error.main">Rejected</Typography>
                        </Box>
                      </Grid>
                    </Grid>
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

export default TeamDashboard;
