import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

const Employees = () => {
  const { isHR, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employees');
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(`/employees/${selectedEmployee._id}`);
      toast.success('Employee deactivated successfully');
      fetchEmployees();
      setDeleteDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to deactivate employee');
    }
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {params.row.personalInfo?.firstName?.charAt(0)}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      width: 120,
      fontWeight: 'bold',
    },
    {
      field: 'name',
      headerName: 'Full Name',
      width: 200,
      valueGetter: (params) =>
        `${params.row.personalInfo?.firstName || ''} ${params.row.personalInfo?.lastName || ''}`,
    },
    {
      field: 'designation',
      headerName: 'Designation',
      width: 180,
      valueGetter: (params) => params.row.employmentInfo?.designation || '',
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      valueGetter: (params) => params.row.employmentInfo?.department?.name || '',
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      valueGetter: (params) => params.row.user?.email || '',
    },
    {
      field: 'joiningDate',
      headerName: 'Joining Date',
      width: 120,
      valueGetter: (params) =>
        params.row.employmentInfo?.dateOfJoining
          ? moment(params.row.employmentInfo.dateOfJoining).format('DD/MM/YYYY')
          : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.employmentInfo?.isActive ? 'Active' : 'Inactive'}
          color={params.row.employmentInfo?.isActive ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const filteredEmployees = employees.filter((employee) =>
    `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName} ${employee.employeeId} ${employee.employmentInfo?.designation}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Employees
        </Typography>
        {(isHR || isAdmin) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => toast.info('Add Employee feature coming soon!')}
          >
            Add Employee
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => toast.info('Filter feature coming soon!')}
        >
          Filter
        </Button>
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => toast.info('View Profile feature coming soon!')}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Profile
        </MenuItem>
        {(isHR || isAdmin) && (
          <MenuItem onClick={() => toast.info('Edit Employee feature coming soon!')}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
        )}
        {(isHR || isAdmin) && (
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Deactivate
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate {selectedEmployee?.personalInfo?.firstName}{' '}
            {selectedEmployee?.personalInfo?.lastName}? This action will make the employee inactive.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEmployee} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
