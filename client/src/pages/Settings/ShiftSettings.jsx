import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Alert,
  Autocomplete,
  Avatar,
  LinearProgress,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  AccessTime as TimeIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const ShiftSettings = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  
  // Form states
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    code: '',
    description: '',
    startTime: '09:00',
    endTime: '17:30',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    breaks: [{
      name: 'Lunch Break',
      startTime: '13:00',
      endTime: '14:00',
      duration: 60,
      isPaid: false,
      isFlexible: true
    }],
    flexibility: {
      allowEarlyCheckIn: false,
      earlyCheckInBuffer: 0,
      allowLateCheckIn: true,
      lateCheckInBuffer: 15,
      allowEarlyCheckOut: false,
      earlyCheckOutBuffer: 0,
      allowLateCheckOut: true,
      lateCheckOutBuffer: 60,
      flexibleBreaks: true
    },
    overtime: {
      enabled: true,
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
      requiresApproval: true
    },
    location: {
      type: 'office',
      address: '',
      radius: 100
    },
    isActive: true,
    isDefault: false,
    color: '#1976d2'
  });
  
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    shiftId: '',
    effectiveFrom: moment().format('YYYY-MM-DD'),
    effectiveTo: '',
    reason: 'initial_assignment',
    notes: ''
  });
  
  const [bulkAssignForm, setBulkAssignForm] = useState({
    employeeIds: [],
    shiftId: '',
    effectiveFrom: moment().format('YYYY-MM-DD'),
    reason: 'initial_assignment',
    notes: ''
  });

  const [newEmployeeForm, setNewEmployeeForm] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    
    // Employment Information
    department: '',
    designation: '',
    employeeType: 'full-time',
    dateOfJoining: moment().format('YYYY-MM-DD'),
    reportingManager: '',
    
    // Salary Information
    basicSalary: '',
    currency: 'INR',
    
    // Shift Assignment
    shiftId: '',
    workLocation: 'remote',
    
    // Login Credentials
    password: '',
    role: 'employee'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, employeesRes, assignmentsRes] = await Promise.all([
        axios.get('/shifts'),
        axios.get('/organization/employees?limit=500'), // Get all employees
        axios.get('/shifts/assignments/all')
      ]);
      
      setShifts(shiftsRes.data.shifts || []);
      console.log('🔍 Employees Response:', employeesRes.data);
      console.log('👥 Employees Count:', employeesRes.data.employees?.length || 0);
      setEmployees(employeesRes.data.employees || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch shift data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = () => {
    setEditingShift(null);
    setShiftForm({
      name: '',
      code: '',
      description: '',
      startTime: '09:00',
      endTime: '17:30',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      breaks: [{
        name: 'Lunch Break',
        startTime: '13:00',
        endTime: '14:00',
        duration: 60,
        isPaid: false,
        isFlexible: true
      }],
      flexibility: {
        allowEarlyCheckIn: false,
        earlyCheckInBuffer: 0,
        allowLateCheckIn: true,
        lateCheckInBuffer: 15,
        allowEarlyCheckOut: false,
        earlyCheckOutBuffer: 0,
        allowLateCheckOut: true,
        lateCheckOutBuffer: 60,
        flexibleBreaks: true
      },
      overtime: {
        enabled: true,
        dailyThreshold: 8,
        weeklyThreshold: 40,
        multiplier: 1.5,
        requiresApproval: true
      },
      location: {
        type: 'office',
        address: '',
        radius: 100
      },
      isActive: true,
      isDefault: false,
      color: '#1976d2'
    });
    setShiftDialogOpen(true);
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      ...shift,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breaks: shift.breaks || [{
        name: 'Lunch Break',
        startTime: '13:00',
        endTime: '14:00',
        duration: 60,
        isPaid: false,
        isFlexible: true
      }]
    });
    setShiftDialogOpen(true);
  };

  const handleSaveShift = async () => {
    try {
      const shiftData = {
        ...shiftForm
      };

      if (editingShift) {
        await axios.put(`/shifts/${editingShift._id}`, shiftData);
        toast.success('Shift updated successfully');
      } else {
        await axios.post('/shifts', shiftData);
        toast.success('Shift created successfully');
      }
      
      setShiftDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving shift:', error);
      toast.error(error.response?.data?.message || 'Failed to save shift');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    
    try {
      await axios.delete(`/shifts/${shiftId}`);
      toast.success('Shift deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error(error.response?.data?.message || 'Failed to delete shift');
    }
  };

  const handleAssignShift = async () => {
    try {
      const assignData = {
        ...assignForm,
        effectiveFrom: new Date(assignForm.effectiveFrom).toISOString(),
        effectiveTo: assignForm.effectiveTo ? new Date(assignForm.effectiveTo).toISOString() : null
      };

      await axios.post('/shifts/assign', assignData);
      toast.success('Shift assigned successfully');
      setAssignDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error assigning shift:', error);
      toast.error(error.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleBulkAssign = async () => {
    try {
      const bulkData = {
        ...bulkAssignForm,
        effectiveFrom: new Date(bulkAssignForm.effectiveFrom).toISOString()
      };

      await axios.post('/shifts/bulk-assign', bulkData);
      toast.success('Shifts assigned successfully');
      setBulkAssignDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error bulk assigning shifts:', error);
      toast.error(error.response?.data?.message || 'Failed to bulk assign shifts');
    }
  };

  const handleAddEmployeeToFlexibleShift = () => {
    // Pre-select a flexible shift
    const flexibleShift = shifts.find(s => 
      s.name.toLowerCase().includes('flexible') || 
      s.name.toLowerCase().includes('remote') ||
      s.location.type === 'remote' ||
      s.location.type === 'hybrid'
    );
    
    setNewEmployeeForm({
      ...newEmployeeForm,
      shiftId: flexibleShift?._id || '',
      workLocation: flexibleShift?.location.type || 'remote',
      employeeType: flexibleShift?.location.type === 'hybrid' ? 'part-time' : 'full-time'
    });
    setAddEmployeeDialogOpen(true);
  };

  const handleCreateEmployeeWithShift = async () => {
    try {
      // Create employee first
      const employeeData = {
        personalInfo: {
          firstName: newEmployeeForm.firstName,
          lastName: newEmployeeForm.lastName,
          email: newEmployeeForm.email,
          phone: newEmployeeForm.phone,
          dateOfBirth: newEmployeeForm.dateOfBirth || null,
          gender: newEmployeeForm.gender || null
        },
        contactInfo: {
          personalEmail: newEmployeeForm.email,
          phone: newEmployeeForm.phone,
          address: {
            street: newEmployeeForm.address,
            city: newEmployeeForm.city,
            state: newEmployeeForm.state,
            country: newEmployeeForm.country,
            pincode: newEmployeeForm.pincode
          }
        },
        employmentInfo: {
          department: newEmployeeForm.department,
          designation: newEmployeeForm.designation,
          employeeType: newEmployeeForm.employeeType,
          workLocation: newEmployeeForm.workLocation,
          dateOfJoining: new Date(newEmployeeForm.dateOfJoining),
          reportingManager: newEmployeeForm.reportingManager || null,
          isActive: true
        },
        salaryInfo: {
          currentSalary: {
            basic: parseFloat(newEmployeeForm.basicSalary) || 0,
            grossSalary: parseFloat(newEmployeeForm.basicSalary) || 0,
            ctc: parseFloat(newEmployeeForm.basicSalary) || 0
          },
          currency: newEmployeeForm.currency
        },
        // Login credentials
        email: newEmployeeForm.email,
        password: newEmployeeForm.password,
        role: newEmployeeForm.role
      };

      console.log('Creating employee with data:', employeeData);
      const employeeResponse = await axios.post('/employees', employeeData);
      const newEmployee = employeeResponse.data.employee;
      
      toast.success('Employee created successfully');

      // Assign shift to the new employee
      if (newEmployeeForm.shiftId) {
        const assignData = {
          employeeId: newEmployee._id,
          shiftId: newEmployeeForm.shiftId,
          effectiveFrom: new Date(newEmployeeForm.dateOfJoining).toISOString(),
          reason: 'initial_assignment',
          notes: 'Assigned during employee creation for flexible shift'
        };

        await axios.post('/shifts/assign', assignData);
        toast.success('Flexible shift assigned successfully');
      }

      setAddEmployeeDialogOpen(false);
      
      // Reset form
      setNewEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        department: '',
        designation: '',
        employeeType: 'full-time',
        dateOfJoining: moment().format('YYYY-MM-DD'),
        reportingManager: '',
        basicSalary: '',
        currency: 'INR',
        shiftId: '',
        workLocation: 'remote',
        password: '',
        role: 'employee'
      });
      
      fetchData();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  };

  const getShiftColor = (shift) => shift.color || '#1976d2';

  const calculateShiftHours = (startTime, endTime, breaks = []) => {
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    
    let totalMinutes = end.diff(start, 'minutes');
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
    
    const breakMinutes = breaks.reduce((total, brk) => {
      return total + (brk.isPaid ? 0 : brk.duration);
    }, 0);
    
    return Math.round(((totalMinutes - breakMinutes) / 60) * 100) / 100;
  };

  const renderShiftsTab = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Shift Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateShift}
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Create New Shift
        </Button>
      </Box>

      {/* Shifts Grid */}
      <Grid container spacing={3}>
        {shifts.map((shift) => (
          <Grid item xs={12} md={6} lg={4} key={shift._id}>
            <Card sx={{ 
              borderRadius: 3,
              border: `2px solid ${getShiftColor(shift)}20`,
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
              }
            }}>
              {/* Color indicator */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${getShiftColor(shift)}, ${getShiftColor(shift)}80)`
              }} />
              
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: getShiftColor(shift) }}>
                      {shift.name}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      bgcolor: `${getShiftColor(shift)}15`,
                      color: getShiftColor(shift),
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600
                    }}>
                      {shift.code}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditShift(shift)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteShift(shift._id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Timing */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {shift.startTime} - {shift.endTime}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {calculateShiftHours(shift.startTime, shift.endTime, shift.breaks)} hours/day
                  </Typography>
                </Box>

                {/* Working Days */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                    Working Days:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {shift.workingDays.map((day) => (
                      <Chip
                        key={day}
                        label={day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: `${getShiftColor(shift)}15`,
                          color: getShiftColor(shift)
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {shift.isDefault && (
                      <Chip label="Default" size="small" color="primary" />
                    )}
                    <Chip 
                      label={shift.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={shift.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {assignments.filter(a => a.shift._id === shift._id && a.isActive).length} employees
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAssignmentsTab = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Shift Assignments
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setAssignDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Assign Individual
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddEmployeeToFlexibleShift}
            sx={{ 
              textTransform: 'none',
              borderColor: '#f57c00',
              color: '#f57c00',
              '&:hover': {
                borderColor: '#e65100',
                backgroundColor: '#f57c0010'
              }
            }}
          >
            Add Employee to Flexible Shift
          </Button>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => setBulkAssignDialogOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              textTransform: 'none'
            }}
          >
            Bulk Assign
          </Button>
        </Box>
      </Box>

      {/* Assignments Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Shift</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Timing</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Effective From</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>
                      {assignment.employee?.personalInfo?.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {assignment.employee?.personalInfo?.firstName} {assignment.employee?.personalInfo?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {assignment.employee?.employeeId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: assignment.shift?.color || '#1976d2'
                    }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {assignment.shift?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {assignment.shift?.code}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {assignment.shift?.startTime} - {assignment.shift?.endTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {moment(assignment.effectiveFrom).format('MMM DD, YYYY')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={assignment.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={assignment.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading shift settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ScheduleIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Shift Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage employee work schedules and shift timings
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label="Shifts" 
            icon={<ScheduleIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            label="Assignments" 
            icon={<AssignmentIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && renderShiftsTab()}
      {tabValue === 1 && renderAssignmentsTab()}

      {/* Shift Dialog */}
      <Dialog
        open={shiftDialogOpen}
        onClose={() => setShiftDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          fontWeight: 600
        }}>
          {editingShift ? 'Edit Shift' : 'Create New Shift'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shift Name"
                value={shiftForm.name}
                onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shift Code"
                value={shiftForm.code}
                onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value.toUpperCase() })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={shiftForm.description}
                onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>

            {/* Timing */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, fontSize: '1rem' }}>
                Shift Timing
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Working Days */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Working Days</InputLabel>
                <Select
                  multiple
                  value={shiftForm.workingDays}
                  onChange={(e) => setShiftForm({ ...shiftForm, workingDays: e.target.value })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.charAt(0).toUpperCase() + value.slice(1)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <MenuItem key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shiftForm.isActive}
                    onChange={(e) => setShiftForm({ ...shiftForm, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shiftForm.isDefault}
                    onChange={(e) => setShiftForm({ ...shiftForm, isDefault: e.target.checked })}
                  />
                }
                label="Default Shift"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShiftDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveShift} 
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              textTransform: 'none'
            }}
          >
            {editingShift ? 'Update' : 'Create'} Shift
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Shift to Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => `${option.personalInfo?.firstName} ${option.personalInfo?.lastName} (${option.employeeId})`}
                value={employees.find(emp => emp._id === assignForm.employeeId) || null}
                onChange={(e, newValue) => setAssignForm({ ...assignForm, employeeId: newValue?._id || '' })}
                renderInput={(params) => <TextField {...params} label={`Employee (${employees.length} available)`} required />}
                noOptionsText={employees.length === 0 ? "Loading employees..." : "No employees found"}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={assignForm.shiftId}
                  onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                  required
                >
                  {shifts.filter(s => s.isActive).map((shift) => (
                    <MenuItem key={shift._id} value={shift._id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Effective From"
                type="date"
                value={assignForm.effectiveFrom}
                onChange={(e) => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignShift} variant="contained">
            Assign Shift
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Assign Shift</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => `${option.personalInfo?.firstName} ${option.personalInfo?.lastName} (${option.employeeId})`}
                value={employees.filter(emp => bulkAssignForm.employeeIds.includes(emp._id))}
                onChange={(e, newValue) => setBulkAssignForm({ 
                  ...bulkAssignForm, 
                  employeeIds: newValue.map(emp => emp._id) 
                })}
                renderInput={(params) => <TextField {...params} label={`Select Employees (${employees.length} available)`} />}
                noOptionsText={employees.length === 0 ? "Loading employees..." : "No employees found"}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={bulkAssignForm.shiftId}
                  onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, shiftId: e.target.value })}
                  required
                >
                  {shifts.filter(s => s.isActive).map((shift) => (
                    <MenuItem key={shift._id} value={shift._id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Effective From"
                type="date"
                value={bulkAssignForm.effectiveFrom}
                onChange={(e) => setBulkAssignForm({ ...bulkAssignForm, effectiveFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkAssign} variant="contained">
            Assign to All
          </Button>
          </DialogActions>
        </Dialog>

        {/* Add Employee to Flexible Shift Dialog */}
        <Dialog
          open={addEmployeeDialogOpen}
          onClose={() => setAddEmployeeDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #f57c00, #ff9800)',
            color: 'white',
            fontWeight: 600
          }}>
            Add Employee to Flexible Shift
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newEmployeeForm.firstName}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, firstName: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newEmployeeForm.lastName}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, lastName: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newEmployeeForm.email}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newEmployeeForm.phone}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={newEmployeeForm.dateOfBirth}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={newEmployeeForm.gender}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, gender: e.target.value })}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Address Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={newEmployeeForm.address}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={newEmployeeForm.city}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, city: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={newEmployeeForm.state}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, state: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={newEmployeeForm.pincode}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, pincode: e.target.value })}
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Employment Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={newEmployeeForm.department}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={newEmployeeForm.designation}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, designation: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee Type</InputLabel>
                  <Select
                    value={newEmployeeForm.employeeType}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, employeeType: e.target.value })}
                  >
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="intern">Intern</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Joining"
                  type="date"
                  value={newEmployeeForm.dateOfJoining}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, dateOfJoining: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => `${option.personalInfo?.firstName} ${option.personalInfo?.lastName} (${option.employeeId})`}
                  value={employees.find(emp => emp._id === newEmployeeForm.reportingManager) || null}
                  onChange={(e, newValue) => setNewEmployeeForm({ ...newEmployeeForm, reportingManager: newValue?._id || '' })}
                  renderInput={(params) => <TextField {...params} label="Reporting Manager" />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Location</InputLabel>
                  <Select
                    value={newEmployeeForm.workLocation}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, workLocation: e.target.value })}
                  >
                    <MenuItem value="office">Office</MenuItem>
                    <MenuItem value="remote">Remote</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Salary Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Salary Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Basic Salary"
                  type="number"
                  value={newEmployeeForm.basicSalary}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, basicSalary: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={newEmployeeForm.currency}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, currency: e.target.value })}
                  >
                    <MenuItem value="INR">INR (₹)</MenuItem>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Flexible Shift Assignment */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Flexible Shift Assignment
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Flexible Shift</InputLabel>
                  <Select
                    value={newEmployeeForm.shiftId}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, shiftId: e.target.value })}
                    required
                  >
                    {shifts.filter(s => 
                      s.isActive && (
                        s.name.toLowerCase().includes('flexible') || 
                        s.name.toLowerCase().includes('remote') ||
                        s.location.type === 'remote' ||
                        s.location.type === 'hybrid'
                      )
                    ).map((shift) => (
                      <MenuItem key={shift._id} value={shift._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: shift.color
                          }} />
                          {shift.name} ({shift.startTime} - {shift.endTime}) - {shift.location.type.toUpperCase()}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Login Credentials */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#f57c00', fontSize: '1rem' }}>
                  Login Credentials
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={newEmployeeForm.password}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, password: e.target.value })}
                  required
                  helperText="Minimum 6 characters"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newEmployeeForm.role}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, role: e.target.value })}
                  >
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="hr">HR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setAddEmployeeDialogOpen(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEmployeeWithShift} 
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                textTransform: 'none'
              }}
            >
              Create Employee & Assign Flexible Shift
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default ShiftSettings;