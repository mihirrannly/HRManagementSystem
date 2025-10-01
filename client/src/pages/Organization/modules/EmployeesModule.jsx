import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Breadcrumbs,
  Link,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Zoom,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  GlobalStyles,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  CardActionArea
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
  Folder as DirectoryIcon,
  ExitToApp as LoginIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Schedule as ProbationIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  FileUpload as FileUploadIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  DeleteForever as DeleteForeverIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import Papa from 'papaparse';
import OnboardingsModuleFull from './OnboardingsModule';

// Full-Screen Employee Details View
const EmployeeFullScreenView = ({ employee, onBack, onEditProfile, onSyncEmployee }) => {
  const [activeTab, setActiveTab] = useState('ABOUT');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);

  const categories = [
    { id: 'ABOUT', label: 'ABOUT', icon: '👤' },
    { id: 'PROFILE', label: 'PROFILE', icon: '📋' },
    { id: 'JOB', label: 'JOB', icon: '💼' },
    { id: 'TIME', label: 'TIME', icon: '⏰' },
    { id: 'DOCUMENTS', label: 'DOCUMENTS', icon: '📄' },
    { id: 'ASSETS', label: 'ASSETS', icon: '🏢' },
    { id: 'FINANCES', label: 'FINANCES', icon: '💰' },
    { id: 'EXPENSES', label: 'EXPENSES', icon: '💳' },
    { id: 'PERFORMANCE', label: 'PERFORMANCE', icon: '📊' }
  ];

  const handleEditClick = () => {
    setIsEditMode(true);
    toast.info('Edit mode enabled. You can now modify employee information.');
  };

  const handleSaveChanges = async () => {
    try {
      // Here you would typically save to the server
      console.log('Saving changes:', editedEmployee);
      toast.success('Employee information updated successfully!');
      setIsEditMode(false);
      // You could call onEditProfile to refresh the data
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedEmployee(employee); // Reset to original data
    setIsEditMode(false);
    toast.info('Edit cancelled. Changes discarded.');
  };

  const handleFieldChange = (field, value, section = null) => {
    if (section) {
      setEditedEmployee(prev => {
        // Handle nested object updates (like addresses)
        if (typeof value === 'object' && value !== null) {
          return {
            ...prev,
            [section]: {
              ...prev[section],
              [field]: {
                ...(prev[section]?.[field] || {}),
                ...value
              }
            }
          };
        } else {
          return {
            ...prev,
            [section]: {
              ...prev[section],
              [field]: value
            }
          };
        }
      });
    } else {
      setEditedEmployee(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Paper sx={{ p: 2.5, mb: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <Typography sx={{ fontSize: '1.2rem' }}>←</Typography>
          </IconButton>
          <Typography variant="h5" fontWeight="600" sx={{ fontSize: '1.25rem' }}>
            Employee Profile
            {isEditMode && (
              <Chip 
                label="EDIT MODE" 
                size="small" 
                sx={{ 
                  ml: 2, 
                  bgcolor: '#fbbf24', 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar 
            src={employee.profileImage || ''}
            sx={{ 
              width: 80, 
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {!employee.profileImage && (
              <>
                {employee.personalInfo?.firstName?.charAt(0) || 'N'}
                {employee.personalInfo?.lastName?.charAt(0) || 'A'}
              </>
            )}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {!isEditMode ? (
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5, fontSize: '1.75rem' }}>
                {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                <TextField
                  size="small"
                  label="First Name"
                  value={editedEmployee.personalInfo?.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value, 'personalInfo')}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small"
                  label="Last Name"
                  value={editedEmployee.personalInfo?.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value, 'personalInfo')}
                  sx={{ minWidth: 120 }}
                />
              </Box>
            )}
            {!isEditMode ? (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.9rem' }}>
                {employee.employeeId} • {employee.employmentInfo?.designation || 'N/A'}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  {employee.employeeId} •
                </Typography>
                <TextField
                  size="small"
                  label="Designation"
                  value={editedEmployee.employmentInfo?.designation || ''}
                  onChange={(e) => handleFieldChange('designation', e.target.value, 'employmentInfo')}
                  sx={{ minWidth: 150 }}
                  variant="standard"
                />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
              {employee.employmentInfo?.department?.name || 'N/A'} • {employee.additionalInfo?.Location || 'N/A'}
            </Typography>
            <Chip
              label={employee.employmentInfo?.employmentStatus || 'Active'}
              color={employee.employmentInfo?.employmentStatus?.toLowerCase() === 'working' ? 'success' : 'primary'}
              size="small"
              sx={{ fontWeight: 500, fontSize: '0.75rem' }}
            />
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {!isEditMode ? (
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleEditClick}
                startIcon={<EditIcon />}
                sx={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    borderColor: '#2563eb',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb'
                  }
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={handleSaveChanges}
                  startIcon={<CheckIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleCancelEdit}
                  startIcon={<CloseIcon />}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626'
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            {employee.additionalInfo?.onboardingId && (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<SyncIcon />}
                color="primary"
                onClick={() => onSyncEmployee && onSyncEmployee(employee)}
                sx={{
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
              >
                Sync Data
              </Button>
            )}
            <Button variant="contained" size="small">
              Actions
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Category Navigation */}
      <Paper sx={{ mb: 2, borderRadius: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          overflowX: 'auto',
          borderBottom: '1px solid #e5e7eb',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 2 }
        }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              sx={{
                minWidth: 120,
                py: 1.5,
                px: 2,
                borderRadius: 0,
                borderBottom: activeTab === category.id ? '2px solid' : '2px solid transparent',
                borderBottomColor: activeTab === category.id ? 'primary.main' : 'transparent',
                color: activeTab === category.id ? 'primary.main' : 'text.secondary',
                fontWeight: activeTab === category.id ? 600 : 500,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
                '&:hover': {
                  bgcolor: activeTab === category.id ? 'primary.50' : 'grey.50',
                  color: activeTab === category.id ? 'primary.main' : 'text.primary'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.9rem' }}>{category.icon}</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'inherit' }}>
                  {category.label}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ px: 3, pb: 3 }}>
        {activeTab === 'ABOUT' && <AboutSection employee={employee} isEditable={isEditMode} editedEmployee={editedEmployee} onFieldChange={handleFieldChange} />}
        {activeTab === 'PROFILE' && <ProfileSection employee={employee} />}
        {activeTab === 'JOB' && <JobSection employee={employee} isEditable={isEditMode} editedEmployee={editedEmployee} onFieldChange={handleFieldChange} />}
        {activeTab === 'TIME' && <TimeSection employee={employee} />}
        {activeTab === 'DOCUMENTS' && <DocumentsSection employee={employee} />}
        {activeTab === 'ASSETS' && <AssetsSection employee={employee} />}
        {activeTab === 'FINANCES' && <FinancesSection employee={employee} />}
        {activeTab === 'EXPENSES' && <ExpensesSection employee={employee} />}
        {activeTab === 'PERFORMANCE' && <PerformanceSection employee={employee} />}
      </Box>
    </Box>
  );
};

// Section Component Template
const SectionCard = ({ icon, title, color, children }) => (
  <Paper 
    elevation={0}
    sx={{ 
      p: 3, 
      border: '1px solid #e5e7eb',
      borderRadius: 2,
      height: 'fit-content',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: 1.5, 
        bgcolor: color, 
        color: 'white',
        mr: 1.5
      }}>
        <Typography sx={{ fontSize: '0.9rem' }}>{icon}</Typography>
      </Box>
      <Typography variant="h6" fontWeight="600" color={color} sx={{ fontSize: '0.95rem' }}>
        {title}
      </Typography>
    </Box>
    <Stack spacing={2}>
      {children}
    </Stack>
  </Paper>
);

const FieldDisplay = ({ label, value, isEditable = false, onEdit, fieldKey, section = null, type = 'text' }) => {
  // Handle different value types
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    
    // If it's an object, don't render it directly
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${value.length} items` : 'No items';
      }
      return '[Object]';
    }
    
    // If it's a boolean
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // If it's a string or number
    return String(value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      {isEditable ? (
        <TextField
          fullWidth
          size="small"
          type={type}
          value={value || ''}
          onChange={(e) => onEdit && onEdit(fieldKey, e.target.value, section)}
          sx={{ 
            mt: 0.5,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.85rem',
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#e9ecef'
              },
              '&.Mui-focused': {
                backgroundColor: '#fff'
              }
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
      ) : (
        <Typography variant="body1" fontWeight="500" sx={{ mt: 0.3, fontSize: '0.85rem', lineHeight: 1.4 }}>
          {displayValue()}
        </Typography>
      )}
    </Box>
  );
};

// About Section Component
const AboutSection = ({ employee, isEditable = false, editedEmployee, onFieldChange }) => (
  <Grid container spacing={3}>
    {/* Primary Details */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="👤" title="Primary Details" color="primary.main">
        <FieldDisplay 
          label="First Name" 
          value={isEditable ? editedEmployee?.personalInfo?.firstName : employee.personalInfo?.firstName}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="firstName"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Last Name" 
          value={isEditable ? editedEmployee?.personalInfo?.lastName : employee.personalInfo?.lastName}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="lastName"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Employee ID" 
          value={employee.employeeId || 'No ID'} 
        />
        <FieldDisplay 
          label="Date of Birth" 
          value={isEditable 
            ? (editedEmployee?.personalInfo?.dateOfBirth ? moment(editedEmployee.personalInfo.dateOfBirth).format('YYYY-MM-DD') : '')
            : (employee.personalInfo?.dateOfBirth 
              ? moment(employee.personalInfo.dateOfBirth).format('DD MMM YYYY')
              : employee.additionalInfo?.['Date Of Birth'])
          }
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="dateOfBirth"
          section="personalInfo"
          type="date"
        />
        <FieldDisplay 
          label="Gender" 
          value={isEditable ? editedEmployee?.personalInfo?.gender : employee.personalInfo?.gender || employee.additionalInfo?.Gender}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="gender"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Marital Status" 
          value={isEditable ? editedEmployee?.personalInfo?.maritalStatus : employee.personalInfo?.maritalStatus || employee.additionalInfo?.['Marital Status']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="maritalStatus"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Nationality" 
          value={isEditable ? editedEmployee?.personalInfo?.nationality : employee.personalInfo?.nationality || employee.additionalInfo?.Nationality}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="nationality"
          section="personalInfo"
        />
      </SectionCard>
    </Grid>

    {/* Contact Details */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="📞" title="Contact Details" color="info.main">
        <FieldDisplay 
          label="Work Email" 
          value={isEditable ? editedEmployee?.personalInfo?.email : employee.personalInfo?.email || employee.user?.email || employee.additionalInfo?.['Work Email']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="email"
          section="personalInfo"
          type="email"
        />
        <FieldDisplay 
          label="Personal Email" 
          value={isEditable ? editedEmployee?.personalInfo?.personalEmailId : employee.additionalInfo?.['Personal Email'] || employee.contactInfo?.personalEmail}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="personalEmailId"
          section="personalInfo"
          type="email"
        />
        <FieldDisplay 
          label="Mobile Phone" 
          value={isEditable ? editedEmployee?.personalInfo?.phone : employee.personalInfo?.phone || employee.contactInfo?.phone || employee.additionalInfo?.['Mobile Phone']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="phone"
          section="personalInfo"
          type="tel"
        />
        <FieldDisplay 
          label="Alternate Phone" 
          value={isEditable ? editedEmployee?.personalInfo?.alternatePhone : employee.personalInfo?.alternatePhone || employee.additionalInfo?.['Work Phone']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="alternatePhone"
          section="personalInfo"
          type="tel"
        />
      </SectionCard>
    </Grid>

    {/* Address Information */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="🏠" title="Address Information" color="secondary.main">
        <FieldDisplay 
          label="Current Address" 
          value={isEditable 
            ? editedEmployee?.personalInfo?.currentAddress?.street 
            : (employee.additionalInfo?.current_address_line_1 || 
               employee.additionalInfo?.['Current Address Line 1'] || 
               employee.contactInfo?.address?.street || 
               employee.personalInfo?.currentAddress?.street ||
               (typeof employee.personalInfo?.currentAddress === 'string' ? employee.personalInfo?.currentAddress : null) ||
               employee.personalInfo?.address?.street)
          }
          isEditable={isEditable}
          onEdit={(field, value) => onFieldChange && onFieldChange('currentAddress', { street: value }, 'personalInfo')}
          fieldKey="street"
        />
        <FieldDisplay 
          label="Permanent Address" 
          value={isEditable 
            ? editedEmployee?.personalInfo?.permanentAddress?.street
            : (employee.additionalInfo?.permanent_address_line_1 ||
               employee.additionalInfo?.['Permanent Address Line 1'] || 
               employee.additionalInfo?.current_address_line_1 ||
               employee.additionalInfo?.['Current Address Line 1'] ||
               employee.contactInfo?.address?.street ||
               employee.personalInfo?.permanentAddress?.street ||
               (typeof employee.personalInfo?.permanentAddress === 'string' ? employee.personalInfo?.permanentAddress : null) ||
               employee.personalInfo?.address?.street)
          }
          isEditable={isEditable}
          onEdit={(field, value) => onFieldChange && onFieldChange('permanentAddress', { street: value }, 'personalInfo')}
          fieldKey="street"
        />
        <FieldDisplay 
          label="Location" 
          value={employee.additionalInfo?.Location || employee.additionalInfo?.['Location Country']} 
        />
      </SectionCard>
    </Grid>

    {/* Family Information */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="👨‍👩‍👧‍👦" title="Family Information" color="success.main">
        <FieldDisplay 
          label="Father's Name" 
          value={isEditable ? editedEmployee?.personalInfo?.fatherName : employee.additionalInfo?.fatherName || employee.additionalInfo?.father_name || employee.additionalInfo?.['Father Name']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="fatherName"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Spouse's Name" 
          value={isEditable ? editedEmployee?.personalInfo?.spouseName : employee.additionalInfo?.spouse_name || employee.additionalInfo?.['Spouse Name']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="spouseName"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Blood Group" 
          value={isEditable ? editedEmployee?.personalInfo?.bloodGroup : employee.personalInfo?.bloodGroup || employee.additionalInfo?.blood_group || employee.additionalInfo?.['Blood Group']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="bloodGroup"
          section="personalInfo"
        />
        <FieldDisplay 
          label="Physically Handicapped" 
          value={employee.additionalInfo?.physically_handicapped || employee.additionalInfo?.['Physically Handicapped']} 
        />
      </SectionCard>
    </Grid>
  </Grid>
);

// Profile Section Component
const ProfileSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <SectionCard icon="📄" title="Government & Legal" color="warning.main">
        <FieldDisplay 
          label="PAN Number" 
          value={employee.additionalInfo?.['PAN Number'] || employee.salaryInfo?.taxInfo?.panNumber} 
        />
        <FieldDisplay 
          label="Aadhaar Number" 
          value={employee.additionalInfo?.['Aadhaar Number'] || employee.salaryInfo?.taxInfo?.aadharNumber} 
        />
        <FieldDisplay 
          label="PF Number" 
          value={employee.additionalInfo?.['PF Number'] || employee.salaryInfo?.taxInfo?.pfNumber} 
        />
        <FieldDisplay 
          label="UAN Number" 
          value={employee.additionalInfo?.['UAN Number'] || employee.salaryInfo?.taxInfo?.uanNumber} 
        />
      </SectionCard>
    </Grid>
    <Grid item xs={12} md={6}>
      <SectionCard icon="📋" title="Additional Information" color="grey.600">
        {employee.additionalInfo && Object.entries(employee.additionalInfo)
          .filter(([key, value]) => {
            // Filter out already displayed fields
            const excludedKeys = [
              'Employee Number', 'Display Name', 'Full Name', 'Work Email', 'Date Of Birth', 'Gender', 
              'Marital Status', 'Personal Email', 'Mobile Phone', 'Work Phone', 'Current Address Line 1', 
              'Permanent Address Line 1', 'Father Name', 'Spouse Name', 'Location', 'Location Country',
              'Department', 'Job Title', 'Date Joined', 'Employment Status', 'Worker Type', 'Reporting To',
              'PAN Number', 'Aadhaar Number', 'PF Number', 'UAN Number', 'Blood Group', 'Physically Handicapped',
              'Nationality'
            ];
            
            // Filter out complex objects from onboarding migration
            const complexObjectKeys = [
              'onboardingId', 'candidatePortalData', 'itSetupData', 'hrSetupData', 'allEmergencyContacts',
              'offerLetterData', 'orientationData', 'onboardingTasks', 'stepProgress', 'educationQualifications',
              'workExperience', 'governmentDocuments', 'bankDocuments', 'educationDocuments', 
              'workExperienceDocuments', 'onboardingCompletedAt', 'documentsSubmittedAt'
            ];
            
            // Only show simple string/number/boolean values
            return !excludedKeys.includes(key) && 
                   !complexObjectKeys.includes(key) &&
                   (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') &&
                   value !== null && value !== undefined && value !== '';
          })
          .slice(0, 6)
          .map(([key, value]) => (
            <FieldDisplay key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={value} />
          ))
        }
      </SectionCard>
    </Grid>
  </Grid>
);

// Job Section Component
const JobSection = ({ employee, isEditable = false, editedEmployee, onFieldChange }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <SectionCard icon="💼" title="Employment Information" color="success.main">
        <FieldDisplay 
          label="Department" 
          value={isEditable ? editedEmployee?.employmentInfo?.department : employee.employmentInfo?.department?.name || employee.additionalInfo?.Department}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="department"
          section="employmentInfo"
        />
        <FieldDisplay 
          label="Job Title" 
          value={isEditable ? editedEmployee?.employmentInfo?.designation : employee.employmentInfo?.designation || employee.additionalInfo?.['Job Title']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="designation"
          section="employmentInfo"
        />
        <FieldDisplay 
          label="Date of Joining" 
          value={isEditable 
            ? (editedEmployee?.employmentInfo?.dateOfJoining ? moment(editedEmployee.employmentInfo.dateOfJoining).format('YYYY-MM-DD') : '')
            : (employee.employmentInfo?.dateOfJoining 
              ? moment(employee.employmentInfo.dateOfJoining).format('DD MMM YYYY')
              : employee.additionalInfo?.['Date Joined'])
          }
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="dateOfJoining"
          section="employmentInfo"
          type="date"
        />
        <FieldDisplay 
          label="Employment Status" 
          value={isEditable ? editedEmployee?.employmentInfo?.employmentStatus : employee.employmentInfo?.employmentStatus || employee.additionalInfo?.['Employment Status']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="employmentStatus"
          section="employmentInfo"
        />
        <FieldDisplay 
          label="Worker Type" 
          value={isEditable ? editedEmployee?.employmentInfo?.employeeType : employee.employmentInfo?.employeeType || employee.additionalInfo?.['Worker Type']}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="employeeType"
          section="employmentInfo"
        />
        <FieldDisplay 
          label="Work Location" 
          value={isEditable ? editedEmployee?.employmentInfo?.workLocation : employee.employmentInfo?.workLocation || employee.additionalInfo?.Location}
          isEditable={isEditable}
          onEdit={onFieldChange}
          fieldKey="workLocation"
          section="employmentInfo"
        />
        <FieldDisplay 
          label="Reporting Manager" 
          value={employee.employmentInfo?.reportingManager ? 
            `${employee.employmentInfo.reportingManager.personalInfo?.firstName || ''} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || ''}`.trim() :
            employee.additionalInfo?.reporting_to || 
            employee.additionalInfo?.['Reporting To']} 
        />
      </SectionCard>
    </Grid>
  </Grid>
);

// Time & Attendance Section Component
const TimeSection = ({ employee }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, week, today

  useEffect(() => {
    fetchAttendanceData();
  }, [employee, selectedPeriod]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Calculate date range based on selected period
      const now = new Date();
      let startDate, endDate;
      
      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'month':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
      }

      const response = await fetch(`/api/attendance/summary?employeeId=${employee._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        console.error('Failed to fetch attendance data');
        setAttendanceData(null);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHours = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success.main';
      case 'late': return 'warning.main';
      case 'absent': return 'error.main';
      case 'half-day': return 'info.main';
      default: return 'grey.500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✅';
      case 'late': return '⚠️';
      case 'absent': return '❌';
      case 'half-day': return '⏰';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard icon="⏰" title="Time & Attendance" color="info.main">
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Loading attendance data...
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="⏰" title="Time & Attendance" color="info.main">
          {/* Period Selector */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="600">Attendance Overview</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['today', 'week', 'month'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedPeriod(period)}
                  sx={{ 
                    textTransform: 'capitalize',
                    minWidth: 80,
                    fontSize: '0.75rem'
                  }}
                >
                  {period}
                </Button>
              ))}
            </Box>
          </Box>

          {attendanceData ? (
            <>
              {/* Professional Summary Stats */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ 
                      p: 3, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#fafafa'
                    }}>
                      <Typography variant="h4" fontWeight="700" color="text.primary">
                        {attendanceData.presentDays || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Present Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ 
                      p: 3, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#fafafa'
                    }}>
                      <Typography variant="h4" fontWeight="700" color="text.primary">
                        {attendanceData.lateDays || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Late Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ 
                      p: 3, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#fafafa'
                    }}>
                      <Typography variant="h4" fontWeight="700" color="text.primary">
                        {attendanceData.absentDays || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Absent Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ 
                      p: 3, 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#fafafa'
                    }}>
                      <Typography variant="h4" fontWeight="700" color="text.primary">
                        {formatHours(attendanceData.totalHours || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Total Hours
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Professional Attendance Records Table */}
              {attendanceData.records && attendanceData.records.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                    Recent Attendance Records
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Check In</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Check Out</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Hours</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceData.records.slice(0, 10).map((record, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:hover': { bgcolor: '#f8f9fa' },
                              '&:last-child td, &:last-child th': { border: 0 }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {new Date(record.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={record.status.toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: record.status === 'present' ? '#e8f5e8' : 
                                          record.status === 'late' ? '#fff3cd' : 
                                          record.status === 'absent' ? '#f8d7da' : '#e2e3e5',
                                  color: record.status === 'present' ? '#155724' : 
                                        record.status === 'late' ? '#856404' : 
                                        record.status === 'absent' ? '#721c24' : '#6c757d',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.primary">
                                {record.checkIn ? formatTime(record.checkIn.time) : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.primary">
                                {record.checkOut ? formatTime(record.checkOut.time) : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500">
                                {formatHours(record.totalHours)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {record.isLate ? `${record.lateMinutes}m late` : 
                                 record.earlyDeparture ? `${record.earlyDepartureMinutes}m early` : 
                                 record.status === 'present' ? 'On time' : ''}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No attendance records found for the selected period
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Unable to load attendance data
              </Typography>
              <Button 
                variant="outlined" 
                onClick={fetchAttendanceData}
                sx={{ 
                  borderColor: '#d1d5db',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: '#f9fafb'
                  }
                }}
              >
                Retry
              </Button>
            </Box>
          )}
        </SectionCard>
      </Grid>
    </Grid>
  );
};

const DocumentsSection = ({ employee }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openBulkUploadDialog, setOpenBulkUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [documentType, setDocumentType] = useState('resume');
  const [editingDocument, setEditingDocument] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  
  // Local state to track deleted documents
  const [deletedDocuments, setDeletedDocuments] = useState(new Set());
  const [deletedGovernmentDocs, setDeletedGovernmentDocs] = useState(new Set());
  const [deletedBankDocs, setDeletedBankDocs] = useState(new Set());
  
  // Local state to track uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadedGovernmentDocs, setUploadedGovernmentDocs] = useState({});
  const [uploadedBankDocs, setUploadedBankDocs] = useState({});

  const handleUploadClick = (type) => {
    setDocumentType(type);
    setOpenUploadDialog(true);
  };

  const handleBulkUploadClick = () => {
    setOpenBulkUploadDialog(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Uploading ${documentType}:`, file.name);
      alert(`${documentType} uploaded successfully!`);
      setOpenUploadDialog(false);
    }
  };

  const handleBulkFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleBulkUpload = async () => {
    console.log('🔍 Bulk upload function called with files:', selectedFiles);
    if (selectedFiles.length === 0) {
      console.log('❌ No files selected');
      return;
    }
    
    setUploading(true);
    try {
      // Process each file and categorize it
      const newDocuments = [];
      const newGovernmentDocs = {};
      const newBankDocs = {};
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name);
        
        // Create a mock document object
        const documentData = {
          id: `bulk_${Date.now()}_${i}`,
          name: file.name,
          type: 'bulk_upload',
          url: URL.createObjectURL(file),
          filePath: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size
        };
        
        // Categorize documents based on filename
        const fileName = file.name.toLowerCase();
        if (fileName.includes('aadhaar') || fileName.includes('aadhar')) {
          newGovernmentDocs.aadhaarImage = documentData;
        } else if (fileName.includes('pan')) {
          newGovernmentDocs.panImage = documentData;
        } else if (fileName.includes('cheque') || fileName.includes('check')) {
          newBankDocs.cancelledCheque = documentData;
        } else if (fileName.includes('passbook')) {
          newBankDocs.passbook = documentData;
        } else if (fileName.includes('statement') || fileName.includes('bank')) {
          newBankDocs.bankStatement = documentData;
        } else if (fileName.includes('mark') || fileName.includes('degree') || fileName.includes('certificate')) {
          // Education documents
          newDocuments.push({
            ...documentData,
            type: 'education',
            category: 'Education'
          });
        } else if (fileName.includes('exp') || fileName.includes('experience') || fileName.includes('offer')) {
          // Work experience documents
          newDocuments.push({
            ...documentData,
            type: 'work_experience',
            category: 'Work Experience'
          });
        } else {
          // Other documents
          newDocuments.push({
            ...documentData,
            type: 'other',
            category: 'Other'
          });
        }
        
        // Add delay to simulate upload
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Update the local state with new documents
      if (newDocuments.length > 0) {
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
      }
      if (Object.keys(newGovernmentDocs).length > 0) {
        setUploadedGovernmentDocs(prev => ({ ...prev, ...newGovernmentDocs }));
      }
      if (Object.keys(newBankDocs).length > 0) {
        setUploadedBankDocs(prev => ({ ...prev, ...newBankDocs }));
      }
      
      console.log('📄 New documents added to state:', newDocuments);
      console.log('🆔 New government docs added:', newGovernmentDocs);
      console.log('🏦 New bank docs added:', newBankDocs);
      
      alert(`${selectedFiles.length} documents uploaded successfully! They will appear in the document section.`);
      setOpenBulkUploadDialog(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Error uploading documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEditDocument = (doc) => {
    setEditingDocument(doc);
    setDocumentName(doc.name || '');
    setOpenEditDialog(true);
  };

  const handleDownloadDocument = async (doc) => {
    console.log('🔍 Download function called with:', doc);
    console.log('🚀 Using NEW download method - v2.0');
    setDownloading(true);
    try {
      // Check if the document has a valid URL
      const fileUrl = doc.url || doc.filePath;
      if (!fileUrl) {
        throw new Error('No file URL available');
      }
      
      console.log('🔗 Attempting to download:', fileUrl);
      console.log('🔧 Using improved download method');
      
      // For blob URLs (uploaded files), use direct download
      if (fileUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = doc.name || 'document';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        
        // Use setTimeout to prevent blocking the main thread
        setTimeout(() => {
          try {
            link.click();
            console.log('✅ Download triggered successfully');
          } catch (clickError) {
            console.error('Click error:', clickError);
            // Fallback: try opening in new tab
            window.open(fileUrl, '_blank');
          }
          document.body.removeChild(link);
        }, 0);
        
        console.log('📥 Downloaded blob document:', doc.name);
        alert(`Downloaded: ${doc.name}`);
      } else {
        // For server URLs, try to fetch and create blob
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = doc.name || 'document';
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          URL.revokeObjectURL(blobUrl);
          
          console.log('📥 Downloaded server document:', doc.name);
          alert(`Downloaded: ${doc.name}`);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          // Fallback: try direct link
          window.open(fileUrl, '_blank');
          alert(`Opening document in new tab: ${doc.name}`);
        }
      }
      
      // Force download method - fetch and create blob for guaranteed download
      console.log('🔄 Fetching file and creating download blob...');
      
      try {
        // Fetch the file and create a blob
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Create download link with blob URL
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = doc.name || 'document';
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
        
        console.log('✅ File downloaded successfully');
        alert(`Downloaded: ${doc.name}`);
        
      } catch (fetchError) {
        console.error('Fetch failed, trying direct download:', fetchError);
        
        // Fallback: try direct download link
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = doc.name || 'document';
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log('✅ Direct download attempted');
        alert(`Download attempted: ${doc.name}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Error downloading document: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkDownload = async () => {
    console.log('🔍 Bulk download function called');
    console.log('🚀 Using NEW bulk download method - v2.0');
    setBulkDownloading(true);
    try {
      // Collect all available documents
      const allDocuments = [];
      
      // Add government documents
      Object.entries(governmentDocs).forEach(([key, doc]) => {
        if (doc && !deletedGovernmentDocs.has(key)) {
          allDocuments.push({ ...doc, category: 'Government' });
        }
      });
      
      // Add bank documents
      Object.entries(bankDocs).forEach(([key, doc]) => {
        if (doc && !deletedBankDocs.has(key)) {
          allDocuments.push({ ...doc, category: 'Bank' });
        }
      });
      
      // Add education documents
      educationDocs.forEach(doc => {
        if (!deletedDocuments.has(doc.id || doc._id || doc.name)) {
          allDocuments.push({ ...doc, category: 'Education' });
        }
      });
      
      // Add work experience documents
      workExpDocs.forEach(doc => {
        if (!deletedDocuments.has(doc.id || doc._id || doc.name)) {
          allDocuments.push({ ...doc, category: 'Work Experience' });
        }
      });
      
      // Add other documents
      documents.forEach(doc => {
        if (!deletedDocuments.has(doc.id || doc._id || doc.name)) {
          allDocuments.push({ ...doc, category: 'Other' });
        }
      });
      
      if (allDocuments.length === 0) {
        alert('No documents available for download.');
        return;
      }
      
      console.log(`📦 Starting bulk download of ${allDocuments.length} documents`);
      
      // Download each document with a small delay
      for (let i = 0; i < allDocuments.length; i++) {
        const doc = allDocuments[i];
        console.log(`Downloading ${i + 1}/${allDocuments.length}: ${doc.name} (${doc.category})`);
        
        // Force download using blob method (same as individual download)
        const fileUrl = doc.url || doc.filePath;
        if (fileUrl) {
          try {
            console.log(`🔄 Fetching ${doc.name} for download...`);
            console.log(`🔗 File URL: ${fileUrl}`);
            
            // Fetch the file and create a blob
            const response = await fetch(fileUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/octet-stream',
              },
            });
            
            console.log(`📡 Response status: ${response.status}`);
            console.log(`📡 Response headers:`, response.headers);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            // Create download link with blob URL
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `${doc.category}_${doc.name}`;
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up blob URL
            URL.revokeObjectURL(blobUrl);
            
            console.log(`✅ Downloaded: ${doc.name}`);
            
          } catch (fetchError) {
            console.error(`Download failed for ${doc.name}:`, fetchError);
            
            // Fallback: try direct download link
            const fallbackLink = document.createElement('a');
            fallbackLink.href = fileUrl;
            fallbackLink.download = `${doc.category}_${doc.name}`;
            fallbackLink.style.display = 'none';
            
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            document.body.removeChild(fallbackLink);
            
            console.log(`⚠️ Fallback download attempted for: ${doc.name}`);
          }
        }
        
        // Small delay between downloads
        if (i < allDocuments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      alert(`Successfully downloaded ${allDocuments.length} documents!`);
    } catch (error) {
      console.error('Bulk download error:', error);
      alert('Error downloading documents. Please try again.');
    } finally {
      setBulkDownloading(false);
    }
  };

  const handleSaveDocumentName = () => {
    if (editingDocument && documentName.trim()) {
      console.log('Saving document name:', documentName);
      // Here you would typically save to the server
      alert('Document name updated successfully!');
      setOpenEditDialog(false);
      setEditingDocument(null);
      setDocumentName('');
    }
  };

  const handleDeleteDocument = (doc) => {
    console.log('🔍 Delete function called with:', doc);
    setDeletingDocument(doc);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDocument) return;
    
    setDeleting(true);
    try {
      // Simulate delete process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the key directly for government and bank docs, or ID for others
      if (deletingDocument.type === 'government') {
        setDeletedGovernmentDocs(prev => new Set([...prev, deletingDocument.key]));
        // Also remove from uploaded government docs if it exists there
        if (uploadedGovernmentDocs[deletingDocument.key]) {
          setUploadedGovernmentDocs(prev => {
            const newDocs = { ...prev };
            delete newDocs[deletingDocument.key];
            return newDocs;
          });
        }
      } else if (deletingDocument.type === 'bank') {
        setDeletedBankDocs(prev => new Set([...prev, deletingDocument.key]));
        // Also remove from uploaded bank docs if it exists there
        if (uploadedBankDocs[deletingDocument.key]) {
          setUploadedBankDocs(prev => {
            const newDocs = { ...prev };
            delete newDocs[deletingDocument.key];
            return newDocs;
          });
        }
      } else {
        const docId = deletingDocument.id || deletingDocument._id || deletingDocument.name;
        setDeletedDocuments(prev => new Set([...prev, docId]));
        // Also remove from uploaded documents if it exists there
        setUploadedDocuments(prev => prev.filter(doc => 
          (doc.id || doc._id || doc.name) !== docId
        ));
      }
      alert('Document deleted successfully!');
      setOpenDeleteDialog(false);
      setDeletingDocument(null);
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Error deleting document. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get documents from employee data and merge with uploaded documents
  const originalDocuments = employee?.documents || [];
  const additionalInfo = employee?.additionalInfo || {};
  const originalGovernmentDocs = additionalInfo.governmentDocuments || {};
  const originalBankDocs = additionalInfo.bankDocuments || {};
  const originalEducationDocs = additionalInfo.educationDocuments || [];
  const originalWorkExpDocs = additionalInfo.workExperienceDocuments || [];
  
  // Merge original documents with uploaded documents
  const documents = [...originalDocuments, ...uploadedDocuments];
  const governmentDocs = { ...originalGovernmentDocs, ...uploadedGovernmentDocs };
  const bankDocs = { ...originalBankDocs, ...uploadedBankDocs };
  const educationDocs = originalEducationDocs; // These are handled separately
  const workExpDocs = originalWorkExpDocs; // These are handled separately


  const renderDocumentItem = (doc, type, icon) => (
    <Box key={doc._id || doc.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>{icon}</span>
        <Box>
          <Typography variant="body1">{doc.name || 'Document'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {type} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown date'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleEditDocument(doc)}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => window.open(doc.url || doc.filePath, '_blank')}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          View
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          color="success"
          onClick={() => handleDownloadDocument(doc)}
          disabled={downloading}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          {downloading ? '⏳' : '📥'}
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          color="error"
          onClick={() => handleDeleteDocument({...doc, type: type.toLowerCase(), key: doc.id || doc._id || doc.name})}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="📄" title="Documents" color="warning.main">
          {/* Header with Bulk Upload Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="600">Employee Documents</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleBulkDownload}
                disabled={bulkDownloading}
                sx={{ 
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': { 
                    borderColor: 'success.dark',
                    bgcolor: 'success.light',
                    color: 'success.dark'
                  }
                }}
              >
                {bulkDownloading ? '📦 Downloading...' : '📦 Bulk Download'}
              </Button>
              <Button
                variant="contained"
                onClick={handleBulkUploadClick}
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                📁 Bulk Upload
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Government Documents */}
            {governmentDocs.aadhaarImage && !deletedGovernmentDocs.has('aadhaarImage') && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🆔</span>
                  <Box>
                    <Typography variant="body1">Aadhaar Card</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {governmentDocs.aadhaarImage.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleEditDocument(governmentDocs.aadhaarImage)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.open(governmentDocs.aadhaarImage.url, '_blank')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleDownloadDocument(governmentDocs.aadhaarImage)}
                    disabled={downloading}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {downloading ? '⏳' : '📥'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleDeleteDocument({...governmentDocs.aadhaarImage, type: 'government', key: 'aadhaarImage'})}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}

            {governmentDocs.panImage && !deletedGovernmentDocs.has('panImage') && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📋</span>
                  <Box>
                    <Typography variant="body1">PAN Card</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {governmentDocs.panImage.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleEditDocument(governmentDocs.panImage)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.open(governmentDocs.panImage.url, '_blank')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleDownloadDocument(governmentDocs.panImage)}
                    disabled={downloading}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {downloading ? '⏳' : '📥'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleDeleteDocument({...governmentDocs.panImage, type: 'government', key: 'panImage'})}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}

            {/* Bank Documents */}
            {bankDocs.cancelledCheque && !deletedBankDocs.has('cancelledCheque') && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🏦</span>
                  <Box>
                    <Typography variant="body1">Cancelled Cheque</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bankDocs.cancelledCheque.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleEditDocument(bankDocs.cancelledCheque)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.open(bankDocs.cancelledCheque.url, '_blank')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleDownloadDocument(bankDocs.cancelledCheque)}
                    disabled={downloading}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {downloading ? '⏳' : '📥'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleDeleteDocument({...bankDocs.cancelledCheque, type: 'bank', key: 'cancelledCheque'})}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}

            {bankDocs.passbook && !deletedBankDocs.has('passbook') && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📖</span>
                  <Box>
                    <Typography variant="body1">Passbook</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bankDocs.passbook.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleEditDocument(bankDocs.passbook)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.open(bankDocs.passbook.url, '_blank')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleDownloadDocument(bankDocs.passbook)}
                    disabled={downloading}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {downloading ? '⏳' : '📥'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleDeleteDocument({...bankDocs.passbook, type: 'bank', key: 'passbook'})}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}

            {bankDocs.bankStatement && !deletedBankDocs.has('bankStatement') && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📊</span>
                  <Box>
                    <Typography variant="body1">Bank Statement</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bankDocs.bankStatement.name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleEditDocument(bankDocs.bankStatement)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.open(bankDocs.bankStatement.url, '_blank')}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="success"
                    onClick={() => handleDownloadDocument(bankDocs.bankStatement)}
                    disabled={downloading}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    {downloading ? '⏳' : '📥'}
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleDeleteDocument({...bankDocs.bankStatement, type: 'bank', key: 'bankStatement'})}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            )}

            {/* Education Documents */}
            {educationDocs
              .filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name))
              .map((doc) => renderDocumentItem(doc, 'Education', '🎓'))}

            {/* Work Experience Documents */}
            {workExpDocs
              .filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name))
              .map((doc) => renderDocumentItem(doc, 'Work Experience', '💼'))}

            {/* Other Documents */}
            {documents
              .filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name))
              .map((doc) => renderDocumentItem(doc, doc.type || 'Other', '📄'))}

            {/* Show message if no documents */}
            {documents.filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name)).length === 0 && 
             Object.keys(governmentDocs).filter(key => !deletedGovernmentDocs.has(key)).length === 0 && 
             Object.keys(bankDocs).filter(key => !deletedBankDocs.has(key)).length === 0 && 
             educationDocs.filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name)).length === 0 && 
             workExpDocs.filter(doc => !deletedDocuments.has(doc.id || doc._id || doc.name)).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No documents uploaded yet
                </Typography>
              </Box>
            )}
          </Box>

          {/* Bulk Upload Dialog */}
          <Dialog open={openBulkUploadDialog} onClose={() => setOpenBulkUploadDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Upload Documents</DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select multiple files to upload at once. Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Typography>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleBulkFileUpload}
                  style={{ display: 'none' }}
                  id="bulk-file-input"
                />
                <label htmlFor="bulk-file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ 
                      py: 2, 
                      border: '2px dashed #ccc',
                      '&:hover': { border: '2px dashed #999' }
                    }}
                  >
                    📁 Choose Files ({selectedFiles.length} selected)
                  </Button>
                </label>
                
                {selectedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Files:</Typography>
                    <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                      {selectedFiles.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                          <Typography variant="body2">{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenBulkUploadDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleBulkUpload} 
                variant="contained" 
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Document Name Dialog */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Document Name</DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Current file: {editingDocument?.name || 'Unknown'}
                </Typography>
                <TextField
                  fullWidth
                  label="Document Name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveDocumentName} 
                variant="contained"
                disabled={!documentName.trim()}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Document Confirmation Dialog */}
          <Dialog 
            open={openDeleteDialog} 
            onClose={() => !deleting && setOpenDeleteDialog(false)} 
            maxWidth="sm" 
            fullWidth
            disableEscapeKeyDown={deleting}
          >
            <DialogTitle sx={{ color: 'error.main' }}>Delete Document</DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Are you sure you want to delete this document?
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1, 
                  border: '1px solid #e0e0e0' 
                }}>
                  <Typography variant="body2" fontWeight="600">
                    {deletingDocument?.name || 'Unknown Document'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This action cannot be undone.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  if (!deleting) {
                    setOpenDeleteDialog(false);
                    setDeletingDocument(null);
                  }
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                variant="contained"
                color="error"
                disabled={deleting}
                autoFocus={false}
              >
                {deleting ? 'Deleting...' : 'Delete Document'}
              </Button>
            </DialogActions>
          </Dialog>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

const AssetsSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <SectionCard icon="🏢" title="Assets" color="secondary.main">
        <FieldDisplay label="Laptop" value="Coming Soon" />
        <FieldDisplay label="Mobile" value="Coming Soon" />
        <FieldDisplay label="Other Assets" value="Coming Soon" />
      </SectionCard>
    </Grid>
  </Grid>
);

const FinancesSection = ({ employee }) => {
  const salaryInfo = employee?.salaryInfo || {};
  const currentSalary = salaryInfo.currentSalary || {};
  const bankDetails = salaryInfo.bankDetails || {};
  const taxInfo = salaryInfo.taxInfo || {};

  const formatCurrency = (amount) => {
    if (!amount) return 'Not provided';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'Not provided';
    return `****${accountNumber.slice(-4)}`;
  };

  const maskPanNumber = (panNumber) => {
    if (!panNumber) return 'Not provided';
    return `****${panNumber.slice(-4)}`;
  };

  const maskAadharNumber = (aadharNumber) => {
    if (!aadharNumber) return 'Not provided';
    return `****${aadharNumber.slice(-4)}`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <SectionCard icon="💰" title="Salary Information" color="success.main">
          <FieldDisplay label="Basic Salary" value={formatCurrency(currentSalary.basic)} />
          <FieldDisplay label="HRA" value={formatCurrency(currentSalary.hra)} />
          <FieldDisplay label="Allowances" value={formatCurrency(currentSalary.allowances)} />
          <FieldDisplay label="Gross Salary" value={formatCurrency(currentSalary.grossSalary)} />
          <FieldDisplay label="CTC" value={formatCurrency(currentSalary.ctc)} />
        </SectionCard>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <SectionCard icon="🏦" title="Bank Details" color="primary.main">
          <FieldDisplay label="Account Holder" value={bankDetails.accountHolderName || 'Not provided'} />
          <FieldDisplay label="Account Number" value={maskAccountNumber(bankDetails.accountNumber)} />
          <FieldDisplay label="Bank Name" value={bankDetails.bankName || 'Not provided'} />
          <FieldDisplay label="IFSC Code" value={bankDetails.ifscCode || 'Not provided'} />
        </SectionCard>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <SectionCard icon="📋" title="Tax Information" color="warning.main">
          <FieldDisplay label="PAN Number" value={maskPanNumber(taxInfo.panNumber)} />
          <FieldDisplay label="Aadhaar Number" value={maskAadharNumber(taxInfo.aadharNumber)} />
          <FieldDisplay label="PF Number" value={taxInfo.pfNumber || 'Not provided'} />
          <FieldDisplay label="ESI Number" value={taxInfo.esiNumber || 'Not provided'} />
          <FieldDisplay label="UAN Number" value={taxInfo.uanNumber || 'Not provided'} />
        </SectionCard>
      </Grid>
    </Grid>
  );
};

const ExpensesSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <SectionCard icon="💳" title="Expenses" color="error.main">
        <FieldDisplay label="Expense Reports" value="Coming Soon" />
        <FieldDisplay label="Reimbursements" value="Coming Soon" />
        <FieldDisplay label="Travel Expenses" value="Coming Soon" />
      </SectionCard>
    </Grid>
  </Grid>
);

const PerformanceSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <SectionCard icon="📊" title="Performance" color="primary.main">
        <FieldDisplay label="Performance Reviews" value="Coming Soon" />
        <FieldDisplay label="Goals" value="Coming Soon" />
        <FieldDisplay label="Feedback" value="Coming Soon" />
      </SectionCard>
    </Grid>
  </Grid>
);

// Employee Directory Sub-Module

// Employee Directory Sub-Module
const EmployeeDirectoryModule = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 24,
    total: 0
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFullScreenView, setShowFullScreenView] = useState(false);
  const [imageUploadEmployee, setImageUploadEmployee] = useState(null);
  
  // Add Employee Dialog State
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: ''
    },
    employmentInfo: {
      employeeId: '',
      designation: '',
      department: '',
      dateOfJoining: '',
      employmentStatus: 'active',
      workLocation: '',
      reportingManager: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete All Dialog State
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Import Dialog State
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importHeaders, setImportHeaders] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, pagination.rowsPerPage, searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // Try to get departments from organization endpoint first
      const response = await axios.get('/organization/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments from organization endpoint:', error);
      
      // Fallback: Extract departments from employees data
      try {
        const employeesResponse = await axios.get('/employees', { 
          params: { limit: 1000 } // Get more employees to extract departments
        });
        const employees = employeesResponse.data.employees || [];
        
        // Extract unique departments
        const departmentMap = new Map();
        employees.forEach(emp => {
          if (emp.employmentInfo?.department) {
            const dept = emp.employmentInfo.department;
            if (typeof dept === 'object' && dept._id && dept.name) {
              departmentMap.set(dept._id, { _id: dept._id, name: dept.name });
            }
          }
        });
        
        const uniqueDepartments = Array.from(departmentMap.values());
        setDepartments(uniqueDepartments);
        
        if (uniqueDepartments.length === 0) {
          // Final fallback to hardcoded departments
          setDepartments([
            { _id: 'it', name: 'IT' },
            { _id: 'hr', name: 'HR' },
            { _id: 'finance', name: 'Finance' },
            { _id: 'marketing', name: 'Marketing' },
            { _id: 'sales', name: 'Sales' }
          ]);
        }
      } catch (fallbackError) {
        console.error('Error in fallback department fetch:', fallbackError);
        // Final fallback to hardcoded departments
        setDepartments([
          { _id: 'it', name: 'IT' },
          { _id: 'hr', name: 'HR' },
          { _id: 'finance', name: 'Finance' },
          { _id: 'marketing', name: 'Marketing' },
          { _id: 'sales', name: 'Sales' }
        ]);
      }
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
        search: searchTerm,
        department: departmentFilter,
        isActive: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get('/employees', { params });
      setEmployees(response.data.employees || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'active': { color: 'success', label: 'Active' },
      'working': { color: 'success', label: 'Working' },
      'inactive': { color: 'error', label: 'Inactive' },
      'probation': { color: 'warning', label: 'Probation' },
      'terminated': { color: 'error', label: 'Terminated' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig['active'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowFullScreenView(true);
  };

  const handleBackToDirectory = () => {
    setShowFullScreenView(false);
    setSelectedEmployee(null);
  };

  const handleImageUpload = (employee, event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update employee image locally for immediate feedback
      setEmployees(prev => prev.map(emp => 
        emp._id === employee._id 
          ? { ...emp, profileImage: previewUrl }
          : emp
      ));

      // TODO: Upload to server
      console.log('Uploading image for employee:', employee.employeeId, file);
      
      // Here you would typically upload to your server
      // const formData = new FormData();
      // formData.append('image', file);
      // formData.append('employeeId', employee._id);
      // axios.post('/api/employees/upload-image', formData);
    }
  };

  const handleEditProfile = (employee) => {
    // This function is no longer needed since edit mode is handled within EmployeeFullScreenView
    // But keeping it for compatibility with the prop passing
    console.log('Edit profile called for:', employee.employeeId);
  };

  const handleSyncEmployee = async (employee) => {
    try {
      if (!employee.additionalInfo?.onboardingId) {
        toast.error('No onboarding record found for this employee');
        return;
      }

      const response = await axios.post(`/onboarding/${employee.additionalInfo.onboardingId}/sync-to-employee`);
      
      if (response.data.success) {
        toast.success(`Successfully synced ${response.data.changesCount} changes to employee record`);
        fetchEmployees(); // Refresh the employee list
      } else {
        toast.info('No changes detected - employee record is already up to date');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error.response?.data?.message || 'Failed to sync employee data');
    }
  };

  // Add Employee Form Handlers
  const handleNewEmployeeChange = (section, field, value) => {
    setNewEmployee(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddEmployee = async () => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        personalInfo: {
          firstName: newEmployee.personalInfo.firstName,
          lastName: newEmployee.personalInfo.lastName,
          dateOfBirth: newEmployee.personalInfo.dateOfBirth,
          gender: newEmployee.personalInfo.gender,
          maritalStatus: newEmployee.personalInfo.maritalStatus
        },
        contactInfo: {
          phone: newEmployee.personalInfo.phone
        },
        employmentInfo: {
          designation: newEmployee.employmentInfo.designation,
          department: newEmployee.employmentInfo.department,
          dateOfJoining: newEmployee.employmentInfo.dateOfJoining,
          employmentStatus: newEmployee.employmentInfo.employmentStatus,
          workLocation: newEmployee.employmentInfo.workLocation,
          reportingManager: newEmployee.employmentInfo.reportingManager || null
        },
        // Don't send employeeId - let backend generate it automatically
        user: {
          email: newEmployee.personalInfo.email,
          role: 'employee'
        }
      };

      const response = await axios.post('/employees', employeeData);
      
      toast.success('Employee added successfully!');
      setAddEmployeeOpen(false);
      resetNewEmployeeForm();
      fetchEmployees(); // Refresh the list
      
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewEmployeeForm = () => {
    setNewEmployee({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: ''
      },
      employmentInfo: {
        employeeId: '',
        designation: '',
        department: '',
        dateOfJoining: '',
        employmentStatus: 'active',
        workLocation: '',
        reportingManager: ''
      }
    });
  };

  const handleCloseAddEmployee = () => {
    setAddEmployeeOpen(false);
    resetNewEmployeeForm();
  };

  // Delete All Employees Function
  const handleDeleteAllEmployees = async () => {
    setIsDeletingAll(true);
    try {
      const response = await axios.delete('/employees/all');
      toast.success(response.data.message || 'All employees deleted successfully');
      setDeleteAllDialogOpen(false);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error deleting all employees:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employees');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Import Functions
  const downloadTemplate = () => {
    const headers = [
      'Employee Number', 'Display Name', 'Full Name', 'Work Email', 'Date Of Birth', 'Gender', 'Marital Status',
      'Blood Group', 'Physically Handicapped', 'Nationality', 'Mobile Phone', 'Work Phone', 'Personal Email',
      'Current Address Line 1', 'Permanent Address Line 1', 'Father Name', 'Spouse Name', 'Attendance Number',
      'Location', 'Location Country', 'Legal Entity', 'Business Unit', 'Department', 'Sub Department',
      'Job Title', 'Secondary Job Title', 'Reporting To', 'Reporting Manager Employee Number',
      'Dotted Line Manager', 'Date Joined', 'Leave Plan', 'Band', 'Pay Grade', 'Time Type', 'Worker Type',
      'Shift Policy Name', 'Weekly Off Policy Name', 'Attendance Time Tracking Policy', 'Attendance Capture Scheme',
      'Holiday List Name', 'Expense Policy Name', 'Notice Period', 'PAN Number', 'Aadhaar Number',
      'PF Number', 'UAN Number', 'Employment Status', 'Exit Date', 'Comments', 'Exit Status',
      'Termination Type', 'Termination Reason', 'Resignation Note', 'Cost Center'
    ];
    
    // Create sample data row
    const sampleData = [
      'EMP001', 'John Doe', 'John Doe', 'john.doe@company.com', '1990-01-15', 'Male', 'Single',
      'O+', 'No', 'Indian', '+91-9876543210', '+91-11-12345678', 'john.personal@gmail.com',
      '123 Main Street, City', '456 Home Street, Hometown', 'Father Name', '', 'ATT001',
      'Mumbai', 'India', 'Company Ltd', 'IT Division', 'Information Technology', 'Software Development',
      'Software Engineer', '', 'Manager Name', 'MGR001',
      '', '2023-01-15', 'Standard Leave Plan', 'Band A', 'Grade 1', 'Full Time', 'Permanent',
      'Standard Shift', 'Mon-Fri', 'Standard Policy', 'Biometric',
      'India Holidays', 'Standard Expense Policy', '30 days', 'ABCDE1234F', '1234-5678-9012',
      'PF123456', 'UAN123456789012', 'Active', '', 'Sample employee data',
      '', '', '', '', 'CC001'
    ];
    
    const csvContent = headers.join(',') + '\n' + sampleData.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'employee_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setImportFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          console.error('CSV parse errors:', results.errors);
          return;
        }
        
        setImportData(results.data);
        setImportHeaders(results.meta.fields || []);
        toast.success(`Parsed ${results.data.length} rows from CSV`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error('CSV parse error:', error);
      }
    });
  };

  const handleImportData = async () => {
    if (importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Transform data for backend - handle multiple header formats
      const employeeData = importData.map(row => {
        // Extract name parts from different possible fields
        const fullName = row['Full Name'] || row['Display Name'] || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || row.firstName || '';
        const lastName = nameParts.slice(1).join(' ') || row.lastName || '';

        return {
          personalInfo: {
            firstName: firstName,
            lastName: lastName,
            email: row['Work Email'] || row.email || '',
            phone: row['Mobile Phone'] || row.phone || '',
            dateOfBirth: row['Date Of Birth'] || row.dateOfBirth || '',
            gender: row['Gender'] || row.gender || '',
            maritalStatus: row['Marital Status'] || row.maritalStatus || '',
            bloodGroup: row['Blood Group'] || '',
            nationality: row['Nationality'] || '',
            personalEmail: row['Personal Email'] || '',
            currentAddress: row['Current Address Line 1'] || '',
            permanentAddress: row['Permanent Address Line 1'] || '',
            fatherName: row['Father Name'] || '',
            spouseName: row['Spouse Name'] || '',
            panNumber: row['PAN Number'] || '',
            aadhaarNumber: row['Aadhaar Number'] || '',
            physicallyHandicapped: row['Physically Handicapped'] || ''
          },
          employmentInfo: {
            // Don't set employeeId - let backend generate it automatically in CODR format
            designation: row['Job Title'] || row.designation || '',
            department: row['Department'] || row.department || '',
            subDepartment: row['Sub Department'] || '',
            dateOfJoining: row['Date Joined'] || row.dateOfJoining || '',
            employmentStatus: row['Employment Status'] || row.employmentStatus || 'active',
            workLocation: row['Location'] || row.workLocation || '',
            reportingManager: row['Reporting Manager Employee Number'] || row['Reporting To'] || row.reportingManager || '',
            reportingManagerEmpNo: row['Reporting Manager Employee Number'] || '',
            reportingManagerName: row['Reporting To'] || '', // Store name for reference only
            dottedLineManager: row['Dotted Line Manager'] || '',
            legalEntity: row['Legal Entity'] || '',
            businessUnit: row['Business Unit'] || '',
            secondaryJobTitle: row['Secondary Job Title'] || '',
            attendanceNumber: row['Attendance Number'] || '',
            locationCountry: row['Location Country'] || '',
            leavePlan: row['Leave Plan'] || '',
            band: row['Band'] || '',
            payGrade: row['Pay Grade'] || '',
            timeType: row['Time Type'] || '',
            workerType: row['Worker Type'] || '',
            shiftPolicy: row['Shift Policy Name'] || '',
            weeklyOffPolicy: row['Weekly Off Policy Name'] || '',
            attendancePolicy: row['Attendance Time Tracking Policy'] || '',
            attendanceCaptureScheme: row['Attendance Capture Scheme'] || '',
            holidayList: row['Holiday List Name'] || '',
            expensePolicy: row['Expense Policy Name'] || '',
            noticePeriod: row['Notice Period'] || '',
            pfNumber: row['PF Number'] || '',
            uanNumber: row['UAN Number'] || '',
            exitDate: row['Exit Date'] || '',
            exitStatus: row['Exit Status'] || '',
            terminationType: row['Termination Type'] || '',
            terminationReason: row['Termination Reason'] || '',
            resignationNote: row['Resignation Note'] || '',
            costCenter: row['Cost Center'] || '',
            comments: row['Comments'] || ''
          },
          user: {
            email: row['Work Email'] || row.email || '',
            role: 'employee'
          },
          additionalInfo: {
            // Store all original data for reference
            'Employee Number': row['Employee Number'] || '',
            'Display Name': row['Display Name'] || '',
            'Full Name': row['Full Name'] || '',
            'Work Email': row['Work Email'] || '',
            'Date Of Birth': row['Date Of Birth'] || '',
            'Gender': row['Gender'] || '',
            'Marital Status': row['Marital Status'] || '',
            'Blood Group': row['Blood Group'] || '',
            'Physically Handicapped': row['Physically Handicapped'] || '',
            'Nationality': row['Nationality'] || '',
            'Mobile Phone': row['Mobile Phone'] || '',
            'Work Phone': row['Work Phone'] || '',
            'Personal Email': row['Personal Email'] || '',
            'Current Address Line 1': row['Current Address Line 1'] || '',
            'Permanent Address Line 1': row['Permanent Address Line 1'] || '',
            'Father Name': row['Father Name'] || '',
            'Spouse Name': row['Spouse Name'] || '',
            'Attendance Number': row['Attendance Number'] || '',
            'Location': row['Location'] || '',
            'Location Country': row['Location Country'] || '',
            'Legal Entity': row['Legal Entity'] || '',
            'Business Unit': row['Business Unit'] || '',
            'Department': row['Department'] || '',
            'Sub Department': row['Sub Department'] || '',
            'Job Title': row['Job Title'] || '',
            'Secondary Job Title': row['Secondary Job Title'] || '',
            'Reporting To': row['Reporting To'] || '',
            'Reporting Manager Employee Number': row['Reporting Manager Employee Number'] || '',
            'Dotted Line Manager': row['Dotted Line Manager'] || '',
            'Date Joined': row['Date Joined'] || '',
            'Leave Plan': row['Leave Plan'] || '',
            'Band': row['Band'] || '',
            'Pay Grade': row['Pay Grade'] || '',
            'Time Type': row['Time Type'] || '',
            'Worker Type': row['Worker Type'] || '',
            'Shift Policy Name': row['Shift Policy Name'] || '',
            'Weekly Off Policy Name': row['Weekly Off Policy Name'] || '',
            'Attendance Time Tracking Policy': row['Attendance Time Tracking Policy'] || '',
            'Attendance Capture Scheme': row['Attendance Capture Scheme'] || '',
            'Holiday List Name': row['Holiday List Name'] || '',
            'Expense Policy Name': row['Expense Policy Name'] || '',
            'Notice Period': row['Notice Period'] || '',
            'PAN Number': row['PAN Number'] || '',
            'Aadhaar Number': row['Aadhaar Number'] || '',
            'PF Number': row['PF Number'] || '',
            'UAN Number': row['UAN Number'] || '',
            'Employment Status': row['Employment Status'] || '',
            'Exit Date': row['Exit Date'] || '',
            'Comments': row['Comments'] || '',
            'Exit Status': row['Exit Status'] || '',
            'Termination Type': row['Termination Type'] || '',
            'Termination Reason': row['Termination Reason'] || '',
            'Resignation Note': row['Resignation Note'] || '',
            'Cost Center': row['Cost Center'] || ''
          }
        };
      });

      const response = await axios.post('/organization/import-master-data', {
        employees: employeeData,
        headers: importHeaders,
        mode: 'comprehensive'
      });

      setImportResults(response.data);
      setImportProgress(100);
      
      toast.success(`Successfully imported ${response.data.success || 0} employees`);
      
      // Refresh employee list
      fetchEmployees();
      
      // Close dialog after a delay
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportData([]);
        setImportHeaders([]);
        setImportFile(null);
        setImportResults(null);
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Show full-screen employee details if selected
  if (showFullScreenView && selectedEmployee) {
    return <EmployeeFullScreenView employee={selectedEmployee} onBack={handleBackToDirectory} onEditProfile={handleEditProfile} onSyncEmployee={handleSyncEmployee} />;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Compact Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        pb: 1,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h6" 
            fontWeight="600" 
            sx={{ 
              fontSize: '1.1rem',
              color: '#1f2937'
            }}
          >
            Employee Directory
          </Typography>
          <Chip
            label={statusFilter === 'active' ? 'Active' : statusFilter === '' ? 'All' : statusFilter}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ 
              fontSize: '0.7rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              height: 20
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddEmployeeOpen(true)}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Add Employee
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEmployees}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                backgroundColor: 'primary.50'
              }
            }}
          >
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setImportDialogOpen(true)}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                borderColor: '#2563eb',
                color: '#2563eb',
                backgroundColor: '#eff6ff'
              }
            }}
          >
            Import Employees
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                color: '#059669',
                backgroundColor: '#f0fdf4'
              }
            }}
          >
            Download Template
          </Button>

          <Button
            variant="outlined"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setDeleteAllDialogOpen(true)}
            size="small"
            disabled={employees.length === 0}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#dc2626',
                color: '#dc2626',
                backgroundColor: '#fef2f2'
              },
              '&:disabled': {
                borderColor: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            Delete All
          </Button>
        </Box>
      </Box>

      {/* Compact Search and Filters */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 1.5, 
          mb: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 1.5,
          backgroundColor: '#fafbfc'
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.8rem',
                  backgroundColor: 'white',
                  height: 36,
                  '& fieldset': {
                    borderColor: '#d1d5db'
                  },
                  '&:hover fieldset': {
                    borderColor: '#9ca3af'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.8rem' }}>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
                sx={{
                  fontSize: '0.8rem',
                  backgroundColor: 'white',
                  height: 36,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id} sx={{ fontSize: '0.8rem' }}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.8rem' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  fontSize: '0.8rem',
                  backgroundColor: 'white',
                  height: 36,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>All Status</MenuItem>
                <MenuItem value="active" sx={{ fontSize: '0.8rem' }}>Active</MenuItem>
                <MenuItem value="inactive" sx={{ fontSize: '0.8rem' }}>Inactive</MenuItem>
                <MenuItem value="probation" sx={{ fontSize: '0.8rem' }}>Probation</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                textAlign: 'center',
                fontWeight: 500
              }}
            >
              {employees.length} of {pagination.total} employees
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Ultra Premium Employee Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {employees.map((employee, index) => (
          <Box
            key={employee._id || index}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
              border: '1px solid transparent',
              borderRadius: 4,
              overflow: 'hidden',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(135deg, 
                  ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0%, 
                  ${employee.employmentInfo?.employmentStatus === 'working' ? '#34d399' : '#8b5cf6'} 50%,
                  ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                transition: 'all 0.4s ease',
                borderRadius: '4px 4px 0 0'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, 
                  ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98105' : '#6366f105'} 0%, 
                  transparent 50%, 
                  ${employee.employmentInfo?.employmentStatus === 'working' ? '#05966905' : '#4f46e505'} 100%)`,
                opacity: 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
                borderRadius: 4
              },
              '&:hover': {
                transform: 'translateY(-4px) scale(1.01)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
                borderColor: `${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98120' : '#6366f120'}`,
                '&::before': {
                  height: 6,
                  boxShadow: `0 0 20px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98130' : '#6366f130'}`
                },
                '&::after': {
                  opacity: 1
                },
                '& .employee-avatar': {
                  transform: 'scale(1.08) rotate(2deg)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                },
                '& .info-card': {
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                },
                '& .status-badge': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 4px 12px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98130' : '#6366f130'}`
                },
                '& .employee-name': {
                  color: `${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'}`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }
              }
            }}
            onClick={() => handleEmployeeClick(employee)}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Ultra Premium Avatar Section */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  {/* Avatar Glow Effect */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
                      borderRadius: '50%',
                      background: `conic-gradient(from 0deg, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'}, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#34d399' : '#8b5cf6'}, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'}, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'})`,
                      opacity: 0.3,
                      filter: 'blur(8px)',
                      transition: 'all 0.4s ease'
                    }}
                  />
                  
                  <Avatar 
                    className="employee-avatar"
                    src={employee.profileImage || ''}
                    sx={{ 
                      width: 72, 
                      height: 72,
                      background: `conic-gradient(from 45deg, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0deg, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#34d399' : '#8b5cf6'} 120deg, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 240deg, 
                        ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 360deg)`,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
                      border: '4px solid white',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: 'white',
                      position: 'relative',
                      zIndex: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        padding: 2,
                        background: `conic-gradient(from 0deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'}, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#34d399' : '#8b5cf6'}, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'}, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'xor',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor'
                      }
                    }}
                  >
                    {!employee.profileImage && (
                      <>
                        {employee.personalInfo?.firstName?.charAt(0) || 'N'}
                        {employee.personalInfo?.lastName?.charAt(0) || 'A'}
                      </>
                    )}
                  </Avatar>
                  
                  {/* Animated Status Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: employee.employmentInfo?.employmentStatus === 'working' 
                        ? 'conic-gradient(from 0deg, #10b981, #34d399, #059669, #10b981)'
                        : 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #4f46e5, #6366f1)',
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' }
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'white',
                      boxShadow: '0 0 4px rgba(255,255,255,0.8)'
                    }} />
                  </Box>

                  {/* Ultra Premium Image Upload */}
                  <Box sx={{ position: 'absolute', bottom: -4, right: -4 }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`image-upload-${employee._id}`}
                      onChange={(e) => handleImageUpload(employee, e)}
                    />
                    <label htmlFor={`image-upload-${employee._id}`}>
                      <IconButton
                        size="small"
                        component="span"
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: 'white',
                          border: '3px solid #f1f5f9',
                          borderRadius: '50%',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            borderColor: `${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'}`,
                            boxShadow: `0 8px 24px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98130' : '#6366f130'}, 0 4px 8px rgba(0,0,0,0.1)`,
                            transform: 'scale(1.15) rotate(10deg)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          background: `linear-gradient(135deg, 
                            ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0%, 
                            ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            boxShadow: '0 0 2px rgba(255,255,255,0.8)'
                          }
                        }} />
                      </IconButton>
                    </label>
                  </Box>
                </Box>

                {/* Ultra Premium Employee Information */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2 }}>
                    <Typography 
                      className="employee-name"
                      variant="h5" 
                      sx={{ 
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.03em',
                        background: `linear-gradient(135deg, 
                          #0f172a 0%, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
                    </Typography>
                    
                    {/* Ultra Premium Status Badge */}
                    <Box 
                      className="status-badge"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        px: 3, 
                        py: 1,
                        background: employee.employmentInfo?.employmentStatus === 'working' 
                          ? 'linear-gradient(135deg, #10b98115 0%, #34d39915 50%, #05966915 100%)'
                          : 'linear-gradient(135deg, #6366f115 0%, #8b5cf615 50%, #4f46e515 100%)',
                        borderRadius: 3,
                        border: `2px solid ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98125' : '#6366f125'}`,
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, 
                            transparent, 
                            ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98120' : '#6366f120'}, 
                            transparent)`,
                          transition: 'left 0.5s ease',
                        },
                        '&:hover::before': {
                          left: '100%'
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: employee.employmentInfo?.employmentStatus === 'working' 
                          ? 'conic-gradient(from 0deg, #10b981, #34d399, #059669, #10b981)'
                          : 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #4f46e5, #6366f1)',
                        boxShadow: `0 0 8px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98150' : '#6366f150'}`,
                        animation: 'spin 3s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }} />
                      <Typography 
                        variant="caption"
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        {employee.employmentInfo?.employmentStatus === 'working' ? '● Active' : 
                         `● ${employee.employmentInfo?.employmentStatus || 'Active'}`}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#475569',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 1,
                      background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {employee.employmentInfo?.designation || 'N/A'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                      }}
                    >
                      ID: {employee.employeeId || 'No ID'}
                    </Typography>
                    
                    {/* Performance Badge */}
                    <Box sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: '#f1f5f9',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Typography variant="caption" sx={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 600, 
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        ⭐ Top
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Ultra Premium Information Cards */}
                <Box sx={{ display: 'flex', gap: 2.5, flexShrink: 0 }}>
                  {/* Department Card */}
                  <Box 
                    className="info-card"
                    sx={{ 
                      minWidth: 160,
                      p: 2.5,
                      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
                      borderRadius: 3,
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 3,
                        padding: 2,
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98120' : '#6366f120'}, 
                          transparent, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#05966920' : '#4f46e520'})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'xor',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0%, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                        boxShadow: `0 0 6px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98140' : '#6366f140'}`
                      }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em'
                        }}
                      >
                        Department
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {employee.employmentInfo?.department?.name || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Contact Card */}
                  <Box 
                    className="info-card"
                    sx={{ 
                      minWidth: 220,
                      p: 2.5,
                      background: 'linear-gradient(145deg, #fefefe 0%, #f8fafc 50%, #ffffff 100%)',
                      borderRadius: 3,
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 3,
                        padding: 2,
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98120' : '#6366f120'}, 
                          transparent, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#05966920' : '#4f46e520'})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'xor',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0%, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                        boxShadow: `0 0 6px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98140' : '#6366f140'}`
                      }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em'
                        }}
                      >
                        Contact
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace'
                      }}
                    >
                      {employee.user?.email || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Join Date Card */}
                  <Box 
                    className="info-card"
                    sx={{ 
                      minWidth: 140,
                      p: 2.5,
                      background: 'linear-gradient(145deg, #f1f5f9 0%, #ffffff 50%, #f8fafc 100%)',
                      borderRadius: 3,
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 3,
                        padding: 2,
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98120' : '#6366f120'}, 
                          transparent, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#05966920' : '#4f46e520'})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'xor',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b981' : '#6366f1'} 0%, 
                          ${employee.employmentInfo?.employmentStatus === 'working' ? '#059669' : '#4f46e5'} 100%)`,
                        boxShadow: `0 0 6px ${employee.employmentInfo?.employmentStatus === 'working' ? '#10b98140' : '#6366f140'}`
                      }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em'
                        }}
                      >
                        Joined
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {employee.employmentInfo?.dateOfJoining 
                        ? moment(employee.employmentInfo.dateOfJoining).format('MMM YYYY')
                        : 'N/A'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Professional Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid #e5e7eb',
            borderRadius: 1.5
          }}
        >
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page}
            onPageChange={(event, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            rowsPerPage={pagination.rowsPerPage}
            onRowsPerPageChange={(event) => setPagination(prev => ({
              ...prev,
              rowsPerPage: parseInt(event.target.value, 10),
              page: 0
            }))}
            rowsPerPageOptions={[12, 24, 48, 96]}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiTablePagination-toolbar': {
                minHeight: 48,
                px: 2
              },
              '& .MuiTablePagination-caption': {
                fontSize: '0.8rem',
                fontWeight: 500
              },
              '& .MuiTablePagination-select': {
                fontSize: '0.8rem'
              },
              '& .MuiIconButton-root': {
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                },
                '&.Mui-disabled': {
                  color: '#d1d5db'
                }
              }
            }}
          />
        </Paper>
      </Box>

      {/* Add Employee Dialog */}
      <Dialog
        open={addEmployeeOpen}
        onClose={handleCloseAddEmployee}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          <AddIcon />
          Add New Employee
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
              Personal Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newEmployee.personalInfo.firstName}
                  onChange={(e) => handleNewEmployeeChange('personalInfo', 'firstName', e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newEmployee.personalInfo.lastName}
                  onChange={(e) => handleNewEmployeeChange('personalInfo', 'lastName', e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newEmployee.personalInfo.email}
                  onChange={(e) => handleNewEmployeeChange('personalInfo', 'email', e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newEmployee.personalInfo.phone}
                  onChange={(e) => handleNewEmployeeChange('personalInfo', 'phone', e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={newEmployee.personalInfo.dateOfBirth}
                  onChange={(e) => handleNewEmployeeChange('personalInfo', 'dateOfBirth', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Gender</InputLabel>
                  <Select
                    value={newEmployee.personalInfo.gender}
                    label="Gender"
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'gender', e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="male" sx={{ fontSize: '0.875rem' }}>Male</MenuItem>
                    <MenuItem value="female" sx={{ fontSize: '0.875rem' }}>Female</MenuItem>
                    <MenuItem value="other" sx={{ fontSize: '0.875rem' }}>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Marital Status</InputLabel>
                  <Select
                    value={newEmployee.personalInfo.maritalStatus}
                    label="Marital Status"
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'maritalStatus', e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="single" sx={{ fontSize: '0.875rem' }}>Single</MenuItem>
                    <MenuItem value="married" sx={{ fontSize: '0.875rem' }}>Married</MenuItem>
                    <MenuItem value="divorced" sx={{ fontSize: '0.875rem' }}>Divorced</MenuItem>
                    <MenuItem value="widowed" sx={{ fontSize: '0.875rem' }}>Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
              Employment Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newEmployee.employmentInfo.employeeId}
                  onChange={(e) => handleNewEmployeeChange('employmentInfo', 'employeeId', e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={newEmployee.employmentInfo.designation}
                  onChange={(e) => handleNewEmployeeChange('employmentInfo', 'designation', e.target.value)}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Department</InputLabel>
                  <Select
                    value={newEmployee.employmentInfo.department}
                    label="Department"
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'department', e.target.value)}
                    required
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="IT" sx={{ fontSize: '0.875rem' }}>IT</MenuItem>
                    <MenuItem value="HR" sx={{ fontSize: '0.875rem' }}>HR</MenuItem>
                    <MenuItem value="Finance" sx={{ fontSize: '0.875rem' }}>Finance</MenuItem>
                    <MenuItem value="Marketing" sx={{ fontSize: '0.875rem' }}>Marketing</MenuItem>
                    <MenuItem value="Sales" sx={{ fontSize: '0.875rem' }}>Sales</MenuItem>
                    <MenuItem value="Operations" sx={{ fontSize: '0.875rem' }}>Operations</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Work Location"
                  value={newEmployee.employmentInfo.workLocation}
                  onChange={(e) => handleNewEmployeeChange('employmentInfo', 'workLocation', e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Joining"
                  type="date"
                  value={newEmployee.employmentInfo.dateOfJoining}
                  onChange={(e) => handleNewEmployeeChange('employmentInfo', 'dateOfJoining', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Employment Status</InputLabel>
                  <Select
                    value={newEmployee.employmentInfo.employmentStatus}
                    label="Employment Status"
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'employmentStatus', e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="active" sx={{ fontSize: '0.875rem' }}>Active</MenuItem>
                    <MenuItem value="probation" sx={{ fontSize: '0.875rem' }}>Probation</MenuItem>
                    <MenuItem value="inactive" sx={{ fontSize: '0.875rem' }}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.875rem' }}>Reporting Manager</InputLabel>
                  <Select
                    value={newEmployee.employmentInfo.reportingManager}
                    label="Reporting Manager"
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'reportingManager', e.target.value)}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.875rem' }}>No Manager (Top Level)</MenuItem>
                    {employees.filter(emp => emp._id !== selectedEmployee?._id).map((manager) => (
                      <MenuItem key={manager._id} value={manager._id} sx={{ fontSize: '0.875rem' }}>
                        {manager.personalInfo?.firstName} {manager.personalInfo?.lastName} - {manager.employmentInfo?.designation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseAddEmployee}
            variant="outlined"
            sx={{ 
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleAddEmployee}
            variant="contained"
            disabled={isSubmitting || !newEmployee.personalInfo.firstName || !newEmployee.personalInfo.email || !newEmployee.employmentInfo.employeeId}
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              },
              '&.Mui-disabled': {
                background: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudUploadIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              Import Employee Data
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file containing employee data. Use the template format for best results.
            </Typography>
            
            {/* File Upload Area */}
            <Paper
              sx={{
                border: '2px dashed #e0e0e0',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
              onClick={() => document.getElementById('employee-csv-upload').click()}
            >
              <input
                id="employee-csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {importFile ? importFile.name : 'Click to upload CSV file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported format: CSV files only
              </Typography>
            </Paper>
            
            {importData.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="success.main">
                  ✓ {importData.length} rows loaded from CSV
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Headers: {importHeaders.join(', ')}
                </Typography>
              </Box>
            )}
            
            {isImporting && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={importProgress} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Importing employees... {importProgress}%
                </Typography>
              </Box>
            )}
            
            {importResults && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success">
                  Import completed! {importResults.success || 0} employees imported successfully.
                  {importResults.errors && importResults.errors.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {importResults.errors.length} errors occurred during import.
                    </Typography>
                  )}
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setImportDialogOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={downloadTemplate}
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={isImporting}
          >
            Download Template
          </Button>
          <Button
            onClick={handleImportData}
            variant="contained"
            disabled={importData.length === 0 || isImporting}
            startIcon={isImporting ? null : <CloudUploadIcon />}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WarningIcon />
          Delete All Employees
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action cannot be undone!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>all {employees.length} employees</strong>? 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove all employee records and their associated user accounts from the system.
            Only admin users will remain in the system.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteAllDialogOpen(false)}
            variant="outlined"
            disabled={isDeletingAll}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllEmployees}
            variant="contained"
            color="error"
            disabled={isDeletingAll}
            startIcon={isDeletingAll ? null : <DeleteForeverIcon />}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              }
            }}
          >
            {isDeletingAll ? 'Deleting...' : 'Delete All Employees'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};


// Main EmployeesModule with sub-module navigation
const EmployeesModule = () => {
  const theme = useTheme();
  const [selectedSubModule, setSelectedSubModule] = useState('directory');
  
  const subModules = [
    {
      id: 'directory',
      title: 'Employee Directory',
      description: 'Comprehensive employee directory with search and filters',
      icon: <DirectoryIcon />,
      color: '#1976d2',
      component: EmployeeDirectoryModule,
      stats: { primary: '156', secondary: 'Employees' }
    },
    {
      id: 'onboardings',
      title: 'Onboardings',
      description: 'Manage new employee onboarding processes',
      icon: <LoginIcon />,
      color: '#ed6c02',
      component: OnboardingsModuleFull,
      stats: { primary: '8', secondary: 'In Progress' }
    },
    {
      id: 'exits',
      title: 'Exits',
      description: 'Handle employee exit procedures and offboarding',
      icon: <ArrowBackIcon />,
      color: '#d32f2f',
      component: ExitsModule,
      stats: { primary: '3', secondary: 'This Month' }
    },
    {
      id: 'expense-travel',
      title: 'Expense & Travel',
      description: 'Manage employee expenses and travel requests',
      icon: <BusinessIcon />,
      color: '#9c27b0',
      component: ExpenseTravelModule,
      stats: { primary: '24', secondary: 'Pending' }
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Employee document management and storage',
      icon: <FileUploadIcon />,
      color: '#0288d1',
      component: DocumentsModule,
      stats: { primary: '156', secondary: 'Files' }
    },
    {
      id: 'engage',
      title: 'Engage',
      description: 'Employee engagement and communication tools',
      icon: <PeopleIcon />,
      color: '#f57c00',
      component: EngageModule,
      stats: { primary: '89%', secondary: 'Satisfaction' }
    },
    {
      id: 'assets',
      title: 'Assets',
      description: 'IT assets and equipment management',
      icon: <BusinessIcon />,
      color: '#5d4037',
      component: AssetsModule,
      stats: { primary: '234', secondary: 'Assets' }
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Organization settings and configuration',
      icon: <SettingsIcon />,
      color: '#607d8b',
      component: OrganizationSettingsModule,
      stats: { primary: 'Config', secondary: 'Settings' }
    }
  ];

  const selectedModule = subModules.find(mod => mod.id === selectedSubModule);
  const SelectedComponent = selectedModule?.component || EmployeeDirectoryModule;

  return (
    <>
      {/* Ultra Minimal Navigation */}
      <Box sx={{ 
        px: 3,
        py: 1,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 0,
          justifyContent: 'center',
          alignItems: 'center',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          {subModules.map((subModule, index) => {
            const isActive = selectedSubModule === subModule.id;
            return (
              <Box
                key={subModule.id}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover .nav-text': {
                    color: subModule.color,
                    transform: 'translateY(-1px)'
                  },
                  '&:hover .nav-indicator': {
                    width: '100%',
                    opacity: 0.3
                  }
                }}
                onClick={() => setSelectedSubModule(subModule.id)}
              >
                <Typography
                  className="nav-text"
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? subModule.color : '#64748b',
                    px: 2.5,
                    py: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.025em',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {subModule.title}
                </Typography>
                
                {/* Active Indicator */}
                <Box
                  className="nav-indicator"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isActive ? '80%' : '0%',
                    height: 2,
                    backgroundColor: subModule.color,
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isActive ? 1 : 0
                  }}
                />
                
                {/* Hover Background */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isActive ? '100%' : '0%',
                    height: isActive ? '100%' : '0%',
                    backgroundColor: `${subModule.color}08`,
                    borderRadius: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 0
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Render Selected Component */}
      <SelectedComponent />
    </>
  );
};

// Additional Organization Sub-Modules
const ExitsModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>Employee Exits</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Handle employee exit procedures and offboarding processes
    </Typography>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="error.main">3</Typography>
          <Typography variant="body2">This Month</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="warning.main">2</Typography>
          <Typography variant="body2">In Process</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="info.main">15</Typography>
          <Typography variant="body2">This Year</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="success.main">98%</Typography>
          <Typography variant="body2">Completion Rate</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Box>
);

const ExpenseTravelModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>Expense & Travel</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Manage employee expenses, travel requests, and reimbursements
    </Typography>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="warning.main">24</Typography>
          <Typography variant="body2">Pending Approvals</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="primary.main">₹1.2L</Typography>
          <Typography variant="body2">This Month</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="success.main">156</Typography>
          <Typography variant="body2">Approved</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="info.main">12</Typography>
          <Typography variant="body2">Travel Requests</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Box>
);

const DocumentsModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>Documents</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Employee document management, storage, and compliance tracking
    </Typography>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="primary.main">156</Typography>
          <Typography variant="body2">Total Documents</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="warning.main">8</Typography>
          <Typography variant="body2">Pending Review</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="error.main">3</Typography>
          <Typography variant="body2">Expired</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="success.main">95%</Typography>
          <Typography variant="body2">Compliance Rate</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Box>
);

const EngageModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>Employee Engagement</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Employee engagement tools, surveys, and communication platforms
    </Typography>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="success.main">89%</Typography>
          <Typography variant="body2">Satisfaction Score</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="primary.main">45</Typography>
          <Typography variant="body2">Active Surveys</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="info.main">78%</Typography>
          <Typography variant="body2">Response Rate</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="warning.main">12</Typography>
          <Typography variant="body2">Action Items</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Box>
);

const AssetsModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>IT Assets</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      IT assets and equipment management for employees
    </Typography>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="primary.main">234</Typography>
          <Typography variant="body2">Total Assets</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="success.main">189</Typography>
          <Typography variant="body2">Assigned</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="warning.main">45</Typography>
          <Typography variant="body2">Available</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card><CardContent>
          <Typography variant="h4" color="error.main">5</Typography>
          <Typography variant="body2">Under Repair</Typography>
        </CardContent></Card>
      </Grid>
    </Grid>
  </Box>
);

const OrganizationSettingsModule = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>Organization Settings</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Configure organization-wide settings and preferences
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>General Settings</Typography>
          <Stack spacing={2}>
            <Button variant="outlined" startIcon={<BusinessIcon />}>Company Profile</Button>
            <Button variant="outlined" startIcon={<SettingsIcon />}>System Configuration</Button>
            <Button variant="outlined" startIcon={<PeopleIcon />}>User Roles</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Advanced Settings</Typography>
          <Stack spacing={2}>
            <Button variant="outlined" startIcon={<LockIcon />}>Security Settings</Button>
            <Button variant="outlined" startIcon={<CloudUploadIcon />}>Data Management</Button>
            <Button variant="outlined" startIcon={<HistoryIcon />}>Audit Logs</Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

export default EmployeesModule;
