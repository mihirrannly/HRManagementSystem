import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlaylistAdd as SeedIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const DesignationsModule = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDesignation, setCurrentDesignation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'mid'
  });

  const levelLabels = {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Team Lead',
    'manager': 'Manager',
    'director': 'Director',
    'executive': 'Executive',
    'c-level': 'C-Level'
  };

  const levelColors = {
    'entry': 'default',
    'junior': 'info',
    'mid': 'primary',
    'senior': 'secondary',
    'lead': 'warning',
    'manager': 'success',
    'director': 'error',
    'executive': 'error',
    'c-level': 'error'
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/designations');
      setDesignations(response.data.designations || []);
    } catch (error) {
      console.error('Error fetching designations:', error);
      toast.error('Failed to load designations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (designation = null) => {
    if (designation) {
      setEditMode(true);
      setCurrentDesignation(designation);
      setFormData({
        name: designation.name,
        description: designation.description || '',
        level: designation.level
      });
    } else {
      setEditMode(false);
      setCurrentDesignation(null);
      setFormData({
        name: '',
        description: '',
        level: 'mid'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setCurrentDesignation(null);
    setFormData({
      name: '',
      description: '',
      level: 'mid'
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Designation name is required');
        return;
      }

      if (editMode) {
        await axios.put(`/designations/${currentDesignation._id}`, formData);
        toast.success('Designation updated successfully');
      } else {
        await axios.post('/designations', formData);
        toast.success('Designation created successfully');
      }

      handleCloseDialog();
      fetchDesignations();
    } catch (error) {
      console.error('Error saving designation:', error);
      toast.error(error.response?.data?.message || 'Failed to save designation');
    }
  };

  const handleDelete = async (designation) => {
    if (!window.confirm(`Are you sure you want to delete "${designation.name}"?`)) {
      return;
    }

    try {
      await axios.delete(`/designations/${designation._id}`);
      toast.success('Designation deleted successfully');
      fetchDesignations();
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete designation');
    }
  };

  const handleSeedDesignations = async () => {
    if (!window.confirm('This will add default designations. Continue?')) {
      return;
    }

    try {
      const response = await axios.post('/designations/seed');
      toast.success(response.data.message);
      fetchDesignations();
    } catch (error) {
      console.error('Error seeding designations:', error);
      toast.error('Failed to seed designations');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Designation Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage designations that will be used across the system
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDesignations} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {designations.length === 0 && (
            <Tooltip title="Add Default Designations">
              <Button
                variant="outlined"
                startIcon={<SeedIcon />}
                onClick={handleSeedDesignations}
              >
                Seed Defaults
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Designation
          </Button>
        </Stack>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Designations created here will automatically appear in employee forms throughout the system.
        You cannot delete a designation that is currently assigned to employees.
      </Alert>

      {/* Designations Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Designation Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Level</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {designations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No designations found. Click "Add Designation" to create one or "Seed Defaults" to add common designations.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              designations.map((designation) => (
                <TableRow key={designation._id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">
                      {designation.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {designation.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={levelLabels[designation.level]}
                      color={levelColors[designation.level]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={designation.isActive ? 'Active' : 'Inactive'}
                      color={designation.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(designation)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(designation)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Designation' : 'Add New Designation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Designation Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="e.g., Software Engineer, HR Manager"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Brief description of the role"
            />
            
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                label="Level"
              >
                {Object.entries(levelLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignationsModule;

