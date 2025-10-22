import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SalaryCalculator = () => {
  const [ctc, setCtc] = useState('');
  const [calculationType, setCalculationType] = useState('ctc');
  const [includePF, setIncludePF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [formattedBreakdown, setFormattedBreakdown] = useState(null);

  const handleCalculate = async () => {
    if (!ctc || ctc <= 0) {
      toast.error('Please enter a valid CTC amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/salary-calculator/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ctc: parseFloat(ctc),
          calculationType,
          includePF
        })
      });

      const data = await response.json();

      if (data.success) {
        setBreakdown(data.data);
        setFormattedBreakdown(data.data.formatted);
        toast.success('Salary breakdown calculated successfully');
      } else {
        toast.error(data.message || 'Failed to calculate salary breakdown');
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      toast.error('Failed to calculate salary breakdown');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCtc('');
    setBreakdown(null);
    setFormattedBreakdown(null);
    setCalculationType('ctc');
    setIncludePF(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCalculationTypeLabel = (type) => {
    switch (type) {
      case 'ctc': return 'Cost to Company (Annual)';
      case 'monthlyGross': return 'Monthly Gross Salary';
      case 'basic': return 'Basic Salary (Monthly)';
      default: return 'Cost to Company (Annual)';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Salary Calculator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Calculate salary breakdown based on your exact specifications
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          Reset
        </Button>
      </Box>

      {/* Input Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon />
            Salary Input
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value)}
                  label="Calculation Type"
                >
                  <MenuItem value="ctc">Cost to Company (Annual)</MenuItem>
                  <MenuItem value="monthlyGross">Monthly Gross Salary</MenuItem>
                  <MenuItem value="basic">Basic Salary (Monthly)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                placeholder="Enter amount"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>
          </Grid>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={includePF}
                onChange={(e) => setIncludePF(e.target.checked)}
              />
            }
            label="Include PF as Employer Contribution (12% of Basic Salary)"
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={loading || !ctc}
            fullWidth
            startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Calculating...' : 'Calculate Salary Breakdown'}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {breakdown && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Gross
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {formattedBreakdown?.monthly?.gross || formatCurrency(breakdown.monthly.gross)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Annual CTC
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {formattedBreakdown?.yearly?.ctc || formatCurrency(breakdown.yearly.ctc)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly CTC
                  </Typography>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {formattedBreakdown?.monthly?.ctc || formatCurrency(breakdown.monthly.ctc)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Breakdown Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salary Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on your exact specification: Basic (60%), HRA (24%), Conveyance (9%), Special Allowance (7%)
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Component</TableCell>
                      <TableCell align="right">Monthly</TableCell>
                      <TableCell align="right">Yearly</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Basic Salary</TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.monthly?.basic || formatCurrency(breakdown.monthly.basic)}
                      </TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.yearly?.basic || formatCurrency(breakdown.yearly.basic)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label="60%" color="secondary" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>HRA</TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.monthly?.hra || formatCurrency(breakdown.monthly.hra)}
                      </TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.yearly?.hra || formatCurrency(breakdown.yearly.hra)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label="24%" color="secondary" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Conveyance Allowance</TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.monthly?.conveyanceAllowance || formatCurrency(breakdown.monthly.conveyanceAllowance)}
                      </TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.yearly?.conveyanceAllowance || formatCurrency(breakdown.yearly.conveyanceAllowance)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label="9%" color="secondary" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Special Allowance</TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.monthly?.specialAllowance || formatCurrency(breakdown.monthly.specialAllowance)}
                      </TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.yearly?.specialAllowance || formatCurrency(breakdown.yearly.specialAllowance)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label="7%" color="secondary" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ 
                      borderTop: 3, 
                      borderColor: '#2e7d32', 
                      backgroundColor: '#e8f5e8',
                      '&:hover': {
                        backgroundColor: '#c8e6c9'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#2e7d32'
                      }}>
                        Gross Salary (Part A)
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#2e7d32'
                      }}>
                        {formattedBreakdown?.monthly?.gross || formatCurrency(breakdown.monthly.gross)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#2e7d32'
                      }}>
                        {formattedBreakdown?.yearly?.gross || formatCurrency(breakdown.yearly.gross)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label="100%" 
                          sx={{ 
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary' }}>Employer's Contribution (Part B)</TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.monthly?.pfEmployer || formatCurrency(breakdown.monthly.pfEmployer)}
                      </TableCell>
                      <TableCell align="right">
                        {formattedBreakdown?.yearly?.pfEmployer || formatCurrency(breakdown.yearly.pfEmployer)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={breakdown.monthly.pfEmployer > 0 ? '12% of Basic' : '0%'} 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary' }}>Variable Pay (Part C)</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>₹0</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>₹0</TableCell>
                      <TableCell align="right">
                        <Chip label="0%" variant="outlined" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ 
                      borderTop: 3, 
                      borderColor: '#1976d2', 
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#bbdefb'
                      }
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#1976d2'
                      }}>
                        Total CTC
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#1976d2'
                      }}>
                        {formattedBreakdown?.monthly?.ctc || formatCurrency(breakdown.monthly.ctc)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#1976d2'
                      }}>
                        {formattedBreakdown?.yearly?.ctc || formatCurrency(breakdown.yearly.ctc)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label="100%" 
                          sx={{ 
                            backgroundColor: '#1976d2',
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Breakdown Table from API */}
          {breakdown.breakdownTable && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Breakdown
                </Typography>
                {breakdown.breakdownTable.map((part, partIndex) => (
                  <Box key={partIndex} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Part {part.part}
                      {part.part === 'A' && ' - Gross Salary Components'}
                      {part.part === 'B' && ' - Employer\'s Contribution'}
                      {part.part === 'C' && ' - Variable Pay'}
                      {part.part === 'Total' && ' - Total CTC'}
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell align="right">Monthly</TableCell>
                            <TableCell align="right">Yearly</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {part.components.map((component, compIndex) => (
                            <TableRow 
                              key={compIndex}
                              sx={component.isTotal ? { 
                                borderTop: 3, 
                                borderColor: part.part === 'A' ? '#2e7d32' : '#1976d2',
                                backgroundColor: part.part === 'A' ? '#e8f5e8' : '#e3f2fd',
                                '&:hover': {
                                  backgroundColor: part.part === 'A' ? '#c8e6c9' : '#bbdefb'
                                }
                              } : {}}
                            >
                              <TableCell sx={{ 
                                fontWeight: component.isTotal ? 'bold' : 'normal',
                                fontSize: component.isTotal ? '1.1rem' : '1rem',
                                color: component.isTotal ? (part.part === 'A' ? '#2e7d32' : '#1976d2') : 'inherit'
                              }}>
                                {component.name}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontWeight: component.isTotal ? 'bold' : 'normal',
                                fontSize: component.isTotal ? '1.1rem' : '1rem',
                                color: component.isTotal ? (part.part === 'A' ? '#2e7d32' : '#1976d2') : 'inherit'
                              }}>
                                {formatCurrency(component.monthly)}
                              </TableCell>
                              <TableCell align="right" sx={{ 
                                fontWeight: component.isTotal ? 'bold' : 'normal',
                                fontSize: component.isTotal ? '1.1rem' : '1rem',
                                color: component.isTotal ? (part.part === 'A' ? '#2e7d32' : '#1976d2') : 'inherit'
                              }}>
                                {formatCurrency(component.yearly)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SalaryCalculator;
