import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

const Payroll = () => {
  const { user, isHR, isAdmin } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
  });

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/payroll/payslips');
      setPayslips(response.data.payslips || []);
      
      // Calculate summary if HR/Admin
      if (isHR || isAdmin) {
        const totalGross = response.data.payslips.reduce((sum, p) => sum + p.grossPay, 0);
        const totalDeductions = response.data.payslips.reduce((sum, p) => sum + p.totalDeductions, 0);
        const totalNet = response.data.payslips.reduce((sum, p) => sum + p.netPay, 0);
        
        setSummary({
          totalEmployees: response.data.payslips.length,
          totalGrossPay: totalGross,
          totalDeductions: totalDeductions,
          totalNetPay: totalNet,
        });
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payslipId) => {
    try {
      const response = await axios.get(`/payroll/payslips/${payslipId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${moment().format('MM-YYYY')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'info';
      case 'generated':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Payroll Management
        </Typography>
        <IconButton onClick={fetchPayrollData}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Summary Cards for HR/Admin */}
      {(isHR || isAdmin) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {summary.totalEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  ₹{summary.totalGrossPay.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Gross Pay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  ₹{summary.totalDeductions.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  ₹{summary.totalNetPay.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Net Pay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payslips Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          Payslips
        </Typography>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {(isHR || isAdmin) && <TableCell>Employee</TableCell>}
                <TableCell>Month/Year</TableCell>
                <TableCell>Gross Pay</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Pay Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip._id} hover>
                  {(isHR || isAdmin) && (
                    <TableCell>
                      {payslip.employee?.personalInfo?.firstName} {payslip.employee?.personalInfo?.lastName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {payslip.employee?.employeeId}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {moment().month(payslip.month - 1).format('MMMM')} {payslip.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      ₹{payslip.grossPay.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error.main" fontWeight="medium">
                      ₹{payslip.totalDeductions.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{payslip.netPay.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payslip.status}
                      color={getStatusColor(payslip.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payslip.payrollCycle?.payDate
                      ? moment(payslip.payrollCycle.payDate).format('DD/MM/YYYY')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownloadPayslip(payslip._id)}
                      title="Download Payslip"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {payslips.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No payslips found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Quick Actions for Employees */}
      {!isHR && !isAdmin && payslips.length > 0 && (
        <Card sx={{ mt: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPayslip(payslips[0]._id)}
                >
                  Download Latest Payslip
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                  onClick={() => toast.info('Tax documents feature coming soon!')}
                >
                  Tax Documents
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Payroll;
