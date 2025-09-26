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
  Stack,
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
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import Papa from 'papaparse';
import OnboardingsModuleFull from './OnboardingsModule';

// Full-Screen Employee Details View
const EmployeeFullScreenView = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState('ABOUT');

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
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5, fontSize: '1.75rem' }}>
              {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.9rem' }}>
              {employee.employeeId} • {employee.employmentInfo?.designation || 'N/A'}
            </Typography>
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
        {activeTab === 'ABOUT' && <AboutSection employee={employee} />}
        {activeTab === 'PROFILE' && <ProfileSection employee={employee} />}
        {activeTab === 'JOB' && <JobSection employee={employee} />}
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

const FieldDisplay = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="500" sx={{ mt: 0.3, fontSize: '0.85rem', lineHeight: 1.4 }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

// About Section Component
const AboutSection = ({ employee }) => (
  <Grid container spacing={3}>
    {/* Primary Details */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="👤" title="Primary Details" color="primary.main">
        <FieldDisplay 
          label="Full Name" 
          value={`${employee.personalInfo?.firstName || ''} ${employee.personalInfo?.lastName || ''}`.trim()} 
        />
        <FieldDisplay 
          label="Employee ID" 
          value={employee.employeeId || employee.additionalInfo?.['Employee Number']} 
        />
        <FieldDisplay 
          label="Date of Birth" 
          value={employee.personalInfo?.dateOfBirth 
            ? moment(employee.personalInfo.dateOfBirth).format('DD MMM YYYY')
            : employee.additionalInfo?.['Date Of Birth']
          } 
        />
        <FieldDisplay 
          label="Gender" 
          value={employee.personalInfo?.gender || employee.additionalInfo?.Gender} 
        />
        <FieldDisplay 
          label="Marital Status" 
          value={employee.personalInfo?.maritalStatus || employee.additionalInfo?.['Marital Status']} 
        />
        <FieldDisplay 
          label="Nationality" 
          value={employee.personalInfo?.nationality || employee.additionalInfo?.Nationality} 
        />
      </SectionCard>
    </Grid>

    {/* Contact Details */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="📞" title="Contact Details" color="info.main">
        <FieldDisplay 
          label="Work Email" 
          value={employee.user?.email || employee.additionalInfo?.['Work Email']} 
        />
        <FieldDisplay 
          label="Personal Email" 
          value={employee.additionalInfo?.['Personal Email'] || employee.contactInfo?.personalEmail} 
        />
        <FieldDisplay 
          label="Mobile Phone" 
          value={employee.contactInfo?.phone || employee.additionalInfo?.['Mobile Phone']} 
        />
        <FieldDisplay 
          label="Work Phone" 
          value={employee.additionalInfo?.['Work Phone']} 
        />
      </SectionCard>
    </Grid>

    {/* Address Information */}
    <Grid item xs={12} md={6}>
      <SectionCard icon="🏠" title="Address Information" color="secondary.main">
        <FieldDisplay 
          label="Current Address" 
          value={employee.additionalInfo?.current_address_line_1 || 
                 employee.additionalInfo?.['Current Address Line 1'] || 
                 employee.contactInfo?.address?.street || 
                 employee.personalInfo?.address?.street || 
                 employee.personalInfo?.address} 
        />
        <FieldDisplay 
          label="Permanent Address" 
          value={employee.additionalInfo?.permanent_address_line_1 ||
                 employee.additionalInfo?.['Permanent Address Line 1'] || 
                 employee.additionalInfo?.current_address_line_1 ||
                 employee.additionalInfo?.['Current Address Line 1'] ||
                 employee.contactInfo?.address?.street ||
                 employee.personalInfo?.address?.street || 
                 employee.personalInfo?.address} 
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
          value={employee.additionalInfo?.father_name || employee.additionalInfo?.['Father Name']} 
        />
        <FieldDisplay 
          label="Spouse's Name" 
          value={employee.additionalInfo?.spouse_name || employee.additionalInfo?.['Spouse Name']} 
        />
        <FieldDisplay 
          label="Blood Group" 
          value={employee.additionalInfo?.blood_group || employee.additionalInfo?.['Blood Group']} 
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
          .filter(([key]) => 
            !['Employee Number', 'Display Name', 'Full Name', 'Work Email', 'Date Of Birth', 'Gender', 
              'Marital Status', 'Personal Email', 'Mobile Phone', 'Work Phone', 'Current Address Line 1', 
              'Permanent Address Line 1', 'Father Name', 'Spouse Name', 'Location', 'Location Country',
              'Department', 'Job Title', 'Date Joined', 'Employment Status', 'Worker Type', 'Reporting To',
              'PAN Number', 'Aadhaar Number', 'PF Number', 'UAN Number', 'Blood Group', 'Physically Handicapped',
              'Nationality'].includes(key)
          )
          .slice(0, 6)
          .map(([key, value]) => (
            <FieldDisplay key={key} label={key} value={value} />
          ))
        }
      </SectionCard>
    </Grid>
  </Grid>
);

// Job Section Component
const JobSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <SectionCard icon="💼" title="Employment Information" color="success.main">
        <FieldDisplay 
          label="Department" 
          value={employee.employmentInfo?.department?.name || employee.additionalInfo?.Department} 
        />
        <FieldDisplay 
          label="Job Title" 
          value={employee.employmentInfo?.designation || employee.additionalInfo?.['Job Title']} 
        />
        <FieldDisplay 
          label="Date of Joining" 
          value={employee.employmentInfo?.dateOfJoining 
            ? moment(employee.employmentInfo.dateOfJoining).format('DD MMM YYYY')
            : employee.additionalInfo?.['Date Joined']
          } 
        />
        <FieldDisplay 
          label="Employment Status" 
          value={employee.employmentInfo?.employmentStatus || employee.additionalInfo?.['Employment Status']} 
        />
        <FieldDisplay 
          label="Worker Type" 
          value={employee.employmentInfo?.employeeType || employee.additionalInfo?.['Worker Type']} 
        />
        <FieldDisplay 
          label="Work Location" 
          value={employee.employmentInfo?.workLocation || employee.additionalInfo?.Location} 
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

// Placeholder components for other sections
const TimeSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <SectionCard icon="⏰" title="Time & Attendance" color="info.main">
        <FieldDisplay label="Work Schedule" value="Coming Soon" />
        <FieldDisplay label="Time Zone" value="Coming Soon" />
        <FieldDisplay label="Attendance Policy" value="Coming Soon" />
      </SectionCard>
    </Grid>
  </Grid>
);

const DocumentsSection = ({ employee }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [documentType, setDocumentType] = useState('resume');

  const handleUploadClick = (type) => {
    setDocumentType(type);
    setOpenUploadDialog(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Uploading ${documentType}:`, file.name);
      alert(`${documentType} uploaded successfully!`);
      setOpenUploadDialog(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SectionCard icon="📄" title="Documents" color="warning.main">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>📄</span>
                <Typography variant="body1">Resume/CV</Typography>
              </Box>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleUploadClick('resume')}
              >
                Upload
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🆔</span>
                <Typography variant="body1">ID Proof</Typography>
              </Box>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleUploadClick('id_proof')}
              >
                Upload
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🏠</span>
                <Typography variant="body1">Address Proof</Typography>
              </Box>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleUploadClick('address_proof')}
              >
                Upload
              </Button>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => handleUploadClick('other')}
              >
                Add Document
              </Button>
              <Button 
                variant="outlined" 
                size="small"
              >
                View All
              </Button>
            </Box>
          </Box>

          <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="document-upload-input"
                />
                <label htmlFor="document-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ py: 3, borderStyle: 'dashed' }}
                  >
                    Choose File to Upload
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
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

const FinancesSection = ({ employee }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <SectionCard icon="💰" title="Finances" color="success.main">
        <FieldDisplay label="Salary" value="Coming Soon" />
        <FieldDisplay label="Bank Details" value="Coming Soon" />
        <FieldDisplay label="Tax Information" value="Coming Soon" />
      </SectionCard>
    </Grid>
  </Grid>
);

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
        employeeId: newEmployee.employmentInfo.employeeId,
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

  // Show full-screen employee details if selected
  if (showFullScreenView && selectedEmployee) {
    return <EmployeeFullScreenView employee={selectedEmployee} onBack={handleBackToDirectory} />;
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
                      ID: {employee.employeeId}
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
