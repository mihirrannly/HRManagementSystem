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
  useTheme,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BeachAccess as BeachAccessIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
  PushPin as PinIcon,
  Poll as PollIcon,
  ThumbUp as ThumbUpIcon,
  Favorite as FavoriteIcon,
  Celebration as CelebrationIcon,
  SupportAgent as SupportIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import TeamDashboard from './TeamDashboard';

// Sample data for charts (replace with real API data)
const attendanceData = [
  { name: 'Mon', present: 85, absent: 15 },
  { name: 'Tue', present: 90, absent: 10 },
  { name: 'Wed', present: 88, absent: 12 },
  { name: 'Thu', present: 92, absent: 8 },
  { name: 'Fri', present: 87, absent: 13 },
];

const leaveData = [
  { name: 'Sick Leave', value: 30, color: '#ff6b6b' },
  { name: 'Casual Leave', value: 45, color: '#4ecdc4' },
  { name: 'Earned Leave', value: 25, color: '#45b7d1' },
];

const departmentData = [
  { name: 'Engineering', employees: 45 },
  { name: 'Sales', employees: 32 },
  { name: 'Marketing', employees: 28 },
  { name: 'HR', employees: 12 },
  { name: 'Finance', employees: 18 },
];

const StatCard = ({ title, value, change, icon, color = '#1976d2', subtitle, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderLeft: `3px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {change > 0 ? (
              <TrendingUpIcon color="success" sx={{ mr: 1, fontSize: 16 }} />
            ) : (
              <TrendingDownIcon color="error" sx={{ mr: 1, fontSize: 16 }} />
            )}
            <Typography
              variant="caption"
              color={change > 0 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {Math.abs(change)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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
      case 'support': return <SupportIcon sx={{ fontSize: 16 }} />;
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
      console.log('🔥 FETCHING PROBATION DATA - NEW CODE LOADED! 🔥');
      const [exitsRes, recentExitsRes, onboardingRes, recentOnboardingRes, probationRes, birthdaysRes, anniversariesRes] = await Promise.all([
        axios.get('/exit-management/').catch(() => ({ data: [] })),
        axios.get('/exit-management/recent-exits').catch(() => ({ data: { success: false, exits: [] } })),
        axios.get('/onboarding/').catch(() => ({ data: [] })),
        axios.get('/onboarding/recent-onboarding').catch(() => ({ data: { success: false, onboarding: [] } })),
        axios.get('/employees/on-probation').catch(() => ({ data: { success: false, employees: [] } })),
        axios.get('/employees/birthdays').catch(() => ({ data: { success: false } })),
        axios.get('/employees/anniversaries').catch(() => ({ data: { success: false } })),
      ]);
      console.log('📊 Probation Response:', probationRes.data);
      console.log('📊 Recent Exits Response:', recentExitsRes.data);
      console.log('📊 Recent Onboarding Response:', recentOnboardingRes.data);

      // Process exits
      if (Array.isArray(exitsRes.data)) {
        setExits(exitsRes.data.filter(exit => exit.status !== 'completed' && exit.status !== 'cancelled'));
      }

      // Process recent exits (last 2 months)
      if (recentExitsRes.data.success && Array.isArray(recentExitsRes.data.exits)) {
        console.log('✅ Setting recent exits:', recentExitsRes.data.exits.length, 'exits found');
        setRecentExits(recentExitsRes.data.exits);
      } else {
        console.log('⚠️  Recent exits data format issue:', recentExitsRes.data);
      }

      // Process recent onboarding (last 1 month)
      if (recentOnboardingRes.data.success && Array.isArray(recentOnboardingRes.data.onboarding)) {
        console.log('✅ Setting recent onboarding:', recentOnboardingRes.data.onboarding.length, 'onboarding found');
        setOnboarding(recentOnboardingRes.data.onboarding);
      } else {
        console.log('⚠️  Recent onboarding data format issue:', recentOnboardingRes.data);
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

const Dashboard = () => {
  const { user, employee } = useAuth();
  const navigate = useNavigate();

  // Show employee-specific dashboard for employee role
  // Also show employee dashboard for specific admin users and HR
  const showEmployeeDashboard = user?.role === 'employee' || 
    ['mihir@rannkly.com', 'vishnu@rannkly.com', 'shobhit@rannkly.com', 'hr@rannkly.com', 'prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'].includes(user?.email?.toLowerCase());
  
  // Show team dashboard for managers or users with team members
  const showTeamDashboard = user?.role === 'manager' || 
    (user?.email?.toLowerCase().includes('prajwal') && user?.role !== 'employee');
  
  // Always show employee dashboard for everyone to match employee section structure
  if (showEmployeeDashboard || showTeamDashboard) {
    return <EmployeeDashboard />;
  }

  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalEmployees: 0,
      newJoinees: 0,
      pendingLeaves: 0,
      approvedLeavesThisMonth: 0,
    },
    attendance: {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    },
    departments: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [officeStatus, setOfficeStatus] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceStatus();
    // Fetch office status for users who can mark attendance
    if (user?.role === 'employee' || user?.role === 'admin') {
      fetchOfficeStatus();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/reports/dashboard');
      // Transform the API response to match the expected structure
      const transformedData = {
        overview: {
          totalEmployees: response.data.totalEmployees || 0,
          newJoinees: response.data.newEmployeesThisMonth || 0,
          pendingLeaves: 0, // Not available from API yet
          approvedLeavesThisMonth: 0, // Not available from API yet
        },
        attendance: {
          present: 0, // Not available from API yet
          absent: 0,
          late: 0,
          halfDay: 0,
        },
        departments: response.data.departments || [],
        activities: response.data.activities || [],
        totalDepartments: response.data.totalDepartments || 0,
        employeesOnProbation: response.data.employeesOnProbation || 0,
      };
      setDashboardData(transformedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get('/attendance/status');
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
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

  const handleCheckIn = async () => {
    try {
      const response = await axios.post('/attendance/checkin', {
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.isLate) {
          toast.warning(`You are ${response.data.lateMinutes} minutes late`);
        }
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('Error checking in:', error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Check-in only allowed from office premises');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check in');
      }
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axios.post('/attendance/checkout', {
        deviceInfo: {
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          os: navigator.platform,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.isEarlyDeparture) {
          toast.warning(`Early departure: ${response.data.earlyMinutes} minutes`);
        }
        if (response.data.workingHours) {
          toast.info(`Total working hours: ${response.data.workingHours}`);
        }
        fetchAttendanceStatus();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Check-out only allowed from office premises');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check out');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary">
          Welcome back, {employee?.personalInfo ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}` : 'User'}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {moment().format('dddd, MMMM Do YYYY')}
        </Typography>
      </Box>

      {/* Quick Actions for Employees and Admins */}
      {(user?.role === 'employee' || user?.role === 'admin') && (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Today's Attendance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {attendanceStatus?.isCheckedIn 
                    ? `Checked in at ${moment(attendanceStatus.checkInTime).format('HH:mm')}`
                    : 'Not checked in yet'
                  }
                </Typography>
                {attendanceStatus?.isCheckedOut && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Checked out at {moment(attendanceStatus.checkOutTime).format('HH:mm')}
                  </Typography>
                )}
              </Box>
              <Box>
                {attendanceStatus?.status === 'weekend' ? (
                  <Chip
                    label="Weekend"
                    sx={{ bgcolor: '#9e9e9e', color: 'white', fontWeight: 'bold' }}
                  />
                ) : !attendanceStatus?.isCheckedIn ? (
                  <Chip
                    label="Check In"
                    onClick={handleCheckIn}
                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                  />
                ) : !attendanceStatus?.isCheckedOut ? (
                  <Chip
                    label="Check Out"
                    onClick={handleCheckOut}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    label="Completed"
                    sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Employees"
            value={dashboardData.overview.totalEmployees}
            change={5}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Present Today"
            value={dashboardData.attendance.present}
            change={2}
            icon={<CheckCircleIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pending Leaves"
            value={dashboardData.overview.pendingLeaves}
            change={-10}
            icon={<ScheduleIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="New Joiners"
            value={dashboardData.overview.newJoinees}
            change={15}
            icon={<TrendingUpIcon />}
            color="#00acc1"
          />
        </Grid>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Organization"
              value="Dashboard"
              icon={<BusinessIcon />}
              color="#7b1fa2"
              onClick={() => navigate('/organization')}
            />
          </Grid>
        )}
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Team"
              value="Management"
              icon={<PeopleIcon />}
              color="#00acc1"
              onClick={() => navigate('/employees')}
            />
          </Grid>
        )}
      </Grid>

      {/* Charts and Analytics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Attendance Chart */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: 400,
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ flex: 1 }}>
                Weekly Attendance Overview
              </Typography>
              <IconButton size="small">
                <RefreshIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ fill: '#4caf50', strokeWidth: 2, r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="#f44336"
                  strokeWidth={3}
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Leave Distribution */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: 400,
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
              Leave Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Overview and Recent Activities */}
      <Grid container spacing={3}>
        {/* Department Overview */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: 400,
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
              Department Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: 400,
              border: '1px solid #e0e0e0',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="John Doe checked in"
                  secondary="2 minutes ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <BeachAccessIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Leave request approved for Jane Smith"
                  secondary="1 hour ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PeopleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="New employee onboarded"
                  secondary="3 hours ago"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Payroll processed for December"
                  secondary="1 day ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Announcements Section */}
      <AnnouncementsSection />

      {/* Employee Overview Section */}
      <EmployeeOverviewSection userRole={user?.role} />
    </Box>
  );
};

export default Dashboard;
