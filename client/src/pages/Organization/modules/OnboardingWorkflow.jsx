import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Handshake as HandshakeIcon,
  Work as WorkIcon,
  EmojiEvents as CompletionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const OnboardingWorkflow = ({ onboardingId, onClose }) => {
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });
  const [newNote, setNewNote] = useState('');

  const workflowSteps = [
    {
      id: 'offer_letter',
      label: 'Offer Letter',
      icon: <AssignmentIcon />,
      description: 'Send and manage offer letter acceptance'
    },
    {
      id: 'document_collection',
      label: 'Document Collection',
      icon: <UploadIcon />,
      description: 'Collect required documents from candidate'
    },
    {
      id: 'background_verification',
      label: 'Background Verification',
      icon: <SecurityIcon />,
      description: 'Verify candidate background and documents'
    },
    {
      id: 'it_setup',
      label: 'IT Setup',
      icon: <ComputerIcon />,
      description: 'Setup IT equipment and system access'
    },
    {
      id: 'hr_setup',
      label: 'HR Setup',
      icon: <GroupIcon />,
      description: 'Complete HR formalities and policies'
    },
    {
      id: 'orientation',
      label: 'Orientation',
      icon: <SchoolIcon />,
      description: 'Company orientation and introduction'
    },
    {
      id: 'manager_introduction',
      label: 'Manager Introduction',
      icon: <HandshakeIcon />,
      description: 'Introduction to reporting manager and team'
    },
    {
      id: 'workspace_setup',
      label: 'Workspace Setup',
      icon: <WorkIcon />,
      description: 'Setup physical workspace and seating'
    },
    {
      id: 'training_schedule',
      label: 'Training Schedule',
      icon: <SchoolIcon />,
      description: 'Plan and schedule initial training'
    },
    {
      id: 'completion',
      label: 'Completion',
      icon: <CompletionIcon />,
      description: 'Complete onboarding and create employee record'
    }
  ];

  useEffect(() => {
    if (onboardingId) {
      fetchOnboarding();
    }
  }, [onboardingId]);

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/onboarding/${onboardingId}`);
      setOnboarding(response.data);
      
      // Set active step based on current progress
      const currentStepIndex = workflowSteps.findIndex(
        step => step.id === response.data.currentStep
      );
      setActiveStep(currentStepIndex >= 0 ? currentStepIndex : 0);
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      toast.error('Failed to load onboarding details');
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId) => {
    try {
      await axios.put(`/onboarding/${onboardingId}/steps/${stepId}/complete`);
      toast.success('Step completed successfully');
      fetchOnboarding(); // Refresh data
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to complete step');
    }
  };

  const addTask = async () => {
    try {
      await axios.post(`/onboarding/${onboardingId}/tasks`, newTask);
      toast.success('Task added successfully');
      setTaskDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        department: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium'
      });
      fetchOnboarding();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const addNote = async () => {
    try {
      await axios.post(`/onboarding/${onboardingId}/notes`, {
        content: newNote,
        type: 'note'
      });
      toast.success('Note added successfully');
      setNoteDialogOpen(false);
      setNewNote('');
      fetchOnboarding();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const getStepStatus = (stepId) => {
    if (!onboarding?.stepProgress) return 'pending';
    return onboarding.stepProgress[stepId]?.completed ? 'completed' : 'pending';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading onboarding workflow...</Typography>
      </Box>
    );
  }

  if (!onboarding) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Onboarding not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxHeight: '90vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Onboarding Workflow
        </Typography>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6">{onboarding.employeeName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {onboarding.position} • {onboarding.department}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={onboarding.status}
                    color={onboarding.status === 'completed' ? 'success' : 'primary'}
                    size="small"
                  />
                  <Chip
                    label={`${onboarding.progress || 0}% Complete`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {onboarding.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {onboarding.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <BusinessIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Start Date: {moment(onboarding.startDate).format('MMM DD, YYYY')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* Workflow Steps */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Workflow Progress</Typography>
              <LinearProgress
                variant="determinate"
                value={onboarding.progress || 0}
                sx={{ width: 200 }}
              />
            </Box>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {workflowSteps.map((step, index) => {
                const isCompleted = getStepStatus(step.id) === 'completed';
                const isActive = activeStep === index;

                return (
                  <Step key={step.id} completed={isCompleted}>
                    <StepLabel
                      optional={
                        isCompleted && (
                          <Typography variant="caption" color="success.main">
                            Completed {onboarding.stepProgress[step.id]?.completedAt ? 
                              moment(onboarding.stepProgress[step.id].completedAt).format('MMM DD') : ''}
                          </Typography>
                        )
                      }
                      icon={
                        isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          step.icon
                        )
                      }
                    >
                      <Typography variant="subtitle1" fontWeight={isActive ? 600 : 400}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                      {!isCompleted && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => completeStep(step.id)}
                          sx={{ mr: 1 }}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>
        </Grid>

        {/* Tasks & Notes */}
        <Grid item xs={12} md={4}>
          {/* Tasks */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Tasks</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Add Task
              </Button>
            </Box>
            
            <List dense>
              {onboarding.tasks?.length > 0 ? (
                onboarding.tasks.map((task) => (
                  <ListItem key={task.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {task.status === 'completed' ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <AssignmentIcon color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip
                              label={task.status}
                              size="small"
                              color={task.status === 'completed' ? 'success' : 'default'}
                            />
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No tasks assigned
                </Typography>
              )}
            </List>
          </Paper>

          {/* Notes */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Notes</Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setNoteDialogOpen(true)}
              >
                Add Note
              </Button>
            </Box>
            
            <Stack spacing={1}>
              {onboarding.notes?.length > 0 ? (
                onboarding.notes.slice(-5).map((note, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2">{note.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(note.createdAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No notes added
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newTask.department}
                  label="Department"
                  onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={addTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={addNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingWorkflow;
