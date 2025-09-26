import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const DigitalSignature = ({ 
  onSignatureComplete, 
  candidateName, 
  disabled = false,
  existingSignature = null 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [signatureType, setSignatureType] = useState('draw'); // 'draw' or 'type'
  const [typedSignature, setTypedSignature] = useState(candidateName || '');
  const [hasSignature, setHasSignature] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (existingSignature) {
      setSignatureData(existingSignature);
      setHasSignature(true);
    }
  }, [existingSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save signature data
    const canvas = canvasRef.current;
    const signatureDataURL = canvas.toDataURL();
    setSignatureData(signatureDataURL);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
    setHasSignature(false);
  };

  const generateTypedSignature = () => {
    if (!typedSignature.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set font style for signature
    ctx.font = '32px Brush Script MT, cursive';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the typed signature
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
    
    // Save signature data
    const signatureDataURL = canvas.toDataURL();
    setSignatureData(signatureDataURL);
    setHasSignature(true);
  };

  const handleSaveSignature = () => {
    if (!hasSignature) {
      alert('Please provide your signature first.');
      return;
    }

    const signatureInfo = {
      type: signatureType,
      data: signatureData,
      name: signatureType === 'type' ? typedSignature : candidateName,
      timestamp: new Date().toISOString(),
      method: signatureType === 'draw' ? 'Digital Drawing' : 'Typed Signature'
    };

    onSignatureComplete(signatureInfo);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Digital Signature
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        By signing below, you acknowledge that you have read and agree to all terms and conditions in this offer letter.
      </Alert>

      {/* Signature Type Selection */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={signatureType === 'draw'}
              onChange={() => setSignatureType('draw')}
              disabled={disabled}
            />
          }
          label="Draw Signature"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={signatureType === 'type'}
              onChange={() => setSignatureType('type')}
              disabled={disabled}
            />
          }
          label="Type Signature"
        />
      </Stack>

      {/* Typed Signature Input */}
      {signatureType === 'type' && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Type your full name"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            disabled={disabled}
            helperText="This will be converted to a signature style"
          />
          <Button
            variant="outlined"
            onClick={generateTypedSignature}
            disabled={!typedSignature.trim() || disabled}
            sx={{ mt: 1 }}
          >
            Generate Signature
          </Button>
        </Box>
      )}

      {/* Drawing Canvas */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          border: hasSignature ? '2px solid #4caf50' : '2px dashed #ccc',
          cursor: signatureType === 'draw' && !disabled ? 'crosshair' : 'default'
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {signatureType === 'draw' 
            ? 'Draw your signature in the box below:' 
            : 'Your typed signature will appear here:'
          }
        </Typography>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          style={{ 
            width: '100%', 
            height: '150px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
          onMouseDown={signatureType === 'draw' ? startDrawing : undefined}
          onMouseMove={signatureType === 'draw' ? draw : undefined}
          onMouseUp={signatureType === 'draw' ? stopDrawing : undefined}
          onMouseLeave={signatureType === 'draw' ? stopDrawing : undefined}
        />
      </Paper>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={clearSignature}
          disabled={!hasSignature || disabled}
        >
          Clear
        </Button>
        
        {hasSignature && (
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
        )}
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSignature}
          disabled={!hasSignature || disabled}
          color="success"
        >
          Accept & Sign Offer
        </Button>
      </Stack>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Signature Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your digital signature:
            </Typography>
            {signatureData && (
              <img 
                src={signatureData} 
                alt="Digital Signature" 
                style={{ 
                  maxWidth: '100%', 
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#fafafa'
                }} 
              />
            )}
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Signed by:</strong> {signatureType === 'type' ? typedSignature : candidateName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Method: {signatureType === 'draw' ? 'Digital Drawing' : 'Typed Signature'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalSignature;
