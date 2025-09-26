import React from 'react';
import { Box, Container } from '@mui/material';

const ModuleWrapper = ({ children }) => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        py: 3
      }}
    >
      <Container maxWidth="xl">
        {children}
      </Container>
    </Box>
  );
};

export default ModuleWrapper;
