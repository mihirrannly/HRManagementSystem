import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  Divider,
  Avatar,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Email as EmailIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AttachFile as AttachFileIcon,
  Folder as FolderIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  AccountBalance as BankIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  ContactMail as ContactMailIcon,
  LibraryBooks as LibraryBooksIcon,
  Policy as PolicyIcon,
  Handshake as HandshakeIcon,
  Stars as StarsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const PreOnboardingWorkflow = ({ onboardingId, candidateData, onUpdate }) => {
  const [checklist, setChecklist] = useState([]);
  const [welcomeKit, setWelcomeKit] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('documents');

  // Document categories and requirements
  const documentCategories = [
    {
      id: 'identity',
      name: 'Identity Documents',
      icon: <PersonIcon />,
      required: true,
      documents: [
        { id: 'aadhar', name: 'Aadhar Card', required: true, status: 'pending' },
        { id: 'pan', name: 'PAN Card', required: true, status: 'pending' },
        { id: 'passport', name: 'Passport', required: false, status: 'pending' },
        { id: 'driving_license', name: 'Driving License', required: false, status: 'pending' }
      ]
    },
    {
      id: 'education',
      name: 'Educational Certificates',
      icon: <SchoolIcon />,
      required: true,
      documents: [
        { id: 'degree', name: 'Degree Certificate', required: true, status: 'pending' },
        { id: 'marksheets', name: 'Marksheets', required: true, status: 'pending' },
        { id: 'transcripts', name: 'Official Transcripts', required: false, status: 'pending' }
      ]
    },
    {
      id: 'experience',
      name: 'Experience Documents',
      icon: <WorkIcon />,
      required: false,
      documents: [
        { id: 'experience_letters', name: 'Experience Letters', required: false, status: 'pending' },
        { id: 'salary_slips', name: 'Last 3 Salary Slips', required: false, status: 'pending' },
        { id: 'relieving_letter', name: 'Relieving Letter', required: false, status: 'pending' }
      ]
    },
    {
      id: 'personal',
      name: 'Personal Documents',
      icon: <HomeIcon />,
      required: true,
      documents: [
        { id: 'photo', name: 'Passport Size Photo', required: true, status: 'pending' },
        { id: 'address_proof', name: 'Address Proof', required: true, status: 'pending' },
        { id: 'bank_details', name: 'Bank Account Details', required: true, status: 'pending' }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Documents',
      icon: <SecurityIcon />,
      required: false,
      documents: [
        { id: 'medical_certificate', name: 'Medical Certificate', required: false, status: 'pending' },
        { id: 'vaccination_certificate', name: 'Vaccination Certificate', required: false, status: 'pending' }
      ]
    }
  ];

  // Welcome kit items
  const welcomeKitItems = [
    {
      id: 'handbook',
      name: 'Employee Handbook',
      type: 'document',
      description: 'Company policies, procedures, and guidelines',
      status: 'ready',
      mandatory: true
    },
    {
      id: 'code_of_conduct',
      name: 'Code of Conduct',
      type: 'document',
      description: 'Professional behavior and ethics guidelines',
      status: 'ready',
      mandatory: true
    },
    {
      id: 'it_policies',
      name: 'IT Security Policies',
      type: 'document',
      description: 'Information security and IT usage policies',
      status: 'ready',
      mandatory: true
    },
    {
      id: 'benefits_guide',
      name: 'Benefits Guide',
      type: 'document',
      description: 'Comprehensive guide to employee benefits',
      status: 'ready',
      mandatory: false
    },
    {
      id: 'org_chart',
      name: 'Organizational Chart',
      type: 'document',
      description: 'Company structure and reporting hierarchy',
      status: 'ready',
      mandatory: false
    },
    {
      id: 'welcome_video',
      name: 'Welcome Video',
      type: 'video',
      description: 'CEO welcome message and company introduction',
      status: 'ready',
      mandatory: false
    },
    {
      id: 'office_map',
      name: 'Office Layout & Facilities',
      type: 'document',
      description: 'Office map, facilities, and emergency procedures',
      status: 'ready',
      mandatory: false
    },
    {
      id: 'contact_directory',
      name: 'Contact Directory',
      type: 'document',
      description: 'Important contacts and department information',
      status: 'ready',
      mandatory: false
    }
  ];

  // Pre-onboarding steps
  const preOnboardingSteps = [
    {
      label: 'Document Request',
      description: 'Send document collection checklist to candidate'
    },
    {
      label: 'Welcome Kit Distribution',
      description: 'Share company policies and welcome materials'
    },
    {
      label: 'Document Collection',
      description: 'Collect and verify submitted documents'
    },
    {
      label: 'Background Verification',
      description: 'Initiate background verification process'
    }
  ];

  useEffect(() => {
    initializePreOnboarding();
  }, [onboardingId]);

  const initializePreOnboarding = () => {
    // Initialize document checklist
    const initialChecklist = documentCategories.map(category => ({
      ...category,
      documents: category.documents.map(doc => ({
        ...doc,
        submittedAt: null,
        verifiedAt: null,
        rejectedAt: null,
        comments: ''
      }))
    }));
    setChecklist(initialChecklist);
    setWelcomeKit(welcomeKitItems);
  };

  const sendDocumentRequest = async () => {
    try {
      setLoading(true);
      await axios.post(`/onboarding/${onboardingId}/send-document-request`, {
        checklist: checklist,
        candidateEmail: candidateData?.email
      });
      toast.success('Document request sent to candidate');
      setActiveStep(1);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sending document request:', error);
      toast.error('Failed to send document request');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeKit = async () => {
    try {
      setLoading(true);
      const selectedItems = welcomeKit.filter(item => item.selected || item.mandatory);
      await axios.post(`/onboarding/${onboardingId}/send-welcome-kit`, {
        items: selectedItems,
        candidateEmail: candidateData?.email
      });
      toast.success('Welcome kit sent to candidate');
      setActiveStep(2);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sending welcome kit:', error);
      toast.error('Failed to send welcome kit');
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (categoryId, documentId, status, comments = '') => {
    try {
      await axios.put(`/onboarding/${onboardingId}/document-status`, {
        categoryId,
        documentId,
        status,
        comments
      });
      
      // Update local state
      setChecklist(prev => prev.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              documents: category.documents.map(doc =>
                doc.id === documentId
                  ? {
                      ...doc,
                      status,
                      comments,
                      [status === 'verified' ? 'verifiedAt' : 
                       status === 'rejected' ? 'rejectedAt' : 
                       'submittedAt']: new Date()
                    }
                  : doc
              )
            }
          : category
      ));
      
      toast.success(`Document ${status} successfully`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    }
  };

  const toggleWelcomeKitItem = (itemId) => {
    setWelcomeKit(prev => prev.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const getDocumentStatusColor = (status) => {
    const colors = {
      'pending': 'default',
      'submitted': 'info',
      'under_review': 'warning',
      'verified': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getDocumentStatusIcon = (status) => {
    const icons = {
      'pending': <ScheduleIcon />,
      'submitted': <UploadIcon />,
      'under_review': <WarningIcon />,
      'verified': <CheckCircleIcon />,
      'rejected': <ErrorIcon />
    };
    return icons[status] || <ScheduleIcon />;
  };

  const calculateProgress = () => {
    const totalDocuments = checklist.reduce((sum, category) => sum + category.documents.length, 0);
    const verifiedDocuments = checklist.reduce((sum, category) => 
      sum + category.documents.filter(doc => doc.status === 'verified').length, 0
    );
    return totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Document Collection Checklist
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure the documents required from the candidate before their first day
            </Typography>

            {checklist.map((category) => (
              <Accordion
                key={category.id}
                expanded={expandedAccordion === category.id}
                onChange={() => setExpandedAccordion(expandedAccordion === category.id ? null : category.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar sx={{ bgcolor: category.required ? 'primary.main' : 'grey.500' }}>
                      {category.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {category.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {category.documents.length} documents
                        </Typography>
                        {category.required && (
                          <Chip label="Required" size="small" color="primary" />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {category.documents.filter(doc => doc.status === 'verified').length}/
                      {category.documents.length} verified
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {category.documents.map((document) => (
                      <ListItem key={document.id}>
                        <ListItemIcon>
                          {getDocumentStatusIcon(document.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={document.name}
                          secondary={
                            <Box>
                              <Chip
                                label={document.status.replace('_', ' ').toUpperCase()}
                                color={getDocumentStatusColor(document.status)}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                              {document.required && (
                                <Chip label="Required" size="small" color="warning" sx={{ ml: 1, mt: 0.5 }} />
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {document.status === 'submitted' && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => updateDocumentStatus(category.id, document.id, 'verified')}
                              >
                                Verify
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => updateDocumentStatus(category.id, document.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendDocumentRequest}
                disabled={loading}
              >
                Send Document Request
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
              >
                Preview Email
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome Kit Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select and send welcome materials to help the candidate prepare for their first day
            </Typography>

            <Grid container spacing={2}>
              {welcomeKit.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      opacity: item.mandatory || item.selected ? 1 : 0.7,
                      border: item.selected ? 2 : 1,
                      borderColor: item.selected ? 'primary.main' : 'divider'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: item.type === 'video' ? 'secondary.main' : 'primary.main' }}>
                          {item.type === 'video' ? <ContactMailIcon /> : <DocumentIcon />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {item.name}
                            </Typography>
                            {item.mandatory && (
                              <Chip label="Mandatory" size="small" color="error" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={item.mandatory || item.selected}
                                onChange={() => !item.mandatory && toggleWelcomeKitItem(item.id)}
                                disabled={item.mandatory}
                              />
                            }
                            label={item.mandatory ? "Required" : "Include"}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendWelcomeKit}
                disabled={loading}
              >
                Send Welcome Kit
              </Button>
              <Button
                variant="outlined"
                startIcon={<LibraryBooksIcon />}
              >
                Preview Package
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Document Collection Status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track and verify documents submitted by the candidate
            </Typography>

            {/* Progress Overview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Overall Progress
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {calculateProgress()}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>

            {/* Document Status by Category */}
            {checklist.map((category) => {
              const categoryProgress = Math.round(
                (category.documents.filter(doc => doc.status === 'verified').length / category.documents.length) * 100
              );
              
              return (
                <Card key={category.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {category.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.documents.filter(doc => doc.status === 'verified').length}/
                          {category.documents.length} documents verified
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary.main">
                        {categoryProgress}%
                      </Typography>
                    </Box>
                    
                    <List dense>
                      {category.documents.map((document) => (
                        <ListItem key={document.id}>
                          <ListItemIcon>
                            {getDocumentStatusIcon(document.status)}
                          </ListItemIcon>
                          <ListItemText
                            primary={document.name}
                            secondary={
                              <Box>
                                <Chip
                                  label={document.status.replace('_', ' ').toUpperCase()}
                                  color={getDocumentStatusColor(document.status)}
                                  size="small"
                                />
                                {document.submittedAt && (
                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    Submitted: {moment(document.submittedAt).format('MMM DD, YYYY')}
                                  </Typography>
                                )}
                                {document.comments && (
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {document.comments}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            {document.status === 'submitted' && (
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Verify Document">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => updateDocumentStatus(category.id, document.id, 'verified')}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Document">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => updateDocumentStatus(category.id, document.id, 'rejected')}
                                  >
                                    <ErrorIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              );
            })}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                disabled={calculateProgress() < 50}
              >
                Send Reminder
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={initializePreOnboarding}
              >
                Refresh Status
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Background Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Initiate and track background verification process
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Background verification will be initiated automatically once all required documents are verified.
              Current progress: {calculateProgress()}%
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Verification Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color={calculateProgress() >= 80 ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Document Verification"
                      secondary={`${calculateProgress()}% complete`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={calculateProgress() >= 80 ? "Complete" : "In Progress"}
                        color={calculateProgress() >= 80 ? "success" : "default"}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Employment History Verification"
                      secondary="Pending document verification"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Pending" color="default" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="disabled" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Education Verification"
                      secondary="Pending document verification"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Pending" color="default" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SecurityIcon />}
                disabled={calculateProgress() < 80}
              >
                Initiate Verification
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContactMailIcon />}
              >
                Contact Verification Agency
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📋 Pre-Onboarding Workflow
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Streamlined document collection, welcome kit distribution, and verification process
      </Typography>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {checklist.reduce((sum, cat) => sum + cat.documents.length, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {checklist.reduce((sum, cat) => 
                    sum + cat.documents.filter(doc => doc.status === 'submitted').length, 0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Submitted
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {checklist.reduce((sum, cat) => 
                    sum + cat.documents.filter(doc => doc.status === 'verified').length, 0
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {calculateProgress()}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workflow Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {preOnboardingSteps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle1" fontWeight="600">
                {step.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 2, mb: 2 }}>
                {renderStepContent(index)}
              </Box>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    disabled={index === 0}
                    onClick={() => setActiveStep(index - 1)}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                  {index < preOnboardingSteps.length - 1 && (
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(index + 1)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Next Step
                    </Button>
                  )}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {loading && (
        <LinearProgress sx={{ mt: 2 }} />
      )}
    </Box>
  );
};

export default PreOnboardingWorkflow;
