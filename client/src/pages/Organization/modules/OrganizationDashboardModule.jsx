import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  ButtonGroup,
  useTheme,
  alpha,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assessment as ReportIcon,
  TrendingUp,
  TrendingDown,
  People as PeopleIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  InsertChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

// Sample data for charts
const monthlyData = [
  { month: 'Jan', employees: 145, joiners: 8, exits: 3, revenue: 2.4 },
  { month: 'Feb', employees: 152, joiners: 12, exits: 5, revenue: 2.8 },
  { month: 'Mar', employees: 158, joiners: 9, exits: 3, revenue: 3.1 },
  { month: 'Apr', employees: 164, joiners: 11, exits: 5, revenue: 3.3 },
  { month: 'May', employees: 170, joiners: 8, exits: 2, revenue: 3.5 },
  { month: 'Jun', employees: 175, joiners: 7, exits: 2, revenue: 3.7 },
];

const departmentData = [
  { name: 'Engineering', count: 45, color: '#1976d2' },
  { name: 'Sales', count: 32, color: '#388e3c' },
  { name: 'Marketing', count: 28, color: '#f57c00' },
  { name: 'HR', count: 12, color: '#7b1fa2' },
  { name: 'Finance', count: 18, color: '#d32f2f' },
];

const employeeReportData = [
  { id: 1, name: 'John Doe', department: 'Engineering', position: 'Senior Developer', joinDate: '2023-01-15', status: 'Active', performance: 4.5 },
  { id: 2, name: 'Jane Smith', department: 'Sales', position: 'Sales Manager', joinDate: '2022-11-20', status: 'Active', performance: 4.8 },
  { id: 3, name: 'Mike Johnson', department: 'Marketing', position: 'Marketing Specialist', joinDate: '2023-03-10', status: 'Active', performance: 4.2 },
  { id: 4, name: 'Sarah Wilson', department: 'HR', position: 'HR Coordinator', joinDate: '2022-09-05', status: 'Active', performance: 4.6 },
  { id: 5, name: 'David Brown', department: 'Finance', position: 'Financial Analyst', joinDate: '2023-02-28', status: 'Active', performance: 4.3 },
];

const StatCard = ({ title, value, change, icon, color, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', borderLeft: `3px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {change > 0 ? (
              <TrendingUp color="success" sx={{ mr: 1, fontSize: 16 }} />
            ) : (
              <TrendingDown color="error" sx={{ mr: 1, fontSize: 16 }} />
            )}
            <Typography
              variant="caption"
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
};

