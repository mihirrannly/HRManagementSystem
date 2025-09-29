import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Button,
  Chip,
  Paper
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Wifi as WifiIcon,
  Computer as ComputerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const LocationValidator = ({ onLocationValidated, onValidationError }) => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    location: null,
    ip: null,
    overall: false
  });

  // Office configuration (should match server-side config)
  const OFFICE_CONFIG = {
    latitude: 28.6139, // Delhi coordinates - should be configurable
    longitude: 77.2090,
    radius: 200 // 200 meters
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(coords);
        validateLocation(coords);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const validateLocation = (coords) => {
    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      OFFICE_CONFIG.latitude,
      OFFICE_CONFIG.longitude
    );

    const isValidLocation = distance <= OFFICE_CONFIG.radius;
    
    const newValidation = {
      location: {
        valid: isValidLocation,
        distance: Math.round(distance),
        accuracy: Math.round(coords.accuracy)
      },
      ip: null, // Will be validated on server side
      overall: isValidLocation
    };

    setValidation(newValidation);

    // Prepare location data for parent component
    const locationData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`,
      validation: newValidation
    };

    if (isValidLocation) {
      onLocationValidated?.(locationData);
    } else {
      onValidationError?.(`You are ${Math.round(distance)}m away from office. Please move closer to the office premises.`);
    }
  };

  const getLocationStatusColor = () => {
    if (loading) return 'info';
    if (locationError) return 'error';
    if (validation.location?.valid) return 'success';
    return 'error';
  };

  const getLocationStatusText = () => {
    if (loading) return 'Getting location...';
    if (locationError) return 'Location unavailable';
    if (validation.location?.valid) return 'Valid office location';
    if (validation.location) return `${validation.location.distance}m from office`;
    return 'Location not checked';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon />
        Location Validation
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Getting your location...</Typography>
        </Box>
      )}

      {locationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationError}
          <Button 
            size="small" 
            onClick={getCurrentLocation}
            sx={{ ml: 1 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {!loading && !locationError && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<LocationIcon />}
              label={getLocationStatusText()}
              color={getLocationStatusColor()}
              variant={validation.location?.valid ? 'filled' : 'outlined'}
            />
            
            <Chip
              icon={<ComputerIcon />}
              label="IP Validation (Server-side)"
              color="info"
              variant="outlined"
            />
          </Box>

          {location && (
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              <Typography variant="body2">
                Current Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Typography>
              <Typography variant="body2">
                Accuracy: ±{Math.round(location.accuracy)}m
              </Typography>
              {validation.location && (
                <Typography variant="body2">
                  Distance from office: {validation.location.distance}m 
                  (Allowed: {OFFICE_CONFIG.radius}m)
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {validation.overall ? (
        <Alert severity="success" icon={<CheckIcon />}>
          Location validated successfully. You can proceed with attendance marking.
        </Alert>
      ) : location && !loading ? (
        <Alert severity="error" icon={<ErrorIcon />}>
          You are not within the office premises. Please move closer to the office to mark attendance.
          {validation.location && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              You need to be within {OFFICE_CONFIG.radius}m of the office location.
            </Typography>
          )}
        </Alert>
      ) : null}

      {!location && !loading && !locationError && (
        <Button 
          variant="contained" 
          onClick={getCurrentLocation}
          startIcon={<LocationIcon />}
        >
          Get Location
        </Button>
      )}
    </Paper>
  );
};

export default LocationValidator;
