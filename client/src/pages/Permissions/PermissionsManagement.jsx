import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
  alpha,
  Switch
} from '@mui/material';
import {
  Security as SecurityIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const PermissionsManagement = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customPermissions, setCustomPermissions] = useState({});
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: {}
  });

  // Module display names
  const moduleDisplayNames = {
    dashboard: 'Dashboard',
    employees: 'Employee Management',
    attendance: 'Attendance',
    leave: 'Leave Management',
    payroll: 'Payroll',
    performance: 'Performance Management',
    recruitment: 'Recruitment',
    reports: 'Reports',
    organization: 'Organization',
    onboarding: 'Onboarding',
    exit_management: 'Exit Management',
    assets: 'Asset Management',
    settings: 'Settings',
    permissions: 'Permissions Management'
  };

  // Action display names
  const actionDisplayNames = {
    read: 'View',
    create: 'Create',
    update: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    export: 'Export',
    import: 'Import'
  };

  // Action colors
  const actionColors = {
    read: '#2196f3',
    create: '#4caf50',
    update: '#ff9800',
    delete: '#f44336',
    approve: '#9c27b0',
    export: '#00bcd4',
    import: '#795548'
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, modulesRes] = await Promise.all([
        axios.get('/permissions/users', {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: searchTerm
          }
        }),
        axios.get('/permissions/roles'),
        axios.get('/permissions/modules')
      ]);

      setUsers(usersRes.data.users || []);
      setTotalUsers(usersRes.data.pagination?.total || 0);
      setRoles(rolesRes.data.roles || []);
      setModules(modulesRes.data.modules || []);
      setActions(modulesRes.data.actions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = async (user) => {
    setSelectedUser(user);

    // Get user's effective permissions AND assigned roles
    try {
      const response = await axios.get(`/permissions/user-permissions/${user._id}`);
      
      const effectivePerms = response.data.effectivePermissions || [];
      const assignedRoles = response.data.roles || [];
      
      // Set the selected roles based on what the user actually has
      const roleIds = assignedRoles.map(r => r._id);
      setSelectedRoles(roleIds);
      
      // Convert permissions to object format for easy lookup
      const permsObj = {};
      effectivePerms.forEach(perm => {
        permsObj[perm.module] = perm.actions || [];
      });
      setCustomPermissions(permsObj);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setCustomPermissions({});
      // Fallback: try to get role IDs from user object
      const roleIds = user.assignedRoles?.map(r => r.role?._id).filter(Boolean) || [];
      setSelectedRoles(roleIds);
    }

    setEditDialog(true);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handlePermissionToggle = (module, action) => {
    setCustomPermissions(prev => {
      const modulePerms = prev[module] || [];
      let newModulePerms;
      
      if (modulePerms.includes(action)) {
        newModulePerms = modulePerms.filter(a => a !== action);
      } else {
        newModulePerms = [...modulePerms, action];
      }

      return {
        ...prev,
        [module]: newModulePerms
      };
    });
  };

  const handleSelectAllActions = (module, checked) => {
    setCustomPermissions(prev => ({
      ...prev,
      [module]: checked ? [...actions] : []
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setLoading(true);

      // First, remove all existing role assignments
      const existingRoles = selectedUser.assignedRoles || [];
      for (const roleAssignment of existingRoles) {
        if (roleAssignment.role?._id) {
          await axios.delete(`/permissions/users/${selectedUser._id}/roles/${roleAssignment.role._id}`);
        }
      }

      // Assign new roles
      for (const roleId of selectedRoles) {
        await axios.post(`/permissions/users/${selectedUser._id}/roles`, { roleId });
      }

      toast.success('Permissions updated successfully');
      setEditDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!newRole.name || !newRole.displayName) {
        toast.error('Please provide role name and display name');
        return;
      }

      // Convert permissions object to array format
      const permissions = Object.keys(newRole.permissions)
        .filter(module => newRole.permissions[module].length > 0)
        .map(module => ({
          module,
          actions: newRole.permissions[module]
        }));

      await axios.post('/permissions/roles', {
        name: newRole.name,
        displayName: newRole.displayName,
        description: newRole.description,
        permissions
      });

      toast.success('Role created successfully');
      setRoleDialogOpen(false);
      setNewRole({
        name: '',
        displayName: '',
        description: '',
        permissions: {}
      });
      fetchData();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.response?.data?.message || 'Failed to create role');
    }
  };

  const getUserPermissionSummary = (user) => {
    const roleNames = user.assignedRoles?.map(r => r.role?.displayName).filter(Boolean) || [];
    if (roleNames.length === 0) return 'No roles assigned';
    return roleNames.join(', ');
  };

  const getPermissionCount = (user) => {
    const allModules = new Set();
    user.assignedRoles?.forEach(roleAssignment => {
      const role = roles.find(r => r._id === roleAssignment.role?._id);
      if (role) {
        role.permissions?.forEach(perm => {
          allModules.add(perm.module);
        });
      }
    });
    return allModules.size;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Permissions Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user roles and permissions across all modules
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setRoleDialogOpen(true)}
            >
              Create Role
            </Button>
            <IconButton onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha('#2196f3', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="700">{totalUsers}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Users</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha('#4caf50', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <GroupIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="700">{roles.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Roles</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: alpha('#ff9800', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SecurityIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="700">{modules.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Modules</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search users by email or employee ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {/* Users Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><Typography fontWeight="600">Employee</Typography></TableCell>
                <TableCell><Typography fontWeight="600">Email</Typography></TableCell>
                <TableCell><Typography fontWeight="600">System Role</Typography></TableCell>
                <TableCell><Typography fontWeight="600">Assigned Roles</Typography></TableCell>
                <TableCell><Typography fontWeight="600">Modules Access</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="600">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {user.employee?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.employee?.employeeId || 'No ID'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role?.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: user.role === 'admin' ? alpha('#f44336', 0.1) :
                                   user.role === 'hr' ? alpha('#2196f3', 0.1) :
                                   alpha('#757575', 0.1),
                          color: user.role === 'admin' ? '#f44336' :
                                 user.role === 'hr' ? '#2196f3' :
                                 '#757575',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.assignedRoles?.length > 0 ? (
                          user.assignedRoles.map((roleAssignment, idx) => (
                            <Chip
                              key={idx}
                              label={roleAssignment.role?.displayName || 'Unknown'}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No roles
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${getPermissionCount(user)} modules`}
                        size="small"
                        sx={{
                          bgcolor: alpha('#4caf50', 0.1),
                          color: '#4caf50',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Permissions">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPermissions(user)}
                          sx={{ color: '#2196f3' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Edit Permissions Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="600">Edit Permissions</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.employee?.name} ({selectedUser?.email})
              </Typography>
            </Box>
            <Chip
              label={selectedUser?.role?.toUpperCase()}
              size="small"
              sx={{
                bgcolor: selectedUser?.role === 'admin' ? alpha('#f44336', 0.1) : alpha('#2196f3', 0.1),
                color: selectedUser?.role === 'admin' ? '#f44336' : '#2196f3',
                fontWeight: 600
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Assign Roles Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              Assign Roles
            </Typography>
            <Grid container spacing={2}>
              {roles.map((role) => {
                const isChecked = selectedRoles.includes(role._id);
                return (
                <Grid item xs={12} sm={6} key={role._id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: isChecked ? '2px solid #2196f3' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#2196f3' }
                    }}
                    onClick={() => handleRoleToggle(role._id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1, pr: 2 }}>
                          <Typography variant="body2" fontWeight="600">
                            {role.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {role.description || 'No description'}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {role.permissions?.length || 0} module permissions
                            </Typography>
                          </Box>
                        </Box>
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRoleToggle(role._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )})}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Current Permissions Display */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              Current Permissions
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Below are the permissions currently granted to this user
            </Alert>
            {modules.map((module) => {
              // Get user's actual permissions for this module
              const userModulePerms = customPermissions[module] || [];
              
              // Also calculate what permissions would come from selected roles
              const roleActions = new Set();
              selectedRoles.forEach(roleId => {
                const role = roles.find(r => r._id === roleId);
                const modulePerm = role?.permissions?.find(p => p.module === module);
                modulePerm?.actions?.forEach(action => roleActions.add(action));
              });

              // Combine both: actual user permissions + role-based permissions
              const allActions = new Set([...userModulePerms, ...Array.from(roleActions)]);

              if (allActions.size === 0) return null;

              return (
                <Card key={module} elevation={0} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                      {moduleDisplayNames[module] || module}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.from(allActions).map((action) => {
                        const isFromUser = userModulePerms.includes(action);
                        const isFromRole = roleActions.has(action);
                        
                        return (
                          <Chip
                            key={action}
                            label={actionDisplayNames[action] || action}
                            size="small"
                            icon={isFromUser && !isFromRole ? <span style={{fontSize: '10px', marginLeft: '4px'}}>✓</span> : undefined}
                            sx={{
                              bgcolor: alpha(actionColors[action] || '#757575', 0.1),
                              color: actionColors[action] || '#757575',
                              fontWeight: 600,
                              border: isFromUser ? '2px solid currentColor' : 'none'
                            }}
                          />
                        );
                      })}
                    </Box>
                    {userModulePerms.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        ✓ = Custom permission | Border = Currently granted
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {Object.keys(customPermissions).length === 0 && selectedRoles.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No permissions assigned. Select roles above to grant permissions.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">Create New Role</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Role Name (Internal)"
            placeholder="e.g., team_lead, manager"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            sx={{ mb: 2 }}
            helperText="Use lowercase and underscores (no spaces)"
          />
          <TextField
            fullWidth
            label="Display Name"
            placeholder="e.g., Team Lead, Manager"
            value={newRole.displayName}
            onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="Describe what this role is for..."
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Permissions
          </Typography>
          {modules.map((module) => (
            <Card key={module} elevation={0} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" fontWeight="600">
                    {moduleDisplayNames[module] || module}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={(newRole.permissions[module] || []).length === actions.length}
                        indeterminate={
                          (newRole.permissions[module] || []).length > 0 &&
                          (newRole.permissions[module] || []).length < actions.length
                        }
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewRole(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [module]: checked ? [...actions] : []
                            }
                          }));
                        }}
                      />
                    }
                    label={<Typography variant="caption">Select All</Typography>}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {actions.map((action) => {
                    const isChecked = (newRole.permissions[module] || []).includes(action);
                    return (
                      <Chip
                        key={action}
                        label={actionDisplayNames[action] || action}
                        size="small"
                        onClick={() => {
                          const modulePerms = newRole.permissions[module] || [];
                          const newPerms = isChecked
                            ? modulePerms.filter(a => a !== action)
                            : [...modulePerms, action];
                          setNewRole(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [module]: newPerms
                            }
                          }));
                        }}
                        sx={{
                          bgcolor: isChecked ? alpha(actionColors[action] || '#757575', 0.2) : alpha('#757575', 0.05),
                          color: isChecked ? actionColors[action] || '#757575' : '#757575',
                          fontWeight: isChecked ? 600 : 400,
                          cursor: 'pointer',
                          border: isChecked ? `1px solid ${actionColors[action]}` : '1px solid transparent',
                          '&:hover': {
                            bgcolor: alpha(actionColors[action] || '#757575', 0.3)
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRole}
            disabled={!newRole.name || !newRole.displayName}
          >
            Create Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionsManagement;

