import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  LinearProgress
} from '@mui/material';
import {
  Group as GroupIcon,
  Badge as BadgeIcon,
  Description as PolicyIcon,
  School as HandbookIcon,
  HealthAndSafety as BenefitsIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const HRSetupTracking = ({ onboarding, onUpdate, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [hrSetupData, setHrSetupData] = useState({
    processes: {
      employeeId: { completed: false, notes: '', completedDate: '' },
      policies: { completed: false, notes: '', completedDate: '' },
      handbook: { completed: false, notes: '', completedDate: '' },
      benefits: { completed: false, notes: '', completedDate: '' },
      payroll: { completed: false, notes: '', completedDate: '' }
    },
    documents: {
      contract: { provided: false, notes: '', providedDate: '' },
      nda: { provided: false, notes: '', providedDate: '' },
      handbook: { provided: false, notes: '', providedDate: '' },
      policies: { provided: false, notes: '', providedDate: '' }
    },
    notes: '',
    completedBy: '',
    completedDate: ''
  });

  useEffect(() => {
    console.log('🔍 HRSetupTracking useEffect - onboarding:', onboarding);
    console.log('🔍 onboarding._id:', onboarding?._id);
    console.log('🔍 onboarding.hrSetup:', onboarding?.hrSetup);

    if (onboarding?.hrSetup) {
      setHrSetupData(prev => ({
        ...prev,
        ...onboarding.hrSetup
      }));
    }
  }, [onboarding]);

  const handleProcessChange = (item, field, value) => {
    setHrSetupData(prev => ({
      ...prev,
      processes: {
        ...prev.processes,
        [item]: {
          ...prev.processes[item],
          [field]: value,
          ...(field === 'completed' && value && { completedDate: new Date().toISOString().split('T')[0] })
        }
      }
    }));
  };

  const handleDocumentChange = (item, field, value) => {
    setHrSetupData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [item]: {
          ...prev.documents[item],
          [field]: value,
          ...(field === 'provided' && value && { providedDate: new Date().toISOString().split('T')[0] })
        }
      }
    }));
  };

  const calculateProgress = () => {
    const processItems = Object.values(hrSetupData.processes);
    const documentItems = Object.values(hrSetupData.documents);
    
    const processCompleted = processItems.filter(item => item.completed).length;
    const documentsProvided = documentItems.filter(item => item.provided).length;
    
    const totalItems = processItems.length + documentItems.length;
    const completedItems = processCompleted + documentsProvided;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const handleSave = async () => {
    console.log('🔍 Save button clicked - onboarding data:', onboarding);
    console.log('🔍 onboarding._id:', onboarding?._id);
    console.log('🔍 hrSetupData:', hrSetupData);

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
      console.log('📡 Request data:', { hrSetup: hrSetupData });

      const response = await axios.put(`onboarding/${onboarding._id}`, {
        hrSetup: hrSetupData
      });

      console.log('✅ Save successful:', response.data);

      if (onUpdate) {
        onUpdate(response.data.onboarding || response.data);
      }

      toast.success('HR setup data saved successfully');
    } catch (error) {
      console.error('❌ Error saving HR setup data:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save HR setup data';
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    const progress = calculateProgress();
    if (progress < 100) {
      toast.warning('Please complete all HR setup items before marking as complete');
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
          👥 HR Setup - Step 5 of 8
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Complete HR processes, employee records, and onboarding paperwork for {onboarding.employeeName}
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
        {/* HR Processes Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                HR Processes
              </Typography>
              <List dense>
                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.processes.employeeId.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Employee ID Assignment"
                    secondary="Assign unique employee identifier"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.processes.employeeId.completed}
                      onChange={(e) => handleProcessChange('employeeId', 'completed', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.processes.policies.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Company Policies"
                    secondary="Share and explain company policies"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.processes.policies.completed}
                      onChange={(e) => handleProcessChange('policies', 'completed', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.processes.handbook.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Employee Handbook"
                    secondary="Provide employee handbook"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.processes.handbook.completed}
                      onChange={(e) => handleProcessChange('handbook', 'completed', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.processes.benefits.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Benefits Explanation"
                    secondary="Explain health, insurance and benefits"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.processes.benefits.completed}
                      onChange={(e) => handleProcessChange('benefits', 'completed', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {hrSetupData.processes.payroll.completed ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Payroll Setup"
                    secondary="Configure payroll and salary details"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.processes.payroll.completed}
                      onChange={(e) => handleProcessChange('payroll', 'completed', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PolicyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Documentation
              </Typography>
              <List dense>
                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.documents.contract.provided ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Employment Contract"
                    secondary="Provide signed employment contract"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.documents.contract.provided}
                      onChange={(e) => handleDocumentChange('contract', 'provided', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.documents.nda.provided ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="NDA Agreement"
                    secondary="Provide non-disclosure agreement"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.documents.nda.provided}
                      onChange={(e) => handleDocumentChange('nda', 'provided', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem divider>
                  <ListItemIcon>
                    {hrSetupData.documents.handbook.provided ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Employee Handbook"
                    secondary="Provide digital handbook copy"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.documents.handbook.provided}
                      onChange={(e) => handleDocumentChange('handbook', 'provided', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {hrSetupData.documents.policies.provided ? 
                      <CheckCircleIcon color="success" /> : 
                      <RadioButtonUncheckedIcon color="disabled" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Policy Documents"
                    secondary="Provide company policy documents"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={hrSetupData.documents.policies.provided}
                      onChange={(e) => handleDocumentChange('policies', 'provided', e.target.checked)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
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
                placeholder="Add any notes about the HR setup process..."
                value={hrSetupData.notes}
                onChange={(e) => setHrSetupData(prev => ({ ...prev, notes: e.target.value }))}
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

export default HRSetupTracking;
