import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  PushPin as PinIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Poll as PollIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityOnIcon,
  VisibilityOff as VisibilityOffIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment';

const CATEGORIES = [
  { value: 'general', label: 'General', color: '#2196f3' },
  { value: 'policy', label: 'Policy', color: '#9c27b0' },
  { value: 'event', label: 'Event', color: '#ff9800' },
  { value: 'update', label: 'Update', color: '#00bcd4' },
  { value: 'urgent', label: 'Urgent', color: '#f44336' },
  { value: 'celebration', label: 'Celebration', color: '#4caf50' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const TARGET_AUDIENCES = [
  { value: 'all', label: 'All Employees' },
  { value: 'department', label: 'Specific Departments' },
  { value: 'location', label: 'Specific Locations' },
  { value: 'role', label: 'Specific Roles' },
];

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [expandedPoll, setExpandedPoll] = useState(null);
  const [voterDetails, setVoterDetails] = useState({});
  const [expandedReactions, setExpandedReactions] = useState(null);
  const [reactionDetails, setReactionDetails] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    category: 'general',
    targetAudience: 'all',
    targetDepartments: [],
    targetLocations: [],
    targetRoles: [],
    isPinned: false,
    isActive: true,
    startDate: moment().format('YYYY-MM-DD'),
    endDate: '',
    isPoll: false,
    pollOptions: ['', ''],
    pollMultipleChoice: false,
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchDepartmentsAndLocations();
    
    // Auto-refresh every 30 seconds to get latest votes/reactions
    const refreshInterval = setInterval(() => {
      fetchAnnouncements();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/announcements', {
        params: { showInactive: true }
      });
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
        // Fetch voter details for polls
        await fetchVoterDetailsForPolls(response.data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
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
              // Fetch user details for each vote
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

  const handleMenuOpen = (event, announcement) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAnnouncement(announcement);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAnnouncement(null);
  };

  const handleMenuAction = async (action) => {
    if (!selectedAnnouncement) return;

    switch (action) {
      case 'edit':
        handleOpenDialog(selectedAnnouncement);
        break;
      case 'delete':
        handleMenuClose();
        await handleDelete(selectedAnnouncement._id);
        break;
      case 'toggle':
        await handleToggleActive(selectedAnnouncement);
        break;
      case 'showVoters':
        togglePollExpand(selectedAnnouncement._id);
        break;
      default:
        break;
    }
    
    if (action !== 'delete') {
      handleMenuClose();
    }
  };

  const getReactionIcon = (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'celebrate': return '🎉';
      case 'support': return '🤝';
      case 'insightful': return '💡';
      default: return '👍';
    }
  };

  const getReactionLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const fetchDepartmentsAndLocations = async () => {
    try {
      // Fetch unique departments and locations from employees
      const response = await axios.get('/employees');
      const employees = response.data.employees || [];
      
      const uniqueDepts = [...new Set(employees.map(e => e.employmentDetails?.department).filter(Boolean))];
      const uniqueLocs = [...new Set(employees.map(e => e.employmentDetails?.location).filter(Boolean))];
      
      setDepartments(uniqueDepts);
      setLocations(uniqueLocs);
    } catch (error) {
      console.error('Error fetching departments/locations:', error);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    console.log('🔵 Opening dialog for:', announcement ? 'EDIT' : 'CREATE NEW');
    if (announcement) {
      console.log('📝 Editing announcement:', announcement._id);
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        category: announcement.category,
        targetAudience: announcement.targetAudience,
        targetDepartments: announcement.targetDepartments || [],
        targetLocations: announcement.targetLocations || [],
        targetRoles: announcement.targetRoles || [],
        isPinned: announcement.isPinned,
        isActive: announcement.isActive,
        startDate: announcement.startDate ? moment(announcement.startDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        endDate: announcement.endDate ? moment(announcement.endDate).format('YYYY-MM-DD') : '',
        isPoll: announcement.isPoll,
        pollOptions: announcement.pollOptions?.map(o => o.option) || ['', ''],
        pollMultipleChoice: announcement.pollMultipleChoice || false,
      });
    } else {
      console.log('✨ Creating new announcement');
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        category: 'general',
        targetAudience: 'all',
        targetDepartments: [],
        targetLocations: [],
        targetRoles: [],
        isPinned: false,
        isActive: true,
        startDate: moment().format('YYYY-MM-DD'),
        endDate: '',
        isPoll: false,
        pollOptions: ['', ''],
        pollMultipleChoice: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit called with formData:', formData);
    
    if (!formData.title.trim()) {
      console.log('❌ Validation failed: Title is required');
      toast.error('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      console.log('❌ Validation failed: Content is required');
      toast.error('Content is required');
      return;
    }
    if (formData.isPoll && formData.pollOptions.filter(o => o.trim()).length < 2) {
      console.log('❌ Validation failed: Poll needs at least 2 options');
      toast.error('Poll must have at least 2 options');
      return;
    }

    console.log('✅ Validation passed');

    try {
      const payload = {
        ...formData,
        pollOptions: formData.isPoll ? formData.pollOptions.filter(o => o.trim()) : [],
        endDate: formData.endDate || null,
      };

      if (editingAnnouncement) {
        console.log('📝 Updating announcement:', editingAnnouncement._id);
        console.log('Payload:', payload);
        const response = await axios.put(`/announcements/${editingAnnouncement._id}`, payload);
        console.log('✅ Update response:', response.data);
        if (response.data.success) {
          toast.success('Announcement updated successfully');
          fetchAnnouncements();
          handleCloseDialog();
        } else {
          console.log('❌ Update failed:', response.data.message);
          toast.error(response.data.message || 'Failed to update announcement');
        }
      } else {
        console.log('✨ Creating new announcement');
        console.log('Payload:', payload);
        const response = await axios.post('/announcements', payload);
        console.log('✅ Create response:', response.data);
        if (response.data.success) {
          toast.success('Announcement created successfully');
          fetchAnnouncements();
          handleCloseDialog();
        } else {
          console.log('❌ Create failed:', response.data.message);
          toast.error(response.data.message || 'Failed to create announcement');
        }
      }
    } catch (error) {
      console.error('❌ Error saving announcement:', error);
      console.error('Error details:', error.response?.data);
      console.error('Full error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await axios.delete(`/announcements/${id}`);
      if (response.data.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement) => {
    // If deactivating (currently active), ask for confirmation
    if (announcement.isActive) {
      const confirmed = window.confirm(
        `Are you sure you want to deactivate "${announcement.title}"?\n\n` +
        `This announcement will no longer be visible to employees on the dashboard.`
      );
      if (!confirmed) {
        return; // User cancelled
      }
    }
    
    try {
      const response = await axios.put(`/announcements/${announcement._id}`, {
        isActive: !announcement.isActive
      });
      if (response.data.success) {
        toast.success(`Announcement ${announcement.isActive ? 'deactivated' : 'activated'}`);
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const addPollOption = () => {
    setFormData({
      ...formData,
      pollOptions: [...formData.pollOptions, '']
    });
  };

  const removePollOption = (index) => {
    if (formData.pollOptions.length <= 2) {
      toast.error('Poll must have at least 2 options');
      return;
    }
    const newOptions = formData.pollOptions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      pollOptions: newOptions
    });
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...formData.pollOptions];
    newOptions[index] = value;
    setFormData({
      ...formData,
      pollOptions: newOptions
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            <CampaignIcon sx={{ fontSize: 36, verticalAlign: 'middle', mr: 1 }} />
            Announcement Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage company-wide announcements and polls • Auto-refreshes every 30s
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnnouncements}
            size="large"
          >
            Refresh Now
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            New Announcement
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="700" color="primary">
                {announcements.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Announcements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="700" color="success.main">
                {announcements.filter(a => a.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="700" color="warning.main">
                {announcements.filter(a => a.isPinned).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pinned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="700" color="info.main">
                {announcements.filter(a => a.isPoll).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Polls
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Announcements List */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            All Announcements
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {announcements.length === 0 ? (
            <Alert severity="info">
              No announcements yet. Create your first announcement to get started!
            </Alert>
          ) : (
            <List>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement._id}>
                  <ListItem
                    sx={{
                      bgcolor: announcement.isActive ? 'background.paper' : 'action.disabledBackground',
                      borderRadius: 1,
                      mb: 1,
                      border: announcement.isPinned ? '2px solid #ff9800' : '1px solid #e0e0e0',
                    }}
                  >
                    <ListItemIcon>
                      {announcement.isPoll ? (
                        <PollIcon color="primary" />
                      ) : (
                        <CampaignIcon color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {announcement.title}
                          </Typography>
                          {announcement.isPinned && (
                            <Chip icon={<PinIcon />} label="Pinned" size="small" color="warning" />
                          )}
                          <Chip
                            label={CATEGORIES.find(c => c.value === announcement.category)?.label}
                            size="small"
                            sx={{ bgcolor: CATEGORIES.find(c => c.value === announcement.category)?.color, color: 'white' }}
                          />
                          <Chip
                            label={announcement.priority}
                            size="small"
                            color={
                              announcement.priority === 'urgent' ? 'error' :
                              announcement.priority === 'high' ? 'warning' :
                              announcement.priority === 'medium' ? 'info' : 'default'
                            }
                          />
                          {!announcement.isActive && (
                            <Chip label="Inactive" size="small" color="default" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="div" sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {announcement.content.substring(0, 150)}...
                          </Typography>
                          {announcement.isPoll && announcement.pollOptions && (
                            <Box sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="caption" fontWeight="600" color="primary" display="block" sx={{ mb: 1 }}>
                                Poll Results
                              </Typography>
                              {announcement.pollOptions.map((option, idx) => (
                                <Box key={idx} sx={{ mb: 1 }}>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    • {option.option}: {option.votes?.length || 0} vote{(option.votes?.length || 0) !== 1 ? 's' : ''}
                                  </Typography>
                                  
                                  {expandedPoll === announcement._id && option.votes?.length > 0 && (
                                    <Box sx={{ ml: 2, mt: 0.5, mb: 1, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                      <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                        Voted by:
                                      </Typography>
                                      {voterDetails[announcement._id]?.[idx]?.length > 0 ? (
                                        voterDetails[announcement._id][idx].map((voter, vIdx) => (
                                          <Box key={vIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                                            <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                              {voter.name} ({voter.employeeId})
                                            </Typography>
                                          </Box>
                                        ))
                                      ) : (
                                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                          Loading voter details...
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              <VisibilityIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                              {announcement.views?.length || 0} views
                            </Typography>
                            <Tooltip title="Click to see who reacted">
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                onClick={() => toggleReactionsExpand(announcement._id)}
                              >
                                <ThumbUpIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                {announcement.reactions?.length || 0} reactions
                                {expandedReactions === announcement._id ? ' ▲' : ' ▼'}
                              </Typography>
                            </Tooltip>
                            {announcement.isPoll && (
                              <Typography variant="caption" color="primary.main" fontWeight="600">
                                <PollIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                {announcement.pollOptions?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)} total votes
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {moment(announcement.createdAt).format('MMM DD, YYYY')}
                            </Typography>
                          </Box>
                          
                          {expandedReactions === announcement._id && reactionDetails[announcement._id]?.length > 0 && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                              <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                Reactions:
                              </Typography>
                              {reactionDetails[announcement._id].map((reactor, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                                  <Typography variant="caption" sx={{ fontSize: 14 }}>
                                    {getReactionIcon(reactor.type)}
                                  </Typography>
                                  <PersonIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {reactor.name} ({reactor.employeeId}) - {getReactionLabel(reactor.type)}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Actions">
                        <IconButton 
                          edge="end" 
                          onClick={(e) => handleMenuOpen(e, announcement)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < announcements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedAnnouncement?.isPoll && (
          <MenuItem onClick={() => handleMenuAction('showVoters')}>
            <ListItemIcon>
              {expandedPoll === selectedAnnouncement?._id ? <VisibilityOffIcon fontSize="small" /> : <VisibilityOnIcon fontSize="small" />}
            </ListItemIcon>
            {expandedPoll === selectedAnnouncement?._id ? 'Hide Voters' : 'Show Voters'}
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuAction('toggle')}>
          <ListItemIcon>
            {selectedAnnouncement?.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
          </ListItemIcon>
          {selectedAnnouncement?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Target Audience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                {TARGET_AUDIENCES.map((audience) => (
                  <MenuItem key={audience.value} value={audience.value}>
                    {audience.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.targetAudience === 'department' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Departments</InputLabel>
                  <Select
                    multiple
                    value={formData.targetDepartments}
                    onChange={(e) => setFormData({ ...formData, targetDepartments: e.target.value })}
                    input={<OutlinedInput label="Select Departments" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        <Checkbox checked={formData.targetDepartments.indexOf(dept) > -1} />
                        <ListItemText primary={dept} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.targetAudience === 'location' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Locations</InputLabel>
                  <Select
                    multiple
                    value={formData.targetLocations}
                    onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
                    input={<OutlinedInput label="Select Locations" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc} value={loc}>
                        <Checkbox checked={formData.targetLocations.indexOf(loc) > -1} />
                        <ListItemText primary={loc} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.targetAudience === 'role' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Roles</InputLabel>
                  <Select
                    multiple
                    value={formData.targetRoles}
                    onChange={(e) => setFormData({ ...formData, targetRoles: e.target.value })}
                    input={<OutlinedInput label="Select Roles" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {ROLES.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Checkbox checked={formData.targetRoles.indexOf(role.value) > -1} />
                        <ListItemText primary={role.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date (Optional)"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  />
                }
                label="Pin to top"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPoll}
                    onChange={(e) => setFormData({ ...formData, isPoll: e.target.checked })}
                  />
                }
                label="Make this a poll"
              />
            </Grid>

            {formData.isPoll && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.pollMultipleChoice}
                        onChange={(e) => setFormData({ ...formData, pollMultipleChoice: e.target.checked })}
                      />
                    }
                    label="Allow multiple choices"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Poll Options
                  </Typography>
                  {formData.pollOptions.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                      />
                      {formData.pollOptions.length > 2 && (
                        <IconButton onClick={() => removePollOption(index)} color="error">
                          <CloseIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addPollOption}
                  >
                    Add Option
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementManagement;

