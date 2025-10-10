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
  CardActionArea,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Group as GroupIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Schedule as ProbationIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
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

// Full-Screen Employee Details View
const EmployeeFullScreenView = ({ employee, onBack, onEditProfile, onSyncEmployee, onEmployeeUpdate }) => {
  const [activeTab, setActiveTab] = useState('ABOUT');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);

  const categories = [
    { id: 'ABOUT', label: 'ABOUT', icon: '👤' },
    { id: 'PROFILE', label: 'PROFILE', icon: '📋' },
    { id: 'JOB', label: 'JOB', icon: '💼' },
    { id: 'EDUCATION', label: 'EDUCATION', icon: '🎓' },
    { id: 'EXPERIENCE', label: 'EXPERIENCE', icon: '💼' },
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
            src={employee.profilePicture?.url ? 
                 (employee.profilePicture.url.startsWith('http') ? employee.profilePicture.url : `http://localhost:5001${employee.profilePicture.url}`) :
                 employee.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
                 employee.additionalInfo?.profilePhoto?.url || 
                 employee.profileImage || 
                 employee.personalInfo?.profilePicture || 
                 ''}
            sx={{ 
              width: 80, 
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {!(employee.profilePicture?.url || 
               employee.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
               employee.additionalInfo?.profilePhoto?.url || 
               employee.profileImage || 
               employee.personalInfo?.profilePicture) && (
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
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.9rem' }}>
                  {employee.employeeId} • {employee.employmentInfo?.designation || 'N/A'}
                  {employee.employmentInfo?.position && (
                    <Chip 
                      label={employee.employmentInfo.position} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                    />
                  )}
                </Typography>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    {employee.employeeId} •
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }} variant="standard">
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={editedEmployee.employmentInfo?.designation || ''}
                      onChange={(e) => handleFieldChange('designation', e.target.value, 'employmentInfo')}
                      label="Designation"
                    >
                      {designations.map((designation) => (
                        <MenuItem key={designation._id} value={designation.name}>
                          {designation.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <FormControl size="small" sx={{ minWidth: 200 }} variant="standard">
                  <InputLabel>Position/Title</InputLabel>
                  <Select
                    value={editedEmployee.employmentInfo?.position || ''}
                    onChange={(e) => handleFieldChange('position', e.target.value, 'employmentInfo')}
                    label="Position/Title"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="CEO">CEO</MenuItem>
                    <MenuItem value="COO">COO</MenuItem>
                    <MenuItem value="CTO">CTO</MenuItem>
                    <MenuItem value="CFO">CFO</MenuItem>
                    <MenuItem value="CMO">CMO</MenuItem>
                    <MenuItem value="CHRO">CHRO</MenuItem>
                    <MenuItem value="VP">VP</MenuItem>
                    <MenuItem value="Director">Director</MenuItem>
                    <MenuItem value="Senior Manager">Senior Manager</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Team Lead">Team Lead</MenuItem>
                    <MenuItem value="Senior Executive">Senior Executive</MenuItem>
                    <MenuItem value="Executive">Executive</MenuItem>
                    <MenuItem value="Senior Associate">Senior Associate</MenuItem>
                    <MenuItem value="Associate">Associate</MenuItem>
                    <MenuItem value="Trainee">Trainee</MenuItem>
                    <MenuItem value="Intern">Intern</MenuItem>
                    <MenuItem value="Consultant">Consultant</MenuItem>
                    <MenuItem value="Specialist">Specialist</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
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
        {activeTab === 'EDUCATION' && <EducationSection employee={employee} />}
        {activeTab === 'EXPERIENCE' && <ExperienceSection employee={employee} />}
        {activeTab === 'TIME' && <TimeSection employee={employee} />}
        {activeTab === 'DOCUMENTS' && <DocumentsSection employee={employee} onEmployeeUpdate={onEmployeeUpdate} />}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#f8fafc', 
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#64748b', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
              mb: 1,
              display: 'block'
            }}>
              Full Name
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#1e293b', 
              fontWeight: 600,
              fontSize: '1.1rem',
              mb: 0.5
            }}>
              {isEditable ? editedEmployee?.personalInfo?.firstName : employee.personalInfo?.firstName} {isEditable ? editedEmployee?.personalInfo?.lastName : employee.personalInfo?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              Employee ID: {employee.employeeId || 'Not assigned'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Date of Birth
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable 
                    ? (editedEmployee?.personalInfo?.dateOfBirth ? moment(editedEmployee.personalInfo.dateOfBirth).format('YYYY-MM-DD') : '')
                    : (employee.personalInfo?.dateOfBirth 
                      ? moment(employee.personalInfo.dateOfBirth).format('DD MMM YYYY')
                      : employee.additionalInfo?.['Date Of Birth'] || 'Not provided')
                  }
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.gender : employee.personalInfo?.gender || employee.additionalInfo?.Gender || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Marital Status
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.maritalStatus : employee.personalInfo?.maritalStatus || employee.additionalInfo?.['Marital Status'] || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Nationality
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.nationality : employee.personalInfo?.nationality || employee.additionalInfo?.Nationality || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </SectionCard>
    </Grid>

    {/* Contact Details */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="📞" title="Contact Details" color="info.main">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#64748b', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.75rem',
              mb: 1,
              display: 'block'
            }}>
              Work Email
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#1e293b', 
              fontWeight: 500,
              fontSize: '0.95rem'
            }}>
              {isEditable ? editedEmployee?.personalInfo?.email : employee.personalInfo?.email || employee.user?.email || employee.additionalInfo?.['Work Email'] || 'Not provided'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Mobile Phone
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.phone : employee.personalInfo?.phone || employee.contactInfo?.phone || employee.additionalInfo?.['Mobile Phone'] || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Alternate Phone
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.alternatePhone : employee.personalInfo?.alternatePhone || employee.additionalInfo?.['Work Phone'] || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography variant="caption" sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.75rem',
                  mb: 1,
                  display: 'block'
                }}>
                  Personal Email
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {isEditable ? editedEmployee?.personalInfo?.personalEmailId : employee.additionalInfo?.['Personal Email'] || employee.contactInfo?.personalEmail || 'Not provided'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
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
const ProfileSection = ({ employee }) => {
  const maskSensitiveData = (value) => {
    if (!value) return 'Not provided';
    if (value.length <= 4) return value;
    return `****${value.slice(-4)}`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <SectionCard icon="📄" title="Government & Legal" color="warning.main">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    PAN Number
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    fontFamily: 'monospace'
                  }}>
                    {maskSensitiveData(employee.additionalInfo?.['PAN Number'] || employee.salaryInfo?.taxInfo?.panNumber)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    Aadhaar Number
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    fontFamily: 'monospace'
                  }}>
                    {maskSensitiveData(employee.additionalInfo?.['Aadhaar Number'] || employee.salaryInfo?.taxInfo?.aadharNumber)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    PF Number
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    fontFamily: 'monospace'
                  }}>
                    {employee.additionalInfo?.['PF Number'] || employee.salaryInfo?.taxInfo?.pfNumber || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    UAN Number
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    fontFamily: 'monospace'
                  }}>
                    {employee.additionalInfo?.['UAN Number'] || employee.salaryInfo?.taxInfo?.uanNumber || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionCard icon="📋" title="Additional Information" color="grey.600">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                <Box key={key} sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}>
                    {value}
                  </Typography>
                </Box>
              ))
            }
            {(!employee.additionalInfo || Object.entries(employee.additionalInfo).filter(([key, value]) => {
              const excludedKeys = [
                'Employee Number', 'Display Name', 'Full Name', 'Work Email', 'Date Of Birth', 'Gender', 
                'Marital Status', 'Personal Email', 'Mobile Phone', 'Work Phone', 'Current Address Line 1', 
                'Permanent Address Line 1', 'Father Name', 'Spouse Name', 'Location', 'Location Country',
                'Department', 'Job Title', 'Date Joined', 'Employment Status', 'Worker Type', 'Reporting To',
                'PAN Number', 'Aadhaar Number', 'PF Number', 'UAN Number', 'Blood Group', 'Physically Handicapped',
                'Nationality'
              ];
              const complexObjectKeys = [
                'onboardingId', 'candidatePortalData', 'itSetupData', 'hrSetupData', 'allEmergencyContacts',
                'offerLetterData', 'orientationData', 'onboardingTasks', 'stepProgress', 'educationQualifications',
                'workExperience', 'governmentDocuments', 'bankDocuments', 'educationDocuments', 
                'workExperienceDocuments', 'onboardingCompletedAt', 'documentsSubmittedAt'
              ];
              return !excludedKeys.includes(key) && 
                     !complexObjectKeys.includes(key) &&
                     (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') &&
                     value !== null && value !== undefined && value !== '';
            }).length === 0) && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                px: 3
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#9ca3af'
                }}>
                  No additional information available
                </Typography>
              </Box>
            )}
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

