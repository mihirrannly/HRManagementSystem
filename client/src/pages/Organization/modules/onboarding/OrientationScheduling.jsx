import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const OrientationScheduling = ({ onboardingId, onUpdate }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🎓 Orientation Scheduling
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Training sessions and calendar integration
      </Typography>

      <Alert severity="info">
        Orientation scheduling system - Schedule training sessions and calendar integration.
      </Alert>
    </Box>
  );
};

export default OrientationScheduling;
