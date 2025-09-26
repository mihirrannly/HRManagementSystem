import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

// Sample data for charts
const attendanceTrendData = [
  { month: 'Jan', present: 85, absent: 15 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 92, absent: 8 },
  { month: 'Apr', present: 90, absent: 10 },
  { month: 'May', present: 87, absent: 13 },
  { month: 'Jun', present: 94, absent: 6 },
];

const departmentData = [
  { name: 'Engineering', employees: 45, color: '#8884d8' },
  { name: 'Sales', employees: 32, color: '#82ca9d' },
  { name: 'Marketing', employees: 28, color: '#ffc658' },
  { name: 'HR', employees: 12, color: '#ff7c7c' },
  { name: 'Finance', employees: 18, color: '#8dd1e1' },
];

const leaveAnalyticsData = [
  { type: 'Sick Leave', count: 45 },
  { type: 'Casual Leave', count: 78 },
  { type: 'Earned Leave', count: 65 },
  { type: 'Maternity Leave', count: 8 },
];

const Reports = () => {
  const { user, isHR, isAdmin, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      switch (reportType) {
        case 'attendance':
          endpoint = '/reports/attendance';
          break;
        case 'leave':
          endpoint = '/reports/leave';
          break;
        case 'payroll':
          endpoint = '/reports/payroll';
          break;
        default:
          endpoint = '/reports/dashboard';
      }

      const response = await axios.get(endpoint);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.info('Export functionality coming soon!');
  };

  if (!isHR && !isAdmin && !isManager) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          You don't have permission to view reports.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Reports & Analytics
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchReportData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Report Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Report Filters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="leave">Leave Report</MenuItem>
              {(isHR || isAdmin) && <MenuItem value="payroll">Payroll Report</MenuItem>}
              <MenuItem value="dashboard">Dashboard Overview</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="thisWeek">This Week</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="thisQuarter">This Quarter</MenuItem>
              <MenuItem value="thisYear">This Year</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts and Analytics */}
      <Grid container spacing={3}>
        {/* Attendance Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Trend Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                  name="Present"
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#f44336"
                  strokeWidth={3}
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 6 }}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="employees"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Leave Analytics */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Leave Analytics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1
                  }
                }}>
                  <Typography variant="h4" color="text.primary" fontWeight="bold">
                    94%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Attendance
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1
                  }
                }}>
                  <Typography variant="h4" color="text.primary" fontWeight="bold">
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Joiners
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1
                  }
                }}>
                  <Typography variant="h4" color="text.primary" fontWeight="bold">
                    8.2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Hours/Day
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1
                  }
                }}>
                  <Typography variant="h4" color="text.primary" fontWeight="bold">
                    5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attrition Rate
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 1
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                135
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Employees
              </Typography>
              <Typography variant="caption" color="text.secondary">
                +5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 1
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                127
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Present Today
              </Typography>
              <Typography variant="caption" color="text.secondary">
                94% attendance rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 1
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                15
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Leaves
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requires approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 1
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                ₹12.5L
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Monthly Payroll
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This month's total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
