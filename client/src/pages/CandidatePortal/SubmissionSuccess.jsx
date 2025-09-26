import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Avatar
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SubmissionSuccess = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Avatar sx={{ 
            mx: 'auto', 
            mb: 3, 
            bgcolor: 'success.main', 
            width: 80, 
            height: 80 
          }}>
            <CheckCircleIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h4" gutterBottom color="success.main">
            Submission Successful!
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thank you for completing your profile
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your information has been successfully submitted to HR. 
            You will receive updates about your onboarding process via email.
          </Typography>

          <Box sx={{ 
            bgcolor: 'success.50', 
            p: 3, 
            borderRadius: 2, 
            mb: 4,
            border: '1px solid',
            borderColor: 'success.200'
          }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              What's Next?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • HR will review your submitted information<br/>
              • You'll receive email updates on your onboarding progress<br/>
              • Your manager will contact you with next steps<br/>
              • Keep checking your email for further instructions
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Close Portal
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default SubmissionSuccess;