const SummaryModule = ({ analytics }) => {
  // Use real data from analytics or fallback to defaults
  const totalEmployees = analytics?.summary?.totalEmployees || 41;
  const newThisMonth = analytics?.summary?.newEmployeesThisMonth || 7;
  const departments = analytics?.breakdowns?.departments || [];
  const totalDepartments = departments.length || 9;
  const probationEmployees = analytics?.summary?.employeesInProbation || 0;
  const recentChanges = analytics?.summary?.recentDataChanges || 41;

  // Handle view all actions
  const handleViewAll = (type) => {
    console.log(`View all ${type} clicked`);
    // TODO: Navigate to specific view or open modal
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    console.log(`Quick action ${action} clicked`);
    // TODO: Open relevant dialog or navigate
  };

  return (
  <Box sx={{ p: { xs: 2, md: 4 } }}>
    {/* Pending Actions */}
    <Grid container spacing={3} sx={{ mb: 5 }}>
      <Grid item xs={12}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h5" 
              fontWeight="700" 
              color="text.primary"
              sx={{ mb: 1 }}
            >
              Pending Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items requiring your attention across different modules
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {[
              { count: Math.floor(totalEmployees * 0.2), label: 'Documents', color: '#f57c00', bgColor: '#fff8f0', icon: '📄' },
              { count: Math.floor(totalEmployees * 0.05), label: 'Expenses', color: '#00acc1', bgColor: '#f0fdff', icon: '💰' },
              { count: probationEmployees, label: 'Probations', color: '#66bb6a', bgColor: '#f0fff0', icon: '⏳' },
              { count: newThisMonth, label: 'Join Tasks', color: '#1976d2', bgColor: '#f8fafe', icon: '👋' },
              { count: Math.floor(totalEmployees * 0.02), label: 'Exit Tasks', color: '#d32f2f', bgColor: '#fff0f0', icon: '👋' },
              { count: Math.floor(recentChanges * 0.1), label: 'Profile changes', color: '#7b1fa2', bgColor: '#f8f0ff', icon: '👤' }
            ].map((action, index) => (
              <Grid item xs={4} sm={3} md={2} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: action.bgColor,
                    border: `1px solid ${action.color}20`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minHeight: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${action.color}20`,
                      borderColor: action.color
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: '1rem', mb: 0.5, lineHeight: 1 }}>
                    {action.icon}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="700" 
                    color={action.color}
                    sx={{ fontSize: '1.25rem', lineHeight: 1, mb: 0.5 }}
                  >
                    {action.count}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    fontWeight="500" 
                    color="text.primary"
                    sx={{ fontSize: '0.65rem', lineHeight: 1 }}
                  >
                    {action.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>

    {/* Employee Overview */}
    <Grid container spacing={3} sx={{ mb: 5 }}>
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
              borderColor: '#1976d2'
            }
          }}
        >
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Typography 
              variant="h2" 
              fontWeight="800" 
              color="primary.main"
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1,
                mb: 1
              }}
            >
              {totalEmployees}
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight="600" 
              color="text.primary"
              sx={{ mb: 2 }}
            >
              Employees
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Registered
              </Typography>
              <Chip 
                label={totalEmployees - 3} 
                size="small" 
                color="success" 
                sx={{ fontWeight: 600, minWidth: 45 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Not invited
              </Typography>
              <Chip 
                label="3" 
                size="small" 
                color="warning" 
                sx={{ fontWeight: 600, minWidth: 45 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight="500">
                Yet to register
              </Typography>
              <Chip 
                label="0" 
                size="small" 
                color="default" 
                sx={{ fontWeight: 600, minWidth: 45 }}
              />
            </Box>
          </Box>
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              fontWeight: 600
            }}
          >
            Total headcount
          </Typography>
        </Paper>
      </Grid>

      {/* Quick Links */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0f8f0 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(56, 142, 60, 0.15)',
              borderColor: '#388e3c'
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="700" 
            color="success.main"
            sx={{ mb: 3, display: 'flex', alignItems: 'center' }}
          >
            <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
            Quicklinks
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Button 
              startIcon={<PersonAddIcon />} 
              variant="outlined" 
              size="medium" 
              fullWidth
              onClick={() => handleQuickAction('new-employee')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              New Employee
            </Button>
            <Button 
              startIcon={<AnalyticsIcon />} 
              variant="outlined" 
              size="medium" 
              fullWidth
              onClick={() => handleQuickAction('new-poll')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              New Poll
            </Button>
            <Button 
              startIcon={<DashboardIcon />} 
              variant="outlined" 
              size="medium" 
              fullWidth
              onClick={() => handleQuickAction('new-announcement')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              New Announcement
            </Button>
          </Box>
          
          <Divider sx={{ my: 2, borderColor: 'success.light', opacity: 0.3 }} />
          
          <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 2 }}>
            Employee Custom Fields
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography 
              variant="body2" 
              color="primary" 
              onClick={() => handleQuickAction('org-directory')}
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: 'primary.dark',
                  transform: 'translateX(4px)'
                }
              }}
            >
              → Org Directory
            </Typography>
            <Typography 
              variant="body2" 
              color="primary" 
              onClick={() => handleQuickAction('org-tree')}
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: 'primary.dark',
                  transform: 'translateX(4px)'
                }
              }}
            >
              → Org Tree
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Bulk Operations */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(245, 124, 0, 0.15)',
              borderColor: '#f57c00'
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="700" 
            color="warning.main"
            sx={{ mb: 3, display: 'flex', alignItems: 'center' }}
          >
            <RefreshIcon sx={{ mr: 1, fontSize: 20 }} />
            Bulk operations
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { label: 'Add Employees in Bulk', action: 'add-bulk' },
              { label: 'Update Employees in Bulk', action: 'update-bulk' }, 
              { label: 'Bulk invite employees', action: 'bulk-invite' },
              { label: 'Import Employee Job Details', action: 'import-job-details' },
              { label: 'Import Employee Custom Fields', action: 'import-custom-fields' },
              { label: 'Bulk Import Employee Documents', action: 'import-documents' }
            ].map((operation, index) => (
              <Box 
                key={index}
                onClick={() => handleBulkOperation(operation.action)}
                sx={{ 
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'warning.light',
                    color: 'white',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Typography variant="body2" fontWeight="500">
                  → {operation.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Quick Reports */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8f0ff 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(123, 31, 162, 0.15)',
              borderColor: '#7b1fa2'
            }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="700" 
            color="secondary.main"
            sx={{ mb: 3, display: 'flex', alignItems: 'center' }}
          >
            <ReportIcon sx={{ mr: 1, fontSize: 20 }} />
            Quick Reports
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {[
              { label: 'All employees', action: 'all-employees' },
              { label: 'Registered employees', action: 'registered-employees' },
              { label: 'Incomplete profiles', action: 'incomplete-profiles' },
              { label: 'Employee job details', action: 'job-details' },
              { label: 'Employees in probation', action: 'probation-employees' },
              { label: 'Employees in notice period', action: 'notice-period' }
            ].map((report, index) => (
              <Box 
                key={index}
                onClick={() => handleReport(report.action)}
                sx={{ 
                  py: 0.75,
                  px: 2,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'secondary.light',
                    color: 'white',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Typography variant="body2" fontWeight="500">
                  → {report.label}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Divider sx={{ my: 2, borderColor: 'secondary.light', opacity: 0.3 }} />
          
          <Typography variant="subtitle2" fontWeight="700" color="text.primary" sx={{ mb: 1.5 }}>
            Other Reports
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
            {[
              { label: 'Employee Master details', action: 'employee-master' },
              { label: 'Employee documents report', action: 'documents-report' },
              { label: 'Employees pending salary revisions', action: 'salary-revisions' },
              { label: 'Attrition employee report', action: 'attrition-report' },
              { label: 'Employee Master details with custom fields', action: 'master-custom-fields' }
            ].map((report, index) => (
              <Typography 
                key={index}
                variant="caption" 
                color="primary" 
                onClick={() => handleReport(report.action)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 500,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    bgcolor: 'primary.light',
                    color: 'white',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                → {report.label}
              </Typography>
            ))}
          </Box>
          
          <Button
            variant="contained"
            size="small"
            fullWidth
            sx={{ 
              mt: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)'
            }}
          >
            Explore more reports
          </Button>
        </Paper>
      </Grid>
    </Grid>

    {/* Employee Sections */}
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Typography 
        variant="h5" 
        fontWeight="700" 
        color="text.primary"
        sx={{ mb: 1 }}
      >
        Employee Overview
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Current status and important updates for your team members
      </Typography>
    </Box>
    
    <Grid container spacing={3}>
      {/* Exits */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            border: '1px solid #ffebee',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(211, 47, 47, 0.15)',
              borderColor: '#d32f2f'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExitIcon sx={{ color: '#d32f2f', mr: 1, fontSize: 18 }} />
              <Typography variant="subtitle1" fontWeight="700" color="#d32f2f" sx={{ fontSize: '1rem' }}>
                Exits (9)
              </Typography>
            </Box>
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              onClick={() => handleViewAll('exits')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: '0.7rem',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto'
              }}
            >
              View all
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 280, overflowY: 'auto' }}>
            {[
              { initials: 'RD', name: 'Rupayan Dutta', date: '20 May 2025', dept: 'Sales - Noida' },
              { initials: 'JS', name: 'Jyoti Singh', date: '23 Jun 2025', dept: 'Sales - Noida' },
              { initials: 'AK', name: 'Aman Kumar', date: '01 Jul 2025', dept: 'IT - Noida' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(211, 47, 47, 0.05)',
                  border: '1px solid rgba(211, 47, 47, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#d32f2f', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="error.main" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    {employee.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Onboarding */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            border: '1px solid #e8f5e8',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0fff0 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(56, 142, 60, 0.15)',
              borderColor: '#388e3c'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonAddIcon sx={{ color: '#388e3c', mr: 1, fontSize: 18 }} />
              <Typography variant="subtitle1" fontWeight="700" color="#388e3c" sx={{ fontSize: '1rem' }}>
                Onboarding ({newThisMonth})
              </Typography>
            </Box>
            <Button 
              size="small" 
              variant="outlined" 
              color="success"
              onClick={() => handleViewAll('onboarding')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: '0.7rem',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto'
              }}
            >
              View all
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 280, overflowY: 'auto' }}>
            {[
              { initials: 'TR', name: 'Tamada Raj Kumar', dept: 'IT - Noida' },
              { initials: 'GK', name: 'Gaurav Kumar', dept: 'IT - Noida' },
              { initials: 'AB', name: 'Abhinav Baliyan', dept: 'IT - Noida' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(56, 142, 60, 0.05)',
                  border: '1px solid rgba(56, 142, 60, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(56, 142, 60, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#388e3c', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    New Joiner
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Probation */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            border: '1px solid #fff8e1',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fffdf0 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(245, 124, 0, 0.15)',
              borderColor: '#f57c00'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ color: '#f57c00', mr: 1, fontSize: 18 }} />
              <Typography variant="subtitle1" fontWeight="700" color="#f57c00" sx={{ fontSize: '1rem' }}>
                Probation ({probationEmployees || 'N/A'})
              </Typography>
            </Box>
            <Button 
              size="small" 
              variant="outlined" 
              color="warning"
              onClick={() => handleViewAll('probation')}
              sx={{ 
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: '0.7rem',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto'
              }}
            >
              View all
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 280, overflowY: 'auto' }}>
            {[
              { initials: 'SS', name: 'Sonal Seth', dept: 'Operation - Noida' },
              { initials: 'AS', name: 'Abhishek Sharma', dept: 'Operation - Noida' },
              { initials: 'ST', name: 'Saurabh Tiwari', dept: 'Sales - Noida' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(245, 124, 0, 0.05)',
                  border: '1px solid rgba(245, 124, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(245, 124, 0, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#f57c00', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="warning.main" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    In Probation
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Birthdays */}
      <Grid item xs={12} md={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            border: '1px solid #f3e5f5',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(123, 31, 162, 0.15)',
              borderColor: '#7b1fa2'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.2rem', mr: 1 }}>🎂</Typography>
            <Typography variant="subtitle1" fontWeight="700" color="#7b1fa2" sx={{ fontSize: '1rem' }}>
              Birthdays
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 280, overflowY: 'auto' }}>
            {[
              { initials: 'GS', name: 'Gauri Sharma', date: '29 Sep 1998', dept: 'IT - Noida' },
              { initials: 'KJ', name: 'Kirti Jain', date: '03 Oct 1999', dept: 'Operation - Noida' },
              { initials: 'AP', name: 'Abhishek Pratap Singh', date: '15 Oct 2002', dept: 'IT - Noida' },
              { initials: 'DC', name: 'Dhruv Chandhok', date: '17 Oct 1994', dept: 'Sales - Noida' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(123, 31, 162, 0.05)',
                  border: '1px solid rgba(123, 31, 162, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(123, 31, 162, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#7b1fa2', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="secondary.main" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    {employee.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>

    {/* Work Anniversaries Section */}
    <Box sx={{ textAlign: 'center', mb: 4, mt: 5 }}>
      <Typography 
        variant="h5" 
        fontWeight="700" 
        color="text.primary"
        sx={{ mb: 1 }}
      >
        Work Anniversaries
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Celebrating milestones and dedication of our team members
      </Typography>
    </Box>
    
    <Grid container spacing={3}>
      {/* Work Anniversaries */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 300,
            border: '1px solid #e8f5e8',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(34, 139, 34, 0.15)',
              borderColor: '#228b22'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.2rem', mr: 1 }}>🎉</Typography>
            <Typography variant="subtitle1" fontWeight="700" color="#228b22" sx={{ fontSize: '1rem' }}>
              This Month's Anniversaries
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 200, overflowY: 'auto' }}>
            {[
              { initials: 'RK', name: 'Rajesh Kumar', years: '5 Years', date: '15 Oct 2018', dept: 'Engineering - Delhi' },
              { initials: 'PS', name: 'Priya Sharma', years: '3 Years', date: '22 Oct 2020', dept: 'Marketing - Mumbai' },
              { initials: 'AV', name: 'Amit Verma', years: '2 Years', date: '28 Oct 2021', dept: 'Sales - Bangalore' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(34, 139, 34, 0.05)',
                  border: '1px solid rgba(34, 139, 34, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(34, 139, 34, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#228b22', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="#228b22" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    {employee.years} • {employee.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Upcoming Anniversaries */}
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 300,
            border: '1px solid #fff8e1',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fffef7 0%, #ffffff 100%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(255, 193, 7, 0.15)',
              borderColor: '#ffc107'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.2rem', mr: 1 }}>⭐</Typography>
            <Typography variant="subtitle1" fontWeight="700" color="#ffc107" sx={{ fontSize: '1rem' }}>
              Upcoming Anniversaries
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 200, overflowY: 'auto' }}>
            {[
              { initials: 'NK', name: 'Neha Kapoor', years: '4 Years', date: '05 Nov 2019', dept: 'HR - Noida' },
              { initials: 'VS', name: 'Vikash Singh', years: '6 Years', date: '12 Nov 2017', dept: 'Finance - Pune' },
              { initials: 'SM', name: 'Sanjay Mishra', years: '1 Year', date: '20 Nov 2022', dept: 'Operations - Chennai' }
            ].map((employee, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255, 193, 7, 0.05)',
                  border: '1px solid rgba(255, 193, 7, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 193, 7, 0.1)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: '#ffc107', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mr: 1.5,
                    color: '#000'
                  }}
                >
                  {employee.initials}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="600" color="text.primary" sx={{ fontSize: '0.85rem' }}>
                    {employee.name}
                  </Typography>
                  <Typography variant="caption" color="#f57c00" fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                    {employee.years} • {employee.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {employee.dept}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Box>
  );
};

const AnalyticsModule = ({ analytics }) => {
  // Use real data from analytics or fallback to defaults
  const departments = analytics?.breakdowns?.departments || [];
  const totalEmployees = analytics?.summary?.totalEmployees || 41;

  return (
  <Box sx={{ 
    p: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Ultra Premium Header */}
    <Box sx={{ 
      position: 'relative', 
      zIndex: 2,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '0 0 20px 20px',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: 'none',
      p: 4,
      mb: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              p: 1,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <AssessmentIcon sx={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)' }} />
            </Box>
            <Typography 
              variant="h4" 
              fontWeight="600" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontFamily: '"Inter", "Roboto", sans-serif'
              }}
            >
              Analytics Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Real-time Insights
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Interactive Visualizations
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Advanced Analytics
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Button 
            startIcon={<FilterIcon />} 
            variant="contained"
            size="medium"
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Filters
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            variant="outlined"
            size="medium"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.9)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Live Stats Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 4, 
        mt: 3,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { label: 'Total Employees', value: '41' },
          { label: 'Departments', value: '13' },
          { label: 'Active Projects', value: '28' },
          { label: 'Growth Rate', value: '+12%' }
        ].map((stat, index) => (
          <Box 
            key={index}
            sx={{ 
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 120,
              textAlign: 'center',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="700" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                mb: 0.5,
                fontSize: '1.25rem'
              }}
            >
              {stat.value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.75rem' }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    <Box sx={{ position: 'relative', zIndex: 1, px: 4, pb: 4 }}>

      {/* Premium Demographics Dashboard */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {/* Advanced Gender Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(25px) saturate(200%)',
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `
                0 20px 40px -12px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #00d4ff 0%, #ff006e 50%, #8338ec 100%)',
                borderRadius: '5px 5px 0 0'
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `
                  0 30px 60px -12px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    mb: 1
                  }}
                >
                  Gender Distribution
                </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400, fontSize: '0.8rem' }}>
                    Workforce diversity analysis • 41 total employees
                  </Typography>
              </Box>
              <Button 
                size="small" 
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                View Details
              </Button>
            </Box>
            
            <Box sx={{ height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <radialGradient id="maleGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0099cc" stopOpacity={1} />
                    </radialGradient>
                    <radialGradient id="femaleGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ff006e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#cc0055" stopOpacity={1} />
                    </radialGradient>
                  </defs>
                  <Pie
                    data={[
                      { name: 'Male', value: 31, color: 'url(#maleGradient)' },
                      { name: 'Female', value: 10, color: 'url(#femaleGradient)' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={3}
                  >
                    {[
                      { name: 'Male', value: 31, color: 'url(#maleGradient)' },
                      { name: 'Female', value: 10, color: 'url(#femaleGradient)' }
                    ].map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 35, 0.95)',
                      borderRadius: '15px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                      color: '#ffffff',
                      backdropFilter: 'blur(20px)'
                    }}
                    labelStyle={{ color: '#00d4ff', fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Advanced Center Statistics */}
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '50%',
                width: 100,
                height: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}>
                <Typography 
                  variant="h4" 
                  fontWeight="700" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.5rem'
                  }}
                >
                  41
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.7rem' }}>
                  TOTAL
                </Typography>
              </Box>
            </Box>

            {/* Premium Legend with Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, gap: 2 }}>
              <Box sx={{ 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid rgba(255,255,255,0.1)',
                flex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                  <Typography variant="body2" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>Male</Typography>
                </Box>
                <Typography variant="h6" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>31</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>75.6%</Typography>
              </Box>
              <Box sx={{ 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid rgba(255,255,255,0.1)',
                flex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                  <Typography variant="body2" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>Female</Typography>
                </Box>
                <Typography variant="h6" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>10</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>24.4%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Advanced Employment Type Analysis */}
        <Grid item xs={12} lg={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                  Employment Type
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contract vs Full-time breakdown
                </Typography>
              </Box>
              <Button 
                size="small" 
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: 'rgba(86, 171, 47, 0.3)',
                  color: '#56ab2f'
                }}
              >
                View Details
              </Button>
            </Box>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Full Time', value: 39, color: '#56ab2f' },
                    { name: 'Part Time', value: 1, color: '#a8e6cf' },
                    { name: 'Contract', value: 1, color: '#ff9f43' }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    fill="url(#employmentGradient)"
                  />
                  <defs>
                    <linearGradient id="employmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#56ab2f" />
                      <stop offset="100%" stopColor="#a8e6cf" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Worker Type & Nationality */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Worker Type Donut Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ff9f43 0%, #ff6b6b 100%)'
              }
            }}
          >
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
              Worker Type Distribution
            </Typography>
            
            <Box sx={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Permanent', value: 40, color: '#ff9f43' },
                      { name: 'Contract', value: 1, color: '#ff6b6b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { name: 'Permanent', value: 40, color: '#ff9f43' },
                      { name: 'Contract', value: 1, color: '#ff6b6b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#ff9f43' }}>
                  97.6%
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Permanent
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Nationality Distribution */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)'
              }
            }}
          >
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
              Nationality Breakdown
            </Typography>
            
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'India', value: 27, percentage: '65.9%' },
                    { name: 'Not Specified', value: 14, percentage: '34.1%' }
                  ]}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 8, 8, 0]}
                    fill="url(#nationalityGradient)"
                  />
                  <defs>
                    <linearGradient id="nationalityGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4ecdc4" />
                      <stop offset="100%" stopColor="#44a08d" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Age Distribution & Experience Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Age Distribution Chart */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)'
              }
            }}
          >
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
              Age Distribution Analysis
            </Typography>
            
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { range: '20-25', count: 8, male: 6, female: 2 },
                    { range: '26-30', count: 18, male: 14, female: 4 },
                    { range: '31-35', count: 10, male: 8, female: 2 },
                    { range: '36-40', count: 4, male: 2, female: 2 },
                    { range: '40+', count: 1, male: 1, female: 0 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="male" stackId="a" fill="#667eea" radius={[0, 0, 0, 0]} name="Male" />
                  <Bar dataKey="female" stackId="a" fill="#764ba2" radius={[4, 4, 0, 0]} name="Female" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Age Insights */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  borderRadius: 3,
                  color: 'white'
                }}>
                  <Typography variant="h4" fontWeight="800">27</Typography>
                  <Typography variant="body2" fontWeight="600">Average Age</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
                  borderRadius: 3,
                  color: '#8B4513'
                }}>
                  <Typography variant="h4" fontWeight="800">26-30</Typography>
                  <Typography variant="body2" fontWeight="600">Most Common</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                  borderRadius: 3,
                  color: '#4A4A4A'
                }}>
                  <Typography variant="h4" fontWeight="800">44%</Typography>
                  <Typography variant="body2" fontWeight="600">In Prime Age</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Experience Metrics */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)'
              }
            }}
          >
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
              Experience Metrics
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Max Experience */}
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)', 
                borderRadius: 3,
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                  4 years 7 months
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  Maximum Experience
                </Typography>
              </Box>

              {/* Min Experience */}
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, #ff9f43 0%, #ffad43 100%)', 
                borderRadius: 3,
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                  0 months
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  Minimum Experience
                </Typography>
              </Box>

              {/* Average Experience */}
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', 
                borderRadius: 3,
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                  1 year 6 months
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  Average Experience
                </Typography>
              </Box>

              {/* Experience Distribution Donut */}
              <Box sx={{ height: 150, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '0-1 year', value: 15 },
                        { name: '1-2 years', value: 12 },
                        { name: '2-3 years', value: 8 },
                        { name: '3+ years', value: 6 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {[
                        { name: '0-1 year', value: 15, color: '#56ab2f' },
                        { name: '1-2 years', value: 12, color: '#ff9f43' },
                        { name: '2-3 years', value: 8, color: '#4ecdc4' },
                        { name: '3+ years', value: 6, color: '#667eea' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" fontWeight="700" color="text.primary">
                    Experience
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Distribution
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Analysis Dashboard */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
          }
        }}
      >
        <Typography variant="h4" fontWeight="800" color="text.primary" sx={{ mb: 1 }}>
          Department Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Cross-departmental insights and workforce distribution patterns
        </Typography>

        {/* Department Headcount Chart */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ height: 400 }}>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                Headcount by Department
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departments.map(dept => ({
                    department: dept.departmentName,
                    male: Math.floor(dept.totalEmployees * 0.7), // Approximate male ratio
                    female: Math.ceil(dept.totalEmployees * 0.3), // Approximate female ratio
                    total: dept.totalEmployees
                  })).slice(0, 6)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="male" stackId="a" fill="#667eea" radius={[0, 0, 0, 0]} name="Male" />
                  <Bar dataKey="female" stackId="a" fill="#764ba2" radius={[4, 4, 0, 0]} name="Female" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Department Insights */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight="700">
                Key Insights
              </Typography>
              
              {/* Top Department */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)', 
                borderRadius: 3,
                color: 'white'
              }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 1 }}>
                  IT Department
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                  Largest Team • 16 Employees
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label="12 Male" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <Chip label="4 Female" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                </Box>
              </Box>

              {/* Employment Distribution */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #ff9f43 0%, #ffad43 100%)', 
                borderRadius: 3,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                  Employment Distribution
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Full-time dominance across all departments
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="800">95%</Typography>
                    <Typography variant="caption">Full-time</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="800">5%</Typography>
                    <Typography variant="caption">Part-time</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Worker Type Breakdown */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', 
                borderRadius: 3,
                color: 'white'
              }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                  Worker Classification
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Permanent staff stability
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="800">40</Typography>
                    <Typography variant="caption">Permanent</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="800">1</Typography>
                    <Typography variant="caption">Contract</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Department Performance Metrics */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
            Department Performance Overview
          </Typography>
          <Grid container spacing={3}>
            {[
              { dept: 'IT', score: 94, trend: 'up', employees: 16, color: '#667eea' },
              { dept: 'Sales', score: 87, trend: 'up', employees: 11, color: '#56ab2f' },
              { dept: 'Operations', score: 91, trend: 'stable', employees: 7, color: '#ff9f43' },
              { dept: 'Marketing', score: 89, trend: 'up', employees: 4, color: '#4ecdc4' },
              { dept: 'HR', score: 92, trend: 'stable', employees: 2, color: '#764ba2' },
              { dept: 'Finance', score: 95, trend: 'up', employees: 1, color: '#ff6b6b' }
            ].map((dept, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Box sx={{ 
                  p: 2, 
                  background: `linear-gradient(135deg, ${dept.color} 0%, ${dept.color}AA 100%)`,
                  borderRadius: 3,
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                    {dept.dept}
                  </Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
                    {dept.score}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Performance Score
                  </Typography>
                  <Box sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: dept.trend === 'up' ? '#4caf50' : dept.trend === 'down' ? '#f44336' : '#ff9800'
                  }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  </Box>
  );
};

const EmployeeReportModule = () => {
  const [selectedCategory, setSelectedCategory] = useState('reports-home');

  const reportCategories = [
    {
      id: 'reports-home',
      title: 'Reports Home',
      icon: '🏠',
      description: 'Overview of all available reports',
      reports: [
        'Most Used Reports',
        'Recent Reports',
        'Favorite Reports',
        'Quick Access Dashboard'
      ]
    },
    {
      id: 'employee-info',
      title: 'Employee Info',
      icon: '👤',
      description: 'Detailed employee information and profiles',
      reports: [
        'Employee Master List',
        'Employee Directory',
        'Contact Information',
        'Personal Details',
        'Emergency Contacts',
        'Employee ID Cards',
        'Profile Completion Status'
      ]
    },
    {
      id: 'employee-policies',
      title: 'Employee Policies & Others',
      icon: '📋',
      description: 'Policy compliance and additional employee data',
      reports: [
        'Policy Acknowledgments',
        'Training Completions',
        'Certifications',
        'Skills Assessment',
        'Performance Reviews',
        'Disciplinary Actions',
        'Awards & Recognition'
      ]
    },
    {
      id: 'employee-demography',
      title: 'Employee Demography',
      icon: '📊',
      description: 'Demographic analysis and statistics',
      reports: [
        'Age Distribution',
        'Gender Analysis',
        'Location Breakdown',
        'Department Distribution',
        'Experience Levels',
        'Education Background',
        'Diversity Metrics'
      ]
    },
    {
      id: 'invites-registrations',
      title: 'Invites & Registrations',
      icon: '✉️',
      description: 'Employee invitation and registration tracking',
      reports: [
        'Pending Invitations',
        'Registration Status',
        'Onboarding Progress',
        'Account Activation',
        'Welcome Email Status',
        'Setup Completion',
        'First Login Tracking'
      ]
    },
    {
      id: 'new-joins-exits',
      title: 'New Joins & Exits',
      icon: '🚪',
      description: 'Employee joining and leaving analysis',
      reports: [
        'New Joiners This Month',
        'Exit Analysis',
        'Turnover Rate',
        'Retention Statistics',
        'Probation Status',
        'Notice Period Tracking',
        'Exit Interviews'
      ]
    },
    {
      id: 'logins',
      title: 'Logins',
      icon: '🔐',
      description: 'Employee login activity and security',
      reports: [
        'Login Frequency',
        'Last Login Dates',
        'Failed Login Attempts',
        'Password Reset Requests',
        'Session Duration',
        'Device Usage',
        'Security Alerts'
      ]
    },
    {
      id: 'employee-aggregates',
      title: 'Employee Aggregates',
      icon: '📈',
      description: 'Aggregated employee data and metrics',
      reports: [
        'Headcount Summary',
        'Department Totals',
        'Cost Center Analysis',
        'Salary Aggregates',
        'Benefits Enrollment',
        'Leave Balances',
        'Performance Metrics'
      ]
    },
    {
      id: 'scheduled-reports',
      title: 'Scheduled Reports',
      icon: '⏰',
      description: 'Automated and scheduled report generation',
      reports: [
        'Daily Reports',
        'Weekly Summaries',
        'Monthly Analytics',
        'Quarterly Reviews',
        'Annual Reports',
        'Custom Schedules',
        'Report Subscriptions'
      ]
    }
  ];

  const renderCategoryContent = (category) => {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
            {category.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {category.description}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {category.reports.map((report, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="500" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {report}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
          Employee Reports Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Comprehensive employee reporting and analytics center
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Categories Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Report Categories
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {reportCategories.map((category) => (
                <ListItem
                  key={category.id}
                  button
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: selectedCategory === category.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ fontSize: '1rem' }}>{category.icon}</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={category.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: selectedCategory === category.id ? 600 : 400,
                      color: selectedCategory === category.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              p: 3,
              minHeight: '600px'
            }}
          >
            {renderCategoryContent(reportCategories.find(cat => cat.id === selectedCategory))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const OrganizationDashboardModule = ({ refreshTrigger }) => {
  const [selectedTab, setSelectedTab] = useState('summary');
  const [analytics, setAnalytics] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [formData, setFormData] = useState({
    employeeName: '',
    email: '',
    department: '',
    pollTitle: '',
    pollDescription: '',
    announcementTitle: '',
    announcementContent: '',
  });

  useEffect(() => {
    fetchAnalytics();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Refresh data when refreshTrigger changes (after CSV import)
    if (refreshTrigger) {
      fetchAnalytics();
      fetchDashboardData();
    }
  }, [refreshTrigger]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/organization/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch organization analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch employees data for dashboard
      const employeesResponse = await axios.get('/organization/employees?limit=100');
      const employees = employeesResponse.data.employees || [];
      
      // Process data for dashboard sections
      const processedData = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.employmentInfo?.isActive).length,
        newJoiners: employees.filter(emp => {
          const joinDate = new Date(emp.employmentInfo?.dateOfJoining);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate >= thirtyDaysAgo;
        }),
        onProbation: employees.filter(emp => 
          emp.employmentInfo?.employmentStatus?.toLowerCase() === 'probation'
        ),
        recentExits: employees.filter(emp => {
          const exitDate = new Date(emp.employmentInfo?.exitDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return exitDate >= thirtyDaysAgo && !emp.employmentInfo?.isActive;
        }),
        upcomingBirthdays: employees.filter(emp => {
          if (!emp.personalInfo?.dateOfBirth) return false;
          const today = new Date();
          const birthDate = new Date(emp.personalInfo.dateOfBirth);
          const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          const daysDiff = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= 30;
        }),
        workAnniversaries: employees.filter(emp => {
          if (!emp.employmentInfo?.dateOfJoining) return false;
          const today = new Date();
          const joinDate = new Date(emp.employmentInfo.dateOfJoining);
          const thisYearAnniversary = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
          const daysDiff = Math.ceil((thisYearAnniversary - today) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= 30;
        })
      };
      
      setDashboardData(processedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Click handlers for buttons
  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'new-employee':
        setDialogType('new-employee');
        setDialogTitle('Add New Employee');
        setOpenDialog(true);
        break;
      case 'new-poll':
        setDialogType('new-poll');
        setDialogTitle('Create New Poll');
        setOpenDialog(true);
        break;
      case 'new-announcement':
        setDialogType('new-announcement');
        setDialogTitle('Create New Announcement');
        setOpenDialog(true);
        break;
      case 'org-directory':
        showSnackbar('Opening Organization Directory...', 'info');
        // Navigate to organization directory or open modal
        break;
      case 'org-tree':
        showSnackbar('Opening Organization Tree...', 'info');
        // Navigate to organization tree view
        break;
      default:
        showSnackbar(`${actionType} feature coming soon!`, 'info');
    }
  };

  const handleBulkOperation = (operationType) => {
    switch (operationType) {
      case 'add-bulk':
        showSnackbar('Opening Bulk Employee Import...', 'info');
        // Navigate to bulk import page
        break;
      case 'update-bulk':
        showSnackbar('Opening Bulk Update Tool...', 'info');
        break;
      case 'bulk-invite':
        showSnackbar('Opening Bulk Invite Tool...', 'info');
        break;
      case 'import-job-details':
        showSnackbar('Opening Job Details Import...', 'info');
        break;
      case 'import-custom-fields':
        showSnackbar('Opening Custom Fields Import...', 'info');
        break;
      case 'import-documents':
        showSnackbar('Opening Document Import...', 'info');
        break;
      default:
        showSnackbar(`${operationType} feature coming soon!`, 'info');
    }
  };

  const handleReport = (reportType) => {
    switch (reportType) {
      case 'all-employees':
        showSnackbar('Generating All Employees Report...', 'info');
        break;
      case 'registered-employees':
        showSnackbar('Generating Registered Employees Report...', 'info');
        break;
      case 'incomplete-profiles':
        showSnackbar('Generating Incomplete Profiles Report...', 'info');
        break;
      case 'probation-employees':
        showSnackbar('Generating Probation Employees Report...', 'info');
        break;
      case 'notice-period':
        showSnackbar('Generating Notice Period Report...', 'info');
        break;
      case 'employee-master':
        showSnackbar('Generating Employee Master Report...', 'info');
        break;
      case 'documents-report':
        showSnackbar('Generating Documents Report...', 'info');
        break;
      case 'salary-revisions':
        showSnackbar('Generating Salary Revisions Report...', 'info');
        break;
      case 'attrition-report':
        showSnackbar('Generating Attrition Report...', 'info');
        break;
      default:
        showSnackbar(`${reportType} report coming soon!`, 'info');
    }
  };

  const handleViewAll = (section) => {
    switch (section) {
      case 'exits':
        showSnackbar('Opening All Exits...', 'info');
        break;
      case 'onboarding':
        showSnackbar('Opening All Onboarding...', 'info');
        break;
      case 'probation':
        showSnackbar('Opening All Probation...', 'info');
        break;
      default:
        showSnackbar(`View all ${section} coming soon!`, 'info');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setFormData({
      employeeName: '',
      email: '',
      department: '',
      pollTitle: '',
      pollDescription: '',
      announcementTitle: '',
      announcementContent: '',
    });
  };

  const handleSubmitForm = () => {
    switch (dialogType) {
      case 'new-employee':
        if (formData.employeeName && formData.email) {
          showSnackbar(`Employee ${formData.employeeName} added successfully!`, 'success');
          handleCloseDialog();
        } else {
          showSnackbar('Please fill in all required fields', 'error');
        }
        break;
      case 'new-poll':
        if (formData.pollTitle) {
          showSnackbar(`Poll "${formData.pollTitle}" created successfully!`, 'success');
          handleCloseDialog();
        } else {
          showSnackbar('Please enter a poll title', 'error');
        }
        break;
      case 'new-announcement':
        if (formData.announcementTitle) {
          showSnackbar(`Announcement "${formData.announcementTitle}" created successfully!`, 'success');
          handleCloseDialog();
        } else {
          showSnackbar('Please enter an announcement title', 'error');
        }
        break;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const modules = [
    { id: 'summary', label: 'Summary', icon: <DashboardIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 'reports', label: 'Employee Report', icon: <ReportIcon /> },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading organization dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Tab Navigation */}
      <Box sx={{ mb: 4 }}>
        <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
          {modules.map((module) => (
            <Button
              key={module.id}
              onClick={() => setSelectedTab(module.id)}
              variant={selectedTab === module.id ? 'contained' : 'outlined'}
              startIcon={module.icon}
              sx={{ minWidth: 140 }}
            >
              {module.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Module Content */}
      <Box>
        {selectedTab === 'summary' && <SummaryModule analytics={analytics} />}
        {selectedTab === 'analytics' && <AnalyticsModule analytics={analytics} />}
        {selectedTab === 'reports' && <EmployeeReportModule />}
      </Box>

      {/* Modal Dialogs */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {dialogType === 'new-employee' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Employee Name"
                value={formData.employeeName}
                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                fullWidth
              />
            </Box>
          )}
          
          {dialogType === 'new-poll' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Poll Title"
                value={formData.pollTitle}
                onChange={(e) => handleInputChange('pollTitle', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Poll Description"
                value={formData.pollDescription}
                onChange={(e) => handleInputChange('pollDescription', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          )}
          
          {dialogType === 'new-announcement' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Announcement Title"
                value={formData.announcementTitle}
                onChange={(e) => handleInputChange('announcementTitle', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Announcement Content"
                value={formData.announcementContent}
                onChange={(e) => handleInputChange('announcementContent', e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitForm} variant="contained">
            {dialogType === 'new-employee' ? 'Add Employee' : 
             dialogType === 'new-poll' ? 'Create Poll' : 
             dialogType === 'new-announcement' ? 'Create Announcement' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizationDashboardModule;
