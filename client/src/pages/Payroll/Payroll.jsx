import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  PlayArrow as PlayIcon,
  Calculate as CalculateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';
import SalaryCalculator from '../../components/SalaryCalculator/SalaryCalculator';

const Payroll = () => {
  const { user, isHR, isAdmin } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
  });
  
  // Run Payroll states
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);
  const [payrollProcessing, setPayrollProcessing] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: ''
  });
  const [payrollPreview, setPayrollPreview] = useState(null);
  
  // Employee details states
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSalaryData, setEmployeeSalaryData] = useState(null);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Delete all dialog state
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    fetchPayrollData();
    fetchEmployees();
  }, []);

  // Handle focus management for delete dialog
  useEffect(() => {
    if (openDeleteAllDialog && deleteButtonRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        deleteButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openDeleteAllDialog]);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      // Request all employees by setting a high limit
      const response = await axios.get('/api/employees', {
        params: {
          limit: 1000, // Set high limit to get all employees
          page: 1
        }
      });
      console.log('📊 Fetched employees:', response.data.employees?.length || 0);
      console.log('📋 Employee data:', response.data);
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payroll/payslips');
      setPayslips(response.data.payslips || []);
      
      // Calculate summary if HR/Admin
      if (isHR || isAdmin) {
        const totalGross = response.data.payslips.reduce((sum, p) => sum + p.grossPay, 0);
        const totalDeductions = response.data.payslips.reduce((sum, p) => sum + p.totalDeductions, 0);
        const totalNet = response.data.payslips.reduce((sum, p) => sum + p.netPay, 0);
        
        setSummary({
          totalEmployees: response.data.payslips.length,
          totalGrossPay: totalGross,
          totalDeductions: totalDeductions,
          totalNetPay: totalNet,
        });
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payslipId) => {
    try {
      const response = await axios.get(`/payroll/payslips/${payslipId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${moment().format('MM-YYYY')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'info';
      case 'generated':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  // Run Payroll functions
  const handleRunPayroll = () => {
    setRunPayrollOpen(true);
    // Initialize form with current month data
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    setPayrollForm({
      name: `Payroll ${moment().format('MMMM YYYY')}`,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      payPeriodStart: moment(firstDay).format('YYYY-MM-DD'),
      payPeriodEnd: moment(lastDay).format('YYYY-MM-DD'),
      payDate: moment().add(1, 'month').startOf('month').add(4, 'days').format('YYYY-MM-DD') // 5th of next month
    });
  };

  const handlePayrollFormChange = (field, value) => {
    setPayrollForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreviewPayroll = async () => {
    try {
      setPayrollProcessing(true);
      
      console.log('🔍 Fetching employee salary data...', {
        month: payrollForm.month,
        year: payrollForm.year
      });
      
      // Get employee salary data from the salary management system
      const response = await axios.get('/api/payroll/employee-salaries', {
        params: {
          month: payrollForm.month,
          year: payrollForm.year
        }
      });
      
      console.log('📊 Employee salary data received:', response.data);
      
      const { employeeSalaries, totalEmployees, synchronization } = response.data;
      
      // Check if there's no salary data available
      if (employeeSalaries.length === 0) {
        toast.warning('No salary data available. Please import salary data in the Salary Management section first.');
        setPayrollPreview({
          totalEmployees: 0,
          totalGross: 0,
          totalBasic: 0,
          totalHRA: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalNet: 0,
          salaryDetailsCount: 0,
          employeeProfileCount: 0,
          synchronization: synchronization
        });
        return;
      }
      
      // Debug: Log salary data details
      console.log('💰 Salary data breakdown:');
      employeeSalaries.forEach((emp, index) => {
        console.log(`Employee ${index + 1}:`, {
          employeeId: emp.employeeId,
          name: emp.name,
          dataSource: emp.dataSource,
          basicSalary: emp.basicSalary,
          grossSalary: emp.grossSalary,
          hasSalaryData: emp.dataSource === 'salary_details'
        });
      });
      
      // Calculate totals based on actual salary data
      let totalGross = 0;
      let totalBasic = 0;
      let totalHRA = 0;
      let totalAllowances = 0;
      let salaryDetailsCount = 0;
      let employeeProfileCount = 0;
      
      employeeSalaries.forEach(emp => {
        if (emp.dataSource === 'salary_details') {
          salaryDetailsCount++;
          totalGross += emp.grossSalary || 0;
          totalBasic += emp.basicSalary || 0;
          totalHRA += emp.hra || 0;
          totalAllowances += (emp.conveyanceAllowance || 0) + 
                           (emp.medicalAllowance || 0) + 
                           (emp.specialAllowance || 0) + 
                           (emp.performanceBonus || 0) + 
                           (emp.overtimePay || 0) + 
                           (emp.otherAllowances || 0);
        } else {
          employeeProfileCount++;
          totalGross += emp.grossSalary || 0;
          totalBasic += emp.basicSalary || 0;
          totalHRA += emp.hra || 0;
          totalAllowances += emp.allowances || 0;
        }
      });
      
      // Calculate estimated deductions (22% of gross)
      const estimatedDeductions = totalGross * 0.22;
      const estimatedNet = totalGross - estimatedDeductions;
      
      setPayrollPreview({
        totalEmployees,
        estimatedGross: totalGross,
        estimatedDeductions,
        estimatedNet,
        totalBasic,
        totalHRA,
        totalAllowances,
        salaryDetailsCount,
        employeeProfileCount,
        payPeriod: `${moment(payrollForm.payPeriodStart).format('DD MMM')} - ${moment(payrollForm.payPeriodEnd).format('DD MMM YYYY')}`
      });
      
    } catch (error) {
      console.error('Error previewing payroll:', error);
      toast.error('Failed to preview payroll');
    } finally {
      setPayrollProcessing(false);
    }
  };

  const handleProcessPayroll = async () => {
    try {
      setPayrollProcessing(true);
      
      // Create payroll cycle
      const cycleData = {
        name: payrollForm.name,
        month: payrollForm.month,
        year: payrollForm.year,
        payPeriodStart: payrollForm.payPeriodStart,
        payPeriodEnd: payrollForm.payPeriodEnd,
        payDate: payrollForm.payDate
      };
      
      const cycleResponse = await axios.post('/api/payroll/cycles', cycleData);
      const cycleId = cycleResponse.data.cycle._id;
      
      // Process payroll for the cycle
      const processResponse = await axios.post(`/api/payroll/cycles/${cycleId}/process`);
      
      toast.success(`Payroll processed successfully for ${processResponse.data.processedEmployees} employees`);
      setRunPayrollOpen(false);
      fetchPayrollData(); // Refresh the payslips list
      
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast.error('Failed to process payroll');
    } finally {
      setPayrollProcessing(false);
    }
  };

  // Employee details functions
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEmployeeClick = async (employee) => {
    try {
      console.log('👤 Employee clicked:', employee.employeeId, employee.personalInfo?.firstName);
      
      setSelectedEmployee(employee);
      setEmployeeDetailsOpen(true);
      
      // Fetch employee salary data
      console.log('🔍 Fetching salary data for employee:', employee.employeeId);
      const salaryResponse = await axios.get('/api/payroll/employee-salaries', {
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      });
      
      console.log('📊 Salary response received:', salaryResponse.data);
      
      const employeeSalary = salaryResponse.data.employeeSalaries.find(
        emp => emp.employeeId === employee.employeeId
      );
      
      console.log('💰 Employee salary data found:', employeeSalary);
      
      if (!employeeSalary) {
        // No salary data available for this employee
        setEmployeeSalaryData({
          employeeId: employee.employeeId,
          name: `${employee.personalInfo?.firstName || ''} ${employee.personalInfo?.lastName || ''}`.trim(),
          dataSource: 'no_data',
          basicSalary: 0,
          grossSalary: 0,
          totalCTC: 0,
          netSalary: 0
        });
      } else {
        setEmployeeSalaryData(employeeSalary);
      }
      
      // Fetch employee leaves
      const leavesResponse = await axios.get(`/leave/requests`, {
        params: {
          employeeId: employee._id,
          status: 'approved'
        }
      });
      setEmployeeLeaves(leavesResponse.data.leaveRequests || []);
      
      // Fetch employee attendance
      const attendanceResponse = await axios.get(`/attendance`, {
        params: {
          employeeId: employee._id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      });
      setEmployeeAttendance(attendanceResponse.data.attendance || []);
      
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to fetch employee details');
    }
  };

  // Handle delete all data
  const handleDeleteAll = async () => {
    try {
      console.log('🗑️ Starting delete all process...');
      setLoading(true);
      
      console.log('📡 Making API call to delete all...');
      const response = await axios.delete('/api/salary-management/delete-all');
      console.log('✅ Delete all response:', response.data);
      
      // Show detailed success message with breakdown
      const { deletedCount, breakdown } = response.data;
      let message = `Successfully deleted ${deletedCount} total records:\n`;
      
      if (breakdown) {
        if (breakdown.salaryRecords > 0) message += `• ${breakdown.salaryRecords} salary records\n`;
        if (breakdown.payslips > 0) message += `• ${breakdown.payslips} payslips\n`;
        if (breakdown.payrollCycles > 0) message += `• ${breakdown.payrollCycles} payroll cycles\n`;
        if (breakdown.salaryRevisions > 0) message += `• ${breakdown.salaryRevisions} salary revisions\n`;
      }
      
      console.log('📢 Showing success message:', message);
      toast.success(message, { duration: 5000 });
      
      console.log('🔄 Refreshing data...');
      await fetchPayrollData();
      await fetchEmployees();
      
      console.log('✅ Delete all completed successfully');
      setOpenDeleteAllDialog(false);
    } catch (error) {
      console.error('❌ Error deleting all data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to delete all data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Payroll Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(isHR || isAdmin) && (
            <>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleRunPayroll}
                sx={{ mr: 1 }}
              >
                Run Payroll
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  console.log('🗑️ Delete All Data button clicked');
                  setOpenDeleteAllDialog(true);
                }}
                sx={{ 
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': { 
                    borderColor: '#b71c1c',
                    bgcolor: '#ffebee'
                  }
                }}
              >
                Delete All Data
              </Button>
            </>
          )}
          <IconButton onClick={fetchPayrollData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Tabs Navigation */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Salary Calculator" 
            icon={<CalculateIcon />} 
            iconPosition="start"
            disabled={!isHR && !isAdmin}
          />
          <Tab 
            label="Payroll Details" 
            icon={<MoneyIcon />} 
            iconPosition="start"
            disabled={!isHR && !isAdmin}
          />
          <Tab 
            label="Payslips" 
            icon={<ReceiptIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (isHR || isAdmin) && (
        <Box>
          <SalaryCalculator />
        </Box>
      )}

      {activeTab === 1 && (isHR || isAdmin) && (
        <Box>
          {/* Summary Cards for HR/Admin */}
      {(isHR || isAdmin) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {summary.totalEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  ₹{summary.totalGrossPay.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Gross Pay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  ₹{summary.totalDeductions.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  ₹{summary.totalNetPay.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Net Pay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

          {/* Employee List Section */}
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              Employee List ({employees.length} employees) - Click on any employee to view detailed salary and leave information
            </Typography>
            {employeesLoading && <LinearProgress />}
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Date of Joining</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {employee.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.employmentInfo?.department?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.employmentInfo?.designation || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.employmentInfo?.dateOfJoining 
                            ? moment(employee.employmentInfo.dateOfJoining).format('DD/MM/YYYY')
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.employmentInfo?.isActive ? 'Active' : 'Inactive'}
                          color={employee.employmentInfo?.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEmployeeClick(employee)}
                          startIcon={<MoneyIcon />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && !employeesLoading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Quick Actions for Employees */}
      {!isHR && !isAdmin && payslips.length > 0 && (
        <Card sx={{ mt: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPayslip(payslips[0]._id)}
                >
                  Download Latest Payslip
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                  onClick={() => toast.info('Tax documents feature coming soon!')}
                >
                  Tax Documents
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Run Payroll Dialog */}
      <Dialog 
        open={runPayrollOpen} 
        onClose={() => setRunPayrollOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6">Run Payroll</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                This will calculate salary for all active employees based on their monthly salary and approved leaves during the payroll period.
              </Alert>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payroll Name"
                value={payrollForm.name}
                onChange={(e) => handlePayrollFormChange('name', e.target.value)}
                placeholder="e.g., January 2024 Payroll"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={payrollForm.month}
                  onChange={(e) => handlePayrollFormChange('month', e.target.value)}
                  label="Month"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {moment().month(i).format('MMMM')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={payrollForm.year}
                onChange={(e) => handlePayrollFormChange('year', parseInt(e.target.value))}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pay Period Start"
                type="date"
                value={payrollForm.payPeriodStart}
                onChange={(e) => handlePayrollFormChange('payPeriodStart', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pay Period End"
                type="date"
                value={payrollForm.payPeriodEnd}
                onChange={(e) => handlePayrollFormChange('payPeriodEnd', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pay Date"
                type="date"
                value={payrollForm.payDate}
                onChange={(e) => handlePayrollFormChange('payDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Date when employees will receive their salary"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CalculateIcon />}
                  onClick={handlePreviewPayroll}
                  disabled={payrollProcessing}
                >
                  {payrollProcessing ? <CircularProgress size={20} /> : 'Preview'}
                </Button>
              </Box>
            </Grid>
            
            {/* Payroll Preview */}
            {payrollPreview && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payroll Preview - {payrollPreview.payPeriod}
                    </Typography>
                    
                    {/* Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Employees
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {payrollPreview.totalEmployees}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payrollPreview.salaryDetailsCount} from Salary Details, {payrollPreview.employeeProfileCount} from Employee Profile
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Gross Pay
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          ₹{payrollPreview.estimatedGross.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Deductions
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          ₹{payrollPreview.estimatedDeductions.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Net Pay
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          ₹{payrollPreview.estimatedNet.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Salary Breakdown */}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Salary Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Basic Salary
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{payrollPreview.totalBasic.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          HRA
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{payrollPreview.totalHRA.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Allowances
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{payrollPreview.totalAllowances.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Data Source Info */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Data Sources:</strong> {payrollPreview.salaryDetailsCount} employees have detailed salary data from the Salary Management system, 
                        {payrollPreview.employeeProfileCount} employees will use basic salary from their employee profile.
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunPayrollOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessPayroll}
            disabled={payrollProcessing || !payrollForm.name || !payrollForm.payPeriodStart || !payrollForm.payPeriodEnd || !payrollForm.payDate}
            startIcon={payrollProcessing ? <CircularProgress size={20} /> : <PlayIcon />}
          >
            {payrollProcessing ? 'Processing...' : 'Process Payroll'}
          </Button>
        </DialogActions>
      </Dialog>

      {activeTab === 2 && (
        <Box>
          {/* Payslips Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              Payslips
            </Typography>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {(isHR || isAdmin) && <TableCell>Employee</TableCell>}
                    <TableCell>Month/Year</TableCell>
                    <TableCell>Gross Pay</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Pay</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pay Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip._id} hover>
                      {(isHR || isAdmin) && (
                        <TableCell>
                          {payslip.employee?.personalInfo?.firstName} {payslip.employee?.personalInfo?.lastName}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {payslip.employee?.employeeId}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {moment().month(payslip.month - 1).format('MMMM')} {payslip.year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                          ₹{payslip.grossPay.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                          ₹{payslip.totalDeductions.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{payslip.netPay.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payslip.status}
                          color={getStatusColor(payslip.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payslip.payrollCycle?.payDate
                          ? moment(payslip.payrollCycle.payDate).format('DD/MM/YYYY')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDownloadPayslip(payslip._id)}
                          title="Download Payslip"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payslips.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No payslips found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Employee Details Dialog */}
      <Dialog 
        open={employeeDetailsOpen} 
        onClose={() => setEmployeeDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              Employee Details - {selectedEmployee?.personalInfo?.firstName} {selectedEmployee?.personalInfo?.lastName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Employee Basic Info */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employee Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Employee ID
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedEmployee.employeeId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedEmployee.employmentInfo?.department?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Designation
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedEmployee.employmentInfo?.designation || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date of Joining
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedEmployee.employmentInfo?.dateOfJoining 
                            ? moment(selectedEmployee.employmentInfo.dateOfJoining).format('DD/MM/YYYY')
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Salary Details */}
              {employeeSalaryData && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Salary Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Basic Salary
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.basicSalary?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            HRA
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.hra?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Conveyance Allowance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.conveyanceAllowance?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Medical Allowance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.medicalAllowance?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Special Allowance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.specialAllowance?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Performance Bonus
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.performanceBonus?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Overtime Pay
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.overtimePay?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Other Allowances
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            ₹{employeeSalaryData.otherAllowances?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                              Total Gross Salary
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              ₹{employeeSalaryData.grossSalary?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* CTC and Monthly Salary Summary */}
              {employeeSalaryData && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        💰 Salary Summary
                      </Typography>
                      
                      {employeeSalaryData.dataSource === 'no_data' ? (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="body1" fontWeight="600">
                            No salary data available for this employee.
                          </Typography>
                          <Typography variant="body2">
                            Please import salary data in the Salary Management section to view salary details.
                          </Typography>
                        </Alert>
                      ) : (
                        <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 3, 
                            bgcolor: '#ffffff', 
                            borderRadius: 3, 
                            border: '2px solid #1976d2',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500', mb: 1 }}>
                              Cost to Company (CTC)
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                              ₹{employeeSalaryData.totalCTC?.toLocaleString() || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#888888', fontSize: '0.875rem' }}>
                              Annual Package
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 3, 
                            bgcolor: '#ffffff', 
                            borderRadius: 3, 
                            border: '2px solid #2e7d32',
                            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 16px rgba(46, 125, 50, 0.2)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ color: '#666666', fontWeight: '500', mb: 1 }}>
                              Monthly Salary (Withdrawal)
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                              ₹{employeeSalaryData.netSalary?.toLocaleString() || '0'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#888888', fontSize: '0.875rem' }}>
                              Take Home Amount
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Deductions */}
              {employeeSalaryData && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Deductions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Provident Fund
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.providentFund?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            ESI
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.employeeStateInsurance?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Professional Tax
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.professionalTax?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Income Tax
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.incomeTax?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Loan Repayment
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.loanRepayment?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Loss of Pay
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error.main">
                            ₹{employeeSalaryData.deductions?.lopAmount?.toLocaleString() || '0'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Approved Leaves */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Approved Leaves ({employeeLeaves.length})
                    </Typography>
                    {employeeLeaves.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Leave Type</TableCell>
                              <TableCell>Start Date</TableCell>
                              <TableCell>End Date</TableCell>
                              <TableCell>Days</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {employeeLeaves.map((leave, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Chip 
                                    label={leave.leaveType} 
                                    color="primary" 
                                    size="small" 
                                  />
                                </TableCell>
                                <TableCell>
                                  {moment(leave.startDate).format('DD/MM/YYYY')}
                                </TableCell>
                                <TableCell>
                                  {moment(leave.endDate).format('DD/MM/YYYY')}
                                </TableCell>
                                <TableCell>
                                  {leave.totalDays}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={leave.status} 
                                    color="success" 
                                    size="small" 
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No approved leaves found for this period
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Attendance Summary */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attendance Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Days
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {employeeAttendance.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Present Days
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {employeeAttendance.filter(a => a.status === 'present').length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Absent Days
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          {employeeAttendance.filter(a => a.status === 'absent').length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Leave Days
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="info.main">
                          {employeeAttendance.filter(a => a.status === 'leave').length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmployeeDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Data Dialog */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={() => {
          console.log('🚪 Delete dialog closed');
          setOpenDeleteAllDialog(false);
        }}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: '700' }}>
          ⚠️ Delete All Payroll Data
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="600" gutterBottom>
              WARNING: This action cannot be undone!
            </Typography>
            <Typography variant="body2">
              This will permanently delete ALL salary and payroll data from the system. 
              This action is irreversible and will affect all employees' salary data.
            </Typography>
          </Alert>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you absolutely sure you want to delete all payroll data?
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            This will remove:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>All employee salary records</li>
            <li>All payroll cycles</li>
            <li>All payslips</li>
            <li>All salary revision history</li>
            <li>All financial calculations</li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
          <Button
            variant="outlined"
            onClick={() => {
              console.log('❌ Cancel button clicked');
              setOpenDeleteAllDialog(false);
            }}
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              console.log('🔥 Delete All Data button in dialog clicked');
              handleDeleteAll();
            }}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete All Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll;
