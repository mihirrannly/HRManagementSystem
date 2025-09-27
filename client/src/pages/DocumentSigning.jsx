import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Divider,
  Stack,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Assignment as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import DigitalSignature from '../components/DigitalSignature';

const DocumentSigning = () => {
  const { documentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [recipientInfo, setRecipientInfo] = useState({
    name: '',
    email: '',
    title: '',
    company: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const steps = ['Review Document', 'Verify Identity', 'Sign Document', 'Complete'];

  useEffect(() => {
    fetchDocument();
  }, [documentId, token]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/esignature/sign/${documentId}?token=${token}`);
      
      if (response.data.success) {
        setDocument(response.data.document);
        
        // Pre-fill recipient info if available
        const currentRecipient = response.data.document.recipients.find(r => 
          token && response.data.document.customFields?.some(
            field => field.name === `signing_token_${r.email}` && field.value === token
          )
        );
        
        if (currentRecipient) {
          setRecipientInfo(prev => ({
            ...prev,
            name: currentRecipient.name,
            email: currentRecipient.email
          }));
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError(error.response?.data?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignatureComplete = (signature) => {
    setSignatureData(signature);
    handleNext(); // Move to completion step
  };

  const handleSubmitSignature = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await axios.post(`/esignature/documents/${documentId}/sign`, {
        signatureData,
        recipientInfo,
        token
      });
      
      if (response.data.success) {
        toast.success('Document signed successfully!');
        setCurrentStep(3); // Move to completion step
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error(error.response?.data?.message || 'Failed to sign document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineDocument = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await axios.post(`/esignature/documents/${documentId}/decline`, {
        reason: declineReason,
        recipientInfo,
        token
      });
      
      if (response.data.success) {
        toast.info('Document declined');
        setDeclineDialogOpen(false);
        setError('You have declined to sign this document.');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error declining document:', error);
      toast.error(error.response?.data?.message || 'Failed to decline document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'docusign':
        return <BusinessIcon />;
      case 'dropbox_sign':
        return <CloudUploadIcon />;
      case 'internal':
      default:
        return <SecurityIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading document...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Unable to load document
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Document not found or no longer available for signing.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <DocumentIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Document Signature Request
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {document.title}
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              <Typography variant="body2">
                Expires: {new Date(document.expiresAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getProviderIcon(document.provider)}
              <Typography variant="body2">
                Provider: {document.provider.replace('_', ' ').toUpperCase()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper sx={{ p: 4, mb: 4 }}>
        {/* Step 0: Review Document */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Review Document
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please review the document carefully before proceeding to sign.
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={document.title}
                subheader={document.description}
                avatar={<DocumentIcon color="primary" />}
              />
              <CardContent>
                {document.templateContent && (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    backgroundColor: '#f9f9f9',
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {document.templateContent}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                By proceeding, you acknowledge that you have read and understood this document.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeclineDialogOpen(true)}
                startIcon={<CancelIcon />}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                startIcon={<ViewIcon />}
              >
                Continue to Sign
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 1: Verify Identity */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Verify Your Identity
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please confirm your details before signing the document.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={recipientInfo.name}
                  onChange={(e) => setRecipientInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={recipientInfo.email}
                  onChange={(e) => setRecipientInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title/Position"
                  value={recipientInfo.title}
                  onChange={(e) => setRecipientInfo(prev => ({ ...prev, title: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={recipientInfo.company}
                  onChange={(e) => setRecipientInfo(prev => ({ ...prev, company: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!recipientInfo.name || !recipientInfo.email}
              >
                Proceed to Sign
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Sign Document */}
        {currentStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Sign Document
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please provide your digital signature below.
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                  }
                  label="I have read and agree to the terms and conditions in this document"
                />
              </CardContent>
            </Card>

            <DigitalSignature
              onSignatureComplete={handleSignatureComplete}
              candidateName={recipientInfo.name}
              disabled={!agreedToTerms}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitSignature}
                disabled={!signatureData || !agreedToTerms || isSubmitting}
                startIcon={<CheckCircleIcon />}
              >
                {isSubmitting ? 'Signing...' : 'Sign Document'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Complete */}
        {currentStep === 3 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Document Signed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Thank you for signing the document. You will receive a confirmation email shortly.
            </Typography>
            
            <Card sx={{ mt: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Signature Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Signed by: {recipientInfo.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email: {recipientInfo.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date().toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      IP Address: {window.location.hostname}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="success" sx={{ mb: 3 }}>
              Your signature has been recorded and the document is now legally binding.
            </Alert>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => window.print()}
            >
              Print Confirmation
            </Button>
          </Box>
        )}
      </Paper>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onClose={() => setDeclineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Decline to Sign Document</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to decline signing this document?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for declining (optional)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeclineDocument}
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Declining...' : 'Decline Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentSigning;
