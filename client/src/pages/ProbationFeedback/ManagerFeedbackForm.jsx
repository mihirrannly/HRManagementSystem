import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Slider,
  Button,
  Grid,
  Divider,
  Stack,
  Alert,
  Paper,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Container,
  Chip,
  Avatar,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Recommend as RecommendIcon,
  Send as SendIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerFeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    // Performance Evaluation
    technicalSkills: 5,
    workQuality: 5,
    productivity: 5,
    learningAbility: 5,
    
    // Behavioral Assessment
    communication: 5,
    teamwork: 5,
    initiative: 5,
    reliability: 5,
    adaptability: 5,
    
    // Overall Assessment
    keyStrengths: '',
    areasForImprovement: '',
    trainingRecommendations: '',
    specificAchievements: '',
    concernsOrIssues: '',
    
    // Recommendation
    recommendation: 'confirm',
    extensionReason: '',
    extensionPeriod: 3,
    confirmationComments: '',
    
    // Future Planning
    roleExpectations: '',
    developmentPlan: ''
  });

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/probation-feedback/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFeedback(response.data.feedback);
        
        // Check if already submitted
        if (response.data.feedback.managerFeedback?.submitted) {
          toast.error('You have already submitted your assessment');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to load assessment form');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.keyStrengths || !formData.specificAchievements || !formData.recommendation) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate extension fields if extending probation
      if (formData.recommendation === 'extend_probation' && !formData.extensionReason) {
        toast.error('Please provide reason for extension');
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/probation-feedback/${id}/manager`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Assessment submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSlider = (label, field, description, min = 1, max = 10) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        {label} *
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={formData[field]}
          onChange={(e, value) => handleSliderChange(field, value)}
          min={min}
          max={max}
          step={1}
          marks
          valueLabelDisplay="on"
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Poor</Typography>
          <Typography variant="caption" color="text.secondary">Excellent</Typography>
        </Box>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading assessment form...</Typography>
      </Container>
    );
  }

  if (!feedback) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Assessment form not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 3,
            p: 4,
            mb: 4,
            textAlign: 'center',
            color: 'white'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2
            }}
          >
            <AssignmentIcon sx={{ fontSize: 48, color: '#f5576c' }} />
          </Box>
          <Typography variant="h3" fontWeight="700" gutterBottom>
            📋 Manager Assessment
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Probation Review for {feedback.employeeName}
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Chip
              label={`Joined: ${new Date(feedback.joiningDate).toLocaleDateString()}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label={`${feedback.department} - ${feedback.designation}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Stack>
        </Paper>

        {/* Employee Feedback Status */}
        {feedback.employeeFeedback?.submitted && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            ✅ Employee has completed their self-assessment. You can now submit your manager assessment.
          </Alert>
        )}

        {!feedback.employeeFeedback?.submitted && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            ℹ️ The employee hasn't submitted their feedback yet, but you can complete your assessment independently.
          </Alert>
        )}

        {/* Information Alert */}
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="500">
            💡 Your assessment is crucial for the employee's confirmation decision. Please be objective, fair, and provide specific examples where possible.
          </Typography>
        </Alert>

        {/* Section 1: Performance Evaluation */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Performance Evaluation
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {renderSlider(
              'Technical Skills',
              'technicalSkills',
              'Rate the employee\'s technical competency and domain knowledge'
            )}

            {renderSlider(
              'Work Quality',
              'workQuality',
              'How would you rate the quality and accuracy of their work?'
            )}

            {renderSlider(
              'Productivity',
              'productivity',
              'Rate their efficiency and ability to meet deadlines'
            )}

            {renderSlider(
              'Learning Ability',
              'learningAbility',
              'How quickly do they learn and apply new concepts?'
            )}
          </CardContent>
        </Card>

        {/* Section 2: Behavioral Assessment */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PsychologyIcon sx={{ fontSize: 32, color: '#4caf50', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Behavioral Assessment
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {renderSlider(
              'Communication',
              'communication',
              'Rate their written and verbal communication skills'
            )}

            {renderSlider(
              'Teamwork',
              'teamwork',
              'How well do they collaborate and work with the team?'
            )}

            {renderSlider(
              'Initiative',
              'initiative',
              'Do they take ownership and show proactive behavior?'
            )}

            {renderSlider(
              'Reliability',
              'reliability',
              'Can you depend on them to deliver consistently?'
            )}

            {renderSlider(
              'Adaptability',
              'adaptability',
              'How well do they adapt to changes and new situations?'
            )}
          </CardContent>
        </Card>

        {/* Section 3: Overall Assessment */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssignmentIcon sx={{ fontSize: 32, color: '#ff9800', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Overall Assessment
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Key Strengths *"
              placeholder="What are the employee's key strengths and positive attributes?"
              value={formData.keyStrengths}
              onChange={(e) => handleChange('keyStrengths', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Areas for Improvement"
              placeholder="What areas need improvement or development?"
              value={formData.areasForImprovement}
              onChange={(e) => handleChange('areasForImprovement', e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Training Recommendations"
              placeholder="What training or development programs would you recommend?"
              value={formData.trainingRecommendations}
              onChange={(e) => handleChange('trainingRecommendations', e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Specific Achievements *"
              placeholder="Highlight specific achievements or contributions during probation"
              value={formData.specificAchievements}
              onChange={(e) => handleChange('specificAchievements', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Concerns or Issues"
              placeholder="Any concerns or issues that need to be addressed?"
              value={formData.concernsOrIssues}
              onChange={(e) => handleChange('concernsOrIssues', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 4: Recommendation */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <RecommendIcon sx={{ fontSize: 32, color: '#f5576c', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Recommendation *
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Final Recommendation *
              </FormLabel>
              <Select
                value={formData.recommendation}
                onChange={(e) => handleChange('recommendation', e.target.value)}
              >
                <MenuItem value="confirm">
                  ✅ Confirm - Employee has successfully completed probation
                </MenuItem>
                <MenuItem value="extend_probation">
                  ⏳ Extend Probation - Needs more time to demonstrate capabilities
                </MenuItem>
                <MenuItem value="terminate">
                  ❌ Terminate - Does not meet expectations
                </MenuItem>
              </Select>
            </FormControl>

            {formData.recommendation === 'extend_probation' && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Extension Reason *"
                  placeholder="Provide detailed reasons for extending the probation period"
                  value={formData.extensionReason}
                  onChange={(e) => handleChange('extensionReason', e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                    Extension Period (months)
                  </FormLabel>
                  <Select
                    value={formData.extensionPeriod}
                    onChange={(e) => handleChange('extensionPeriod', e.target.value)}
                  >
                    <MenuItem value={1}>1 Month</MenuItem>
                    <MenuItem value={2}>2 Months</MenuItem>
                    <MenuItem value={3}>3 Months</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Confirmation Comments"
              placeholder="Additional comments supporting your recommendation"
              value={formData.confirmationComments}
              onChange={(e) => handleChange('confirmationComments', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 5: Future Planning */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 32, color: '#9c27b0', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Future Planning
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Role Expectations"
              placeholder="What are your expectations for the employee in their confirmed role?"
              value={formData.roleExpectations}
              onChange={(e) => handleChange('roleExpectations', e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Development Plan"
              placeholder="Outline a development plan for their continued growth"
              value={formData.developmentPlan}
              onChange={(e) => handleChange('developmentPlan', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/dashboard')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={submitting ? <LinearProgress size={20} /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={submitting || !formData.keyStrengths || !formData.specificAchievements}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              px: 4
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 3 }}
        >
          * Required fields
        </Typography>
      </Container>
    </Box>
  );
};

export default ManagerFeedbackForm;

