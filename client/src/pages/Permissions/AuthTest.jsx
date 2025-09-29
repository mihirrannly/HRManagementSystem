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

const AuthTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const testAuth = async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    setError(null);
    setResults(null);

    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'Present' : 'Missing');
    console.log('Current user:', user);

    const testResults = {
      token: token ? 'Present' : 'Missing',
      user: user,
      tests: []
    };

    try {
      // Test 1: Health endpoint (no auth required)
      console.log('Testing health endpoint...');
      try {
        const healthResponse = await axios.get('/health');
        testResults.tests.push({
          name: 'Health Check',
          status: 'success',
          data: healthResponse.data
        });
      } catch (err) {
        testResults.tests.push({
          name: 'Health Check',
          status: 'error',
          error: err.response?.data?.message || err.message
        });
      }

      // Test 2: Auth-required endpoint
      console.log('Testing auth endpoint...');
      try {
        const authResponse = await axios.get('/auth/me');
        testResults.tests.push({
          name: 'Auth Me',
          status: 'success',
          data: authResponse.data
        });
      } catch (err) {
        testResults.tests.push({
          name: 'Auth Me',
          status: 'error',
          error: err.response?.data?.message || err.message,
          statusCode: err.response?.status
        });
      }

      // Test 3: Permissions modules endpoint
      console.log('Testing permissions modules endpoint...');
      try {
        const permissionsResponse = await axios.get('/permissions/modules');
        testResults.tests.push({
          name: 'Permissions Modules',
          status: 'success',
          data: permissionsResponse.data
        });
      } catch (err) {
        testResults.tests.push({
          name: 'Permissions Modules',
          status: 'error',
          error: err.response?.data?.message || err.message,
          statusCode: err.response?.status
        });
      }

      // Test 4: Permissions roles endpoint
      console.log('Testing permissions roles endpoint...');
      try {
        const rolesResponse = await axios.get('/permissions/roles');
        testResults.tests.push({
          name: 'Permissions Roles',
          status: 'success',
          data: rolesResponse.data
        });
      } catch (err) {
        testResults.tests.push({
          name: 'Permissions Roles',
          status: 'error',
          error: err.response?.data?.message || err.message,
          statusCode: err.response?.status
        });
      }

      // Test 5: Permissions users endpoint
      console.log('Testing permissions users endpoint...');
      try {
        const usersResponse = await axios.get('/permissions/users');
        testResults.tests.push({
          name: 'Permissions Users',
          status: 'success',
          data: usersResponse.data
        });
      } catch (err) {
        testResults.tests.push({
          name: 'Permissions Users',
          status: 'error',
          error: err.response?.data?.message || err.message,
          statusCode: err.response?.status
        });
      }

      setResults(testResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []); // Empty dependency array to run only once

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Authentication & API Test
      </Typography>

      <Button variant="contained" onClick={testAuth} disabled={loading} sx={{ mb: 3 }}>
        {loading ? <CircularProgress size={20} /> : 'Run Tests'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Token Status: {results.token}</Typography>
            <Typography variant="subtitle1">
              User: {results.user?.email || 'Not logged in'} (Role: {results.user?.role || 'N/A'})
            </Typography>
          </Box>

          {results.tests.map((test, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <Typography variant="subtitle1" color={test.status === 'success' ? 'success.main' : 'error.main'}>
                {test.name}: {test.status.toUpperCase()}
              </Typography>
              
              {test.status === 'success' && test.data && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Response:</Typography>
                  <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </Box>
              )}

              {test.status === 'error' && (
                <Box>
                  <Typography variant="body2" color="error">
                    Error: {test.error}
                  </Typography>
                  {test.statusCode && (
                    <Typography variant="body2" color="error">
                      Status Code: {test.statusCode}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default AuthTest;
