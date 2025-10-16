import React from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ExpenseModule from '../Organization/modules/ExpenseModule';

const Expenses = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Expense & Travel
        </Typography>
      </Breadcrumbs>

      {/* Expense Module */}
      <ExpenseModule />
    </Box>
  );
};

export default Expenses;

