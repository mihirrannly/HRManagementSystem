import React, { useState, Fragment } from 'react';
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
  Container,
  Avatar,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateOnboardingScreen = ({ onBack, onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newOnboarding, setNewOnboarding] = useState({
    // Basic Information
    employeeName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address Information
    currentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    permanentAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      sameAsCurrent: false
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    
    // Job Details
    department: '',
    position: '',
    manager: '',
    startDate: '',
    employmentType: 'full_time',
    workLocation: '',
    salary: '',
    
    // Education
    education: [{
      degree: '',
      institution: '',
      year: '',
      percentage: ''
    }],
    
    // Experience
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    
    // Bank Details
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: ''
    },
    
    // Documents (for file uploads, not sent to backend in create)
    documents: {
      resume: null,
      idProof: null,
      addressProof: null,
      educationCertificates: null,
      experienceCertificates: null,
      photo: null
    }
  });
  const [createLoading, setCreateLoading] = useState(false);

  const validateRequiredFields = () => {
    const requiredFields = [
      { field: 'employeeName', label: 'Employee Name' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone' },
      { field: 'department', label: 'Department' },
      { field: 'position', label: 'Position' },
      { field: 'startDate', label: 'Start Date' }
    ];

    const missingFields = [];
    
    requiredFields.forEach(({ field, label }) => {
      if (!newOnboarding[field] || (field === 'startDate' && !newOnboarding[field])) {
        missingFields.push(label);
      }
    });

    return missingFields;
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      console.log('Creating onboarding with data:', newOnboarding);
      
      // Validate required fields
      const missingFields = validateRequiredFields();
      if (missingFields.length > 0) {
        toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      console.log('Auth token exists:', !!token);
      
      // Prepare the data for submission (exclude documents object)
      const { documents, ...onboardingData } = newOnboarding;
      const submissionData = {
        ...onboardingData,
        startDate: newOnboarding.startDate ? new Date(newOnboarding.startDate).toISOString() : null
      };
      
      const response = await axios.post('onboarding/comprehensive', submissionData);
      console.log('Onboarding creation response:', response.data);
      
      toast.success('Comprehensive onboarding created successfully!');
      const createdOnboarding = response.data.onboarding || response.data;
      console.log('Calling onSuccess with:', createdOnboarding);
      onSuccess(createdOnboarding);
    } catch (error) {
      console.error('Onboarding creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 'Failed to create onboarding';
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const updateNestedField = (path, value) => {
    const keys = path.split('.');
    setNewOnboarding(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addArrayItem = (arrayPath, defaultItem) => {
    setNewOnboarding(prev => ({
      ...prev,
      [arrayPath]: [...prev[arrayPath], { ...defaultItem }]
    }));
  };

  const removeArrayItem = (arrayPath, index) => {
    setNewOnboarding(prev => ({
      ...prev,
      [arrayPath]: prev[arrayPath].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (arrayPath, index, field, value) => {
    setNewOnboarding(prev => ({
      ...prev,
      [arrayPath]: prev[arrayPath].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const tabContent = [
    // Basic Information Tab
    <Grid container spacing={2} key="basic">
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Full Name *"
          value={newOnboarding.employeeName}
          onChange={(e) => setNewOnboarding({...newOnboarding, employeeName: e.target.value})}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email Address *"
          type="email"
          value={newOnboarding.email}
          onChange={(e) => setNewOnboarding({...newOnboarding, email: e.target.value})}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number *"
          value={newOnboarding.phone}
          onChange={(e) => setNewOnboarding({...newOnboarding, phone: e.target.value})}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Gender</InputLabel>
          <Select
            value={newOnboarding.gender}
            onChange={(e) => setNewOnboarding({...newOnboarding, gender: e.target.value})}
            label="Gender"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>,

    // Address Information Tab
    <Grid container spacing={3} key="address">
      {/* Current Address Section */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
          Current Address
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          value={newOnboarding.currentAddress.street}
          onChange={(e) => updateNestedField('currentAddress.street', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={newOnboarding.currentAddress.city}
          onChange={(e) => updateNestedField('currentAddress.city', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State"
          value={newOnboarding.currentAddress.state}
          onChange={(e) => updateNestedField('currentAddress.state', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="PIN Code"
          value={newOnboarding.currentAddress.pincode}
          onChange={(e) => updateNestedField('currentAddress.pincode', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={newOnboarding.currentAddress.country}
          onChange={(e) => updateNestedField('currentAddress.country', e.target.value)}
          size="small"
        />
      </Grid>

      {/* Permanent Address Section */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
          Permanent Address
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={newOnboarding.permanentAddress.sameAsCurrent}
              onChange={(e) => {
                const isChecked = e.target.checked;
                if (isChecked) {
                  // Copy current address to permanent address
                  setNewOnboarding(prev => ({
                    ...prev,
                    permanentAddress: {
                      ...prev.currentAddress,
                      sameAsCurrent: true
                    }
                  }));
                } else {
                  // Clear permanent address and uncheck
                  setNewOnboarding(prev => ({
                    ...prev,
                    permanentAddress: {
                      street: '',
                      city: '',
                      state: '',
                      pincode: '',
                      country: 'India',
                      sameAsCurrent: false
                    }
                  }));
                }
              }}
            />
          }
          label="Same as current address"
          sx={{ mb: 2 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          value={newOnboarding.permanentAddress.street}
          onChange={(e) => updateNestedField('permanentAddress.street', e.target.value)}
          size="small"
          disabled={newOnboarding.permanentAddress.sameAsCurrent}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={newOnboarding.permanentAddress.city}
          onChange={(e) => updateNestedField('permanentAddress.city', e.target.value)}
          size="small"
          disabled={newOnboarding.permanentAddress.sameAsCurrent}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State"
          value={newOnboarding.permanentAddress.state}
          onChange={(e) => updateNestedField('permanentAddress.state', e.target.value)}
          size="small"
          disabled={newOnboarding.permanentAddress.sameAsCurrent}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="PIN Code"
          value={newOnboarding.permanentAddress.pincode}
          onChange={(e) => updateNestedField('permanentAddress.pincode', e.target.value)}
          size="small"
          disabled={newOnboarding.permanentAddress.sameAsCurrent}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={newOnboarding.permanentAddress.country}
          onChange={(e) => updateNestedField('permanentAddress.country', e.target.value)}
          size="small"
          disabled={newOnboarding.permanentAddress.sameAsCurrent}
        />
      </Grid>

      {/* Emergency Contact Section */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
          Emergency Contact
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Name"
          value={newOnboarding.emergencyContact.name}
          onChange={(e) => updateNestedField('emergencyContact.name', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Relationship"
          value={newOnboarding.emergencyContact.relationship}
          onChange={(e) => updateNestedField('emergencyContact.relationship', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Phone"
          value={newOnboarding.emergencyContact.phone}
          onChange={(e) => updateNestedField('emergencyContact.phone', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Email"
          value={newOnboarding.emergencyContact.email}
          onChange={(e) => updateNestedField('emergencyContact.email', e.target.value)}
          size="small"
        />
      </Grid>
    </Grid>,

    // Job Details Tab
    <Grid container spacing={2} key="job">
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Department *</InputLabel>
          <Select
            value={newOnboarding.department}
            onChange={(e) => setNewOnboarding({...newOnboarding, department: e.target.value})}
            label="Department *"
          >
            <MenuItem value="Engineering">Engineering</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
            <MenuItem value="HR">Human Resources</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="Operations">Operations</MenuItem>
            <MenuItem value="Customer Support">Customer Support</MenuItem>
            <MenuItem value="Legal">Legal</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Position *"
          value={newOnboarding.position}
          onChange={(e) => setNewOnboarding({...newOnboarding, position: e.target.value})}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Reporting Manager"
          value={newOnboarding.manager}
          onChange={(e) => setNewOnboarding({...newOnboarding, manager: e.target.value})}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Employment Type</InputLabel>
          <Select
            value={newOnboarding.employmentType}
            onChange={(e) => setNewOnboarding({...newOnboarding, employmentType: e.target.value})}
            label="Employment Type"
          >
            <MenuItem value="full_time">Full-time</MenuItem>
            <MenuItem value="part_time">Part-time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="intern">Intern</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Work Location</InputLabel>
          <Select
            value={newOnboarding.workLocation}
            onChange={(e) => setNewOnboarding({...newOnboarding, workLocation: e.target.value})}
            label="Work Location"
          >
            <MenuItem value="Office">Office</MenuItem>
            <MenuItem value="Remote">Remote</MenuItem>
            <MenuItem value="Hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Annual Salary"
          value={newOnboarding.salary}
          onChange={(e) => setNewOnboarding({...newOnboarding, salary: e.target.value})}
          size="small"
          InputProps={{
            startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Start Date *"
          type="date"
          value={newOnboarding.startDate}
          onChange={(e) => setNewOnboarding({...newOnboarding, startDate: e.target.value})}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>,

    // Education Tab
    <Grid container spacing={2} key="education">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">
            Educational Background
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', percentage: '' })}
          >
            Add Education
          </Button>
        </Box>
      </Grid>
      {newOnboarding.education.map((edu, index) => (
        <Fragment key={index}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight="600">
                Education {index + 1}
              </Typography>
              {newOnboarding.education.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeArrayItem('education', index)}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Degree/Qualification"
              value={edu.degree}
              onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Institution/University"
              value={edu.institution}
              onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Year of Completion"
              value={edu.year}
              onChange={(e) => updateArrayItem('education', index, 'year', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Percentage/CGPA"
              value={edu.percentage}
              onChange={(e) => updateArrayItem('education', index, 'percentage', e.target.value)}
              size="small"
            />
          </Grid>
        </Fragment>
      ))}
    </Grid>,

    // Experience Tab
    <Grid container spacing={2} key="experience">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">
            Work Experience
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', description: '' })}
          >
            Add Experience
          </Button>
        </Box>
      </Grid>
      {newOnboarding.experience.map((exp, index) => (
        <Fragment key={index}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight="600">
                Experience {index + 1}
              </Typography>
              {newOnboarding.experience.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeArrayItem('experience', index)}
                  color="error"
                >
                  <RemoveIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={exp.company}
              onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Position/Role"
              value={exp.position}
              onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="month"
              value={exp.startDate || ''}
              onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="month"
              value={exp.endDate || ''}
              onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              helperText="Leave blank if current job"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Description"
              multiline
              rows={3}
              value={exp.description}
              onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)}
              size="small"
            />
          </Grid>
        </Fragment>
      ))}
    </Grid>,

    // Bank Details Tab
    <Grid container spacing={2} key="bank">
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Bank Account Information
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Account Holder Name"
          value={newOnboarding.bankDetails.accountHolderName}
          onChange={(e) => updateNestedField('bankDetails.accountHolderName', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Account Number"
          value={newOnboarding.bankDetails.accountNumber}
          onChange={(e) => updateNestedField('bankDetails.accountNumber', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Bank Name"
          value={newOnboarding.bankDetails.bankName}
          onChange={(e) => updateNestedField('bankDetails.bankName', e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="IFSC Code"
          value={newOnboarding.bankDetails.ifscCode}
          onChange={(e) => updateNestedField('bankDetails.ifscCode', e.target.value)}
          size="small"
        />
      </Grid>
    </Grid>,

    // Documents Tab
    <Grid container spacing={2} key="documents">
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Document Upload
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Upload documents mentioned in education/experience details plus essential government documents
        </Typography>
      </Grid>
      
      {[
        // Government Documents (Required)
        { key: 'pan_card', label: 'PAN Card', required: true, category: 'government' },
        { key: 'aadhaar_card', label: 'Aadhaar Card', required: true, category: 'government' },
        { key: 'bank_details', label: 'Bank Details (Cheque/Passbook)', required: true, category: 'government' },
        { key: 'passport_photo', label: 'Passport Size Photo', required: true, category: 'government' },
        
        // Education Documents (Based on mentioned qualifications)
        { key: 'educational_certificates', label: 'Educational Certificates', required: true, category: 'education' },
        
        // Experience Documents (Based on mentioned experience)
        { key: 'experience_letters', label: 'Experience Letters', required: false, category: 'experience' },
        { key: 'relieving_certificate', label: 'Relieving Certificate', required: true, category: 'experience' },
        { key: 'previous_org_certificates', label: 'Previous Organization Certificates', required: false, category: 'experience' },
        
        // Additional Documents (Optional)
        { key: 'salary_slips', label: 'Salary Slips (Last 3 months)', required: false, category: 'additional' },
        { key: 'bank_statement', label: 'Bank Statement (Last 3 months)', required: false, category: 'additional' },
        { key: 'resume', label: 'Resume/CV', required: true, category: 'additional' }
      ].map((doc) => (
        <Grid item xs={12} sm={6} key={doc.key}>
          <Card variant="outlined" sx={{ p: 2, height: '120px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
                <DescriptionIcon />
              </Avatar>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                {doc.label} {doc.required && '*'}
              </Typography>
              <Button
                size="small"
                startIcon={<CloudUploadIcon />}
                variant="outlined"
                component="label"
              >
                Upload
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewOnboarding(prev => ({
                        ...prev,
                        documents: {
                          ...prev.documents,
                          [doc.key]: file
                        }
                      }));
                    }
                  }}
                />
              </Button>
              {newOnboarding.documents[doc.key] && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                  ✓ {newOnboarding.documents[doc.key].name}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={onBack} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="600">
              Create New Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete employee information for comprehensive onboarding
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Basic Info" />
            <Tab label="Address & Emergency" />
            <Tab label="Job Details" />
            <Tab label="Education" />
            <Tab label="Experience" />
            <Tab label="Bank Details" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabContent[activeTab]}
        </Box>

        {/* Actions */}
        <Box sx={{ p: 3, pt: 1, display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={onBack}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeTab > 0 && (
              <Button onClick={() => setActiveTab(activeTab - 1)}>
                Previous
              </Button>
            )}
            {activeTab < tabContent.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={() => setActiveTab(activeTab + 1)}
                disabled={activeTab === 0 && (!newOnboarding.employeeName || !newOnboarding.email)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                variant="contained"
                disabled={createLoading || !newOnboarding.employeeName || !newOnboarding.email}
                startIcon={createLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                {createLoading ? 'Creating...' : 'Create Onboarding'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateOnboardingScreen;
