import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Alert,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Fab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Person as PersonIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Computer as ComputerIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  ContactSupport as ContactSupportIcon,
  Star as StarIcon,
  Campaign as CampaignIcon,
  PushPin as PinIcon,
  Poll as PollIcon,
  ThumbUp as ThumbUpIcon,
  Favorite as FavoriteIcon,
  Celebration as CelebrationIcon,
  SupportAgent as SupportAgentIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';
import { formatMinutesToHoursAndMinutes, formatLateStatus } from '../../utils/timeUtils';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
          minHeight: '400px'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, color = '#1976d2', onClick, badge, change }) => {
  const theme = useTheme();
  
  // Determine background gradient based on color
  const getGradient = (baseColor) => {
    const colorMap = {
      '#1976d2': 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)', // blue
      '#388e3c': 'linear-gradient(135deg, #f0fff0 0%, #ffffff 100%)', // green
      '#00acc1': 'linear-gradient(135deg, #f0fdff 0%, #ffffff 100%)', // cyan
      '#7b1fa2': 'linear-gradient(135deg, #f8f0ff 0%, #ffffff 100%)', // purple
      '#f57c00': 'linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)', // orange
      '#d32f2f': 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)', // red
    };
    return colorMap[baseColor] || 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)';
  };
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        border: `1px solid ${color}20`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 3,
        background: getGradient(color),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}30`,
          borderColor: color,
        } : {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}20`,
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box 
            sx={{ 
              position: 'relative',
              display: 'inline-flex',
              mr: 2.5
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: alpha(color, 0.15), 
                color: color, 
                width: 56, 
                height: 56,
                boxShadow: `0 4px 12px ${color}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 6px 16px ${color}30`,
                }
              }}
            >
              {icon}
            </Avatar>
            {badge > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  bgcolor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                  animation: badge > 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                    },
                    '50%': {
                      opacity: 0.7,
                    },
                  },
                }}
              >
                {badge}
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              color="text.primary"
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem' },
                lineHeight: 1.2,
                mb: 0.5,
                letterSpacing: '-0.02em'
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              fontWeight="600"
              sx={{ 
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.25
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  mt: 0.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {change !== undefined && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${color}10`
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: change > 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {change > 0 ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981', mr: 0.5 }} />
              ) : (
                <TrendingUpIcon sx={{ fontSize: 16, color: '#ef4444', mr: 0.5, transform: 'rotate(180deg)' }} />
              )}
              <Typography
                variant="caption"
                fontWeight="700"
                sx={{ 
                  color: change > 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.75rem'
                }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, fontSize: '0.75rem' }}
            >
              from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const OldStatCard = ({ title, value, subtitle, icon, color = 'primary', onClick, badge }) => (
  <Card 
    sx={{ 
      height: '100%', 
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      '&:hover': onClick ? {
        borderColor: '#d1d5db',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)'
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ 
            color: '#6b7280',
            fontWeight: 500,
            fontSize: '0.875rem',
            mb: 1
          }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            fontSize: '1.875rem',
            color: '#111827',
            mb: 0.5
          }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ 
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: 400
            }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '8px',
          bgcolor: '#f9fafb',
          border: '1px solid #e5e7eb'
        }}>
          {badge && (
            <Badge 
              badgeContent={badge} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 16,
                  minWidth: 16,
                  right: -2,
                  top: -2
                }
              }}
            >
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: '1.25rem', 
                  color: '#6b7280' 
                } 
              })}
            </Badge>
          )}
          {!badge && React.cloneElement(icon, { 
            sx: { 
              fontSize: '1.25rem', 
              color: '#6b7280' 
            } 
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Announcements Section Component
const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPoll, setExpandedPoll] = useState(null);
  const [voterDetails, setVoterDetails] = useState({});
  const [expandedReactions, setExpandedReactions] = useState(null);
  const [reactionDetails, setReactionDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements', {
        params: { limit: 5 }
      });
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
        // Fetch voter details for polls
        await fetchVoterDetailsForPolls(response.data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoterDetailsForPolls = async (announcementsList) => {
    const polls = announcementsList.filter(a => a.isPoll);
    const details = {};
    
    for (const poll of polls) {
      if (poll.pollOptions) {
        details[poll._id] = {};
        for (let i = 0; i < poll.pollOptions.length; i++) {
          const option = poll.pollOptions[i];
          if (option.votes && option.votes.length > 0) {
            try {
              const voterPromises = option.votes.map(async (vote) => {
                try {
                  const userResponse = await axios.get(`/employees/user/${vote.user}`);
                  return {
                    name: userResponse.data.employee 
                      ? `${userResponse.data.employee.personalInfo.firstName} ${userResponse.data.employee.personalInfo.lastName}`
                      : userResponse.data.user?.email || 'Unknown',
                    email: userResponse.data.user?.email || 'N/A',
                    employeeId: userResponse.data.employee?.employeeId || 'N/A',
                    votedAt: vote.votedAt
                  };
                } catch (err) {
                  return { name: 'Unknown User', email: 'N/A', employeeId: 'N/A', votedAt: vote.votedAt };
                }
              });
              
              details[poll._id][i] = await Promise.all(voterPromises);
            } catch (err) {
              console.error('Error fetching voter details:', err);
              details[poll._id][i] = [];
            }
          } else {
            details[poll._id][i] = [];
          }
        }
      }
    }
    
    setVoterDetails(details);
    
    // Fetch reaction details
    await fetchReactionDetailsForAnnouncements(announcementsList);
  };

  const fetchReactionDetailsForAnnouncements = async (announcementsList) => {
    const details = {};
    
    for (const announcement of announcementsList) {
      if (announcement.reactions && announcement.reactions.length > 0) {
        try {
          const reactionPromises = announcement.reactions.map(async (reaction) => {
            try {
              const userResponse = await axios.get(`/employees/user/${reaction.user}`);
              return {
                name: userResponse.data.employee 
                  ? `${userResponse.data.employee.personalInfo.firstName} ${userResponse.data.employee.personalInfo.lastName}`
                  : userResponse.data.user?.email || 'Unknown',
                email: userResponse.data.user?.email || 'N/A',
                employeeId: userResponse.data.employee?.employeeId || 'N/A',
                type: reaction.type,
                reactedAt: reaction.reactedAt
              };
            } catch (err) {
              return { 
                name: 'Unknown User', 
                email: 'N/A', 
                employeeId: 'N/A', 
                type: reaction.type,
                reactedAt: reaction.reactedAt 
              };
            }
          });
          
          details[announcement._id] = await Promise.all(reactionPromises);
        } catch (err) {
          console.error('Error fetching reaction details:', err);
          details[announcement._id] = [];
        }
      } else {
        details[announcement._id] = [];
      }
    }
    
    setReactionDetails(details);
  };

  const togglePollExpand = (pollId) => {
    setExpandedPoll(expandedPoll === pollId ? null : pollId);
  };

  const toggleReactionsExpand = (announcementId) => {
    setExpandedReactions(expandedReactions === announcementId ? null : announcementId);
  };

  const getReactionLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleVote = async (announcementId, optionIndex) => {
    try {
      const response = await axios.post(`/announcements/${announcementId}/vote`, {
        optionIndex
      });
      if (response.data.success) {
        toast.success('Vote recorded successfully');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to vote');
    }
  };

  const handleReact = async (announcementId, reactionType) => {
    try {
      const response = await axios.post(`/announcements/${announcementId}/react`, {
        type: reactionType
      });
      if (response.data.success) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error reacting:', error);
      toast.error('Failed to add reaction');
    }
  };

  const getReactionIcon = (type) => {
    switch (type) {
      case 'like': return <ThumbUpIcon sx={{ fontSize: 16 }} />;
      case 'love': return <FavoriteIcon sx={{ fontSize: 16 }} />;
      case 'celebrate': return <CelebrationIcon sx={{ fontSize: 16 }} />;
      case 'support': return <SupportAgentIcon sx={{ fontSize: 16 }} />;
      case 'insightful': return <LightbulbIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#2196f3',
      policy: '#9c27b0',
      event: '#ff9800',
      update: '#00bcd4',
      urgent: '#f44336',
      celebration: '#4caf50',
    };
    return colors[category] || '#2196f3';
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            <CampaignIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Important updates and company news
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {announcements.map((announcement) => (
          <Grid item xs={12} md={6} key={announcement._id}>
            <Card
              elevation={announcement.isPinned ? 3 : 0}
              sx={{
                border: announcement.isPinned ? '2px solid #ff9800' : '1px solid #e0e0e0',
                borderRadius: 2,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {announcement.isPinned && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: '#ff9800',
                    color: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                  }}
                >
                  <PinIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
              
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={announcement.category.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(announcement.category),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  {announcement.isPoll && (
                    <Chip
                      icon={<PollIcon />}
                      label="Poll"
                      size="small"
                      color="primary"
                    />
                  )}
                  <Chip
                    label={announcement.priority.toUpperCase()}
                    size="small"
                    color={
                      announcement.priority === 'urgent' ? 'error' :
                      announcement.priority === 'high' ? 'warning' :
                      announcement.priority === 'medium' ? 'info' : 'default'
                    }
                  />
                </Box>

                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {announcement.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {announcement.content}
                </Typography>

                {announcement.isPoll && announcement.pollOptions && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="600" color="primary">
                        Poll Results
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => togglePollExpand(announcement._id)}
                        sx={{ p: 0.5 }}
                      >
                        {expandedPoll === announcement._id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                    {announcement.pollResults.map((result, index) => (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight="500">
                            {result.option}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.votes} votes ({result.percentage}%)
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 8, bgcolor: '#e0e0e0', borderRadius: 1 }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              height: '100%',
                              width: `${result.percentage}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                        
                        {expandedPoll === announcement._id && voterDetails[announcement._id]?.[index]?.length > 0 && (
                          <Box sx={{ mt: 1, ml: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Voted by:
                            </Typography>
                            {voterDetails[announcement._id][index].map((voter, vIdx) => (
                              <Box key={vIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                                <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {voter.name} ({voter.employeeId})
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                        
                        {!announcement.hasVoted && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleVote(announcement._id, index)}
                            sx={{ mt: 0.5 }}
                          >
                            Vote for this
                          </Button>
                        )}
                      </Box>
                    ))}
                    {announcement.hasVoted && (
                      <Chip
                        label="You voted"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['like', 'love', 'celebrate', 'support', 'insightful'].map((type) => (
                      <Tooltip key={type} title={type}>
                        <IconButton
                          size="small"
                          onClick={() => handleReact(announcement._id, type)}
                          sx={{
                            color: announcement.userReaction === type ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {getReactionIcon(type)}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => toggleReactionsExpand(announcement._id)}
                    >
                      {Object.values(announcement.reactionCounts || {}).reduce((a, b) => a + b, 0)} reactions
                      {expandedReactions === announcement._id ? ' ▲' : ' ▼'}
                    </Typography>
                  </Box>
                </Box>

                {expandedReactions === announcement._id && reactionDetails[announcement._id]?.length > 0 && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Reactions:
                    </Typography>
                    {reactionDetails[announcement._id].map((reactor, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <Typography variant="caption" sx={{ fontSize: 14 }}>
                          {['👍', '❤️', '🎉', '🤝', '💡'][['like', 'love', 'celebrate', 'support', 'insightful'].indexOf(reactor.type)]}
                        </Typography>
                        <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          {reactor.name} ({reactor.employeeId}) - {getReactionLabel(reactor.type)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Posted by {announcement.createdByName} • {moment(announcement.createdAt).fromNow()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Employee Overview Section Component
const EmployeeOverviewSection = ({ userRole }) => {
  const [exits, setExits] = useState([]);
  const [recentExits, setRecentExits] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [probation, setProbation] = useState([]);
  const [birthdaysData, setBirthdaysData] = useState([]);
  const [anniversariesData, setAnniversariesData] = useState({ thisMonth: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  // Check if user is Admin or HR
  const isAdminOrHR = userRole === 'admin' || userRole === 'hr';

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      console.log('🔥 EMPLOYEE DASHBOARD - FETCHING PROBATION DATA - NEW CODE! 🔥');
      const [exitsRes, recentExitsRes, onboardingRes, recentOnboardingRes, probationRes, birthdaysRes, anniversariesRes] = await Promise.all([
        axios.get('/exit-management/').catch(() => ({ data: [] })),
        axios.get('/exit-management/recent-exits').catch(() => ({ data: { success: false, exits: [] } })),
        axios.get('/onboarding/').catch(() => ({ data: [] })),
        axios.get('/onboarding/recent-onboarding').catch(() => ({ data: { success: false, onboarding: [] } })),
        axios.get('/employees/on-probation').catch(() => ({ data: { success: false, employees: [] } })),
        axios.get('/employees/birthdays').catch(() => ({ data: { success: false } })),
        axios.get('/employees/anniversaries').catch(() => ({ data: { success: false } })),
      ]);
      console.log('📊 Employee Dashboard Probation Response:', probationRes.data);
      console.log('📊 Employee Dashboard Recent Exits Response:', recentExitsRes.data);
      console.log('📊 Employee Dashboard Recent Onboarding Response:', recentOnboardingRes.data);

      // Process exits
      if (Array.isArray(exitsRes.data)) {
        setExits(exitsRes.data.filter(exit => exit.status !== 'completed' && exit.status !== 'cancelled'));
      }

      // Process recent exits (last 2 months)
      if (recentExitsRes.data.success && Array.isArray(recentExitsRes.data.exits)) {
        console.log('✅ Setting recent exits in Employee Dashboard:', recentExitsRes.data.exits.length, 'exits found');
        setRecentExits(recentExitsRes.data.exits);
      } else {
        console.log('⚠️  Recent exits data format issue in Employee Dashboard:', recentExitsRes.data);
      }

      // Process recent onboarding (last 1 month)
      if (recentOnboardingRes.data.success && Array.isArray(recentOnboardingRes.data.onboarding)) {
        console.log('✅ Setting recent onboarding in Employee Dashboard:', recentOnboardingRes.data.onboarding.length, 'onboarding found');
        setOnboarding(recentOnboardingRes.data.onboarding);
      } else {
        console.log('⚠️  Recent onboarding data format issue in Employee Dashboard:', recentOnboardingRes.data);
      }

      // Process probation employees (now from dedicated endpoint)
      if (probationRes.data.success && probationRes.data.employees) {
        setProbation(probationRes.data.employees);
      }

      // Process birthdays
      if (birthdaysRes.data.success) {
        setBirthdaysData([...(birthdaysRes.data.thisMonth || []), ...(birthdaysRes.data.upcoming || [])].slice(0, 4));
      }

      // Process anniversaries
      if (anniversariesRes.data.success) {
        setAnniversariesData({
          thisMonth: anniversariesRes.data.thisMonth || [],
          upcoming: anniversariesRes.data.upcoming || [],
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Section Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="700" gutterBottom>
          Employee Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current status and important updates for your team members
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Exits - Last 2 Months - Only for Admin/HR */}
        {isAdminOrHR && (
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '100%',
              minHeight: 400,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="700" color="#d32f2f">
                  Exits
                </Typography>
                <Chip label={recentExits.length} size="small" sx={{ bgcolor: alpha('#d32f2f', 0.1), color: '#d32f2f', fontWeight: 600 }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {recentExits.length > 0 ? recentExits.map((exit, index) => (
                  <Box key={exit._id || index} sx={{ mb: 2, pb: 2, borderBottom: index < recentExits.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <Typography variant="body2" fontWeight="600">
                      {exit.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {moment(exit.lastWorkingDate).format('DD MMM YYYY')} ({exit.daysSinceExit} days ago)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {exit.department} - {exit.location}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label={exit.status.replace(/_/g, ' ').toUpperCase()}
                        size="small"
                        sx={{ 
                          bgcolor: exit.status === 'completed' ? alpha('#4caf50', 0.1) : alpha('#ff9800', 0.1), 
                          color: exit.status === 'completed' ? '#4caf50' : '#ff9800',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: '18px'
                        }} 
                      />
                      <Chip 
                        label={`${exit.completionPercentage}%`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha('#2196f3', 0.1), 
                          color: '#2196f3', 
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: '18px'
                        }} 
                      />
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No exits in last 2 months
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        )}

        {/* Onboarding - Last 1 Month - Only for Admin/HR */}
        {isAdminOrHR && (
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '100%',
              minHeight: 400,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="700" color="#1976d2">
                  Onboarding
                </Typography>
                <Chip label={onboarding.length} size="small" sx={{ bgcolor: alpha('#1976d2', 0.1), color: '#1976d2', fontWeight: 600 }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {onboarding.length > 0 ? onboarding.map((item, index) => (
                  <Box key={item._id || index} sx={{ mb: 2, pb: 2, borderBottom: index < onboarding.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <Typography variant="body2" fontWeight="600">
                      {item.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.position} ({item.daysSinceCreated} days ago)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.department}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label={item.status.replace(/_/g, ' ').toUpperCase()}
                        size="small"
                        sx={{ 
                          bgcolor: 
                            item.status === 'completed' ? alpha('#4caf50', 0.1) :
                            item.status === 'in_progress' ? alpha('#2196f3', 0.1) :
                            alpha('#ff9800', 0.1), 
                          color: 
                            item.status === 'completed' ? '#4caf50' :
                            item.status === 'in_progress' ? '#2196f3' :
                            '#ff9800',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: '18px'
                        }} 
                      />
                      <Chip 
                        label={`${item.completionPercentage}%`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha('#2196f3', 0.1), 
                          color: '#2196f3', 
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: '18px'
                        }} 
                      />
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No onboarding in last month
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        )}

        {/* Probation - Only for Admin/HR */}
        {isAdminOrHR && (
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '100%',
              minHeight: 400,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="700" color="#f57c00">
                  On Probation
                </Typography>
                <Chip label={probation.length} size="small" sx={{ bgcolor: alpha('#f57c00', 0.1), color: '#f57c00', fontWeight: 600 }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {probation.length > 0 ? probation.map((emp, index) => (
                  <Box key={emp._id || index} sx={{ mb: 2, pb: 2, borderBottom: index < probation.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <Typography variant="body2" fontWeight="600">
                      {emp.name || (emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : 'N/A')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {emp.designation || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {emp.department || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label={`${emp.daysRemaining || 0} days left`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha('#f57c00', 0.1), 
                          color: '#f57c00', 
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: '20px'
                        }} 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Joined: {emp.joiningDate ? moment(emp.joiningDate).format('DD MMM YYYY') : 'N/A'}
                    </Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No employees on probation
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        )}

        {/* Birthdays */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              height: '100%',
              minHeight: 400,
              background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="700" color="#f57c00" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎂 Birthdays
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {birthdaysData.length > 0 ? birthdaysData.map((birthday, index) => (
                  <Box key={birthday.employeeId || index} sx={{ mb: 2, pb: 2, borderBottom: index < birthdaysData.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                    <Typography variant="body2" fontWeight="600">
                      {birthday.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {moment(birthday.birthdayDate).format('DD MMM YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {birthday.department || 'N/A'} - {birthday.location || 'N/A'}
                    </Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No upcoming birthdays
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Work Anniversaries */}
      {(anniversariesData.thisMonth.length > 0 || anniversariesData.upcoming.length > 0) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="700" gutterBottom>
            Work Anniversaries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Celebrating milestones and dedication of our team members
          </Typography>

          <Grid container spacing={3}>
            {/* This Month's Anniversaries */}
            {anniversariesData.thisMonth.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 100%)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" color="#d81b60" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      🎉 This Month&apos;s Anniversaries
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      {anniversariesData.thisMonth.map((anniversary, index) => (
                        <Box key={anniversary.employeeId || index} sx={{ mb: 2, pb: 2, borderBottom: index < anniversariesData.thisMonth.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                          <Typography variant="body2" fontWeight="600">
                            {anniversary.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {anniversary.yearsOfService} Year{anniversary.yearsOfService !== 1 ? 's' : ''} • {moment(anniversary.anniversaryDate).format('DD MMM YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {anniversary.department || 'N/A'} - {anniversary.location || 'N/A'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Upcoming Anniversaries */}
            {anniversariesData.upcoming.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" color="#0288d1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      ⭐ Upcoming Anniversaries
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      {anniversariesData.upcoming.slice(0, 5).map((anniversary, index) => (
                        <Box key={anniversary.employeeId || index} sx={{ mb: 2, pb: 2, borderBottom: index < Math.min(5, anniversariesData.upcoming.length) - 1 ? '1px solid #f5f5f5' : 'none' }}>
                          <Typography variant="body2" fontWeight="600">
                            {anniversary.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {anniversary.yearsOfService} Year{anniversary.yearsOfService !== 1 ? 's' : ''} • {moment(anniversary.anniversaryDate).format('DD MMM YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {anniversary.department || 'N/A'} - {anniversary.location || 'N/A'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

// Reportee Details Panel Component
const ReporteeDetailsPanel = ({ member }) => {
  const [attendanceFilter, setAttendanceFilter] = useState('thisMonth');
  const [leaveFilter, setLeaveFilter] = useState('thisYear');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Calculate attendance metrics
  const attendancePercentage = member.attendance?.totalWorkingDays > 0 
    ? Math.round((member.attendance.present / member.attendance.totalWorkingDays) * 100)
    : 0;

  const punctualityRate = member.attendance?.present > 0 
    ? Math.round(((member.attendance.present - (member.attendance.late || 0)) / member.attendance.present) * 100)
    : 0;

  // Calculate leave metrics
  const totalAllocated = (member.leaveBalance?.casualLeave?.allocated || 0) +
                        (member.leaveBalance?.sickLeave?.allocated || 0) +
                        (member.leaveBalance?.specialLeave?.allocated || 0);
  const totalUsed = ((member.leaveBalance?.casualLeave?.allocated || 0) - (member.leaveBalance?.casualLeave?.available || 0)) +
                   ((member.leaveBalance?.sickLeave?.allocated || 0) - (member.leaveBalance?.sickLeave?.available || 0)) +
                   ((member.leaveBalance?.specialLeave?.allocated || 0) - (member.leaveBalance?.specialLeave?.available || 0));
  const utilizationRate = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  return (
    <Grid container spacing={3}>
      {/* Attendance Summary */}
      <Grid item xs={12}>
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Attendance Summary
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={attendanceFilter}
                  label="Period"
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                >
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="last3Months">Last 3 Months</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Custom Date Range */}
            {attendanceFilter === 'custom' && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                  <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    {member.attendance?.present || 0}
                  </Typography>
                  <Typography variant="caption" color="success.dark" fontWeight="500">
                    Present Days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                  <CancelIcon sx={{ fontSize: 28, color: 'error.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="error.main">
                    {member.attendance?.absent || 0}
                  </Typography>
                  <Typography variant="caption" color="error.dark" fontWeight="500">
                    Absent Days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.50' }}>
                  <ScheduleIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="warning.main">
                    {member.attendance?.late || 0}
                  </Typography>
                  <Typography variant="caption" color="warning.dark" fontWeight="500">
                    Late Days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'info.main', borderRadius: 1, bgcolor: 'info.50' }}>
                  <EventIcon sx={{ fontSize: 28, color: 'info.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="info.main">
                    {(member.attendance?.present || 0) - (member.attendance?.late || 0)}
                  </Typography>
                  <Typography variant="caption" color="info.dark" fontWeight="500">
                    On-Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Additional Metrics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
                    </Typography>
                    <Typography variant="h6" fontWeight="700" color="primary.main">
                      {attendancePercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendancePercentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={attendancePercentage >= 90 ? 'success' : attendancePercentage >= 75 ? 'warning' : 'error'}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Punctuality Rate
                    </Typography>
                    <Typography variant="h6" fontWeight="700" color="success.main">
                      {punctualityRate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={punctualityRate}
                    sx={{ height: 8, borderRadius: 4 }}
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Detailed Stats */}
            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Working Days
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {member.attendance?.totalWorkingDays || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Half Days
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {member.attendance?.halfDays || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg. Working Hours
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {member.attendance?.avgWorkingHours || '0.0'}h
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Overtime Hours
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="warning.main">
                    {member.attendance?.overtimeHours || '0.0'}h
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Leave Summary */}
      <Grid item xs={12}>
        <Card sx={{ border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <BeachAccessIcon sx={{ mr: 1 }} />
                Leave Summary
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={leaveFilter}
                  label="Period"
                  onChange={(e) => setLeaveFilter(e.target.value)}
                >
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisQuarter">This Quarter</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Leave Request Status */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
                  <EventIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="primary.main">
                    {member.leaves?.totalRequests || 0}
                  </Typography>
                  <Typography variant="caption" color="primary.dark" fontWeight="500">
                    Total Requests
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                  <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="success.main">
                    {member.leaves?.approved || 0}
                  </Typography>
                  <Typography variant="caption" color="success.dark" fontWeight="500">
                    Approved
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.50' }}>
                  <ScheduleIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="warning.main">
                    {member.leaves?.pending || 0}
                  </Typography>
                  <Typography variant="caption" color="warning.dark" fontWeight="500">
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center" sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                  <CancelIcon sx={{ fontSize: 28, color: 'error.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="700" color="error.main">
                    {member.leaves?.rejected || 0}
                  </Typography>
                  <Typography variant="caption" color="error.dark" fontWeight="500">
                    Rejected
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Leave Balance Breakdown */}
            <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
              Leave Balance by Type
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Casual Leave
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    <Typography variant="h5" fontWeight="700" color="primary.main">
                      {member.leaveBalance?.casualLeave?.available || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      / {member.leaveBalance?.casualLeave?.allocated || 0} days
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={member.leaveBalance?.casualLeave?.allocated 
                      ? ((member.leaveBalance.casualLeave.allocated - (member.leaveBalance.casualLeave.available || 0)) 
                        / member.leaveBalance.casualLeave.allocated) * 100 
                      : 0}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Used: {(member.leaveBalance?.casualLeave?.allocated || 0) - (member.leaveBalance?.casualLeave?.available || 0)} days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sick Leave
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    <Typography variant="h5" fontWeight="700" color="warning.main">
                      {member.leaveBalance?.sickLeave?.available || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      / {member.leaveBalance?.sickLeave?.allocated || 0} days
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={member.leaveBalance?.sickLeave?.allocated 
                      ? ((member.leaveBalance.sickLeave.allocated - (member.leaveBalance.sickLeave.available || 0)) 
                        / member.leaveBalance.sickLeave.allocated) * 100 
                      : 0}
                    sx={{ height: 6, borderRadius: 3 }}
                    color="warning"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Used: {(member.leaveBalance?.sickLeave?.allocated || 0) - (member.leaveBalance?.sickLeave?.available || 0)} days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Special Leave
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    <Typography variant="h5" fontWeight="700" color="success.main">
                      {member.leaveBalance?.specialLeave?.available || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      / {member.leaveBalance?.specialLeave?.allocated || 0} days
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={member.leaveBalance?.specialLeave?.allocated 
                      ? ((member.leaveBalance.specialLeave.allocated - (member.leaveBalance.specialLeave.available || 0)) 
                        / member.leaveBalance.specialLeave.allocated) * 100 
                      : 0}
                    sx={{ height: 6, borderRadius: 3 }}
                    color="success"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Used: {(member.leaveBalance?.specialLeave?.allocated || 0) - (member.leaveBalance?.specialLeave?.available || 0)} days
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Overall Leave Statistics */}
            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Allocated
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {totalAllocated} days
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Available
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="success.main">
                    {totalAllocated - totalUsed} days
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Used
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="error.main">
                    {totalUsed} days
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Utilization Rate
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="primary.main">
                    {utilizationRate}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [employeeData, setEmployeeData] = useState({
    profile: null,
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      totalWorkingDays: 0,
      monthlyCalendar: [],
    },
    leaves: {
      available: 0,
      used: 0,
      pending: 0,
      upcoming: [],
      balance: {
        casualLeave: 0,
        sickLeave: 0,
        earnedLeave: 0,
      },
    },
    activities: [],
    assets: [],
    documents: [],
    tasks: [],
    notices: [],
    tickets: [],
    performance: {
      kras: [],
      appraisalTimeline: null,
      feedback: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [officeStatus, setOfficeStatus] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [supportDialog, setSupportDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [reportingStructure, setReportingStructure] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Report data states
  const [reportPeriod, setReportPeriod] = useState('month'); // 'week' or 'month'
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState([]);
  const [lateArrivalStats, setLateArrivalStats] = useState({
    totalLateDays: 0,
    averageLateMinutes: 0,
    lateByWeek: [],
  });
  const [workingHoursStats, setWorkingHoursStats] = useState({
    weeklyAverage: 0,
    monthlyTotal: 0,
    dailyAverage: 0,
    overtimeHours: 0,
    productivityScore: 0,
  });

  useEffect(() => {
    fetchEmployeeData();
    fetchTodayAttendance();
    fetchEmployeeAssets();
    fetchReportingStructure(); // Fetch team members for managers
    fetchOfficeStatus();
    fetchLeaveBalance();
    fetchDetailedReports();
  }, []);

  // Refresh employee data when component becomes visible (e.g., when navigating back from employee management)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEmployeeData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when the window regains focus
    const handleFocus = () => {
      fetchEmployeeData();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    console.log('Current tab value:', tabValue);
  }, [tabValue]);

  useEffect(() => {
    console.log('🔍 Employee data updated:', employeeData);
    console.log('🔍 Profile data:', employeeData.profile);
    console.log('🔍 Employment history in employee data:', employeeData.profile?.employmentHistory);
  }, [employeeData]);

  useEffect(() => {
    console.log('📊 Report data updated:', {
      weeklyDataLength: weeklyAttendanceData.length,
      monthlyDataLength: monthlyAttendanceData.length,
      lateArrivalStats,
      workingHoursStats,
      reportPeriod
    });
  }, [weeklyAttendanceData, monthlyAttendanceData, lateArrivalStats, workingHoursStats, reportPeriod]);

  useEffect(() => {
    console.log('👥 Team members state updated:', {
      count: teamMembers.length,
      members: teamMembers,
      reportingStructure
    });
  }, [teamMembers, reportingStructure]);

  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get('/leave/balance');
      // Handle new response format with balances array
      if (response.data.balances) {
        setLeaveBalance(response.data.balances);
      } else {
        // Fallback for old format (direct array)
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      // Set default leave types if API fails
      setLeaveBalance([
        { leaveType: { name: 'Annual Leave', code: 'AL' }, allocated: 21, used: 5, available: 16 },
        { leaveType: { name: 'Sick Leave', code: 'SL' }, allocated: 12, used: 2, available: 10 },
        { leaveType: { name: 'Personal Leave', code: 'PL' }, allocated: 5, used: 1, available: 4 }
      ]);
    }
  };

  const fetchReportingStructure = async () => {
    try {
      console.log('🔍 Attempting to fetch reporting structure...');
      const response = await axios.get('/employees/reporting-structure');
      console.log('✅ Reporting structure response:', response.data);
      console.log('✅ Statistics:', response.data?.statistics);
      console.log('✅ Is Manager?:', response.data?.statistics?.isManager);
      setReportingStructure(response.data);
      
      // If user is a manager, fetch team details
      if (response.data?.statistics?.isManager) {
        console.log('👥 User is a manager, fetching team members...');
        const teamResponse = await axios.get('/employees/my-team');
        console.log('👥 Team members response:', teamResponse.data);
        const members = teamResponse.data.teamMembers || [];
        console.log('👥 Setting team members:', members.length, 'members');
        setTeamMembers(members);
      } else {
        console.log('👤 User is not a manager (isManager:', response.data?.statistics?.isManager, ')');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reporting structure:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      // Set empty data to prevent repeated calls
      setReportingStructure({
        currentEmployee: { name: 'Unknown', role: 'employee' },
        statistics: { isManager: false }
      });
      setTeamMembers([]);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee profile
      const profileResponse = await axios.get('/employees/me');
      
      // Fetch attendance summary
      const attendanceResponse = await axios.get('/attendance/my-summary');
      
      // Fetch leave summary
      const leaveResponse = await axios.get('/leave/my-summary');
      

      // Add sample data if not present
      const profileData = profileResponse.data;
      console.log('🔍 Employee profile data:', profileData);
      console.log('🔍 Employment history:', profileData.employmentHistory);
      console.log('🔍 Work experience:', profileData.workExperience);
      
      // Check if we have employment history, if not, try to get it from workExperience
      let employmentHistory = profileData.employmentHistory;
      if (!employmentHistory || employmentHistory.length === 0) {
        if (profileData.workExperience && profileData.workExperience.experienceDetails) {
          // Convert workExperience format to employmentHistory format
          employmentHistory = profileData.workExperience.experienceDetails.map(exp => ({
            company: exp.company,
            designation: exp.position, // position -> designation
            startDate: exp.startDate,
            endDate: exp.endDate,
            salary: exp.salary,
            reasonForLeaving: exp.reasonForLeaving
          }));
          profileData.employmentHistory = employmentHistory;
        }
      }
      
      console.log('🔍 Final profile data before setting:', profileData);
      console.log('🔍 Employment history in final data:', profileData.employmentHistory);
      
      setEmployeeData({
        profile: profileData,
        attendance: attendanceResponse.data || {
          present: 0,
          absent: 0,
          late: 0,
          totalWorkingDays: 0,
        },
        leaves: leaveResponse.data || {
          available: 0,
          used: 0,
          pending: 0,
        },
        activities: [],
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // If endpoints don't exist yet, show placeholder data
      setEmployeeData({
        profile: {
          employeeId: user.employee?.employeeId || 'N/A',
          personalInfo: {
            firstName: user.employee?.name?.split(' ')[0] || 'Employee',
            lastName: user.employee?.name?.split(' ').slice(1).join(' ') || '',
          },
          employmentInfo: {
            designation: user.employee?.designation || 'Employee',
            department: user.employee?.department || { name: 'N/A' },
          },
        },
        attendance: {
          present: 20,
          absent: 2,
          late: 1,
          totalWorkingDays: 23,
        },
        leaves: {
          available: 18,
          used: 6,
          pending: 1,
        },
        activities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get('/attendance/today');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchOfficeStatus = async () => {
    try {
      const response = await axios.get('/attendance/office-status');
      setOfficeStatus(response.data);
    } catch (error) {
      console.error('Error fetching office status:', error);
      setOfficeStatus({ isOfficeIP: false, message: 'Unable to verify office location' });
    }
  };

  const fetchEmployeeAssets = async () => {
    try {
      // First, we need to get the employee record for this user
      const employeeResponse = await axios.get('/employees/me');
      const employeeId = employeeResponse.data._id;
      
      if (employeeId) {
        const response = await axios.get(`/assets/employee/${employeeId}`);
        setEmployeeData(prev => ({
          ...prev,
          assets: response.data.assets || []
        }));
      } else {
        // If no employee record, set empty assets array
        setEmployeeData(prev => ({
          ...prev,
          assets: []
        }));
      }
    } catch (error) {
      console.error('Error fetching employee assets:', error);
      // Set empty array on error to prevent undefined issues
      setEmployeeData(prev => ({
        ...prev,
        assets: []
      }));
      // Don't show error to user as assets might not be available for all employees
    }
  };

  const fetchDetailedReports = async () => {
    try {
      console.log('🔍 Fetching detailed reports...');
      const employeeResponse = await axios.get('/employees/me');
      const employeeId = employeeResponse.data._id;
      
      // Fetch last 30 days attendance data
      const endDate = moment().format('YYYY-MM-DD');
      const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      console.log('📅 Fetching attendance from', startDate, 'to', endDate);
      const attendanceResponse = await axios.get('/attendance', {
        params: {
          startDate,
          endDate,
          limit: 100
        }
      });

      const records = attendanceResponse.data.attendanceRecords || [];
      console.log('📊 Received attendance records:', records.length);
      
      // Process weekly data (last 7 days)
      const last7Days = moment().subtract(6, 'days');
      const weeklyData = [];
      for (let i = 0; i < 7; i++) {
        const date = moment().subtract(6 - i, 'days');
        const dateStr = date.format('YYYY-MM-DD');
        const record = records.find(r => moment(r.date).format('YYYY-MM-DD') === dateStr);
        
        weeklyData.push({
          date: date.format('ddd DD'),
          fullDate: dateStr,
          hours: record?.totalHours || 0,
          status: record?.status || 'absent',
          isLate: record?.isLate || false,
          lateMinutes: record?.lateMinutes || 0,
        });
      }
      
      // Process monthly data (last 30 days grouped by week)
      const monthlyData = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = moment().subtract((3 - i) * 7, 'days').startOf('week');
        const weekEnd = moment(weekStart).endOf('week');
        
        const weekRecords = records.filter(r => {
          const recordDate = moment(r.date);
          return recordDate.isBetween(weekStart, weekEnd, 'day', '[]');
        });
        
        const totalHours = weekRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const presentDays = weekRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const lateDays = weekRecords.filter(r => r.isLate).length;
        
        monthlyData.push({
          week: `Week ${i + 1}`,
          hours: parseFloat(totalHours.toFixed(1)),
          presentDays,
          lateDays,
          avgHours: presentDays > 0 ? parseFloat((totalHours / presentDays).toFixed(1)) : 0,
        });
      }
      
      // Calculate late arrival statistics
      const lateRecords = records.filter(r => r.isLate);
      const totalLateDays = lateRecords.length;
      const totalLateMinutes = lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
      const averageLateMinutes = totalLateDays > 0 ? Math.round(totalLateMinutes / totalLateDays) : 0;
      
      // Group late arrivals by week for the last 4 weeks
      const lateByWeek = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = moment().subtract((3 - i) * 7, 'days').startOf('week');
        const weekEnd = moment(weekStart).endOf('week');
        
        const weekLateRecords = lateRecords.filter(r => {
          const recordDate = moment(r.date);
          return recordDate.isBetween(weekStart, weekEnd, 'day', '[]');
        });
        
        lateByWeek.push({
          week: `Week ${i + 1}`,
          count: weekLateRecords.length,
          avgMinutes: weekLateRecords.length > 0 
            ? Math.round(weekLateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / weekLateRecords.length)
            : 0,
        });
      }
      
      // Calculate working hours statistics
      const workingRecords = records.filter(r => r.status === 'present' || r.status === 'late');
      const totalHours = workingRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      const totalOvertimeHours = workingRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
      
      // Calculate weekly average (last 7 days)
      const last7DaysRecords = records.filter(r => moment(r.date).isAfter(moment().subtract(7, 'days')));
      const last7DaysWorkingRecords = last7DaysRecords.filter(r => r.status === 'present' || r.status === 'late');
      const weeklyTotal = last7DaysWorkingRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
      
      // Calculate productivity score (based on attendance, punctuality, and hours)
      const attendanceRate = workingRecords.length / (records.length || 1);
      const punctualityRate = 1 - (totalLateDays / (workingRecords.length || 1));
      const avgHoursPerDay = workingRecords.length > 0 ? totalHours / workingRecords.length : 0;
      const hoursScore = Math.min(avgHoursPerDay / 9, 1); // 9 hours as target
      const productivityScore = Math.round(((attendanceRate * 0.4) + (punctualityRate * 0.3) + (hoursScore * 0.3)) * 100);
      
      setWeeklyAttendanceData(weeklyData);
      setMonthlyAttendanceData(monthlyData);
      setLateArrivalStats({
        totalLateDays,
        averageLateMinutes,
        lateByWeek,
      });
      setWorkingHoursStats({
        weeklyAverage: parseFloat((weeklyTotal / 7).toFixed(1)),
        monthlyTotal: parseFloat(totalHours.toFixed(1)),
        dailyAverage: workingRecords.length > 0 ? parseFloat((totalHours / workingRecords.length).toFixed(1)) : 0,
        overtimeHours: parseFloat(totalOvertimeHours.toFixed(1)),
        productivityScore,
      });
      
      console.log('✅ Reports data updated:');
      console.log('   📅 Weekly data points:', weeklyData.length);
      console.log('   📅 Monthly data points:', monthlyData.length);
      console.log('   ⏰ Late arrival stats:', lateArrivalStats);
      console.log('   💼 Working hours stats:', {
        weeklyAverage: parseFloat((weeklyTotal / 7).toFixed(1)),
        monthlyTotal: parseFloat(totalHours.toFixed(1)),
        dailyAverage: workingRecords.length > 0 ? parseFloat((totalHours / workingRecords.length).toFixed(1)) : 0,
        overtimeHours: parseFloat(totalOvertimeHours.toFixed(1)),
        productivityScore,
      });
      console.log('   📊 Sample weekly data:', weeklyData.slice(0, 2));
      console.log('   📊 Sample monthly data:', monthlyData.slice(0, 2));
      
    } catch (error) {
      console.error('❌ Error fetching detailed reports:', error);
      // Set default empty data
      setWeeklyAttendanceData([]);
      setMonthlyAttendanceData([]);
    }
  };

  const markAttendance = async (type) => {
    try {
      const endpoint = type === 'check-in' ? '/attendance/checkin' : '/attendance/checkout';
      const response = await axios.post(endpoint, {
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (type === 'check-in' && response.data.isLate) {
          toast.warning(`You are ${response.data.lateMinutes} minutes late`);
        }
        if (type === 'check-out' && response.data.isEarlyDeparture) {
          toast.warning(`Early departure: ${response.data.earlyMinutes} minutes`);
        }
        if (type === 'check-out' && response.data.workingHours) {
          toast.info(`Total working hours: ${response.data.workingHours}`);
        }
        fetchTodayAttendance();
        fetchEmployeeData();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Attendance marking only allowed from office premises');
      } else {
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
      }
    }
  };

  const attendancePercentage = employeeData.attendance.totalWorkingDays > 0 
    ? Math.round((employeeData.attendance.present / employeeData.attendance.totalWorkingDays) * 100)
    : 0;

  const leaveUsagePercentage = (employeeData.leaves.available + employeeData.leaves.used) > 0
    ? Math.round((employeeData.leaves.used / (employeeData.leaves.available + employeeData.leaves.used)) * 100)
    : 0;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSupportTicket = async () => {
    try {
      await axios.post('/helpdesk/tickets', ticketForm);
      setSupportDialog(false);
      setTicketForm({
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
      });
      // Refresh tickets
      fetchEmployeeData();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getTodayStatus = () => {
    const today = new Date();
    const isHoliday = false; // Check against holiday calendar
    
    // Allow attendance 7 days a week (removed weekend restriction)
    if (isHoliday) return { status: 'Holiday', color: 'warning' };
    if (attendanceStatus?.checkedIn) return { status: 'Present', color: 'success' };
    return { status: 'Not Checked In', color: 'error' };
  };

  const todayStatus = getTodayStatus();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      p: { xs: 2, md: 4 }
    }}>
      {/* Modern Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={employeeData.profile?.profilePicture?.url ? 
                   (employeeData.profile.profilePicture.url.startsWith('http') ? employeeData.profile.profilePicture.url : `http://localhost:5001${employeeData.profile.profilePicture.url}`) :
                   employeeData.profile?.additionalInfo?.candidatePortalData?.personalInfo?.profilePhoto?.url || 
                   employeeData.profile?.additionalInfo?.profilePhoto?.url || 
                   employeeData.profile?.personalInfo?.profilePicture || 
                   null}
              sx={{ 
                width: 64, 
                height: 64, 
                mr: 3, 
                bgcolor: alpha('#1976d2', 0.1),
                color: '#1976d2',
                fontSize: '1.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                border: '3px solid white'
              }}
            >
              {employeeData.profile?.personalInfo?.firstName?.charAt(0)}
              {employeeData.profile?.personalInfo?.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary">
                Good {moment().hour() < 12 ? 'morning' : moment().hour() < 18 ? 'afternoon' : 'evening'}, {employeeData.profile?.personalInfo?.firstName || 'User'} 👋
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}>
                  {employeeData.profile?.employmentInfo?.designation || 'Employee'}
                </Typography>
                {employeeData.profile?.employmentInfo?.position && (
                  <>
                    <Typography variant="body2" sx={{ color: '#d1d5db' }}>•</Typography>
                    <Chip 
                      label={employeeData.profile.employmentInfo.position} 
                      size="small" 
                      color="primary"
                      sx={{ 
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 20
                      }}
                    />
                  </>
                )}
                <Typography variant="body2" sx={{ color: '#d1d5db' }}>•</Typography>
                <Chip 
                  label={todayStatus.status} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: '#e5e7eb',
                    color: '#374151'
                  }}
                />
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment().format('DD MMM YYYY')}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Employee ID: {employeeData.profile?.employeeId || 'N/A'} | {employeeData.profile?.employmentInfo?.department?.name || 'Unknown'} Department
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 }, flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            {/* Check-in Status Display - Top Right */}
            {attendanceStatus?.checkedIn && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-end',
                p: 1.5,
                bgcolor: attendanceStatus?.isLate ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: `2px solid ${attendanceStatus?.isLate ? '#ff9800' : '#4caf50'}`,
                minWidth: 180
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 700,
                  color: attendanceStatus?.isLate ? '#e65100' : '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  Check In: {moment(attendanceStatus.checkIn).format('hh:mm A')}
                </Typography>
                <Typography variant="caption" sx={{ 
                  fontWeight: 600,
                  color: attendanceStatus?.isLate ? '#e65100' : '#2e7d32',
                  mt: 0.5
                }}>
                  {attendanceStatus?.isLate ? formatLateStatus(attendanceStatus.lateMinutes) : 'On time ✓'}
                </Typography>
                {attendanceStatus?.checkedOut && (
                  <>
                    <Divider sx={{ width: '100%', my: 1, borderColor: attendanceStatus?.isLate ? 'rgba(255, 152, 0, 0.3)' : 'rgba(76, 175, 80, 0.3)' }} />
                    <Typography variant="body2" sx={{ 
                      fontWeight: 700,
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <ScheduleIcon sx={{ fontSize: 16 }} />
                      Check Out: {moment(attendanceStatus.checkOut).format('hh:mm A')}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600,
                      color: '#1976d2',
                      mt: 0.5
                    }}>
                      {attendanceStatus.totalHours ? `${Math.floor(attendanceStatus.totalHours)}h ${Math.round((attendanceStatus.totalHours % 1) * 60)}m worked` : 'Calculating...'}
                    </Typography>
                  </>
                )}
              </Box>
            )}
            
            {/* Check-in/Check-out removed - handled by biometric system */}
            {attendanceStatus?.status === 'weekend' && (
              <Chip
                label="Weekend"
                size="small"
                sx={{ bgcolor: '#9e9e9e', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Quick Action Panel */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 4, 
          p: 4,
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h6" 
            fontWeight="700" 
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            Quick Actions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access frequently used features
          </Typography>
        </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<BeachAccessIcon />}
                onClick={() => navigate('/leave')}
                sx={{ 
                  py: 2, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  bgcolor: '#388e3c',
                  boxShadow: '0 2px 8px rgba(56, 142, 60, 0.3)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#2e7d32',
                    boxShadow: '0 4px 12px rgba(56, 142, 60, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Apply Leave
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<AccessTimeIcon />}
                onClick={() => setTabValue(5)}
                sx={{ 
                  py: 2, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: '#00acc1',
                  color: '#00acc1',
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#00acc1',
                    bgcolor: alpha('#00acc1', 0.1),
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                View Timesheet
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<EditIcon />}
                onClick={() => setTabValue(1)}
                sx={{ 
                  py: 2, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: alpha('#1976d2', 0.1),
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Update Profile
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<DescriptionIcon />}
                onClick={() => setTabValue(6)}
                sx={{ 
                  py: 2, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: '#7b1fa2',
                  color: '#7b1fa2',
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#7b1fa2',
                    bgcolor: alpha('#7b1fa2', 0.1),
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                My Documents
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ContactSupportIcon />}
                onClick={() => setSupportDialog(true)}
                sx={{ 
                  py: 2, 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderColor: '#f57c00',
                  color: '#f57c00',
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#f57c00',
                    bgcolor: alpha('#f57c00', 0.1),
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                HR Support
              </Button>
            </Grid>
          </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${attendancePercentage}%`}
            subtitle={`${employeeData.attendance.present}/${employeeData.attendance.totalWorkingDays} days`}
            icon={<AccessTimeIcon />}
            color="#1976d2"
            onClick={() => setTabValue(5)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Leaves"
            value={employeeData.leaves.available}
            subtitle={`${employeeData.leaves.used} used, ${employeeData.leaves.pending} pending`}
            icon={<BeachAccessIcon />}
            color="#388e3c"
            onClick={() => navigate('/leave')}
            badge={employeeData.leaves.pending}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Job Details"
            value="View"
            subtitle="Employment information"
            icon={<BusinessIcon />}
            color="#00acc1"
            onClick={() => setTabValue(2)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documents"
            value="View"
            subtitle="Personal documents"
            icon={<DescriptionIcon />}
            color="#7b1fa2"
            onClick={() => setTabValue(6)}
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          background: 'white'
        }}
      >
        <Box sx={{ 
          borderBottom: '1px solid #e0e0e0', 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          position: 'relative',
          px: 2
        }}>
          <Typography variant="caption" sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 24, 
            color: '#6b7280',
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: alpha('#1976d2', 0.1),
            px: 2,
            py: 0.5,
            borderRadius: 1
          }}>
            {tabValue + 1} / 7
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              '& .MuiTab-root': {
                fontSize: '0.875rem',
                minHeight: 56,
                textTransform: 'none',
                minWidth: 'auto',
                padding: '12px 20px',
                fontWeight: 600,
                color: '#6b7280',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#1976d2',
                  fontWeight: 700
                },
                '&:hover': {
                  color: '#1976d2',
                  bgcolor: alpha('#1976d2', 0.05)
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTabs-scrollButtons': {
                '&.Mui-disabled': {
                  opacity: 0.3
                }
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: '1.125rem' }} />} label="About" iconPosition="start" />
            <Tab icon={<EditIcon sx={{ fontSize: '1.125rem' }} />} label="Profile" iconPosition="start" />
            <Tab icon={<BusinessIcon sx={{ fontSize: '1.125rem' }} />} label="Job" iconPosition="start" />
            <Tab icon={<StarIcon sx={{ fontSize: '1.125rem' }} />} label="Education" iconPosition="start" />
            <Tab icon={<TrendingUpIcon sx={{ fontSize: '1.125rem' }} />} label="Experience" iconPosition="start" />
            <Tab icon={<AccessTimeIcon sx={{ fontSize: '1.125rem' }} />} label="Time" iconPosition="start" />
            <Tab icon={<DescriptionIcon sx={{ fontSize: '1.125rem' }} />} label="Documents" iconPosition="start" />
          </Tabs>
          
          {/* Tab Navigation Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            py: 2, 
            bgcolor: '#f9fafb',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              size="small"
              variant="outlined"
              disabled={tabValue === 0}
              onClick={() => setTabValue(tabValue - 1)}
              startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)', fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  bgcolor: '#f3f4f6'
                },
                '&:disabled': {
                  color: '#9ca3af',
                  borderColor: '#e5e7eb'
                }
              }}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={tabValue === 6}
              onClick={() => setTabValue(tabValue + 1)}
              endIcon={<ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', fontSize: '1rem' }} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  bgcolor: '#f3f4f6'
                },
                '&:disabled': {
                  color: '#9ca3af',
                  borderColor: '#e5e7eb'
                }
              }}
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Tab 0: ABOUT */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Primary Details */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #1976d2'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: alpha('#1976d2', 0.1), 
                      color: '#1976d2',
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700" color="text.primary">
                      Primary Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Full Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employee ID</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employeeId || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Birth</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.dateOfBirth ? 
                          moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gender</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Marital Status</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #00acc1'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: alpha('#00acc1', 0.1), 
                      color: '#00acc1',
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <PhoneIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700" color="text.primary">
                      Contact Information
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'none', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Contact Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Official Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Personal Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.personalEmail || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Alternate Phone</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.alternatePhone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #7b1fa2'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: alpha('#7b1fa2', 0.1), 
                      color: '#7b1fa2',
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <HomeIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700" color="text.primary">
                      Address Information
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'none', alignItems: 'center', mb: 2 }}>
                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Address Information
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.address ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.street}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.city}, {employeeData.profile.contactInfo.address.state}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.postalCode}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile.contactInfo.address.country}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Address not provided
                    </Typography>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Bank Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Account Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Bank Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>IFSC Code</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1: PROFILE */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Personal Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Full Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {`${employeeData.profile?.personalInfo?.firstName || ''} ${employeeData.profile?.personalInfo?.lastName || ''}`.trim() || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Birth</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.dateOfBirth ? 
                          moment(employeeData.profile.personalInfo.dateOfBirth).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gender</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.gender || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Marital Status</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.maritalStatus || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Blood Group</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.personalInfo?.bloodGroup || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Contact Details */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid #388e3c'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: alpha('#388e3c', 0.1), 
                      color: '#388e3c',
                      mr: 2,
                      width: 40,
                      height: 40
                    }}>
                      <EmailIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700" color="text.primary">
                      Contact Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Official Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Personal Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.personalEmail || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.phone || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Alternate Phone</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.contactInfo?.alternatePhone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ContactSupportIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Emergency Contact
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.contactInfo?.emergencyContact ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Name</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {employeeData.profile.contactInfo.emergencyContact.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Relationship</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {employeeData.profile.contactInfo.emergencyContact.relationship}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Phone</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {employeeData.profile.contactInfo.emergencyContact.phone}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Emergency contact not provided
                    </Typography>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Bank & Tax Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Bank & Tax Information
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Account Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        ****{employeeData.profile?.salaryInfo?.bankDetails?.accountNumber?.slice(-4) || '****'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Bank Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.bankName || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>IFSC Code</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.bankDetails?.ifscCode || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>PAN Number</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.salaryInfo?.taxInfo?.panNumber ? 
                          `****${employeeData.profile.salaryInfo.taxInfo.panNumber.slice(-4)}` : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: JOB */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Employment Details */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Employment Details
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employee ID</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employeeId || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Designation</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.designation || 'Not provided'}
                      </Typography>
                    </Box>

                    {employeeData.profile?.employmentInfo?.position && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Position/Title</Typography>
                        <Chip 
                          label={employeeData.profile.employmentInfo.position} 
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Department</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.department?.name || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Date of Joining</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.dateOfJoining ? 
                          moment(employeeData.profile.employmentInfo.dateOfJoining).format('DD MMM YYYY') : 
                          'Not provided'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employment Status</Typography>
                      <Chip
                        label={employeeData.profile?.employmentInfo?.isActive ? 'Active' : 'Inactive'}
                        color={employeeData.profile?.employmentInfo?.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Reporting Structure */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Reporting Structure
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Reporting Manager</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.reportingManager?.personalInfo?.firstName ? 
                          `${employeeData.profile.employmentInfo.reportingManager.personalInfo.firstName} ${employeeData.profile.employmentInfo.reportingManager.personalInfo.lastName}` :
                          'Not assigned'
                        }
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Manager Email</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.reportingManager?.user?.email || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Work Location</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.workLocation || 'Not provided'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Employment Type</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employeeData.profile?.employmentInfo?.employmentType || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Salary Information */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Salary Information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Basic Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="primary.main">
                          ₹{employeeData.profile?.salaryInfo?.basicSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Gross Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="success.main">
                          ₹{employeeData.profile?.salaryInfo?.grossSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Net Salary</Typography>
                        <Typography variant="h6" fontWeight="600" color="info.main">
                          ₹{employeeData.profile?.salaryInfo?.netSalary?.toLocaleString() || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: EDUCATION */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Educational Qualifications
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.education && employeeData.profile.education.length > 0 ? (
                    <Grid container spacing={2}>
                      {employeeData.profile.education.map((edu, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                              {edu.degree || edu.qualification || 'Education'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {edu.institution || edu.school || 'Institution not specified'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {edu.fieldOfStudy || edu.specialization || 'Field not specified'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : 
                                 edu.year ? edu.year : 'Year not specified'}
                              </Typography>
                              {edu.grade && (
                                <Typography variant="caption" color="primary.main" fontWeight="500">
                                  Grade: {edu.grade}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <StarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No educational qualifications recorded
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Educational information will be displayed here once available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: EXPERIENCE */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Work Experience
                    </Typography>
                  </Box>
                  
                  {(() => {
                    const employmentHistory = employeeData.profile?.employmentHistory || [];
                    
                    console.log('🔍 Employment history to render:', employmentHistory);
                    
                    if (employmentHistory.length === 0) {
                      return (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No previous work experience recorded
                          </Typography>
                        </Box>
                      );
                    }
                    
                    return (
                      <Grid container spacing={2} key={`employment-history-${employmentHistory.length}`}>
                        {employmentHistory.map((exp, index) => {
                          console.log('🔍 Rendering experience:', exp);
                          console.log('🔍 Company name:', exp.company);
                          console.log('🔍 Designation:', exp.designation);
                          return (
                        <Grid item xs={12} key={index}>
                          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                  {exp.designation || 'Position'}
                                </Typography>
                                <Typography variant="subtitle1" color="primary.main" gutterBottom>
                                  {exp.company || 'Company'} {exp.company ? `(${exp.company})` : '(No company data)'}
                                </Typography>
                              </Box>
                              <Chip
                                label={!exp.endDate ? 'Current' : 'Previous'}
                                color={!exp.endDate ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            
                            {/* Duration and Salary Information */}
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <CalendarTodayIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Duration:</strong> {exp.startDate && exp.endDate ? 
                                      `${moment(exp.startDate).format('MMM YYYY')} - ${moment(exp.endDate).format('MMM YYYY')}` :
                                      exp.startDate ? `From ${moment(exp.startDate).format('MMM YYYY')}` :
                                      'Not specified'
                                    }
                                  </Typography>
                                </Box>
                                {exp.startDate && exp.endDate && (
                                  <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                    • {moment(exp.endDate).diff(moment(exp.startDate), 'years')} years {moment(exp.endDate).diff(moment(exp.startDate), 'months') % 12} months
                                  </Typography>
                                )}
                              </Grid>
                              {exp.salary && (
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoneyIcon sx={{ fontSize: '1rem', mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      <strong>Last Salary:</strong> ₹{exp.salary.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                            
                            {exp.reasonForLeaving && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Reason for Leaving:</strong> {exp.reasonForLeaving}
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                        );
                        })}
                      </Grid>
                    );
                  })()}
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: TIME */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            {/* Today's Status Card */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Today's Status
                    </Typography>
                  </Box>
                  
                  {attendanceStatus ? (
                    <Box>
                      {/* Check In/Out Times */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                              <Typography variant="body2" color="success.main" fontWeight="500">Check In</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="600">
                              {moment(attendanceStatus.checkIn).format('HH:mm A')}
                            </Typography>
                            {attendanceStatus.isLate && (
                              <Chip 
                                label={formatLateStatus(attendanceStatus.lateMinutes)} 
                                size="small" 
                                color="warning" 
                                sx={{ mt: 1 }} 
                              />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          {attendanceStatus.checkOut ? (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.main', borderRadius: 1, bgcolor: 'info.50' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                                <Typography variant="body2" color="info.main" fontWeight="500">Check Out</Typography>
                              </Box>
                              <Typography variant="h6" fontWeight="600">
                                {moment(attendanceStatus.checkOut).format('HH:mm A')}
                              </Typography>
                              {attendanceStatus.earlyDeparture && (
                                <Chip 
                                  label={`Early by ${attendanceStatus.earlyDepartureMinutes} min`} 
                                  size="small" 
                                  color="warning" 
                                  sx={{ mt: 1 }} 
                                />
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ mr: 1, color: 'grey.500', fontSize: 20 }} />
                                <Typography variant="body2" color="text.secondary" fontWeight="500">Check Out</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Still working...
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      </Grid>

                      {/* Working Hours Summary */}
                      <Box sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', borderRadius: 1, mb: 2 }}>
                        <Typography variant="subtitle2" color="primary.main" fontWeight="600" gutterBottom>
                          Today's Working Hours
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Total</Typography>
                            <Typography variant="h6" fontWeight="600" color="primary.main">
                              {attendanceStatus.totalHours ? `${attendanceStatus.totalHours.toFixed(1)}h` : 'In Progress'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Regular</Typography>
                            <Typography variant="h6" fontWeight="600" color="success.main">
                              {attendanceStatus.regularHours ? `${attendanceStatus.regularHours.toFixed(1)}h` : '0.0h'}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Overtime</Typography>
                            <Typography variant="h6" fontWeight="600" color="warning.main">
                              {attendanceStatus.overtimeHours ? `${attendanceStatus.overtimeHours.toFixed(1)}h` : '0.0h'}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">Break Time</Typography>
                          <Typography variant="body1" fontWeight="500">
                            {attendanceStatus.breakTime || '0h 0m'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        You haven't checked in today yet. Click the Check In button to mark your attendance.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Attendance Summary */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Attendance Summary
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Present Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {employeeData.attendance.present}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Late Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {employeeData.attendance.late}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Absent Days:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {employeeData.attendance.absent}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Working Days:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {employeeData.attendance.totalWorkingDays}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={attendancePercentage} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" textAlign="center" color="text.secondary">
                    {attendancePercentage}% Attendance Rate
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Leave Balance Section */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BeachAccessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Leave Balance & Quick Actions
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {leaveBalance.map((leave, index) => (
                      <Grid item xs={12} sm={4} key={index}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            {leave.leaveType.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Available:</Typography>
                            <Typography variant="body2" fontWeight="500" color="success.main">
                              {leave.available} days
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Used:</Typography>
                            <Typography variant="body2" fontWeight="500" color="warning.main">
                              {leave.used} days
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Total:</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {leave.allocated} days
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(leave.used / leave.allocated) * 100} 
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            color={leave.used / leave.allocated > 0.8 ? 'error' : 'primary'}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Quick Leave Actions */}
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<BeachAccessIcon />}
                      color="primary"
                      size="small"
                    >
                      Apply for Leave
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<EventIcon />}
                      color="secondary"
                      size="small"
                    >
                      Request Comp-off
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<AccessTimeIcon />}
                      color="info"
                      size="small"
                    >
                      View Leave History
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<CalendarTodayIcon />}
                      color="success"
                      size="small"
                    >
                      Holiday Calendar
                    </Button>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Divider */}
            <Grid item xs={12}>
              <Box sx={{ mt: 4, mb: 2 }}>
                <Divider sx={{ mb: 3 }}>
                  <Chip 
                    label="📊 Detailed Analytics & Reports" 
                    size="large" 
                    color="primary"
                    sx={{ 
                      fontSize: '1rem', 
                      fontWeight: 700, 
                      py: 2.5, 
                      px: 3,
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    }}
                  />
                </Divider>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Comprehensive analysis of your attendance, working hours, and performance metrics
                </Typography>
              </Box>
            </Grid>

            {/* Period Selector */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
                <Button
                  variant={reportPeriod === 'week' ? 'contained' : 'outlined'}
                  onClick={() => setReportPeriod('week')}
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                >
                  Weekly View
                </Button>
                <Button
                  variant={reportPeriod === 'month' ? 'contained' : 'outlined'}
                  onClick={() => setReportPeriod('month')}
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                >
                  Monthly View
                </Button>
              </Box>
            </Grid>

            {/* Working Hours Analytics */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Working Hours Trend
                    </Typography>
                  </Box>
                  
                  {reportPeriod === 'week' && weeklyAttendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weeklyAttendanceData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <Paper sx={{ p: 1.5 }}>
                                  <Typography variant="body2" fontWeight="600">{data.date}</Typography>
                                  <Typography variant="body2" color="primary">Hours: {data.hours}h</Typography>
                                  <Typography variant="body2" color={data.isLate ? 'warning.main' : 'success.main'}>
                                    Status: {data.status}
                                  </Typography>
                                  {data.isLate && (
                                    <Typography variant="body2" color="warning.main">
                                      {formatLateStatus(data.lateMinutes)}
                                    </Typography>
                                  )}
                                </Paper>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#1976d2" fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : reportPeriod === 'month' && monthlyAttendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyAttendanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#1976d2" name="Total Hours" />
                        <Bar dataKey="avgHours" fill="#4caf50" name="Avg Hours/Day" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No data available for the selected period
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Productivity Metrics */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Performance Metrics
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Productivity Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                          <Typography variant="h4" fontWeight="700" color="primary.main">
                            {workingHoursStats.productivityScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            /100
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={workingHoursStats.productivityScore} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2, bgcolor: 'success.50' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Daily Average
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="success.main">
                          {workingHoursStats.dailyAverage}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: 9h/day
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.main', borderRadius: 2, bgcolor: 'info.50' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Weekly Average
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="info.main">
                          {workingHoursStats.weeklyAverage}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Per day (Last 7 days)
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 2, bgcolor: 'warning.50' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Overtime Hours
                        </Typography>
                        <Typography variant="h4" fontWeight="700" color="warning.main">
                          {workingHoursStats.overtimeHours}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This month
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                      Monthly Total
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" fontWeight="700" color="primary.main">
                        {workingHoursStats.monthlyTotal} hours
                      </Typography>
                      <Chip 
                        label={workingHoursStats.monthlyTotal >= 160 ? "On Track" : "Below Target"}
                        color={workingHoursStats.monthlyTotal >= 160 ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Expected: ~180h/month (9h × 20 working days)
                    </Typography>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>

            {/* Late Arrival Analytics */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Late Arrival Analysis
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                        <Typography variant="h3" fontWeight="700" color="warning.main">
                          {lateArrivalStats.totalLateDays}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Late Days
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 30 days
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 2 }}>
                        <Typography variant="h3" fontWeight="700" color="error.main">
                          {lateArrivalStats.averageLateMinutes}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Minutes Late
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Per late arrival
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {lateArrivalStats.lateByWeek.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={lateArrivalStats.lateByWeek}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <Paper sx={{ p: 1.5 }}>
                                  <Typography variant="body2" fontWeight="600">{data.week}</Typography>
                                  <Typography variant="body2">Late Days: {data.count}</Typography>
                                  <Typography variant="body2">Avg: {data.avgMinutes} min</Typography>
                                </Paper>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#ff9800" name="Late Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {lateArrivalStats.totalLateDays === 0 && (
                    <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography variant="body1" fontWeight="600" color="success.main">
                        Perfect Punctuality!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No late arrivals in the last 30 days
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Attendance Pattern */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Attendance Pattern
                    </Typography>
                  </Box>
                  
                  {reportPeriod === 'month' && monthlyAttendanceData.length > 0 && (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyAttendanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="presentDays" stroke="#4caf50" strokeWidth={2} name="Present Days" />
                          <Line type="monotone" dataKey="lateDays" stroke="#ff9800" strokeWidth={2} name="Late Days" />
                        </LineChart>
                      </ResponsiveContainer>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        {monthlyAttendanceData.map((week, index) => (
                          <Grid item xs={6} sm={3} key={index}>
                            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {week.week}
                              </Typography>
                              <Typography variant="h6" fontWeight="600" color="success.main">
                                {week.presentDays}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Present
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                  
                  {reportPeriod === 'week' && weeklyAttendanceData.length > 0 && (
                    <Box>
                      <Grid container spacing={1}>
                        {weeklyAttendanceData.map((day, index) => (
                          <Grid item xs={12} key={index}>
                            <Box 
                              sx={{ 
                                p: 1.5, 
                                border: '1px solid', 
                                borderColor: day.status === 'present' ? 'success.main' : day.status === 'late' ? 'warning.main' : 'error.main',
                                borderRadius: 1,
                                bgcolor: day.status === 'present' ? 'success.50' : day.status === 'late' ? 'warning.50' : 'error.50',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight="600">
                                  {day.date}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {day.hours}h worked
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip 
                                  label={day.status.toUpperCase()} 
                                  size="small"
                                  color={day.status === 'present' ? 'success' : day.status === 'late' ? 'warning' : 'error'}
                                />
                                {day.isLate && (
                                  <Typography variant="caption" display="block" color="warning.main">
                                    +{day.lateMinutes}m late
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>

            {/* Insights and Recommendations */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      Insights & Recommendations
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {workingHoursStats.productivityScore >= 80 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="success" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Excellent Performance!
                          </Typography>
                          <Typography variant="body2">
                            Your productivity score of {workingHoursStats.productivityScore}% is outstanding. Keep up the great work!
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {workingHoursStats.productivityScore < 80 && workingHoursStats.productivityScore >= 60 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="info" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Good Progress
                          </Typography>
                          <Typography variant="body2">
                            Your productivity is good at {workingHoursStats.productivityScore}%. A bit more consistency can help you reach excellence!
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {workingHoursStats.productivityScore < 60 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="warning" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Improvement Needed
                          </Typography>
                          <Typography variant="body2">
                            Your productivity score is {workingHoursStats.productivityScore}%. Focus on regular attendance and punctuality to improve.
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {lateArrivalStats.totalLateDays > 5 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="warning" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Punctuality Reminder
                          </Typography>
                          <Typography variant="body2">
                            You've been late {lateArrivalStats.totalLateDays} times this month. Try to arrive on time to improve your performance metrics.
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {lateArrivalStats.totalLateDays === 0 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="success" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Perfect Punctuality!
                          </Typography>
                          <Typography variant="body2">
                            No late arrivals this month. Your punctuality sets a great example!
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {workingHoursStats.overtimeHours > 20 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="info" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Work-Life Balance
                          </Typography>
                          <Typography variant="body2">
                            You've worked {workingHoursStats.overtimeHours}h overtime this month. Remember to maintain a healthy work-life balance!
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    {workingHoursStats.dailyAverage < 8 && (
                      <Grid item xs={12} md={4}>
                        <Alert severity="info" sx={{ height: '100%' }}>
                          <Typography variant="body2" fontWeight="600" gutterBottom>
                            Working Hours
                          </Typography>
                          <Typography variant="body2">
                            Your daily average is {workingHoursStats.dailyAverage}h. Consider working closer to the standard 9h/day for optimal productivity.
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 6: DOCUMENTS */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                      My Documents
                    </Typography>
                  </Box>
                  
                  {employeeData.profile?.documents && employeeData.profile.documents.length > 0 ? (
                    <Grid container spacing={2}>
                      {employeeData.profile.documents.map((doc, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: 'primary.main', mr: 2 }}>
                              <DescriptionIcon />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                {doc.name || doc.type || 'Document'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Type: {doc.type || 'Unknown'}
                              </Typography>
                              {doc.uploadedAt && (
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded: {moment(doc.uploadedAt).format('DD MMM YYYY')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              disabled={!doc.filePath}
                              sx={{ flexGrow: 1 }}
                              onClick={() => {
                                if (doc.filePath) {
                                  // Handle document download
                                  const link = document.createElement('a');
                                  link.href = doc.filePath.startsWith('http') ? doc.filePath : `http://localhost:5001${doc.filePath}`;
                                  link.download = doc.name;
                                  link.target = '_blank';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                            >
                              {doc.filePath ? 'Download' : 'Not Available'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              disabled={!doc.filePath}
                              onClick={() => {
                                if (doc.filePath) {
                                  // Handle document viewing
                                  const url = doc.filePath.startsWith('http') ? doc.filePath : `http://localhost:5001${doc.filePath}`;
                                  window.open(url, '_blank');
                                }
                              }}
                            >
                              View
                            </Button>
                          </Box>
                          
                          {doc.expiryDate && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                              Expires: {moment(doc.expiryDate).format('DD MMM YYYY')}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No documents uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Documents will be displayed here once uploaded
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Floating Support Button */}
      <Fab
        color="primary"
        aria-label="support"
        onClick={() => setSupportDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <SupportIcon />
      </Fab>

      {/* Support Dialog */}
      <Dialog open={supportDialog} onClose={() => setSupportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <SupportIcon sx={{ mr: 1 }} />
          HR Support & Helpdesk
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={ticketForm.category}
                  label="Category"
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                >
                  <MenuItem value="payroll">Payroll</MenuItem>
                  <MenuItem value="it">IT Support</MenuItem>
                  <MenuItem value="hr">HR Query</MenuItem>
                  <MenuItem value="leave">Leave Management</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={ticketForm.priority}
                  label="Priority"
                  onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSupportTicket} 
            variant="contained"
            disabled={!ticketForm.category || !ticketForm.subject || !ticketForm.description}
          >
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Announcements Section */}
      <Box sx={{ px: 3, pb: 3 }}>
        <AnnouncementsSection />
      </Box>

      {/* Employee Overview Section */}
      <Box sx={{ px: 3, pb: 3 }}>
        <EmployeeOverviewSection userRole={user?.role} />
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
