import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Paper,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Tune as TuneIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import ShiftSettings from './ShiftSettings';
import SettingsModule from '../Organization/modules/SettingsModule';

const Settings = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const settingsTabs = [
    {
      id: 'shifts',
      label: 'Shift Management',
      icon: <ScheduleIcon />,
      component: <ShiftSettings />,
      description: 'Manage employee work schedules and shift timings'
    },
    {
      id: 'general',
      label: 'General Settings',
      icon: <TuneIcon />,
      component: <SettingsModule />,
      description: 'Organization-wide settings and preferences'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<ChevronRightIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="#" 
          onClick={() => navigate('/dashboard')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Settings
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure system settings and preferences
            </Typography>
          </Box>
        </Box>
      </Box>


      {/* Main Content */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        {/* Tabs */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'rgba(102, 126, 234, 0.02)'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 64,
                fontSize: '1rem'
              },
              '& .Mui-selected': {
                color: '#667eea'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
                height: 3
              }
            }}
          >
            {settingsTabs.map((tab, index) => (
              <Tab 
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ px: 3 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ minHeight: '70vh' }}>
          {settingsTabs[tabValue]?.component}
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
