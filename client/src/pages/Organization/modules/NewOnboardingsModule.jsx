import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Menu,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CardHeader,
  ButtonGroup,
  Skeleton,
  CircularProgress,
  Badge,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  Computer as ComputerIcon,
  EmojiEvents as CompletionIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Work as WorkIcon,
  AccountBalance as AccountBalanceIcon,
  ContactPhone as ContactPhoneIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
  Key as KeyIcon,
  Link as LinkIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { keyframes, styled } from '@mui/material/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import EmployeeInfoCapture from './onboarding/EmployeeInfoCapture';
import OnboardingWorkflowNew from './onboarding/OnboardingWorkflowNew';
import CreateOnboardingScreen from './CreateOnboardingScreen';
import { useAuth } from '../../../contexts/AuthContext';

// Clean, professional styled components
const CleanCard = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  }
}));

const NewOnboardingsModule = () => {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [offerStatusDialogOpen, setOfferStatusDialogOpen] = useState(false);
  const [selectedOfferData, setSelectedOfferData] = useState(null);
  const [documentReviewDialogOpen, setDocumentReviewDialogOpen] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] = useState(null);
  const [portalCredentialsDialogOpen, setPortalCredentialsDialogOpen] = useState(false);
  const [selectedPortalData, setSelectedPortalData] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [newlyCreatedOnboarding, setNewlyCreatedOnboarding] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalOnboardings: 0,
    activeOnboardings: 0,
    completedOnboardings: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    monthlyTrend: 0
  });

  const workflowSteps = [
    { id: 'offer_letter', step: 1, label: 'Offer Letter', icon: <AssignmentIcon />, description: 'Generate and send offer letters' },
    { id: 'pre_onboarding', step: 2, label: 'Pre-Onboarding', icon: <UploadIcon />, description: 'Collect documents and welcome kit' },
    { id: 'employee_info', step: 3, label: 'Employee Info', icon: <GroupIcon />, description: 'Personal and professional details' },
    { id: 'document_verification', step: 4, label: 'Document Verification', icon: <VerifiedIcon />, description: 'Background verification' },
    { id: 'orientation', step: 5, label: 'Orientation', icon: <SchoolIcon />, description: 'Training and orientation' },
    { id: 'digital_welcome', step: 6, label: 'Digital Welcome', icon: <AutoAwesomeIcon />, description: 'Welcome dashboard setup' },
    { id: 'hardware_software', step: 7, label: 'IT Setup', icon: <ComputerIcon />, description: 'Hardware and software allocation' },
    { id: 'completion', step: 8, label: 'Completion', icon: <CompletionIcon />, description: 'Final signatures and completion' }
  ];

  // Auto-login for development if no user is authenticated
  useEffect(() => {
    const autoLogin = async () => {
      if (!user && !authLoading) {
        console.log('🔐 No user found, attempting auto-login for development...');
        try {
          await login('admin@rannkly.com', 'admin123');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };
    
    autoLogin();
  }, [user, authLoading, login]);

  useEffect(() => {
    if (user) {
      fetchOnboardings();
      loadStatistics();
    }
  }, [user]);

  // Cleanup menu when view changes
  useEffect(() => {
    setMenuOpen(false);
    setSelectedRowId(null);
  }, [currentView]);

  const loadStatistics = async () => {
    setStatsLoading(true);
    try {
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatistics({
        totalOnboardings: onboardings.length || 24,
        activeOnboardings: onboardings.filter(o => o.status === 'in_progress').length || 8,
        completedOnboardings: onboardings.filter(o => o.status === 'completed').length || 16,
        averageCompletionTime: 12,
        completionRate: 85,
        monthlyTrend: 15
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOnboardings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/onboarding');
      setOnboardings(response.data.onboardings || []);
    } catch (error) {
      console.error('Error fetching onboardings:', error);
      toast.error('Failed to load onboardings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortalAccess = async (onboardingId) => {
    try {
      const response = await axios.post(`/onboarding/${onboardingId}/create-portal-access`);

      const { emailSent, candidateId, temporaryPassword, portalUrl, emailError } = response.data;

      if (emailSent) {
        alert(`✅ Portal credentials sent successfully via email!\n\nCandidate ID: ${candidateId}\nPortal URL: ${window.location.origin}${portalUrl}`);
      } else {
        // Show credentials in alert if email failed
        const credentials = `🔐 Portal Access Created!\n\nCandidate ID: ${candidateId}\nTemporary Password: ${temporaryPassword}\nPortal URL: ${window.location.origin}${portalUrl}\n\n⚠️ Please share these credentials securely with the candidate.\n\nEmail Error: ${emailError || 'Email service not configured'}`;
        
        alert(credentials);
        
        // Also log to console for easy copying
        console.log('🔐 CANDIDATE PORTAL CREDENTIALS:');
        console.log('================================');
        console.log(`Candidate ID: ${candidateId}`);
        console.log(`Password: ${temporaryPassword}`);
        console.log(`Portal URL: ${window.location.origin}${portalUrl}`);
        console.log('================================');
      }

    } catch (error) {
      console.error('Error creating portal access:', error);
      if (error.response?.status === 400) {
        alert(`⚠️ ${error.response.data.message}\n\nCandidate ID: ${error.response.data.candidateId}\nPortal URL: ${window.location.origin}${error.response.data.portalUrl}`);
      } else {
        alert('❌ Failed to create portal access. Please try again.');
      }
    }
  };

  const handleViewOfferStatus = (onboardingId) => {
    const selected = onboardings.find(o => o._id === onboardingId);
    if (selected) {
      setSelectedOfferData(selected);
      setOfferStatusDialogOpen(true);
    }
  };

  const handleReviewDocuments = (onboardingId) => {
    const selected = onboardings.find(o => o._id === onboardingId);
    if (selected) {
      // Navigate to the dedicated candidate review page
      navigate(`/candidate-review/${selected.employeeId}`);
    }
  };

  const handleViewPortalCredentials = async (onboardingId) => {
    const selected = onboardings.find(o => o._id === onboardingId);
    if (selected) {
      setCredentialsLoading(true);
      try {
        const response = await axios.get(`/onboarding/${onboardingId}/portal-credentials`);
        setSelectedPortalData(response.data);
        setPortalCredentialsDialogOpen(true);
      } catch (error) {
        console.error('Error fetching portal credentials:', error);
        if (error.response?.status === 404) {
          alert('❌ No portal credentials found for this candidate. Please create portal access first.');
        } else {
          alert('❌ Failed to fetch portal credentials. Please try again.');
        }
      } finally {
        setCredentialsLoading(false);
      }
    }
  };

  const getOfferLetterStatus = (onboarding) => {
    const offerLetter = onboarding.offerLetter;
    
    if (!offerLetter || !offerLetter.status) {
      return (
        <Chip
          size="small"
          label="Not Sent"
          sx={{ bgcolor: '#f5f5f5', color: '#666', fontSize: '0.7rem' }}
        />
      );
    }

    const statusConfig = {
      draft: { label: 'Draft', color: '#9e9e9e', bg: '#f5f5f5' },
      sent: { label: 'Sent', color: '#ff9800', bg: '#fff3e0' },
      viewed: { label: 'Viewed', color: '#2196f3', bg: '#e3f2fd' },
      accepted: { label: 'Accepted', color: '#4caf50', bg: '#e8f5e8' },
      rejected: { label: 'Declined', color: '#f44336', bg: '#ffebee' },
      expired: { label: 'Expired', color: '#9e9e9e', bg: '#fafafa' }
    };

    const config = statusConfig[offerLetter.status] || statusConfig.draft;
    
    const chipElement = (
      <Chip
        size="small"
        label={config.label}
        sx={{ 
          bgcolor: config.bg, 
          color: config.color, 
          fontSize: '0.7rem',
          fontWeight: 500
        }}
      />
    );

    // Add timestamp info if available
    if (offerLetter.acceptedAt) {
      return (
        <Box>
          {chipElement}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            {moment(offerLetter.acceptedAt).format('MMM DD, HH:mm')}
          </Typography>
        </Box>
      );
    }

    if (offerLetter.rejectedAt) {
      return (
        <Box>
          {chipElement}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            {moment(offerLetter.rejectedAt).format('MMM DD, HH:mm')}
          </Typography>
        </Box>
      );
    }

    if (offerLetter.sentAt) {
      return (
        <Box>
          {chipElement}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            Sent {moment(offerLetter.sentAt).fromNow()}
          </Typography>
        </Box>
      );
    }

    return chipElement;
  };

  // Clean Statistics Cards
  const StatisticsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <CleanCard>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}>
                  {statsLoading ? <Skeleton width={40} /> : statistics.totalOnboardings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Onboardings
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main', width: 40, height: 40 }}>
                <PeopleIcon />
              </Avatar>
            </Box>
          </CardContent>
        </CleanCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <CleanCard>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: 'warning.main' }}>
                  {statsLoading ? <Skeleton width={40} /> : statistics.activeOnboardings}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Process
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'transparent', color: 'warning.main', width: 40, height: 40 }}>
                <ScheduleIcon />
              </Avatar>
            </Box>
          </CardContent>
        </CleanCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <CleanCard>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: 'success.main' }}>
                  {statsLoading ? <Skeleton width={40} /> : `${statistics.completionRate}%`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'transparent', color: 'success.main', width: 40, height: 40 }}>
                <CheckCircleIcon />
              </Avatar>
            </Box>
          </CardContent>
        </CleanCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <CleanCard>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, color: 'info.main' }}>
                  {statsLoading ? <Skeleton width={40} /> : `${statistics.averageCompletionTime}d`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Time
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'transparent', color: 'info.main', width: 40, height: 40 }}>
                <TimeIcon />
              </Avatar>
            </Box>
          </CardContent>
        </CleanCard>
      </Grid>
    </Grid>
  );

  // Improved Process Overview with Better Visibility
  const ProcessOverview = () => (
    <CleanCard sx={{ mb: 3 }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            8-Step Onboarding Process
          </Typography>
        }
        subheader="Complete employee onboarding workflow"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCurrentView('create')}
          >
            New Onboarding
          </Button>
        }
      />
      <Divider />
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {workflowSteps.map((step, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={step.id}>
              <Card 
                variant="outlined"
                sx={{ 
                  height: '180px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                    border: '1px solid #1976d2',
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'transparent',
                        color: 'primary.main',
                        width: 40,
                        height: 40,
                        mr: 2
                      }}>
                        {React.cloneElement(step.icon, { fontSize: 'medium' })}
                      </Avatar>
                      <Chip 
                        label={`Step ${step.step} of 8`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: '#1976d2',
                          borderColor: '#1976d2',
                          bgcolor: 'transparent'
                        }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      fontSize: '1rem',
                      color: '#1a1a1a',
                      lineHeight: 1.2
                    }}>
                      {step.label}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#666666',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      fontWeight: 400
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CleanCard>
  );

  // Clean Search and Filter Bar
  const SearchFilterBar = () => (
    <CleanCard sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search onboardings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="offer_sent">Offer Sent</MenuItem>
                <MenuItem value="offer_accepted">Offer Accepted</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCurrentView('create')}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                New Onboarding
              </Button>
              <Button
                startIcon={<FilterListIcon />}
                variant="outlined"
                size="small"
              >
                Filters
              </Button>
              <Button
                startIcon={<ExportIcon />}
                variant="outlined"
                size="small"
              >
                Export
              </Button>
              <IconButton
                onClick={fetchOnboardings}
                size="small"
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </CleanCard>
  );

  // Modern Onboarding Table with Enhanced Styling
  const OnboardingTable = () => {
    const filteredOnboardings = onboardings.filter(onboarding => {
      const matchesSearch = onboarding.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           onboarding.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           onboarding.position?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || onboarding.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const paginatedOnboardings = filteredOnboardings.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    const getStatusColor = (status) => {
      const statusColors = {
        draft: { bg: 'transparent', color: '#6b7280', icon: <EditIcon fontSize="small" /> },
        offer_sent: { bg: 'transparent', color: '#1d4ed8', icon: <EmailIcon fontSize="small" /> },
        offer_accepted: { bg: 'transparent', color: '#059669', icon: <CheckIcon fontSize="small" /> },
        in_progress: { bg: 'transparent', color: '#d97706', icon: <ScheduleIcon fontSize="small" /> },
        completed: { bg: 'transparent', color: '#059669', icon: <CheckCircleIcon fontSize="small" /> },
      };
      return statusColors[status] || statusColors.draft;
    };


    return (
      <CleanCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Offer Letter</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton variant="rectangular" height={50} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" height={6} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedOnboardings.map((onboarding) => {
                  const statusConfig = getStatusColor(onboarding.status);
                  return (
                    <TableRow
                      key={onboarding._id}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 36,
                              height: 36
                            }}
                          >
                            {onboarding.employeeName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {onboarding.employeeName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {onboarding.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {onboarding.position}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {onboarding.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusConfig.icon}
                          label={onboarding.status?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {getOfferLetterStatus(onboarding)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={onboarding.progress || 0}
                            sx={{
                              width: 80,
                              height: 6,
                              borderRadius: 3
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 500, minWidth: 35 }}>
                            {onboarding.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {moment(onboarding.startDate).format('MMM DD, YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                const rect = event.currentTarget.getBoundingClientRect();
                                const menuWidth = 140;
                                const menuHeight = 200; // Approximate height
                                
                                // Calculate position to keep menu within screen bounds
                                let left = rect.left + window.scrollX;
                                let top = rect.bottom + window.scrollY;
                                
                                // Adjust horizontal position if menu would go off-screen
                                if (left + menuWidth > window.innerWidth) {
                                  left = rect.right + window.scrollX - menuWidth;
                                }
                                
                                // Adjust vertical position if menu would go off-screen
                                if (top + menuHeight > window.innerHeight + window.scrollY) {
                                  top = rect.top + window.scrollY - menuHeight;
                                }
                                
                                setMenuPosition({ top, left });
                                setSelectedRowId(onboarding._id);
                                setMenuOpen(true);
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredOnboardings.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </CleanCard>
    );
  };

  // Clean Dashboard View
  const DashboardView = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <StatisticsCards />
      <SearchFilterBar />
      <OnboardingTable />
    </Container>
  );

  // Route handling
  if (currentView === 'workflow' && selectedOnboarding) {
    return (
      <OnboardingWorkflowNew
        onboarding={selectedOnboarding}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedOnboarding(null);
        }}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateOnboardingScreen
        onBack={() => setCurrentView('dashboard')}
        onSuccess={(createdOnboarding) => {
          setNewlyCreatedOnboarding(createdOnboarding);
          setCurrentView('offer-letter-prompt');
          fetchOnboardings();
        }}
      />
    );
  }

  if (currentView === 'offer-letter-prompt' && newlyCreatedOnboarding) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <CleanCard sx={{ textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Avatar sx={{ 
              width: 64, 
              height: 64, 
              mx: 'auto', 
              mb: 3,
              bgcolor: 'success.main'
            }}>
              <CheckCircleIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Onboarding Created Successfully!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              {newlyCreatedOnboarding.employeeName} has been added to the system.
              Would you like to generate and send their offer letter now?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedOnboarding(newlyCreatedOnboarding);
                  setCurrentView('workflow');
                }}
              >
                Generate Offer Letter
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentView('dashboard');
                  setNewlyCreatedOnboarding(null);
                }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </CleanCard>
      </Container>
    );
  }

  // Show loading while authenticating
  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  // Show login prompt if not authenticated (fallback)
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CleanCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please login to access the Employee Onboarding module.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          </CardContent>
        </CleanCard>
      </Container>
    );
  }

  return (
    <>
      <DashboardView />
      
      {/* Simple positioned menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1200,
            }}
            onClick={() => {
              setMenuOpen(false);
              setSelectedRowId(null);
            }}
          />
          
          {/* Menu */}
          <Paper
            sx={{
              position: 'absolute',
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 1300,
              width: 140, // Fixed width
              boxShadow: 3,
            }}
          >
            <List sx={{ py: 0.5, '& .MuiListItem-root': { py: 0.5, minHeight: 32 } }}>
              <ListItem 
                button 
                onClick={() => {
                  const selected = onboardings.find(o => o._id === selectedRowId);
                  if (selected) {
                    setSelectedOnboarding(selected);
                    setCurrentView('workflow');
                  }
                  setMenuOpen(false);
                  setSelectedRowId(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <ViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="View Details" 
                  primaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  handleCreatePortalAccess(selectedRowId);
                  setMenuOpen(false);
                  setSelectedRowId(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Share Portal Access" 
                  primaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  handleViewOfferStatus(selectedRowId);
                  setMenuOpen(false);
                  setSelectedRowId(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="View Offer Status" 
                  primaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              
                <ListItem 
                  button 
                  onClick={() => {
                    handleReviewDocuments(selectedRowId);
                    setMenuOpen(false);
                    setSelectedRowId(null);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <DescriptionIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Review Documents" 
                    primaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
                
                <ListItem 
                  button 
                  onClick={() => {
                    handleViewPortalCredentials(selectedRowId);
                    setMenuOpen(false);
                    setSelectedRowId(null);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <SecurityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Portal Credentials" 
                    primaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  // Add edit functionality here
                  setMenuOpen(false);
                  setSelectedRowId(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Edit Onboarding" 
                  primaryTypographyProps={{ fontSize: '0.8rem' }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => {
                  // Add delete functionality here
                  setMenuOpen(false);
                  setSelectedRowId(null);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Delete" 
                  primaryTypographyProps={{ fontSize: '0.8rem', color: 'error.main' }}
                />
              </ListItem>
            </List>
          </Paper>
        </>
      )}

      {/* Offer Status Dialog */}
      <Dialog 
        open={offerStatusDialogOpen} 
        onClose={() => setOfferStatusDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            Offer Letter Status
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOfferData && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Candidate Info */}
              <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>
                  {selectedOfferData.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOfferData.position} • {selectedOfferData.department}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOfferData.email}
                </Typography>
              </Paper>

              {/* Offer Letter Status */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Current Status
                </Typography>
                {getOfferLetterStatus(selectedOfferData)}
              </Box>

              {/* Timeline */}
              {selectedOfferData.offerLetter && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Timeline
                  </Typography>
                  <List>
                    {selectedOfferData.offerLetter.createdAt && (
                      <ListItem>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Offer Letter Created"
                          secondary={moment(selectedOfferData.offerLetter.createdAt).format('MMMM DD, YYYY at HH:mm')}
                        />
                      </ListItem>
                    )}
                    
                    {selectedOfferData.offerLetter.sentAt && (
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Offer Letter Sent"
                          secondary={moment(selectedOfferData.offerLetter.sentAt).format('MMMM DD, YYYY at HH:mm')}
                        />
                      </ListItem>
                    )}

                    {selectedOfferData.offerLetter.viewedAt && (
                      <ListItem>
                        <ListItemIcon>
                          <ViewIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Offer Letter Viewed"
                          secondary={moment(selectedOfferData.offerLetter.viewedAt).format('MMMM DD, YYYY at HH:mm')}
                        />
                      </ListItem>
                    )}

                    {selectedOfferData.offerLetter.acceptedAt && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Offer Letter Accepted"
                          secondary={moment(selectedOfferData.offerLetter.acceptedAt).format('MMMM DD, YYYY at HH:mm')}
                        />
                      </ListItem>
                    )}

                    {selectedOfferData.offerLetter.rejectedAt && (
                      <ListItem>
                        <ListItemIcon>
                          <CancelIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Offer Letter Declined"
                          secondary={moment(selectedOfferData.offerLetter.rejectedAt).format('MMMM DD, YYYY at HH:mm')}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {/* Digital Signature Info */}
              {selectedOfferData.offerLetter?.candidateSignature && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Digital Signature
                  </Typography>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    {selectedOfferData.offerLetter.candidateSignature.data && (
                      <img 
                        src={selectedOfferData.offerLetter.candidateSignature.data}
                        alt="Candidate Signature"
                        style={{ 
                          maxWidth: '300px', 
                          maxHeight: '100px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Signed by: {selectedOfferData.offerLetter.candidateSignature.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Method: {selectedOfferData.offerLetter.candidateSignature.method || 'Digital Signature'}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Quick Actions */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // If offer is accepted, go to candidate portal for document submission
                      // If offer is sent but not accepted, go to offer acceptance page
                      const portalUrl = selectedOfferData.offerLetter?.acceptedAt 
                        ? `/candidate-portal/${selectedOfferData.employeeId}?step=4`
                        : `/offer-acceptance/${selectedOfferData.employeeId}`;
                      window.open(portalUrl, '_blank');
                    }}
                  >
                    {selectedOfferData.offerLetter?.acceptedAt ? 'View Document Portal' : 'View Offer Acceptance'}
                  </Button>
                  
                  {selectedOfferData.offerLetter?.acceptedAt && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setOfferStatusDialogOpen(false);
                        // Navigate to next step or documents
                        const selected = onboardings.find(o => o._id === selectedOfferData._id);
                        if (selected) {
                          setSelectedOnboarding(selected);
                          setCurrentView('workflow');
                        }
                      }}
                    >
                      Continue Onboarding
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferStatusDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Review Dialog */}
      <Dialog 
        open={documentReviewDialogOpen} 
        onClose={() => setDocumentReviewDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon />
            <div>
              <Typography variant="h6">Complete Candidate Review</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDocumentData?.employeeName} - {selectedDocumentData?.employeeId} | All Information & Documents
              </Typography>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocumentData && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Document Status Overview */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Document Status Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                      <Typography variant="h4" color="info.main">
                        {(() => {
                          let totalDocs = 0;
                          // Legacy documents
                          totalDocs += selectedDocumentData.documents?.length || 0;
                          // Portal documents
                          totalDocs += selectedDocumentData.candidatePortal?.uploadedDocuments?.length || 0;
                          // Education documents
                          if (selectedDocumentData.candidatePortal?.educationQualifications) {
                            selectedDocumentData.candidatePortal.educationQualifications.forEach(edu => {
                              totalDocs += edu.documents?.length || 0;
                            });
                          }
                          // Work experience documents
                          if (selectedDocumentData.candidatePortal?.workExperience?.experienceDetails) {
                            selectedDocumentData.candidatePortal.workExperience.experienceDetails.forEach(work => {
                              if (work.documents) {
                                ['experienceLetters', 'relievingCertificate', 'salarySlips'].forEach(docType => {
                                  totalDocs += work.documents[docType]?.length || 0;
                                });
                              }
                            });
                          }
                          return totalDocs;
                        })()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Documents
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: selectedDocumentData.documentsSubmitted ? 'success.50' : 'warning.50' }}>
                      <Typography variant="h4" color={selectedDocumentData.documentsSubmitted ? 'success.main' : 'warning.main'}>
                        {selectedDocumentData.documentsSubmitted ? 'YES' : 'NO'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submitted
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h4" color="primary.main">
                        {selectedDocumentData.documentsStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Comprehensive Candidate Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Complete Candidate Information
                </Typography>
                
                {/* Personal Information */}
                {selectedDocumentData.candidatePortal?.personalInfo && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Personal Information" 
                      avatar={<PersonIcon color="primary" />}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Full Name</Typography>
                          <Typography variant="body1">
                            {(() => {
                              const firstName = selectedDocumentData.candidatePortal.personalInfo.firstName || '';
                              const lastName = selectedDocumentData.candidatePortal.personalInfo.lastName || '';
                              return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Not provided';
                            })()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.email || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.phone || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                          <Typography variant="body1">
                            {selectedDocumentData.candidatePortal.personalInfo.dateOfBirth ? 
                              new Date(selectedDocumentData.candidatePortal.personalInfo.dateOfBirth).toLocaleDateString() : 
                              'Not provided'
                            }
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Gender</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.gender || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Marital Status</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.maritalStatus || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Aadhaar Number</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.aadharNumber || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">PAN Number</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.personalInfo.panNumber || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Designation</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.additionalInfo?.designation || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Department</Typography>
                          <Typography variant="body1">{selectedDocumentData.candidatePortal.additionalInfo?.department || 'Not provided'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Address Information */}
                {(selectedDocumentData.candidatePortal?.addressInfo?.currentAddress || selectedDocumentData.candidatePortal?.addressInfo?.permanentAddress) && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Address Information" 
                      avatar={<LocationOnIcon color="primary" />}
                    />
                    <CardContent>
                      <Grid container spacing={2}>
                        {selectedDocumentData.candidatePortal.addressInfo.currentAddress && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Current Address</Typography>
                            <Typography variant="body2">
                              {selectedDocumentData.candidatePortal.addressInfo.currentAddress.street && 
                                `${selectedDocumentData.candidatePortal.addressInfo.currentAddress.street}, `}
                              {selectedDocumentData.candidatePortal.addressInfo.currentAddress.city && 
                                `${selectedDocumentData.candidatePortal.addressInfo.currentAddress.city}, `}
                              {selectedDocumentData.candidatePortal.addressInfo.currentAddress.state && 
                                `${selectedDocumentData.candidatePortal.addressInfo.currentAddress.state} - `}
                              {selectedDocumentData.candidatePortal.addressInfo.currentAddress.pincode}
                              {selectedDocumentData.candidatePortal.addressInfo.currentAddress.country && 
                                `, ${selectedDocumentData.candidatePortal.addressInfo.currentAddress.country}`}
                            </Typography>
                          </Grid>
                        )}
                        {selectedDocumentData.candidatePortal.addressInfo.permanentAddress && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Permanent Address</Typography>
                            <Typography variant="body2">
                              {selectedDocumentData.candidatePortal.addressInfo.permanentAddress.street && 
                                `${selectedDocumentData.candidatePortal.addressInfo.permanentAddress.street}, `}
                              {selectedDocumentData.candidatePortal.addressInfo.permanentAddress.city && 
                                `${selectedDocumentData.candidatePortal.addressInfo.permanentAddress.city}, `}
                              {selectedDocumentData.candidatePortal.addressInfo.permanentAddress.state && 
                                `${selectedDocumentData.candidatePortal.addressInfo.permanentAddress.state} - `}
                              {selectedDocumentData.candidatePortal.addressInfo.permanentAddress.pincode}
                              {selectedDocumentData.candidatePortal.addressInfo.permanentAddress.country && 
                                `, ${selectedDocumentData.candidatePortal.addressInfo.permanentAddress.country}`}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Bank Details */}
                {selectedDocumentData.candidatePortal?.bankDetails && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Bank Details" 
                      avatar={<AccountBalanceIcon color="primary" />}
                    />
                    <CardContent>
                      {Array.isArray(selectedDocumentData.candidatePortal.bankDetails) ? (
                        selectedDocumentData.candidatePortal.bankDetails.map((bank, index) => (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                                <Typography variant="body1">{bank.bankName || 'Not provided'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                                <Typography variant="body1">{bank.accountNumber || 'Not provided'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                                <Typography variant="body1">{bank.ifscCode || 'Not provided'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
                                <Typography variant="body1">{bank.accountHolderName || 'Not provided'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Branch</Typography>
                                <Typography variant="body1">{bank.branch || 'Not provided'}</Typography>
                              </Grid>
                              {bank.isPrimary && (
                                <Grid item xs={12} sm={6}>
                                  <Chip label="Primary Account" color="primary" size="small" />
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        ))
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                            <Typography variant="body1">{selectedDocumentData.candidatePortal.bankDetails.bankName || 'Not provided'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Account Number</Typography>
                            <Typography variant="body1">{selectedDocumentData.candidatePortal.bankDetails.accountNumber || 'Not provided'}</Typography>
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Education Qualifications */}
                {selectedDocumentData.candidatePortal?.educationQualifications && selectedDocumentData.candidatePortal.educationQualifications.length > 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Education Qualifications" 
                      avatar={<SchoolIcon color="primary" />}
                    />
                    <CardContent>
                      {selectedDocumentData.candidatePortal.educationQualifications.map((edu, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Degree</Typography>
                              <Typography variant="body1">{edu.degree || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Institution</Typography>
                              <Typography variant="body1">{edu.institution || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Year of Passing</Typography>
                              <Typography variant="body1">{edu.yearOfPassing || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Percentage</Typography>
                              <Typography variant="body1">{edu.percentage || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Specialization</Typography>
                              <Typography variant="body1">{edu.specialization || 'Not provided'}</Typography>
                            </Grid>
                            {edu.documents && edu.documents.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Education Documents</Typography>
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
                    </CardContent>
                  </Card>
                )}

                {/* Work Experience */}
                {selectedDocumentData.candidatePortal?.workExperience?.experienceDetails && selectedDocumentData.candidatePortal.workExperience.experienceDetails.length > 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Work Experience" 
                      avatar={<WorkIcon color="primary" />}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Experience: {selectedDocumentData.candidatePortal.workExperience.totalExperience || 'Not specified'} years
                      </Typography>
                      {selectedDocumentData.candidatePortal.workExperience.experienceDetails.map((work, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Company</Typography>
                              <Typography variant="body1">{work.company || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Position</Typography>
                              <Typography variant="body1">{work.position || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Start Date</Typography>
                              <Typography variant="body1">
                                {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Not provided'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">End Date</Typography>
                              <Typography variant="body1">
                                {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Current'}
                              </Typography>
                            </Grid>
                            {work.documents && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Work Documents</Typography>
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
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contacts */}
                {selectedDocumentData.candidatePortal?.emergencyContacts && selectedDocumentData.candidatePortal.emergencyContacts.length > 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardHeader 
                      title="Emergency Contacts" 
                      avatar={<ContactPhoneIcon color="primary" />}
                    />
                    <CardContent>
                      {selectedDocumentData.candidatePortal.emergencyContacts.map((contact, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Name</Typography>
                              <Typography variant="body1">{contact.name || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Relationship</Typography>
                              <Typography variant="body1">{contact.relationship || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Phone</Typography>
                              <Typography variant="body1">{contact.phone || 'Not provided'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Email</Typography>
                              <Typography variant="body1">{contact.email || 'Not provided'}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* All Uploaded Documents */}
                {(() => {
                  // Collect documents from all sources
                  const legacyDocuments = (selectedDocumentData.documents || []).map(doc => ({ ...doc, source: 'legacy' }));
                  const portalDocuments = (selectedDocumentData.candidatePortal?.uploadedDocuments || []).map(doc => ({ ...doc, source: 'portal' }));
                  
                  // Collect documents from education qualifications
                  const educationDocuments = [];
                  if (selectedDocumentData.candidatePortal?.educationQualifications) {
                    selectedDocumentData.candidatePortal.educationQualifications.forEach((edu, index) => {
                      if (edu.documents && edu.documents.length > 0) {
                        edu.documents.forEach(doc => {
                          educationDocuments.push({
                            ...doc,
                            source: 'education',
                            category: `Education ${index + 1}: ${edu.degree || 'Unknown'}`
                          });
                        });
                      }
                    });
                  }
                  
                  // Collect documents from work experience
                  const workDocuments = [];
                  if (selectedDocumentData.candidatePortal?.workExperience?.experienceDetails) {
                    selectedDocumentData.candidatePortal.workExperience.experienceDetails.forEach((work, index) => {
                      if (work.documents) {
                        // Check different types of work documents
                        ['experienceLetters', 'relievingCertificate', 'salarySlips'].forEach(docType => {
                          if (work.documents[docType] && work.documents[docType].length > 0) {
                            work.documents[docType].forEach(doc => {
                              workDocuments.push({
                                ...doc,
                                source: 'work',
                                category: `Work ${index + 1}: ${docType.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                              });
                            });
                          }
                        });
                      }
                    });
                  }
                  
                  const allDocuments = [
                    ...legacyDocuments,
                    ...portalDocuments,
                    ...educationDocuments,
                    ...workDocuments
                  ];
                  
                  return allDocuments.length > 0 ? (
                    <Card sx={{ mb: 2 }}>
                      <CardHeader 
                        title="All Uploaded Documents" 
                        avatar={<DescriptionIcon color="primary" />}
                      />
                      <CardContent>
                  <List>
                          {allDocuments.map((doc, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <DescriptionIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name || `Document ${index + 1}`}
                          secondary={
                                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                              <Chip 
                                size="small" 
                                label={doc.type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'} 
                                color="primary" 
                              />
                              <Typography variant="caption" color="text.secondary">
                                Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown'}
                              </Typography>
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
                                        doc.source === 'work' ? 'warning' : 'default'
                                      } 
                                    />
                                    {doc.category && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {doc.category}
                                      </Typography>
                                    )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Download Document">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  if (doc.url) {
                                    window.open(`http://localhost:5001/${doc.url}`, '_blank');
                                  }
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approve Document">
                              <IconButton size="small" color="success">
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Document">
                              <IconButton size="small" color="error">
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card sx={{ mb: 2 }}>
                      <CardHeader 
                        title="Uploaded Documents" 
                        avatar={<DescriptionIcon color="primary" />}
                      />
                      <CardContent>
                  <Alert severity="info">
                    No documents have been uploaded yet.
                  </Alert>
                      </CardContent>
                    </Card>
                  );
                })()}
              </Box>

              {/* Quick Actions */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      const portalUrl = `/candidate-portal/${selectedDocumentData.employeeId}`;
                      window.open(portalUrl, '_blank');
                    }}
                  >
                    View Document Portal
                  </Button>
                  
                  {selectedDocumentData.documentsSubmitted && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        // Handle approve all documents
                        alert('Approve all documents functionality - to be implemented');
                      }}
                    >
                      Approve All Documents
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EmailIcon />}
                    onClick={() => {
                      // Handle send reminder email
                      alert('Send reminder email functionality - to be implemented');
                    }}
                  >
                    Send Reminder
                  </Button>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentReviewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Portal Credentials Dialog */}
      <Dialog 
        open={portalCredentialsDialogOpen} 
        onClose={() => setPortalCredentialsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon />
            <div>
              <Typography variant="h6">Portal Credentials</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPortalData?.candidateName} - {selectedPortalData?.candidateId}
              </Typography>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent>
          {credentialsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedPortalData ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Credentials Overview */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Security Notice:</strong> These credentials are stored securely and should only be shared with the candidate. 
                  The password will be cleared from our records once the candidate changes it.
                </Typography>
              </Alert>

              {/* Credentials Details */}
              <Paper sx={{ p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Access Credentials
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Candidate ID:</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: 'monospace', 
                      bgcolor: 'white', 
                      p: 1, 
                      borderRadius: 1, 
                      border: '1px solid #e0e0e0',
                      userSelect: 'all'
                    }}>
                      {selectedPortalData.candidateId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Password:</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: 'monospace', 
                      bgcolor: 'white', 
                      p: 1, 
                      borderRadius: 1, 
                      border: '1px solid #e0e0e0',
                      userSelect: 'all'
                    }}>
                      {selectedPortalData.credentials.password}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Portal URL:</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: 'monospace', 
                      bgcolor: 'white', 
                      p: 1, 
                      borderRadius: 1, 
                      border: '1px solid #e0e0e0',
                      userSelect: 'all'
                    }}>
                      {`${window.location.origin}${selectedPortalData.portalUrl}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Access Statistics */}
              <Box>
                <Typography variant="h6" gutterBottom>Access Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h4" color="primary.main">
                        {selectedPortalData.credentials.accessCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Access
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h4" color="success.main">
                        {selectedPortalData.credentials.isActive ? 'YES' : 'NO'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Status
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontSize: '1.5rem' }}>
                        {selectedPortalData.credentials.lastAccessed 
                          ? new Date(selectedPortalData.credentials.lastAccessed).toLocaleDateString()
                          : 'Never'
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Access
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Metadata */}
              <Box>
                <Typography variant="h6" gutterBottom>Creation Details</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Created By" 
                      secondary={selectedPortalData.credentials.createdBy}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Created On" 
                      secondary={selectedPortalData.credentials.createdAt 
                        ? new Date(selectedPortalData.credentials.createdAt).toLocaleString()
                        : 'Unknown'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Candidate Email" 
                      secondary={selectedPortalData.candidateEmail}
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Quick Actions */}
              <Box>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      window.open(selectedPortalData.portalUrl, '_blank');
                    }}
                  >
                    Open Portal
                  </Button>
                  {selectedPortalData.credentials.password.startsWith('[') ? (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<RefreshIcon />}
                      onClick={async () => {
                        if (window.confirm('This will generate new credentials and invalidate any existing ones. Continue?')) {
                          try {
                            const onboardingId = onboardings.find(o => o.employeeId === selectedPortalData.candidateId)?._id;
                            if (onboardingId) {
                              const response = await axios.post(`/onboarding/${onboardingId}/create-portal-access`);
                              alert(`✅ New credentials generated!

Candidate ID: ${response.data.candidateId}
Password: ${response.data.temporaryPassword || 'Sent via email'}
Portal URL: ${window.location.origin}${response.data.portalUrl}`);
                              
                              // Refresh the dialog
                              handleViewPortalCredentials(onboardingId);
                            }
                          } catch (error) {
                            console.error('Error regenerating credentials:', error);
                            alert('❌ Failed to regenerate credentials. Please try again.');
                          }
                        }
                      }}
                    >
                      Regenerate Credentials
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={() => {
                        const subject = 'Portal Access Credentials';
                        const body = `Dear ${selectedPortalData.candidateName},

Your candidate portal credentials:

Candidate ID: ${selectedPortalData.candidateId}
Password: ${selectedPortalData.credentials.password}
Portal URL: ${window.location.origin}${selectedPortalData.portalUrl}

Please keep these credentials secure.

Best regards,
HR Team`;
                        
                        window.open(`mailto:${selectedPortalData.candidateEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                      }}
                    >
                      Email Credentials
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Alert severity="error">
              Failed to load portal credentials.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPortalCredentialsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewOnboardingsModule;