import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Tune as TuneIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  CloudSync as CloudSyncIcon,
  Shield as ShieldIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const SettingsModule = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      digest: true
    },
    security: {
      twoFactor: true,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    general: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      currency: 'INR'
    },
    system: {
      autoBackup: true,
      dataRetention: 365,
      auditLog: true
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const settingSections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <TuneIcon />,
      color: '#1976d2'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <NotificationsIcon />,
      color: '#f57c00'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: <SecurityIcon />,
      color: '#d32f2f'
    },
    {
      id: 'system',
      title: 'System Settings',
      icon: <StorageIcon />,
      color: '#388e3c'
    }
  ];

  const renderGeneralSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        General Settings
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Language"
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Timezone"
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          >
            <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
            <MenuItem value="America/New_York">America/New_York</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Theme"
            value={settings.general.theme}
            onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="auto">Auto</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Currency"
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
          >
            <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
            <MenuItem value="USD">US Dollar ($)</MenuItem>
            <MenuItem value="EUR">Euro (€)</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderNotificationSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Notification Preferences
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <List>
        <ListItem>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Email Notifications"
            secondary="Receive notifications via email"
          />
          <Switch
            checked={settings.notifications.email}
            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SmsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="SMS Notifications"
            secondary="Receive notifications via SMS"
          />
          <Switch
            checked={settings.notifications.sms}
            onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Push Notifications"
            secondary="Receive push notifications in browser"
          />
          <Switch
            checked={settings.notifications.push}
            onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Daily Digest"
            secondary="Receive daily summary email"
          />
          <Switch
            checked={settings.notifications.digest}
            onChange={(e) => handleSettingChange('notifications', 'digest', e.target.checked)}
          />
        </ListItem>
      </List>
    </Paper>
  );

  const renderSecuritySettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Security & Privacy
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.security.twoFactor}
                onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
              />
            }
            label="Enable Two-Factor Authentication"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Session Timeout (minutes)"
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Password Expiry (days)"
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderSystemSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        System Configuration
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <List>
        <ListItem>
          <ListItemIcon>
            <CloudSyncIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Automatic Backup"
            secondary="Enable automatic daily backups"
          />
          <Switch
            checked={settings.system.autoBackup}
            onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <ShieldIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Audit Logging"
            secondary="Log all system activities"
          />
          <Switch
            checked={settings.system.auditLog}
            onChange={(e) => handleSettingChange('system', 'auditLog', e.target.checked)}
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Data Retention Period (days)"
          type="number"
          value={settings.system.dataRetention}
          onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
          helperText="How long to keep deleted records"
        />
      </Box>
    </Paper>
  );

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Organization Settings
          </Typography>
          <Button variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </Box>

        {/* Settings Categories */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {settingSections.map((section) => (
            <Grid item xs={12} md={3} key={section.id}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${section.color}15, ${section.color}25)`,
                border: `1px solid ${section.color}30`
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: section.color, mb: 1 }}>
                    {React.cloneElement(section.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: section.color }}>
                    {section.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Settings Content */}
        <Stack spacing={3}>
          {renderGeneralSettings()}
          {renderNotificationSettings()}
          {renderSecuritySettings()}
          {renderSystemSettings()}
        </Stack>
      </Box>
    </Fade>
  );
};

export default SettingsModule;
