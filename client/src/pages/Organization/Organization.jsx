import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Stack,
  Container,
  useTheme,
  alpha,
  Fade,
  Slide,
  Divider,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group,
  AccountTree as AccountTreeIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  LocalAirport,
  Folder,
  Psychology,
  Devices,
  Tune,
  Menu as MenuIcon,
  ChevronRight,
  Home as HomeIcon,
  TrendingUp,
  TrendingDown,
  People as PeopleIcon,
  Business,
  Assignment,
  AttachMoney,
  Computer,
  Settings,
  Refresh as RefreshIcon,
  Analytics,
  Speed,
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
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';
import EmployeesModule from './modules/EmployeesModule';
import StructureModule from './modules/StructureModule';
import OnboardingsModule from './modules/OnboardingsModule';
import ExitsModule from './modules/ExitsModule';
import ExpenseModule from './modules/ExpenseModule';
import DocumentsModule from './modules/DocumentsModule';
import EngageModule from './modules/EngageModule';
import AssetsModule from './modules/AssetsModule';
import SettingsModule from './modules/SettingsModule';

// Colors for charts
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

// Organization modules configuration
const organizationModules = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Speed />,
    color: '#1976d2',
    description: 'Organization overview and analytics',
    badge: null
  },
  {
    id: 'employees',
    title: 'Employees',
    icon: <Group />,
    color: '#2e7d32',
    description: 'Employee management and data',
    badge: null
  },
  {
    id: 'structure',
    title: 'Organization Structure',
    icon: <AccountTreeIcon />,
    color: '#ed6c02',
    description: 'Departments and hierarchy',
    badge: null
  },
  {
    id: 'onboardings',
    title: 'Onboardings',
    icon: <PersonAddIcon />,
    color: '#9c27b0',
    description: 'New employee onboarding',
    badge: '3'
  },
  {
    id: 'exits',
    title: 'Exits',
    icon: <ExitToAppIcon />,
    color: '#d32f2f',
    description: 'Employee exit management',
    badge: '1'
  },
  {
    id: 'expense',
    title: 'Expense & Travel',
    icon: <LocalAirport />,
    color: '#0288d1',
    description: 'Expense and travel management',
    badge: null
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: <Folder />,
    color: '#5e35b1',
    description: 'Document management system',
    badge: null
  },
  {
    id: 'engage',
    title: 'Engage',
    icon: <Psychology />,
    color: '#00695c',
    description: 'Employee engagement tools',
    badge: null
  },
  {
    id: 'assets',
    title: 'Assets',
    icon: <Devices />,
    color: '#bf360c',
    description: 'Asset management and tracking',
    badge: null
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Tune />,
    color: '#424242',
    description: 'Organization settings',
    badge: null
  }
];

const drawerWidth = 280;

const Organization = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isAdmin = user?.role === 'admin';

  // State management
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    fetchAnalytics();
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/organization/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch organization analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const getCurrentModule = () => {
    return organizationModules.find(module => module.id === selectedModule);
  };

  // Render sidebar
  const renderSidebar = () => (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
          Organization Hub
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Complete organizational management
        </Typography>
      </Box>

      <List sx={{ px: 2, py: 2 }}>
        {organizationModules.map((module, index) => (
          <Fade in={true} timeout={300 + index * 100} key={module.id}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleModuleChange(module.id)}
                selected={selectedModule === module.id}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: selectedModule === module.id ? 'white' : 'rgba(255,255,255,0.8)',
                  minWidth: 40 
                }}>
                  {module.badge ? (
                    <Badge badgeContent={module.badge} color="error">
                      {module.icon}
                    </Badge>
                  ) : (
                    module.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={module.title}
                  secondary={module.description}
                  primaryTypographyProps={{
                    fontWeight: selectedModule === module.id ? 600 : 400,
                    fontSize: '0.95rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)'
                  }}
                />
                {selectedModule === module.id && (
                  <ChevronRight sx={{ color: 'white', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
          </Fade>
        ))}
      </List>
    </Drawer>
  );

  // Render dashboard module
  const renderDashboardModule = () => (
    <Fade in={true} timeout={500}>
      <Box>
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: '100%',
              '&:hover': {
                boxShadow: 2
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TrendingUp sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {analytics?.totalEmployees || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Total Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: '100%',
              '&:hover': {
                boxShadow: 2
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <PersonAddIcon sx={{ fontSize: 40, mb: 2, color: 'success.main' }} />
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {analytics?.newEmployeesThisMonth || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  New This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: '100%',
              '&:hover': {
                boxShadow: 2
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Group sx={{ fontSize: 40, mb: 2, color: 'info.main' }} />
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {analytics?.activeEmployees || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Active Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              height: '100%',
              '&:hover': {
                boxShadow: 2
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <ExitToAppIcon sx={{ fontSize: 40, mb: 2, color: 'warning.main' }} />
                <Typography variant="h3" fontWeight="bold" color="text.primary">
                  {analytics?.exitedEmployeesThisMonth || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Exits This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Department Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analytics?.departmentDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Employment Status
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics?.employmentStatusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {(analytics?.employmentStatusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  // Render placeholder for other modules
  const renderModulePlaceholder = (module) => (
    <Fade in={true} timeout={500}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Box sx={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: `linear-gradient(135deg, ${module.color}20, ${module.color}40)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          border: `3px solid ${module.color}30`
        }}>
          <Box sx={{ fontSize: 48, color: module.color }}>
            {module.icon}
          </Box>
        </Box>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: module.color }}>
          {module.title}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          {module.description}
        </Typography>
        
        <Paper sx={{ 
          p: 4, 
          maxWidth: 600, 
          mx: 'auto', 
          background: `linear-gradient(135deg, ${module.color}05, ${module.color}10)`,
          border: `1px solid ${module.color}20`
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            This module is under development and will be available soon. 
            It will provide comprehensive tools for {module.description.toLowerCase()}.
          </Typography>
        </Paper>
      </Box>
    </Fade>
  );

  // Render main content
  const renderMainContent = () => {
    const currentModule = getCurrentModule();
    
    switch (selectedModule) {
      case 'dashboard':
        return renderDashboardModule();
      case 'employees':
        return <EmployeesModule />;
      case 'structure':
        return <StructureModule />;
      case 'onboardings':
        return <OnboardingsModule />;
      case 'exits':
        return <ExitsModule />;
      case 'expense':
        return <ExpenseModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'engage':
        return <EngageModule />;
      case 'assets':
        return <AssetsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return renderModulePlaceholder(currentModule);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {renderSidebar()}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
        }}
      >
        {/* Header */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid #e0e7ff',
            zIndex: theme.zIndex.drawer - 1
          }}
        >
          <Toolbar sx={{ px: 3 }}>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2, color: '#64748b' }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Breadcrumbs separator={<ChevronRight fontSize="small" />}>
                <Link underline="hover" color="inherit" href="#" onClick={() => handleModuleChange('dashboard')}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Organization
                  </Box>
                </Link>
                <Typography color="primary" fontWeight="medium">
                  {getCurrentModule()?.title}
                </Typography>
              </Breadcrumbs>
            </Box>
            
            <IconButton onClick={fetchAnalytics} sx={{ color: '#64748b' }}>
              <RefreshIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            renderMainContent()
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Organization;
