import React, { useState, useEffect } from 'react';
import { Alert, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
const PermissionGuard = ({ 
  module, 
  action, 
  children, 
  fallback = null, 
  showError = false 
}) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPermission();
  }, [user, module, action]);

  const checkPermission = async () => {
    if (!user || !module || !action) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    // Admin and HR always have permission for permission management
    if (user.role === 'admin' || user.role === 'hr') {
      setHasPermission(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/permissions/user-permissions/${user._id}`);
      const permissions = response.data.effectivePermissions || [];
      
      const modulePermission = permissions.find(p => p.module === module);
      const permitted = modulePermission ? modulePermission.actions.includes(action) : false;
      
      setHasPermission(permitted);
      setError(null);
    } catch (err) {
      console.error('Permission check failed:', err);
      setError(err.response?.data?.message || 'Permission check failed');
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error && showError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

/**
 * Hook to check permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    // Admin and HR have extensive permissions
    if (user.role === 'admin' || user.role === 'hr') {
      setUserPermissions([
        { module: 'dashboard', actions: ['read'] },
        { module: 'employees', actions: ['read', 'create', 'update', 'delete', 'export', 'import'] },
        { module: 'attendance', actions: ['read', 'create', 'update', 'approve', 'export'] },
        { module: 'leave', actions: ['read', 'create', 'update', 'approve', 'delete'] },
        { module: 'payroll', actions: ['read', 'create', 'update', 'approve', 'export'] },
        { module: 'performance', actions: ['read', 'create', 'update', 'approve'] },
        { module: 'recruitment', actions: ['read', 'create', 'update', 'delete'] },
        { module: 'reports', actions: ['read', 'create', 'export'] },
        { module: 'organization', actions: ['read', 'create', 'update', 'delete'] },
        { module: 'onboarding', actions: ['read', 'create', 'update', 'approve'] },
        { module: 'settings', actions: ['read', 'update'] },
        { module: 'permissions', actions: ['read', 'create', 'update', 'delete'] }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/permissions/user-permissions/${user._id}`);
      setUserPermissions(response.data.effectivePermissions || []);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module, action) => {
    if (user?.role === 'admin' || user?.role === 'hr') return true;
    
    const modulePermission = userPermissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const canAccess = (module, actions = ['read']) => {
    return actions.some(action => hasPermission(module, action));
  };

  return {
    permissions: userPermissions,
    hasPermission,
    canAccess,
    loading,
    refetch: fetchUserPermissions
  };
};

export default PermissionGuard;
