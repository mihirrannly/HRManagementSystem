import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Drawer,
  ListItemButton,
  Collapse,
  Badge,
  Avatar,
  Stack,
  Container,
  useTheme,
  alpha,
  Fade,
  Slide,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  Upload as UploadIcon,
  GetApp as GetAppIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  AttachMoney as AttachMoneyIcon,
  Flight as FlightIcon,
  Description as DescriptionIcon,
  Favorite as FavoriteIcon,
  Computer as ComputerIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ChevronRight,
  Home as HomeIcon,
  TrendingUp,
  Group,
  Business,
  Assignment,
  LocalAirport,
  Folder,
  Psychology,
  Devices,
  Tune,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import Papa from 'papaparse';

import { useAuth } from '../../contexts/AuthContext';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Organization = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  
  // Employee data
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 25,
    total: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: 'active'
  });
  
  // Departments
  const [departments, setDepartments] = useState([]);
  
  // Recent changes
  const [recentChanges, setRecentChanges] = useState([]);
  
  // Import functionality
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importMode, setImportMode] = useState('create');
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    fetchAnalytics();
    fetchDepartments();
    fetchRecentChanges();
  }, [isAdmin]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchEmployees();
    }
  }, [tabValue, pagination.page, pagination.rowsPerPage, filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/organization/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch organization analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage,
      };
      
      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.department && filters.department.trim()) {
        params.department = filters.department.trim();
      }
      if (filters.status && filters.status.trim()) {
        params.status = filters.status.trim();
      }
      
      const response = await axios.get('/organization/employees', { params });
      setEmployees(response.data.employees);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employee data';
      toast.error(errorMessage);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/organization/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchRecentChanges = async () => {
    try {
      const response = await axios.get('/organization/recent-changes?days=7');
      setRecentChanges(response.data);
    } catch (error) {
      console.error('Error fetching recent changes:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        exportFormat: 'csv',
      };
      
      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.department && filters.department.trim()) {
        params.department = filters.department.trim();
      }
      if (filters.status && filters.status.trim()) {
        params.status = filters.status.trim();
      }
      
      const response = await axios.get('/organization/employees', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `organization-data-${moment().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get('/organization/import-template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee-import-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            toast.error('Error parsing CSV file');
            return;
          }
          
          const data = results.data.filter(row => 
            Object.values(row).some(cell => cell && cell.toString().trim() !== '')
          );
          
          setImportData(data);
          setImportDialogOpen(true);
        },
        header: true,
        skipEmptyLines: true
      });
    } else {
      // For Excel files, we'll need to handle them differently
      // For now, show a message to convert to CSV
      toast.info('Please convert Excel file to CSV format for import');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleImportSubmit = async () => {
    if (importData.length === 0) {
      toast.error('No data to import');
      return;
    }

    try {
      setImportLoading(true);
      const response = await axios.post('/organization/import', {
        employees: importData,
        mode: importMode
      });

      setImportResults(response.data.results);
      toast.success(response.data.message);
      
      // Refresh employee data
      if (tabValue === 1) {
        fetchEmployees();
      }
      fetchAnalytics();
      
    } catch (error) {
      console.error('Error importing data:', error);
      const errorMessage = error.response?.data?.message || 'Import failed';
      toast.error(errorMessage);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportData([]);
    setImportResults(null);
    setImportMode('create');
  };

  if (!isAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">
          Access denied. This page requires administrator privileges.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading organization data...</Typography>
      </Box>
    );
  }

  const StatCard = ({ title, value, change, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            bgcolor: `${color}.main`, 
            color: 'white', 
            borderRadius: 2, 
            p: 1, 
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {change > 0 ? (
              <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
            ) : change < 0 ? (
              <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
            ) : null}
            <Typography
              variant="body2"
              color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'}
              fontWeight="medium"
            >
              {change > 0 ? '+' : ''}{change} this month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderAnalyticsTab = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={analytics?.summary?.totalEmployees || 0}
            change={analytics?.summary?.newEmployeesThisMonth || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Additions"
            value={analytics?.summary?.newEmployeesThisMonth || 0}
            subtitle="This month"
            icon={<PersonAddIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Employees Exited"
            value={analytics?.summary?.exitedEmployeesThisMonth || 0}
            subtitle="This month"
            icon={<PersonOffIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Probation"
            value={analytics?.summary?.employeesInProbation || 0}
            icon={<ScheduleIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Department Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Department Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.breakdowns?.departments || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="totalEmployees"
                  nameKey="departmentName"
                  label={({ departmentName, percent }) => 
                    `${departmentName} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(analytics?.breakdowns?.departments || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Employment Type Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Employment Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.breakdowns?.employmentTypes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Changes */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Recent Data Changes
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchRecentChanges}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Changes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentChanges.slice(0, 10).map((change, index) => (
                <TableRow key={index}>
                  <TableCell>{change.employeeId}</TableCell>
                  <TableCell>{change.employeeName}</TableCell>
                  <TableCell>{change.designation}</TableCell>
                  <TableCell>{change.department}</TableCell>
                  <TableCell>{change.lastUpdated}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${change.changesCount} changes`} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                </TableRow>
              ))}
              {recentChanges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No recent changes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderEmployeesTab = () => (
    <Box>
      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Department"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">All Employees</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {employeesLoading && <LinearProgress />}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Employee Number</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Date of Joining</TableCell>
                <TableCell>Employment Status</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Total CTC</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>HRA</TableCell>
                <TableCell>Gross(A)</TableCell>
                <TableCell>PF Employee</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee, index) => (
                <TableRow key={index} hover>
                  <TableCell>{employee.employeeNumber}</TableCell>
                  <TableCell>{employee.employeeName}</TableCell>
                  <TableCell>{employee.dateOfJoining}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.employmentStatus}
                      color={
                        employee.employmentStatus === 'Confirmed' ? 'success' :
                        employee.employmentStatus === 'Probation' ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.location}</TableCell>
                  <TableCell>₹{employee.totalCTC?.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.basic?.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.hra?.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.grossA?.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.pfEmployee?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && !employeesLoading && (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Organization Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadTemplate}
            sx={{ mr: 1 }}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ mr: 1 }}
          >
            Import Data
          </Button>
          <IconButton onClick={fetchAnalytics} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<UpdateIcon />}
            onClick={() => {
              fetchAnalytics();
              fetchRecentChanges();
              if (tabValue === 1) fetchEmployees();
            }}
          >
            Refresh All
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Analytics Dashboard" />
          <Tab label="Employee Data" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && renderAnalyticsTab()}
      {tabValue === 1 && renderEmployeesTab()}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
      />

      {/* Import Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={handleCloseImportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Import Employee Data
        </DialogTitle>
        <DialogContent>
          {importResults ? (
            // Show import results
            <Box>
              <Alert 
                severity={importResults.failed === 0 ? 'success' : 'warning'} 
                sx={{ mb: 3 }}
              >
                Import completed: {importResults.success} successful, {importResults.failed} failed
              </Alert>
              
              {importResults.created.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Created ({importResults.created.length})
                  </Typography>
                  <Typography variant="body2">
                    {importResults.created.join(', ')}
                  </Typography>
                </Box>
              )}

              {importResults.updated.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="info.main" gutterBottom>
                    🔄 Updated ({importResults.updated.length})
                  </Typography>
                  <Typography variant="body2">
                    {importResults.updated.join(', ')}
                  </Typography>
                </Box>
              )}

              {importResults.errors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    ❌ Errors ({importResults.errors.length})
                  </Typography>
                  <List dense>
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Row ${error.row}: ${error.error}`}
                          secondary={error.data?.employeeName || error.data?.email}
                        />
                      </ListItem>
                    ))}
                    {importResults.errors.length > 5 && (
                      <ListItem>
                        <ListItemText
                          primary={`... and ${importResults.errors.length - 5} more errors`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Box>
          ) : (
            // Show import preview and options
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Ready to import {importData.length} employee records
              </Alert>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Import Mode</FormLabel>
                <RadioGroup
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  row
                >
                  <FormControlLabel 
                    value="create" 
                    control={<Radio />} 
                    label="Create Only (Skip existing)" 
                  />
                  <FormControlLabel 
                    value="update" 
                    control={<Radio />} 
                    label="Update Only (Skip new)" 
                  />
                  <FormControlLabel 
                    value="upsert" 
                    control={<Radio />} 
                    label="Create & Update" 
                  />
                </RadioGroup>
              </FormControl>

              <Typography variant="subtitle2" gutterBottom>
                Preview (First 5 records):
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Job Title</TableCell>
                      <TableCell>CTC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.employeeName || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{row.department || '-'}</TableCell>
                        <TableCell>{row.jobTitle || '-'}</TableCell>
                        <TableCell>{row.totalCTC || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>
            {importResults ? 'Close' : 'Cancel'}
          </Button>
          {!importResults && (
            <Button 
              onClick={handleImportSubmit}
              variant="contained"
              disabled={importLoading}
              startIcon={importLoading ? <LinearProgress size={20} /> : <UploadIcon />}
            >
              {importLoading ? 'Importing...' : 'Import Data'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Organization;
