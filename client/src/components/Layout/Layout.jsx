import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  LocalAirport as LocalAirportIcon,
  Folder as FolderIcon,
  Favorite as FavoriteIcon,
  Computer as ComputerIcon,
  Settings as SettingsIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: ['admin', 'hr', 'manager', 'employee']
  },
  {
    text: 'Reportee',
    icon: <SupervisorAccountIcon />,
    path: '/reportee',
    roles: ['admin', 'hr', 'manager', 'employee'],
    specialAccess: ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com']
  },
  {
    text: 'Organization',
    icon: <BusinessIcon />,
    path: '/organization',
    roles: ['admin', 'hr']
  },
  {
    text: 'Attendance',
    icon: <AccessTimeIcon />,
    path: '/attendance',
    roles: ['admin', 'hr', 'manager', 'employee']
  },
  {
    text: 'Leave Management',
    icon: <BeachAccessIcon />,
    path: '/leave',
    roles: ['admin', 'hr', 'manager', 'employee']
  },
  {
    text: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
    roles: ['admin', 'hr', 'manager']
  },
  {
    text: 'Permissions',
    icon: <SecurityIcon />,
    path: '/permissions',
    roles: ['admin', 'hr']
  },
  {
    text: 'Asset Management',
    icon: <ComputerIcon />,
    path: '/assets',
    roles: ['admin', 'hr', 'manager']
  },
  {
    text: 'Exit Management',
    icon: <ExitToAppIcon />,
    path: '/exit-management',
    roles: ['admin', 'hr', 'manager']
  },
  {
    text: 'Salary Management',
    icon: <AttachMoneyIcon />,
    path: '/salary-management',
    roles: ['admin', 'hr', 'finance']
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    roles: ['admin', 'hr']
  },
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, employee, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    // Check if user has the required role
    const hasRole = item.roles.includes(user?.role);
    
    // Check if user has special access (like Prajwal)
    const hasSpecialAccess = item.specialAccess && item.specialAccess.includes(user?.email?.toLowerCase());
    
    return hasRole || hasSpecialAccess;
  });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Rannkly HR
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Management System
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Avatar 
          src={employee?.profilePicture?.url ? 
               (employee.profilePicture.url.startsWith('http') ? employee.profilePicture.url : `http://localhost:5001${employee.profilePicture.url}`) :
               employee?.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
               employee?.additionalInfo?.profilePhoto?.url || 
               employee?.personalInfo?.profilePicture || 
               null}
          sx={{ 
            width: 56, 
            height: 56, 
            mx: 'auto', 
            mb: 1, 
            bgcolor: 'primary.main',
            fontSize: '1.2rem',
            fontWeight: 600
          }}
        >
          {employee?.personalInfo?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle2" fontWeight="medium">
          {employee?.personalInfo ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}` : 'User'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {employee?.employmentInfo?.designation || user?.role?.toUpperCase()}
        </Typography>
        {employee?.employeeId && (
          <Typography variant="caption" display="block" color="text.secondary">
            ID: {employee.employeeId}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.50',
                color: 'error.dark',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{ p: 1.5 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
