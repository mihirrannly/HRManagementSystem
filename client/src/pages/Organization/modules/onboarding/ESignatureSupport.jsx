import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const ESignatureSupport = ({ onboardingId, onUpdate }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ✍️ E-Signature Support
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Digital document signing with DocuSign and HelloSign integration
      </Typography>

      <Alert severity="info">
        E-signature support - Digital document signing integration with popular e-signature providers.
      </Alert>
    </Box>
  );
};

export default ESignatureSupport;
