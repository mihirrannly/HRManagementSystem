import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PermissionsDebug = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('PermissionsDebug: Component mounted');
    console.log('User:', user);
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      console.log('Testing API endpoints...');
      setLoading(true);
      setError(null);

      // Test basic health
      console.log('1. Testing health endpoint...');
      const healthResponse = await axios.get('/health');
      console.log('Health response:', healthResponse.data);

      // Test modules endpoint
      console.log('2. Testing modules endpoint...');
      const modulesResponse = await axios.get('/permissions/modules');
      console.log('Modules response:', modulesResponse.data);

      // Test roles endpoint
      console.log('3. Testing roles endpoint...');
      const rolesResponse = await axios.get('/permissions/roles');
      console.log('Roles response:', rolesResponse.data);

      setData({
        health: healthResponse.data,
        modules: modulesResponse.data,
        roles: rolesResponse.data
      });

    } catch (err) {
      console.error('API Test Error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Testing API endpoints...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Permissions Debug Page
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Current User: {user?.email} (Role: {user?.role})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {data && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            API Test Results:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Health Check:</Typography>
            <pre>{JSON.stringify(data.health, null, 2)}</pre>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Modules ({data.modules?.modules?.length || 0}):</Typography>
            <pre>{JSON.stringify(data.modules?.modules, null, 2)}</pre>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Roles ({data.roles?.roles?.length || 0}):</Typography>
            <pre>{JSON.stringify(data.roles?.roles?.map(r => ({ name: r.name, displayName: r.displayName })), null, 2)}</pre>
          </Box>
        </Paper>
      )}

      <Button variant="contained" onClick={testAPI}>
        Retry API Test
      </Button>
    </Box>
  );
};

export default PermissionsDebug;
