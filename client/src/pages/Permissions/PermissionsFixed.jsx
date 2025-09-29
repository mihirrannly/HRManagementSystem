import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PermissionsFixed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Roles state
  const [roles, setRoles] = useState([]);
  const [roleDialog, setRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userRoleDialog, setUserRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Permissions state
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [moduleDetails, setModuleDetails] = useState([]);

  useEffect(() => {
    if (user && !isInitializing) {
      fetchInitialData();
    }
  }, [user]); // Only re-run when user changes

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const fetchInitialData = async () => {
    if (isInitializing) return; // Prevent multiple simultaneous calls
    
    try {
      setIsInitializing(true);
      setLoading(true);
      setError(null);
      
      console.log('Fetching initial data...');
      console.log('Current user:', user);
      console.log('Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Check if user is properly authenticated
      if (!user) {
        showError('User not authenticated. Please log in again.');
        return;
      }
      
      if (!user.role || !['admin', 'hr'].includes(user.role)) {
        showError('Access denied. You need admin or HR privileges to access this page.');
        return;
      }
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        showError('No authentication token found. Please log in again.');
        return;
      }
      
      await Promise.all([
        fetchModules(),
        fetchRoles(),
        fetchUsers()
      ]);
      
      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        showError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        showError('Access denied. You need admin or HR privileges.');
      } else {
        showError('Failed to load permission data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  };

  const fetchModules = async () => {
    try {
      console.log('Fetching modules...');
      const response = await axios.get('/permissions/modules');
      console.log('Modules response:', response.data);
      
      setModules(response.data.modules || []);
      setActions(response.data.actions || []);
      setModuleDetails(response.data.moduleDetails || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  };

  const fetchRoles = async () => {
    try {
      console.log('Fetching roles...');
      const response = await axios.get('/permissions/roles');
      console.log('Roles response:', response.data);
      
      setRoles(response.data.roles || []);
      setAvailableRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await axios.get('/permissions/users');
      console.log('Users response:', response.data);
      
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    });
    setRoleDialog(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setRoleDialog(true);
  };

  const handleSaveRole = async () => {
    try {
      console.log('Saving role...', { editingRole, roleForm });
      
      const roleData = {
        displayName: roleForm.displayName,
        description: roleForm.description,
        permissions: roleForm.permissions
      };

      if (editingRole) {
        console.log('Updating role:', editingRole._id, roleData);
        const response = await axios.put(`/permissions/roles/${editingRole._id}`, roleData);
        console.log('Update response:', response.data);
        showSuccess('Role updated successfully');
      } else {
        roleData.name = roleForm.name;
        console.log('Creating role:', roleData);
        const response = await axios.post('/permissions/roles', roleData);
        console.log('Create response:', response.data);
        showSuccess('Role created successfully');
      }

      setRoleDialog(false);
      await fetchRoles(); // Wait for roles to be fetched
    } catch (error) {
      console.error('Error saving role:', error);
      console.error('Error response:', error.response?.data);
      showError(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    console.log('Attempting to delete role:', roleId);
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        console.log('Deleting role:', roleId);
        const response = await axios.delete(`/permissions/roles/${roleId}`);
        console.log('Delete response:', response.data);
        showSuccess('Role deleted successfully');
        await fetchRoles(); // Wait for roles to be fetched
      } catch (error) {
        console.error('Error deleting role:', error);
        console.error('Error response:', error.response?.data);
        showError(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const handlePermissionChange = (module, action, checked) => {
    const newPermissions = [...roleForm.permissions];
    const moduleIndex = newPermissions.findIndex(p => p.module === module);

    if (moduleIndex >= 0) {
      if (checked) {
        if (!newPermissions[moduleIndex].actions.includes(action)) {
          newPermissions[moduleIndex].actions.push(action);
        }
      } else {
        newPermissions[moduleIndex].actions = newPermissions[moduleIndex].actions.filter(a => a !== action);
        if (newPermissions[moduleIndex].actions.length === 0) {
          newPermissions.splice(moduleIndex, 1);
        }
      }
    } else if (checked) {
      newPermissions.push({ module, actions: [action] });
    }

    setRoleForm({ ...roleForm, permissions: newPermissions });
  };

  const isPermissionChecked = (module, action) => {
    const modulePermission = roleForm.permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setUserRoleDialog(true);
  };

  const handleRoleAssignment = async (roleId) => {
    try {
      await axios.post(`/permissions/users/${selectedUser._id}/roles`, { roleId });
      showSuccess('Role assigned successfully');
      setUserRoleDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      showError(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    if (window.confirm('Are you sure you want to remove this role?')) {
      try {
        await axios.delete(`/permissions/users/${userId}/roles/${roleId}`);
        showSuccess('Role removed successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error removing role:', error);
        showError(error.response?.data?.message || 'Failed to remove role');
      }
    }
  };

  const getModuleDisplayName = (module) => {
    const moduleDetail = moduleDetails.find(m => m.module === module);
    return moduleDetail ? moduleDetail.name : module;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading permissions...</Typography>
      </Box>
    );
  }

  // Show authentication error with login option
  if (error && (error.includes('not authenticated') || error.includes('No authentication token'))) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Authentication Required
        </Typography>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mr: 2 }}
        >
          Go to Login
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Success/Error Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Permission Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles, permissions, and user access controls
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Logged in as: {user?.email || 'Unknown'} ({user?.role || 'No role'})
          </Typography>
        </Box>
        <IconButton onClick={fetchInitialData}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Navigation Tabs */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<SecurityIcon />} label="Roles & Permissions" />
        <Tab icon={<GroupIcon />} label="User Management" />
      </Tabs>

      {/* Roles & Permissions Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Roles & Permissions</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRole}
            >
              Create Role
            </Button>
          </Box>

          <Grid container spacing={3}>
            {roles.map((role) => {
              console.log('Rendering role:', role.name, 'isSystemRole:', role.isSystemRole);
              return (
              <Grid item xs={12} md={6} lg={4} key={role._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {role.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {role.description}
                        </Typography>
                        {role.isSystemRole && (
                          <Chip label="System Role" size="small" color="primary" />
                        )}
                      </Box>
                      <Box>
                        <Tooltip title={role.isSystemRole ? "System roles cannot be edited" : "Edit Role"}>
                          <span>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditRole(role)}
                              disabled={role.isSystemRole}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={role.isSystemRole ? "System roles cannot be deleted" : "Delete Role"}>
                          <span>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteRole(role._id)}
                              disabled={role.isSystemRole}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions ({role.permissions?.length || 0} modules):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.permissions?.slice(0, 3).map((perm) => (
                        <Chip
                          key={perm.module}
                          label={getModuleDisplayName(perm.module)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {role.permissions?.length > 3 && (
                        <Chip
                          label={`+${role.permissions.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* User Management Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            User Role Assignments
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Current Roles</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.employee?.name || 'No Employee Profile'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.employee?.employeeId || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip label={user.role} size="small" color="primary" />
                        {user.assignedRoles?.map((roleAssignment) => (
                          <Chip
                            key={roleAssignment._id}
                            label={roleAssignment.role.displayName}
                            size="small"
                            variant="outlined"
                            onDelete={() => handleRemoveRole(user._id, roleAssignment.role._id)}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? moment(user.lastLogin).format('DD/MM/YYYY HH:mm') : 'Never'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleAssignRole(user)}>
                        <AssignmentIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Role Creation/Edit Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role Name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                disabled={!!editingRole}
                helperText="Unique identifier for the role"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={roleForm.displayName}
                onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      {actions.map((action) => (
                        <TableCell key={action} align="center">
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {getModuleDisplayName(module)}
                          </Typography>
                        </TableCell>
                        {actions.map((action) => (
                          <TableCell key={action} align="center">
                            <Checkbox
                              checked={isPermissionChecked(module, action)}
                              onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Role Assignment Dialog */}
      <Dialog open={userRoleDialog} onClose={() => setUserRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to {selectedUser?.employee?.name || selectedUser?.email}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select a role to assign to this user:
          </Typography>
          <Box sx={{ mt: 2 }}>
            {availableRoles.map((role) => (
              <Card key={role._id} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => handleRoleAssignment(role._id)}>
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {role.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionsFixed;
