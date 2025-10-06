import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Slider,
  Button,
  Grid,
  Divider,
  Stack,
  Alert,
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';

const ExitSurvey = ({ exitRecord, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Section 1: Compensation & Benefits
    remunerationSatisfaction: 5,
    achievementsRecognized: 'Yes',
    recognitionFrequency: 5,
    constructiveFeedback: 'Yes',
    
    // Section 2: Team and Work Environment
    trainingSatisfaction: 5,
    workLifeBalance: 5,
    skillsUtilization: 5,
    jobHappiness: 5,
    managerTreatment: 5,
    
    // Section 3: Organization Culture
    companyHappiness: 5,
    recommendLikelihood: 5,
    rehireConsideration: 'Yes',
    
    // Section 4: Trigger/Reason
    leavingReason: '',
    concernsShared: 'No',
    improvementSuggestions: '',
    futureContact: 'Yes'
  });

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRadioChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Structure the data according to API requirements
    const surveyData = {
      compensationBenefits: {
        remunerationSatisfaction: formData.remunerationSatisfaction,
        achievementsRecognized: formData.achievementsRecognized,
        recognitionFrequency: formData.recognitionFrequency,
        constructiveFeedback: formData.constructiveFeedback
      },
      workEnvironment: {
        trainingSatisfaction: formData.trainingSatisfaction,
        workLifeBalance: formData.workLifeBalance,
        skillsUtilization: formData.skillsUtilization,
        jobHappiness: formData.jobHappiness,
        managerTreatment: formData.managerTreatment
      },
      organizationCulture: {
        companyHappiness: formData.companyHappiness,
        recommendLikelihood: formData.recommendLikelihood,
        rehireConsideration: formData.rehireConsideration
      },
      triggerReason: {
        leavingReason: formData.leavingReason,
        concernsShared: formData.concernsShared,
        improvementSuggestions: formData.improvementSuggestions,
        futureContact: formData.futureContact
      }
    };
    onSubmit(surveyData);
  };

  const renderSlider = (label, field, min = 1, max = 10, minLabel = "Poor", maxLabel = "Excellent") => (
    <Box sx={{ 
      mb: 4, 
      p: 3, 
      borderRadius: 2, 
      bgcolor: 'rgba(0,0,0,0.02)',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(102, 126, 234, 0.04)',
        borderColor: '#667eea'
      }
    }}>
      <Typography variant="body1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
        {label}
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={formData[field]}
          onChange={(e, value) => handleSliderChange(field, value)}
          min={min}
          max={max}
          step={1}
          marks={[
            { value: min, label: minLabel },
            { value: Math.floor((min + max) / 2), label: "Neutral" },
            { value: max, label: maxLabel }
          ]}
          valueLabelDisplay="on"
          sx={{ 
            mb: 1,
            height: 8,
            '& .MuiSlider-thumb': {
              width: 24,
              height: 24,
              bgcolor: '#667eea',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)'
              }
            },
            '& .MuiSlider-track': {
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              height: 8
            },
            '& .MuiSlider-rail': {
              bgcolor: 'rgba(0,0,0,0.1)',
              height: 8
            },
            '& .MuiSlider-valueLabel': {
              bgcolor: '#667eea',
              fontWeight: 600
            },
            '& .MuiSlider-mark': {
              bgcolor: 'transparent'
            },
            '& .MuiSlider-markLabel': {
              fontWeight: 500,
              fontSize: '0.85rem'
            }
          }}
        />
      </Box>
    </Box>
  );

  const renderRadioGroup = (label, field, options) => (
    <Box sx={{ 
      mb: 4, 
      p: 3, 
      borderRadius: 2, 
      bgcolor: 'rgba(0,0,0,0.02)',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(102, 126, 234, 0.04)',
        borderColor: '#667eea'
      }
    }}>
      <Typography variant="body1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
        {label}
      </Typography>
      <RadioGroup
        value={formData[field]}
        onChange={(e) => handleRadioChange(field, e.target.value)}
        row
        sx={{
          gap: 2
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio sx={{
              color: '#667eea',
              '&.Mui-checked': {
                color: '#667eea'
              }
            }} />}
            label={option.label}
            sx={{
              border: '2px solid',
              borderColor: formData[field] === option.value ? '#667eea' : 'rgba(0,0,0,0.1)',
              borderRadius: 2,
              px: 2,
              py: 1,
              m: 0,
              bgcolor: formData[field] === option.value ? 'rgba(102, 126, 234, 0.08)' : 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)'
              }
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          mb: 2,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
        }}>
          <ExitToAppIcon sx={{ fontSize: 48, color: '#667eea' }} />
        </Box>
        <Typography variant="h3" fontWeight="700" color="white" gutterBottom>
          Exit Survey
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.9)">
          Help us improve by sharing your experience
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mt: 1 }}>
          {new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}
        </Typography>
      </Box>

      <Alert 
        severity="info" 
        sx={{ 
          mb: 4,
          borderRadius: 2,
          border: '1px solid rgba(102, 126, 234, 0.3)',
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '& .MuiAlert-icon': {
            color: '#667eea'
          }
        }}
      >
        <Typography variant="body1" fontWeight="500">
          💡 Your feedback is valuable to us. Please take a few minutes to complete this survey to help us improve our workplace.
        </Typography>
      </Alert>

        {/* Section 1: Compensation & Benefits */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            p: 2,
            borderBottom: '2px solid #667eea'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                bgcolor: '#667eea',
                color: 'white',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <AssignmentIcon />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight="600">
                  SECTION 1
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  Compensation & Benefits
                </Typography>
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>

            {renderSlider(
              "Q1. How satisfied were you with your remuneration package and benefits?",
              "remunerationSatisfaction",
              1, 10, "Not at all satisfied", "Extremely satisfied"
            )}

            {renderRadioGroup(
              "Q2. Do you think your achievements were recognized and appreciated?",
              "achievementsRecognized",
              [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
            )}

            {renderSlider(
              "Q3. How frequently did you receive recognition for your work?",
              "recognitionFrequency",
              1, 10, "Less Frequent", "More Frequent"
            )}

            {renderRadioGroup(
              "Q4. Did you receive frequent, constructive feedback from your manager and peers?",
              "constructiveFeedback",
              [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
            )}
          </CardContent>
        </Card>

        {/* Section 2: Team and Work Environment */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
            p: 2,
            borderBottom: '2px solid #ff9800'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                bgcolor: '#ff9800',
                color: 'white',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight="600">
                  SECTION 2
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  Team and Work Environment
                </Typography>
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>

            {renderSlider(
              "Q1. How satisfied were you with your training in order to perform your job effectively?",
              "trainingSatisfaction",
              1, 10, "Not at all satisfied", "Extremely satisfied"
            )}

            {renderSlider(
              "Q2. How happy were you with work-life balance?",
              "workLifeBalance",
              1, 10, "Sad", "Happy"
            )}

            {renderSlider(
              "Q3. Do you agree that the organization was able to put your skills to good use?",
              "skillsUtilization",
              1, 10, "Disagree", "Agree"
            )}

            {renderSlider(
              "Q4. How Happy were you with the job?",
              "jobHappiness",
              1, 10, "Sad", "Happy"
            )}

            {renderSlider(
              "Q5. How satisfied were you with your manager's treatment of you?",
              "managerTreatment",
              1, 10, "Not at all satisfied", "Extremely satisfied"
            )}
          </CardContent>
        </Card>

        {/* Section 3: Organization Culture */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
            p: 2,
            borderBottom: '2px solid #4caf50'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                bgcolor: '#4caf50',
                color: 'white',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <BusinessIcon />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight="600">
                  SECTION 3
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  Organisation Culture
                </Typography>
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>

            {renderSlider(
              "Q1. How happy were you working for this company?",
              "companyHappiness",
              1, 10, "Sad", "Happy"
            )}

            {renderSlider(
              "Q2. How likely are you to recommend this organization as a place to work?",
              "recommendLikelihood",
              1, 10, "Less Likely", "More Likely"
            )}

            {renderRadioGroup(
              "Q3. Would you ever consider taking employment with this company again?",
              "rehireConsideration",
              [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
            )}
          </CardContent>
        </Card>

        {/* Section 4: Trigger/Reason */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 83, 80, 0.1) 100%)',
            p: 2,
            borderBottom: '2px solid #f44336'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                bgcolor: '#f44336',
                color: 'white',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <ExitToAppIcon />
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight="600">
                  SECTION 4
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  Trigger/Reason
                </Typography>
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>

            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                borderColor: '#667eea'
              }
            }}>
              <Typography variant="body1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                Q1. What is your reason for leaving the company?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.leavingReason}
                onChange={(e) => handleTextChange('leavingReason', e.target.value)}
                placeholder="Please provide your reason for leaving..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  }
                }}
              />
            </Box>

            {renderRadioGroup(
              "Q2. Did you share any of your concerns with the company before deciding to leave?",
              "concernsShared",
              [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
            )}

            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                borderColor: '#667eea'
              }
            }}>
              <Typography variant="body1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                Q3. Given an opportunity, what could the organization change to potentially convince you to stay?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.improvementSuggestions}
                onChange={(e) => handleTextChange('improvementSuggestions', e.target.value)}
                placeholder="Please share your suggestions for improvement..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  }
                }}
              />
            </Box>

            {renderRadioGroup(
              "Q4. Can we call you in the future to discuss your reason for leaving?",
              "futureContact",
              [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: 2,
          mt: 4,
          p: 3,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              borderColor: '#667eea',
              color: '#667eea',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.08)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Submit Survey
          </Button>
        </Box>
    </Box>
  );
};

export default ExitSurvey;
