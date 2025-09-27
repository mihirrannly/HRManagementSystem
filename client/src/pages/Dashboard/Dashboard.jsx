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
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

// Sample data for charts (replace with real API data)
const attendanceData = [
  { name: 'Mon', present: 85, absent: 15 },
  { name: 'Tue', present: 90, absent: 10 },
  { name: 'Wed', present: 88, absent: 12 },
  { name: 'Thu', present: 92, absent: 8 },
  { name: 'Fri', present: 87, absent: 13 },
];

const leaveData = [
  { name: 'Sick Leave', value: 30, color: '#ff6b6b' },
  { name: 'Casual Leave', value: 45, color: '#4ecdc4' },
  { name: 'Earned Leave', value: 25, color: '#45b7d1' },
];

const departmentData = [
  { name: 'Engineering', employees: 45 },
  { name: 'Sales', employees: 32 },
  { name: 'Marketing', employees: 28 },
  { name: 'HR', employees: 12 },
  { name: 'Finance', employees: 18 },
];

const StatCard = ({ title, value, change, icon, color = 'primary', onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      position: 'relative', 
      overflow: 'visible',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: 4,
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {change && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {change > 0 ? (
            <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
          ) : (
            <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
          )}
          <Typography
            variant="body2"
            color={change > 0 ? 'success.main' : 'error.main'}
            fontWeight="medium"
          >
            {Math.abs(change)}% from last month
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalEmployees: 0,
      newJoinees: 0,
      pendingLeaves: 0,
      approvedLeavesThisMonth: 0,
    },
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    },
    departments: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/reports/dashboard');
      // Transform the API response to match the expected structure
      const transformedData = {
        overview: {
          totalEmployees: response.data.totalEmployees || 0,
          newJoinees: response.data.newEmployeesThisMonth || 0,
          pendingLeaves: 0, // Not available from API yet
          approvedLeavesThisMonth: 0, // Not available from API yet
        },
        attendance: {
          present: 0, // Not available from API yet
          absent: 0,
          late: 0,
          halfDay: 0,
        },
        departments: response.data.departments || [],
        activities: response.data.activities || [],
        totalDepartments: response.data.totalDepartments || 0,
        employeesOnProbation: response.data.employeesOnProbation || 0,
      };
      setDashboardData(transformedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get('/attendance/status');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('/attendance/checkin');
      fetchAttendanceStatus();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('/attendance/checkout');
      fetchAttendanceStatus();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.employee?.name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {moment().format('dddd, MMMM Do YYYY')}
        </Typography>
      </Box>

      {/* Quick Actions for Employees */}
      {user?.role === 'employee' && (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Today's Attendance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {attendanceStatus?.isCheckedIn 
                    ? `Checked in at ${moment(attendanceStatus.checkInTime).format('HH:mm')}`
                    : 'Not checked in yet'
                  }
                </Typography>
                {attendanceStatus?.isCheckedOut && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Checked out at {moment(attendanceStatus.checkOutTime).format('HH:mm')}
                  </Typography>
                )}
              </Box>
              <Box>
                {!attendanceStatus?.isCheckedIn ? (
                  <Chip
                    label="Check In"
                    onClick={handleCheckIn}
                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                  />
                ) : !attendanceStatus?.isCheckedOut ? (
                  <Chip
                    label="Check Out"
                    onClick={handleCheckOut}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    label="Completed"
                    sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Employees"
            value={dashboardData.overview.totalEmployees}
            change={5}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Present Today"
            value={dashboardData.attendance.present}
            change={2}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pending Leaves"
            value={dashboardData.overview.pendingLeaves}
            change={-10}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="New Joiners"
            value={dashboardData.overview.newJoinees}
            change={15}
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Organization"
              value="Dashboard"
              icon={<BusinessIcon />}
              color="secondary"
              onClick={() => navigate('/organization')}
            />
          </Grid>
        )}
      </Grid>

      {/* Charts and Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Attendance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                Weekly Attendance Overview
              </Typography>
              <IconButton size="small">
                <RefreshIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#f44336"
                  strokeWidth={3}
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Leave Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Leave Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Overview and Recent Activities */}
      <Grid container spacing={3}>
        {/* Department Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Department Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="John Doe checked in"
                  secondary="2 minutes ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <BeachAccessIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Leave request approved for Jane Smith"
                  secondary="1 hour ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="New employee onboarded"
                  secondary="3 hours ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Payroll processed for December"
                  secondary="1 day ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
