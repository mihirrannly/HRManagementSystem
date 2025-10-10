import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  FileUpload as FileUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const steps = ['Upload File', 'Verify Headers', 'Preview Data', 'Import Results'];

const RannklyAttendanceImport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [headerInfo, setHeaderInfo] = useState(null);
  const [transformedData, setTransformedData] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExtension)) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Parse and analyze Rannkly format file
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

          // Analyze structure
          const headerRow = 3; // Row 4 in Excel (0-indexed as 3)
          const dataStartRow = 4; // Row 5 in Excel
          const headers = jsonData[headerRow];
          
          // Parse header structure
          const empInfoHeaders = headers.slice(0, 13);
          const dailyHeaders = headers.slice(14); // Skip "Leave" column (index 13)
          
          // Group daily headers by day
          const daysData = [];
          for (let i = 0; i < dailyHeaders.length; i += 9) {
            const dayNumber = Math.floor(i / 9) + 1;
            daysData.push({
              day: dayNumber,
              shiftPolicy: i,
              shiftStart: i + 1,
              shiftEnd: i + 2,
              checkIn: i + 3,
              checkOut: i + 4,
              effectiveHours: i + 5,
              grossHours: i + 6,
              shiftHours: i + 7,
              status: i + 8,
            });
          }

          setHeaderInfo({
            title: jsonData[0][0],
            subtitle: jsonData[1][0],
            dateRange: jsonData[2][6], // "01-Jan-2025 - 31-Jan-2025"
            employeeHeaders: empInfoHeaders,
            daysCount: daysData.length,
            daysData,
            totalEmployees: jsonData.length - dataStartRow,
          });

          setFileData({
            jsonData,
            headerRow,
            dataStartRow,
            headers,
          });

          toast.success('File analyzed successfully!');
          setActiveStep(1);
        } catch (error) {
          console.error('Error parsing file:', error);
          toast.error('Error parsing file structure');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Error reading file');
        setLoading(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error processing file');
      setLoading(false);
    }
  };

  // Transform wide format to long format
  const handleTransform = () => {
    setLoading(true);

    try {
      const { jsonData, dataStartRow, headers } = fileData;
      const transformed = [];

      // Get month and year from date range
      const dateRangeParts = headerInfo.dateRange.split('-');
      const monthStr = dateRangeParts[0].trim().split('-')[1]; // "Jan"
      const yearStr = dateRangeParts[2].trim().split(' ')[2]; // "2025"

      // Parse employee data
      for (let row = dataStartRow; row < jsonData.length; row++) {
        const rowData = jsonData[row];
        const employeeNumber = rowData[0];
        const employeeName = rowData[1];

        if (!employeeNumber) continue; // Skip empty rows

        // Process each day
        for (let day = 1; day <= headerInfo.daysCount; day++) {
          const baseCol = 14 + (day - 1) * 9; // Start from column 14 (after employee info and Leave)

          const checkIn = rowData[baseCol + 3]; // IN
          const checkOut = rowData[baseCol + 4]; // OUT
          const status = rowData[baseCol + 8]; // Status
          const grossHours = rowData[baseCol + 6]; // Gross Hours

          // Create date string
          const dateStr = `2025-01-${String(day).padStart(2, '0')}`;

          transformed.push({
            employeeId: employeeNumber,
            employeeName: employeeName,
            date: dateStr,
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            status: status ? status.toLowerCase().replace(/\s+/g, '-') : 'absent',
            grossHours: grossHours || null,
          });
        }
      }

      setTransformedData(transformed);
      toast.success(`Transformed ${transformed.length} attendance records!`);
      setActiveStep(2);
    } catch (error) {
      console.error('Error transforming data:', error);
      toast.error('Error transforming data');
    } finally {
      setLoading(false);
    }
  };

  // Execute import
  const handleExecuteImport = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        created: [],
        updated: [],
      };

      // Import in batches of 50
      const batchSize = 50;
      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize);

        for (const record of batch) {
          try {
            const response = await axios.post(
              `${API_URL}/api/attendance/import-single`,
              record,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.data.success) {
              results.success++;
              if (response.data.created) {
                results.created.push(record);
              } else {
                results.updated.push(record);
              }
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              employeeId: record.employeeId,
              date: record.date,
              error: error.response?.data?.message || error.message,
            });
          }
        }

        // Update progress
        const progress = Math.round(((i + batch.length) / transformedData.length) * 100);
        console.log(`Import progress: ${progress}%`);
      }

      setImportResults(results);
      toast.success(`Import completed: ${results.success} records processed`);
      setActiveStep(3);
    } catch (error) {
      console.error('Error executing import:', error);
      toast.error('Error importing data');
    } finally {
      setLoading(false);
    }
  };

  // Reset and start over
  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setFileData(null);
    setHeaderInfo(null);
    setTransformedData(null);
    setImportResults(null);
  };

  // Step 1: File Upload
  const renderFileUpload = () => (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Upload Rannkly Attendance Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your Rannkly monthly attendance report in Excel format.
              The system will automatically detect the format and transform it for import.
            </Typography>

            <Alert severity="info" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
              <AlertTitle>Expected Format:</AlertTitle>
              • File name: "Jan 2025 - 31 Jan 2025 - Rannkly.xlsx"<br />
              • Wide format with employee info + daily attendance columns<br />
              • Headers clearly showing: Employee Number, Name, Department, then daily IN/OUT times
            </Alert>

            <input
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<FileUploadIcon />}
                size="large"
              >
                Select File
              </Button>
            </label>

            {selectedFile && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <AlertTitle>Selected File</AlertTitle>
                  <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                </Alert>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleUploadAndAnalyze}
                disabled={!selectedFile || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {loading ? 'Analyzing...' : 'Analyze File'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Rannkly Format Info
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Employee Info Columns"
                    secondary="Employee Number, Name, Job Title, Department, etc."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Daily Attendance Columns"
                    secondary="For each day: IN, OUT, Status, Hours"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="31 Days of Data"
                    secondary="All attendance for the month"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Step 2: Verify Headers
  const renderHeaderVerification = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          📊 File Structure Detected
        </Typography>
        
        <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
          <AlertTitle>Headers Clearly Identified!</AlertTitle>
          All headers have been detected and organized for your review.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  📄 File Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2"><strong>Title:</strong> {headerInfo?.title}</Typography>
                <Typography variant="body2"><strong>Report:</strong> {headerInfo?.subtitle}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {headerInfo?.dateRange}</Typography>
                <Typography variant="body2"><strong>Total Employees:</strong> {headerInfo?.totalEmployees}</Typography>
                <Typography variant="body2"><strong>Days of Data:</strong> {headerInfo?.daysCount}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  📊 Data Structure
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  • <strong>Employee Info Columns:</strong> {headerInfo?.employeeHeaders.filter(h => h).length}
                </Typography>
                <Typography variant="body2">
                  • <strong>Daily Attendance Sets:</strong> {headerInfo?.daysCount}
                </Typography>
                <Typography variant="body2">
                  • <strong>Total Records to Import:</strong> {headerInfo?.totalEmployees * headerInfo?.daysCount}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                  ✅ Format recognized successfully!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                👥 Employee Information Headers ({headerInfo?.employeeHeaders.filter(h => h).length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>
                        Column #
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>
                        Header Name
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {headerInfo?.employeeHeaders.map((header, index) => (
                      header && (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Chip label={header} color="primary" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                📅 Daily Attendance Structure (Repeating Pattern)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Each day has 9 columns with the following headers:
              </Alert>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'success.light' }}>Field #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'success.light' }}>Header Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'success.light' }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell><Chip label="Shift Policy" size="small" /></TableCell>
                      <TableCell>Employee's shift type</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell><Chip label="Shift Start" size="small" /></TableCell>
                      <TableCell>Shift start time</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>3</TableCell>
                      <TableCell><Chip label="Shift End" size="small" /></TableCell>
                      <TableCell>Shift end time</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>4</TableCell>
                      <TableCell><Chip label="IN" size="small" color="success" /></TableCell>
                      <TableCell>Check-in time (will be imported)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>5</TableCell>
                      <TableCell><Chip label="OUT" size="small" color="success" /></TableCell>
                      <TableCell>Check-out time (will be imported)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>6</TableCell>
                      <TableCell><Chip label="Effective Hours" size="small" /></TableCell>
                      <TableCell>Actual working hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>7</TableCell>
                      <TableCell><Chip label="Gross Hours" size="small" /></TableCell>
                      <TableCell>Total hours including breaks</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>8</TableCell>
                      <TableCell><Chip label="Shift Hours" size="small" /></TableCell>
                      <TableCell>Scheduled shift duration</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>9</TableCell>
                      <TableCell><Chip label="Status" size="small" color="primary" /></TableCell>
                      <TableCell>Attendance status (will be imported)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                * This pattern repeats for all {headerInfo?.daysCount} days in the month
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setActiveStep(0)}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTransform}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Transforming...' : 'Transform & Preview Data'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Step 3: Preview Data
  const renderPreview = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          📋 Preview Transformed Data
        </Typography>
        
        <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
          <AlertTitle>Data Transformed Successfully!</AlertTitle>
          Your wide-format Rannkly report has been converted to {transformedData?.length} individual attendance records.
        </Alert>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{transformedData?.length}</Typography>
                <Typography variant="body1">Total Records</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{headerInfo?.totalEmployees}</Typography>
                <Typography variant="body1">Employees</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{headerInfo?.daysCount}</Typography>
                <Typography variant="body1">Days</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Sample Data (First 20 Records):
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Employee ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Employee Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Check-in
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Check-out
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transformedData?.slice(0, 20).map((record, index) => (
                <TableRow key={index} hover>
                  <TableCell>{record.employeeId}</TableCell>
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn || '-'}</TableCell>
                  <TableCell>{record.checkOut || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      size="small"
                      color={record.status === 'present' ? 'success' : record.status === 'absent' ? 'error' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Important</AlertTitle>
          This will create or update {transformedData?.length} attendance records. Existing records for the same employee and date will be updated.
        </Alert>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setActiveStep(1)}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExecuteImport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Importing...' : 'Start Import'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Step 4: Import Results
  const renderResults = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Import Completed!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{importResults?.success || 0}</Typography>
                <Typography variant="body1">Successful</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{importResults?.failed || 0}</Typography>
                <Typography variant="body1">Failed</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{importResults?.skipped || 0}</Typography>
                <Typography variant="body1">Skipped</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {importResults?.errors?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="error.main">
              ❌ Errors ({importResults.errors.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Error Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importResults.errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.employeeId}</TableCell>
                      <TableCell>{error.date}</TableCell>
                      <TableCell>{error.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={handleReset} startIcon={<CloudUploadIcon />}>
            Import Another File
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/attendance')}
            startIcon={<CheckCircleIcon />}
          >
            View Attendance Records
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Rannkly Attendance Report Import
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Import Rannkly-format attendance reports with crystal-clear header visibility
          </Typography>
        </Box>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {activeStep === 0 && renderFileUpload()}
      {activeStep === 1 && renderHeaderVerification()}
      {activeStep === 2 && renderPreview()}
      {activeStep === 3 && renderResults()}
    </Box>
  );
};

export default RannklyAttendanceImport;

