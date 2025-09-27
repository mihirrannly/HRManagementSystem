import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const OfferLetterEditor = ({ onboarding, onUpdate, onComplete, onboardingId, existingOfferLetter = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({});
  const [managers, setManagers] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

  const [offerData, setOfferData] = useState(() => {
    const baseData = {
      position: '',
      department: '',
      salary: '',
      startDate: moment().add(30, 'days'),
      reportingManager: '',
      workLocation: 'Noida',
      employmentType: 'full_time',
      probationPeriod: 3,
      benefits: [], // No separate benefits section in Codervalue format
      terms: [], // Will be replaced with fixed Codervalue terms
      expiryDate: moment().add(15, 'days'),
      customMessage: '',
      // Additional fields for Codervalue format
      companyName: 'CODERVALUE SOLUTIONS PRIVATE LIMITED',
      companyAddress: 'Office 303, 3rd Floor, H-47, USIS BIZPARK, Sector 63, Gautam Buddha Nagar, Noida, Uttar Pradesh, 201309',
      cinNumber: 'U72900UP2021PTC141154',
      joiningDate: moment().add(30, 'days'),
      noticePeriodProbation: 30,
      noticePeriodRegular: 60,
      nonCompetePeriod: 12,
      nonSolicitationPeriod: 24,
      retirementAge: 58
    };

    if (existingOfferLetter) {
      return {
        ...baseData,
        ...existingOfferLetter,
        startDate: existingOfferLetter.startDate ? moment(existingOfferLetter.startDate) : moment().add(30, 'days'),
        expiryDate: existingOfferLetter.expiryDate ? moment(existingOfferLetter.expiryDate) : moment().add(15, 'days')
      };
    }

    return baseData;
  });

  const [customBenefit, setCustomBenefit] = useState('');
  const [customTerm, setCustomTerm] = useState('');

  const steps = [
    { label: 'Basic Information', description: 'Position and employment details' },
    { label: 'Compensation Details', description: 'Salary and joining information' },
    { label: 'Review & Send', description: 'Review offer letter and send to candidate' }
  ];

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Internship' }
  ];

  const standardBenefits = [
    'Health Insurance (Medical, Dental, Vision)',
    'Life Insurance (2x Annual Salary)',
    'Accidental Insurance Coverage',
    'Provident Fund (12% of Basic Salary)',
    'Gratuity (as per Payment of Gratuity Act)',
    'Employee State Insurance (ESI)',
    'Professional Tax',
    'Flexible Working Hours',
    'Work From Home Policy',
    'Hybrid Work Model',
    'Professional Development Budget',
    'Training & Certification Support',
    'Conference & Seminar Attendance',
    'Annual Performance Bonus',
    'Quarterly Performance Incentives',
    'Employee Stock Options (ESOP)',
    'Retention Bonus',
    'Meal Allowance/Food Coupons',
    'Transport Allowance/Cab Facility',
    'Mobile/Internet Allowance',
    'Laptop & Equipment Provision',
    'Gym/Wellness Membership',
    'Annual Health Check-up',
    'Casual Leave (12 days)',
    'Sick Leave (12 days)',
    'Earned Leave (21 days)',
    'Maternity Leave (26 weeks)',
    'Paternity Leave (15 days)',
    'Bereavement Leave (5 days)',
    'Festival Advance',
    'Emergency Leave Policy',
    'Sabbatical Leave Options',
    'Employee Referral Bonus',
    'Team Outing & Events',
    'Birthday & Anniversary Celebrations'
  ];

  const standardTerms = [
    'Employment is subject to satisfactory verification of academic credentials, previous employment records, character references, medical fitness, and police verification as deemed necessary by the company',
    'This offer is contingent upon successful completion of background verification process within 30 days of joining',
    'Confidentiality and Non-Disclosure Agreement (NDA) must be executed prior to commencement of employment',
    'Employee shall maintain strict confidentiality of all proprietary information, trade secrets, and business strategies',
    'Notice period shall be as follows: 30 days for employees up to Manager level, 60 days for Senior Manager level, and 90 days for General Manager and above positions',
    'During notice period, employee may be assigned to different responsibilities or may be relieved immediately at company\'s discretion with payment in lieu of notice',
    'Probation period of 6 months from date of joining, extendable by additional 3 months if required. During probation, either party may terminate employment with 7 days notice',
    'Performance evaluation will be conducted regularly, and continued employment is subject to satisfactory performance',
    'Employee must adhere to company code of conduct, policies, procedures, and ethical guidelines at all times',
    'Any violation of company policies may result in disciplinary action including termination of employment',
    'All intellectual property, inventions, discoveries, and work products created during employment shall belong exclusively to the company',
    'Employee agrees not to engage in any competing business or work for competitors during employment and for 12 months post-employment',
    'Employee shall not solicit company clients, customers, or employees for 12 months after termination',
    'Company reserves the right to modify terms of employment, policies, and benefits with 30 days written notice',
    'Any disputes shall be subject to jurisdiction of courts in [Company Location] only',
    'Employment may be terminated immediately without notice for misconduct, breach of trust, or violation of company policies',
    'Employee must comply with all applicable laws, regulations, and statutory requirements',
    'Company may conduct periodic background checks and drug tests as per policy',
    'Employee consents to use of biometric data for attendance and security purposes',
    'This agreement shall be governed by Indian Employment Laws and Labor Acts',
    'Any amendments to this offer must be in writing and signed by authorized company representatives',
    'Employee acknowledges receipt and understanding of Employee Handbook and agrees to comply with all provisions therein'
  ];

  useEffect(() => {
    const id = onboardingId || onboarding?._id;
    if (id) {
      fetchCandidateInfo(id);
      fetchManagers();
    }
  }, [onboardingId, onboarding]);

  const fetchCandidateInfo = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`onboarding/${id}/offer-letter`);
      setCandidateInfo(response.data.candidateInfo || {});
      
      // Pre-populate form with candidate info
      if (response.data.candidateInfo) {
        setOfferData(prev => {
          const updatedData = {
            ...prev,
            position: response.data.candidateInfo.position || prev.position,
            department: response.data.candidateInfo.department || prev.department,
            salary: response.data.candidateInfo.salary || prev.salary,
            startDate: response.data.candidateInfo.startDate ? 
              moment(response.data.candidateInfo.startDate) : prev.startDate,
            ...response.data.offerLetter
          };

          // Ensure date fields are proper Moment objects
          if (updatedData.startDate && !moment.isMoment(updatedData.startDate)) {
            updatedData.startDate = moment(updatedData.startDate);
          }
          if (updatedData.expiryDate && !moment.isMoment(updatedData.expiryDate)) {
            updatedData.expiryDate = moment(updatedData.expiryDate);
          }

          return updatedData;
        });
      }
    } catch (error) {
      console.error('Error fetching candidate info:', error);
      toast.error('Failed to load candidate information');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('onboarding/managers');
      setManagers(response.data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleInputChange = (field, value) => {
    setOfferData(prev => ({
      ...prev,
      [field]: (field === 'startDate' || field === 'expiryDate') && value ? moment(value) : value
    }));
  };

  const handleBenefitAdd = (benefit) => {
    if (benefit && !offerData.benefits.includes(benefit)) {
      setOfferData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
    }
    setCustomBenefit('');
  };

  const handleBenefitRemove = (benefitToRemove) => {
    setOfferData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefitToRemove)
    }));
  };

  const handleTermAdd = (term) => {
    if (term && !offerData.terms.includes(term)) {
      setOfferData(prev => ({
        ...prev,
        terms: [...prev.terms, term]
      }));
    }
    setCustomTerm('');
  };

  const handleTermRemove = (termToRemove) => {
    setOfferData(prev => ({
      ...prev,
      terms: prev.terms.filter(t => t !== termToRemove)
    }));
  };

  const saveOfferLetter = async () => {
    // Validate required fields before saving
    if (!offerData.reportingManager) {
      toast.error('Reporting Manager is required');
      return false;
    }

    if (!offerData.position || !offerData.department || !offerData.salary) {
      toast.error('Please fill in all required fields (Position, Department, Salary)');
      return false;
    }

    try {
      setSaving(true);
      const id = onboardingId || onboarding?._id;
      const payload = {
        onboardingId: id,
        ...offerData,
        startDate: offerData.startDate?.toISOString(),
        expiryDate: offerData.expiryDate?.toISOString()
      };

      await axios.post('onboarding/offer-letter', payload);
      toast.success('Offer letter saved successfully');
      if (onUpdate) onUpdate();
      return true;
    } catch (error) {
      console.error('Error saving offer letter:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save offer letter';
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const sendOfferLetter = async () => {
    try {
      setSending(true);
      
      // First save the offer letter
      const saved = await saveOfferLetter();
      if (!saved) return;

      // Then send it
      const id = onboardingId || onboarding?._id;
      const response = await axios.post(`onboarding/${id}/send-offer-letter`);
      
      toast.success('🎉 Offer letter sent successfully to candidate!');
      setSendConfirmOpen(false);
      if (onUpdate) onUpdate();
      if (onComplete) onComplete();
      
      return response.data;
    } catch (error) {
      console.error('Error sending offer letter:', error);
      toast.error('Failed to send offer letter');
    } finally {
      setSending(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return offerData.position && offerData.department && offerData.startDate && offerData.reportingManager;
      case 1:
        return offerData.salary && offerData.salary > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Candidate Information
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Candidate Name
                          </Typography>
                          <Typography variant="body1">
                            {candidateInfo.employeeName || 'Loading...'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email Address
                          </Typography>
                          <Typography variant="body1">
                            {candidateInfo.email || 'Loading...'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position Title"
                value={offerData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                required
                InputProps={{
                  startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={offerData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                required
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Start Date"
                  value={offerData.startDate}
                  onChange={(date) => handleInputChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      InputProps: {
                        startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={offerData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  label="Employment Type"
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Location"
                value={offerData.workLocation}
                onChange={(e) => handleInputChange('workLocation', e.target.value)}
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={managers}
                getOptionLabel={(option) => option.displayText || ''}
                value={managers.find(m => m._id === offerData.reportingManager) || null}
                onChange={(event, value) => handleInputChange('reportingManager', value?._id || '')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Reporting Manager" 
                    required
                    error={!offerData.reportingManager}
                    helperText={!offerData.reportingManager ? 'Reporting Manager is required' : 'Select the direct supervisor for this position'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Probation Period (months)"
                type="number"
                value={offerData.probationPeriod}
                onChange={(e) => handleInputChange('probationPeriod', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 12 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Compensation & Joining Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Annual Salary (₹)"
                type="number"
                value={offerData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                required
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                }}
                helperText="Enter annual CTC in INR"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Joining Date"
                  value={offerData.joiningDate}
                  onChange={(date) => handleInputChange('joiningDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'Expected date of joining'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Offer Expiry Date"
                  value={offerData.expiryDate}
                  onChange={(date) => handleInputChange('expiryDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Date until which offer is valid'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Probation Period (months)"
                type="number"
                value={offerData.probationPeriod}
                onChange={(e) => handleInputChange('probationPeriod', parseInt(e.target.value) || 3)}
                inputProps={{ min: 1, max: 12 }}
                helperText="Standard probation period (default: 3 months)"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> All standard terms, conditions, and company policies as per Codervalue Solutions format 
                  will be automatically included in the offer letter. Only variable fields like salary, dates, and position 
                  details need to be specified.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Codervalue Solutions Offer Letter Ready! 🎉
                </Typography>
                <Typography variant="body2">
                  Please review all details below before sending to the candidate. All standard terms and conditions 
                  are automatically included as per company format.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Position Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption">Candidate:</Typography>
                      <Typography variant="body1">{candidateInfo.employeeName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Position:</Typography>
                      <Typography variant="body1">{offerData.position}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Department:</Typography>
                      <Typography variant="body1">{offerData.department}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Work Location:</Typography>
                      <Typography variant="body1">{offerData.workLocation}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compensation & Terms
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption">Annual CTC:</Typography>
                      <Typography variant="h6" color="primary">
                        ₹{Number(offerData.salary).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Joining Date:</Typography>
                      <Typography variant="body1">
                        {offerData.joiningDate ? moment(offerData.joiningDate).format('Do MMMM, YYYY') : 'Not specified'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Probation Period:</Typography>
                      <Typography variant="body1">
                        {offerData.probationPeriod} months
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Notice Period:</Typography>
                      <Typography variant="body2">
                        {offerData.noticePeriodProbation} days (probation), {offerData.noticePeriodRegular} days (regular)
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Included Automatically:</strong> All comprehensive terms including confidentiality, 
                  non-compete ({offerData.nonCompetePeriod} months), non-solicitation ({offerData.nonSolicitationPeriod} years), 
                  intellectual property rights, termination clauses, and retirement policy (age {offerData.retirementAge}).
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewOpen(true)}
                  size="large"
                >
                  Preview Complete Letter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => setEmailPreviewOpen(true)}
                  size="large"
                  color="info"
                >
                  Preview Email
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setSendConfirmOpen(true)}
                  disabled={sending}
                  size="large"
                  color="success"
                >
                  {sending ? <CircularProgress size={20} /> : 'Send to Candidate'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon />
          Offer Letter Editor
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ py: 2 }}>
                  {renderStepContent(index)}
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={saveOfferLetter}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  >
                    Save Draft
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(index)}
                  >
                    {index === steps.length - 1 ? 'Review' : 'Next'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <PreviewIcon />
              Offer Letter Preview
            </Box>
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 4, bgcolor: 'white', border: '1px solid #ddd', fontSize: '14px' }}>
              {/* Company Letterhead - Exact Codervalue Format */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {offerData.companyName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {offerData.companyAddress}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  CIN Number: {offerData.cinNumber}
                </Typography>
              </Box>

              {/* Date */}
              <Typography variant="body1" sx={{ mb: 3 }}>
                <strong>Dated: {moment().format('Do MMMM, YYYY')}</strong>
              </Typography>
              
              {/* Greeting */}
              <Typography variant="body1" paragraph>
                <strong>Dear {candidateInfo.employeeName},</strong>
              </Typography>
              
              {/* Opening Paragraph */}
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                We are pleased to extend our offer of employment to you for the position of <strong>{offerData.position}</strong> with 
                Codervalue Solutions Pvt. Ltd. We extend this offer, and the opportunity it represents, with great 
                confidence in your abilities.
              </Typography>

              <Typography variant="body1" paragraph>
                We would like you to join us by <strong>{offerData.joiningDate ? moment(offerData.joiningDate).format('Do MMMM YYYY') : moment().add(30, 'days').format('Do MMMM YYYY')}</strong>.
              </Typography>

              {/* Terms & Conditions Header */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, fontWeight: 'bold' }}>
                Terms & Conditions of Your Employment:
              </Typography>

              {/* Compensation Package */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Compensation Package:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Your Total Annual Cost to the Company will be Rs {Number(offerData.salary).toLocaleString()} ({(() => {
                  const num = Number(offerData.salary);
                  const crores = Math.floor(num / 10000000);
                  const lakhs = Math.floor((num % 10000000) / 100000);
                  const thousands = Math.floor((num % 100000) / 1000);
                  const hundreds = num % 1000;
                  
                  let words = [];
                  if (crores > 0) words.push(`${crores} Crore${crores > 1 ? 's' : ''}`);
                  if (lakhs > 0) words.push(`${lakhs} Lakh${lakhs > 1 ? 's' : ''}`);
                  if (thousands > 0) words.push(`${thousands} Thousand`);
                  if (hundreds > 0) words.push(`${hundreds}`);
                  
                  return words.join(' ') + ' per annum Only';
                })()}).
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Your individual remuneration is purely a matter between yourself and the company and has arrived 
                based on your job, skills specific background and professional merit. We expect you to maintain this 
                information and any changes made therein from time to time as personal and highly confidential.
              </Typography>

              {/* Probation & Termination */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Probation & Termination:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Probation period is during the first {offerData.probationPeriod} months of your employment. This period 
                is subject to extension if you are found to be low-performing/not delivering. During the probation period 
                you may terminate this agreement by giving {offerData.noticePeriodProbation} days' notice. After satisfactory completion of the 
                probationary period, the service may be terminated by giving {offerData.noticePeriodRegular} days notice period or salary and 
                fixed allowances (if any) in lieu thereof. However, in the event of your being guilty of misconduct or 
                inattention or negligence in the discharge of your duties or in the conduct of the Company's business, or 
                such misdemeanour which is likely to affect, or affects the reputation of the Company's working or of any 
                breach of the terms and conditions herein, the Company reserves its right to terminate your services at 
                any given point of time, with immediate effect, without any compensation or notice.
              </Typography>

              {/* Confidentiality */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Confidentiality:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will treat matters pertaining to the Company's business interests with utmost 
                confidentiality and such confidentiality has to be maintained during your employment with the Company 
                and thereafter.
              </Typography>

              {/* Exclusive property right */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Exclusive property right:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                During your employment the products and results of the services rendered 
                by you in the form of text, image, audio & video (the "Work") will be the company's property. You 
                acknowledge and agree that the "Work" (and all rights therein, including, without limitation, copyright) 
                belongs to and shall be the sole and exclusive property of Codervalue Solutions India Pvt. Ltd. You will 
                assign the entire right, title and interest and any registrations and copyright applications relating thereto 
                and any renewals and extensions thereof.
              </Typography>

              {/* Page Break Simulation */}
              <Box sx={{ borderTop: '1px solid #ddd', pt: 3, mt: 3 }}>
              </Box>

              {/* Discipline */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Discipline:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                During your services with the company, you will be governed by the rules and regulations 
                in respect to conduct & discipline and other matters as may be framed by the company from time to 
                time.
              </Typography>

              {/* Competition & poaching */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Competition & poaching:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will undertake & sign an NDA & a non-compete agreement, that while 
                in the engagement of the Company, and for a period of {offerData.nonCompetePeriod} months after separation from the Company, 
                for any reason whatsoever, you will:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Keep confidential and not disclose to any unauthorised persons specially competition.
              </Typography>
              <Box component="ol" sx={{ pl: 3, mb: 2 }}>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  Any Company information, business, and financial interests
                </Box>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  Company intelligence, consisting of sensitive research, either acquired or in the process of being carried out.
                </Box>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  Technical capability and Commercial intelligence disclosed to you and/ or acquired by you in the course of your employment.
                </Box>
              </Box>

              <Box component="ul" sx={{ pl: 3, mb: 2, listStyleType: 'none' }}>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  ➢ Not employ, use and/ or engage the confidential information for any purposes other than the business of the Company and only during the course of your employment with the Company.
                </Box>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  ➢ Not seek or obtain employment or consultancy directly or indirectly with any other company entity/ organisation or their associates/ affiliates, which is in competition with Signifier Technology Pvt. Ltd.
                </Box>
                <Box component="li" sx={{ mb: 1, textAlign: 'justify', fontSize: '1rem', lineHeight: 1.5 }}>
                  ➢ Solicitor endeavour to entice any employee or person involved, directly or indirectly, from any of the Company's operations.
                </Box>
              </Box>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Amendments to the above terms and conditions, if any, will be made in writing. Please sign and return 
                the duplicate copy of this letter of appointment (initialling each page) as a token of your having accepted 
                the above terms and conditions. Wish you all the very best in your assignment.
              </Typography>

              {/* Place of Work/Transfer/Work Timings */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Place of Work/Transfer/Work Timings:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Your current place of work will be {offerData.workLocation}. However, your services are transferable to any other place or 
                office of the Company or any subsidiary or associate company, whether now existing or still to be 
                formed. You may also be transferred/deputed to any of the company's client locations in India or abroad. 
                Such transfer/ deputation will be in accordance with the company's rules being in force at the time. The 
                terms and conditions applicable to such other places/establishments/times will be notified to you in a 
                transfer order. The Company also reserves the right to alter your work timings or shifts, as per the 
                requirements of the Company from time to time, in adherence to all applicable laws.
              </Typography>

              {/* Ethics and Conduct */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Ethics and Conduct:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will be governed by all the policies and procedures of the organisation as applicable from time to 
                time. The Company shall have the right to vary or modify any or all the above terms and conditions in 
                service which shall be binding on you.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will carry out all instructions of your superior(s) in the Company as regards to your work, attendance, 
                conduct, behaviour, etc. and carry out diligently and honestly all duties that may be assigned to you by 
                the Company from time to time notwithstanding the designation given above.
              </Typography>

              {/* Page Break Simulation */}
              <Box sx={{ borderTop: '1px solid #ddd', pt: 3, mt: 3 }}>
              </Box>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                During your appointment pursuant to, your days of work and hours of work will be guided by the work 
                schedules as given by your manager and can be changed at the sole discretion of the management of 
                the company.
              </Typography>

              {/* Termination & Separation */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Termination & Separation: (Post probation)
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Either party can terminate the employment agreement by giving sixty (60) days of notice if approved by 
                the Management. Balance of annual leave shall not be allowed to shorten the period of notice unless 
                otherwise approved by the management. You will not be eligible for any leave during your notice period.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                The clearance of the full and final settlement shall be subject to the satisfactory handover from your end 
                and non-violation of the terms & conditions in your appointment letter, Non-Disclosure Agreement, and 
                technology usage policy.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Any act of dishonesty, disobedience, insubordination, incivility, intemperance, irregularity in attendance 
                or other misconduct or neglect of duty, or incompetence in the discharge of duty on your part or the 
                breach of any of the terms, conditions, and stipulations contained herein will render you liable to 
                termination of your employment with or without notice or compensation thereof.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                In case any information furnished by you either in your application for employment or during the 
                selection process is found to be incorrect or false, and /or if it is found that you have suppressed any 
                material information in respect of your qualifications and past experience, the Company reserves the 
                right to terminate your services any time with or without notice or compensation in lieu of notice.
              </Typography>

              {/* Non-Disclosure and Intellectual Property */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Non-Disclosure and Intellectual Property:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Information pertaining to the Company's operations shall remain confidential and you will safeguard it. 
                On joining the Company, a formal agreement to effect non-disclosure of confidential information and 
                intellectual property, etc., if required, shall be executed by you.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You shall keep secret and securely stored and shall not at any time either during your employment by 
                the company or after its termination, for whatever reason, use, communicate or reveal to any person for 
                your own or another's benefit, any such confidential information which shall have come to your 
                knowledge during your assignment with the company. You shall also use your best endeavours to 
                prevent the publication, disclosure, or use of any such confidential information and acknowledge that 
                such confidential information shall remain the exclusive property of the company.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will also keep us duly informed if you are bound by any confidentiality agreement with your previous 
                employers, in which case you shall keep us indemnified against any breach thereof by you.
              </Typography>

              {/* Conflict of Interest */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Conflict of Interest:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You shall, during your service with us, devote your whole time and attention to the Company's business 
                entrusted to you. While in employment with the company, you shall not, under any circumstances, 
                engage yourself directly or indirectly in any assignment/business, which may in any way, be in conflict to 
                the business interest of the company, or associate with any firm or persons, either full time or part-time, 
                as advisor, director, partner, whether paid or not for your services, without the prior written permission of 
                the company.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Further, you shall declare any such assignments that you are currently engaged with and seek approval 
                of the management on the same. Also, you shall seek the approval of the management for taking up or 
                accepting any new assignment that may be viewed as competition to the business of Codervalue
              </Typography>

              {/* Page Break Simulation */}
              <Box sx={{ borderTop: '1px solid #ddd', pt: 3, mt: 3 }}>
              </Box>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                Solutions Pvt. Ltd. Any action to the contrary would render your service liable for disciplinary action 
                including termination of services.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You agree that during your employment you will always act in the best interests of Codervalue Solutions 
                Pvt. Ltd. to avoid any actual or potential conflict of interest that may influence you in the performance of 
                your job.
              </Typography>

              {/* Non-Compete */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Non-Compete:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You agree that you will under no circumstances during your employment with Codervalue Solutions Pvt. 
                Ltd. and for a period of one (1) year following the termination of your employment with Codervalue 
                Solutions Pvt. Ltd. for any reason whatsoever, without the express written consent of the Director of 
                Codervalue Solutions Pvt. Ltd., join any other organisation having similar interests or business activities 
                which are competitive with Codervalue Solutions Pvt. Ltd. or in a manner as would affect our business 
                interest whether by way of your taking up employment, advisor-ship or retainer-ship of any manner 
                whether for consideration or otherwise or be connected directly or indirectly with any business wherein 
                information made available to you by us during the course of your employment or acquired by you 
                arising out of your having access to the data shall be utilised or used in any manner whatsoever.
              </Typography>

              {/* Non-Solicitation */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Non-Solicitation:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You agree that during your employment and for a period of {offerData.nonSolicitationPeriod} years following the termination of your 
                employment for any reason, you will not directly or indirectly solicit any other employee to leave the 
                services of Codervalue Solutions Pvt. Ltd.
              </Typography>

              {/* Retirement */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Retirement:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You will retire in the normal course from the services of the Company on attaining the age of 
                superannuation, that is on the day following your {offerData.retirementAge}th birthday. We welcome you to Codervalue 
                Solutions Pvt. Ltd. by wishing you all the very best in your new assignment and hope that your period of 
                service with us will be long, pleasant, and of mutual benefit.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                We are certain that you will find this opportunity challenging and satisfying.
              </Typography>

              {/* Signature Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="body1" paragraph>
                  Sincerely,
                </Typography>
                <Typography variant="body1" paragraph>
                  For, Codervalue Solutions Pvt. Ltd.
                </Typography>
                <Typography variant="body1" sx={{ mt: 6 }}>
                  HR Authorised Signatory
                </Typography>
              </Box>

              {/* Page Break Simulation */}
              <Box sx={{ borderTop: '1px solid #ddd', pt: 3, mt: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {offerData.companyName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {offerData.companyAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    CIN Number: {offerData.cinNumber}
                  </Typography>
                </Box>
              </Box>

              {/* Acceptance Section */}
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Acceptance:
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                You are requested to signify your acceptance of this offer by signing and returning to us the duplicate 
                copy of this letter. I have read and clearly understood all the terms and conditions of this offer and I 
                agree to abide by them.
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Name: _____________________________
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Signature: ______________________________
                </Typography>
                <Typography variant="body1">
                  Date: _____________________________
                </Typography>
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)} variant="outlined">
              Close
            </Button>
            <Button 
              onClick={() => window.print()} 
              variant="contained"
              startIcon={<PreviewIcon />}
            >
              Print/Save PDF
            </Button>
          </DialogActions>
        </Dialog>

        {/* Email Preview Dialog */}
        <Dialog open={emailPreviewOpen} onClose={() => setEmailPreviewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon />
              Email Preview
            </Box>
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', borderBottom: '2px solid #2e7d32', pb: 1 }}>
                🎉 Congratulations!
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#666', mb: 3 }}>
                You have received a job offer from {offerData.companyName}
              </Typography>
              
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Dear {candidateInfo.employeeName},
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '18px', color: '#2e7d32', fontWeight: 'bold' }}>
                  We are delighted to extend a formal offer of employment for the position of {offerData.position} at {offerData.companyName}!
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Your skills, experience, and enthusiasm make you an excellent fit for our {offerData.department} team.
                </Typography>
              </Box>
              
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 2, borderLeft: '4px solid #2e7d32' }}>
                <Typography variant="h6" gutterBottom>📋 Employment Offer Details</Typography>
                <Typography variant="body2"><strong>Position Title:</strong> {offerData.position}</Typography>
                <Typography variant="body2"><strong>Department:</strong> {offerData.department}</Typography>
                <Typography variant="body2"><strong>Company:</strong> {offerData.companyName}</Typography>
                <Typography variant="body2"><strong>Reference Number:</strong> HR/OL/{moment().format('YYYY')}/{candidateInfo.employeeName?.replace(/\s+/g, '').toUpperCase() || 'CANDIDATE'}</Typography>
              </Box>
              
              <Box sx={{ bgcolor: '#e8f5e8', p: 3, borderRadius: 2, mb: 2, border: '1px solid #c3e6cb' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>🔗 Review Your Offer Letter</Typography>
                <Typography variant="body2" paragraph>
                  Please click the link below to review your comprehensive offer letter with all terms, conditions, and benefits:
                </Typography>
                
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                  >
                    View Offer Letter & Respond
                  </Button>
                </Box>
                
                <Typography variant="body2"><strong>Your Reference ID:</strong> {candidateInfo.employeeId || 'CANDIDATE_ID'}</Typography>
              </Box>

              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 2, borderLeft: '4px solid #1976d2' }}>
                <Typography variant="h6" gutterBottom>⏰ Important Next Steps:</Typography>
                <Box component="ol" sx={{ pl: 2, mb: 0 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Review Thoroughly:</strong> Click the secure link above to access your comprehensive offer letter
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Digital Response:</strong> Accept or decline the offer directly through our secure candidate portal
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Response Timeline:</strong> This offer is time-sensitive - please respond within the validity period
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Background Verification:</strong> Upon acceptance, we will initiate the verification process
                  </Typography>
                  <Typography component="li" variant="body2">
                    <strong>Support Available:</strong> Our HR team is available to clarify any questions
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#fff3cd', border: '1px solid #ffc107', p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>📞 Need Assistance?</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>📧 Email:</strong> hr@{(offerData.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>⚡ Response Time:</strong> Within 24 hours during business days
                </Typography>
                <Typography variant="body2">
                  <strong>🕐 Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', bgcolor: '#f8f9fa', p: 3, borderRadius: 2, border: '2px solid #2e7d32' }}>
                <Typography variant="h6" sx={{ color: '#2e7d32', mb: 1 }}>🎉 Welcome to Your Future!</Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  We're thrilled about the possibility of you joining our team and contributing to our continued success.
                </Typography>
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                  This offer is confidential and intended solely for {candidateInfo.employeeName}.<br />
                  © 2024 {offerData.companyName}. All rights reserved.
                </Typography>
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailPreviewOpen(false)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={sendConfirmOpen} onClose={() => setSendConfirmOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Send Offer Letter</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to send this offer letter to <strong>{candidateInfo.employeeName}</strong> 
              at <strong>{candidateInfo.email}</strong>. This action cannot be undone.
            </Alert>
            
            <Typography variant="body1" gutterBottom>
              The candidate will receive an email with a link to view and respond to the offer letter.
            </Typography>

            <FormControlLabel
              control={<Checkbox />}
              label="I have reviewed all details and confirm they are correct"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendConfirmOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button
              onClick={sendOfferLetter}
              variant="contained"
              color="success"
              disabled={sending}
              startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
            >
              {sending ? 'Sending...' : 'Send Offer Letter'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </LocalizationProvider>
  );
};

export default OfferLetterEditor;
