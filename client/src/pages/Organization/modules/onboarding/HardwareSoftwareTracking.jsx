import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const HardwareSoftwareTracking = ({ onboardingId, onUpdate }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        💻 Hardware & Software Setup
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        IT equipment allocation and software access tracking
      </Typography>

      <Alert severity="info">
        Hardware & software tracking - Manage IT equipment allocation and software access.
      </Alert>
    </Box>
  );
};

export default HardwareSoftwareTracking;
