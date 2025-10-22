import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon,
  Payment as PaymentIcon,
  MonetizationOn as MonetizationOnIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  ArrowForward as ArrowForwardIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  LocalAirport as LocalAirportIcon,
  Folder as FolderIcon,
  Psychology as PsychologyIcon,
  Devices as DevicesIcon,
  Tune as TuneIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Finance Management modules configuration
const financeModules = [
  {
    id: 'salary-management',
    title: 'Salary Management',
    icon: <AttachMoneyIcon />,
    color: '#1976d2',
    description: 'Manage employee salaries, payroll, and compensation',
    badge: null,
    path: '/finance-management/salary-management'
  },
  {
    id: 'payroll',
    title: 'Payroll Processing',
    icon: <PaymentIcon />,
    color: '#2e7d32',
    description: 'Process monthly payroll and salary disbursements',
    badge: null,
    path: '/finance-management/payroll'
  },
  {
    id: 'expense-management',
    title: 'Expense Management',
    icon: <ReceiptIcon />,
    color: '#ed6c02',
    description: 'Track and manage employee expenses and reimbursements',
    badge: null,
    path: '/finance-management/expense-management'
  },
  {
    id: 'budget-planning',
    title: 'Budget Planning',
    icon: <AssessmentIcon />,
    color: '#00796b',
    description: 'Plan and manage departmental budgets',
    badge: null,
    path: '/finance-management/budget-planning'
  },
  {
    id: 'financial-reports',
    title: 'Financial Reports',
    icon: <TrendingUpIcon />,
    color: '#9c27b0',
    description: 'Generate financial reports and analytics',
    badge: null,
    path: '/finance-management/financial-reports'
  },
  {
    id: 'tax-management',
    title: 'Tax Management',
    icon: <AccountBalanceIcon />,
    color: '#d32f2f',
    description: 'Handle tax calculations and compliance',
    badge: null,
    path: '/finance-management/tax-management'
  },
  {
    id: 'investment-tracking',
    title: 'Investment Tracking',
    icon: <SavingsIcon />,
    color: '#0288d1',
    description: 'Track employee investments and benefits',
    badge: null,
    path: '/finance-management/investment-tracking'
  },
  {
    id: 'financial-dashboard',
    title: 'Financial Dashboard',
    icon: <SpeedIcon />,
    color: '#5e35b1',
    description: 'Overview of financial metrics and KPIs',
    badge: null,
    path: '/finance-management/financial-dashboard'
  }
];

const FinanceManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(false);

  const handleModuleClick = (module) => {
    if (module.path) {
      navigate(module.path);
    }
  };

  const getModuleStats = () => {
    // This would typically fetch real data from the backend
    return {
      totalSalary: 2500000,
      pendingPayments: 12,
      monthlyExpenses: 450000,
      budgetUtilization: 78
    };
  };

  const stats = getModuleStats();

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.primary.main,
              mb: 1
            }}
          >
            Finance Management
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 3
            }}
          >
            Comprehensive financial management and payroll processing
          </Typography>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                <MonetizationOnIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ₹{stats.totalSalary.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Salary Pool
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                <PaymentIcon sx={{ fontSize: 40, color: '#ed6c02', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                  {stats.pendingPayments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Payments
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                <ReceiptIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  ₹{stats.monthlyExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Expenses
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fce4ec' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                  {stats.budgetUtilization}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Budget Utilization
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Finance Modules Grid */}
        <Grid container spacing={3}>
          {financeModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    '& .module-icon': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: module.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                        '& .module-icon': {
                          transition: 'transform 0.3s ease-in-out'
                        }
                      }}
                    >
                      <Box className="module-icon" sx={{ color: 'white' }}>
                        {module.icon}
                      </Box>
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {module.title}
                      </Typography>
                      {module.badge && (
                        <Chip
                          label={module.badge}
                          size="small"
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.6 }}
                  >
                    {module.description}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      color: module.color,
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: `${module.color}15`
                      }
                    }}
                  >
                    Open Module
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AttachMoneyIcon />}
                sx={{ py: 1.5 }}
                onClick={() => navigate('/finance-management/salary-management')}
              >
                Process Salary
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ReceiptIcon />}
                sx={{ py: 1.5 }}
                onClick={() => navigate('/finance-management/expense-management')}
              >
                Review Expenses
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AssessmentIcon />}
                sx={{ py: 1.5 }}
                onClick={() => navigate('/finance-management/financial-reports')}
              >
                Generate Reports
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUpIcon />}
                sx={{ py: 1.5 }}
                onClick={() => navigate('/finance-management/financial-dashboard')}
              >
                View Dashboard
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FinanceManagement;



