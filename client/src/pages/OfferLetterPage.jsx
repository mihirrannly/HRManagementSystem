import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import OfferLetterEditor from '../components/OfferLetterEditor';
import axios from 'axios';
import { toast } from 'react-toastify';

const OfferLetterPage = () => {
  const { onboardingId } = useParams();
  const navigate = useNavigate();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (onboardingId) {
      fetchOnboarding();
    }
  }, [onboardingId]);

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/onboarding/${onboardingId}`);
      setOnboarding(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      setError('Failed to load onboarding details. Please try again.');
      toast.error('Failed to load onboarding details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedOnboarding) => {
    setOnboarding(updatedOnboarding);
  };

  const handleComplete = () => {
    toast.success('Offer letter process completed!');
    // Optionally navigate back or refresh
    fetchOnboarding();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading onboarding details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="inherit" />
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/organization')}
        >
          Organization
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate(-1)}
        >
          Onboardings
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AssignmentIcon fontSize="inherit" />
          Offer Letter
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Offer Letter Management
            </Typography>
            <Typography variant="h6">
              {onboarding?.employeeName} - {onboarding?.position}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {onboarding?.department} • {onboarding?.email}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back to Onboarding
          </Button>
        </Box>
      </Paper>

      {/* Offer Letter Editor */}
      <OfferLetterEditor
        onboarding={onboarding}
        onUpdate={handleUpdate}
        onComplete={handleComplete}
      />
    </Container>
  );
};

export default OfferLetterPage;
