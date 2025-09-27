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
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  CircularProgress,
  Fab,
  Slide,
  Fade,
  Zoom,
  LinearProgress,
  CardActions,
  ButtonGroup,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Tabs,
  Tab
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon,
  Speed as SpeedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import axios from 'axios';

// Create a dedicated axios instance for candidate portal
const candidateApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// ✨ CUTTING-EDGE STYLED COMPONENTS WITH ANIMATIONS ✨

// Floating animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(63, 81, 181, 0.2); }
  50% { box-shadow: 0 0 20px rgba(63, 81, 181, 0.4), 0 0 30px rgba(63, 81, 181, 0.2); }
  100% { box-shadow: 0 0 5px rgba(63, 81, 181, 0.2); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Glassmorphism Container
const GlassContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '24px',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  }
}));

// Hero Header with Simple Blue
const HeroHeader = styled(Box)(({ theme }) => ({
  background: '#2196f3',
  borderRadius: '16px',
  padding: '24px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '24px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
    animation: `${shimmer} 3s infinite`,
  },
  '& .hero-content': {
    position: 'relative',
    zIndex: 1,
  }
}));

// Modern Card with Hover Effects
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    '& .card-icon': {
      animation: `${pulse} 0.6s ease-in-out`,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)',
    backgroundSize: '300% 100%',
    animation: `${shimmer} 2s ease-in-out infinite`,
  }
}));

// Floating Action Button with Glow
const GlowingFab = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  animation: `${float} 3s ease-in-out infinite`,
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
    animation: `${glow} 1.5s ease-in-out infinite`,
    transform: 'scale(1.1)',
  }
}));

// Status Chip with Enhanced Styling
const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'verified':
        return {
          background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
        };
      case 'rejected':
        return {
          background: 'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
        };
      case 'pending':
        return {
          background: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)',
        };
      default:
        return {
          background: 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)',
          color: 'white',
          fontWeight: 'bold',
        };
    }
  };

  return {
    ...getStatusStyles(),
    borderRadius: '12px',
    padding: '8px 16px',
    fontSize: '0.875rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.05)',
      animation: `${pulse} 0.6s ease-in-out`,
    }
  };
});

// Animated Progress Bar
const AnimatedProgress = styled(LinearProgress)(({ theme }) => ({
  borderRadius: '10px',
  height: '8px',
  background: 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    borderRadius: '10px',
  }
}));

// Modern List Item with Hover Effects
const ModernListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '16px',
  margin: '8px 0',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
    transform: 'translateX(8px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  }
}));

// Gradient Background Container
const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 75%, #f5576c 100%)',
  backgroundSize: '400% 400%',
  animation: `${shimmer} 15s ease infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(1px)',
  }
}));

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

const getAllDocuments = (candidateData, offerLetter = null) => {
  const allDocuments = [];
  
  // Signed Offer Letter (if available)
  if (offerLetter && offerLetter.candidateSignature) {
          allDocuments.push({
      id: 'signed-offer-letter',
      name: 'Signed Offer Letter',
      source: 'offer',
      category: 'Signed Offer Letter',
      uploadedAt: offerLetter.acceptedAt,
      status: 'accepted',
      type: 'offer_letter',
      isOfferLetter: true, // Special flag to handle differently
      offerData: offerLetter
    });
  }
  
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
  
  // Education documents (new flat structure)
  if (candidateData.educationDocuments) {
    candidateData.educationDocuments.forEach((doc, index) => {
      // Only mark as metadata-only if it doesn't have actual file properties
      const isMetadataOnly = !doc.id || !doc.name || !doc.size;
      
      allDocuments.push({
        ...doc,
        source: 'education',
        category: `Education Document ${index + 1}`,
        isMetadataOnly: isMetadataOnly // Only metadata if no file properties
      });
    });
  }
  
  // Work experience documents (new flat structure)
  if (candidateData.workExperienceDocuments) {
    candidateData.workExperienceDocuments.forEach((doc, index) => {
      // Only mark as metadata-only if it doesn't have actual file properties
      const isMetadataOnly = !doc.id || !doc.name || !doc.size;
      
      const typeNames = {
        experienceLetters: 'Experience Letter',
        relievingCertificate: 'Relieving Certificate',
        salarySlips: 'Salary Slip'
      };
      
      allDocuments.push({
        ...doc,
        source: 'work',
        category: typeNames[doc.type] || `Work Document ${index + 1}`,
        type: doc.type,
        isMetadataOnly: isMetadataOnly // Only metadata if no file properties
      });
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

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`candidate-tabpanel-${index}`}
      aria-labelledby={`candidate-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `candidate-tab-${index}`,
    'aria-controls': `candidate-tabpanel-${index}`,
  };
}

