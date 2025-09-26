import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Description as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DocumentLinkRecovery = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await axios.post('/onboarding/get-document-link', {
        email: email.trim()
      });

      setResult(response.data);
      toast.success('Document link found successfully!');
    } catch (error) {
      console.error('Error getting document link:', error);
      if (error.response?.status === 404) {
        setError('No pending document submission found for this email address. Please contact HR if you believe this is an error.');
      } else {
        setError('An error occurred while searching for your document link. Please try again or contact HR for assistance.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDocuments = () => {
    if (result?.employeeId) {
      navigate(`/candidate-portal/${result.employeeId}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <DocumentIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Document Link Recovery
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Enter your email address to retrieve your document upload link
        </Typography>
      </Paper>

      {/* Info Section */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight="600">
            Can't find your document upload link?
          </Typography>
          <Typography variant="body2">
            Enter the email address associated with your job offer to retrieve your personalized document upload link.
          </Typography>
        </Stack>
      </Alert>

      {/* Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon />
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  error={!!error && !result}
                  helperText={error && !result ? error : 'Enter the email address where you received the job offer'}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !email.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Searching...
                  </>
                ) : (
                  'Find My Document Link'
                )}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Success Result */}
      {result && (
        <Card sx={{ mt: 3, border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
              
              <Typography variant="h6" color="success.main" fontWeight="bold">
                Document Link Found!
              </Typography>
              
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {result.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We found your document upload portal. Click the button below to access it.
                </Typography>
              </Box>
              
              <Divider sx={{ width: '100%' }} />
              
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleGoToDocuments}
                sx={{ minWidth: 200 }}
              >
                Go to Document Upload
              </Button>
              
              <Typography variant="caption" color="text.secondary">
                This link will take you to your personalized document upload portal
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !result && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Link Not Found</strong>
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      )}

      {/* Help Section */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon />
              Need Help?
            </Typography>
            
            <Typography variant="body2">
              If you're unable to find your document link or need assistance:
            </Typography>
            
            <Stack spacing={1} sx={{ pl: 2 }}>
              <Typography variant="body2">
                • Make sure you're using the same email address from your job offer
              </Typography>
              <Typography variant="body2">
                • Check your spam/junk folder for the original email
              </Typography>
              <Typography variant="body2">
                • Contact HR department for direct assistance
              </Typography>
            </Stack>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Back to Homepage
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DocumentLinkRecovery;
