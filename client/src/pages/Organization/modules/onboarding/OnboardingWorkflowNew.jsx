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
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Container,
  Alert,
  AlertTitle,
  CardHeader,
  ButtonGroup,
  Fade,
  Grow,
  Slide,
  Zoom
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Handshake as HandshakeIcon,
  Work as WorkIcon,
  EmojiEvents as CompletionIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Verified as VerifiedIcon,
  Task as TaskIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorIcon,
  Rocket as RocketIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import { keyframes, styled } from '@mui/material/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

// Styled components for cutting-edge design
const GlassmorphicCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.2) inset',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.3) inset',
    border: '1px solid rgba(255,255,255,0.3)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '16px',
  padding: '12px 32px',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  border: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
  }
}));

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const PulsingAvatar = styled(Avatar)(({ theme }) => ({
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
}));

const ModernChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

// Import feature components
import OfferLetterManagement from './OfferLetterManagement';
import OfferLetterEditor from '../../../../components/OfferLetterEditor';
import PreOnboardingWorkflow from './PreOnboardingWorkflow';
import DocumentManagement from './DocumentManagement';
import OrientationScheduling from './OrientationScheduling';
import DigitalWelcome from './DigitalWelcome';
import HardwareSoftwareTracking from './HardwareSoftwareTracking';
import HRSetupTracking from './HRSetupTracking';
import ESignatureSupport from './ESignatureSupport';

