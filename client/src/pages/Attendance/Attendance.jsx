import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  Cancel as CheckOutIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

import { useAuth } from '../../contexts/AuthContext';

const Attendance = () => {
  const { user, isEmployee } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalHours: 0,
    averageHours: 0,
  });

  useEffect(() => {
    fetchAttendanceStatus();
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get('/attendance/status');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/attendance');
      setAttendanceRecords(response.data.attendance || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      fetchAttendanceStatus();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      fetchAttendanceStatus();
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'half-day':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Attendance
        </Typography>
        <IconButton onClick={fetchAttendanceRecords}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Today's Status Card for Employees */}
      {isEmployee && (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Today's Status
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {moment().format('dddd, MMMM Do YYYY')}
                </Typography>
                {attendanceStatus?.isCheckedIn && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Checked in at {moment(attendanceStatus.checkInTime).format('HH:mm')}
                    {attendanceStatus.isLate && (
                      <Chip
                        label={`Late by ${attendanceStatus.lateMinutes} mins`}
                        size="small"
                        sx={{ ml: 1, bgcolor: 'warning.main', color: 'white' }}
                      />
                    )}
                  </Typography>
                )}
                {attendanceStatus?.isCheckedOut && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Checked out at {moment(attendanceStatus.checkOutTime).format('HH:mm')}
                  </Typography>
                )}
                {attendanceStatus?.totalHours > 0 && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total hours: {attendanceStatus.totalHours.toFixed(2)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {!attendanceStatus?.isCheckedIn ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckInIcon />}
                    onClick={handleCheckIn}
                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    Check In
                  </Button>
                ) : !attendanceStatus?.isCheckedOut ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckOutIcon />}
                    onClick={handleCheckOut}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Check Out
                  </Button>
                ) : (
                  <Chip
                    label="Day Completed"
                    size="large"
                    sx={{ bgcolor: 'success.main', color: 'white', px: 2, py: 1 }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.presentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error" fontWeight="bold">
                {stats.absentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.lateDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.averageHours.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Hours/Day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Records Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          Attendance Records
        </Typography>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Late Minutes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>
                    {moment(record.date).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>
                    {record.checkIn?.time
                      ? moment(record.checkIn.time).format('HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {record.checkOut?.time
                      ? moment(record.checkOut.time).format('HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {record.totalHours ? record.totalHours.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.isLate ? record.lateMinutes : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {attendanceRecords.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Attendance;
