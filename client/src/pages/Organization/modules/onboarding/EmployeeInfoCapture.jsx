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
  Tabs,
  Tab,
  Paper,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormGroup,
  RadioGroup,
  Radio,
  FormLabel,
  Badge
} from '@mui/material';
// Badge component imported above for tab navigation (fixed naming conflict + DocumentIcon added)
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  AccountBalance as BankIcon,
  Security as SecurityIcon,
  ContactEmergency as ContactEmergencyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as FamilyIcon,
  Verified as VerifiedIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  AccountBox as AccountBoxIcon,
  Fingerprint as FingerprintIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const EmployeeInfoCapture = ({ onboarding, setOnboarding, onSave, onCancel, loading }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedSections, setCompletedSections] = useState({});
  const [managers, setManagers] = useState([]);

  const tabs = [
    { label: 'Basic Info', icon: <PersonIcon />, id: 'basic' },
    { label: 'Contact', icon: <ContactEmergencyIcon />, id: 'contact' },
    { label: 'Address', icon: <HomeIcon />, id: 'address' },
    { label: 'Job Details', icon: <WorkIcon />, id: 'job' },
    { label: 'Education', icon: <SchoolIcon />, id: 'education' },
    { label: 'Experience', icon: <BusinessIcon />, id: 'experience' },
    { label: 'Bank Details', icon: <BankIcon />, id: 'bank' },
    { label: 'Documents', icon: <SecurityIcon />, id: 'documents' }
  ];

  const relationshipOptions = [
    'Father', 'Mother', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Guardian', 'Other'
  ];

  const degreeOptions = [
    'High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional Certification', 'Other'
  ];

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' }
  ];

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Legal', 'Admin'
  ];

  useEffect(() => {
    fetchManagers();
    validateCurrentTab();
  }, [activeTab, onboarding]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/onboarding/managers');
      setManagers(response.data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const validateCurrentTab = () => {
    const errors = {};
    
    switch (activeTab) {
      case 0: // Basic Info
        if (!onboarding.employeeName?.trim()) errors.employeeName = 'Name is required';
        if (!onboarding.email?.trim()) errors.email = 'Email is required';
        if (!onboarding.phone?.trim()) errors.phone = 'Phone is required';
        if (!onboarding.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        break;
      case 1: // Contact
        if (!onboarding.emergencyContacts?.[0]?.name?.trim()) {
          errors.emergencyContactName = 'Emergency contact name is required';
        }
        if (!onboarding.emergencyContacts?.[0]?.phone?.trim()) {
          errors.emergencyContactPhone = 'Emergency contact phone is required';
        }
        break;
      case 2: // Address
        if (!onboarding.currentAddress?.street?.trim()) errors.currentStreet = 'Street address is required';
        if (!onboarding.currentAddress?.city?.trim()) errors.currentCity = 'City is required';
        if (!onboarding.currentAddress?.state?.trim()) errors.currentState = 'State is required';
        if (!onboarding.currentAddress?.pincode?.trim()) errors.currentPincode = 'Pincode is required';
        break;
      case 3: // Job Details
        if (!onboarding.department?.trim()) errors.department = 'Department is required';
        if (!onboarding.position?.trim()) errors.position = 'Position is required';
        if (!onboarding.startDate) errors.startDate = 'Start date is required';
        break;
      case 6: // Bank Details
        if (!onboarding.bankDetails?.accountNumber?.trim()) {
          errors.accountNumber = 'Account number is required';
        }
        if (!onboarding.bankDetails?.bankName?.trim()) errors.bankName = 'Bank name is required';
        if (!onboarding.bankDetails?.ifscCode?.trim()) errors.ifscCode = 'IFSC code is required';
        break;
    }

    setValidationErrors(errors);
    
    // Update completed sections
    const isCompleted = Object.keys(errors).length === 0;
    setCompletedSections(prev => ({
      ...prev,
      [activeTab]: isCompleted
    }));

    return isCompleted;
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setOnboarding(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setOnboarding(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, index, subField, value) => {
    setOnboarding(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setOnboarding(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setOnboarding(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNextTab = () => {
    if (validateCurrentTab()) {
      setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
    } else {
      toast.error('Please fill all required fields before proceeding');
    }
  };

  const handlePreviousTab = () => {
    setActiveTab(prev => Math.max(prev - 1, 0));
  };

  const calculateProgress = () => {
    const completedCount = Object.values(completedSections).filter(Boolean).length;
    return Math.round((completedCount / tabs.length) * 100);
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Full Name"
          required
          value={onboarding.employeeName || ''}
          onChange={(e) => handleInputChange('employeeName', e.target.value)}
          error={!!validationErrors.employeeName}
          helperText={validationErrors.employeeName}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          required
          value={onboarding.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          required
          value={onboarding.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={!!validationErrors.phone}
          helperText={validationErrors.phone}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Alternate Phone"
          value={onboarding.alternatePhone || ''}
          onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Date of Birth"
          value={onboarding.dateOfBirth}
          onChange={(date) => handleInputChange('dateOfBirth', date)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              fullWidth 
              required
              error={!!validationErrors.dateOfBirth}
              helperText={validationErrors.dateOfBirth}
            />
          )}
          maxDate={moment().subtract(18, 'years')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={onboarding.gender || ''}
            label="Gender"
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Marital Status</InputLabel>
          <Select
            value={onboarding.maritalStatus || ''}
            label="Marital Status"
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
          >
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="married">Married</MenuItem>
            <MenuItem value="divorced">Divorced</MenuItem>
            <MenuItem value="widowed">Widowed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nationality"
          value={onboarding.nationality || 'Indian'}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderContactInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Emergency Contact Information
      </Typography>
      {onboarding.emergencyContacts?.map((contact, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Emergency Contact {index + 1}
              </Typography>
              {onboarding.emergencyContacts.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeArrayItem('emergencyContacts', index)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  required={index === 0}
                  value={contact.name || ''}
                  onChange={(e) => handleArrayChange('emergencyContacts', index, 'name', e.target.value)}
                  error={index === 0 && !!validationErrors.emergencyContactName}
                  helperText={index === 0 ? validationErrors.emergencyContactName : ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Relationship</InputLabel>
                  <Select
                    value={contact.relationship || ''}
                    label="Relationship"
                    onChange={(e) => handleArrayChange('emergencyContacts', index, 'relationship', e.target.value)}
                  >
                    {relationshipOptions.map(option => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  required={index === 0}
                  value={contact.phone || ''}
                  onChange={(e) => handleArrayChange('emergencyContacts', index, 'phone', e.target.value)}
                  error={index === 0 && !!validationErrors.emergencyContactPhone}
                  helperText={index === 0 ? validationErrors.emergencyContactPhone : ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={contact.email || ''}
                  onChange={(e) => handleArrayChange('emergencyContacts', index, 'email', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addArrayItem('emergencyContacts', { name: '', relationship: '', phone: '', email: '' })}
        sx={{ mt: 1 }}
      >
        Add Another Emergency Contact
      </Button>
    </Box>
  );

  const renderAddressInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Address
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            required
            multiline
            rows={2}
            value={onboarding.currentAddress?.street || ''}
            onChange={(e) => handleInputChange('street', e.target.value, 'currentAddress')}
            error={!!validationErrors.currentStreet}
            helperText={validationErrors.currentStreet}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            required
            value={onboarding.currentAddress?.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value, 'currentAddress')}
            error={!!validationErrors.currentCity}
            helperText={validationErrors.currentCity}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="State"
            required
            value={onboarding.currentAddress?.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value, 'currentAddress')}
            error={!!validationErrors.currentState}
            helperText={validationErrors.currentState}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Country"
            value={onboarding.currentAddress?.country || 'India'}
            onChange={(e) => handleInputChange('country', e.target.value, 'currentAddress')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Pincode"
            required
            value={onboarding.currentAddress?.pincode || ''}
            onChange={(e) => handleInputChange('pincode', e.target.value, 'currentAddress')}
            error={!!validationErrors.currentPincode}
            helperText={validationErrors.currentPincode}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Permanent Address
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={onboarding.permanentAddress?.sameAsCurrent || false}
            onChange={(e) => {
              const sameAsCurrent = e.target.checked;
              setOnboarding(prev => ({
                ...prev,
                permanentAddress: sameAsCurrent 
                  ? { ...prev.currentAddress, sameAsCurrent: true }
                  : { ...prev.permanentAddress, sameAsCurrent: false }
              }));
            }}
          />
        }
        label="Same as current address"
        sx={{ mb: 2 }}
      />

      {!onboarding.permanentAddress?.sameAsCurrent && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              multiline
              rows={2}
              value={onboarding.permanentAddress?.street || ''}
              onChange={(e) => handleInputChange('street', e.target.value, 'permanentAddress')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={onboarding.permanentAddress?.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value, 'permanentAddress')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State"
              value={onboarding.permanentAddress?.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value, 'permanentAddress')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              value={onboarding.permanentAddress?.country || 'India'}
              onChange={(e) => handleInputChange('country', e.target.value, 'permanentAddress')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pincode"
              value={onboarding.permanentAddress?.pincode || ''}
              onChange={(e) => handleInputChange('pincode', e.target.value, 'permanentAddress')}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderJobDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Department</InputLabel>
          <Select
            value={onboarding.department || ''}
            label="Department"
            onChange={(e) => handleInputChange('department', e.target.value)}
            error={!!validationErrors.department}
          >
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {validationErrors.department && (
          <Typography variant="caption" color="error">
            {validationErrors.department}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Position/Job Title"
          required
          value={onboarding.position || ''}
          onChange={(e) => handleInputChange('position', e.target.value)}
          error={!!validationErrors.position}
          helperText={validationErrors.position}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Start Date"
          value={onboarding.startDate}
          onChange={(date) => handleInputChange('startDate', date)}
          renderInput={(params) => (
            <TextField 
              {...params} 
              fullWidth 
              required
              error={!!validationErrors.startDate}
              helperText={validationErrors.startDate}
            />
          )}
          minDate={moment()}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Employment Type</InputLabel>
          <Select
            value={onboarding.employmentType || 'full_time'}
            label="Employment Type"
            onChange={(e) => handleInputChange('employmentType', e.target.value)}
          >
            {employmentTypes.map(type => (
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
          label="Annual Salary (₹)"
          type="number"
          value={onboarding.salary || ''}
          onChange={(e) => handleInputChange('salary', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Probation Period (Months)"
          type="number"
          value={onboarding.probationPeriod || 6}
          onChange={(e) => handleInputChange('probationPeriod', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Reporting Manager</InputLabel>
          <Select
            value={onboarding.reportingManager || ''}
            label="Reporting Manager"
            onChange={(e) => handleInputChange('reportingManager', e.target.value)}
          >
            {managers.map(manager => (
              <MenuItem key={manager._id} value={manager._id}>
                {manager.displayText}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Work Location"
          value={onboarding.workLocation || ''}
          onChange={(e) => handleInputChange('workLocation', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderEducation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Educational Background
      </Typography>
      {onboarding.education?.map((edu, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Education {index + 1}
              </Typography>
              {onboarding.education.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeArrayItem('education', index)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Degree</InputLabel>
                  <Select
                    value={edu.degree || ''}
                    label="Degree"
                    onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                  >
                    {degreeOptions.map(degree => (
                      <MenuItem key={degree} value={degree}>{degree}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={edu.institution || ''}
                  onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Year of Passing"
                  type="number"
                  value={edu.yearOfPassing || ''}
                  onChange={(e) => handleArrayChange('education', index, 'yearOfPassing', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Percentage/CGPA"
                  value={edu.percentage || ''}
                  onChange={(e) => handleArrayChange('education', index, 'percentage', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={edu.specialization || ''}
                  onChange={(e) => handleArrayChange('education', index, 'specialization', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addArrayItem('education', { 
          degree: '', 
          institution: '', 
          yearOfPassing: '', 
          percentage: '', 
          specialization: '' 
        })}
        sx={{ mt: 1 }}
      >
        Add Education
      </Button>
    </Box>
  );

  const renderExperience = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Work Experience
      </Typography>
      {onboarding.experience?.map((exp, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">
                Experience {index + 1}
              </Typography>
              {onboarding.experience.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => removeArrayItem('experience', index)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={exp.company || ''}
                  onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position"
                  value={exp.position || ''}
                  onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={exp.startDate}
                  onChange={(date) => handleArrayChange('experience', index, 'startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={exp.endDate}
                  onChange={(date) => handleArrayChange('experience', index, 'endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Salary (₹)"
                  type="number"
                  value={exp.salary || ''}
                  onChange={(e) => handleArrayChange('experience', index, 'salary', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Leaving"
                  multiline
                  rows={2}
                  value={exp.reasonForLeaving || ''}
                  onChange={(e) => handleArrayChange('experience', index, 'reasonForLeaving', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addArrayItem('experience', { 
          company: '', 
          position: '', 
          startDate: null, 
          endDate: null, 
          salary: '', 
          reasonForLeaving: '' 
        })}
        sx={{ mt: 1 }}
      >
        Add Experience
      </Button>
    </Box>
  );

  const renderBankDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Bank Account Information
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Account Number"
          required
          value={onboarding.bankDetails?.accountNumber || ''}
          onChange={(e) => handleInputChange('accountNumber', e.target.value, 'bankDetails')}
          error={!!validationErrors.accountNumber}
          helperText={validationErrors.accountNumber}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Account Holder Name"
          value={onboarding.bankDetails?.accountHolderName || ''}
          onChange={(e) => handleInputChange('accountHolderName', e.target.value, 'bankDetails')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Bank Name"
          required
          value={onboarding.bankDetails?.bankName || ''}
          onChange={(e) => handleInputChange('bankName', e.target.value, 'bankDetails')}
          error={!!validationErrors.bankName}
          helperText={validationErrors.bankName}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Branch"
          value={onboarding.bankDetails?.branch || ''}
          onChange={(e) => handleInputChange('branch', e.target.value, 'bankDetails')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="IFSC Code"
          required
          value={onboarding.bankDetails?.ifscCode || ''}
          onChange={(e) => handleInputChange('ifscCode', e.target.value, 'bankDetails')}
          error={!!validationErrors.ifscCode}
          helperText={validationErrors.ifscCode}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Government IDs
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="PAN Number"
          value={onboarding.panNumber || ''}
          onChange={(e) => handleInputChange('panNumber', e.target.value)}
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Aadhar Number"
          value={onboarding.aadharNumber || ''}
          onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Passport Number"
          value={onboarding.passportNumber || ''}
          onChange={(e) => handleInputChange('passportNumber', e.target.value)}
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />
      </Grid>
    </Grid>
  );

  const renderDocuments = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Document Requirements Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The following documents will be requested from the candidate after onboarding creation
      </Typography>

      <Grid container spacing={2}>
        {[
          { name: 'Aadhar Card', required: true, category: 'Identity' },
          { name: 'PAN Card', required: true, category: 'Identity' },
          { name: 'Passport Photo', required: true, category: 'Personal' },
          { name: 'Resume/CV', required: true, category: 'Professional' },
          { name: 'Educational Certificates', required: true, category: 'Education' },
          { name: 'Experience Letters', required: false, category: 'Professional' },
          { name: 'Bank Account Proof', required: true, category: 'Financial' },
          { name: 'Address Proof', required: true, category: 'Personal' }
        ].map((doc, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: doc.required ? 'primary.main' : 'grey.500', width: 32, height: 32 }}>
                    <DocumentIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="600">
                      {doc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.category}
                    </Typography>
                  </Box>
                  <Chip
                    label={doc.required ? "Required" : "Optional"}
                    color={doc.required ? "primary" : "default"}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        Documents will be collected through a secure portal link sent to the candidate's email address.
      </Alert>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderBasicInfo();
      case 1: return renderContactInfo();
      case 2: return renderAddressInfo();
      case 3: return renderJobDetails();
      case 4: return renderEducation();
      case 5: return renderExperience();
      case 6: return renderBankDetails();
      case 7: return renderDocuments();
      default: return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          👤 Employee Information Capture
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive employee profile creation with step-by-step data collection
        </Typography>

        {/* Progress Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Form Completion Progress
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {Object.values(completedSections).filter(Boolean).length} of {tabs.length} sections completed
            </Typography>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                icon={
                  <Badge
                    color="success"
                    variant="dot"
                    invisible={!completedSections[index]}
                  >
                    {tab.icon}
                  </Badge>
                }
                label={tab.label}
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper sx={{ p: 3, mb: 3 }}>
          {renderTabContent()}
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePreviousTab}
              disabled={activeTab === 0}
            >
              Previous
            </Button>
            
            {activeTab < tabs.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNextTab}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={onSave}
                disabled={loading || calculateProgress() < 50}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Creating...' : 'Create Onboarding'}
              </Button>
            )}
          </Box>
        </Box>

        {loading && (
          <LinearProgress sx={{ mt: 2 }} />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeInfoCapture;
