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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  FileUpload as FileUploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const steps = ['Upload File', 'Map Columns', 'Preview & Confirm', 'Import Results'];

const AttendanceImport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: '',
  });
  const [importResults, setImportResults] = useState(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(fileExtension)) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Upload and preview file
  const handleUploadAndPreview = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/attendance/import/preview`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFileInfo(response.data.fileInfo);
        setHeaders(response.data.headers);
        setDataRows(response.data.dataRows);

        // Auto-map columns based on suggestions
        const suggested = response.data.suggestedMapping;
        setColumnMapping({
          employeeId: suggested.employeeId || '',
          date: suggested.date || '',
          checkIn: suggested.checkIn || '',
          checkOut: suggested.checkOut || '',
          status: suggested.status || '',
        });

        toast.success('File uploaded successfully! Please verify column mappings.');
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  // Validate column mapping
  const validateMapping = () => {
    if (!columnMapping.employeeId || !columnMapping.date) {
      toast.error('Employee ID and Date columns are required');
      return false;
    }
    return true;
  };

  // Move to preview step
  const handleMappingConfirm = () => {
    if (validateMapping()) {
      setActiveStep(2);
    }
  };

  // Execute import
  const handleExecuteImport = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/attendance/import/execute`,
        {
          filePath: fileInfo.path,
          columnMapping: columnMapping,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setImportResults(response.data.results);
        toast.success(response.data.message);
        setActiveStep(3);
      }
    } catch (error) {
      console.error('Error executing import:', error);
      toast.error(error.response?.data?.message || 'Error importing attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Reset and start over
  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setFileInfo(null);
    setHeaders([]);
    setDataRows([]);
    setColumnMapping({
      employeeId: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: '',
    });
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
              Upload Attendance Data
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your Excel file (.xlsx or .xls) containing attendance data.
              The file should contain columns for Employee ID, Date, Check-in Time, Check-out Time, and Status.
            </Typography>

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
                sx={{ mt: 2 }}
              >
                Select File
              </Button>
            </label>

            {selectedFile && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" icon={<InfoIcon />}>
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
                onClick={handleUploadAndPreview}
                disabled={!selectedFile || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {loading ? 'Uploading...' : 'Upload & Preview'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Expected Format
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Employee ID"
                    secondary="Required - Employee's unique ID"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date"
                    secondary="Required - Attendance date"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Check-in Time"
                    secondary="Optional - Entry time"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Check-out Time"
                    secondary="Optional - Exit time"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary="Optional - present/absent/late"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Tips
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" paragraph>
                • Use consistent date format (YYYY-MM-DD recommended)
              </Typography>
              <Typography variant="body2" paragraph>
                • Time format: HH:MM or HH:MM:SS
              </Typography>
              <Typography variant="body2" paragraph>
                • Employee IDs must match existing records
              </Typography>
              <Typography variant="body2">
                • File size limit: 10MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Step 2: Column Mapping
  const renderColumnMapping = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Map Your Excel Columns
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We've detected your column headers. Please verify or adjust the mapping below:
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Employee ID Column</InputLabel>
              <Select
                value={columnMapping.employeeId}
                onChange={(e) => setColumnMapping({ ...columnMapping, employeeId: e.target.value })}
                label="Employee ID Column"
              >
                <MenuItem value="">
                  <em>Select Column</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Date Column</InputLabel>
              <Select
                value={columnMapping.date}
                onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                label="Date Column"
              >
                <MenuItem value="">
                  <em>Select Column</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Check-in Time Column</InputLabel>
              <Select
                value={columnMapping.checkIn}
                onChange={(e) => setColumnMapping({ ...columnMapping, checkIn: e.target.value })}
                label="Check-in Time Column"
              >
                <MenuItem value="">
                  <em>None / Not Applicable</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Check-out Time Column</InputLabel>
              <Select
                value={columnMapping.checkOut}
                onChange={(e) => setColumnMapping({ ...columnMapping, checkOut: e.target.value })}
                label="Check-out Time Column"
              >
                <MenuItem value="">
                  <em>None / Not Applicable</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status Column</InputLabel>
              <Select
                value={columnMapping.status}
                onChange={(e) => setColumnMapping({ ...columnMapping, status: e.target.value })}
                label="Status Column"
              >
                <MenuItem value="">
                  <em>None / Not Applicable</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Preview Data with Selected Mapping */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Data Preview (First 10 Rows)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                    Row #
                  </TableCell>
                  {headers.map((header, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: Object.values(columnMapping).includes(header)
                          ? 'success.light'
                          : 'grey.200',
                        color: Object.values(columnMapping).includes(header) ? 'white' : 'text.primary',
                      }}
                    >
                      {header}
                      {Object.values(columnMapping).includes(header) && (
                        <Chip
                          label="Mapped"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} hover>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell?.toString() || '-'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setActiveStep(0)}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMappingConfirm}
            disabled={!columnMapping.employeeId || !columnMapping.date}
          >
            Continue to Preview
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Step 3: Preview & Confirm
  const renderPreviewConfirm = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Review Import Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please review the settings below before importing:
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  📄 File Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  <strong>File Name:</strong> {fileInfo?.originalName}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Rows:</strong> {fileInfo?.totalRows}
                </Typography>
                <Typography variant="body2">
                  <strong>Uploaded At:</strong> {new Date(fileInfo?.uploadedAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  🗺️ Column Mapping
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  <strong>Employee ID:</strong> {columnMapping.employeeId}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {columnMapping.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Check-in:</strong> {columnMapping.checkIn || 'Not mapped'}
                </Typography>
                <Typography variant="body2">
                  <strong>Check-out:</strong> {columnMapping.checkOut || 'Not mapped'}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {columnMapping.status || 'Not mapped'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle>Important</AlertTitle>
          This will create or update attendance records for {fileInfo?.totalRows} rows. Existing
          records for the same employee and date will be updated. This action cannot be easily undone.
        </Alert>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => setActiveStep(1)}>
            Back to Mapping
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
  const renderImportResults = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Import Completed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your attendance data has been imported successfully.
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

        {/* Created Records */}
        {importResults?.created?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              ✅ Created Records ({importResults.created.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importResults.created.slice(0, 100).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Chip label={record.status} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Updated Records */}
        {importResults?.updated?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="info.main">
              🔄 Updated Records ({importResults.updated.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importResults.updated.slice(0, 100).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Chip label={record.status} size="small" color="info" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Error Details */}
        {importResults?.errors?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="error.main">
              ❌ Errors ({importResults.errors.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Row #</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Error Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importResults.errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell>{error.employeeId || '-'}</TableCell>
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
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            Import Attendance Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload month-wise Excel files to import attendance records for all employees
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Step Content */}
      {activeStep === 0 && renderFileUpload()}
      {activeStep === 1 && renderColumnMapping()}
      {activeStep === 2 && renderPreviewConfirm()}
      {activeStep === 3 && renderImportResults()}
    </Box>
  );
};

export default AttendanceImport;

