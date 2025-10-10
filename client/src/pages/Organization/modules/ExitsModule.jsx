import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Autocomplete,
  IconButton,
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import moment from 'moment';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import ExitSurvey from '../../../components/ExitSurvey';
import ExitSurveySummary from '../../../components/ExitSurveySummary';

const ExitsModule = () => {
  const [exits, setExits] = useState([]);
  const [selectedExit, setSelectedExit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeMainTab, setActiveMainTab] = useState(0);
  
  // CSV Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    employeeId: '',
    exitType: '',
    resignationDate: '',
    lastWorkingDate: '',
    noticePeriod: 0,
    reasonForLeaving: '',
    detailedReason: ''
  });

  useEffect(() => {
    fetchExitRecords();
    fetchStats();
    fetchEmployees();
  }, []);

  // Update selected exit when tab changes
  useEffect(() => {
    const filteredExits = getFilteredExits();
    if (filteredExits.length > 0) {
      // If current selected exit is not in filtered list, select the first one
      if (!filteredExits.find(exit => exit._id === selectedExit?._id)) {
        setSelectedExit(filteredExits[0]);
      }
    } else {
      setSelectedExit(null);
    }
  }, [activeMainTab, exits]);

  const fetchExitRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        // Use mock data if no token
        const mockExits = [
          {
            _id: '1',
            employeeId: 'CODR001',
            employeeName: 'John Doe',
            department: { name: 'Engineering' },
            designation: 'Senior Developer',
            exitType: 'resignation',
            status: 'initiated',
            lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            reasonForLeaving: 'Better opportunity'
          },
          {
            _id: '2',
            employeeId: 'CODR002',
            employeeName: 'Jane Smith',
            department: { name: 'Marketing' },
            designation: 'Marketing Manager',
            exitType: 'termination',
            status: 'pending_approval',
            lastWorkingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            reasonForLeaving: 'Performance issues'
          },
          {
            _id: '3',
            employeeId: 'CODR003',
            employeeName: 'Mike Johnson',
            department: { name: 'Sales' },
            designation: 'Sales Executive',
            exitType: 'resignation',
            status: 'completed',
            lastWorkingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            reasonForLeaving: 'Career change'
          }
        ];
        setExits(mockExits);
        if (mockExits.length > 0) {
          setSelectedExit(mockExits[0]);
        }
        return;
      }

      const response = await fetch('/api/exit-management?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExits(data.exitRecords || []);
        if (data.exitRecords && data.exitRecords.length > 0) {
          setSelectedExit(data.exitRecords[0]);
        }
      } else {
        console.warn('Failed to fetch exit records:', response.status, response.statusText);
        // For testing purposes, add some mock data if API fails
        const mockExits = [
          {
            _id: '1',
            employeeId: 'CODR001',
            employeeName: 'John Doe',
            department: { name: 'Engineering' },
            designation: 'Senior Developer',
            exitType: 'resignation',
            status: 'initiated',
            lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            reasonForLeaving: 'Better opportunity'
          },
          {
            _id: '2',
            employeeId: 'CODR002',
            employeeName: 'Jane Smith',
            department: { name: 'Marketing' },
            designation: 'Marketing Manager',
            exitType: 'termination',
            status: 'pending_approval',
            lastWorkingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            reasonForLeaving: 'Performance issues'
          },
          {
            _id: '3',
            employeeId: 'CODR003',
            employeeName: 'Mike Johnson',
            department: { name: 'Sales' },
            designation: 'Sales Executive',
            exitType: 'resignation',
            status: 'completed',
            lastWorkingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            reasonForLeaving: 'Career change'
          }
        ];
        setExits(mockExits);
        if (mockExits.length > 0) {
          setSelectedExit(mockExits[0]);
        }
        toast.error('Failed to fetch exit records - showing mock data');
      }
    } catch (error) {
      console.error('Error fetching exit records:', error);
      toast.error('Error fetching exit records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exit-management/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.warn('Failed to fetch exit management stats:', response.status);
        // Set default stats if API fails
        setStats({
          totalExits: 0,
          pendingExits: 0,
          completedExits: 0,
          exitsThisMonth: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalExits: 0,
        pendingExits: 0,
        completedExits: 0,
        exitsThisMonth: 0
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching employees for exit management...');
      
      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('/api/organization/employees?limit=500&status=active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Employees fetched successfully:', data.employees?.length || 0, 'employees');
        console.log('📊 Pagination info:', data.pagination);
        console.log('👥 Sample employees:', data.employees?.slice(0, 3));
        
        if (data.employees && data.employees.length > 0) {
          setEmployees(data.employees);
          toast.success(`Loaded ${data.employees.length} employees`);
        } else {
          console.warn('⚠️ No employees found in response');
          setEmployees([]);
          toast.warning('No employees found');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch employees:', response.status, response.statusText, errorData);
        console.error('❌ Validation errors:', errorData.errors);
        
        // Show detailed error message
        const errorMessage = errorData.errors 
          ? errorData.errors.map(e => e.msg).join(', ')
          : errorData.message || 'Failed to load employees';
        
        toast.error(`Failed to load employees: ${errorMessage}`);
        setEmployees([]);
      }
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      toast.error('Failed to load employees. Please try again.');
      setEmployees([]);
    }
  };

  const handleCreateExit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exit-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Exit management record created successfully');
        setCreateDialogOpen(false);
        setFormData({
          employeeId: '',
          exitType: '',
          resignationDate: '',
          lastWorkingDate: '',
          noticePeriod: 0,
          reasonForLeaving: '',
          detailedReason: ''
        });
        fetchExitRecords();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create exit record');
      }
    } catch (error) {
      console.error('Error creating exit record:', error);
      toast.error('Error creating exit record');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exit-management/export?format=csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exit_management_records.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export completed successfully');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data');
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const isCSV = file.type === 'text/csv' || 
                  file.type === 'application/csv' || 
                  file.type === 'text/plain' ||
                  file.name.toLowerCase().endsWith('.csv');
    
    if (!isCSV) {
      toast.error(`Please select a valid CSV file. Selected file type: ${file.type}`);
      return;
    }

    setCsvFile(file);
    // Reset previous data
    setCsvHeaders([]);
    setCsvData([]);
    
    // Parse the file
    parseCsvFile(file);
    
    // Reset file input
    event.target.value = '';
  };

  const parseCsvFile = (file) => {
    console.log('Starting to parse file:', file.name, 'Size:', file.size);
    
    // Read the file as text
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      console.log('File content (first 500 chars):', text.substring(0, 500));
      
      // Try to detect delimiter (tab or comma)
      const firstLine = text.split('\n')[0];
      const hasTab = firstLine.includes('\t');
      const delimiter = hasTab ? '\t' : ',';
      
      console.log('Detected delimiter:', delimiter === '\t' ? 'TAB (TSV)' : 'COMMA (CSV)');
      
      // Parse with PapaParse
      Papa.parse(text, {
        complete: (results) => {
          console.log('PapaParse results:', results);
          
          if (results.errors && results.errors.length > 0) {
            console.warn('PapaParse warnings:', results.errors);
          }
          
          if (!results.data || results.data.length === 0) {
            toast.error('No data found in CSV file. Please check the file format.');
            return;
          }
          
          // Remove completely empty rows
          let cleanData = results.data.filter(row => 
            Array.isArray(row) && row.length > 0 && row.some(cell => 
              cell !== null && cell !== undefined && cell.toString().trim() !== ''
            )
          );
          
          console.log('Clean data after filtering:', cleanData.length, 'rows');
          
          if (cleanData.length === 0) {
            toast.error('No valid data rows found in CSV file');
            return;
          }
          
          // Extract headers (first row)
          const rawHeaders = cleanData[0];
          const headers = rawHeaders.map((header, index) => {
            const cleanHeader = header ? header.toString().trim() : '';
            return cleanHeader || `Column ${index + 1}`;
          });
          
          console.log('Processed headers:', headers);
          console.log('Number of columns:', headers.length);
          
          // Extract data rows (skip first row which contains headers)
          const dataRows = cleanData.slice(1);
          console.log('Data rows count:', dataRows.length);
          
          // Log first data row for debugging
          if (dataRows.length > 0) {
            console.log('First data row sample:', dataRows[0]);
            console.log('First row column count:', dataRows[0].length);
          }
          
          // Validate that we have consistent column counts
          const headerCount = headers.length;
          const validDataRows = dataRows.filter((row, index) => {
            const isValid = Array.isArray(row) && row.length <= headerCount && 
                           row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
            return isValid;
          });
          
          console.log('Final valid data rows:', validDataRows.length);
          
          setCsvHeaders(headers);
          setCsvData(validDataRows);
          setImportDialogOpen(true);
          
          toast.success(`Successfully parsed ${validDataRows.length} exit records with ${headers.length} fields`);
        },
        header: false,
        skipEmptyLines: true,
        delimiter: delimiter,  // Auto-detected delimiter
        quoteChar: '"',
        escapeChar: '"',
        dynamicTyping: false,
        encoding: 'UTF-8',
        worker: false,
        error: (error) => {
          console.error('PapaParse error:', error);
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Error reading CSV file');
    };
    
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!csvData.length) {
      toast.warning('No data to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data for import - convert CSV rows to objects
      const exitRecords = csvData.map((row, index) => {
        const record = {};
        csvHeaders.forEach((header, headerIndex) => {
          // Map headers to the expected field names
          const value = row[headerIndex] || '';
          record[header] = value;
        });
        return record;
      });

      console.log('CSV Headers:', csvHeaders);
      console.log('Sample record (first one):', exitRecords[0]);
      console.log('Importing exit records:', exitRecords.length);
      toast.info(`📥 Importing ${exitRecords.length} exit records...`);

      const response = await fetch('/api/exit-management/import-json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exitRecords })
      });

      if (response.ok) {
        const result = await response.json();
        setImportProgress(100);
        toast.success(`✅ Successfully imported ${result.imported} exit records!`);
        
        if (result.failed > 0) {
          toast.warning(`⚠️ ${result.failed} records failed to import.`);
          console.log('Failed records:', result.errors);
          console.table(result.errors.slice(0, 5)); // Show first 5 errors in table format
        }
        
        // Close dialog and refresh data
        setImportDialogOpen(false);
        setCsvData([]);
        setCsvHeaders([]);
        setCsvFile(null);
        fetchExitRecords();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to import CSV');
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Error importing CSV file');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleSurveySubmit = async (surveyData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exit-management/${selectedExit._id}/exit-survey`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });
      
      if (response.ok) {
        toast.success('Exit survey submitted successfully');
        setSurveyDialogOpen(false);
        fetchExitRecords();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit exit survey');
      }
    } catch (error) {
      console.error('Error submitting exit survey:', error);
      toast.error('Error submitting exit survey');
    }
  };

  const handleUpdateMissingFields = async () => {
    try {
      const token = localStorage.getItem('token');
      toast.info('🔄 Updating exit records with missing employee information...');
      
      const response = await fetch('/api/exit-management/update-missing-fields', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`✅ ${result.message}`);
        fetchExitRecords(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update exit records');
      }
    } catch (error) {
      console.error('Error updating exit records:', error);
      toast.error('Error updating exit records');
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'initiated': { color: 'warning', label: 'Initiated' },
      'in_progress': { color: 'info', label: 'In Progress' },
      'pending_clearance': { color: 'warning', label: 'Pending Clearance' },
      'pending_approval': { color: 'secondary', label: 'Pending Approval' },
      'completed': { color: 'success', label: 'Completed' },
      'cancelled': { color: 'error', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const getExitTypeChip = (type) => {
    const typeConfig = {
      'resignation': { color: 'primary', label: 'Resignation' },
      'termination': { color: 'error', label: 'Termination' },
      'retirement': { color: 'secondary', label: 'Retirement' },
      'contract_end': { color: 'info', label: 'Contract End' },
      'layoff': { color: 'warning', label: 'Layoff' },
      'death': { color: 'error', label: 'Death' },
      'other': { color: 'default', label: 'Other' }
    };
    
    const config = typeConfig[type] || { color: 'default', label: type };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  // Filter exits based on the selected main tab
  const getFilteredExits = () => {
    const today = new Date();
    
    switch (activeMainTab) {
      case 0: // Under review (Resignations & Terminations)
        return exits.filter(exit => 
          exit.status === 'initiated' || 
          exit.status === 'in_progress' || 
          exit.status === 'pending_clearance' ||
          exit.status === 'pending_approval'
        );
      
      case 1: // Exits in progress (Employees whose exit request is approved)
        return exits.filter(exit => 
          exit.status === 'pending_approval' && 
          new Date(exit.lastWorkingDate) > today
        );
      
      case 2: // Exited employees (Employees whose last working day has passed)
        return exits.filter(exit => 
          exit.status === 'completed' || 
          new Date(exit.lastWorkingDate) <= today
        );
      
      default:
        return exits;
    }
  };

  const getTabCounts = () => {
    const today = new Date();
    
    const underReview = exits.filter(exit => 
      exit.status === 'initiated' || 
      exit.status === 'in_progress' || 
      exit.status === 'pending_clearance' ||
      exit.status === 'pending_approval'
    ).length;
    
    const inProgress = exits.filter(exit => 
      exit.status === 'pending_approval' && 
      new Date(exit.lastWorkingDate) > today
    ).length;
    
    const exited = exits.filter(exit => 
      exit.status === 'completed' || 
      new Date(exit.lastWorkingDate) <= today
    ).length;
    
    return { underReview, inProgress, exited };
  };

  const handleClearanceItemToggle = async (clearanceType, itemIndex) => {
    if (!selectedExit) return;
    
    try {
      const token = localStorage.getItem('token');
      const clearance = selectedExit.clearance[clearanceType];
      const items = [...clearance.items];
      
      // Toggle item status
      items[itemIndex].status = items[itemIndex].status === 'completed' ? 'pending' : 'completed';
      
      // Determine overall clearance status
      const allCompleted = items.every(item => item.status === 'completed');
      const anyCompleted = items.some(item => item.status === 'completed');
      const status = allCompleted ? 'completed' : anyCompleted ? 'in_progress' : 'pending';
      
      const response = await fetch(`/api/exit-management/${selectedExit._id}/clearance/${clearanceType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          items,
          notes: clearance.notes || ''
        })
      });
      
      if (response.ok) {
        toast.success('Clearance item updated successfully');
        fetchExitRecords();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update clearance item');
      }
    } catch (error) {
      console.error('Error updating clearance item:', error);
      toast.error('Error updating clearance item');
    }
  };

  const renderClearanceSection = (title, clearance, icon, clearanceType) => {
    if (!clearance) return null;
    
    const completedItems = clearance.items?.filter(item => item.status === 'completed').length || 0;
    const totalItems = clearance.items?.length || 0;
    const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    return (
      <Accordion 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          mb: 2,
          '&:before': {
            display: 'none'
          },
          '&.Mui-expanded': {
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
          }
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.04)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ 
              bgcolor: percentage === 100 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(102, 126, 234, 0.1)',
              color: percentage === 100 ? '#4caf50' : '#667eea',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
            <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip 
              size="medium" 
              sx={{
                bgcolor: percentage === 100 ? '#4caf50' : '#ff9800',
                color: 'white',
                fontWeight: 600
              }}
              label={`${completedItems}/${totalItems}`}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="600" color="text.primary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="600" color="#667eea">
                {percentage.toFixed(0)}% Complete
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: percentage === 100 
                    ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            />
          </Box>
          {clearance.items?.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5, 
                p: 2, 
                borderRadius: 2,
                bgcolor: item.status === 'completed' 
                  ? 'rgba(76, 175, 80, 0.08)' 
                  : 'rgba(0, 0, 0, 0.02)',
                border: '2px solid',
                borderColor: item.status === 'completed' 
                  ? 'rgba(76, 175, 80, 0.3)' 
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: item.status === 'completed' 
                    ? 'rgba(76, 175, 80, 0.12)' 
                    : 'rgba(102, 126, 234, 0.08)',
                  borderColor: item.status === 'completed' 
                    ? 'rgba(76, 175, 80, 0.5)' 
                    : '#667eea',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => handleClearanceItemToggle(clearanceType, index)}
            >
              <CheckCircleIcon 
                sx={{ 
                  mr: 2, 
                  fontSize: 28,
                  color: item.status === 'completed' ? '#4caf50' : '#ccc',
                  transition: 'all 0.3s ease'
                }}
              />
              <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500 }}>
                {item.item}
              </Typography>
              <Chip 
                size="medium" 
                sx={{
                  bgcolor: item.status === 'completed' ? '#4caf50' : '#e0e0e0',
                  color: item.status === 'completed' ? 'white' : 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
                label={item.status}
              />
            </Box>
          ))}
          {clearance.notes && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">{clearance.notes}</Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderExitDetails = (exit) => {
    if (!exit) return null;

  return (
      <Box>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Clearance" />
          <Tab label="Assets" />
          <Tab label="Financial" />
          <Tab label="Interview" />
          <Tab label="Exit Survey" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>Employee Information</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.employeeId}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.employeeName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Department</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.department?.name || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Designation</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.designation}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.location || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Work Email</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.workEmail || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Personal Email</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.personalEmail || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Reporting Manager</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {exit.reportingManager?.personalInfo?.firstName && exit.reportingManager?.personalInfo?.lastName 
                              ? `${exit.reportingManager.personalInfo.firstName} ${exit.reportingManager.personalInfo.lastName}`
                              : exit.reportingManagerName || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Mobile Phone</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.mobilePhone || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Current Address</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.currentAddress || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Date of Joining</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {exit.dateOfJoining ? moment(exit.dateOfJoining).format('DD MMM YYYY') : 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>Exit Details</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Exit Type</Typography>
                          {getExitTypeChip(exit.exitType)}
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Current Status</Typography>
                          {getStatusChip(exit.status)}
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Requested By</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.requestedBy || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Notice Date</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {exit.resignationDate ? moment(exit.resignationDate).format('DD MMM YYYY') : 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Last Working Date</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {moment(exit.lastWorkingDate).format('DD MMM YYYY')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Exit Reason</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.reasonForLeaving || 'N/A'}</Typography>
                        </Box>
                        {exit.detailedReason && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Detailed Reason</Typography>
                            <Typography variant="body1" fontWeight="500">{exit.detailedReason}</Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" color="text.secondary">Ok to Rehire</Typography>
                          <Chip 
                            size="small" 
                            color={exit.okToRehire ? 'success' : 'default'}
                            label={exit.okToRehire ? 'Yes' : exit.okToRehire === false ? 'No' : 'N/A'}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Asset Recovery</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.assetRecoveryStatus || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Finance Settlement</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.financeSettlementStatus || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Exit Survey</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.exitSurveyStatus || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Team Transition</Typography>
                          <Typography variant="body1" fontWeight="500">{exit.teamTransitionStatus || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status Update Card */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                          <Typography variant="h5" fontWeight="700" gutterBottom>
                            Update Exit Status
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Move the exit through different stages of completion
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <FormControl fullWidth>
                            <InputLabel>Change Status</InputLabel>
                            <Select
                              value={exit.status}
                              onChange={async (e) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`/api/exit-management/${exit._id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ status: e.target.value })
                                  });
                                  
                                  if (response.ok) {
                                    toast.success('Status updated successfully');
                                    fetchExitRecords();
                                  } else {
                                    const error = await response.json();
                                    toast.error(error.message || 'Failed to update status');
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                  toast.error('Error updating status');
                                }
                              }}
                              label="Change Status"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&:hover fieldset': {
                                    borderColor: '#667eea'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#667eea'
                                  }
                                }
                              }}
                            >
                              <MenuItem value="initiated">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="Initiated" color="warning" />
                                  <Typography variant="body2">- Exit request received</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="in_progress">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="In Progress" color="info" />
                                  <Typography variant="body2">- Notice period active</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="pending_clearance">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="Pending Clearance" color="warning" />
                                  <Typography variant="body2">- Awaiting clearances</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="pending_approval">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="Pending Approval" color="secondary" />
                                  <Typography variant="body2">- Final review needed</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="completed">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="Completed" color="success" />
                                  <Typography variant="body2">- Exit finalized ✅</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value="cancelled">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip size="small" label="Cancelled" color="error" />
                                  <Typography variant="body2">- Exit cancelled</Typography>
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={exit.status === 'completed'}
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch(`/api/exit-management/${exit._id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ status: 'completed' })
                                });
                                
                                if (response.ok) {
                                  toast.success('🎉 Exit completed successfully!');
                                  fetchExitRecords();
                                } else {
                                  const error = await response.json();
                                  toast.error(error.message || 'Failed to complete exit');
                                }
                              } catch (error) {
                                console.error('Error completing exit:', error);
                                toast.error('Error completing exit');
                              }
                            }}
                            sx={{
                              height: '56px',
                              background: exit.status === 'completed' 
                                ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem',
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                              '&:hover': {
                                background: exit.status === 'completed'
                                  ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                                  : 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                              },
                              '&:disabled': {
                                background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                                color: 'white',
                                opacity: 0.8
                              }
                            }}
                          >
                            {exit.status === 'completed' ? '✅ Completed' : '🎯 Mark as Completed'}
                          </Button>
                        </Grid>
                      </Grid>

                      {/* Status Flow Guide */}
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          📊 Exit Status Flow:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip size="small" label="Initiated" color="warning" />
                          <Typography variant="body2">→</Typography>
                          <Chip size="small" label="In Progress" color="info" />
                          <Typography variant="body2">→</Typography>
                          <Chip size="small" label="Pending Clearance" color="warning" />
                          <Typography variant="body2">→</Typography>
                          <Chip size="small" label="Pending Approval" color="secondary" />
                          <Typography variant="body2">→</Typography>
                          <Chip size="small" label="Completed" color="success" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: 2,
                p: 3,
                mb: 3
              }}>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  Clearance Checklist
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track and manage all clearance requirements for employee exit
                </Typography>
              </Box>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#667eea'
                  }
                }}
              >
                <Typography variant="body2" fontWeight="500">
                  💡 Click on any clearance item to toggle its status between pending and completed
                </Typography>
              </Alert>
              <Stack spacing={2}>
                {renderClearanceSection('IT Clearance', exit.clearance?.itClearance, <ComputerIcon />, 'itClearance')}
                {renderClearanceSection('HR Clearance', exit.clearance?.hrClearance, <BusinessIcon />, 'hrClearance')}
                {renderClearanceSection('Finance Clearance', exit.clearance?.financeClearance, <AccountBalanceIcon />, 'financeClearance')}
                {renderClearanceSection('Manager Clearance', exit.clearance?.managerClearance, <SupervisorAccountIcon />, 'managerClearance')}
                {renderClearanceSection('Admin Clearance', exit.clearance?.adminClearance, <AdminPanelSettingsIcon />, 'adminClearance')}
              </Stack>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Asset Return</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Return Status</TableCell>
                      <TableCell>Condition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exit.assets?.map((asset, index) => (
                      <TableRow key={index}>
                        <TableCell>{asset.assetName}</TableCell>
                        <TableCell>{asset.assetType}</TableCell>
                        <TableCell>{asset.serialNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            color={asset.returnStatus === 'returned' ? 'success' : 'warning'}
                            label={asset.returnStatus}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            color={asset.condition === 'good' ? 'success' : 'warning'}
                            label={asset.condition}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Financial Settlement</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Outstanding Payments</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Pending Salary:</Typography>
                          <Typography>₹{exit.financialSettlement?.outstandingPayments?.pendingSalary || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Bonus:</Typography>
                          <Typography>₹{exit.financialSettlement?.outstandingPayments?.bonus || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Incentives:</Typography>
                          <Typography>₹{exit.financialSettlement?.outstandingPayments?.incentives || 0}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography>Total Outstanding:</Typography>
                          <Typography>₹{exit.financialSettlement?.outstandingPayments?.total || 0}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Deductions</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Advance Salary:</Typography>
                          <Typography>₹{exit.financialSettlement?.deductions?.advanceSalary || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Loan Deduction:</Typography>
                          <Typography>₹{exit.financialSettlement?.deductions?.loanDeduction || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Tax Deduction:</Typography>
                          <Typography>₹{exit.financialSettlement?.deductions?.taxDeduction || 0}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <Typography>Total Deductions:</Typography>
                          <Typography>₹{exit.financialSettlement?.deductions?.total || 0}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Exit Interview</Typography>
              {exit.exitInterview?.conducted ? (
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Conducted Date</Typography>
                        <Typography variant="body1">
                          {moment(exit.exitInterview.conductedDate).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Overall Rating</Typography>
                        <Typography variant="body1">
                          {exit.exitInterview.overallRating}/5
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Rehire Eligible</Typography>
                        <Chip 
                          size="small" 
                          color={exit.exitInterview.rehireEligible ? 'success' : 'error'}
                          label={exit.exitInterview.rehireEligible ? 'Yes' : 'No'}
                        />
                      </Box>
                      {exit.exitInterview.recommendations && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Recommendations</Typography>
                          <Typography variant="body1">{exit.exitInterview.recommendations}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="warning">
                  Exit interview has not been conducted yet.
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>Exit Survey</Typography>
                {!exit.exitSurvey?.submitted && (
                  <Button
                    variant="contained"
                    onClick={() => setSurveyDialogOpen(true)}
                  >
                    Take Exit Survey
                  </Button>
                )}
              </Box>
              
              {exit.exitSurvey?.submitted ? (
                <ExitSurveySummary 
                  surveyData={{
                    employeeId: exit.employeeId,
                    employeeName: exit.employeeName,
                    submittedDate: exit.exitSurvey.submittedDate,
                    remunerationSatisfaction: exit.exitSurvey.compensationBenefits?.remunerationSatisfaction,
                    achievementsRecognized: exit.exitSurvey.compensationBenefits?.achievementsRecognized,
                    recognitionFrequency: exit.exitSurvey.compensationBenefits?.recognitionFrequency,
                    constructiveFeedback: exit.exitSurvey.compensationBenefits?.constructiveFeedback,
                    trainingSatisfaction: exit.exitSurvey.workEnvironment?.trainingSatisfaction,
                    workLifeBalance: exit.exitSurvey.workEnvironment?.workLifeBalance,
                    skillsUtilization: exit.exitSurvey.workEnvironment?.skillsUtilization,
                    jobHappiness: exit.exitSurvey.workEnvironment?.jobHappiness,
                    managerTreatment: exit.exitSurvey.workEnvironment?.managerTreatment,
                    companyHappiness: exit.exitSurvey.organizationCulture?.companyHappiness,
                    recommendLikelihood: exit.exitSurvey.organizationCulture?.recommendLikelihood,
                    rehireConsideration: exit.exitSurvey.organizationCulture?.rehireConsideration,
                    leavingReason: exit.exitSurvey.triggerReason?.leavingReason,
                    concernsShared: exit.exitSurvey.triggerReason?.concernsShared,
                    improvementSuggestions: exit.exitSurvey.triggerReason?.improvementSuggestions,
                    futureContact: exit.exitSurvey.triggerReason?.futureContact
                  }}
                />
              ) : (
                <Alert severity="info">
                  Exit survey has not been completed yet. Click "Take Exit Survey" to begin.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section with Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" fontWeight="700" color="white" sx={{ mb: 1 }}>
              Exit Management
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.9)">
              Streamline employee offboarding with comprehensive exit management
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleUpdateMissingFields}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              🔄 Update Fields
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              📤 Import CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleImportCSV}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              Create Exit Record
            </Button>
          </Stack>
        </Box>
      </Box>

        {/* Main Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={activeMainTab} 
            onChange={(e, newValue) => setActiveMainTab(newValue)}
            variant="fullWidth"
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              p: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)'
                },
                '&.Mui-selected': {
                  bgcolor: '#667eea',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab 
              icon={<AssignmentIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Under review ({getTabCounts().underReview})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resignations & Terminations
                  </Typography>
                </Box>
              }
            />
            <Tab 
              icon={<PlayArrowIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Exits in progress ({getTabCounts().inProgress})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employees whose exit request is approved
                  </Typography>
                </Box>
              }
            />
            <Tab 
              icon={<DoneIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Exited employees ({getTabCounts().exited})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employees whose last working day has passed
                  </Typography>
                </Box>
              }
            />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
        {/* Exit Records List */}
          <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            height: '100%',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3 
              }}>
                <Typography variant="h6" fontWeight="600">
                  Exit Records
                </Typography>
                <Chip 
                  label={getFilteredExits().length}
                  sx={{ 
                    bgcolor: '#667eea',
                    color: 'white',
                    fontWeight: 600 
                  }}
                />
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {getFilteredExits().map((exit) => (
                    <ListItemButton
                    key={exit._id}
                    selected={selectedExit?._id === exit._id}
                      onClick={() => setSelectedExit(exit)}
                    sx={{ 
                      mb: 1.5, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: selectedExit?._id === exit._id ? '#667eea' : 'transparent',
                      bgcolor: selectedExit?._id === exit._id ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#667eea',
                        bgcolor: 'rgba(102, 126, 234, 0.04)',
                        transform: 'translateX(4px)'
                      }
                    }}
                    >
                      <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: selectedExit?._id === exit._id ? '#667eea' : '#f0f0f0',
                        color: selectedExit?._id === exit._id ? 'white' : '#667eea',
                        width: 48,
                        height: 48,
                        boxShadow: selectedExit?._id === exit._id ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                      }}>
                        <PersonIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={exit.employeeName}
                        primaryTypographyProps={{
                          variant: "body1",
                          fontWeight: 600
                        }}
                        secondary={
                          <Box component="div" sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" component="div">
                              {exit.employeeId} • {exit.department?.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              {getStatusChip(exit.status)}
                              {getExitTypeChip(exit.exitType)}
                            </Stack>
                          </Box>
                        }
                        secondaryTypographyProps={{
                          component: "div"
                        }}
                      />
                    </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
          </Grid>

          {/* Exit Details */}
          <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            height: '100%',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent>
              {selectedExit ? (
                renderExitDetails(selectedExit)
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 3
                  }}>
                    <ExitToAppIcon sx={{ fontSize: 64, color: '#667eea' }} />
                  </Box>
                  <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                    No Exit Record Selected
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select an exit record from the list to view details
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Exit Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          Create Exit Management Record
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => 
                  `${option.employeeId} - ${option.personalInfo?.firstName || ''} ${option.personalInfo?.lastName || ''}`
                }
                value={employees.find(emp => emp.employeeId === formData.employeeId) || null}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, employeeId: newValue?.employeeId || '' });
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Employee" 
                    placeholder="Search employee by ID or name..."
                    required
                    helperText={employees.length === 0 ? 'Loading employees...' : `${employees.length} employees available`}
                  />
                )}
                loading={employees.length === 0}
                noOptionsText="No employees found"
                isOptionEqualToValue={(option, value) => option.employeeId === value.employeeId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Exit Type</InputLabel>
                <Select
                  value={formData.exitType}
                  onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                  label="Exit Type"
                >
                  <MenuItem value="resignation">Resignation</MenuItem>
                  <MenuItem value="termination">Termination</MenuItem>
                  <MenuItem value="retirement">Retirement</MenuItem>
                  <MenuItem value="contract_end">Contract End</MenuItem>
                  <MenuItem value="layoff">Layoff</MenuItem>
                  <MenuItem value="death">Death</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resignation Date"
                type="date"
                value={formData.resignationDate}
                onChange={(e) => setFormData({ ...formData, resignationDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
                    <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Working Date"
                type="date"
                value={formData.lastWorkingDate}
                onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
                    </Grid>
                    <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notice Period (Days)"
                type="number"
                value={formData.noticePeriod}
                onChange={(e) => setFormData({ ...formData, noticePeriod: parseInt(e.target.value) || 0 })}
              />
                    </Grid>
                    <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Leaving"
                value={formData.reasonForLeaving}
                onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
                required
              />
                    </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Detailed Reason"
                multiline
                rows={3}
                value={formData.detailedReason}
                onChange={(e) => setFormData({ ...formData, detailedReason: e.target.value })}
              />
                  </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateExit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Exit Survey Dialog */}
      <Dialog 
        open={surveyDialogOpen} 
        onClose={() => setSurveyDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        fullScreen
      >
        <DialogContent sx={{ p: 0 }}>
          <ExitSurvey
            exitRecord={selectedExit}
            onSubmit={handleSurveySubmit}
            onCancel={() => setSurveyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CSV Import Preview Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => !isImporting && setImportDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VisibilityIcon />
            CSV Import Preview
          </Box>
          <IconButton 
            onClick={() => !isImporting && setImportDialogOpen(false)}
            disabled={isImporting}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          {csvFile && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="600">
                File: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
              </Typography>
              <Typography variant="body2">
                {csvData.length} records found with {csvHeaders.length} fields
              </Typography>
            </Alert>
          )}

          {isImporting && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Importing records... {importProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={importProgress} />
            </Box>
          )}

          {csvData.length > 0 && (
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>#</TableCell>
                    {csvHeaders.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvData.slice(0, 50).map((row, rowIndex) => (
                    <TableRow key={rowIndex} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{rowIndex + 1}</TableCell>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {cell || <span style={{ color: '#ccc' }}>—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {csvData.length > 50 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Showing first 50 records. Total records: {csvData.length}
            </Alert>
          )}

          {csvData.length === 0 && (
            <Alert severity="warning">
              No data to preview. Please select a valid CSV file.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button 
            onClick={() => setImportDialogOpen(false)} 
            disabled={isImporting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmImport}
            disabled={isImporting || csvData.length === 0}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
              }
            }}
          >
            {isImporting ? 'Importing...' : `Import ${csvData.length} Records`}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
  );
};

export default ExitsModule;
