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
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Star as StarIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeFeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState({
    // Learning & Development
    skillsAcquired: '',
    trainingEffectiveness: 5,
    learningChallenges: '',
    additionalTrainingNeeds: '',
    
    // Job Performance
    achievementsSummary: '',
    challengesFaced: '',
    supportReceived: 5,
    clarityOfExpectations: 5,
    
    // Work Environment
    teamIntegration: 5,
    workLifeBalance: 5,
    resourcesAvailability: 5,
    
    // Future Outlook
    careerGoals: '',
    improvementAreas: '',
    continuationInterest: 'interested',
    additionalComments: ''
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
        if (response.data.feedback.employeeFeedback?.submitted) {
          toast.error('You have already submitted your feedback');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to load feedback form');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.skillsAcquired || !formData.achievementsSummary || !formData.careerGoals) {
        toast.error('Please fill in all required fields');
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/probation-feedback/${id}/employee`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Feedback submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
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
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading feedback form...</Typography>
      </Container>
    );
  }

  if (!feedback) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Feedback form not found</Alert>
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <SchoolIcon sx={{ fontSize: 48, color: '#667eea' }} />
          </Box>
          <Typography variant="h3" fontWeight="700" gutterBottom>
            🎓 Probation Feedback
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Share Your Experience
          </Typography>
          <Chip
            label={`Joined: ${new Date(feedback.joiningDate).toLocaleDateString()}`}
            sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Paper>

        {/* Information Alert */}
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="500">
            💡 This feedback is confidential and will help us understand your experience during the probation period.
            Please be honest and constructive in your responses.
          </Typography>
        </Alert>

        {/* Section 1: Learning & Development */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Learning & Development
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Skills Acquired *"
              placeholder="What new skills and knowledge have you acquired during your probation period?"
              value={formData.skillsAcquired}
              onChange={(e) => handleTextChange('skillsAcquired', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            {renderSlider(
              'Training Effectiveness',
              'trainingEffectiveness',
              'How effective was the training and onboarding you received?'
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Learning Challenges"
              placeholder="What challenges did you face in learning and adapting to your role?"
              value={formData.learningChallenges}
              onChange={(e) => handleTextChange('learningChallenges', e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Training Needs"
              placeholder="What additional training or resources would help you perform better?"
              value={formData.additionalTrainingNeeds}
              onChange={(e) => handleTextChange('additionalTrainingNeeds', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 2: Job Performance */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 32, color: '#f5576c', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Job Performance
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Key Achievements *"
              placeholder="Describe your key achievements and contributions during the probation period"
              value={formData.achievementsSummary}
              onChange={(e) => handleTextChange('achievementsSummary', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Challenges Faced"
              placeholder="What were the main challenges you encountered in your role?"
              value={formData.challengesFaced}
              onChange={(e) => handleTextChange('challengesFaced', e.target.value)}
              sx={{ mb: 3 }}
            />

            {renderSlider(
              'Support from Manager',
              'supportReceived',
              'How would you rate the support and guidance from your manager?'
            )}

            {renderSlider(
              'Clarity of Expectations',
              'clarityOfExpectations',
              'How clear were the expectations and responsibilities of your role?'
            )}
          </CardContent>
        </Card>

        {/* Section 3: Work Environment */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GroupIcon sx={{ fontSize: 32, color: '#4caf50', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Work Environment
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {renderSlider(
              'Team Integration',
              'teamIntegration',
              'How well have you integrated with your team?'
            )}

            {renderSlider(
              'Work-Life Balance',
              'workLifeBalance',
              'How would you rate your work-life balance?'
            )}

            {renderSlider(
              'Resources & Tools',
              'resourcesAvailability',
              'How adequate were the resources and tools provided for your work?'
            )}
          </CardContent>
        </Card>

        {/* Section 4: Future Outlook */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <StarIcon sx={{ fontSize: 32, color: '#ff9800', mr: 2 }} />
              <Typography variant="h5" fontWeight="600">
                Future Outlook
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Career Goals *"
              placeholder="What are your career goals and how can we support your growth?"
              value={formData.careerGoals}
              onChange={(e) => handleTextChange('careerGoals', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Areas for Improvement"
              placeholder="What areas would you like to improve in?"
              value={formData.improvementAreas}
              onChange={(e) => handleTextChange('improvementAreas', e.target.value)}
              sx={{ mb: 3 }}
            />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Continuation Interest *
              </FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How interested are you in continuing with the company?
              </Typography>
              <RadioGroup
                value={formData.continuationInterest}
                onChange={(e) => handleTextChange('continuationInterest', e.target.value)}
              >
                <FormControlLabel
                  value="strongly_interested"
                  control={<Radio />}
                  label="Strongly Interested - Very excited to continue"
                />
                <FormControlLabel
                  value="interested"
                  control={<Radio />}
                  label="Interested - Looking forward to continuing"
                />
                <FormControlLabel
                  value="neutral"
                  control={<Radio />}
                  label="Neutral - Open to continuing"
                />
                <FormControlLabel
                  value="considering_options"
                  control={<Radio />}
                  label="Considering Options - Evaluating other opportunities"
                />
                <FormControlLabel
                  value="not_interested"
                  control={<Radio />}
                  label="Not Interested - Prefer not to continue"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments"
              placeholder="Any other feedback or suggestions you'd like to share?"
              value={formData.additionalComments}
              onChange={(e) => handleTextChange('additionalComments', e.target.value)}
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
            disabled={submitting || !formData.skillsAcquired || !formData.achievementsSummary || !formData.careerGoals}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
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

export default EmployeeFeedbackForm;

