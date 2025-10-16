import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Grid,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { formatLateStatus } from '../utils/timeUtils';

const FaceDetectionAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);
  const [attendanceType, setAttendanceType] = useState('check-in'); // 'check-in' or 'check-out'
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize device info
  useEffect(() => {
    setDeviceInfo({
      userAgent: navigator.userAgent,
      browser: navigator.userAgent,
      os: navigator.platform,
      device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Tablet' : 'Desktop',
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for tablets
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or not available. Please ensure camera permissions are granted.');
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Capture image from video
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }, []);

  // Process face detection
  const processFaceDetection = useCallback(async (imageBlob) => {
    try {
      setIsDetecting(true);
      setError(null);

      const formData = new FormData();
      formData.append('faceImage', imageBlob, 'face-capture.jpg');
      formData.append('deviceInfo', JSON.stringify(deviceInfo));
      formData.append('location', JSON.stringify({
        address: 'Office Location (Face Detection)',
        method: 'face-detection',
        timestamp: new Date().toISOString()
      }));

      const endpoint = attendanceType === 'check-in' 
        ? '/api/face-detection/verify-and-checkin'
        : '/api/face-detection/verify-and-checkout';

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setDetectionResult(response.data);
        setShowSuccessDialog(true);
        stopCamera();
      } else {
        setError(response.data.message || 'Face detection failed');
        setShowErrorDialog(true);
      }
    } catch (err) {
      console.error('Face detection error:', err);
      const errorMessage = err.response?.data?.message || 'Face detection failed. Please try again.';
      setError(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setIsDetecting(false);
    }
  }, [attendanceType, deviceInfo, stopCamera]);

  // Handle attendance action
  const handleAttendanceAction = useCallback(async () => {
    try {
      const imageBlob = await captureImage();
      if (!imageBlob) {
        setError('Failed to capture image. Please try again.');
        return;
      }

      setCapturedImage(URL.createObjectURL(imageBlob));
      await processFaceDetection(imageBlob);
    } catch (err) {
      console.error('Error processing attendance:', err);
      setError('Failed to process attendance. Please try again.');
    }
  }, [captureImage, processFaceDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-start camera on component mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const getStatusColor = (type) => {
    return type === 'check-in' ? 'primary' : 'secondary';
  };

  const getStatusIcon = (type) => {
    return type === 'check-in' ? '📥' : '📤';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper sx={{ 
        maxWidth: 800, 
        width: '100%', 
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {getStatusIcon(attendanceType)} Face Detection Attendance
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {attendanceType === 'check-in' ? 'Check In' : 'Check Out'} - {moment().format('dddd, MMMM Do YYYY')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            {moment().format('HH:mm:ss')}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Attendance Type Toggle */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant={attendanceType === 'check-in' ? 'contained' : 'outlined'}
                  color="primary"
                  size="large"
                  onClick={() => setAttendanceType('check-in')}
                  startIcon={<CheckCircleIcon />}
                  sx={{ minWidth: 150 }}
                >
                  Check In
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={attendanceType === 'check-out' ? 'contained' : 'outlined'}
                  color="secondary"
                  size="large"
                  onClick={() => setAttendanceType('check-out')}
                  startIcon={<TimeIcon />}
                  sx={{ minWidth: 150 }}
                >
                  Check Out
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Camera Section */}
          <Box sx={{ mb: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Starting Camera...
                </Typography>
              </Box>
            )}

            {cameraStream && !isLoading && (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  position: 'relative',
                  display: 'inline-block',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '4px solid #667eea',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      maxWidth: 640,
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  {isDetecting && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                      <Typography variant="h6">
                        Detecting Face...
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Please wait while we verify your identity
                      </Typography>
                    </Box>
                  )}
                </Box>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    color={getStatusColor(attendanceType)}
                    onClick={handleAttendanceAction}
                    disabled={isDetecting}
                    startIcon={<CameraIcon />}
                    sx={{ 
                      minWidth: 200,
                      height: 60,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      borderRadius: 3
                    }}
                  >
                    {isDetecting ? 'Processing...' : `${attendanceType === 'check-in' ? 'Check In' : 'Check Out'} Now`}
                  </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={startCamera}
                    startIcon={<RefreshIcon />}
                    size="small"
                  >
                    Restart Camera
                  </Button>
                </Box>
              </Box>
            )}

            {!cameraStream && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CameraIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Camera Not Available
                </Typography>
                <Button
                  variant="contained"
                  onClick={startCamera}
                  startIcon={<CameraIcon />}
                >
                  Start Camera
                </Button>
              </Box>
            )}
          </Box>

          {/* Instructions */}
          <Box sx={{ 
            bgcolor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: 2,
            p: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Instructions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              1. Position your face clearly in the camera view
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              2. Ensure good lighting on your face
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              3. Look directly at the camera
            </Typography>
            <Typography variant="body2">
              4. Tap the "{attendanceType === 'check-in' ? 'Check In' : 'Check Out'} Now" button
            </Typography>
          </Box>
        </CardContent>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: 'success.main',
              width: 60,
              height: 60
            }}>
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {attendanceType === 'check-in' ? 'Check In' : 'Check Out'} Successful!
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
          {detectionResult && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  width: 50,
                  height: 50
                }}>
                  <PersonIcon />
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {detectionResult.employee?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detectionResult.employee?.employeeId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detectionResult.employee?.department}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                p: 2,
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {attendanceType === 'check-in' ? 'Check In' : 'Check Out'} Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body1">
                    Time: {detectionResult.checkInTime || detectionResult.checkOutTime}
                  </Typography>
                </Box>
                {detectionResult.isLate && (
                  <Chip
                    label={formatLateStatus(detectionResult.lateMinutes)}
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
                {detectionResult.totalHours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                    <TimeIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      Total Hours: {detectionResult.workingHours}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary">
                Have a great {attendanceType === 'check-in' ? 'day' : 'evening'}!
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowSuccessDialog(false);
              setDetectionResult(null);
              setCapturedImage(null);
              startCamera();
            }}
            size="large"
            sx={{ minWidth: 150 }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: 'error.main',
              width: 60,
              height: 60
            }}>
              <ErrorIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Face Not Recognized
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {error || 'We could not recognize your face. Please try again or contact HR to register your face.'}
          </Typography>
          
          <Box sx={{ 
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: 2,
            p: 2
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Troubleshooting Tips:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Ensure your face is clearly visible
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Check lighting conditions
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Remove glasses or hat if possible
            </Typography>
            <Typography variant="body2">
              • Contact HR if you haven't registered your face
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowErrorDialog(false)}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowErrorDialog(false);
              setError(null);
              startCamera();
            }}
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FaceDetectionAttendance;

