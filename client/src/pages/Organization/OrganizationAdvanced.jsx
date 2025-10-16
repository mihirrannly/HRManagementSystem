import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  AccountTree as AccountTreeIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  LocalAirport as LocalAirportIcon,
  Folder as FolderIcon,
  Psychology as PsychologyIcon,
  Computer as ComputerIcon,
  Settings as SettingsIcon,
  AttachMoney as AttachMoneyIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp,
  Business,
  CloudUpload as CloudUploadIcon,
  GetApp as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Papa from 'papaparse';

// Import all modules
import OrganizationDashboardModule from './modules/OrganizationDashboardModule';
import EmployeesModule from './modules/EmployeesModule';
import StructureModule from './modules/StructureModule';
import OnboardingsModule from './modules/OnboardingsModule';
import ExitsModule from './modules/ExitsModule';
import ExpenseModule from './modules/ExpenseModule';
import DocumentsModule from './modules/DocumentsModule';
import EngageModule from './modules/EngageModule';
import AssetsModule from './modules/AssetsModule';
import SettingsModule from './modules/SettingsModule';

// Base module configuration (without dynamic stats)
const baseOrganizationModules = [
  {
    id: 'dashboard',
    title: 'Organization Dashboard',
    description: 'Overview and analytics of organization metrics',
    icon: <DashboardIcon />,
    color: '#1976d2',
    component: OrganizationDashboardModule,
    stats: { primary: '...', secondary: 'Loading...' } // Will be populated dynamically
  },
  {
    id: 'employees',
    title: 'Employee Management',
    description: 'Manage employee data, profiles, and information',
    icon: <GroupIcon />,
    color: '#388e3c',
    component: EmployeesModule,
    stats: { primary: '180', secondary: 'Total Employees' }
  },
  {
    id: 'structure',
    title: 'Organization Structure',
    description: 'View and manage company hierarchy and departments',
    icon: <AccountTreeIcon />,
    color: '#f57c00',
    component: StructureModule,
    stats: { primary: '8', secondary: 'Departments' }
  },
  {
    id: 'onboarding',
    title: 'Employee Onboarding',
    description: 'Manage new employee onboarding process',
    icon: <PersonAddIcon />,
    color: '#2e7d32',
    component: OnboardingsModule,
    stats: { primary: '12', secondary: 'Active Onboardings' }
  },
  {
    id: 'exits',
    title: 'Employee Exits',
    description: 'Handle employee departures and exit procedures',
    icon: <ExitToAppIcon />,
    color: '#d32f2f',
    component: ExitsModule,
    stats: { primary: '3', secondary: 'Pending Exits' }
  },
  {
    id: 'expenses',
    title: 'Expense & Travel',
    description: 'Manage expenses, travel requests, and reimbursements',
    icon: <LocalAirportIcon />,
    color: '#7b1fa2',
    component: ExpenseModule,
    stats: { primary: '₹2.4L', secondary: 'This Month' }
  },
  {
    id: 'payroll',
    title: 'Payroll Management',
    description: 'Handle salary processing and payroll operations',
    icon: <AttachMoneyIcon />,
    color: '#00796b',
    component: () => <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Payroll Module - Coming Soon</Typography></Box>,
    stats: { primary: '₹45L', secondary: 'Monthly Payroll' }
  },
  {
    id: 'documents',
    title: 'Document Management',
    description: 'Store and manage company documents and files',
    icon: <FolderIcon />,
    color: '#5e35b1',
    component: DocumentsModule,
    stats: { primary: '1,247', secondary: 'Documents' }
  },
  {
    id: 'engagement',
    title: 'Employee Engagement',
    description: 'Track engagement, surveys, and employee satisfaction',
    icon: <PsychologyIcon />,
    color: '#c2185b',
    component: EngageModule,
    stats: { primary: '4.2/5', secondary: 'Avg Rating' }
  },
  {
    id: 'assets',
    title: 'Asset Management',
    description: 'Track and manage company assets and equipment',
    icon: <ComputerIcon />,
    color: '#455a64',
    component: AssetsModule,
    stats: { primary: '324', secondary: 'Total Assets' }
  },
  {
    id: 'settings',
    title: 'Organization Settings',
    description: 'Configure organization-wide settings and preferences',
    icon: <SettingsIcon />,
    color: '#424242',
    component: SettingsModule,
    stats: { primary: '12', secondary: 'Active Configs' }
  }
];

