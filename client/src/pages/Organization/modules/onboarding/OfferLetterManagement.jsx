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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Draw as SignatureIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const OfferLetterManagement = ({ onboardingId, onUpdate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [offerLetterData, setOfferLetterData] = useState({
    candidateEmail: '',
    candidateName: '',
    position: '',
    department: '',
    salary: '',
    startDate: null,
    reportingManager: '',
    workLocation: '',
    employmentType: 'full_time',
    probationPeriod: 6,
    benefits: [],
    terms: [],
    expiryDate: moment().add(15, 'days').toDate(),
    
    // Template settings
    template: 'standard',
    customTemplate: '',
    
    // Digital signature settings
    requireDigitalSignature: true,
    signatureProvider: 'internal', // internal, docusign, hellosign
    
    // Status tracking
    status: 'draft',
    sentAt: null,
    acceptedAt: null,
    rejectedAt: null,
    viewedAt: null,
    remindersSent: 0,
    
    // Approval workflow
    requireApproval: false,
    approvedBy: null,
    approvedAt: null
  });

  const [templates, setTemplates] = useState([]);
  const [managers, setManagers] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    {
      label: 'Candidate Information',
      description: 'Enter candidate basic details'
    },
    {
      label: 'Job Details',
      description: 'Position, salary, and employment terms'
    },
    {
      label: 'Template Selection',
      description: 'Choose or customize offer letter template'
    },
    {
      label: 'Review & Send',
      description: 'Review details and send offer letter'
    }
  ];

  const benefitOptions = [
    'Health Insurance',
    'Life Insurance',
    'Provident Fund',
    'Gratuity',
    'Flexible Working Hours',
    'Work From Home',
    'Professional Development',
    'Annual Bonus',
    'Performance Bonus',
    'Stock Options',
    'Meal Allowance',
    'Transport Allowance',
    'Mobile Allowance',
    'Gym Membership',
    'Annual Leave',
    'Sick Leave',
    'Maternity/Paternity Leave'
  ];

  const standardTerms = [
    'Employment is subject to satisfactory background verification',
    'Confidentiality and non-disclosure agreement must be signed',
    'Notice period as per company policy',
    'Adherence to company code of conduct',
    'Completion of probation period successfully'
  ];

  useEffect(() => {
    fetchTemplates();
    fetchManagers();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/onboarding/offer-letter-templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/onboarding/managers');
      setManagers(response.data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const validateCurrentStep = (step) => {
    switch (step) {
      case 0:
        // Candidate Information - basic validation
        return offerLetterData.candidateName && offerLetterData.candidateEmail;
      case 1:
        // Job Details - including mandatory reporting manager
        return offerLetterData.position && 
               offerLetterData.department && 
               offerLetterData.salary && 
               offerLetterData.reportingManager;
      case 2:
        // Template Selection
        return true;
      case 3:
        // Review & Send
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep(activeStep)) {
      if (activeStep === 1 && !offerLetterData.reportingManager) {
        toast.error('Please select a reporting manager before proceeding');
        return;
      }
      toast.error('Please fill in all required fields before proceeding');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleBenefitToggle = (benefit) => {
    setOfferLetterData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleTermToggle = (term) => {
    setOfferLetterData(prev => ({
      ...prev,
      terms: prev.terms.includes(term)
        ? prev.terms.filter(t => t !== term)
        : [...prev.terms, term]
    }));
  };

  const generateOfferLetter = async () => {
    // Validate before generating
    if (!offerLetterData.reportingManager) {
      toast.error('Reporting Manager is required before generating the offer letter');
      return;
    }

    if (!offerLetterData.position || !offerLetterData.department || !offerLetterData.salary) {
      toast.error('Please fill in all required fields before generating the offer letter');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/onboarding/generate-offer-letter', {
        onboardingId,
        ...offerLetterData
      });
      toast.success('Offer letter generated successfully');
      if (onUpdate) onUpdate();
      return response.data;
    } catch (error) {
      console.error('Error generating offer letter:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate offer letter';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOfferLetter = async () => {
    // Final validation before sending
    if (!offerLetterData.reportingManager) {
      toast.error('Reporting Manager is required before sending the offer letter');
      return;
    }

    if (!offerLetterData.position || !offerLetterData.department || !offerLetterData.salary) {
      toast.error('Please fill in all required fields before sending the offer letter');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/onboarding/send-offer-letter', {
        onboardingId,
        ...offerLetterData
      });
      toast.success('Offer letter sent successfully');
      setOfferLetterData(prev => ({
        ...prev,
        status: 'sent',
        sentAt: new Date()
      }));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sending offer letter:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send offer letter';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const previewOfferLetter = () => {
    setPreviewOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'pending_approval': 'warning',
      'approved': 'info',
      'sent': 'primary',
      'viewed': 'secondary',
      'accepted': 'success',
      'rejected': 'error',
      'expired': 'error'
    };
    return colors[status] || 'default';
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Name"
                required
                value={offerLetterData.candidateName}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, candidateName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Email"
                type="email"
                required
                value={offerLetterData.candidateEmail}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, candidateEmail: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                required
                value={offerLetterData.position}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={offerLetterData.department}
                  label="Department"
                  onChange={(e) => setOfferLetterData({ ...offerLetterData, department: e.target.value })}
                >
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Annual Salary (₹)"
                type="number"
                required
                value={offerLetterData.salary}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, salary: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={offerLetterData.startDate}
                onChange={(date) => setOfferLetterData({ ...offerLetterData, startDate: date })}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!offerLetterData.reportingManager}>
                <InputLabel>Reporting Manager *</InputLabel>
                <Select
                  value={offerLetterData.reportingManager}
                  label="Reporting Manager *"
                  onChange={(e) => setOfferLetterData({ ...offerLetterData, reportingManager: e.target.value })}
                  required
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.displayText}
                    </MenuItem>
                  ))}
                </Select>
                {!offerLetterData.reportingManager && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    Reporting Manager is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Location"
                value={offerLetterData.workLocation}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, workLocation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={offerLetterData.employmentType}
                  label="Employment Type"
                  onChange={(e) => setOfferLetterData({ ...offerLetterData, employmentType: e.target.value })}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Probation Period (Months)"
                type="number"
                value={offerLetterData.probationPeriod}
                onChange={(e) => setOfferLetterData({ ...offerLetterData, probationPeriod: e.target.value })}
              />
            </Grid>

            {/* Benefits Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Benefits & Perks
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {benefitOptions.map((benefit) => (
                    <Grid item xs={12} sm={6} md={4} key={benefit}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={offerLetterData.benefits.includes(benefit)}
                            onChange={() => handleBenefitToggle(benefit)}
                            size="small"
                          />
                        }
                        label={benefit}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Terms & Conditions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                {standardTerms.map((term) => (
                  <FormControlLabel
                    key={term}
                    control={
                      <Switch
                        checked={offerLetterData.terms.includes(term)}
                        onChange={() => handleTermToggle(term)}
                        size="small"
                      />
                    }
                    label={term}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={offerLetterData.template}
                  label="Template"
                  onChange={(e) => setOfferLetterData({ ...offerLetterData, template: e.target.value })}
                >
                  <MenuItem value="standard">Standard Template</MenuItem>
                  <MenuItem value="executive">Executive Template</MenuItem>
                  <MenuItem value="intern">Intern Template</MenuItem>
                  <MenuItem value="custom">Custom Template</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Offer Expiry Date"
                value={offerLetterData.expiryDate}
                onChange={(date) => setOfferLetterData({ ...offerLetterData, expiryDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            {/* Digital Signature Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Digital Signature Settings
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={offerLetterData.requireDigitalSignature}
                      onChange={(e) => setOfferLetterData({ ...offerLetterData, requireDigitalSignature: e.target.checked })}
                    />
                  }
                  label="Require Digital Signature"
                />
                
                {offerLetterData.requireDigitalSignature && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Signature Provider</InputLabel>
                    <Select
                      value={offerLetterData.signatureProvider}
                      label="Signature Provider"
                      onChange={(e) => setOfferLetterData({ ...offerLetterData, signatureProvider: e.target.value })}
                    >
                      <MenuItem value="internal">Internal Signature</MenuItem>
                      <MenuItem value="docusign">DocuSign</MenuItem>
                      <MenuItem value="hellosign">HelloSign</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>

            {/* Approval Workflow */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Approval Workflow
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={offerLetterData.requireApproval}
                      onChange={(e) => setOfferLetterData({ ...offerLetterData, requireApproval: e.target.checked })}
                    />
                  }
                  label="Require Manager Approval Before Sending"
                />
              </Paper>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Offer Letter Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Candidate Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {offerLetterData.candidateName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {offerLetterData.candidateEmail}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Job Details
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Position:</strong> {offerLetterData.position}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Department:</strong> {offerLetterData.department}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Salary:</strong> ₹{offerLetterData.salary ? Number(offerLetterData.salary).toLocaleString() : '0'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Start Date:</strong> {offerLetterData.startDate ? moment(offerLetterData.startDate).format('MMM DD, YYYY') : 'Not set'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Benefits & Terms
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          Benefits:
                        </Typography>
                        {offerLetterData.benefits.length > 0 ? (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {offerLetterData.benefits.map((benefit) => (
                              <Chip key={benefit} label={benefit} size="small" />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No benefits selected
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          Terms & Conditions:
                        </Typography>
                        {offerLetterData.terms.length > 0 ? (
                          <List dense>
                            {offerLetterData.terms.slice(0, 3).map((term) => (
                              <ListItem key={term} sx={{ py: 0.25 }}>
                                <ListItemText 
                                  primary={term}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                            {offerLetterData.terms.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{offerLetterData.terms.length - 3} more terms
                              </Typography>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No terms selected
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={previewOfferLetter}
              >
                Preview Offer Letter
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={generateOfferLetter}
                disabled={loading}
              >
                Generate PDF
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📄 Offer Letter Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate, customize, and send professional offer letters with digital signature support
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Status Overview */}
        {offerLetterData.status !== 'draft' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Offer Letter Status
                  </Typography>
                  <Chip
                    label={offerLetterData.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(offerLetterData.status)}
                    icon={<VerifiedIcon />}
                  />
                </Box>
                <Stack spacing={1} alignItems="flex-end">
                  {offerLetterData.sentAt && (
                    <Typography variant="body2" color="text.secondary">
                      Sent: {moment(offerLetterData.sentAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  )}
                  {offerLetterData.viewedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Viewed: {moment(offerLetterData.viewedAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  )}
                  {offerLetterData.acceptedAt && (
                    <Typography variant="body2" color="success.main">
                      Accepted: {moment(offerLetterData.acceptedAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
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
                    {activeStep === steps.length - 1 ? (
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          onClick={sendOfferLetter}
                          disabled={loading}
                          startIcon={<SendIcon />}
                        >
                          {offerLetterData.requireApproval ? 'Send for Approval' : 'Send Offer Letter'}
                        </Button>
                        <Button onClick={handleBack}>
                          Back
                        </Button>
                      </Stack>
                    ) : (
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Continue
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
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

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Offer Letter Preview
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" align="center" gutterBottom>
                OFFER LETTER
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                Dear {offerLetterData.candidateName},
              </Typography>
              
              <Typography variant="body1" paragraph>
                We are pleased to offer you the position of <strong>{offerLetterData.position}</strong> 
                in our <strong>{offerLetterData.department}</strong> department.
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Position Details:</strong><br />
                • Annual Salary: ₹{offerLetterData.salary ? Number(offerLetterData.salary).toLocaleString() : '0'}<br />
                • Start Date: {offerLetterData.startDate ? moment(offerLetterData.startDate).format('MMM DD, YYYY') : 'TBD'}<br />
                • Employment Type: {offerLetterData.employmentType.replace('_', ' ')}<br />
                • Probation Period: {offerLetterData.probationPeriod} months<br />
                {offerLetterData.workLocation && `• Work Location: ${offerLetterData.workLocation}`}
              </Typography>

              {offerLetterData.benefits.length > 0 && (
                <Typography variant="body1" paragraph>
                  <strong>Benefits & Perks:</strong><br />
                  {offerLetterData.benefits.map((benefit, index) => (
                    `• ${benefit}${index < offerLetterData.benefits.length - 1 ? '\n' : ''}`
                  ))}
                </Typography>
              )}

              <Typography variant="body1" paragraph>
                Please confirm your acceptance of this offer by {moment(offerLetterData.expiryDate).format('MMM DD, YYYY')}.
              </Typography>

              <Typography variant="body1" paragraph>
                We look forward to welcoming you to our team!
              </Typography>

              <Typography variant="body1" paragraph>
                Best regards,<br />
                HR Team
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default OfferLetterManagement;
