import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Avatar,
  Divider,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  ContactPhone as ContactPhoneIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

// Create a dedicated axios instance for candidate portal
const candidateApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Helper functions moved outside component to reduce complexity
const getTotalDocuments = (candidateData) => {
  let totalDocs = 0;
  
  // Education documents
  if (candidateData.educationQualifications) {
    candidateData.educationQualifications.forEach(edu => {
      totalDocs += edu.documents?.length || 0;
    });
  }
  
  // Work experience documents
  if (candidateData.workExperience?.experienceDetails) {
    candidateData.workExperience.experienceDetails.forEach(work => {
      if (work.documents) {
        ['experienceLetters', 'relievingCertificate', 'salarySlips'].forEach(docType => {
          totalDocs += work.documents[docType]?.length || 0;
        });
      }
    });
  }
  
  // Portal uploaded documents
  totalDocs += candidateData.uploadedDocuments?.length || 0;
  
  return totalDocs;
};

const getAllDocuments = (candidateData) => {
  const allDocuments = [];
  
  // Profile Photo
  if (candidateData.personalInfo?.profilePhoto?.id) {
    allDocuments.push({
      ...candidateData.personalInfo.profilePhoto,
      source: 'personal',
      category: 'Profile Photo'
    });
  }
  
  // Government Documents (Aadhaar, PAN)
  if (candidateData.governmentDocuments) {
    if (candidateData.governmentDocuments.aadhaarImage?.id) {
      allDocuments.push({
        ...candidateData.governmentDocuments.aadhaarImage,
        source: 'government',
        category: 'Aadhaar Card'
      });
    }
    if (candidateData.governmentDocuments.panImage?.id) {
      allDocuments.push({
        ...candidateData.governmentDocuments.panImage,
        source: 'government',
        category: 'PAN Card'
      });
    }
  }
  
  // Bank Documents (Cancelled Cheque, Passbook, Bank Statement)
  if (candidateData.bankDocuments) {
    if (candidateData.bankDocuments.cancelledCheque?.id) {
      allDocuments.push({
        ...candidateData.bankDocuments.cancelledCheque,
        source: 'bank',
        category: 'Cancelled Cheque'
      });
    }
    if (candidateData.bankDocuments.passbook?.id) {
      allDocuments.push({
        ...candidateData.bankDocuments.passbook,
        source: 'bank',
        category: 'Bank Passbook'
      });
    }
    if (candidateData.bankDocuments.bankStatement?.id) {
      allDocuments.push({
        ...candidateData.bankDocuments.bankStatement,
        source: 'bank',
        category: 'Bank Statement'
      });
    }
  }
  
  // Education documents (metadata-only, may not have actual files)
  if (candidateData.educationQualifications) {
    candidateData.educationQualifications.forEach((edu, index) => {
      if (edu.documents && edu.documents.length > 0) {
        edu.documents.forEach(doc => {
          allDocuments.push({
            ...doc,
            source: 'education',
            category: `Education ${index + 1}: ${edu.degree || 'Unknown'}`,
            isMetadataOnly: true // Flag to indicate this might not have an actual file
          });
        });
      }
    });
  }
  
  // Work experience documents (metadata-only, may not have actual files)
  if (candidateData.workExperience?.experienceDetails) {
    candidateData.workExperience.experienceDetails.forEach((work, index) => {
      if (work.documents) {
        ['experienceLetters', 'relievingCertificate', 'salarySlips'].forEach(docType => {
          if (work.documents[docType] && work.documents[docType].length > 0) {
            work.documents[docType].forEach(doc => {
              allDocuments.push({
                ...doc,
                source: 'work',
                category: `Work ${index + 1}: ${docType.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                isMetadataOnly: true // Flag to indicate this might not have an actual file
              });
            });
          }
        });
      }
    });
  }
  
  // Portal uploaded documents
  if (candidateData.uploadedDocuments) {
    candidateData.uploadedDocuments.forEach(doc => {
      allDocuments.push({
        ...doc,
        source: 'portal',
        category: 'General Documents'
      });
    });
  }
  
  return allDocuments;
};

const CandidateReview = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentStatuses, setDocumentStatuses] = useState({}); // Track document approval/rejection status

  // Document action handlers
  const handleDownloadDocument = async (doc) => {
    try {
      // Check if this is a metadata-only document
      if (doc.isMetadataOnly) {
        alert(`This document "${doc.name}" is a reference entry but the actual file was not uploaded to the server.\n\nThis commonly happens with education and work experience documents that are added as references.\n\nTo download this document, please ask the candidate to upload it using the proper image upload feature.`);
        return;
      }
      
      let downloadUrl = null;
      
      // Handle different document structures
      if (doc.url) {
        // Documents with explicit URL (government/bank documents)
        downloadUrl = doc.url;
        
        // If it's a relative URL, make it absolute
        if (downloadUrl.startsWith('/uploads')) {
          downloadUrl = `http://localhost:5001${downloadUrl}`;
        } else if (!downloadUrl.startsWith('http')) {
          downloadUrl = `http://localhost:5001/uploads/onboarding/${downloadUrl}`;
        }
      } else if (doc.id && doc.name) {
        // Documents without URL - try the server endpoint
        downloadUrl = `http://localhost:5001/api/candidate-portal/${candidateId}/document/${doc.id}/${encodeURIComponent(doc.name)}`;
        
        console.log('🔍 Using document lookup endpoint:', downloadUrl);
        console.log('📄 Document details:', { id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt });
        
        // First check if the document is available
        try {
          const response = await fetch(downloadUrl, { method: 'HEAD' });
          if (!response.ok) {
            // Try to get the error details
            const errorResponse = await fetch(downloadUrl);
            const errorData = await errorResponse.json();
            
            if (errorData.message === 'Document file not available') {
              alert(`Document Not Available\n\n${errorData.details}\n\nSuggestion: ${errorData.suggestion}`);
              return;
            } else {
              throw new Error(`Server responded with ${response.status}`);
            }
          }
        } catch (fetchError) {
          console.error('❌ Document availability check failed:', fetchError);
          alert(`Unable to access document "${doc.name}".\n\nThis document may not have been properly uploaded to the server.\n\nPlease contact support or ask the candidate to re-upload this document.`);
          return;
        }
      } else {
        console.error('❌ Document missing both URL and ID/name:', doc);
        console.log('📋 Available document properties:', Object.keys(doc));
        
        alert(`Document information incomplete.\n\nAvailable data: ${Object.keys(doc).join(', ')}\n\nCannot download this document.`);
        return;
      }
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.name || 'document';
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Document download initiated:', doc.name, 'URL:', downloadUrl);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleApproveDocument = (doc, index) => {
    try {
      setDocumentStatuses(prev => ({
        ...prev,
        [index]: 'approved'
      }));
      console.log('✅ Document approved:', doc.name);
      
      // Here you would typically make an API call to update the document status
      // Example: await candidateApi.put(`documents/${doc.id}/approve`);
      
      // For now, just show a success message
      alert(`Document "${doc.name}" has been approved!`);
    } catch (error) {
      console.error('❌ Approve error:', error);
      alert('Failed to approve document. Please try again.');
    }
  };

  const handleRejectDocument = (doc, index) => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):');
      
      setDocumentStatuses(prev => ({
        ...prev,
        [index]: 'rejected'
      }));
      console.log('❌ Document rejected:', doc.name, reason ? `Reason: ${reason}` : '');
      
      // Here you would typically make an API call to update the document status
      // Example: await candidateApi.put(`documents/${doc.id}/reject`, { reason });
      
      // For now, just show a success message
      alert(`Document "${doc.name}" has been rejected!${reason ? ` Reason: ${reason}` : ''}`);
    } catch (error) {
      console.error('❌ Reject error:', error);
      alert('Failed to reject document. Please try again.');
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      let viewUrl = null;
      
      // Check if this is a metadata-only document
      if (doc.isMetadataOnly) {
        alert(`This document "${doc.name}" is a reference entry but the actual file was not uploaded to the server.\n\nThis commonly happens with education and work experience documents that are added as references.\n\nTo view this document, please ask the candidate to upload it using the proper image upload feature.`);
        return;
      }
      
      // Handle different document structures
      if (doc.url) {
        // Documents with explicit URL (government/bank documents)
        viewUrl = doc.url;
        
        // If it's a relative URL, make it absolute
        if (viewUrl.startsWith('/uploads')) {
          viewUrl = `http://localhost:5001${viewUrl}`;
        } else if (!viewUrl.startsWith('http')) {
          viewUrl = `http://localhost:5001/uploads/onboarding/${viewUrl}`;
        }
      } else if (doc.id && doc.name) {
        // Documents without URL - try the server endpoint
        viewUrl = `http://localhost:5001/api/candidate-portal/${candidateId}/document/${doc.id}/${encodeURIComponent(doc.name)}`;
        
        console.log('🔍 Using document lookup endpoint:', viewUrl);
        console.log('📄 Document details:', { id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt });
        
        // First check if the document is available
        try {
          const response = await fetch(viewUrl, { method: 'HEAD' });
          if (!response.ok) {
            // Try to get the error details
            const errorResponse = await fetch(viewUrl);
            const errorData = await errorResponse.json();
            
            if (errorData.message === 'Document file not available') {
              alert(`Document Not Available\n\n${errorData.details}\n\nSuggestion: ${errorData.suggestion}`);
              return;
            } else {
              throw new Error(`Server responded with ${response.status}`);
            }
          }
        } catch (fetchError) {
          console.error('❌ Document availability check failed:', fetchError);
          alert(`Unable to access document "${doc.name}".\n\nThis document may not have been properly uploaded to the server.\n\nPlease contact support or ask the candidate to re-upload this document.`);
          return;
        }
      } else {
        console.error('❌ Document missing both URL and ID/name:', doc);
        console.log('📋 Available document properties:', Object.keys(doc));
        
        alert(`Document information incomplete.\n\nAvailable data: ${Object.keys(doc).join(', ')}\n\nCannot view this document.`);
        return;
      }
      
      // Open in new tab
      const newWindow = window.open(viewUrl, '_blank');
      
      // Check if the window opened successfully
      if (!newWindow) {
        alert('Pop-up blocked. Please allow pop-ups for this site to view documents.');
        return;
      }
      
      console.log('👁️ Document opened for viewing:', doc.name, 'URL:', viewUrl);
    } catch (error) {
      console.error('❌ View error:', error);
      alert('Failed to view document. Please try again.');
    }
  };

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        const response = await candidateApi.get(`candidate-portal/${candidateId}/status`);
        
        if (response.data.success && response.data.candidatePortal) {
          const serverData = response.data.candidatePortal;
          
          // Process image URLs to ensure they're absolute URLs
          const processedData = {
            ...serverData,
            personalInfo: serverData.personalInfo ? {
              ...serverData.personalInfo,
              profilePhoto: serverData.personalInfo.profilePhoto ? {
                ...serverData.personalInfo.profilePhoto,
                url: serverData.personalInfo.profilePhoto.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.personalInfo.profilePhoto.url}`
                  : serverData.personalInfo.profilePhoto.url
              } : null
            } : {},
            governmentDocuments: serverData.governmentDocuments ? {
              ...serverData.governmentDocuments,
              aadhaarImage: serverData.governmentDocuments.aadhaarImage ? {
                ...serverData.governmentDocuments.aadhaarImage,
                url: serverData.governmentDocuments.aadhaarImage.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.governmentDocuments.aadhaarImage.url}`
                  : serverData.governmentDocuments.aadhaarImage.url
              } : null,
              panImage: serverData.governmentDocuments.panImage ? {
                ...serverData.governmentDocuments.panImage,
                url: serverData.governmentDocuments.panImage.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.governmentDocuments.panImage.url}`
                  : serverData.governmentDocuments.panImage.url
              } : null
            } : {},
            bankDocuments: serverData.bankDocuments ? {
              ...serverData.bankDocuments,
              cancelledCheque: serverData.bankDocuments.cancelledCheque ? {
                ...serverData.bankDocuments.cancelledCheque,
                url: serverData.bankDocuments.cancelledCheque.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.bankDocuments.cancelledCheque.url}`
                  : serverData.bankDocuments.cancelledCheque.url
              } : null,
              passbook: serverData.bankDocuments.passbook ? {
                ...serverData.bankDocuments.passbook,
                url: serverData.bankDocuments.passbook.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.bankDocuments.passbook.url}`
                  : serverData.bankDocuments.passbook.url
              } : null,
              bankStatement: serverData.bankDocuments.bankStatement ? {
                ...serverData.bankDocuments.bankStatement,
                url: serverData.bankDocuments.bankStatement.url?.startsWith('/uploads') 
                  ? `http://localhost:5001${serverData.bankDocuments.bankStatement.url}`
                  : serverData.bankDocuments.bankStatement.url
              } : null
            } : {}
          };
          
          setCandidateData(processedData);
        } else {
          setError('No candidate data found');
        }
      } catch (err) {
        console.error('Error fetching candidate data:', err);
        setError('Failed to load candidate data');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading candidate data...</Typography>
      </Container>
    );
  }

  if (error || !candidateData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'No candidate data found'}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} separator={<NavigateNextIcon fontSize="small" />}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/organization')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Organization
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/organization')}
          sx={{ textDecoration: 'none' }}
        >
          New Onboardings
        </Link>
        <Typography color="text.primary">Candidate Review</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Complete Candidate Review
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {candidateData.personalInfo?.firstName} {candidateData.personalInfo?.lastName} - {candidateId}
          </Typography>
        </Box>
      </Box>

      {/* Document Status Overview */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Document Status Overview"
          avatar={<DescriptionIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                <Typography variant="h4" color="info.main">
                  {getTotalDocuments(candidateData)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                <Typography variant="h4" color="success.main">
                  {candidateData.isSubmitted ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Information Submitted
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                <Typography variant="h4" color="warning.main">
                  {candidateData.isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Portal Status
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      {candidateData.personalInfo && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Personal Information" 
            avatar={<PersonIcon color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Full Name
                          </Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {(() => {
                              const firstName = candidateData.personalInfo.firstName || '';
                              const lastName = candidateData.personalInfo.lastName || '';
                              return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Not provided';
                            })()}
                          </Box>
                        </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.email || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mobile Number
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.phone || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date of Birth
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.dateOfBirth ? 
                    new Date(candidateData.personalInfo.dateOfBirth).toLocaleDateString() : 
                    'Not provided'
                  }
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gender
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.gender || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Marital Status
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.maritalStatus || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nationality
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.nationality || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Aadhaar Number
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.aadharNumber || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  PAN Number
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.personalInfo.panNumber || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Designation
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.additionalInfo?.designation || 'Not provided'}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Department
                </Typography>
                <Box sx={{ fontWeight: 500 }}>
                  {candidateData.additionalInfo?.department || 'Not provided'}
                </Box>
                </Grid>
                
                {/* Passport Photo Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Passport Size Photo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Profile Photo
                      </Typography>
                      {candidateData.personalInfo?.profilePhoto ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img 
                            src={candidateData.personalInfo.profilePhoto.url || candidateData.personalInfo.profilePhoto} 
                            alt="Profile Photo"
                            style={{ 
                              width: 100, 
                              height: 120, 
                              objectFit: 'cover', 
                              border: '1px solid #ddd',
                              borderRadius: 4
                            }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {candidateData.personalInfo.profilePhoto.name || 'Profile Photo'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Uploaded: {candidateData.personalInfo.profilePhoto.uploadedAt ? 
                                new Date(candidateData.personalInfo.profilePhoto.uploadedAt).toLocaleDateString() : 
                                'Date not available'
                              }
                            </Typography>
                            <br />
                            <Chip 
                              label="UPLOADED" 
                              color="success" 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ maxWidth: 300 }}>
                          No passport photo uploaded yet.
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

      {/* Address Information Section */}
      {(candidateData.addressInfo?.currentAddress || candidateData.addressInfo?.permanentAddress) && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Address Information" 
            avatar={<LocationOnIcon color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3}>
              {candidateData.addressInfo.currentAddress && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Current Address
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {candidateData.addressInfo.currentAddress.street && 
                      `${candidateData.addressInfo.currentAddress.street}, `}
                    {candidateData.addressInfo.currentAddress.city && 
                      `${candidateData.addressInfo.currentAddress.city}, `}
                    {candidateData.addressInfo.currentAddress.state && 
                      `${candidateData.addressInfo.currentAddress.state} - `}
                    {candidateData.addressInfo.currentAddress.pincode && 
                      `${candidateData.addressInfo.currentAddress.pincode}, `}
                    {candidateData.addressInfo.currentAddress.country}
                  </Typography>
                </Grid>
              )}
              {candidateData.addressInfo.permanentAddress && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Permanent Address
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {candidateData.addressInfo.permanentAddress.street && 
                      `${candidateData.addressInfo.permanentAddress.street}, `}
                    {candidateData.addressInfo.permanentAddress.city && 
                      `${candidateData.addressInfo.permanentAddress.city}, `}
                    {candidateData.addressInfo.permanentAddress.state && 
                      `${candidateData.addressInfo.permanentAddress.state} - `}
                    {candidateData.addressInfo.permanentAddress.pincode && 
                      `${candidateData.addressInfo.permanentAddress.pincode}, `}
                    {candidateData.addressInfo.permanentAddress.country}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Bank & Government Details Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Bank & Government Details" 
          avatar={<AccountBalanceIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Government Details Subsection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                Government Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    PAN Number
                  </Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.personalInfo?.panNumber || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Aadhaar Number
                  </Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.personalInfo?.aadharNumber || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nationality
                  </Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.personalInfo?.nationality || 'Not provided'}
                  </Box>
                </Grid>
              </Grid>
              
              {/* Government Document Images */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                Government Document Images
              </Typography>
              <Grid container spacing={3}>
                {/* Aadhaar Image */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Aadhaar Card Image
                  </Typography>
                  {candidateData.personalInfo?.aadhaarImage || candidateData.governmentDocuments?.aadhaarImage ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <img 
                        src={(candidateData.personalInfo?.aadhaarImage?.url || candidateData.governmentDocuments?.aadhaarImage?.url || candidateData.personalInfo?.aadhaarImage || candidateData.governmentDocuments?.aadhaarImage)} 
                        alt="Aadhaar Card"
                        style={{ 
                          maxWidth: 300, 
                          height: 'auto', 
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {(candidateData.personalInfo?.aadhaarImage?.uploadedAt || candidateData.governmentDocuments?.aadhaarImage?.uploadedAt) ? 
                            new Date(candidateData.personalInfo?.aadhaarImage?.uploadedAt || candidateData.governmentDocuments?.aadhaarImage?.uploadedAt).toLocaleDateString() : 
                            'Date not available'
                          }
                        </Typography>
                        <br />
                        <Chip 
                          label="UPLOADED" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 300 }}>
                      No Aadhaar card image uploaded yet.
                    </Alert>
                  )}
                </Grid>

                {/* PAN Image */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    PAN Card Image
                  </Typography>
                  {candidateData.personalInfo?.panImage || candidateData.governmentDocuments?.panImage ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <img 
                        src={(candidateData.personalInfo?.panImage?.url || candidateData.governmentDocuments?.panImage?.url || candidateData.personalInfo?.panImage || candidateData.governmentDocuments?.panImage)} 
                        alt="PAN Card"
                        style={{ 
                          maxWidth: 300, 
                          height: 'auto', 
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {(candidateData.personalInfo?.panImage?.uploadedAt || candidateData.governmentDocuments?.panImage?.uploadedAt) ? 
                            new Date(candidateData.personalInfo?.panImage?.uploadedAt || candidateData.governmentDocuments?.panImage?.uploadedAt).toLocaleDateString() : 
                            'Date not available'
                          }
                        </Typography>
                        <br />
                        <Chip 
                          label="UPLOADED" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 300 }}>
                      No PAN card image uploaded yet.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Details Subsection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <AccountBalanceIcon sx={{ mr: 1 }} />
                Banking Information
              </Typography>
              {(candidateData.bankDetails && candidateData.bankDetails.length > 0) ? (
                Array.isArray(candidateData.bankDetails) ? (
                  candidateData.bankDetails.map((bank, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {bank.bankName || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Account Number</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {bank.accountNumber || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {bank.ifscCode || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {bank.accountHolderName || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Branch</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {bank.branch || bank.branchName || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Primary Account</Typography>
                          <Chip 
                            label={bank.isPrimary ? 'Yes' : 'No'} 
                            color={bank.isPrimary ? 'success' : 'default'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.bankDetails.bankName || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Number</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.bankDetails.accountNumber || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.bankDetails.ifscCode || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.bankDetails.accountHolderName || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Branch</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.bankDetails.branch || candidateData.bankDetails.branchName || 'Not provided'}
                      </Box>
                    </Grid>
                  </Grid>
                )
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No banking information provided yet.
                </Alert>
              )}

              {/* Bank Document Images */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                Bank Document Images
              </Typography>
              <Grid container spacing={3}>
                {/* Cancelled Cheque */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Cancelled Cheque
                  </Typography>
                  {candidateData.bankDetails?.cancelledCheque || candidateData.bankDocuments?.cancelledCheque ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <img 
                        src={(candidateData.bankDetails?.cancelledCheque?.url || candidateData.bankDocuments?.cancelledCheque?.url || candidateData.bankDetails?.cancelledCheque || candidateData.bankDocuments?.cancelledCheque)} 
                        alt="Cancelled Cheque"
                        style={{ 
                          maxWidth: 350, 
                          height: 'auto', 
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {candidateData.bankDetails?.cancelledCheque?.name || candidateData.bankDocuments?.cancelledCheque?.name || 'Cancelled Cheque'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {(candidateData.bankDetails?.cancelledCheque?.uploadedAt || candidateData.bankDocuments?.cancelledCheque?.uploadedAt) ? 
                            new Date(candidateData.bankDetails?.cancelledCheque?.uploadedAt || candidateData.bankDocuments?.cancelledCheque?.uploadedAt).toLocaleDateString() : 
                            'Date not available'
                          }
                        </Typography>
                        <br />
                        <Chip 
                          label="UPLOADED" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 350 }}>
                      No cancelled cheque uploaded yet.
                    </Alert>
                  )}
                </Grid>

                {/* Bank Passbook */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Bank Passbook (First Page)
                  </Typography>
                  {candidateData.bankDetails?.passbook || candidateData.bankDocuments?.passbook ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <img 
                        src={(candidateData.bankDetails?.passbook?.url || candidateData.bankDocuments?.passbook?.url || candidateData.bankDetails?.passbook || candidateData.bankDocuments?.passbook)} 
                        alt="Bank Passbook"
                        style={{ 
                          maxWidth: 350, 
                          height: 'auto', 
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {candidateData.bankDetails?.passbook?.name || candidateData.bankDocuments?.passbook?.name || 'Bank Passbook'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {(candidateData.bankDetails?.passbook?.uploadedAt || candidateData.bankDocuments?.passbook?.uploadedAt) ? 
                            new Date(candidateData.bankDetails?.passbook?.uploadedAt || candidateData.bankDocuments?.passbook?.uploadedAt).toLocaleDateString() : 
                            'Date not available'
                          }
                        </Typography>
                        <br />
                        <Chip 
                          label="UPLOADED" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 350 }}>
                      No bank passbook uploaded yet.
                    </Alert>
                  )}
                </Grid>

                {/* Bank Statement */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Bank Statement (Last 3 Months)
                  </Typography>
                  {candidateData.bankDetails?.bankStatement || candidateData.bankDocuments?.bankStatement ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(candidateData.bankDetails?.bankStatement?.name || candidateData.bankDocuments?.bankStatement?.name || '')?.toLowerCase().endsWith('.pdf') ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: 200,
                          maxWidth: 350,
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          bgcolor: 'grey.50'
                        }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              PDF Document
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <img 
                          src={(candidateData.bankDetails?.bankStatement?.url || candidateData.bankDocuments?.bankStatement?.url || candidateData.bankDetails?.bankStatement || candidateData.bankDocuments?.bankStatement)} 
                          alt="Bank Statement"
                          style={{ 
                            maxWidth: 350, 
                            height: 'auto', 
                            border: '1px solid #ddd',
                            borderRadius: 4
                          }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {candidateData.bankDetails?.bankStatement?.name || candidateData.bankDocuments?.bankStatement?.name || 'Bank Statement'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {(candidateData.bankDetails?.bankStatement?.uploadedAt || candidateData.bankDocuments?.bankStatement?.uploadedAt) ? 
                            new Date(candidateData.bankDetails?.bankStatement?.uploadedAt || candidateData.bankDocuments?.bankStatement?.uploadedAt).toLocaleDateString() : 
                            'Date not available'
                          }
                        </Typography>
                        <br />
                        <Chip 
                          label="UPLOADED" 
                          color="success" 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ maxWidth: 350 }}>
                      No bank statement uploaded yet.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Legacy Bank Details Section - Remove this */}
      {false && candidateData.bankDetails && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Bank Details" 
            avatar={<AccountBalanceIcon color="primary" />}
          />
          <CardContent>
            {Array.isArray(candidateData.bankDetails) ? (
              candidateData.bankDetails.map((bank, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {bank.bankName || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Number</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {bank.accountNumber || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {bank.ifscCode || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {bank.accountHolderName || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Branch</Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {bank.branch || bank.branchName || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Primary Account</Typography>
                      <Chip 
                        label={bank.isPrimary ? 'Yes' : 'No'} 
                        color={bank.isPrimary ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.bankDetails.bankName || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Account Number</Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.bankDetails.accountNumber || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.bankDetails.ifscCode || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.bankDetails.accountHolderName || 'Not provided'}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Branch</Typography>
                  <Box sx={{ fontWeight: 500 }}>
                    {candidateData.bankDetails.branch || candidateData.bankDetails.branchName || 'Not provided'}
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Education & Experience Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Education & Experience" 
          avatar={<SchoolIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Education Subsection */}
            {candidateData.educationQualifications && candidateData.educationQualifications.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  Educational Qualifications
                </Typography>
                {candidateData.educationQualifications.map((edu, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Degree</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.degree || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Institution</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.institution || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Year of Passing</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.yearOfPassing || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Percentage</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.percentage || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Specialization</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.specialization || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Education Level</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {edu.educationLevel || 'Not provided'}
                    </Box>
                  </Grid>
                  {edu.documents && edu.documents.length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Education Documents
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {edu.documents.map((doc, docIndex) => (
                          <Chip 
                            key={docIndex}
                            label={doc.name || `Document ${docIndex + 1}`}
                            size="small"
                            color="info"
                            icon={<DescriptionIcon />}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
              </Grid>
            )}

            {/* Work Experience Subsection */}
            {((candidateData.workExperience?.experienceDetails && candidateData.workExperience.experienceDetails.length > 0) || 
              (Array.isArray(candidateData.workExperience) && candidateData.workExperience.length > 0)) && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                  <WorkIcon sx={{ mr: 1 }} />
                  Work Experience
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                  Total Experience: {candidateData.workExperience?.totalExperience || 'Not specified'} years
                </Typography>
                {/* Handle new format (experienceDetails) */}
                {candidateData.workExperience?.experienceDetails && candidateData.workExperience.experienceDetails.map((work, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Company</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.company || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Position</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.position || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Current'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Salary</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.salary ? `₹${work.salary.toLocaleString()}` : 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Reason for Leaving</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.reasonForLeaving || 'Not provided'}
                        </Box>
                      </Grid>
                      {work.documents && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Work Documents
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {Object.entries(work.documents).map(([docType, docs]) => (
                              docs.map((doc, docIndex) => (
                                <Chip 
                                  key={`${docType}-${docIndex}`}
                                  label={`${docType.replace(/([A-Z])/g, ' $1')}: ${doc.name || `Document ${docIndex + 1}`}`}
                                  size="small"
                                  color="warning"
                                  icon={<DescriptionIcon />}
                                />
                              ))
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
                
                {/* Handle old format (array of work experience) */}
                {Array.isArray(candidateData.workExperience) && candidateData.workExperience.map((work, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Company</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.company || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Position</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.position || 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Current'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Salary</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.salary ? `₹${work.salary.toLocaleString()}` : 'Not provided'}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Reason for Leaving</Typography>
                        <Box sx={{ fontWeight: 500 }}>
                          {work.reasonForLeaving || 'Not provided'}
                        </Box>
                      </Grid>
                      {work.documents && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Work Documents
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {Object.entries(work.documents).map(([docType, docs]) => (
                              docs.map((doc, docIndex) => (
                                <Chip 
                                  key={`${docType}-${docIndex}`}
                                  label={`${docType.replace(/([A-Z])/g, ' $1')}: ${doc.name || `Document ${docIndex + 1}`}`}
                                  size="small"
                                  color="warning"
                                  icon={<DescriptionIcon />}
                                />
                              ))
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Grid>
            )}

            {/* Show message if no education or experience data */}
            {(!candidateData.educationQualifications || candidateData.educationQualifications.length === 0) &&
             (!candidateData.workExperience?.experienceDetails || candidateData.workExperience.experienceDetails.length === 0) && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No education or work experience information provided yet.
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>


      {/* Emergency Contacts Section */}
      {candidateData.emergencyContacts && candidateData.emergencyContacts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Emergency Contacts" 
            avatar={<ContactPhoneIcon color="primary" />}
          />
          <CardContent>
            {candidateData.emergencyContacts.map((contact, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {contact.name || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Relationship</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {contact.relationship || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {contact.phone || 'Not provided'}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Box sx={{ fontWeight: 500 }}>
                      {contact.email || 'Not provided'}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Upload Portal Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Document Upload Portal" 
          avatar={<DescriptionIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Document Categories Overview */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                Document Categories & Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h4" color="success.main">
                      {candidateData.educationQualifications?.reduce((count, edu) => count + (edu.documents?.length || 0), 0) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Education Documents
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="h4" color="warning.main">
                      {candidateData.workExperience?.experienceDetails?.reduce((count, work) => {
                        if (!work.documents) return count;
                        return count + Object.values(work.documents).reduce((docCount, docs) => docCount + (docs?.length || 0), 0);
                      }, 0) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Work Documents
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                    <Typography variant="h4" color="info.main">
                      {candidateData.uploadedDocuments?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      General Documents
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="h4" color="primary.main">
                      {getTotalDocuments(candidateData)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Documents
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* All Documents List */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                All Uploaded Documents
              </Typography>
              {getAllDocuments(candidateData).length > 0 ? (
                <List>
                  {getAllDocuments(candidateData).map((doc, index) => {
                    // Debug: Log document structure
                    console.log(`📋 Document ${index}:`, doc);
                    return (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {doc.name || `Document ${index + 1}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown'}
                      {doc.category && ` • ${doc.category}`}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip 
                        size="small" 
                        label={doc.type?.replace('_', ' ').toUpperCase() || doc.category?.toUpperCase() || 'DOCUMENT'} 
                        color="primary" 
                      />
                      <Chip 
                        size="small" 
                        label={doc.status?.toUpperCase() || 'PENDING'} 
                        color={doc.status === 'uploaded' ? 'success' : 'default'} 
                      />
                      <Chip 
                        size="small" 
                        label={doc.source.toUpperCase()} 
                        color={
                          doc.source === 'portal' ? 'success' : 
                          doc.source === 'education' ? 'info' :
                          doc.source === 'work' ? 'warning' : 
                          doc.source === 'personal' ? 'secondary' :
                          doc.source === 'government' ? 'success' :
                          doc.source === 'bank' ? 'info' : 'default'
                        } 
                      />
                      {doc.isMetadataOnly && (
                        <Chip 
                          size="small" 
                          label="REFERENCE ONLY" 
                          color="warning"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      {documentStatuses[index] === 'approved' && (
                        <Chip 
                          size="small" 
                          label="APPROVED" 
                          color="success"
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      {documentStatuses[index] === 'rejected' && (
                        <Chip 
                          size="small" 
                          label="REJECTED" 
                          color="error"
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Document">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Document">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve Document">
                        <IconButton 
                          size="small" 
                          color={documentStatuses[index] === 'approved' ? 'success' : 'default'}
                          onClick={() => handleApproveDocument(doc, index)}
                          disabled={documentStatuses[index] === 'approved'}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Document">
                        <IconButton 
                          size="small" 
                          color={documentStatuses[index] === 'rejected' ? 'error' : 'default'}
                          onClick={() => handleRejectDocument(doc, index)}
                          disabled={documentStatuses[index] === 'rejected'}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                    );
                  })}
                  </List>
                ) : (
                  <Alert severity="info">
                    No documents have been uploaded yet.
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/candidate-portal/${candidateId}`)}
          startIcon={<PersonIcon />}
        >
          View Candidate Portal
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default CandidateReview;
