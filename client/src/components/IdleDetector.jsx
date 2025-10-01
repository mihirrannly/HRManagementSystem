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
  const IDLE_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning before auto checkout
  const COUNTDOWN_TIME = 5 * 60 * 1000; // 5 minutes total warning time

  // Events to track for activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  // Helper function to check if it's lunch time (2 PM to 3 PM)
  const isLunchTime = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const lunchStartMinutes = 14 * 60; // 2 PM = 14:00
    const lunchEndMinutes = 15 * 60;   // 3 PM = 15:00
    
    return currentTimeInMinutes >= lunchStartMinutes && currentTimeInMinutes < lunchEndMinutes;
  }, []);

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
    console.log('Auto checkout triggered');
    
    // Check if it's lunch time (2 PM to 3 PM) - don't auto checkout during lunch
    if (isLunchTime()) {
      console.log('Lunch time detected, skipping auto checkout');
      toast.info('Lunch time detected (2 PM - 3 PM). Auto checkout skipped.');
      
      // Reset timer to check again after lunch time
      resetTimer();
      return;
    }
    
    // Clear all timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    try {
      // Perform automatic checkout
      const response = await axios.post('/api/attendance/auto-checkout');
      
      if (response.data.success) {
        // Record idle session with auto checkout
        if (idleStartTime) {
          await recordIdleSession(idleStartTime, new Date(), 'auto_checkout', true, true);
        }

        // Show success notification
        toast.success('You have been automatically checked out due to inactivity');
        
        // Trigger callback if provided
        if (onIdleSession) {
          onIdleSession({
            type: 'auto_checkout',
            startTime: idleStartTime,
            endTime: new Date(),
            duration: Math.floor((Date.now() - idleStartTime.getTime()) / 1000 / 60), // minutes
            checkoutTime: response.data.checkOutTime,
            totalHours: response.data.totalHours
          });
        }
      } else {
        // If auto checkout failed, show error and reset timer
        toast.error(response.data.message || 'Auto checkout failed');
        resetTimer();
        return;
      }
    } catch (error) {
      console.error('Auto checkout failed:', error);
      toast.error('Auto checkout failed. Please check out manually.');
      resetTimer();
      return;
    }

    // Reset states
    setIsIdle(false);
    setShowWarning(false);
    setCountdown(0);
    setIdleStartTime(null);

  }, [idleStartTime, onIdleSession, resetTimer, isLunchTime]);

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
    
    // Check if it's lunch time (2 PM to 3 PM)
    if (isLunchTime()) {
      toast.info('Lunch time detected (2 PM - 3 PM). Auto checkout is disabled during this time.');
    }
    
    // Record the idle session as resolved
    if (idleStartTime) {
      recordIdleSession(idleStartTime, new Date(), 'user_confirmed_working', true, false);
    }

    // Reset everything
    resetTimer();
  };

  const handleTakeBreak = () => {
    console.log('User taking a break');
    
    // Check if it's lunch time (2 PM to 3 PM)
    if (isLunchTime()) {
      toast.info('Lunch time detected (2 PM - 3 PM). Enjoy your lunch!');
    }
    
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
            You've been idle for over 30 minutes. Please confirm you're still working.
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            You will be automatically checked out in:
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
            <br />
            <strong>Note:</strong> Auto checkout is disabled during lunch time (2 PM - 3 PM).
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
          <div>Timeout: 30 min</div>
        </Box>
      )}
    </>
  );
};

export default IdleDetector;
