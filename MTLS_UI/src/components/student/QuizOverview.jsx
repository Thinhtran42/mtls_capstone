/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Grid,
  Container,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Quiz as QuizIcon,
  Home,
  NavigateNext,
  Info,
  Event,
  Replay,
  Check,
  History,
  Score,
  CalendarToday,
  HelpOutline,
  CircleOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

/**
 * QuizOverview component displays the overview of a quiz before starting
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the quiz
 * @param {string} props.description - Description of the quiz
 * @param {Date|string} props.dueDate - Due date for the quiz
 * @param {number} props.attemptsLeft - Number of attempts left
 * @param {number} props.attemptsMax - Maximum number of attempts
 * @param {number} props.timePerAttempt - Time in minutes allowed for the quiz
 * @param {string|null} props.grade - Current grade if attempted before
 * @param {boolean} props.submitted - Whether the quiz has been submitted
 * @param {boolean} props.isPractice - Whether this is a practice quiz
 * @param {Object} props.courseInfo - Information about course and module
 * @param {string} props.courseInfo.courseName - Name of the course
 * @param {string} props.courseInfo.moduleName - Name of the module
 * @param {function} props.onStart - Function to call when starting the quiz
 * @param {Object} props.navigation - Navigation paths for breadcrumbs
 * @param {string} props.navigation.course - Path to the course
 * @param {string} props.navigation.module - Path to the module
 * @param {React.ReactNode} props.customButtons - Custom buttons to replace the default start button
 */
const QuizOverview = ({
  title,
  description,
  dueDate,
  attemptsLeft,
  attemptsMax,
  timePerAttempt,
  grade,
  submitted,
  isPractice,
  courseInfo = { courseName: '', moduleName: '' },
  onStart,
  navigation,
  customButtons
}) => {
  const navigate = useNavigate();

  const formatTime = (minutes) => {
    if (!minutes) return 'Not specified';

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} min` : ''}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        width: '100%',
        padding: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Link
              component={RouterLink}
              to={navigation?.course || "/student/dashboard"}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home fontSize="small" sx={{ mr: 0.5 }} />
              {courseInfo.courseName}
            </Link>
            <NavigateNext fontSize="small" />
            <Link
              component={RouterLink}
              to={navigation?.module || "#"}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {courseInfo.moduleName}
            </Link>
            <NavigateNext fontSize="small" />
            <Typography color="text.secondary">
              {title}
            </Typography>
          </Box>

          {/* Title and buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>

            {customButtons ? (
              customButtons
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<QuizIcon />}
                onClick={onStart}
                size="large"
              >
                Start Quiz
              </Button>
            )}
          </Box>

          {/* Description */}
          {description && (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: '#fff9f0'
              }}
            >
              <Typography variant="body1">
                {description}
              </Typography>
            </Paper>
          )}

          {/* Quiz Information */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: '#fafafa'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1 }} color="primary" />
              Quiz Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* <Box sx={{ display: 'flex', mb: 2 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Time Limit:
                    </Typography>
                    <Typography>
                      {formatTime(timePerAttempt)}
                    </Typography>
                  </Box>
                </Box> */}

                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Event sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date:
                    </Typography>
                    <Typography>
                      {formatDate(dueDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* <Box sx={{ display: 'flex', mb: 2 }}>
                  <Replay sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Attempts:
                    </Typography>
                    <Typography>
                      {attemptsLeft || 0} of {attemptsMax || 0} remaining
                    </Typography>
                  </Box>
                </Box> */}

                {submitted && (
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Check sx={{ mr: 1, color: 'success.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status:
                      </Typography>
                      <Typography color="success.main" fontWeight="medium">
                        Submitted
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Previous Attempts - Show only if there was a previous attempt */}
          {submitted && grade !== null && (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: '#f0f7ff'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} color="primary" />
                Last Attempt Results
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Score sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Score:
                      </Typography>
                      <Typography
                        fontWeight="bold"
                        color={grade >= 8 ? 'success.main' : grade >= 5 ? 'warning.main' : 'error.main'}
                      >
                        {grade}/10
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {isPractice && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    This is a practice quiz. Your score does not affect your course grade.
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Tips for Quiz */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: '#f5f9ff'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <HelpOutline sx={{ mr: 1 }} color="info" />
              Quiz Tips
            </Typography>

            <List>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Read each question carefully before answering" />
              </ListItem>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="You can review your answers before submitting" />
              </ListItem>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Once time runs out, your answers will be automatically submitted" />
              </ListItem>
            </List>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default QuizOverview; 