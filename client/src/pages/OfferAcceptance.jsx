import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import DigitalSignature from '../components/DigitalSignature';

const OfferAcceptance = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [digitalSignature, setDigitalSignature] = useState(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchOfferDetails();
  }, [token]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/onboarding/offer-acceptance/${token}`);
      setOfferData(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching offer details:', error);
      setError('Offer not found or expired. Please contact HR for assistance.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!digitalSignature) {
      toast.error('Please provide your digital signature to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/onboarding/offer-acceptance/${token}/accept`, {
        candidateSignature: digitalSignature,
        acceptanceComments: comments
      });
      
      toast.success('🎉 Congratulations! Offer accepted successfully!');
      setAcceptDialogOpen(false);
      
      // Refresh data to show updated status
      await fetchOfferDetails();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignatureComplete = (signatureInfo) => {
    setDigitalSignature(signatureInfo);
    setAcceptDialogOpen(true);
  };

  const handleRejectOffer = async () => {
    try {
      setSubmitting(true);
      await axios.post(`/onboarding/offer-acceptance/${token}/reject`, {
        rejectionReason: rejectionReason
      });
      
      toast.success('Offer rejection submitted successfully.');
      setRejectDialogOpen(false);
      
      // Refresh data to show updated status
      await fetchOfferDetails();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading offer details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Homepage
        </Button>
      </Container>
    );
  }

  if (!offerData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          No offer data available.
        </Alert>
      </Container>
    );
  }

  const isOfferAccepted = offerData.status === 'offer_accepted';
  const isOfferRejected = offerData.status === 'offer_rejected';
  const canTakeAction = offerData.status === 'offer_sent';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Job Offer Letter
        </Typography>
        <Typography variant="h6">
          Welcome to our team, {offerData.employeeName}!
        </Typography>
        
        {isOfferAccepted && (
          <Chip
            icon={<CheckCircleIcon />}
            label="Offer Accepted"
            color="success"
            sx={{ mt: 2, bgcolor: 'rgba(76, 175, 80, 0.2)', color: 'white' }}
          />
        )}
        
        {isOfferRejected && (
          <Chip
            icon={<CancelIcon />}
            label="Offer Declined"
            color="error"
            sx={{ mt: 2, bgcolor: 'rgba(244, 67, 54, 0.2)', color: 'white' }}
          />
        )}
      </Paper>

      {/* Offer Details */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon />
          Offer Details
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Position</Typography>
                    <Typography variant="h6">{offerData.position}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography variant="h6">{offerData.department}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="h6">
                      {moment(offerData.startDate).format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                {offerData.offerLetter?.salary && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" color="primary">₹</Typography>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Annual Salary</Typography>
                      <Typography variant="h6">₹{offerData.offerLetter.salary.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                )}
                
                {offerData.offerLetter?.workLocation && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Work Location</Typography>
                      <Typography variant="h6">{offerData.offerLetter.workLocation}</Typography>
                    </Box>
                  </Box>
                )}
                
                {offerData.offerLetter?.employmentType && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Employment Type</Typography>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {offerData.offerLetter.employmentType.replace('_', ' ')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Benefits */}
        {offerData.offerLetter?.benefits && offerData.offerLetter.benefits.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Benefits & Perks</Typography>
            <List>
              {offerData.offerLetter.benefits.map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Terms & Conditions */}
        {offerData.offerLetter?.terms && offerData.offerLetter.terms.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Terms & Conditions</Typography>
            <List>
              {offerData.offerLetter.terms.map((term, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${index + 1}. ${term}`}
                    sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      {/* Full Offer Letter */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            Complete Offer Letter
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ minWidth: 120 }}
          >
            Print/Save
          </Button>
        </Box>
        
        {/* Codervalue Solutions Format */}
        <Box sx={{ 
          border: '2px solid #e0e0e0', 
          borderRadius: 2, 
          p: 4, 
          bgcolor: 'white',
          fontFamily: 'Times, serif',
          fontSize: '14px',
          lineHeight: 1.6,
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {/* Company Header */}
          <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #2e7d32', pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32', fontFamily: 'Times, serif' }}>
              CODERVALUE SOLUTIONS PRIVATE LIMITED
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'Times, serif' }}>
              Office 303, 3rd Floor, H-47, USIS BIZPARK, Sector 63, Gautam Buddha Nagar, Noida, Uttar Pradesh, 201309
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Times, serif' }}>
              CIN Number: U72900UP2021PTC141154
            </Typography>
          </Box>

          {/* Date and Salutation */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 2 }}>
              <strong>Dated:</strong> {moment().format('Do MMMM, YYYY')}
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 2 }}>
              <strong>Dear {offerData.employeeName},</strong>
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 2 }}>
              We are pleased to extend our offer of employment to you for the position of <strong>{offerData.position}</strong> with Codervalue Solutions Pvt. Ltd. We extend this offer, and the opportunity it represents, with great confidence in your abilities.
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 3 }}>
              We would like you to join us by <strong>{moment(offerData.startDate).format('Do MMMM YYYY')}</strong>.
            </Typography>
          </Box>

          {/* Terms & Conditions */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Times, serif' }}>
            Terms & Conditions of Your Employment:
          </Typography>

          {/* Compensation Package */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Compensation Package:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 2, textAlign: 'justify' }}>
            Your Total Annual Cost to the Company will be Rs {offerData.offerLetter?.salary?.toLocaleString() || '10,00,000'} ({/* Add number to words conversion here */} per annum Only). Your individual remuneration is purely a matter between yourself and the company and has arrived based on your job, skills specific background and professional merit. We expect you to maintain this information and any changes made therein from time to time as personal and highly confidential.
          </Typography>

          {/* Probation & Termination */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Probation & Termination:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 2, textAlign: 'justify' }}>
            Probation period is during the first 3 months of your employment. This period is subject to extension if you are found to be low-performing/not delivering. During the probation period you may terminate this agreement by giving 30 days' notice. After satisfactory completion of the probationary period, the service may be terminated by giving three month notice period or salary and fixed allowances (if any) in lieu thereof. However, in the event of your being guilty of misconduct or inattention or negligence in the discharge of your duties or in the conduct of the Company's business, or such misdemeanour which is likely to affect, or affects the reputation of the Company's working or of any breach of the terms and conditions herein, the Company reserves its right to terminate your services at any given point of time, with immediate effect, without any compensation or notice.
          </Typography>

          {/* Confidentiality */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Confidentiality:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 2, textAlign: 'justify' }}>
            You will treat matters pertaining to the Company's business interests with utmost confidentiality and such confidentiality has to be maintained during your employment with the Company and thereafter.
          </Typography>

          {/* Non-Compete */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Non-Compete:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 2, textAlign: 'justify' }}>
            You agree that you will under no circumstances during your employment with Codervalue Solutions Pvt. Ltd. and for a period of one (1) year following the termination of your employment with Codervalue Solutions Pvt. Ltd. for any reason whatsoever, without the express written consent of the Director of Codervalue Solutions Pvt. Ltd., join any other organisation having similar interests or business activities which are competitive with Codervalue Solutions Pvt. Ltd.
          </Typography>

          {/* Place of Work */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Place of Work/Transfer/Work Timings:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 2, textAlign: 'justify' }}>
            Your current place of work will be {offerData.offerLetter?.workLocation || 'Noida'}. However, your services are transferable to any other place or office of the Company or any subsidiary or associate company, whether now existing or still to be formed. You may also be transferred/deputed to any of the company's client locations in India or abroad.
          </Typography>

          {/* Retirement */}
          <Typography sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Times, serif' }}>
            Retirement:
          </Typography>
          <Typography sx={{ fontFamily: 'Times, serif', mb: 3, textAlign: 'justify' }}>
            You will retire in the normal course from the services of the Company on attaining the age of superannuation, that is on the day following your 58th birthday.
          </Typography>

          {/* Closing */}
          <Typography sx={{ fontFamily: 'Times, serif', mb: 3, textAlign: 'justify' }}>
            We welcome you to Codervalue Solutions Pvt. Ltd. by wishing you all the very best in your new assignment and hope that your period of service with us will be long, pleasant, and of mutual benefit. We are certain that you will find this opportunity challenging and satisfying.
          </Typography>

          <Typography sx={{ fontFamily: 'Times, serif', mb: 4 }}>
            Sincerely,<br/>
            For, Codervalue Solutions Pvt. Ltd.<br/>
            <strong>HR Authorised Signatory</strong>
          </Typography>

          {/* Acceptance Section */}
          <Box sx={{ border: '1px solid #ccc', p: 2, bgcolor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Times, serif' }}>
              Acceptance:
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 2 }}>
              You are requested to signify your acceptance of this offer by signing and returning to us the duplicate copy of this letter.
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif', mb: 2 }}>
              I have read and clearly understood all the terms and conditions of this offer and I agree to abide by them.
            </Typography>
            <Typography sx={{ fontFamily: 'Times, serif' }}>
              Name: _____________________________<br/>
              Signature: ______________________________<br/>
              Date: _____________________________
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      {canTakeAction && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Ready to proceed after reviewing the complete offer letter?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Please scroll up to review the complete offer letter if you haven't already.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This offer is valid until {offerData.offerLetter?.expiryDate ? 
              moment(offerData.offerLetter.expiryDate).format('MMMM DD, YYYY') : 
              'further notice'
            }
          </Typography>
          
          {!digitalSignature ? (
            <Box>
              <DigitalSignature 
                candidateName={offerData.employeeName}
                onSignatureComplete={handleSignatureComplete}
              />
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={() => setRejectDialogOpen(true)}
                  sx={{ minWidth: 150 }}
                >
                  Decline Offer
                </Button>
              </Box>
            </Box>
          ) : (
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => setAcceptDialogOpen(true)}
                sx={{ minWidth: 150 }}
              >
                Accept Offer
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={() => setRejectDialogOpen(true)}
                sx={{ minWidth: 150 }}
              >
                Decline Offer
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      {/* Post-Acceptance Message */}
      {isOfferAccepted && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'success.50' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="success.main" gutterBottom>
            Congratulations! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Thank you for accepting our offer. Please proceed to upload your documents to complete the onboarding process.
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate(`/candidate-portal/${offerData.employeeId}?step=4`)}
          >
            Upload Documents
          </Button>
        </Paper>
      )}

      {/* Post-Rejection Message */}
      {isOfferRejected && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.50' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error.main" gutterBottom>
            Offer Declined
          </Typography>
          <Typography variant="body1">
            We understand your decision and respect your choice. Thank you for considering our offer.
          </Typography>
        </Paper>
      )}

      {/* Accept Offer Dialog */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Job Offer Acceptance</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="success">
              You are about to accept this job offer. This action cannot be undone.
            </Alert>
            
            {/* Show signature preview */}
            {digitalSignature && (
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your Digital Signature:
                </Typography>
                <img 
                  src={digitalSignature.data} 
                  alt="Digital Signature" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa'
                  }} 
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Signed by: {digitalSignature.name} | Method: {digitalSignature.method}
                </Typography>
              </Box>
            )}
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              }
              label="I have read and accept all terms and conditions mentioned in this offer letter"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional comments or questions..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAcceptOffer}
            variant="contained"
            color="success"
            disabled={submitting || !termsAccepted}
          >
            {submitting ? <CircularProgress size={20} /> : 'Confirm Acceptance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Offer Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Decline Job Offer</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              You are about to decline this job offer. This action cannot be undone.
            </Alert>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for Declining (Optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please let us know why you're declining this offer (optional)..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectOffer}
            variant="contained"
            color="error"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Decline Offer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OfferAcceptance;