// Job Section Component
const JobSection = ({ employee, isEditable = false, editedEmployee, onFieldChange }) => {
  const getEmploymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10b981';
      case 'probation': return '#f59e0b';
      case 'inactive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEmploymentStatusChip = (status) => {
    if (!status) return null;
    return (
      <Chip 
        label={status}
        size="small"
        sx={{ 
          bgcolor: getEmploymentStatusColor(status) + '20',
          color: getEmploymentStatusColor(status),
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 20
        }}
      />
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <SectionCard icon="💼" title="Employment Information" color="success.main">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ 
              p: 2.5, 
              bgcolor: '#f8fafc', 
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="caption" sx={{ 
                color: '#64748b', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                mb: 1,
                display: 'block'
              }}>
                Current Position
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#1e293b', 
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5
              }}>
                {isEditable ? editedEmployee?.employmentInfo?.designation : employee.employmentInfo?.designation || employee.additionalInfo?.['Job Title'] || 'Not specified'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#64748b',
                fontSize: '0.875rem',
                mb: 1
              }}>
                {isEditable ? editedEmployee?.employmentInfo?.department : employee.employmentInfo?.department?.name || employee.additionalInfo?.Department || 'Department not specified'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEmploymentStatusChip(isEditable ? editedEmployee?.employmentInfo?.employmentStatus : employee.employmentInfo?.employmentStatus || employee.additionalInfo?.['Employment Status'])}
                <Typography variant="caption" sx={{ 
                  color: '#9ca3af',
                  fontSize: '0.75rem'
                }}>
                  Joined: {isEditable 
                    ? (editedEmployee?.employmentInfo?.dateOfJoining ? moment(editedEmployee.employmentInfo.dateOfJoining).format('MMM YYYY') : '')
                    : (employee.employmentInfo?.dateOfJoining 
                      ? moment(employee.employmentInfo.dateOfJoining).format('MMM YYYY')
                      : employee.additionalInfo?.['Date Joined'] || 'Not specified')
                  }
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    Worker Type
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}>
                    {isEditable ? editedEmployee?.employmentInfo?.employeeType : employee.employmentInfo?.employeeType || employee.additionalInfo?.['Worker Type'] || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    Work Location
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}>
                    {isEditable ? editedEmployee?.employmentInfo?.workLocation : employee.employmentInfo?.workLocation || employee.additionalInfo?.Location || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f0f9ff', 
                  borderRadius: 2,
                  border: '1px solid #e0f2fe'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: '#0369a1', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block'
                  }}>
                    Reporting Manager
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#0c4a6e', 
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}>
                    {employee.employmentInfo?.reportingManager ? 
                      `${employee.employmentInfo.reportingManager.personalInfo?.firstName || ''} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || ''}`.trim() || 'Not specified' :
                      employee.additionalInfo?.reporting_to || 
                      employee.additionalInfo?.['Reporting To'] || 'Not specified'
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

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

const DocumentsSection = ({ employee, onEmployeeUpdate }) => {
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
  const [syncing, setSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Function to refresh employee data from server
  const refreshEmployeeData = async () => {
    console.log('🔍 refreshEmployeeData called, employee ID:', employee?._id, 'onEmployeeUpdate:', !!onEmployeeUpdate);
    if (!employee?._id || !onEmployeeUpdate) return;
    
    try {
      console.log('🔍 Fetching updated employee data from server...');
      const response = await axios.get(`/employees/${employee._id}`);
      if (response.data) {
        console.log('🔍 Updated employee data received:', response.data);
        console.log('🔍 Profile picture in updated data:', response.data.profilePicture);
        onEmployeeUpdate(response.data);
      }
    } catch (error) {
      console.error('Error refreshing employee data:', error);
    }
  };
  
  
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

  const handleSyncDocuments = async () => {
    if (!employee?.employeeId) {
      toast.error('Employee ID not found');
      return;
    }

    setSyncing(true);
    try {
      console.log(`🔄 Syncing documents for employee: ${employee.employeeId}`);
      
      const response = await axios.post('/employees/sync-documents', {
        employeeId: employee.employeeId
      });

      if (response.data.success) {
        const { newDocumentsAdded, totalDocuments, candidatePortalDocuments } = response.data.data;
        
        toast.success(`Documents synced successfully! ${newDocumentsAdded} new documents added. Total: ${totalDocuments}`);
        
        // Refresh the page to show updated documents
        window.location.reload();
      } else {
        toast.error(response.data.message || 'Failed to sync documents');
      }
    } catch (error) {
      console.error('❌ Sync documents error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sync documents from candidate portal';
      toast.error(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!employee?._id) {
      toast.error('Employee ID not found');
      return;
    }

    try {
      console.log(`Uploading ${documentType}:`, file.name);
      
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      formData.append('name', file.name);

      const response = await axios.post(`/employees/${employee._id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message === 'Document uploaded successfully') {
        toast.success(`${documentType} uploaded successfully!`);
        
        // Close dialog with a small delay to prevent focus issues
        setTimeout(() => {
          setOpenUploadDialog(false);
        }, 100);
        
        // Refresh employee data to get the updated documents from server
        await refreshEmployeeData();
      } else {
        toast.error('Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
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

    if (!employee?._id) {
      toast.error('Employee ID not found');
      return;
    }
    
    setUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name);
        
        try {
          // Determine document type based on filename
          const fileName = file.name.toLowerCase();
          let documentType = 'other';
          
          if (fileName.includes('aadhaar') || fileName.includes('aadhar')) {
            documentType = 'aadhaar';
          } else if (fileName.includes('pan')) {
            documentType = 'pan';
          } else if (fileName.includes('cheque') || fileName.includes('check')) {
            documentType = 'cancelled_cheque';
          } else if (fileName.includes('passbook')) {
            documentType = 'passbook';
          } else if (fileName.includes('statement') || fileName.includes('bank')) {
            documentType = 'bank_statement';
          } else if (fileName.includes('mark') || fileName.includes('degree') || fileName.includes('certificate')) {
            documentType = 'education';
          } else if (fileName.includes('exp') || fileName.includes('experience') || fileName.includes('offer')) {
            documentType = 'work_experience';
          }
          
          const formData = new FormData();
          formData.append('document', file);
          formData.append('type', documentType);
          formData.append('name', file.name);

          const response = await axios.post(`/employees/${employee._id}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.message === 'Document uploaded successfully') {
            successCount++;
            console.log(`✅ Successfully uploaded: ${file.name}`);
            
            // Document uploaded successfully - will refresh all data at the end
          } else {
            errorCount++;
            console.error(`❌ Failed to upload: ${file.name}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error uploading ${file.name}:`, error);
          // Continue with next file instead of crashing
        }
        
        // Add small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Show summary
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} document(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} document(s)`);
      }
      
      // Close dialog and refresh data
      if (isMounted) {
        setTimeout(() => {
          setOpenBulkUploadDialog(false);
          setSelectedFiles([]);
        }, 100);
      }
      
      // Refresh employee data to get all updated documents from server
      if (successCount > 0) {
        await refreshEmployeeData();
      }
      
      console.log(`📄 Upload summary: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Error uploading documents. Please try again.');
      if (isMounted) {
        setOpenBulkUploadDialog(false);
        setSelectedFiles([]);
      }
    } finally {
      if (isMounted) {
        setUploading(false);
      }
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
      
      // Construct full URL if needed
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:5001${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      
      console.log('🔗 Attempting to download:', fullUrl);
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
          const response = await fetch(fullUrl);
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
        if (doc) {
          allDocuments.push({ ...doc, category: 'Government' });
        }
      });

      // Add bank documents
      Object.entries(bankDocs).forEach(([key, doc]) => {
        if (doc) {
          allDocuments.push({ ...doc, category: 'Bank' });
        }
      });

      // Add education documents
      educationDocs.forEach(doc => {
        allDocuments.push({ ...doc, category: 'Education' });
      });

      // Add work experience documents
      workExpDocs.forEach(doc => {
        allDocuments.push({ ...doc, category: 'Work Experience' });
      });

      // Add other documents
      documents.forEach(doc => {
        allDocuments.push({ ...doc, category: 'Other' });
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

  const handleSaveDocumentName = async () => {
    if (editingDocument && documentName.trim()) {
      try {
        console.log('Saving document name:', documentName);
        
        // Get the employee ID
        const employeeId = employee._id;
        if (!employeeId) {
          alert('Error: Unable to identify employee ID');
          return;
        }

        // Get the document ID
        const documentId = editingDocument.id || editingDocument._id;
        if (!documentId) {
          alert('Error: Unable to identify document ID');
          return;
        }

        // Call the employee API to update the document name
        const response = await axios.put(`/employees/${employeeId}/document/${documentId}/name`, {
          name: documentName.trim()
        });

        const result = response.data;

        if (result.success) {
          // Refresh employee data from server to get updated document name
          await refreshEmployeeData();
          
          alert('Document name updated successfully!');
          setOpenEditDialog(false);
          setEditingDocument(null);
          setDocumentName('');
        } else {
          alert(`Error: ${result.message || 'Failed to update document name'}`);
        }
      } catch (error) {
        console.error('Error updating document name:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error updating document name. Please try again.';
        alert(errorMessage);
      }
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
      // Get the employee ID
      const employeeId = employee._id;
      if (!employeeId) {
        alert('Error: Unable to identify employee ID');
        return;
      }

      // Get the document ID
      const documentId = deletingDocument.id || deletingDocument._id;
      if (!documentId) {
        alert('Error: Unable to identify document ID');
        return;
      }

      // Call the employee API to delete the document
      const response = await axios.delete(`/employees/${employeeId}/document/${documentId}`);
      const result = response.data;

      if (result.success) {
        // Refresh employee data from server to reflect the deletion
        await refreshEmployeeData();
        
        alert('Document deleted successfully!');
        setOpenDeleteDialog(false);
        setDeletingDocument(null);
      } else {
        alert(`Error: ${result.message || 'Failed to delete document'}`);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting document. Please try again.';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleSetAsProfilePicture = async (doc) => {
    console.log('🔍 Set as profile picture clicked for document:', doc);
    try {
      // Get the employee ID
      const employeeId = employee._id;
      console.log('🔍 Employee ID:', employeeId);
      if (!employeeId) {
        alert('Error: Unable to identify employee ID');
        return;
      }

      // Get the document ID
      const documentId = doc.id || doc._id;
      console.log('🔍 Document ID:', documentId);
      if (!documentId) {
        alert('Error: Unable to identify document ID');
        return;
      }

      // Check if the document is an image
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      const fileExtension = doc.name.toLowerCase().substring(doc.name.lastIndexOf('.'));
      console.log('🔍 File extension:', fileExtension);
      
      if (!imageExtensions.includes(fileExtension)) {
        alert('Only image files can be set as profile picture');
        return;
      }

      console.log('🔍 Making API call to set profile picture...');
      // Call the employee API to set as profile picture
      const response = await axios.put(`/employees/${employeeId}/document/${documentId}/set-profile-picture`);
      const result = response.data;
      console.log('🔍 API response:', result);

      if (result.success) {
        console.log('🔍 Profile picture API success, refreshing employee data...');
        // Refresh employee data from server to reflect the change
        await refreshEmployeeData();
        console.log('🔍 Employee data refreshed, checking profile picture:', employee?.profilePicture);
        
        alert('Profile picture updated successfully!');
      } else {
        alert(`Error: ${result.message || 'Failed to set profile picture'}`);
      }
    } catch (error) {
      console.error('❌ Set profile picture error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error setting profile picture. Please try again.';
      alert(errorMessage);
    }
  };

  // Get documents from employee data and merge with uploaded documents
  console.log('📄 Current employee data:', employee);
  console.log('📄 Employee profile picture:', employee?.profilePicture);
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">{doc.name || 'Document'}</Typography>
            {employee?.profilePicture?.documentId === (doc.id || doc._id) && (
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                px: 1, 
                py: 0.25, 
                borderRadius: 1, 
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                📸 PROFILE
              </Box>
            )}
          </Box>
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
          onClick={() => {
            const fileUrl = doc.url || doc.filePath;
            const fullUrl = fileUrl?.startsWith('http') ? fileUrl : `http://localhost:5001${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
            window.open(fullUrl, '_blank');
          }}
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
        {/* Set as Profile Picture button - only show for image files */}
        {(() => {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
          const fileExtension = doc.name.toLowerCase().substring(doc.name.lastIndexOf('.'));
          const isImage = imageExtensions.includes(fileExtension);
          
          if (isImage) {
            return (
              <Button 
                size="small" 
                variant="outlined" 
                color="primary"
                onClick={() => {
                  console.log('🔍 Profile picture button clicked for:', doc);
                  handleSetAsProfilePicture(doc);
                }}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                📸 Set as Profile
              </Button>
            );
          }
          return null;
        })()}
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
                onClick={handleSyncDocuments}
                disabled={syncing}
                startIcon={<SyncIcon />}
                sx={{ 
                  borderColor: 'info.main',
                  color: 'info.main',
                  '&:hover': { 
                    borderColor: 'info.dark',
                    bgcolor: 'info.light',
                    color: 'info.dark'
                  }
                }}
              >
                {syncing ? 'Syncing...' : 'Sync from Portal'}
              </Button>
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
            {governmentDocs.aadhaarImage && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🆔</span>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">Aadhaar Card</Typography>
                      {employee?.profilePicture?.documentId === governmentDocs.aadhaarImage.id && (
                        <Box sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          px: 1, 
                          py: 0.25, 
                          borderRadius: 1, 
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          📸 PROFILE
                        </Box>
                      )}
                    </Box>
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
                    color="primary"
                    onClick={() => {
                      console.log('🔍 Aadhaar profile picture button clicked for:', governmentDocs.aadhaarImage);
                      handleSetAsProfilePicture(governmentDocs.aadhaarImage);
                    }}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    📸 Set as Profile
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

            {governmentDocs.panImage && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📋</span>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">PAN Card</Typography>
                      {employee?.profilePicture?.documentId === governmentDocs.panImage.id && (
                        <Box sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          px: 1, 
                          py: 0.25, 
                          borderRadius: 1, 
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          📸 PROFILE
                        </Box>
                      )}
                    </Box>
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
                    color="primary"
                    onClick={() => {
                      console.log('🔍 PAN profile picture button clicked for:', governmentDocs.panImage);
                      handleSetAsProfilePicture(governmentDocs.panImage);
                    }}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    📸 Set as Profile
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
            {bankDocs.cancelledCheque && (
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

            {bankDocs.passbook && (
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

            {bankDocs.bankStatement && (
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
            {educationDocs.map((doc) => renderDocumentItem(doc, 'Education', '🎓'))}

            {/* Work Experience Documents */}
            {workExpDocs.map((doc) => renderDocumentItem(doc, 'Work Experience', '💼'))}

            {/* Other Documents */}
            {documents.map((doc) => renderDocumentItem(doc, doc.type || 'Other', '📄'))}

            {/* Show message if no documents */}
            {documents.length === 0 && 
             Object.keys(governmentDocs).length === 0 && 
             Object.keys(bankDocs).length === 0 && 
             educationDocs.length === 0 && 
             workExpDocs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No documents uploaded yet
                </Typography>
              </Box>
            )}
          </Box>

          {/* Single File Upload Dialog */}
          <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Upload {documentType}</DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select a file to upload. Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="single-file-input"
                />
                <label htmlFor="single-file-input">
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
                    📁 Choose File
                  </Button>
                </label>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>

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

const AssetsSection = ({ employee }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee?._id) {
      fetchEmployeeAssets();
    }
  }, [employee?._id]);

  const fetchEmployeeAssets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/assets/employee/${employee._id}`);
      setAssets(response.data.assets || []);
    } catch (error) {
      console.error('Error fetching employee assets:', error);
      setError('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const getAssetCategoryIcon = (category) => {
    const icons = {
      'laptop': '💻',
      'desktop': '🖥️',
      'mobile': '📱',
      'tablet': '📱',
      'monitor': '🖥️',
      'keyboard': '⌨️',
      'mouse': '🖱️',
      'headphones': '🎧',
      'printer': '🖨️',
      'scanner': '📄',
      'projector': '📽️',
      'camera': '📷',
      'furniture': '🪑',
      'software_license': '💿',
      'other': '🔧'
    };
    return icons[category] || '🔧';
  };

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'success',
      'available': 'info',
      'maintenance': 'warning',
      'retired': 'error',
      'lost': 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard icon="🏢" title="Assets" color="secondary.main">
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ mt: 1 }}>Loading assets...</Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard icon="🏢" title="Assets" color="secondary.main">
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={fetchEmployeeAssets}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </SectionCard>
        </Grid>
      </Grid>
    );
  }

  if (assets.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard icon="🏢" title="Assets" color="secondary.main">
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No assets assigned to this employee
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    );
  }

  // Group assets by category
  const assetsByCategory = assets.reduce((acc, asset) => {
    const category = asset.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(asset);
    return acc;
  }, {});

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="🏢" title="Assets" color="secondary.main">
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Assigned Assets ({assets.length})
            </Typography>
          </Box>
          
          {Object.entries(assetsByCategory).map(([category, categoryAssets]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, fontSize: '1.2em' }}>
                  {getAssetCategoryIcon(category)}
                </Box>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} ({categoryAssets.length})
              </Typography>
              
              <Grid container spacing={2}>
                {categoryAssets.map((asset) => (
                  <Grid item xs={12} sm={6} md={4} key={asset._id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {asset.name}
                          </Typography>
                          <Chip 
                            size="small" 
                            color={getStatusColor(asset.status)}
                            label={asset.status}
                          />
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {asset.assetId}
                        </Typography>
                        
                        {asset.serialNumber && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Serial: {asset.serialNumber}
                          </Typography>
                        )}
                        
                        {asset.brand && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Brand: {asset.brand}
                          </Typography>
                        )}
                        
                        {asset.condition && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Condition: {asset.condition}
                          </Typography>
                        )}
                        
                        {asset.currentAssignment?.assignedDate && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Assigned: {new Date(asset.currentAssignment.assignedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={fetchEmployeeAssets}
              startIcon={<RefreshIcon />}
            >
              Refresh Assets
            </Button>
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

// Education Section Component
const EducationSection = ({ employee }) => {
  // Check for education data in both new structure and legacy structure
  const newEducationData = employee?.education || [];
  const legacyEducationData = employee?.additionalInfo?.educationQualifications || [];
  
  // Debug: Log the data structures to console
  console.log('Employee data for education:', {
    newEducationData,
    legacyEducationData,
    additionalInfo: employee?.additionalInfo
  });
  
  const educationData = newEducationData.length > 0 ? newEducationData : legacyEducationData;

  const getDegreeIcon = (degree) => {
    if (degree?.toLowerCase().includes('phd') || degree?.toLowerCase().includes('doctorate')) return '🎓';
    if (degree?.toLowerCase().includes('master')) return '🎓';
    if (degree?.toLowerCase().includes('bachelor')) return '🎓';
    if (degree?.toLowerCase().includes('diploma')) return '📜';
    return '🎓';
  };

  const getDegreeColor = (degree) => {
    if (degree?.toLowerCase().includes('phd') || degree?.toLowerCase().includes('doctorate')) return '#8b5cf6';
    if (degree?.toLowerCase().includes('master')) return '#3b82f6';
    if (degree?.toLowerCase().includes('bachelor')) return '#10b981';
    if (degree?.toLowerCase().includes('diploma')) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="🎓" title="Educational Background" color="info.main">
          {educationData.length > 0 ? (
            educationData.map((edu, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 3, 
                  border: '1px solid #e5e7eb',
                  borderRadius: 3,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: getDegreeColor(edu.degree),
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>
                        {getDegreeIcon(edu.degree)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1f2937', 
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: '1.1rem'
                      }}>
                        {edu.degree || 'Degree Not Specified'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontWeight: 500
                      }}>
                        {edu.institution || 'Institution Not Specified'}
                      </Typography>
                    </Box>
                    {edu.yearOfPassing && (
                      <Chip 
                        label={edu.yearOfPassing}
                        size="small"
                        sx={{ 
                          bgcolor: '#f3f4f6',
                          color: '#374151',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f9fafb', 
                        borderRadius: 2,
                        border: '1px solid #f3f4f6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280', 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.7rem'
                        }}>
                          Year of Passing
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#1f2937', 
                          fontWeight: 500,
                          mt: 0.5
                        }}>
                          {edu.yearOfPassing || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f9fafb', 
                        borderRadius: 2,
                        border: '1px solid #f3f4f6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280', 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.7rem'
                        }}>
                          Performance
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#1f2937', 
                          fontWeight: 500,
                          mt: 0.5
                        }}>
                          {edu.percentage || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    {edu.specialization && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: '#f0f9ff', 
                          borderRadius: 2,
                          border: '1px solid #e0f2fe'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#0369a1', 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem'
                          }}>
                            Specialization
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#0c4a6e', 
                            fontWeight: 500,
                            mt: 0.5
                          }}>
                            {edu.specialization}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: '#f3f4f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography sx={{ fontSize: '2rem' }}>🎓</Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#6b7280', 
                fontWeight: 500,
                mb: 1
              }}>
                No Education Information
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#9ca3af',
                maxWidth: 300,
                mx: 'auto'
              }}>
                Educational background information has not been added for this employee yet.
              </Typography>
            </Box>
          )}
        </SectionCard>
      </Grid>
    </Grid>
  );
};

// Experience Section Component
const ExperienceSection = ({ employee }) => {
  // Check for experience data in multiple possible structures
  const newExperienceData = employee?.experience || [];
  const legacyExperienceData = employee?.additionalInfo?.workExperience || [];
  const onboardingExperienceData = employee?.additionalInfo?.experience || [];
  const candidatePortalExperienceData = employee?.additionalInfo?.candidatePortalData?.workExperience?.experienceDetails || [];
  
  // Debug: Log the data structures to console
  console.log('Employee data for experience:', {
    newExperienceData,
    legacyExperienceData,
    onboardingExperienceData,
    candidatePortalExperienceData,
    additionalInfo: employee?.additionalInfo
  });
  
  // Try different data sources in order of preference
  const experienceData = newExperienceData.length > 0 ? newExperienceData : 
                        legacyExperienceData.length > 0 ? legacyExperienceData :
                        onboardingExperienceData.length > 0 ? onboardingExperienceData :
                        candidatePortalExperienceData.length > 0 ? candidatePortalExperienceData : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return moment(dateString).format('MMM YYYY');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not provided';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getExperienceDuration = (startDate, endDate) => {
    if (!startDate) return 'Duration not specified';
    
    const start = moment(startDate);
    const end = endDate ? moment(endDate) : moment();
    const duration = moment.duration(end.diff(start));
    
    const years = Math.floor(duration.asYears());
    const months = Math.floor(duration.asMonths()) % 12;
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return 'Less than a month';
    }
  };

  const isCurrentJob = (endDate) => {
    return !endDate || endDate === '' || endDate === null;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="💼" title="Work Experience" color="success.main">
          {experienceData.length > 0 ? (
            experienceData.map((exp, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 3, 
                  border: '1px solid #e5e7eb',
                  borderRadius: 3,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: isCurrentJob(exp.endDate || exp.toDate || exp.endingDate) ? '#10b981' : '#6b7280',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>
                        💼
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1f2937', 
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          mr: 1
                        }}>
                          {exp.position || exp.jobTitle || exp.role || 'Position Not Specified'}
                        </Typography>
                        {isCurrentJob(exp.endDate || exp.toDate || exp.endingDate) && (
                          <Chip 
                            label="Current"
                            size="small"
                            sx={{ 
                              bgcolor: '#dcfce7',
                              color: '#166534',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ 
                        color: '#6b7280',
                        fontWeight: 500,
                        mb: 1
                      }}>
                        {exp.company || exp.companyName || exp.organization || 'Company Not Specified'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" sx={{ 
                          color: '#9ca3af',
                          fontSize: '0.75rem'
                        }}>
                          {formatDate(exp.startDate || exp.fromDate || exp.startingDate)} - {isCurrentJob(exp.endDate || exp.toDate || exp.endingDate) ? 'Present' : formatDate(exp.endDate || exp.toDate || exp.endingDate)}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          • {getExperienceDuration(exp.startDate || exp.fromDate || exp.startingDate, exp.endDate || exp.toDate || exp.endingDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {(exp.salary || exp.lastSalary || exp.ctc) && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: '#f0fdf4', 
                          borderRadius: 2,
                          border: '1px solid #dcfce7'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#166534', 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem'
                          }}>
                            Last Salary
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#15803d', 
                            fontWeight: 600,
                            mt: 0.5
                          }}>
                            {formatCurrency(exp.salary || exp.lastSalary || exp.ctc)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f9fafb', 
                        borderRadius: 2,
                        border: '1px solid #f3f4f6'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: '#6b7280', 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.7rem'
                        }}>
                          Duration
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#1f2937', 
                          fontWeight: 500,
                          mt: 0.5
                        }}>
                          {getExperienceDuration(exp.startDate || exp.fromDate || exp.startingDate, exp.endDate || exp.toDate || exp.endingDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    {(exp.reasonForLeaving || exp.reason || exp.description) && (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: '#fef3c7', 
                          borderRadius: 2,
                          border: '1px solid #fde68a'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#92400e', 
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem'
                          }}>
                            Reason for Leaving
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#b45309', 
                            fontWeight: 500,
                            mt: 0.5
                          }}>
                            {exp.reasonForLeaving || exp.reason || exp.description}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: '#f3f4f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography sx={{ fontSize: '2rem' }}>💼</Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#6b7280', 
                fontWeight: 500,
                mb: 1
              }}>
                No Work Experience
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#9ca3af',
                maxWidth: 300,
                mx: 'auto'
              }}>
                Work experience information has not been added for this employee yet.
              </Typography>
            </Box>
          )}
        </SectionCard>
      </Grid>
    </Grid>
  );
};

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
  const [designations, setDesignations] = useState([]);
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
      personalEmail: '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: '',
      bloodGroup: '',
      fatherName: '',
      spouseName: '',
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
        country: 'India'
      }
    },
    employmentInfo: {
      employeeId: '',
      designation: '',
      department: '',
      subDepartment: '',
      dateOfJoining: '',
      employmentStatus: 'active',
      workLocation: '',
      reportingManager: '',
      reportingManagerEmpNo: '',
      reportingManagerName: '',
      dottedLineManager: '',
      legalEntity: '',
      businessUnit: '',
      secondaryJobTitle: '',
      attendanceNumber: '',
      locationCountry: '',
      leavePlan: '',
      band: '',
      payGrade: '',
      timeType: '',
      workerType: '',
      shiftPolicy: '',
      weeklyOffPolicy: '',
      attendancePolicy: '',
      attendanceCaptureScheme: '',
      holidayList: '',
      expensePolicy: '',
      noticePeriod: '',
      pfNumber: '',
      uanNumber: '',
      exitDate: '',
      exitStatus: '',
      terminationType: '',
      terminationReason: '',
      resignationNote: '',
      costCenter: '',
      comments: ''
    },
    identityInfo: {
      panNumber: '',
      aadhaarNumber: '',
      passportNumber: '',
      drivingLicense: ''
    },
    financialInfo: {
      currentSalary: {
        basic: '',
        hra: '',
        allowances: '',
        gross: '',
        ctc: ''
      },
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: '',
        branchName: ''
      },
      taxInfo: {
        taxDeduction: '',
        tds: '',
        taxSlab: ''
      }
    },
    education: [{
      degree: '',
      institution: '',
      yearOfPassing: '',
      percentage: '',
      specialization: ''
    }],
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      salary: '',
      reasonForLeaving: ''
    }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState(0);
  
  // Delete All Dialog State
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);


  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, pagination.rowsPerPage, searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
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

  const fetchDesignations = async () => {
    try {
      const response = await axios.get('/designations', {
        params: { isActive: 'true' }
      });
      setDesignations(response.data.designations || []);
    } catch (error) {
      console.error('Error fetching designations:', error);
      // Fallback to empty array if API fails
      setDesignations([]);
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

  const handleEmployeeClick = async (employee) => {
    try {
      // Fetch full employee data including documents
      const response = await axios.get(`/employees/${employee._id}`);
      if (response.data) {
        setSelectedEmployee(response.data);
        setShowFullScreenView(true);
      } else {
        // Fallback to list data if fetch fails
        setSelectedEmployee(employee);
        setShowFullScreenView(true);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // Fallback to list data if fetch fails
      setSelectedEmployee(employee);
      setShowFullScreenView(true);
    }
  };

  const handleBackToDirectory = () => {
    setShowFullScreenView(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeUpdate = (updatedEmployee) => {
    setSelectedEmployee(updatedEmployee);
    
    // Also update the employee in the list if it exists
    setEmployees(prev => prev.map(emp => 
      emp._id === updatedEmployee._id ? updatedEmployee : emp
    ));
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
  const handleNewEmployeeChange = (section, field, value, subsection = null) => {
    setNewEmployee(prev => {
      if (subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [field]: value
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
  };

  const handleAddEmployee = async () => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        personalInfo: {
          firstName: newEmployee.personalInfo.firstName,
          lastName: newEmployee.personalInfo.lastName,
          email: newEmployee.personalInfo.email,
          phone: newEmployee.personalInfo.phone,
          personalEmail: newEmployee.personalInfo.personalEmail,
          alternatePhone: newEmployee.personalInfo.alternatePhone,
          dateOfBirth: newEmployee.personalInfo.dateOfBirth,
          gender: newEmployee.personalInfo.gender,
          maritalStatus: newEmployee.personalInfo.maritalStatus,
          nationality: newEmployee.personalInfo.nationality,
          bloodGroup: newEmployee.personalInfo.bloodGroup,
          fatherName: newEmployee.personalInfo.fatherName,
          spouseName: newEmployee.personalInfo.spouseName,
          currentAddress: newEmployee.personalInfo.currentAddress,
          permanentAddress: newEmployee.personalInfo.permanentAddress
        },
        employmentInfo: {
          employeeId: newEmployee.employmentInfo.employeeId,
          designation: newEmployee.employmentInfo.designation,
          department: newEmployee.employmentInfo.department,
          subDepartment: newEmployee.employmentInfo.subDepartment,
          dateOfJoining: newEmployee.employmentInfo.dateOfJoining,
          employmentStatus: newEmployee.employmentInfo.employmentStatus,
          workLocation: newEmployee.employmentInfo.workLocation,
          reportingManager: newEmployee.employmentInfo.reportingManager,
          reportingManagerEmpNo: newEmployee.employmentInfo.reportingManagerEmpNo,
          reportingManagerName: newEmployee.employmentInfo.reportingManagerName,
          dottedLineManager: newEmployee.employmentInfo.dottedLineManager,
          legalEntity: newEmployee.employmentInfo.legalEntity,
          businessUnit: newEmployee.employmentInfo.businessUnit,
          secondaryJobTitle: newEmployee.employmentInfo.secondaryJobTitle,
          attendanceNumber: newEmployee.employmentInfo.attendanceNumber,
          locationCountry: newEmployee.employmentInfo.locationCountry,
          leavePlan: newEmployee.employmentInfo.leavePlan,
          band: newEmployee.employmentInfo.band,
          payGrade: newEmployee.employmentInfo.payGrade,
          timeType: newEmployee.employmentInfo.timeType,
          workerType: newEmployee.employmentInfo.workerType,
          shiftPolicy: newEmployee.employmentInfo.shiftPolicy,
          weeklyOffPolicy: newEmployee.employmentInfo.weeklyOffPolicy,
          attendancePolicy: newEmployee.employmentInfo.attendancePolicy,
          attendanceCaptureScheme: newEmployee.employmentInfo.attendanceCaptureScheme,
          holidayList: newEmployee.employmentInfo.holidayList,
          expensePolicy: newEmployee.employmentInfo.expensePolicy,
          noticePeriod: newEmployee.employmentInfo.noticePeriod,
          pfNumber: newEmployee.employmentInfo.pfNumber,
          uanNumber: newEmployee.employmentInfo.uanNumber,
          costCenter: newEmployee.employmentInfo.costCenter,
          comments: newEmployee.employmentInfo.comments
        },
        identityInfo: {
          panNumber: newEmployee.identityInfo.panNumber,
          aadhaarNumber: newEmployee.identityInfo.aadhaarNumber,
          passportNumber: newEmployee.identityInfo.passportNumber,
          drivingLicense: newEmployee.identityInfo.drivingLicense
        },
        financialInfo: {
          currentSalary: newEmployee.financialInfo.currentSalary,
          bankDetails: newEmployee.financialInfo.bankDetails,
          taxInfo: newEmployee.financialInfo.taxInfo
        },
        education: newEmployee.education,
        experience: newEmployee.experience,
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
        personalEmail: '',
        alternatePhone: '',
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        bloodGroup: '',
        fatherName: '',
        spouseName: '',
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
          country: 'India'
        }
      },
      employmentInfo: {
        employeeId: '',
        designation: '',
        department: '',
        subDepartment: '',
        dateOfJoining: '',
        employmentStatus: 'active',
        workLocation: '',
        reportingManager: '',
        reportingManagerEmpNo: '',
        reportingManagerName: '',
        dottedLineManager: '',
        legalEntity: '',
        businessUnit: '',
        secondaryJobTitle: '',
        attendanceNumber: '',
        locationCountry: '',
        leavePlan: '',
        band: '',
        payGrade: '',
        timeType: '',
        workerType: '',
        shiftPolicy: '',
        weeklyOffPolicy: '',
        attendancePolicy: '',
        attendanceCaptureScheme: '',
        holidayList: '',
        expensePolicy: '',
        noticePeriod: '',
        pfNumber: '',
        uanNumber: '',
        exitDate: '',
        exitStatus: '',
        terminationType: '',
        terminationReason: '',
        resignationNote: '',
        costCenter: '',
        comments: ''
      },
      identityInfo: {
        panNumber: '',
        aadhaarNumber: '',
        passportNumber: '',
        drivingLicense: ''
      },
      financialInfo: {
        currentSalary: {
          basic: '',
          hra: '',
          allowances: '',
          gross: '',
          ctc: ''
        },
        bankDetails: {
          accountNumber: '',
          bankName: '',
          ifscCode: '',
          accountHolderName: '',
          branchName: ''
        },
      taxInfo: {
        taxDeduction: '',
        tds: '',
        taxSlab: ''
      }
    },
    education: [{
      degree: '',
      institution: '',
      yearOfPassing: '',
      percentage: '',
      specialization: ''
    }],
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      salary: '',
      reasonForLeaving: ''
    }]
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
    return <EmployeeFullScreenView employee={selectedEmployee} onBack={handleBackToDirectory} onEditProfile={handleEditProfile} onSyncEmployee={handleSyncEmployee} onEmployeeUpdate={handleEmployeeUpdate} />;
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
              background: '#10b981',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                background: '#059669',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
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
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '& .employee-avatar': {
                  transform: 'scale(1.05)'
                },
                '& .info-card': {
                  transform: 'translateY(-1px)'
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
                    src={employee.profilePicture?.url ? 
                         (employee.profilePicture.url.startsWith('http') ? employee.profilePicture.url : `http://localhost:5001${employee.profilePicture.url}`) :
                         employee.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
                         employee.additionalInfo?.profilePhoto?.url || 
                         employee.profileImage || 
                         employee.personalInfo?.profilePicture || 
                         ''}
                    sx={{ 
                      width: 72, 
                      height: 72,
                      background: '#f3f4f6',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '2px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      color: '#6b7280',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {!(employee.profilePicture?.url || 
                       employee.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
                       employee.additionalInfo?.profilePhoto?.url || 
                       employee.profileImage || 
                       employee.personalInfo?.profilePicture) && (
                      <>
                        {employee.personalInfo?.firstName?.charAt(0) || 'N'}
                        {employee.personalInfo?.lastName?.charAt(0) || 'A'}
                      </>
                    )}
                  </Avatar>
                  
                  {/* Simple Status Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '3px solid white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  />

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
                          border: '2px solid #e5e7eb',
                          borderRadius: '50%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            borderColor: '#10b981',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
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
                        gap: 1, 
                        px: 2, 
                        py: 0.5,
                        background: '#f0f9ff',
                        borderRadius: 2,
                        border: '1px solid #e0f2fe',
                        flexShrink: 0,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: '#10b981'
                      }} />
                      <Typography 
                        variant="caption"
                        sx={{ 
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#059669',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {employee.employmentInfo?.employmentStatus === 'working' ? 'Active' : 
                         employee.employmentInfo?.employmentStatus || 'Active'}
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
                      mb: 1
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
                        color: '#0f172a',
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
                      background: '#ffffff',
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                      background: '#ffffff',
                      borderRadius: 3,
                      border: '1px solid #e5e7eb',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        color: '#0f172a'
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
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: '#10b981',
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
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeFormTab} 
              onChange={(e, newValue) => setActiveFormTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 3 }}
            >
              <Tab label="Personal Info" />
              <Tab label="Employment" />
              <Tab label="Identity" />
              <Tab label="Financial" />
              <Tab label="Education" />
              <Tab label="Experience" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3, maxHeight: '60vh', overflow: 'auto' }}>
            {/* Personal Information Tab */}
            {activeFormTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Basic Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={newEmployee.personalInfo.firstName}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'firstName', e.target.value)}
                    required
                    size="small"
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Work Email"
                    type="email"
                    value={newEmployee.personalInfo.email}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'email', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Personal Email"
                    type="email"
                    value={newEmployee.personalInfo.personalEmail}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'personalEmail', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={newEmployee.personalInfo.phone}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'phone', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alternate Phone"
                    value={newEmployee.personalInfo.alternatePhone}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'alternatePhone', e.target.value)}
                    size="small"
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
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={newEmployee.personalInfo.gender}
                      label="Gender"
                      onChange={(e) => handleNewEmployeeChange('personalInfo', 'gender', e.target.value)}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Marital Status</InputLabel>
                    <Select
                      value={newEmployee.personalInfo.maritalStatus}
                      label="Marital Status"
                      onChange={(e) => handleNewEmployeeChange('personalInfo', 'maritalStatus', e.target.value)}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="married">Married</MenuItem>
                      <MenuItem value="divorced">Divorced</MenuItem>
                      <MenuItem value="widowed">Widowed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    value={newEmployee.personalInfo.nationality}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'nationality', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={newEmployee.personalInfo.bloodGroup}
                      label="Blood Group"
                      onChange={(e) => handleNewEmployeeChange('personalInfo', 'bloodGroup', e.target.value)}
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father Name"
                    value={newEmployee.personalInfo.fatherName}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'fatherName', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Spouse Name"
                    value={newEmployee.personalInfo.spouseName}
                    onChange={(e) => handleNewEmployeeChange('personalInfo', 'spouseName', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {/* Employment Information Tab */}
            {activeFormTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Employment Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={newEmployee.employmentInfo.employeeId}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'employeeId', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.designation}
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'designation', e.target.value)}
                      label="Designation"
                    >
                      {designations.map((designation) => (
                        <MenuItem key={designation._id} value={designation.name}>
                          {designation.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Position/Title</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.position || ''}
                      label="Position/Title"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'position', e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="CEO">CEO</MenuItem>
                      <MenuItem value="COO">COO</MenuItem>
                      <MenuItem value="CTO">CTO</MenuItem>
                      <MenuItem value="CFO">CFO</MenuItem>
                      <MenuItem value="CMO">CMO</MenuItem>
                      <MenuItem value="CHRO">CHRO</MenuItem>
                      <MenuItem value="VP">VP</MenuItem>
                      <MenuItem value="Director">Director</MenuItem>
                      <MenuItem value="Senior Manager">Senior Manager</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Team Lead">Team Lead</MenuItem>
                      <MenuItem value="Senior Executive">Senior Executive</MenuItem>
                      <MenuItem value="Executive">Executive</MenuItem>
                      <MenuItem value="Senior Associate">Senior Associate</MenuItem>
                      <MenuItem value="Associate">Associate</MenuItem>
                      <MenuItem value="Trainee">Trainee</MenuItem>
                      <MenuItem value="Intern">Intern</MenuItem>
                      <MenuItem value="Consultant">Consultant</MenuItem>
                      <MenuItem value="Specialist">Specialist</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.department}
                      label="Department"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'department', e.target.value)}
                      required
                    >
                      <MenuItem value="IT">IT</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Operations">Operations</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sub Department"
                    value={newEmployee.employmentInfo.subDepartment}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'subDepartment', e.target.value)}
                    size="small"
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.employmentStatus}
                      label="Employment Status"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'employmentStatus', e.target.value)}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="probation">Probation</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Reporting Manager</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.reportingManager}
                      label="Reporting Manager"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'reportingManager', e.target.value)}
                    >
                      <MenuItem value="">No Manager (Top Level)</MenuItem>
                      {employees.map((manager) => (
                        <MenuItem key={manager._id} value={manager._id}>
                          {manager.personalInfo?.firstName} {manager.personalInfo?.lastName} - {manager.employmentInfo?.designation}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reporting Manager Employee Number"
                    value={newEmployee.employmentInfo.reportingManagerEmpNo}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'reportingManagerEmpNo', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reporting Manager Name"
                    value={newEmployee.employmentInfo.reportingManagerName}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'reportingManagerName', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dotted Line Manager"
                    value={newEmployee.employmentInfo.dottedLineManager}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'dottedLineManager', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Legal Entity"
                    value={newEmployee.employmentInfo.legalEntity}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'legalEntity', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Unit"
                    value={newEmployee.employmentInfo.businessUnit}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'businessUnit', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Secondary Job Title"
                    value={newEmployee.employmentInfo.secondaryJobTitle}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'secondaryJobTitle', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Attendance Number"
                    value={newEmployee.employmentInfo.attendanceNumber}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'attendanceNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location Country"
                    value={newEmployee.employmentInfo.locationCountry}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'locationCountry', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Leave Plan"
                    value={newEmployee.employmentInfo.leavePlan}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'leavePlan', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Band"
                    value={newEmployee.employmentInfo.band}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'band', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pay Grade"
                    value={newEmployee.employmentInfo.payGrade}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'payGrade', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Time Type</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.timeType}
                      label="Time Type"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'timeType', e.target.value)}
                    >
                      <MenuItem value="full_time">Full Time</MenuItem>
                      <MenuItem value="part_time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Worker Type</InputLabel>
                    <Select
                      value={newEmployee.employmentInfo.workerType}
                      label="Worker Type"
                      onChange={(e) => handleNewEmployeeChange('employmentInfo', 'workerType', e.target.value)}
                    >
                      <MenuItem value="permanent">Permanent</MenuItem>
                      <MenuItem value="temporary">Temporary</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Shift Policy"
                    value={newEmployee.employmentInfo.shiftPolicy}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'shiftPolicy', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weekly Off Policy"
                    value={newEmployee.employmentInfo.weeklyOffPolicy}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'weeklyOffPolicy', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Attendance Policy"
                    value={newEmployee.employmentInfo.attendancePolicy}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'attendancePolicy', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Attendance Capture Scheme"
                    value={newEmployee.employmentInfo.attendanceCaptureScheme}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'attendanceCaptureScheme', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Holiday List"
                    value={newEmployee.employmentInfo.holidayList}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'holidayList', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expense Policy"
                    value={newEmployee.employmentInfo.expensePolicy}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'expensePolicy', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Notice Period"
                    value={newEmployee.employmentInfo.noticePeriod}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'noticePeriod', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PF Number"
                    value={newEmployee.employmentInfo.pfNumber}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'pfNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="UAN Number"
                    value={newEmployee.employmentInfo.uanNumber}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'uanNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost Center"
                    value={newEmployee.employmentInfo.costCenter}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'costCenter', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Comments"
                    multiline
                    rows={3}
                    value={newEmployee.employmentInfo.comments}
                    onChange={(e) => handleNewEmployeeChange('employmentInfo', 'comments', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {/* Identity Information Tab */}
            {activeFormTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Identity Documents
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN Number"
                    value={newEmployee.identityInfo.panNumber}
                    onChange={(e) => handleNewEmployeeChange('identityInfo', 'panNumber', e.target.value)}
                    size="small"
                    placeholder="ABCDE1234F"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhaar Number"
                    value={newEmployee.identityInfo.aadhaarNumber}
                    onChange={(e) => handleNewEmployeeChange('identityInfo', 'aadhaarNumber', e.target.value)}
                    size="small"
                    placeholder="1234-5678-9012"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Passport Number"
                    value={newEmployee.identityInfo.passportNumber}
                    onChange={(e) => handleNewEmployeeChange('identityInfo', 'passportNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driving License"
                    value={newEmployee.identityInfo.drivingLicense}
                    onChange={(e) => handleNewEmployeeChange('identityInfo', 'drivingLicense', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {/* Financial Information Tab */}
            {activeFormTab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Salary Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Basic Salary"
                    type="number"
                    value={newEmployee.financialInfo.currentSalary.basic}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'basic', e.target.value, 'currentSalary')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="HRA"
                    type="number"
                    value={newEmployee.financialInfo.currentSalary.hra}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'hra', e.target.value, 'currentSalary')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Allowances"
                    type="number"
                    value={newEmployee.financialInfo.currentSalary.allowances}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'allowances', e.target.value, 'currentSalary')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gross Salary"
                    type="number"
                    value={newEmployee.financialInfo.currentSalary.gross}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'gross', e.target.value, 'currentSalary')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CTC"
                    type="number"
                    value={newEmployee.financialInfo.currentSalary.ctc}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'ctc', e.target.value, 'currentSalary')}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151', mt: 2 }}>
                    Bank Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={newEmployee.financialInfo.bankDetails.accountNumber}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'accountNumber', e.target.value, 'bankDetails')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={newEmployee.financialInfo.bankDetails.bankName}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'bankName', e.target.value, 'bankDetails')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="IFSC Code"
                    value={newEmployee.financialInfo.bankDetails.ifscCode}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'ifscCode', e.target.value, 'bankDetails')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    value={newEmployee.financialInfo.bankDetails.accountHolderName}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'accountHolderName', e.target.value, 'bankDetails')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Branch Name"
                    value={newEmployee.financialInfo.bankDetails.branchName}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'branchName', e.target.value, 'bankDetails')}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151', mt: 2 }}>
                    Tax Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Deduction"
                    type="number"
                    value={newEmployee.financialInfo.taxInfo.taxDeduction}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'taxDeduction', e.target.value, 'taxInfo')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="TDS"
                    type="number"
                    value={newEmployee.financialInfo.taxInfo.tds}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'tds', e.target.value, 'taxInfo')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Slab"
                    value={newEmployee.financialInfo.taxInfo.taxSlab}
                    onChange={(e) => handleNewEmployeeChange('financialInfo', 'taxSlab', e.target.value, 'taxInfo')}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {/* Education Information Tab */}
            {activeFormTab === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Educational Background
                  </Typography>
                </Grid>
                {newEmployee.education.map((edu, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ mb: 2, border: '1px solid #e5e7eb' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            Education {index + 1}
                          </Typography>
                          {newEmployee.education.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() => {
                                const updatedEducation = newEmployee.education.filter((_, i) => i !== index);
                                setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Degree</InputLabel>
                              <Select
                                value={edu.degree}
                                label="Degree"
                                onChange={(e) => {
                                  const updatedEducation = [...newEmployee.education];
                                  updatedEducation[index] = { ...updatedEducation[index], degree: e.target.value };
                                  setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                                }}
                              >
                                <MenuItem value="High School">High School</MenuItem>
                                <MenuItem value="Diploma">Diploma</MenuItem>
                                <MenuItem value="Bachelor's">Bachelor's</MenuItem>
                                <MenuItem value="Master's">Master's</MenuItem>
                                <MenuItem value="PhD">PhD</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => {
                                const updatedEducation = [...newEmployee.education];
                                updatedEducation[index] = { ...updatedEducation[index], institution: e.target.value };
                                setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Year of Passing"
                              type="number"
                              value={edu.yearOfPassing}
                              onChange={(e) => {
                                const updatedEducation = [...newEmployee.education];
                                updatedEducation[index] = { ...updatedEducation[index], yearOfPassing: e.target.value };
                                setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Percentage/CGPA"
                              value={edu.percentage}
                              onChange={(e) => {
                                const updatedEducation = [...newEmployee.education];
                                updatedEducation[index] = { ...updatedEducation[index], percentage: e.target.value };
                                setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Specialization"
                              value={edu.specialization}
                              onChange={(e) => {
                                const updatedEducation = [...newEmployee.education];
                                updatedEducation[index] = { ...updatedEducation[index], specialization: e.target.value };
                                setNewEmployee(prev => ({ ...prev, education: updatedEducation }));
                              }}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewEmployee(prev => ({
                        ...prev,
                        education: [...prev.education, {
                          degree: '',
                          institution: '',
                          yearOfPassing: '',
                          percentage: '',
                          specialization: ''
                        }]
                      }));
                    }}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Add Education
                  </Button>
                </Grid>
              </Grid>
            )}

            {/* Experience Information Tab */}
            {activeFormTab === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>
                    Work Experience
                  </Typography>
                </Grid>
                {newEmployee.experience.map((exp, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ mb: 2, border: '1px solid #e5e7eb' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            Experience {index + 1}
                          </Typography>
                          {newEmployee.experience.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() => {
                                const updatedExperience = newEmployee.experience.filter((_, i) => i !== index);
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              value={exp.company}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], company: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Position"
                              value={exp.position}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], position: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Start Date"
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], startDate: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="End Date"
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], endDate: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Last Salary (₹)"
                              type="number"
                              value={exp.salary}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], salary: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Reason for Leaving"
                              multiline
                              rows={2}
                              value={exp.reasonForLeaving}
                              onChange={(e) => {
                                const updatedExperience = [...newEmployee.experience];
                                updatedExperience[index] = { ...updatedExperience[index], reasonForLeaving: e.target.value };
                                setNewEmployee(prev => ({ ...prev, experience: updatedExperience }));
                              }}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewEmployee(prev => ({
                        ...prev,
                        experience: [...prev.experience, {
                          company: '',
                          position: '',
                          startDate: '',
                          endDate: '',
                          salary: '',
                          reasonForLeaving: ''
                        }]
                      }));
                    }}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Add Experience
                  </Button>
                </Grid>
              </Grid>
            )}
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
            disabled={isSubmitting || !newEmployee.personalInfo.firstName || !newEmployee.personalInfo.email}
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#10b981',
              '&:hover': {
                background: '#059669'
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


// Main EmployeesModule - Employee Directory only
const EmployeesModule = () => {
  return (
    <>
      {/* Render Employee Directory directly */}
      <EmployeeDirectoryModule />
    </>
  );
};


export default EmployeesModule;
