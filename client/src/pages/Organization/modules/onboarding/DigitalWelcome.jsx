import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const DigitalWelcome = ({ onboardingId, onUpdate }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ✨ Digital Welcome Experience
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personalized welcome dashboard with useful links and resources
      </Typography>

      <Alert severity="info">
        Digital welcome experience - Personalized dashboard with company resources and welcome content.
      </Alert>
    </Box>
  );
};

export default DigitalWelcome;
