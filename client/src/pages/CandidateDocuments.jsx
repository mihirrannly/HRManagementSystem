import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Assignment as DocumentIcon,
  Person as PersonIcon,
  School as EducationIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  CreditCard as IdIcon,
  Home as AddressIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const CandidateDocuments = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const documentTypes = [
    // Government Documents (Required)
    {
      id: 'pan_card',
      title: 'PAN Card',
      description: 'Permanent Account Number card - Government issued ID',
      icon: <IdIcon />,
      required: true,
      category: 'government'
    },
    {
      id: 'aadhaar_card',
      title: 'Aadhaar Card',
      description: 'Aadhaar card - Government issued identity proof',
      icon: <IdIcon />,
      required: true,
      category: 'government'
    },
    {
      id: 'bank_details',
      title: 'Bank Details',
      description: 'Cancelled cheque or bank passbook for salary credit',
      icon: <BankIcon />,
      required: true,
      category: 'government'
    },
    {
      id: 'passport_photo',
      title: 'Passport Size Photo',
      description: 'Recent passport size photograph (white background)',
      icon: <PersonIcon />,
      required: true,
      category: 'government'
    },
    
    // Education Documents (Based on mentioned qualifications)
    {
      id: 'educational_certificates',
      title: 'Educational Certificates',
      description: 'Upload certificates for education qualifications mentioned in your profile',
      icon: <EducationIcon />,
      required: true,
      category: 'education'
    },
    
    // Experience Documents (Based on mentioned experience)
    {
      id: 'experience_letters',
      title: 'Experience Letters',
      description: 'Upload experience letters for work experience mentioned in your profile',
      icon: <WorkIcon />,
      required: false,
      category: 'experience'
    },
    {
      id: 'relieving_certificate',
      title: 'Relieving Certificate',
      description: 'Relieving certificate from your previous organization',
      icon: <WorkIcon />,
      required: true,
      category: 'experience'
    },
    {
      id: 'previous_org_certificates',
      title: 'Previous Organization Certificates',
      description: 'Important certificates from previous organizations (appreciation, training, etc.)',
      icon: <WorkIcon />,
      required: false,
      category: 'experience'
    },
    
    // Additional Documents (Optional)
    {
      id: 'salary_slips',
      title: 'Salary Slips',
      description: 'Last 3 months salary slips from previous organization (optional)',
      icon: <BankIcon />,
      required: false,
      category: 'additional'
    },
    {
      id: 'bank_statement',
      title: 'Bank Statement',
      description: 'Bank statement for last 3 months (optional)',
      icon: <BankIcon />,
      required: false,
      category: 'additional'
    },
    {
      id: 'resume',
      title: 'Resume/CV',
      description: 'Your latest resume or curriculum vitae',
      icon: <PersonIcon />,
      required: true,
      category: 'additional'
    }
  ];

  useEffect(() => {
    fetchCandidateDocuments();
  }, [token]);

  const fetchCandidateDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/onboarding/offer-acceptance/${token}/documents`);
      setCandidateInfo({
        employeeName: response.data.employeeName,
        documents: response.data.documents || [],
        documentsSubmitted: response.data.documentsSubmitted || false,
        documentsStatus: response.data.documentsStatus || 'pending'
      });
    } catch (error) {
      console.error('Error fetching candidate documents:', error);
      
      if (error.response?.status === 404) {
        toast.error('Document access not found. Please check the link or contact HR for assistance.');
      } else {
        toast.error('Failed to load document information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !selectedDocType) {
      toast.error('Please select files and document type');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append('documents', file);
      });
      formData.append('documentType', selectedDocType);

      const response = await axios.post(`/onboarding/offer-acceptance/${token}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Documents uploaded successfully!');
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setSelectedDocType('');
      
      // Refresh document list
      fetchCandidateDocuments();
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const openUploadDialog = (docType) => {
    setSelectedDocType(docType);
    setUploadDialogOpen(true);
  };

  const getDocumentStatus = (docType) => {
    if (!candidateInfo?.documents) return 'missing';
    
    const hasDoc = candidateInfo.documents.some(doc => doc.type === docType);
    return hasDoc ? 'uploaded' : 'missing';
  };

  const getDocumentCount = (docType) => {
    if (!candidateInfo?.documents) return 0;
    return candidateInfo.documents.filter(doc => doc.type === docType).length;
  };

  const handleSubmitAllDocuments = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(`/onboarding/offer-acceptance/${token}/submit-documents`);
      
      toast.success('🎉 Documents submitted successfully for HR review!');
      
      // Refresh data
      fetchCandidateDocuments();
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast.error('Failed to submit documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getRequiredDocumentsCount = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => getDocumentStatus(doc.id) === 'uploaded');
    return { total: requiredDocs.length, uploaded: uploadedRequiredDocs.length };
  };

  const canSubmitDocuments = () => {
    const { total, uploaded } = getRequiredDocumentsCount();
    return uploaded === total && !candidateInfo?.documentsSubmitted;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading document requirements...
        </Typography>
      </Container>
    );
  }

  if (!candidateInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Document information not found. Please contact HR for assistance.
        </Alert>
      </Container>
    );
  }

  const { total, uploaded } = getRequiredDocumentsCount();
  const progressPercentage = total > 0 ? (uploaded / total) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Document Upload Portal
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Welcome, {candidateInfo.employeeName}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
          Please upload the required documents to complete your onboarding process. 
          Upload only documents mentioned in your education and experience details, along with essential government documents.
        </Typography>
        <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2">
            <strong>Important:</strong> Only upload documents that correspond to your mentioned qualifications and experience. 
            Government documents (PAN, Aadhaar, Bank details) are mandatory for all candidates.
          </Typography>
        </Alert>
      </Paper>

      {/* Progress Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Document Upload Progress</Typography>
            <Chip
              label={candidateInfo.documentsSubmitted ? 'Submitted for Review' : `${uploaded}/${total} Required`}
              color={candidateInfo.documentsSubmitted ? 'success' : uploaded === total ? 'success' : 'primary'}
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          
          <Typography variant="body2" color="text.secondary">
            {candidateInfo.documentsSubmitted 
              ? 'All documents have been submitted and are under review by HR team'
              : `Upload ${total - uploaded} more required documents to proceed`
            }
          </Typography>

          {candidateInfo.documentsSubmitted && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Status:</strong> {candidateInfo.documentsStatus?.replace('_', ' ').toUpperCase()}
                <br />
                HR team will review your documents and contact you if any additional information is needed.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Document Types Grid - Organized by Categories */}
      {['government', 'education', 'experience', 'additional'].map((category) => {
        const categoryDocs = documentTypes.filter(doc => doc.category === category);
        const categoryTitle = {
          government: 'Government Documents',
          education: 'Education Documents',
          experience: 'Experience Documents',
          additional: 'Additional Documents'
        };
        
        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'primary.main',
              fontWeight: 'bold',
              mb: 2
            }}>
              {category === 'government' && <IdIcon />}
              {category === 'education' && <EducationIcon />}
              {category === 'experience' && <WorkIcon />}
              {category === 'additional' && <PersonIcon />}
              {categoryTitle[category]}
            </Typography>
            
            <Grid container spacing={3}>
              {categoryDocs.map((docType) => {
                const status = getDocumentStatus(docType.id);
                const count = getDocumentCount(docType.id);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={docType.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        border: status === 'uploaded' ? '2px solid' : '1px solid',
                        borderColor: status === 'uploaded' ? 'success.main' : 'divider',
                        bgcolor: status === 'uploaded' ? 'success.50' : 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {docType.icon}
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600">
                                {docType.title}
                                {docType.required && (
                                  <Chip label="Required" size="small" color="error" sx={{ ml: 1, height: 20 }} />
                                )}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {status === 'uploaded' ? (
                            <Chip
                              icon={<CheckIcon />}
                              label={`${count} uploaded`}
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Missing"
                              color="error"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                          {docType.description}
                        </Typography>
                        
                        <Button
                          variant={status === 'uploaded' ? 'outlined' : 'contained'}
                          color={status === 'uploaded' ? 'success' : 'primary'}
                          startIcon={<UploadIcon />}
                          fullWidth
                          onClick={() => openUploadDialog(docType.id)}
                          disabled={candidateInfo.documentsSubmitted}
                        >
                          {status === 'uploaded' ? 'Add More' : 'Upload'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}

      {/* Submit Button */}
      {!candidateInfo.documentsSubmitted && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Ready to Submit Documents?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Make sure you have uploaded all required documents before submitting for review.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              color="success"
              onClick={handleSubmitAllDocuments}
              disabled={!canSubmitDocuments() || submitting}
              sx={{ minWidth: 200 }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                'Submit All Documents'
              )}
            </Button>
            
            {!canSubmitDocuments() && !candidateInfo.documentsSubmitted && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Please upload all required documents before submitting
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Documents
          <IconButton
            onClick={() => setUploadDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Document Type:</strong> {documentTypes.find(d => d.id === selectedDocType)?.title}
                <br />
                <strong>Accepted formats:</strong> PDF, JPG, JPEG, PNG, DOC, DOCX
                <br />
                <strong>Maximum size:</strong> 10MB per file
              </Typography>
            </Alert>
            
            <Box
              sx={{
                border: '2px dashed',
                borderColor: selectedFiles.length > 0 ? 'success.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: selectedFiles.length > 0 ? 'success.50' : 'grey.50',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to select files'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or drag and drop files here
              </Typography>
            </Box>
            
            {selectedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Selected Files:</Typography>
                <List dense>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              'Upload Files'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CandidateDocuments;

