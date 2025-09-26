import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const DepartmentalIntroductions = ({ onboardingId, onUpdate }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        👥 Departmental Introductions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Automated team introductions and welcome messages
      </Typography>

      <Alert severity="info">
        Departmental introduction system - Automated email introductions and team welcome messages.
      </Alert>
    </Box>
  );
};

export default DepartmentalIntroductions;
