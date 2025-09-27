import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  LinearProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
  PhoneAndroid as PhoneIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const HardwareSoftwareTracking = ({ onboarding, onUpdate, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [itSetupData, setItSetupData] = useState({
    hardware: {
      laptop: { assigned: false, model: '', serialNumber: '', assignedDate: '' },
      monitor: { assigned: false, model: '', serialNumber: '', assignedDate: '' },
      keyboard: { assigned: false, model: '', serialNumber: '', assignedDate: '' },
      mouse: { assigned: false, model: '', serialNumber: '', assignedDate: '' },
      headphones: { assigned: false, model: '', serialNumber: '', assignedDate: '' },
      mobile: { assigned: false, model: '', serialNumber: '', assignedDate: '' }
    },
    software: {
      email: { setup: false, account: '', setupDate: '' },
      slack: { setup: false, account: '', setupDate: '' },
      vpn: { setup: false, account: '', setupDate: '' },
      development: { setup: false, tools: [], setupDate: '' },
      office: { setup: false, license: '', setupDate: '' },
      security: { setup: false, tools: [], setupDate: '' }
    },
    access: {
      building: { granted: false, cardNumber: '', grantedDate: '' },
      parking: { granted: false, spotNumber: '', grantedDate: '' },
      wifi: { granted: false, credentials: '', grantedDate: '' }
    },
    notes: '',
    completedBy: '',
    completedDate: ''
  });

  useEffect(() => {
    console.log('🔍 HardwareSoftwareTracking useEffect - onboarding:', onboarding);
    console.log('🔍 onboarding._id:', onboarding?._id);
    console.log('🔍 onboarding.itSetup:', onboarding?.itSetup);

    if (onboarding?.itSetup) {
      setItSetupData(prev => ({
        ...prev,
        ...onboarding.itSetup
      }));
    }
  }, [onboarding]);

  const handleHardwareChange = (item, field, value) => {
    setItSetupData(prev => ({
      ...prev,
      hardware: {
        ...prev.hardware,
        [item]: {
          ...prev.hardware[item],
          [field]: value,
          ...(field === 'assigned' && value && { assignedDate: new Date().toISOString().split('T')[0] })
        }
      }
    }));
  };

  const handleSoftwareChange = (item, field, value) => {
    setItSetupData(prev => ({
      ...prev,
      software: {
        ...prev.software,
        [item]: {
          ...prev.software[item],
          [field]: value,
          ...(field === 'setup' && value && { setupDate: new Date().toISOString().split('T')[0] })
        }
      }
    }));
  };

  const handleAccessChange = (item, field, value) => {
    setItSetupData(prev => ({
      ...prev,
      access: {
        ...prev.access,
        [item]: {
          ...prev.access[item],
          [field]: value,
          ...(field === 'granted' && value && { grantedDate: new Date().toISOString().split('T')[0] })
        }
      }
    }));
  };

  const calculateProgress = () => {
    const hardwareItems = Object.values(itSetupData.hardware);
    const softwareItems = Object.values(itSetupData.software);
    const accessItems = Object.values(itSetupData.access);
    
    const hardwareCompleted = hardwareItems.filter(item => item.assigned).length;
    const softwareCompleted = softwareItems.filter(item => item.setup).length;
    const accessCompleted = accessItems.filter(item => item.granted).length;
    
    const totalItems = hardwareItems.length + softwareItems.length + accessItems.length;
    const completedItems = hardwareCompleted + softwareCompleted + accessCompleted;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const handleSave = async () => {
    console.log('🔍 Save button clicked - onboarding data:', onboarding);
    console.log('🔍 onboarding._id:', onboarding?._id);
    console.log('🔍 itSetupData:', itSetupData);

    if (!onboarding) {
      console.error('❌ Onboarding object is null or undefined');
      toast.error('Onboarding data not available');
      return;
    }

    if (!onboarding._id) {
      console.error('❌ Onboarding ID is missing:', onboarding);
      toast.error('Onboarding record ID not found');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 Making PUT request to:', `onboarding/${onboarding._id}`);
      console.log('📡 Request data:', { itSetup: itSetupData });

      const response = await axios.put(`onboarding/${onboarding._id}`, {
        itSetup: itSetupData
      });

      console.log('✅ Save successful:', response.data);

      if (onUpdate) {
        onUpdate(response.data.onboarding || response.data);
      }

      toast.success('IT setup data saved successfully');
    } catch (error) {
      console.error('❌ Error saving IT setup data:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save IT setup data';
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    const progress = calculateProgress();
    if (progress < 100) {
      toast.warning('Please complete all IT setup items before marking as complete');
      return;
    }

    await handleSave();
    if (onComplete) {
      onComplete();
    }
  };

  if (!onboarding) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Onboarding data not available. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  const progress = calculateProgress();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          💻 IT Setup - Step 4 of 8
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set up IT equipment, accounts, and system access for {onboarding.employeeName}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Progress: {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ flexGrow: 1, ml: 2 }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Hardware Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ComputerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Hardware Equipment
              </Typography>
              <List dense>
                {Object.entries(itSetupData.hardware).map(([key, item]) => (
                  <ListItem key={key} divider>
                    <ListItemIcon>
                      {item.assigned ? 
                        <CheckCircleIcon color="success" /> : 
                        <RadioButtonUncheckedIcon color="disabled" />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={key.charAt(0).toUpperCase() + key.slice(1)}
                      secondary={item.model || 'Not assigned'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={item.assigned}
                        onChange={(e) => handleHardwareChange(key, 'assigned', e.target.checked)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Software Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Software & Accounts
              </Typography>
              <List dense>
                {Object.entries(itSetupData.software).map(([key, item]) => (
                  <ListItem key={key} divider>
                    <ListItemIcon>
                      {item.setup ? 
                        <CheckCircleIcon color="success" /> : 
                        <RadioButtonUncheckedIcon color="disabled" />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={key.charAt(0).toUpperCase() + key.slice(1)}
                      secondary={item.account || 'Not setup'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={item.setup}
                        onChange={(e) => handleSoftwareChange(key, 'setup', e.target.checked)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Access Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Access & Security
              </Typography>
              <List dense>
                {Object.entries(itSetupData.access).map(([key, item]) => (
                  <ListItem key={key} divider>
                    <ListItemIcon>
                      {item.granted ? 
                        <CheckCircleIcon color="success" /> : 
                        <RadioButtonUncheckedIcon color="disabled" />
                      }
                    </ListItemIcon>
                    <ListItemText 
                      primary={key.charAt(0).toUpperCase() + key.slice(1)}
                      secondary={item.cardNumber || item.spotNumber || item.credentials || 'Not granted'}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={item.granted}
                        onChange={(e) => handleAccessChange(key, 'granted', e.target.checked)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notes & Comments
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add any notes about the IT setup process..."
                value={itSetupData.notes}
                onChange={(e) => setItSetupData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleSave}
          disabled={loading}
        >
          Save Progress
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={loading || progress < 100}
          startIcon={loading ? <LinearProgress size={20} /> : <CheckCircleIcon />}
        >
          {progress < 100 ? `Complete Setup (${progress}%)` : 'Mark as Complete'}
        </Button>
      </Box>
    </Box>
  );
};

export default HardwareSoftwareTracking;
