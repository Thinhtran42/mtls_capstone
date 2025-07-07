import { Box, Typography, Paper, Button, Grid, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ReplayIcon from '@mui/icons-material/Replay';

const EvaluationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const ScoreCircle = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 200,
  height: 200,
  margin: '0 auto',
  marginBottom: theme.spacing(4),
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
}));

const ResultItem = styled(Paper)(({ theme, wrongattempts }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: wrongattempts === 0 
    ? theme.palette.success.light 
    : wrongattempts <= 2 
      ? theme.palette.warning.light 
      : theme.palette.error.light,
  color: theme.palette.getContrastText(
    wrongattempts === 0 
      ? theme.palette.success.light 
      : wrongattempts <= 2 
        ? theme.palette.warning.light 
        : theme.palette.error.light
  ),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateX(10px)',
  },
}));

const FinalEvaluation = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
  },
}));

const PracticeEvaluation = ({ 
  wrongAttempts, 
  totalQuestions, 
  score, 
  getEvaluation, 
  getFinalEvaluation,
  onReset 
}) => {
  const percentage = (score / totalQuestions) * 100;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-end',
      width: '100%',
      mr: 60
    }}>
      <EvaluationContainer elevation={3}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Practice Result
        </Typography>

        <ScoreCircle>
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={200}
            thickness={4}
            sx={{
              color: percentage >= 80 ? 'success.main' : percentage >= 50 ? 'warning.main' : 'error.main',
            }}
          />
          <ScoreText>
            <Typography variant="h3" component="div" color="text.primary">
              {score}/{totalQuestions}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Score
            </Typography>
          </ScoreText>
        </ScoreCircle>

        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Details of each question:
          </Typography>
          <Grid container spacing={2}>
            {wrongAttempts.map((attempts, index) => (
              <Grid item xs={12} key={index}>
                <ResultItem wrongattempts={attempts}>
                  {attempts === 0 ? (
                    <CheckCircleIcon color="inherit" />
                  ) : (
                    <ErrorIcon color="inherit" />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Question {index + 1}: {attempts} times wrong
                    </Typography>
                    <Typography variant="body2">
                      {getEvaluation(attempts)}
                    </Typography>
                  </Box>
                </ResultItem>
              </Grid>
            ))}
          </Grid>
        </Box>

        <FinalEvaluation>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            General Evaluation
          </Typography>
          <Typography variant="body1">
            {getFinalEvaluation()}
          </Typography>
        </FinalEvaluation>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={onReset}
            startIcon={<ReplayIcon />}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s',
            }}
          >
            Practice again
          </Button>
        </Box>
      </EvaluationContainer>
    </Box>
  );
};

PracticeEvaluation.propTypes = {
  wrongAttempts: PropTypes.arrayOf(PropTypes.number).isRequired,
  totalQuestions: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  getEvaluation: PropTypes.func.isRequired,
  getFinalEvaluation: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default PracticeEvaluation; 