const OnboardingWorkflowNew = ({ onboarding: propOnboarding, onBack }) => {
  const [onboarding, setOnboarding] = useState(propOnboarding || null);
  const [loading, setLoading] = useState(!propOnboarding);
  const [activeStep, setActiveStep] = useState(0);
  const [processingStep, setProcessingStep] = useState(null);

  const workflowSteps = [
    {
      id: 'offer_letter',
      step: 1,
      label: 'Offer Letter Management',
      icon: <AssignmentIcon />,
      description: 'Generate and send offer letters with digital signature tracking',
      component: OfferLetterEditor
    },
    {
      id: 'document_collection',
      step: 2,
      label: 'Document Collection',
      icon: <UploadIcon />,
      description: 'Collect personal documents and share welcome kit with company policies',
      component: PreOnboardingWorkflow
    },
    {
      id: 'background_verification',
      step: 3,
      label: 'Background Verification',
      icon: <VerifiedIcon />,
      description: 'Complete background verification and compliance checks',
      component: DocumentManagement
    },
    {
      id: 'it_setup',
      step: 4,
      label: 'IT Setup',
      icon: <ComputerIcon />,
      description: 'Set up IT equipment, accounts, and system access',
      component: HardwareSoftwareTracking
    },
    {
      id: 'hr_setup',
      step: 5,
      label: 'HR Setup',
      icon: <GroupIcon />,
      description: 'Complete HR processes, employee records, and onboarding paperwork',
      component: HRSetupTracking
    },
    {
      id: 'orientation',
      step: 6,
      label: 'Orientation Scheduling',
      icon: <SchoolIcon />,
      description: 'Schedule orientation sessions and training with automated calendar invites',
      component: OrientationScheduling
    },
    {
      id: 'manager_introduction',
      step: 7,
      label: 'Manager Introduction',
      icon: <PersonIcon />,
      description: 'Introduction to manager and team members',
      component: DigitalWelcome
    },
    {
      id: 'workspace_setup',
      step: 8,
      label: 'Workspace Setup',
      icon: <ComputerIcon />,
      description: 'Set up workspace, desk, and work environment',
      component: HardwareSoftwareTracking
    },
    {
      id: 'training_schedule',
      step: 9,
      label: 'Training Schedule',
      icon: <SchoolIcon />,
      description: 'Schedule training sessions and learning programs',
      component: null
    },
    {
      id: 'completion',
      step: 10,
      label: 'Onboarding Completion',
      icon: <CheckCircleIcon />,
      description: 'Final completion and employee record creation',
      component: ESignatureSupport
    }
  ];

  useEffect(() => {
    if (propOnboarding) {
      setOnboarding(propOnboarding);
      setLoading(false);
      const currentStepIndex = findActiveStep(propOnboarding);
      setActiveStep(currentStepIndex);
    }
  }, [propOnboarding]);

  // Update active step when onboarding data changes (after step completion)
  useEffect(() => {
    if (onboarding) {
      const currentStepIndex = findActiveStep(onboarding);
      setActiveStep(currentStepIndex);
    }
  }, [onboarding?.stepProgress]);

  const findActiveStep = (onboardingData) => {
    if (!onboardingData?.stepProgress) return 0;
    
    // Find the first incomplete step
    for (let i = 0; i < workflowSteps.length; i++) {
      const stepId = workflowSteps[i].id;
      const isCompleted = onboardingData.stepProgress[stepId]?.completed;
      if (!isCompleted) {
        return i;
      }
    }
    
    // If all steps are completed, return the last step
    return workflowSteps.length - 1;
  };

  const getStepStatus = (stepId) => {
    if (!onboarding?.stepProgress) return 'pending';
    return onboarding.stepProgress[stepId]?.completed ? 'completed' : 'pending';
  };

  const getOverallProgress = () => {
    if (!onboarding?.stepProgress) return 0;
    const completedSteps = Object.keys(onboarding.stepProgress).filter(
      stepId => onboarding.stepProgress[stepId]?.completed
    ).length;
    return Math.round((completedSteps / workflowSteps.length) * 100);
  };

  const handleStepComplete = async (stepId) => {
    if (!onboarding || !onboarding._id) {
      toast.error('Onboarding data not available');
      return;
    }

    setProcessingStep(stepId);
    try {
      const response = await axios.put(`onboarding/${onboarding._id}/steps/${stepId}/complete`, {
        completed: true,
        completedAt: new Date()
      });
      
      // Update onboarding data with the response
      const updatedOnboarding = response.data.onboarding || response.data;
      setOnboarding(updatedOnboarding);
      toast.success('Step completed successfully!');
      
      // The useEffect will automatically update the active step based on the new data
    } catch (error) {
      console.error('Error completing step:', error);
      
      if (error.response?.status === 404) {
        toast.error('Step not found. Please refresh and try again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error(`Failed to update step status: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setProcessingStep(null);
    }
  };

  // Compact Header Component
  const WorkflowHeader = () => (
    <Paper elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={onBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
              {onboarding?.employeeName}'s Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {onboarding?.position} • {onboarding?.department}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" fontWeight="600" color="primary" sx={{ fontSize: '1.5rem' }}>
            {getOverallProgress()}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Complete
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
              {moment().diff(moment(onboarding?.createdAt), 'days')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Days Active
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
              {Object.values(onboarding?.stepProgress || {}).filter(step => step.completed).length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Completed
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
              {Math.max(0, 8 - Object.values(onboarding?.stepProgress || {}).filter(step => step.completed).length)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Remaining
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '1rem' }}>
              {onboarding?.status === 'completed' ? 'Done' : 'Active'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Status
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={getOverallProgress()}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>
    </Paper>
  );

  // Compact Step Navigation
  const StepNavigation = () => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Workflow Steps
              </Typography>
            }
            subheader={
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                8-step onboarding process
              </Typography>
            }
            action={
              <ButtonGroup size="small" variant="outlined">
                <Tooltip title="Refresh">
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
            }
          />
          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {workflowSteps.map((step, index) => {
                const isCompleted = getStepStatus(step.id) === 'completed';
                const isActive = index === activeStep;
                
                return (
                  <Step key={step.id} completed={isCompleted}>
                    <StepLabel
                      optional={
                        isCompleted ? (
                          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                            Completed {onboarding?.stepProgress?.[step.id]?.completedAt ? 
                              moment(onboarding.stepProgress[step.id].completedAt).format('MMM DD') : ''}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Step {step.step} of 8
                          </Typography>
                        )
                      }
                      icon={
                        isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <Avatar sx={{ 
                            bgcolor: 'transparent', 
                            color: isActive ? 'primary.main' : 'grey.400',
                            border: isActive ? '2px solid' : '1px solid',
                            borderColor: isActive ? 'primary.main' : 'grey.400',
                            width: 28, 
                            height: 28,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {step.step}
                          </Avatar>
                        )
                      }
                    >
                      <Typography variant="subtitle2" fontWeight={isActive ? 600 : 500} sx={{ fontSize: '0.9rem' }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        {step.description}
                      </Typography>
                      <Box sx={{ mb: 0.5 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleStepComplete(step.id)}
                          disabled={isCompleted || processingStep === step.id}
                          size="small"
                          sx={{ mr: 1, fontSize: '0.75rem', py: 0.5 }}
                        >
                          {isCompleted ? 'Completed' : 'Mark Complete'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={() => setActiveStep(index - 1)}
                          size="small"
                          sx={{ fontSize: '0.75rem', py: 0.5 }}
                        >
                          Back
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        </Card>
      </Grid>

    </Grid>
  );

  // Step Content Renderer
  const renderStepContent = () => {
    const currentStep = workflowSteps[activeStep];
    if (!currentStep) return null;

    const StepComponent = currentStep.component;
    
    if (!StepComponent) {
      return (
        <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'transparent',
              color: 'primary.main',
              border: '2px solid',
              borderColor: 'primary.main',
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2
            }}
          >
            {currentStep.icon}
          </Avatar>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {currentStep.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {currentStep.description}
          </Typography>
          <Alert severity="info">
            <AlertTitle>Component Under Development</AlertTitle>
            This step component is being developed and will be available soon.
          </Alert>
        </Card>
      );
    }

    return (
      <StepComponent 
        onboarding={onboarding}
        onUpdate={setOnboarding}
        onComplete={() => handleStepComplete(currentStep.id)}
      />
    );
  };

  if (!onboarding) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Onboarding Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The requested onboarding record could not be loaded.
        </Typography>
        <Button
          variant="contained"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1 }}>
        <WorkflowHeader />
        <StepNavigation />
        
        <Fade in={true} timeout={800}>
          <Card variant="outlined">
            <CardHeader
              title={
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontSize: '1.25rem'
                }}>
                  {workflowSteps[activeStep]?.icon}
                  {workflowSteps[activeStep]?.label}
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}>
                  {workflowSteps[activeStep]?.description}
                </Typography>
              }
              action={
                <Chip
                  label={`Step ${workflowSteps[activeStep]?.step} of 8`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    fontSize: '0.75rem'
                  }}
                />
              }
              sx={{ pb: 1.5, pt: 1.5 }}
            />
            <Divider sx={{ opacity: 0.1 }} />
            <Box sx={{ p: 2.5 }}>
              {renderStepContent()}
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default OnboardingWorkflowNew;