const OrganizationAdvanced = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CSV Import State
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Additional module data
  const [expenseStats, setExpenseStats] = useState(null);
  const [onboardingStats, setOnboardingStats] = useState(null);
  const [exitStats, setExitStats] = useState(null);
  const [payrollStats, setPayrollStats] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    fetchAllAnalytics();
  }, [isAdmin]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all analytics data in parallel
      const [
        orgResponse,
        expenseResponse,
        onboardingResponse,
        exitResponse,
        payrollResponse,
        engagementResponse
      ] = await Promise.allSettled([
        axios.get('/organization/analytics'),
        axios.get('/expenses/stats'),
        axios.get('/onboarding/analytics/dashboard'),
        axios.get('/exit-management/dashboard/stats'),
        axios.get('/salary-management/stats/overview', { 
          params: { 
            month: new Date().getMonth() + 1, 
            year: new Date().getFullYear() 
          } 
        }),
        axios.get('/announcements/stats/dashboard')
      ]);

      // Set organization analytics
      if (orgResponse.status === 'fulfilled') {
        setAnalytics(orgResponse.value.data);
      }

      // Set expense stats
      if (expenseResponse.status === 'fulfilled') {
        setExpenseStats(expenseResponse.value.data);
      }

      // Set onboarding stats
      if (onboardingResponse.status === 'fulfilled') {
        setOnboardingStats(onboardingResponse.value.data);
      }

      // Set exit stats
      if (exitResponse.status === 'fulfilled') {
        setExitStats(exitResponse.value.data);
      }

      // Set payroll stats
      if (payrollResponse.status === 'fulfilled') {
        setPayrollStats(payrollResponse.value.data);
      }

      // Set engagement stats
      if (engagementResponse.status === 'fulfilled') {
        setEngagementStats(engagementResponse.value.data);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch organization analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    // Wrapper for backward compatibility
    await fetchAllAnalytics();
  };

  // Generate organization modules with dynamic stats (memoized to re-compute when any data changes)
  const organizationModules = useMemo(() => {
    return baseOrganizationModules.map(module => {
      switch (module.id) {
        case 'dashboard':
          if (analytics) {
            const totalEmployees = analytics.summary?.totalEmployees || '0';
            return {
              ...module,
              stats: { 
                primary: totalEmployees, 
                secondary: 'Total Employees' 
              }
            };
          }
          break;
          
        case 'employees':
          if (analytics) {
            return {
              ...module,
              stats: { 
                primary: analytics.summary?.totalEmployees || '0', 
                secondary: 'Total Employees' 
              }
            };
          }
          break;
          
        case 'structure':
          if (analytics) {
            return {
              ...module,
              stats: { 
                primary: analytics.breakdowns?.departments?.length || '0', 
                secondary: 'Departments' 
              }
            };
          }
          break;
          
        case 'onboarding':
          if (onboardingStats) {
            return {
              ...module,
              stats: { 
                primary: onboardingStats.summary?.active || '0', 
                secondary: 'Active Onboardings' 
              }
            };
          }
          break;
          
        case 'exits':
          if (exitStats) {
            return {
              ...module,
              stats: { 
                primary: exitStats.pendingExits || '0', 
                secondary: 'Pending Exits' 
              }
            };
          }
          break;
          
        case 'expenses':
          if (expenseStats) {
            // Calculate total approved + pending expenses this month
            const statusStats = expenseStats.statusStats || [];
            const approvedStats = statusStats.find(s => s._id === 'approved') || {};
            const pendingStats = statusStats.find(s => s._id === 'pending') || {};
            const totalAmount = (approvedStats.totalAmount || 0) + (pendingStats.totalAmount || 0);
            
            // Format currency in Indian Rupees (Lakhs/Thousands)
            const formatCurrency = (amount) => {
              if (amount >= 100000) {
                return `₹${(amount / 100000).toFixed(1)}L`;
              } else if (amount >= 1000) {
                return `₹${(amount / 1000).toFixed(1)}K`;
              }
              return `₹${amount}`;
            };
            
            return {
              ...module,
              stats: { 
                primary: formatCurrency(totalAmount), 
                secondary: 'This Month' 
              }
            };
          }
          break;
          
        case 'payroll':
          if (payrollStats) {
            const totalPayable = payrollStats.totalPayable || 0;
            
            // Format currency in Indian Rupees (Lakhs)
            const formatCurrency = (amount) => {
              if (amount >= 100000) {
                return `₹${(amount / 100000).toFixed(1)}L`;
              } else if (amount >= 1000) {
                return `₹${(amount / 1000).toFixed(1)}K`;
              }
              return `₹${amount}`;
            };
            
            return {
              ...module,
              stats: { 
                primary: formatCurrency(totalPayable), 
                secondary: 'Monthly Payroll' 
              }
            };
          }
          break;
          
        case 'engagement':
          if (engagementStats && engagementStats.stats) {
            const stats = engagementStats.stats;
            return {
              ...module,
              stats: { 
                primary: `${stats.active || 0}`, 
                secondary: 'Active Announcements' 
              }
            };
          }
          break;
          
        default:
          // Keep original stats for modules without real data yet
          return module;
      }
      
      // Return module with original stats if data not available yet
      return module;
    });
  }, [analytics, expenseStats, onboardingStats, exitStats, payrollStats, engagementStats]);

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleBackToOverview = () => {
    setSelectedModule(null);
  };

  // CSV Import Functions
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (!file) {
      setSnackbar({
        open: true,
        message: 'No file selected',
        severity: 'error'
      });
      return;
    }
    
    // Accept CSV files or files with .csv extension
    const isCSV = file.type === 'text/csv' || 
                  file.type === 'application/csv' || 
                  file.type === 'text/plain' ||
                  file.name.toLowerCase().endsWith('.csv');
    
    if (isCSV) {
      console.log('Valid CSV file detected');
      setCsvFile(file);
      // Reset previous data
      setCsvHeaders([]);
      setCsvData([]);
      setImportStatus('');
      setImportResults(null);
      // Parse the file
      parseCsvFile(file);
    } else {
      console.log('Invalid file type:', file.type, 'Name:', file.name);
      setSnackbar({
        open: true,
        message: `Please select a valid CSV file. Selected file type: ${file.type}`,
        severity: 'error'
      });
    }
  };

  const parseCsvFile = (file) => {
    console.log('Starting to parse file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // First, let's read the file as text to see what's actually in it
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      console.log('File content (first 500 chars):', text.substring(0, 500));
      console.log('File content (full):', text);
      
      // Now parse with PapaParse
      Papa.parse(text, {
        complete: (results) => {
        console.log('Raw PapaParse results:', results);
        console.log('Results data length:', results.data ? results.data.length : 0);
        console.log('First 3 raw rows:', results.data ? results.data.slice(0, 3) : []);
        console.log('Results errors:', results.errors);
        console.log('Results meta:', results.meta);
        
        if (results.errors && results.errors.length > 0) {
          console.warn('PapaParse warnings/errors:', results.errors);
        }
        
        if (!results.data || results.data.length === 0) {
          setSnackbar({
            open: true,
            message: 'No data found in CSV file. Please check the file format.',
            severity: 'error'
          });
          return;
        }
        
        // Remove completely empty rows
        let cleanData = results.data.filter(row => 
          Array.isArray(row) && row.length > 0 && row.some(cell => 
            cell !== null && cell !== undefined && cell.toString().trim() !== ''
          )
        );
        
        console.log('Clean data after filtering:', cleanData.length, 'rows');
        console.log('First 3 clean rows:', cleanData.slice(0, 3));
        
        if (cleanData.length === 0) {
          setSnackbar({
            open: true,
            message: 'No valid data rows found in CSV file',
            severity: 'error'
          });
          return;
        }
        
        // Extract headers (first row)
        const rawHeaders = cleanData[0];
        console.log('Raw headers:', rawHeaders);
        
        const headers = rawHeaders.map((header, index) => {
          const cleanHeader = header ? header.toString().trim() : '';
          console.log(`Header ${index}:`, `"${header}"`, '->', `"${cleanHeader}"`);
          return cleanHeader || `Column ${index + 1}`;
        });
        
        console.log('Processed headers:', headers);
        
        // Extract data rows (skip first row which contains headers)
        const dataRows = cleanData.slice(1);
        console.log('Data rows count:', dataRows.length);
        
        // Validate that we have consistent column counts
        const headerCount = headers.length;
        const validDataRows = dataRows.filter((row, index) => {
          const isValid = Array.isArray(row) && row.length <= headerCount && 
                         row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
          if (!isValid) {
            console.log(`Filtering out invalid row ${index}:`, row);
          }
          return isValid;
        });
        
        console.log('Final valid data rows:', validDataRows.length);
        console.log('Sample of first valid row:', validDataRows[0]);
        
        setCsvHeaders(headers);
        setCsvData(validDataRows);
        
        const firstFiveHeaders = headers.slice(0, 5).filter(h => h && !h.startsWith('Column')).join(', ');
        const statusMessage = `Parsed ${validDataRows.length} records with ${headers.length} fields. ${firstFiveHeaders ? `Fields: ${firstFiveHeaders}${headers.length > 5 ? '...' : ''}` : ''}`;
        
        setImportStatus(statusMessage);
        
        setSnackbar({
          open: true,
          message: `Successfully parsed ${validDataRows.length} employee records with ${headers.length} fields`,
          severity: 'success'
        });
      },
      header: false,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
      dynamicTyping: false,
      encoding: 'UTF-8',
      worker: false,
        error: (error) => {
          console.error('PapaParse error:', error);
          setSnackbar({
            open: true,
            message: `Error parsing CSV: ${error.message}`,
            severity: 'error'
          });
        }
      });
    };
    
    reader.readAsText(file);
  };

  const handleImportData = async () => {
    if (!csvData.length) {
      setSnackbar({
        open: true,
        message: 'No data to import',
        severity: 'warning'
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Prepare data for import
      const employeeData = csvData.map((row, index) => {
        const employee = {};
        csvHeaders.forEach((header, headerIndex) => {
          employee[header.toLowerCase().replace(/\s+/g, '_')] = row[headerIndex] || '';
        });
        return employee;
      });

      // Send data to backend for processing
      const response = await axios.post('/organization/import-master-data', {
        employees: employeeData,
        headers: csvHeaders,
        mode: 'comprehensive'
      });

      setImportResults(response.data);
      setImportProgress(100);
      
      setSnackbar({
        open: true,
        message: `Successfully imported ${response.data.success} employees`,
        severity: 'success'
      });

      // Refresh all analytics after import
      await fetchAllAnalytics();
      
      // Trigger refresh for dashboard modules
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Import error:', error);
      setSnackbar({
        open: true,
        message: `Import failed: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = [
      // Headers
      ['first_name', 'last_name', 'email', 'phone', 'department', 'position', 'salary', 'hire_date', 'status', 'manager', 'location', 'employee_id', 'date_of_birth', 'gender', 'address', 'emergency_contact', 'emergency_phone', 'skills', 'education', 'experience_years', 'nationality', 'marital_status', 'blood_group', 'employee_type'],
      // Sample data rows
      ['John', 'Doe', 'john.doe@company.com', '+1234567890', 'IT', 'Software Engineer', '75000', '2023-01-15', 'Active', 'Jane Smith', 'New York', 'EMP001', '1990-05-15', 'Male', '123 Main St NY', 'Jane Doe', '+1234567891', 'JavaScript,React,Node.js', 'Computer Science', '5', 'American', 'Single', 'O+', 'Full-time'],
      ['Jane', 'Smith', 'jane.smith@company.com', '+1234567892', 'IT', 'Senior Developer', '85000', '2022-08-20', 'Active', 'Bob Johnson', 'New York', 'EMP002', '1988-12-03', 'Female', '456 Oak Ave NY', 'John Smith', '+1234567893', 'Python,Django,AWS', 'Software Engineering', '8', 'American', 'Married', 'A+', 'Full-time'],
      ['Bob', 'Johnson', 'bob.johnson@company.com', '+1234567894', 'HR', 'HR Manager', '70000', '2021-03-10', 'Active', 'CEO', 'California', 'EMP003', '1985-07-22', 'Male', '789 Pine St CA', 'Alice Johnson', '+1234567895', 'Management,Recruitment', 'Human Resources', '12', 'American', 'Married', 'B+', 'Full-time'],
      ['Alice', 'Brown', 'alice.brown@company.com', '+1234567896', 'Finance', 'Financial Analyst', '65000', '2023-06-01', 'Active', 'Carol White', 'Texas', 'EMP004', '1992-09-10', 'Female', '321 Elm St TX', 'Bob Brown', '+1234567897', 'Excel,SAP,Analytics', 'Finance', '4', 'American', 'Single', 'AB+', 'Full-time']
    ];

    // Use PapaParse to create properly formatted CSV
    const csv = Papa.unparse(sampleData, {
      quotes: true,
      delimiter: ',',
      header: false,
      newline: '\r\n'
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_master_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: 'Sample CSV template downloaded successfully',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCurrentModule = () => {
    return organizationModules.find(module => module.id === selectedModule);
  };

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  // Render specific module
  if (selectedModule) {
    const currentModule = getCurrentModule();
    const ModuleComponent = currentModule.component;

    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        {/* Module Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <Box sx={{ px: 4, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton 
                onClick={handleBackToOverview}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
                <Link 
                  underline="hover" 
                  color="inherit" 
                  onClick={handleBackToOverview}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Business sx={{ mr: 0.5, fontSize: 16 }} />
                  Back
                </Link>
                <Typography color="primary" fontWeight="medium">
                  {currentModule.title}
                </Typography>
              </Breadcrumbs>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: currentModule.color, 
                  mr: 2, 
                  width: 48, 
                  height: 48 
                }}
              >
                {currentModule.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {currentModule.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentModule.description}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Module Content */}
        <Box sx={{ p: 4 }}>
          <ModuleComponent refreshTrigger={refreshTrigger} />
        </Box>
      </Box>
    );
  }

  // Render overview
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', p: 4 }}>
      {/* Import Actions Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadSampleCsv}
          sx={{ borderRadius: 2 }}
        >
          Download Template
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setCsvImportOpen(true)}
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            }
          }}
        >
          Import Employee Data
        </Button>
      </Box>

      {/* Module Cards */}
      <Grid container spacing={2}>
        {organizationModules.map((module, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={module.id}>
            <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
              <Card
                sx={{
                  height: 140,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  borderTop: `2px solid ${module.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onClick={() => handleModuleSelect(module.id)}
              >
                <CardContent sx={{ 
                  p: 1.5, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  '&:last-child': { pb: 1.5 }
                }}>
                  {/* Header with icon and title */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5, minHeight: 32 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(module.color, 0.1),
                        color: module.color,
                        width: 28,
                        height: 28,
                        mr: 1,
                        flexShrink: 0
                      }}
                    >
                      {module.icon}
                    </Avatar>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      sx={{ 
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {module.title.replace(' Management', '').replace(' Employee', '')}
                    </Typography>
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 0.5, 
                      lineHeight: 1.1,
                      fontSize: '0.65rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1
                    }}
                  >
                    {module.description.substring(0, 45)}...
                  </Typography>
                  
                  {/* Stats at bottom */}
                  <Box sx={{ mt: 'auto' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={module.color}
                      sx={{ 
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {module.stats.primary}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.6rem',
                        lineHeight: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {module.stats.secondary}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* CSV Import Dialog */}
      <Dialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
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
              Import Employee Master Data
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file containing employee data. The system will automatically detect and map all fields from your CSV to the appropriate sections in the organization dashboard.
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
              onClick={() => document.getElementById('csv-upload').click()}
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                style={{ display: 'none' }}
              />
              
              <FileUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {csvFile ? csvFile.name : 'Drop your CSV file here or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports CSV files with employee data
              </Typography>
            </Paper>

            {/* Import Status */}
            {importStatus && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {importStatus}
                </Typography>
              </Box>
            )}

            {/* CSV Headers Preview */}
            {csvHeaders.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detected Fields ({csvHeaders.length}):
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mt: 1, 
                  maxHeight: 200, 
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2
                }}>
                  {csvHeaders.map((header, index) => (
                    <Chip
                      key={index}
                      label={header || `Column ${index + 1}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        fontSize: '0.75rem',
                        height: 24
                      }}
                    />
                  ))}
                </Box>
                
                {/* Sample Data Preview */}
                {csvData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Data Preview (First Row):
                    </Typography>
                    <Paper sx={{ p: 2, maxHeight: 150, overflowY: 'auto', fontSize: '0.8rem' }}>
                      {csvHeaders.map((header, index) => (
                        <Box key={index} sx={{ mb: 1, display: 'flex', gap: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                            {header || `Column ${index + 1}`}:
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {csvData[0] && csvData[0][index] ? csvData[0][index] : 'N/A'}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {/* Import Progress */}
            {isImporting && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Importing data...
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={importProgress}
                  sx={{ borderRadius: 1, height: 8 }}
                />
              </Box>
            )}

            {/* Import Results */}
            {importResults && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Import Results:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`Successfully imported: ${importResults.success} employees`} />
                  </ListItem>
                  {importResults.failed > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary={`Failed imports: ${importResults.failed}`} />
                    </ListItem>
                  )}
                  {importResults.updated > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText primary={`Updated existing: ${importResults.updated}`} />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setCsvImportOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={downloadSampleCsv}
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={isImporting}
          >
            Download Template
          </Button>
          <Button
            onClick={handleImportData}
            variant="contained"
            disabled={!csvData.length || isImporting}
            startIcon={<CloudUploadIcon />}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizationAdvanced;