const CandidateReview = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState(null);
  const [offerLetter, setOfferLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Document rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rejectionComments, setRejectionComments] = useState('');
  const [documentStatus, setDocumentStatus] = useState('rejected');
  const [updatingDocument, setUpdatingDocument] = useState(false);
  const [documentStatuses, setDocumentStatuses] = useState({}); // Track document approval/rejection status
  const [allDocumentsApproved, setAllDocumentsApproved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load document statuses when candidate data changes
  useEffect(() => {
    if (candidateData) {
      loadDocumentStatusesFromData(candidateData);
    }
  }, [candidateData]);

  // Refresh candidate data
  const refreshCandidateData = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing candidate data...');
      
      const response = await candidateApi.get(`candidate-portal/${candidateId}/status`);
      if (response.data.success) {
        const refreshedData = response.data.candidatePortal;
        console.log('🔄 Refreshed candidate data:', refreshedData);
        console.log('🔍 IT Setup data in refresh:', {
          hasItSetup: !!refreshedData.itSetup,
          itSetupData: refreshedData.itSetup
        });

        setCandidateData(refreshedData);
        setOfferLetter(response.data.offerLetter);
        console.log('✅ Candidate data refreshed');
        
        // Load document statuses from the refreshed data
        loadDocumentStatusesFromData(refreshedData);
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load document statuses from candidate data
  const loadDocumentStatusesFromData = (candidateData) => {
    const statuses = {};
    
    // Profile Photo
    if (candidateData.personalInfo?.profilePhoto?.id) {
      const doc = candidateData.personalInfo.profilePhoto;
      if (doc.status) {
        statuses[doc.id] = { 
          status: doc.status === 'verified' ? 'verified' : doc.status,
          comments: doc.comments || '',
          reviewedAt: doc.reviewedAt
        };
      }
    }
    
    // Government Documents
    if (candidateData.governmentDocuments) {
      ['aadhaarImage', 'panImage'].forEach(docType => {
        const doc = candidateData.governmentDocuments[docType];
        if (doc?.id && doc.status) {
          statuses[doc.id] = { 
            status: doc.status === 'verified' ? 'verified' : doc.status,
            comments: doc.comments || '',
            reviewedAt: doc.reviewedAt
          };
        }
      });
    }
    
    // Bank Documents
    if (candidateData.bankDocuments) {
      ['cancelledCheque', 'passbook', 'bankStatement'].forEach(docType => {
        const doc = candidateData.bankDocuments[docType];
        if (doc?.id && doc.status) {
          statuses[doc.id] = { 
            status: doc.status === 'verified' ? 'verified' : doc.status,
            comments: doc.comments || '',
            reviewedAt: doc.reviewedAt
          };
        }
      });
    }
    
    // Work Experience Documents (new flat structure)
    if (candidateData.workExperienceDocuments) {
      candidateData.workExperienceDocuments.forEach(doc => {
        if (doc?.id && doc.status) {
          statuses[doc.id] = { 
            status: doc.status === 'verified' ? 'verified' : doc.status,
            comments: doc.comments || '',
            reviewedAt: doc.reviewedAt
          };
        }
      });
    }
    
    // Education Documents (new flat structure)
    if (candidateData.educationDocuments) {
      candidateData.educationDocuments.forEach(doc => {
        if (doc?.id && doc.status) {
          statuses[doc.id] = { 
            status: doc.status === 'verified' ? 'verified' : doc.status,
            comments: doc.comments || '',
            reviewedAt: doc.reviewedAt
          };
        }
      });
    }
    
    console.log('📊 Loaded document statuses from data:', statuses);
    setDocumentStatuses(statuses);
    
    // Check if all documents are approved after loading statuses
    setTimeout(() => checkAllDocumentsApproved(), 100);
  };

  // Check if all documents are approved
  const checkAllDocumentsApproved = () => {
    const allDocs = getAllDocuments(candidateData, offerLetter);
    // Filter out metadata-only documents and offer letters (offer letters are already accepted)
    const reviewableDocuments = allDocs.filter(doc => !doc.isMetadataOnly && !doc.isOfferLetter);
    
    if (reviewableDocuments.length === 0) {
      console.log('📊 No reviewable documents found');
      return;
    }
    
    const approvedCount = reviewableDocuments.filter(doc => 
      documentStatuses[doc.id]?.status === 'verified'
    ).length;
    
    console.log(`📊 Document approval status: ${approvedCount}/${reviewableDocuments.length} approved`);
    console.log('📊 Reviewable documents:', reviewableDocuments.map(doc => `${doc.name} (${doc.id}): ${documentStatuses[doc.id]?.status || 'pending'}`));
    
    if (approvedCount === reviewableDocuments.length && !allDocumentsApproved) {
      setAllDocumentsApproved(true);
      
      // Notify candidate via API
      notifyDocumentsApproved();
      
      // Show success message to HR
      alert(`🎉 All ${reviewableDocuments.length} reviewable documents have been approved for ${candidateData?.personalInfo?.fullName || candidateId}!\n\nThe candidate will be notified that their document review is complete.`);
    }
  };

  // Notify candidate that all documents are approved
  const notifyDocumentsApproved = async () => {
    try {
      console.log('🔔 Notifying candidate that all documents are approved');
      const response = await candidateApi.post(`candidate-portal/${candidateId}/documents-approved`);
      
      if (response.data.success) {
        console.log('✅ Candidate notified successfully');
      }
    } catch (error) {
      console.error('❌ Error notifying candidate:', error);
      // Don't show error to HR as this is a background operation
    }
  };

  // Document status update functions
  const handleApproveDocument = async (doc) => {
    try {
      // Prevent approval of metadata-only documents
      if (doc.isMetadataOnly) {
        alert('This is a reference-only document that doesn\'t require approval. Only uploaded files need to be reviewed.');
        return;
      }
      
      // Prevent approval of offer letters
      if (doc.isOfferLetter) {
        alert('Offer letters are automatically accepted when signed and don\'t require separate approval.');
        return;
      }
      
      setUpdatingDocument(true);
      console.log('🔄 Approving document:', doc.id, 'for candidate:', candidateId);
      
      const response = await candidateApi.put(`candidate-portal/${candidateId}/document/${doc.id}/status`, {
        status: 'verified',
        comments: 'Document approved by HR'
      });

      if (response.data.success) {
        setDocumentStatuses(prev => ({
          ...prev,
          [doc.id]: { status: 'verified', comments: 'Document approved by HR' }
        }));
        
        console.log('✅ Document approved successfully:', doc.name);
        alert(`Document "${doc.name}" has been approved successfully!`);
        
      // Check if all documents are now approved
      checkAllDocumentsApproved();
      } else {
        throw new Error(response.data.message || 'Failed to approve document');
      }
    } catch (error) {
      console.error('❌ Error approving document:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        alert(`Document not found. Please refresh the page and try again.`);
      } else if (error.response?.data?.message) {
        alert(`Failed to approve document: ${error.response.data.message}`);
      } else {
        alert('Failed to approve document. Please try again.');
      }
    } finally {
      setUpdatingDocument(false);
    }
  };

  const handleRejectDocument = (doc) => {
    // Prevent rejection of metadata-only documents
    if (doc.isMetadataOnly) {
      alert('This is a reference-only document that doesn\'t require approval. Only uploaded files need to be reviewed.');
      return;
    }
    
    // Prevent rejection of offer letters
    if (doc.isOfferLetter) {
      alert('Offer letters are automatically accepted when signed and don\'t require separate approval.');
      return;
    }
    
    setSelectedDocument(doc);
    setRejectionComments('');
    setDocumentStatus('rejected');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedDocument || !rejectionComments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setUpdatingDocument(true);
      console.log('🔄 Rejecting document:', selectedDocument.id, 'for candidate:', candidateId);
      
      const response = await candidateApi.put(`candidate-portal/${candidateId}/document/${selectedDocument.id}/status`, {
        status: documentStatus,
        comments: rejectionComments.trim()
      });

      if (response.data.success) {
        setDocumentStatuses(prev => ({
          ...prev,
          [selectedDocument.id]: { 
            status: documentStatus, 
            comments: rejectionComments.trim() 
          }
        }));
        setRejectDialogOpen(false);
        setSelectedDocument(null);
        setRejectionComments('');
        
        console.log('✅ Document status updated successfully:', selectedDocument.name);
        alert(`Document "${selectedDocument.name}" has been ${documentStatus === 'rejected' ? 'rejected' : 'marked as pending'}. The candidate will be notified.`);
      } else {
        throw new Error(response.data.message || 'Failed to update document status');
      }
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        alert(`Document not found. Please refresh the page and try again.`);
      } else if (error.response?.data?.message) {
        alert(`Failed to update document status: ${error.response.data.message}`);
      } else {
        alert('Failed to update document status. Please try again.');
      }
    } finally {
      setUpdatingDocument(false);
    }
  };

  // Document action handlers
  const handleDownloadDocument = async (doc) => {
    try {
      // Handle signed offer letter specially
      if (doc.isOfferLetter) {
        // Generate a PDF-like view or open in new tab
        handleViewDocument(doc);
        return;
      }
      
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

  const handleViewDocument = async (doc) => {
    try {
      // Handle signed offer letter specially
      if (doc.isOfferLetter) {
        // Fetch complete offer letter data including signature image
        try {
          const offerResponse = await candidateApi.get(`candidate-portal/${candidateId}/offer-letter`);
          if (!offerResponse.data.success) {
            alert('Unable to load complete offer letter data');
            return;
          }
          
          const completeOfferData = offerResponse.data.offerLetter;
          const candidateInfo = offerResponse.data.candidateInfo;
          
          const newWindow = window.open('', '_blank', 'width=800,height=900');
          if (!newWindow) {
            alert('Pop-up blocked. Please allow pop-ups for this site to view the offer letter.');
            return;
          }
        
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Signed Offer Letter - ${candidateInfo.employeeName}</title>
              <style>
                body { 
                  font-family: 'Times New Roman', Times, serif; 
                  margin: 40px; 
                  line-height: 1.6; 
                  color: #000;
                  background: white;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  padding: 40px;
                }
                .company-header { 
                  text-align: center; 
                  border-bottom: 2px solid #2e7d32; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px; 
                }
                .company-name { 
                  font-size: 20px; 
                  font-weight: bold; 
                  color: #2e7d32; 
                  margin-bottom: 10px;
                  font-family: 'Times New Roman', Times, serif;
                }
                .company-address {
                  font-size: 12px;
                  margin: 5px 0;
                  font-family: 'Times New Roman', Times, serif;
                }
                .date-section {
                  margin: 30px 0;
                }
                .greeting {
                  margin: 20px 0;
                  font-weight: bold;
                }
                .content-paragraph {
                  margin: 15px 0;
                  text-align: justify;
                }
                .terms-section {
                  margin: 30px 0;
                }
                .terms-title {
                  font-weight: bold;
                  margin: 20px 0 10px 0;
                  font-size: 16px;
                }
                .terms-list {
                  margin: 10px 0;
                  padding-left: 20px;
                }
                .terms-list li {
                  margin: 8px 0;
                }
                .signature-section { 
                  margin-top: 50px; 
                  border-top: 1px solid #ccc;
                  padding-top: 30px;
                }
                .signature-details {
                  text-align: center;
                  margin: 20px 0;
                }
                .signature-image { 
                  max-width: 300px; 
                  max-height: 150px; 
                  border: 1px solid #ccc; 
                  margin: 15px 0;
                }
                .accepted-stamp { 
                  background: #4CAF50; 
                  color: white; 
                  padding: 10px 20px; 
                  border-radius: 5px; 
                  display: inline-block; 
                  margin: 20px 0;
                  font-weight: bold;
                  font-size: 14px;
                }
                .employment-details {
                  margin: 20px 0;
                  border: 1px solid #ddd;
                  padding: 15px;
                  background: #f9f9f9;
                }
                .detail-row {
                  margin: 8px 0;
                }
                .print-btn {
                  background: #2e7d32;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 3px;
                  cursor: pointer;
                  margin: 10px 5px;
                  font-size: 12px;
                }
                .print-btn:hover {
                  background: #1b5e20;
                }
                @media print {
                  body { margin: 0; }
                  .print-btn { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <!-- Codervalue Solutions Letterhead -->
                <div class="company-header">
                  <div class="company-name">${completeOfferData.companyName || 'CODERVALUE SOLUTIONS PRIVATE LIMITED'}</div>
                  <div class="company-address">${completeOfferData.companyAddress || 'Office 303, 3rd Floor, H-47, USIS BIZPARK, Sector 63, Gautam Buddha Nagar, Noida, Uttar Pradesh, 201309'}</div>
                  <div class="company-address">CIN Number: ${completeOfferData.cinNumber || 'U72900UP2021PTC141154'}</div>
                </div>

                <!-- Date -->
                <div class="date-section">
                  <strong>Dated: ${new Date(completeOfferData.sentAt || completeOfferData.acceptedAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</strong>
                </div>

                <!-- Greeting -->
                <div class="greeting">
                  Dear ${candidateInfo.employeeName},
                </div>

                <!-- Opening Paragraph -->
                <div class="content-paragraph">
                  We are pleased to extend our offer of employment to you for the position of <strong>${completeOfferData.position}</strong> with 
                  Codervalue Solutions Pvt. Ltd. We extend this offer, and the opportunity it represents, with great 
                  confidence in your abilities.
                </div>

                <div class="content-paragraph">
                  We would like you to join us by <strong>${new Date(completeOfferData.startDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</strong>.
                </div>

                <!-- Employment Details -->
                <div class="employment-details">
                  <div class="terms-title">Terms & Conditions of Your Employment:</div>
                  
                  <div class="detail-row">
                    <strong>Position:</strong> ${completeOfferData.position}
                  </div>
                  <div class="detail-row">
                    <strong>Department:</strong> ${completeOfferData.department}
                  </div>
                  <div class="detail-row">
                    <strong>Annual Salary:</strong> ₹${completeOfferData.salary?.toLocaleString('en-IN')}
                  </div>
                  <div class="detail-row">
                    <strong>Employment Type:</strong> ${completeOfferData.employmentType === 'full_time' ? 'Full-time' : completeOfferData.employmentType}
                  </div>
                  <div class="detail-row">
                    <strong>Probation Period:</strong> ${completeOfferData.probationPeriod || 3} months
                  </div>
                  ${completeOfferData.reportingManager ? `
                  <div class="detail-row">
                    <strong>Reporting Manager:</strong> ${completeOfferData.reportingManager}
                  </div>
                  ` : ''}
                  ${completeOfferData.workLocation ? `
                  <div class="detail-row">
                    <strong>Work Location:</strong> ${completeOfferData.workLocation}
                  </div>
                  ` : ''}
                  
                  <!-- Notice Periods -->
                  <div class="detail-row">
                    <strong>Notice Period (During Probation):</strong> ${completeOfferData.noticePeriodProbation || 30} days
                  </div>
                  <div class="detail-row">
                    <strong>Notice Period (After Confirmation):</strong> ${completeOfferData.noticePeriodRegular || 60} days
                  </div>
                  <div class="detail-row">
                    <strong>Retirement Age:</strong> ${completeOfferData.retirementAge || 58} years
                  </div>
                </div>

                <!-- Benefits Section -->
                ${completeOfferData.benefits && completeOfferData.benefits.length > 0 ? `
                <div class="terms-section">
                  <div class="terms-title">Benefits & Perks:</div>
                  <ul class="terms-list">
                    ${completeOfferData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}

                <!-- Terms & Conditions -->
                ${completeOfferData.terms && completeOfferData.terms.length > 0 ? `
                <div class="terms-section">
                  <div class="terms-title">Additional Terms & Conditions:</div>
                  <ul class="terms-list">
                    ${completeOfferData.terms.map(term => `<li>${term}</li>`).join('')}
                  </ul>
                </div>
                ` : ''}

                <!-- Non-Compete and Confidentiality -->
                <div class="terms-section">
                  <div class="terms-title">Confidentiality & Non-Compete:</div>
                  <ul class="terms-list">
                    <li>Non-compete period: ${completeOfferData.nonCompetePeriod || 12} months after termination</li>
                    <li>Non-solicitation period: ${completeOfferData.nonSolicitationPeriod || 24} months after termination</li>
                    <li>Confidentiality obligations continue indefinitely</li>
                  </ul>
                </div>

                <!-- Closing -->
                <div class="content-paragraph">
                  This offer is valid until <strong>${new Date(completeOfferData.expiryDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</strong>.
                </div>

                <div class="content-paragraph">
                  We look forward to welcoming you to our team!
                </div>

                <div class="content-paragraph">
                  Best regards,<br/>
                  <strong>HR Team</strong><br/>
                  Codervalue Solutions Pvt. Ltd.
                </div>

                <!-- Acceptance Status -->
                <div style="text-align: center; margin: 40px 0;">
                  <div class="accepted-stamp">✓ OFFER ACCEPTED & DIGITALLY SIGNED</div>
                  <div style="margin: 10px 0;">
                    <strong>Accepted on:</strong> ${new Date(completeOfferData.acceptedAt).toLocaleDateString('en-GB', { 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  ${completeOfferData.acceptanceComments ? `
                  <div style="margin: 10px 0; font-style: italic;">
                    <strong>Comments:</strong> "${completeOfferData.acceptanceComments}"
                  </div>
                  ` : ''}
                </div>
                
                <!-- Digital Signature Section -->
                <div class="signature-section">
                  <div class="terms-title">Digital Signature:</div>
                  <div class="signature-details">
                    <div style="margin-bottom: 15px;">
                      <strong>Signed by:</strong> ${completeOfferData.candidateSignature.name}<br/>
                      <strong>Method:</strong> ${completeOfferData.candidateSignature.method}<br/>
                      <strong>Timestamp:</strong> ${new Date(completeOfferData.candidateSignature.timestamp).toLocaleString('en-GB')}
                    </div>
                    <div>
                      <img src="${completeOfferData.candidateSignature.data}" alt="Digital Signature" class="signature-image" onerror="this.style.display='none'; this.nextSibling.style.display='block';" />
                      <div style="display: none; padding: 20px; border: 2px dashed #ccc; color: #666;">
                        Signature image could not be loaded
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <button class="print-btn" onclick="window.print()">Print Document</button>
                    <button class="print-btn" onclick="window.close()">Close Window</button>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `);
          newWindow.document.close();
          return;
        } catch (offerError) {
          console.error('❌ Error fetching complete offer letter:', offerError);
          alert('Failed to load complete offer letter data. Please try again.');
          return;
        }
      }
      
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
          console.log('🔍 Candidate data received:', serverData);
          console.log('🔍 IT Setup data check:', {
            hasItSetup: !!serverData.itSetup,
            itSetupData: serverData.itSetup
          });
          
          // Store offer letter data if available
          if (response.data.offerLetter) {
            setOfferLetter(response.data.offerLetter);
          }
          
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
    <GradientBackground>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 4, pb: 8 }}>
        {/* Floating Action Buttons */}
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
          <Stack spacing={2}>
            <GlowingFab size="small" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </GlowingFab>
            <GlowingFab size="small" onClick={refreshCandidateData} disabled={refreshing}>
              <RefreshIcon />
            </GlowingFab>
          </Stack>
        </Box>

        {/* Hero Header Section */}
        <Fade in timeout={800}>
          <HeroHeader>
            <div className="hero-content">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mr: 2,
                    background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
                    color: '#667eea',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {candidateData.personalInfo?.firstName?.[0]?.toUpperCase() || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    🚀 Candidate Review Dashboard
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    {candidateData.personalInfo?.firstName} {candidateData.personalInfo?.lastName} • {candidateId}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
                    <StatusChip 
                      status="verified" 
                      label={`✨ ${getTotalDocuments(candidateData)} Documents`} 
                      icon={<DescriptionIcon />} 
                    />
                    <StatusChip 
                      status="pending" 
                      label="🎯 In Review" 
                      icon={<AssessmentIcon />} 
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Progress Indicator */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Review Progress
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {Math.round((Object.values(documentStatuses).filter(s => s.status === 'verified').length / Math.max(Object.keys(documentStatuses).length, 1)) * 100)}%
                  </Typography>
                </Box>
                <AnimatedProgress 
                  variant="determinate" 
                  value={Math.round((Object.values(documentStatuses).filter(s => s.status === 'verified').length / Math.max(Object.keys(documentStatuses).length, 1)) * 100)} 
                />
              </Box>
            </div>
          </HeroHeader>
        </Fade>

        {/* Modern Navigation Breadcrumbs */}
        <Slide direction="right" in timeout={600}>
          <GlassContainer sx={{ mb: 4, py: 2 }}>
            <Breadcrumbs sx={{ '& .MuiBreadcrumbs-separator': { color: '#667eea' } }}>
              <Button
                startIcon={<HomeIcon />}
          onClick={() => navigate('/organization')}
                sx={{ 
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
          Organization
              </Button>
              <Button
                startIcon={<DashboardIcon />}
          onClick={() => navigate('/organization')}
                sx={{ 
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                Onboardings
              </Button>
              <Chip 
                label="🎯 Active Review" 
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
      </Breadcrumbs>
          </GlassContainer>
        </Slide>

        {/* Cutting-Edge Tabbed Interface */}
        <Paper 
          sx={{ 
            width: '100%', 
            mb: 4, 
            borderRadius: '24px', 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd)',
              backgroundSize: '300% 100%',
              animation: 'gradient-shift 3s ease infinite',
            },
            '@keyframes gradient-shift': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            }
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px 20px 0 0',
              margin: '4px 4px 0 4px',
              '& .MuiTabs-indicator': {
                height: '4px',
                borderRadius: '2px',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              },
              '& .MuiTab-root': {
                minWidth: 140,
                minHeight: 80,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                color: '#64748b',
                padding: '16px 24px',
                margin: '8px 4px',
                borderRadius: '16px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  transition: 'left 0.6s',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                  '&::before': {
                    left: '100%',
                  }
                },
                '&.Mui-selected': {
                  color: '#1976d2',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.25)',
                  '& .MuiSvgIcon-root': {
                    filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3))',
                  },
                  '& .tab-emoji': {
                    transform: 'scale(1.2)',
                    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                  }
                }
              }
            }}
          >
            <Tab 
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  mb: 1,
                  transition: 'all 0.3s ease'
                }}>
                  <PersonIcon sx={{ fontSize: '1.5rem' }} />
                </Box>
              } 
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                    Personal Information
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Profile & Details
                  </Typography>
                </Box>
              }
              {...a11yProps(0)}
            />
            <Tab 
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  color: 'white',
                  mb: 1,
                  transition: 'all 0.3s ease'
                }}>
                  <AccountBalanceIcon sx={{ fontSize: '1.5rem' }} />
                </Box>
              } 
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                    Bank & Government
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Financial & Legal
                  </Typography>
                </Box>
              }
              {...a11yProps(1)}
            />
            <Tab 
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  mb: 1,
                  transition: 'all 0.3s ease'
                }}>
                  <DescriptionIcon sx={{ fontSize: '1.5rem' }} />
                </Box>
              } 
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                    Documents
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Files & Uploads
                  </Typography>
                </Box>
              }
              {...a11yProps(2)}
            />
            <Tab 
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  fontSize: '1.8rem',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  className: 'tab-emoji'
                }}>
                  💻
                </Box>
              } 
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                    IT Setup
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Hardware & Software
                  </Typography>
                </Box>
              }
              {...a11yProps(3)}
            />
            <Tab 
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                  fontSize: '1.8rem',
                  mb: 1,
                  transition: 'all 0.3s ease',
                  className: 'tab-emoji'
                }}>
                  👥
                </Box>
              } 
              label={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                    HR Setup
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Processes & Docs
                  </Typography>
                </Box>
              }
              {...a11yProps(4)}
            />
          </Tabs>

          {/* Tab Panel Content Area */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0 0 20px 20px',
            minHeight: '600px',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)',
              borderRadius: '0 0 20px 20px',
              pointerEvents: 'none',
            }
          }}>
            {/* Tab Panel 0: Personal Information */}
            <TabPanel value={tabValue} index={0}>
            {candidateData.personalInfo && (
              <Card sx={{ 
                mb: 3, 
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                }
              }}>
                <CardHeader 
                  title={
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                      }}>
                        <PersonIcon sx={{ fontSize: '1.5rem' }} />
                      </Box>
                      Personal Information
                    </Typography>
                  }
                  sx={{ pb: 2 }}
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
                        Employee Code
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.employeeCode || candidateId || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Mobile Number
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.mobileNumber || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Date of Birth
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.employeeDOB ? 
                          new Date(candidateData.personalInfo.employeeDOB).toLocaleDateString() : 
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
                        Employment Status
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.employmentStatus || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Reporting Manager
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.reportingManager || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Designation
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.designation || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Department
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.department || 'Not provided'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Date of Joining
                      </Typography>
                      <Box sx={{ fontWeight: 500 }}>
                        {candidateData.personalInfo.dateOfJoining ? 
                          new Date(candidateData.personalInfo.dateOfJoining).toLocaleDateString() : 
                          'Not provided'
                        }
                      </Box>
                    </Grid>
                    
                    {/* Profile Picture Section */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        Profile Photo
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
                              No profile photo uploaded yet.
                            </Alert>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            {/* Address Information */}
            {(candidateData.addressInfo?.currentAddress || candidateData.addressInfo?.permanentAddress) && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="Address Information" 
                  avatar={<LocationOnIcon color="primary" />}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {candidateData.addressInfo?.currentAddress && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Current Address</Typography>
                        <Typography variant="body2">
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
                    {candidateData.addressInfo?.permanentAddress && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Permanent Address</Typography>
                        <Typography variant="body2">
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
            
            {/* Education & Experience Section */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
              }
            }}>
              <CardHeader 
                title={
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(78, 205, 196, 0.3)'
                    }}>
                      <SchoolIcon sx={{ fontSize: '1.5rem' }} />
                    </Box>
                    Education & Experience
                  </Typography>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Education Subsection */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1 }} />
                      Educational Qualifications
                    </Typography>
                    {candidateData.educationQualifications && candidateData.educationQualifications.length > 0 ? (
                      candidateData.educationQualifications.map((edu, index) => (
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
                      ))
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No educational qualifications provided yet.
                      </Alert>
                    )}
                  </Grid>

                  {/* Work Experience Subsection */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                      <WorkIcon sx={{ mr: 1 }} />
                      Work Experience
                    </Typography>
                    {candidateData.workExperience?.totalExperience && (
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        Total Experience: {candidateData.workExperience.totalExperience} years
                      </Typography>
                    )}
                    {((candidateData.workExperience?.experienceDetails && candidateData.workExperience.experienceDetails.length > 0) || 
                      (Array.isArray(candidateData.workExperience) && candidateData.workExperience.length > 0)) ? (
                      <>
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
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        No work experience provided yet.
                      </Alert>
                    )}
                  </Grid>
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
                    <Box key={index} sx={{ 
                      mb: index < candidateData.emergencyContacts.length - 1 ? 3 : 0, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      backgroundColor: '#fafafa'
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {contact.name || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Relationship
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {contact.relationship || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Phone
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {contact.phone || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Email
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {contact.email || 'Not provided'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Tab Panel 1: Bank & Government Details */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Bank & Government Details" 
                avatar={<AccountBalanceIcon color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Government Details */}
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
                  </Grid>

                  {/* Bank Details */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                      <AccountBalanceIcon sx={{ mr: 1 }} />
                      Banking Information
                    </Typography>
                    {candidateData.bankDetails ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Bank Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.bankName || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Account Number</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.accountNumber || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>IFSC Code</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.ifscCode || 'Not provided'}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Account Holder Name</Typography>
                          <Box sx={{ fontWeight: 500 }}>
                            {candidateData.bankDetails.accountHolderName || 'Not provided'}
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        No banking information provided yet.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab Panel 2: Documents */}
          <TabPanel value={tabValue} index={2}>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title={`Documents (${getAllDocuments(candidateData, offerLetter).length})`}
                avatar={<DescriptionIcon color="primary" />}
                action={
                  <Button 
                    onClick={refreshCandidateData} 
                    disabled={refreshing}
                    startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                    size="small"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                }
              />
              <CardContent>
                {(() => {
                  const allDocs = getAllDocuments(candidateData, offerLetter);
                  if (allDocs.length === 0) {
                    return (
                      <Alert severity="info" sx={{ textAlign: 'center' }}>
                        No documents uploaded yet.
                      </Alert>
                    );
                  }

                  return (
                    <List sx={{ width: '100%', p: 0 }}>
                      {allDocs.map((doc, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: '#fafafa',
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <ListItemIcon>
                            <DescriptionIcon sx={{ color: '#666' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {doc.name || `Document ${index + 1}`}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  size="small"
                                  label={
                                    documentStatuses[doc.id]?.status?.toUpperCase() || 
                                    doc.status?.toUpperCase() || 
                                    'PENDING'
                                  }
                                  color={
                                    (documentStatuses[doc.id]?.status || doc.status) === 'verified' ? 'success' :
                                    (documentStatuses[doc.id]?.status || doc.status) === 'rejected' ? 'error' :
                                    'default'
                                  }
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {doc.type?.replace('_', ' ') || doc.source} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown Date'}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewDocument(doc)}
                                sx={{ minWidth: 'auto', px: 2 }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadDocument(doc)}
                                sx={{ minWidth: 'auto', px: 2 }}
                              >
                                Download
                              </Button>
                              {!doc.isOfferLetter && !doc.isMetadataOnly && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApproveDocument(doc)}
                                    disabled={documentStatuses[doc.id]?.status === 'verified'}
                                    sx={{ 
                                      color: documentStatuses[doc.id]?.status === 'verified' ? '#4caf50' : '#666'
                                    }}
                                  >
                                    {documentStatuses[doc.id]?.status === 'verified' ? <VerifiedIcon /> : <ApproveIcon />}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRejectDocument(doc)}
                                    disabled={documentStatuses[doc.id]?.status === 'rejected'}
                                    sx={{ 
                                      color: documentStatuses[doc.id]?.status === 'rejected' ? '#f44336' : '#666'
                                    }}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  );
                })()}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab Panel 3: IT Setup */}
          <TabPanel value={tabValue} index={3}>
            {candidateData?.itSetup && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="IT Setup Information" 
                  avatar={<Box component="span" sx={{ fontSize: '1.5rem' }}>💻</Box>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Hardware Equipment */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            💻 Hardware Equipment
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.hardware && Object.entries(candidateData.itSetup.hardware).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.assigned ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.model && ` (${item.model})`}
                                  {item.assignedDate && ` - ${item.assignedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Software & Accounts */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            💾 Software & Accounts
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.software && Object.entries(candidateData.itSetup.software).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.setup ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.account && ` (${item.account})`}
                                  {item.setupDate && ` - ${item.setupDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Access & Security */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            🔐 Access & Security
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.itSetup.access && Object.entries(candidateData.itSetup.access).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.granted ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                  {(item.cardNumber || item.spotNumber || item.credentials) && 
                                    ` (${item.cardNumber || item.spotNumber || item.credentials})`}
                                  {item.grantedDate && ` - ${item.grantedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Progress Summary */}
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      {(() => {
                        const hardwareItems = candidateData.itSetup.hardware ? Object.values(candidateData.itSetup.hardware) : [];
                        const softwareItems = candidateData.itSetup.software ? Object.values(candidateData.itSetup.software) : [];
                        const accessItems = candidateData.itSetup.access ? Object.values(candidateData.itSetup.access) : [];
                        
                        const hardwareCompleted = hardwareItems.filter(item => item.assigned).length;
                        const softwareCompleted = softwareItems.filter(item => item.setup).length;
                        const accessCompleted = accessItems.filter(item => item.granted).length;
                        
                        const totalItems = hardwareItems.length + softwareItems.length + accessItems.length;
                        const completedItems = hardwareCompleted + softwareCompleted + accessCompleted;
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: '#333' }}>
                              IT Setup Progress:
                            </Typography>
                            <Chip 
                              label={`${progress}% Complete (${completedItems}/${totalItems})`}
                              color={progress === 100 ? "success" : progress > 50 ? "warning" : "default"}
                              sx={{ fontWeight: 600, fontSize: '1rem' }}
                            />
                            {candidateData.itSetup.completedDate && (
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Completed: {candidateData.itSetup.completedDate}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
            {!candidateData?.itSetup && (
              <Alert severity="info">
                No IT setup information available yet.
              </Alert>
            )}
          </TabPanel>

          {/* Tab Panel 4: HR Setup */}
          <TabPanel value={tabValue} index={4}>
            {candidateData?.hrSetup && (
              <Card sx={{ mb: 3 }}>
                <CardHeader 
                  title="HR Setup Information" 
                  avatar={<Box component="span" sx={{ fontSize: '1.5rem' }}>👥</Box>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* HR Processes */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            👥 HR Processes
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.hrSetup.processes && Object.entries(candidateData.hrSetup.processes).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.completed ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key === 'employeeId' ? 'Employee ID Assignment' :
                                    key === 'policies' ? 'Company Policies' :
                                    key === 'handbook' ? 'Employee Handbook' :
                                    key === 'benefits' ? 'Benefits Explanation' :
                                    key === 'payroll' ? 'Payroll Setup' :
                                    key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.completedDate && ` - ${item.completedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* HR Documents */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#333' }}>
                            📋 HR Documentation
                          </Typography>
                          <Stack spacing={1}>
                            {candidateData.hrSetup.documents && Object.entries(candidateData.hrSetup.documents).map(([key, item]) => (
                              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.provided ? (
                                  <CheckCircleIcon sx={{ color: '#4caf50' }} fontSize="small" />
                                ) : (
                                  <CancelIcon sx={{ color: '#f44336' }} fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {key === 'contract' ? 'Employment Contract' :
                                    key === 'nda' ? 'NDA Agreement' :
                                    key === 'handbook' ? 'Employee Handbook' :
                                    key === 'policies' ? 'Policy Documents' :
                                    key.charAt(0).toUpperCase() + key.slice(1)}
                                  {item.providedDate && ` - ${item.providedDate}`}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* HR Progress Summary */}
                  <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      {(() => {
                        const processItems = candidateData.hrSetup.processes ? Object.values(candidateData.hrSetup.processes) : [];
                        const documentItems = candidateData.hrSetup.documents ? Object.values(candidateData.hrSetup.documents) : [];
                        
                        const processCompleted = processItems.filter(item => item.completed).length;
                        const documentsProvided = documentItems.filter(item => item.provided).length;
                        
                        const totalItems = processItems.length + documentItems.length;
                        const completedItems = processCompleted + documentsProvided;
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: '#333' }}>
                              HR Setup Progress:
                            </Typography>
                            <Chip 
                              label={`${progress}% Complete (${completedItems}/${totalItems})`}
                              color={progress === 100 ? "success" : progress > 50 ? "warning" : "default"}
                              sx={{ fontWeight: 600, fontSize: '1rem' }}
                            />
                            {candidateData.hrSetup.completedDate && (
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Completed: {candidateData.hrSetup.completedDate}
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
            {!candidateData?.hrSetup && (
              <Alert severity="info">
                No HR setup information available yet.
              </Alert>
            )}
          </TabPanel>
          </Box>
        </Paper>

    </Container>

      {/* Document Review Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Document Review
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Review document: {selectedDocument?.name}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={documentStatus}
              label="Action"
              onChange={(e) => setDocumentStatus(e.target.value)}
            >
              <MenuItem value="rejected">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon color="error" />
                  Reject Document
                </Box>
              </MenuItem>
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="warning" />
                  Mark as Pending
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments / Reason"
            placeholder="Please provide details..."
            value={rejectionComments}
            onChange={(e) => setRejectionComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReject}
            color="primary"
            variant="contained"
            disabled={updatingDocument || !rejectionComments.trim()}
          >
            {updatingDocument 
              ? 'Updating...' 
              : (documentStatus === 'rejected' ? 'Reject Document' : 'Mark as Pending')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </GradientBackground>
  );
};

export default CandidateReview;
