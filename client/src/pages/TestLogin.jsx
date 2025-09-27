import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

const TestLogin = () => {
  const [email, setEmail] = useState('hr@rannkly.com');
  const [password, setPassword] = useState('hr123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🔍 Testing login with:', { email, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok) {
        setResult(`✅ SUCCESS: ${data.message}\nToken: ${data.token.substring(0, 20)}...\nUser: ${data.user.email} (${data.user.role})`);
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setResult(`❌ ERROR: ${data.message || 'Login failed'}`);
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      setResult(`🚨 NETWORK ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔧 Login Test Page
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      
      <Button
        fullWidth
        variant="contained"
        onClick={testLogin}
        disabled={loading}
        sx={{ mt: 2, mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test Login'}
      </Button>
      
      {result && (
        <Alert severity={result.includes('SUCCESS') ? 'success' : 'error'}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mt: 2 }}>
        📝 Check the browser console (F12) for detailed logs
      </Typography>
    </Box>
  );
};

export default TestLogin;
