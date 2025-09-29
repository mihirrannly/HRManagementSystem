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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

const Permissions = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  
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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchModules(),
        fetchRoles(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/permissions/modules');
      setModules(response.data.modules);
      setActions(response.data.actions);
      setModuleDetails(response.data.moduleDetails);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/permissions/roles');
      setRoles(response.data.roles);
      setAvailableRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/permissions/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
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
      const roleData = {
        displayName: roleForm.displayName,
        description: roleForm.description,
        permissions: roleForm.permissions
      };

      if (editingRole) {
        await axios.put(`/permissions/roles/${editingRole._id}`, roleData);
        toast.success('Role updated successfully');
      } else {
        roleData.name = roleForm.name;
        await axios.post('/permissions/roles', roleData);
        toast.success('Role created successfully');
      }

      setRoleDialog(false);
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`/permissions/roles/${roleId}`);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error(error.response?.data?.message || 'Failed to delete role');
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
      toast.success('Role assigned successfully');
      setUserRoleDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    if (window.confirm('Are you sure you want to remove this role?')) {
      try {
        await axios.delete(`/permissions/users/${userId}/roles/${roleId}`);
        toast.success('Role removed successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error removing role:', error);
        toast.error(error.response?.data?.message || 'Failed to remove role');
      }
    }
  };

  const getModuleDisplayName = (module) => {
    const moduleDetail = moduleDetails.find(m => m.module === module);
    return moduleDetail ? moduleDetail.name : module;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Permission Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles, permissions, and user access controls
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
            {roles.map((role) => (
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
                        <Tooltip title="Edit Role">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditRole(role)}
                            disabled={role.isSystemRole}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Role">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteRole(role._id)}
                            disabled={role.isSystemRole}
                          >
                            <DeleteIcon />
                          </IconButton>
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
            ))}
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
                      <Tooltip title="Assign Role">
                        <IconButton size="small" onClick={() => handleAssignRole(user)}>
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
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

export default Permissions;
