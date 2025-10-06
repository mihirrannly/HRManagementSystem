import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  ExitToApp as ExitToAppIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

const ExitSurveySummary = ({ surveyData }) => {
  if (!surveyData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No exit survey data available
        </Typography>
      </Box>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <TrendingUpIcon color="success" />;
    if (score >= 6) return <TrendingFlatIcon color="warning" />;
    return <TrendingDownIcon color="error" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Poor';
  };

  const renderScoreCard = (title, score, maxScore = 10) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          {getScoreIcon(score)}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h3" fontWeight="bold" color={`${getScoreColor(score)}.main`}>
            {score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / {maxScore}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(score / maxScore) * 100}
          color={getScoreColor(score)}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {getScoreLabel(score)}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSection = (title, icon, children) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {icon}
          <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Exit Survey Summary
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Employee: {surveyData.employeeName} ({surveyData.employeeId})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submitted on: {new Date(surveyData.submittedDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        </Box>
      </Paper>

      {/* Overall Scores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Overall Satisfaction Scores
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              {renderScoreCard("Compensation & Benefits", surveyData.remunerationSatisfaction)}
            </Grid>
            <Grid item xs={12} md={4}>
              {renderScoreCard("Work Environment", surveyData.jobHappiness)}
            </Grid>
            <Grid item xs={12} md={4}>
              {renderScoreCard("Company Culture", surveyData.companyHappiness)}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section 1: Compensation & Benefits */}
      {renderSection(
        "Section 1: Compensation & Benefits",
        <AssignmentIcon color="primary" />,
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Remuneration Satisfaction", surveyData.remunerationSatisfaction)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Recognition Frequency", surveyData.recognitionFrequency)}
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Achievements Recognized
                </Typography>
                <Chip
                  label={surveyData.achievementsRecognized}
                  color={surveyData.achievementsRecognized === 'Yes' ? 'success' : 'error'}
                  size="large"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Constructive Feedback
                </Typography>
                <Chip
                  label={surveyData.constructiveFeedback}
                  color={surveyData.constructiveFeedback === 'Yes' ? 'success' : 'error'}
                  size="large"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Section 2: Team and Work Environment */}
      {renderSection(
        "Section 2: Team and Work Environment",
        <PeopleIcon color="primary" />,
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Training Satisfaction", surveyData.trainingSatisfaction)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Work-Life Balance", surveyData.workLifeBalance)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Skills Utilization", surveyData.skillsUtilization)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Job Happiness", surveyData.jobHappiness)}
          </Grid>
          <Grid item xs={12} md={12}>
            {renderScoreCard("Manager Treatment", surveyData.managerTreatment)}
          </Grid>
        </Grid>
      )}

      {/* Section 3: Organization Culture */}
      {renderSection(
        "Section 3: Organisation Culture",
        <BusinessIcon color="primary" />,
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Company Happiness", surveyData.companyHappiness)}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreCard("Recommend Likelihood", surveyData.recommendLikelihood)}
          </Grid>
          <Grid item xs={12} md={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rehire Consideration
                </Typography>
                <Chip
                  label={surveyData.rehireConsideration}
                  color={surveyData.rehireConsideration === 'Yes' ? 'success' : 'error'}
                  size="large"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Section 4: Trigger/Reason */}
      {renderSection(
        "Section 4: Trigger/Reason",
        <ExitToAppIcon color="primary" />,
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reason for Leaving
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                "{surveyData.leavingReason}"
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Concerns Shared Before Leaving
                  </Typography>
                  <Chip
                    label={surveyData.concernsShared}
                    color={surveyData.concernsShared === 'Yes' ? 'success' : 'warning'}
                    size="large"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Future Contact Permission
                  </Typography>
                  <Chip
                    label={surveyData.futureContact}
                    color={surveyData.futureContact === 'Yes' ? 'success' : 'error'}
                    size="large"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {surveyData.improvementSuggestions && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Improvement Suggestions
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{surveyData.improvementSuggestions}"
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Key Insights */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Key Insights
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {Math.round((surveyData.remunerationSatisfaction + surveyData.recognitionFrequency) / 2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Compensation Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {Math.round((surveyData.jobHappiness + surveyData.workLifeBalance + surveyData.managerTreatment) / 3)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Work Environment Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {Math.round((surveyData.companyHappiness + surveyData.recommendLikelihood) / 2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Culture Score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExitSurveySummary;
