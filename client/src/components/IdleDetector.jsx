import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const IdleDetector = ({ isActive = true, onIdleSession }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [idleStartTime, setIdleStartTime] = useState(null);
  
  const idleTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Configuration
  const IDLE_TIME = 60 * 60 * 1000; // 60 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before auto logout
  const COUNTDOWN_TIME = 10 * 60 * 1000; // 10 minutes total warning time

  // Events to track for activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const resetTimer = useCallback(() => {
    if (!isActive) return;

    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Reset states
    setIsIdle(false);
    setShowWarning(false);
    setCountdown(0);

    // If there was an idle session, record it
    if (idleStartTime) {
      recordIdleSession(idleStartTime, new Date(), 'activity_resumed');
      setIdleStartTime(null);
    }

    // Set new idle timer
    idleTimeoutRef.current = setTimeout(() => {
      handleIdleStart();
    }, IDLE_TIME);

  }, [isActive, idleStartTime]);

  const handleIdleStart = useCallback(() => {
    console.log('User went idle');
    setIsIdle(true);
    setIdleStartTime(new Date());
    
    // Show warning after idle detection
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(COUNTDOWN_TIME / 1000); // Convert to seconds
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleAutoLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    }, WARNING_TIME);
  }, []);

  const handleAutoLogout = useCallback(async () => {
    console.log('Auto logout triggered');
    
    // Clear all timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Record idle session with auto logout
    if (idleStartTime) {
      await recordIdleSession(idleStartTime, new Date(), 'auto_logout', true, true);
    }

    // Reset states
    setIsIdle(false);
    setShowWarning(false);
    setCountdown(0);
    setIdleStartTime(null);

    // Show notification
    toast.warning('You have been automatically logged out due to inactivity');
    
    // Trigger callback if provided
    if (onIdleSession) {
      onIdleSession({
        type: 'auto_logout',
        startTime: idleStartTime,
        endTime: new Date(),
        duration: Math.floor((Date.now() - idleStartTime.getTime()) / 1000 / 60) // minutes
      });
    }

    // Optionally redirect to login or show logout confirmation
    // window.location.href = '/login';
  }, [idleStartTime, onIdleSession]);

  const recordIdleSession = async (startTime, endTime, reason, wasWarned = false, autoLogout = false) => {
    try {
      await axios.post('/attendance/idle-session', {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason,
        wasWarned,
        autoLogout
      });
    } catch (error) {
      console.error('Failed to record idle session:', error);
    }
  };

  const handleStillWorking = () => {
    console.log('User confirmed still working');
    
    // Record the idle session as resolved
    if (idleStartTime) {
      recordIdleSession(idleStartTime, new Date(), 'user_confirmed_working', true, false);
    }

    // Reset everything
    resetTimer();
  };

  const handleTakeBreak = () => {
    console.log('User taking a break');
    
    // Record the idle session as intentional break
    if (idleStartTime) {
      recordIdleSession(idleStartTime, new Date(), 'intentional_break', true, false);
    }

    // Reset states but don't start timer (user is on break)
    setIsIdle(false);
    setShowWarning(false);
    setCountdown(0);
    setIdleStartTime(null);
    
    // Clear timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    toast.info('Break time recorded. Move your mouse or click to resume work tracking.');
  };

  // Set up event listeners
  useEffect(() => {
    if (!isActive) return;

    const handleActivity = () => resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isActive, resetTimer]);

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <>
      {/* Idle Warning Dialog */}
      <Dialog
        open={showWarning}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'warning.light',
            color: 'warning.contrastText'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          Idle Time Detected
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You've been idle for over an hour. Please confirm you're still working.
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            You will be automatically logged out in:
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <Typography variant="h4" color="error">
              {formatTime(countdown)}
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={(1 - countdown / (COUNTDOWN_TIME / 1000)) * 100}
                color="error"
              />
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Your idle time will be recorded for attendance tracking purposes.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleTakeBreak}
            variant="outlined"
            color="inherit"
          >
            I'm on Break
          </Button>
          <Button
            onClick={handleStillWorking}
            variant="contained"
            color="primary"
            autoFocus
          >
            I'm Still Working
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
            fontSize: '0.75rem',
            opacity: 0.7,
            zIndex: 1000
          }}
        >
          <div>Idle Detector: {isActive ? 'Active' : 'Inactive'}</div>
          <div>Is Idle: {isIdle ? 'Yes' : 'No'}</div>
          <div>Show Warning: {showWarning ? 'Yes' : 'No'}</div>
          {countdown > 0 && <div>Countdown: {formatTime(countdown)}</div>}
        </Box>
      )}
    </>
  );
};

export default IdleDetector;
