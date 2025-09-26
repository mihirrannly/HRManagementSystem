import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmployeeProfile = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Employee Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Employee profile details will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmployeeProfile;
