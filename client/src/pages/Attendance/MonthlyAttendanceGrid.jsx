import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  CloudUpload as CloudUploadIcon,
  People as PeopleIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const MonthlyAttendanceGrid = () => {
  const [loading, setLoading] = useState(false);
  // Default to current month if within range, otherwise January 2025
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = moment();
    if (now.isBetween('2025-01-01', '2025-10-31', 'day', '[]')) {
      return now;
    }
    return moment('2025-01-01');
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [monthDays, setMonthDays] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const startDate = selectedMonth.clone().startOf('month').format('YYYY-MM-DD');
      const endDate = selectedMonth.clone().endOf('month').format('YYYY-MM-DD');

      // Fetch attendance data for the month
      const response = await axios.get(
        '/attendance/calendar',
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.calendarData) {
        setAttendanceData(response.data.calendarData);
        setEmployees(response.data.employees || []);
        
        // Generate days for the month
        const days = [];
        const daysInMonth = selectedMonth.daysInMonth();
        for (let i = 1; i <= daysInMonth; i++) {
          days.push(selectedMonth.clone().date(i));
        }
        setMonthDays(days);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      toast.error('Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = selectedMonth.clone().subtract(1, 'month');
    // Don't go before January 2025
    if (newMonth.isSameOrAfter('2025-01-01', 'month')) {
      setSelectedMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth.clone().add(1, 'month');
    // Don't go after October 2025
    if (newMonth.isSameOrBefore('2025-10-31', 'month')) {
      setSelectedMonth(newMonth);
    }
  };

  const handleMonthSelect = (event) => {
    const [year, month] = event.target.value.split('-');
    setSelectedMonth(moment().year(year).month(month - 1));
  };

  const getAttendanceForEmployeeAndDay = (employeeId, date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayData = attendanceData.find(d => d.date === dateStr);
    
    if (dayData && dayData.employees) {
      const empData = dayData.employees.find(e => e.employeeId === employeeId);
      return empData?.attendance || null;
    }
    return null;
  };

  const getStatusColor = (status) => {
    const colors = {
      present: { 
        bg: '#e8f5e9',
        text: '#2e7d32', 
        border: '#4caf50',
      },
      late: { 
        bg: '#fff3e0',
        text: '#e65100', 
        border: '#ff9800',
      },
      absent: { 
        bg: '#ffebee',
        text: '#c62828', 
        border: '#ef5350',
      },
      weekend: { 
        bg: '#f5f5f5',
        text: '#616161', 
        border: '#9e9e9e',
      },
      'on-leave': { 
        bg: '#e3f2fd',
        text: '#1565c0', 
        border: '#42a5f5',
      },
      'half-day': { 
        bg: '#fff8e1',
        text: '#f57f17', 
        border: '#fbc02d',
      },
    };
    return colors[status] || colors.absent;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    toast.info(`Importing attendance for ${selectedMonth.format('MMMM YYYY')}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (rawData.length < 2) {
        toast.error('File is empty or invalid');
        return;
      }

      // Rannkly Excel Format:
      // Row 0: Company name
      // Row 1: Report title
      // Row 2: DATES (02-Jan-2025, 03-Jan-2025, etc.)
      // Row 3: HEADERS (Employee Number, Name, ..., IN, OUT, Status for each date)
      // Row 4+: Data
      
      const dateRow = rawData[2]; // Row with dates
      const headerRow = rawData[3]; // Row with column headers
      const headerRowIndex = 3;
      
      console.log('📋 Using Rannkly format: date row=2, header row=3');
      console.log('🔍 Sample headers:', headerRow.slice(0, 20));
      
      // Find date columns and their associated IN/OUT columns
      const dateColumnMap = [];
      
      // Scan through the date row to find dates
      for (let colIdx = 0; colIdx < dateRow.length; colIdx++) {
        const cellValue = String(dateRow[colIdx] || '').trim();
        
        // Check if this is a date cell (skip date range headers like "01-Jan-2025 - 31-Jan-2025")
        if (cellValue && /^\d{2}-\w{3}-\d{4}$/.test(cellValue) && !cellValue.includes(' - ')) {
          // Parse the date
          const parsedDate = moment(cellValue, 'DD-MMM-YYYY');
          if (!parsedDate.isValid()) continue;
          
          // Find the IN and OUT columns for this date
          // Look in the next few columns after this date
          let inCol = -1;
          let outCol = -1;
          let statusCol = -1;
          
          for (let offset = 0; offset < 10; offset++) {
            const checkCol = colIdx + offset;
            if (checkCol >= headerRow.length) break;
            
            const header = String(headerRow[checkCol] || '').trim().toUpperCase();
            
            if (header === 'IN' && inCol === -1) {
              inCol = checkCol;
            } else if (header === 'OUT' && outCol === -1) {
              outCol = checkCol;
            } else if (header === 'STATUS' && statusCol === -1) {
              statusCol = checkCol;
            }
          }
          
          dateColumnMap.push({
            date: parsedDate.format('YYYY-MM-DD'),
            displayDate: cellValue,
            inCol,
            outCol,
            statusCol
          });
          
          console.log(`✅ Found date: ${cellValue} -> IN:${inCol}, OUT:${outCol}, Status:${statusCol}`);
        }
      }
      
      console.log('📅 Found', dateColumnMap.length, 'dates with columns');
      
      if (dateColumnMap.length === 0) {
        console.error('❌ No date columns detected!');
        toast.error('Could not detect date columns in the Rannkly format file.');
        return;
      }

      // Find employee ID column (usually first non-empty column in first 10 columns)
      let empIdColIndex = -1;
      
      // First try to find by header name
      for (let i = 0; i < Math.min(10, headerRow.length); i++) {
        const h = String(headerRow[i]).toLowerCase();
        if (h.includes('employee') || h.includes('emp') || h.includes('id') || h.includes('code')) {
          empIdColIndex = i;
          break;
        }
      }
      
      // If not found, check first few data rows to find which column has employee IDs
      if (empIdColIndex === -1) {
        console.log('🔍 Checking first data row for employee ID pattern...');
        if (rawData.length > headerRowIndex + 1) {
          const firstDataRow = rawData[headerRowIndex + 1];
          for (let i = 0; i < Math.min(10, firstDataRow.length); i++) {
            const cellValue = String(firstDataRow[i] || '').trim();
            // Check if it looks like an employee ID (CODR followed by digits)
            if (/^CODR\d+$/i.test(cellValue) || /^[A-Z]{3,5}\d+$/i.test(cellValue)) {
              empIdColIndex = i;
              console.log(`✅ Found employee ID column at index ${i}: "${cellValue}"`);
              break;
            }
          }
        }
      }
      
      // Default to column 0 if still not found
      if (empIdColIndex === -1) {
        empIdColIndex = 0;
        console.log('⚠️ Using column 0 as employee ID by default');
      } else {
        console.log(`📝 Employee ID column: ${empIdColIndex}`);
      }

      // Process data rows (start after header row)
      const importRecords = [];
      for (let rowIndex = headerRowIndex + 1; rowIndex < rawData.length; rowIndex++) {
        const row = rawData[rowIndex];
        const employeeId = String(row[empIdColIndex] || '').trim();
        
        // Skip empty rows or header-like rows
        if (!employeeId || employeeId === '') continue;
        
        // Skip if this looks like a header row (contains words like 'employee', 'number', 'code', 'name')
        const lowerEmpId = employeeId.toLowerCase();
        if (lowerEmpId.includes('employee') || lowerEmpId.includes('number') || 
            lowerEmpId.includes('code') || lowerEmpId === 'name' || 
            lowerEmpId === 'id') {
          console.log(`⏭️ Skipping header-like row: "${employeeId}"`);
          continue;
        }
        
        // Skip if employeeId is just a number (1-31, likely a day number from header)
        if (/^\d{1,2}$/.test(employeeId) && Number(employeeId) >= 1 && Number(employeeId) <= 31) {
          console.log(`⏭️ Skipping row with day number as ID: "${employeeId}"`);
          continue;
        }
        
        // Skip if employeeId doesn't look like a valid employee code (must have letters or be longer than 2 chars)
        if (employeeId.length < 3 && !/[A-Za-z]/.test(employeeId)) {
          console.log(`⏭️ Skipping invalid employee ID: "${employeeId}"`);
          continue;
        }

        // For each date, extract attendance data from IN/OUT/STATUS columns
        for (const dateInfo of dateColumnMap) {
          const { date, inCol, outCol, statusCol } = dateInfo;
          
          // Extract check-in time
          let checkIn = null;
          if (inCol >= 0) {
            const inValue = String(row[inCol] || '').trim();
            if (inValue && inValue !== '-' && /\d{1,2}:\d{2}/.test(inValue)) {
              checkIn = inValue.match(/\d{1,2}:\d{2}/)[0];
            }
          }
          
          // Extract check-out time
          let checkOut = null;
          if (outCol >= 0) {
            const outValue = String(row[outCol] || '').trim();
            if (outValue && outValue !== '-' && /\d{1,2}:\d{2}/.test(outValue)) {
              checkOut = outValue.match(/\d{1,2}:\d{2}/)[0];
            }
          }
          
          // Extract status
          let status = 'present';
          if (statusCol >= 0) {
            const statusValue = String(row[statusCol] || '').trim().toLowerCase();
            if (statusValue) {
              if (statusValue.includes('absent')) {
                status = 'absent';
              } else if (statusValue.includes('leave') || statusValue.includes('l')) {
                status = 'on-leave';
              } else if (statusValue.includes('weekend') || statusValue.includes('wo')) {
                status = 'weekend';
              } else if (statusValue.includes('half') || statusValue.includes('hd')) {
                status = 'half-day';
              } else if (statusValue.includes('present') || statusValue.includes('p')) {
                status = 'present';
              }
            }
          }
          
          // Skip if no check-in/out and status is not explicitly set
          if (!checkIn && !checkOut && status === 'present') {
            continue;
          }
          
          importRecords.push({
            employeeId,
            date,
            checkIn,
            checkOut,
            status
          });
        }
      }

      console.log('📊 Parsed', importRecords.length, 'attendance records');

      if (importRecords.length === 0) {
        toast.warning('No attendance records found in file');
        return;
      }

      // Send to backend in batches with delays to avoid rate limiting
      const token = localStorage.getItem('token');
      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const skippedEmployees = new Set();
      const batchSize = 10; // Process 10 at a time
      const delayBetweenBatches = 100; // 100ms delay between batches

      toast.info(`Importing ${importRecords.length} records in batches...`);

      for (let i = 0; i < importRecords.length; i += batchSize) {
        const batch = importRecords.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (record) => {
          try {
            const response = await axios.post('/attendance/import-single', record, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Check if employee was skipped (not found in system)
            if (response.data.skipped) {
              skippedCount++;
              skippedEmployees.add(record.employeeId);
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            console.error('Error importing record:', record, err.response?.data?.message || err.message);
          }
        });
        
        await Promise.all(batchPromises);
        
        // Update progress
        const progress = Math.min(100, Math.round((i + batch.length) / importRecords.length * 100));
        toast.info(`Progress: ${progress}% (${i + batch.length}/${importRecords.length})`, { autoClose: 1000 });
        
        // Small delay between batches
        if (i + batchSize < importRecords.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      // Show detailed summary
      let summaryMsg = `✅ Import complete! ${successCount} records imported`;
      if (skippedCount > 0) {
        summaryMsg += `, ${skippedCount} records skipped (historical employees: ${Array.from(skippedEmployees).join(', ')})`;
      }
      if (errorCount > 0) {
        summaryMsg += `, ${errorCount} errors`;
      }
      
      toast.success(summaryMsg, { autoClose: 8000 });
      
      // Log skipped employees for reference
      if (skippedEmployees.size > 0) {
        console.log('📋 Skipped employees (not in current system):', Array.from(skippedEmployees));
      }
      
      // Refresh the grid
      await fetchMonthlyData();

    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = [];
      
      // Header row
      const headers = [
        'Employee Number',
        'Employee Name',
        'Department',
        ...monthDays.map(day => day.format('DD-MMM'))
      ];
      exportData.push(headers);

      // Data rows
      employees.forEach(emp => {
        const row = [
          emp.employeeId,
          emp.name,
          emp.department || 'N/A'
        ];

        monthDays.forEach(day => {
          const attendance = getAttendanceForEmployeeAndDay(emp.employeeId, day);
          if (attendance) {
            const checkIn = attendance.checkIn ? moment(attendance.checkIn).format('HH:mm') : '-';
            const checkOut = attendance.checkOut ? moment(attendance.checkOut).format('HH:mm') : '-';
            const hours = attendance.totalHours ? attendance.totalHours.toFixed(2) : '0';
            row.push(`${checkIn} - ${checkOut} (${hours}h) [${attendance.status}]`);
          } else {
            row.push('-');
          }
        });

        exportData.push(row);
      });

      // Create workbook
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selectedMonth.format('MMM YYYY'));

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Employee Number
        { wch: 25 }, // Employee Name
        { wch: 20 }, // Department
        ...monthDays.map(() => ({ wch: 25 })) // Days
      ];

      // Export
      XLSX.writeFile(wb, `Attendance_${selectedMonth.format('MMM_YYYY')}.xlsx`);
      toast.success('Attendance data exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error exporting data');
    }
  };

  const renderAttendanceCell = (attendance, day) => {
    if (!attendance) {
      const isWeekend = day.day() === 0 || day.day() === 6;
      const colors = getStatusColor(isWeekend ? 'weekend' : 'absent');
      return (
        <TableCell
          key={day.format('YYYY-MM-DD')}
          sx={{
            minWidth: 120,
            maxWidth: 120,
            p: 0.75,
            bgcolor: colors.bg,
            borderRight: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: colors.text, 
              fontWeight: 600, 
              fontSize: '0.75rem',
            }}
          >
            {isWeekend ? 'WO' : '-'}
          </Typography>
        </TableCell>
      );
    }

    const colors = getStatusColor(attendance.status);
    const checkIn = attendance.checkIn ? moment(attendance.checkIn).format('HH:mm') : '-';
    const checkOut = attendance.checkOut ? moment(attendance.checkOut).format('HH:mm') : '-';
    const hours = attendance.totalHours ? attendance.totalHours.toFixed(1) : '0';

    return (
      <TableCell
        key={day.format('YYYY-MM-DD')}
        sx={{
          minWidth: 120,
          maxWidth: 120,
          p: 0.75,
          bgcolor: colors.bg,
          borderRight: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" display="block"><strong>Status:</strong> {attendance.status}</Typography>
              <Typography variant="caption" display="block"><strong>Check In:</strong> {checkIn}</Typography>
              <Typography variant="caption" display="block"><strong>Check Out:</strong> {checkOut}</Typography>
              <Typography variant="caption" display="block"><strong>Hours:</strong> {hours}h</Typography>
              {attendance.isLate && (
                <Typography variant="caption" display="block" color="warning.main">
                  Late by {attendance.lateMinutes} min
                </Typography>
              )}
            </Box>
          }
          arrow
        >
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.text, 
                fontWeight: 600, 
                fontSize: '0.7rem',
                display: 'block'
              }}
            >
              {checkIn}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.text, 
                fontWeight: 600, 
                fontSize: '0.7rem',
                display: 'block'
              }}
            >
              {checkOut}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: colors.border, 
                fontWeight: 700, 
                fontSize: '0.65rem',
                display: 'block',
                mt: 0.5
              }}
            >
              {hours}h
            </Typography>
          </Box>
        </Tooltip>
      </TableCell>
    );
  };

  if (loading && attendanceData.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        gap: 2
      }}>
        <CircularProgress size={50} />
        <Typography variant="body1" color="text.secondary">Loading attendance data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Header Controls */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        {loading && <LinearProgress />}
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Monthly Attendance Grid
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedMonth.format('MMMM YYYY')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={selectedMonth.format('YYYY-MM')}
                  onChange={handleMonthSelect}
                  label="Select Month"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const date = moment('2025-01-01').add(i, 'months');
                    return (
                      <MenuItem key={i} value={date.format('YYYY-MM')}>
                        {date.format('MMMM YYYY')}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  onClick={handlePreviousMonth} 
                  size="small"
                  disabled={selectedMonth.isSameOrBefore('2025-01-01', 'month')}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton 
                  onClick={handleNextMonth} 
                  size="small"
                  disabled={selectedMonth.isSameOrAfter('2025-10-31', 'month')}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchMonthlyData}
                disabled={loading}
              >
                Refresh
              </Button>

              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<CloudUploadIcon />}
                onClick={handleImportClick}
                disabled={importing || loading}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={exportToExcel}
                disabled={loading || employees.length === 0}
              >
                Export
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </Box>
          </Box>

          {/* Summary Stats */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PeopleIcon sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Employees</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{employees.length}</Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DateRangeIcon sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Days</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{monthDays.length}</Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AssessmentIcon sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Records</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {employees.length * monthDays.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Legend */}
      <Paper sx={{ mb: 2, p: 2, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
            Legend:
          </Typography>
          {Object.entries({
            present: 'Present',
            late: 'Late',
            absent: 'Absent',
            weekend: 'Weekend',
            'on-leave': 'On Leave',
            'half-day': 'Half Day',
          }).map(([status, label]) => {
            const colors = getStatusColor(status);
            return (
              <Chip
                key={status}
                label={label}
                size="small"
                sx={{
                  bgcolor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  fontWeight: 600,
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Attendance Grid */}
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 2 }}>
        <TableContainer sx={{ maxHeight: 650 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* Employee Info Columns */}
                <TableCell
                  sx={{
                    minWidth: 120,
                    maxWidth: 120,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    position: 'sticky',
                    left: 0,
                    zIndex: 1100,
                    borderRight: '2px solid white',
                  }}
                >
                  Employee ID
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 180,
                    maxWidth: 180,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    position: 'sticky',
                    left: 120,
                    zIndex: 1100,
                    borderRight: '2px solid white',
                  }}
                >
                  Employee Name
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 120,
                    maxWidth: 120,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    position: 'sticky',
                    left: 300,
                    zIndex: 1100,
                    borderRight: '3px solid white',
                  }}
                >
                  Department
                </TableCell>

                {/* Day Columns */}
                {monthDays.map((day) => {
                  const isWeekend = day.day() === 0 || day.day() === 6;
                  const isToday = day.isSame(moment(), 'day');
                  return (
                    <TableCell
                      key={day.format('YYYY-MM-DD')}
                      sx={{
                        minWidth: 120,
                        maxWidth: 120,
                        bgcolor: isToday ? 'warning.main' : isWeekend ? 'grey.400' : 'primary.light',
                        color: 'white',
                        fontWeight: 600,
                        textAlign: 'center',
                        borderRight: '1px solid white',
                      }}
                    >
                      <Typography variant="body2" display="block" sx={{ fontWeight: 700 }}>
                        {day.format('DD')}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                        {day.format('ddd')}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp, index) => (
                <TableRow key={emp._id} hover>
                  {/* Sticky Employee Info */}
                  <TableCell
                    sx={{
                      minWidth: 120,
                      maxWidth: 120,
                      bgcolor: 'white',
                      position: 'sticky',
                      left: 0,
                      zIndex: 900,
                      borderRight: '2px solid #e0e0e0',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                    }}
                  >
                    {emp.employeeId}
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 180,
                      maxWidth: 180,
                      bgcolor: 'white',
                      position: 'sticky',
                      left: 120,
                      zIndex: 900,
                      borderRight: '2px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                        {emp.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {emp.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 120,
                      maxWidth: 120,
                      bgcolor: 'white',
                      position: 'sticky',
                      left: 300,
                      zIndex: 900,
                      borderRight: '3px solid #e0e0e0',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {emp.department || 'N/A'}
                    </Typography>
                  </TableCell>

                  {/* Attendance Cells */}
                  {monthDays.map((day) => {
                    const attendance = getAttendanceForEmployeeAndDay(emp.employeeId, day);
                    return renderAttendanceCell(attendance, day);
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {employees.length === 0 && !loading && (
        <Paper sx={{ textAlign: 'center', py: 8, mt: 3, boxShadow: 1 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No attendance data available for this month
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Import attendance data to see it here
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleImportClick}
          >
            Import Attendance Data
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MonthlyAttendanceGrid;


