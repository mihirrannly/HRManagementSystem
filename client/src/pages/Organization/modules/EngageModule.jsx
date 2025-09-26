import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Rating,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  EmojiEvents as EmojiEventsIcon,
  Forum as ForumIcon,
  Poll as PollIcon,
  Celebration as CelebrationIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

const EngageModule = () => {
  const engagementStats = {
    overallScore: 4.2,
    participation: 85,
    satisfaction: 78,
    retention: 92
  };

  const surveys = [
    { id: 1, title: 'Employee Satisfaction Survey Q4 2024', responses: 145, total: 180, status: 'active' },
    { id: 2, title: 'Work-Life Balance Assessment', responses: 98, total: 180, status: 'active' },
    { id: 3, title: 'Manager Feedback Survey', responses: 180, total: 180, status: 'completed' },
  ];

  const recognitions = [
    { id: 1, employee: 'Alice Johnson', achievement: 'Outstanding Performance', date: '2024-11-20', type: 'performance' },
    { id: 2, employee: 'Bob Wilson', achievement: 'Team Player Award', date: '2024-11-18', type: 'teamwork' },
    { id: 3, employee: 'Carol Davis', achievement: 'Innovation Award', date: '2024-11-15', type: 'innovation' },
  ];

  const events = [
    { id: 1, title: 'Annual Company Retreat', date: '2024-12-15', attendees: 150, type: 'company' },
    { id: 2, title: 'Tech Talk: AI in HR', date: '2024-12-08', attendees: 45, type: 'learning' },
    { id: 3, title: 'Holiday Party', date: '2024-12-20', attendees: 200, type: 'social' },
  ];

  const getEventIcon = (type) => {
    const icons = {
      company: <CelebrationIcon />,
      learning: <PsychologyIcon />,
      social: <GroupsIcon />
    };
    return icons[type] || <EmojiEventsIcon />;
  };

  const getRecognitionChip = (type) => {
    const configs = {
      performance: { color: 'success', label: 'Performance' },
      teamwork: { color: 'info', label: 'Teamwork' },
      innovation: { color: 'warning', label: 'Innovation' }
    };
    const config = configs[type] || { color: 'default', label: type };
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  return (
    <Fade in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Employee Engagement
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PollIcon />}>
              New Survey
            </Button>
            <Button variant="contained" startIcon={<EmojiEventsIcon />}>
              Add Recognition
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #00695c 0%, #00897b 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {engagementStats.overallScore}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Overall Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupsIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {engagementStats.participation}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Participation Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FavoriteIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {engagementStats.satisfaction}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Satisfaction
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PsychologyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {engagementStats.retention}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Retention Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Surveys */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ height: 400, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold">
                  Active Surveys
                </Typography>
              </Box>
              
              <List>
                {surveys.map((survey) => (
                  <ListItem key={survey.id} sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <PollIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={survey.title}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                              {survey.responses}/{survey.total} responses
                            </Typography>
                            <Chip 
                              size="small" 
                              color={survey.status === 'active' ? 'warning' : 'success'} 
                              label={survey.status} 
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(survey.responses / survey.total) * 100} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recognition */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ height: 400, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Recognition
                </Typography>
              </Box>
              
              <List>
                {recognitions.map((recognition) => (
                  <ListItem key={recognition.id} sx={{ py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <EmojiEventsIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={recognition.employee}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {recognition.achievement}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                            {getRecognitionChip(recognition.type)}
                            <Typography variant="caption">
                              {recognition.date}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Upcoming Events
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {events.map((event) => (
                  <Grid item xs={12} md={4} key={event.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {getEventIcon(event.type)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.date}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.attendees} expected attendees
                        </Typography>
                        <Button size="small" variant="outlined" sx={{ mt: 2 }}>
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default EngageModule;
