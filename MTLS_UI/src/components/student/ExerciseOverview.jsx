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
  Assignment as AssignmentIcon,
  Home,
  NavigateNext,
  Info,
  Event,
  Check,
  History,
  Score,
  HelpOutline,
  CircleOutlined,
  MusicNote,
  LibraryMusic
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

/**
 * ExerciseOverview component displays the overview of an exercise before starting
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the exercise
 * @param {string} props.description - Description of the exercise
 * @param {Date|string} props.dueDate - Due date for the exercise
 * @param {number} props.attemptsLeft - Number of attempts left
 * @param {number} props.attemptsMax - Maximum number of attempts
 * @param {number} props.timePerAttempt - Time in minutes allowed for the exercise
 * @param {string|null} props.grade - Current grade if attempted before
 * @param {boolean} props.submitted - Whether the exercise has been submitted
 * @param {boolean} props.isPractice - Whether this is a practice exercise
 * @param {Object} props.courseInfo - Information about course and module
 * @param {string} props.courseInfo.courseName - Name of the course
 * @param {string} props.courseInfo.moduleName - Name of the module
 * @param {function} props.onStart - Function to call when starting the exercise
 * @param {Object} props.navigation - Navigation paths for breadcrumbs
 * @param {string} props.navigation.course - Path to the course
 * @param {string} props.navigation.module - Path to the module
 * @param {React.ReactNode} props.customButtons - Custom buttons to replace the default start button
 */
const ExerciseOverview = ({
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
                startIcon={<LibraryMusic />}
                onClick={onStart}
                size="large"
              >
                Start Exercise
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
                backgroundColor: '#f0fff4'
              }}
            >
              <Typography variant="body1">
                {description}
              </Typography>
            </Paper>
          )}

          {/* Exercise Information */}
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
              Exercise Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* <Box sx={{ display: 'flex', mb: 2 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Time:
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
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <MusicNote sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type:
                    </Typography>
                    <Typography>
                      Practical Music Exercise
                    </Typography>
                  </Box>
                </Box>

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
                Last Submission Results
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
            </Paper>
          )}

          {/* Tips for Exercise */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#e6f7ff'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <HelpOutline sx={{ mr: 1 }} color="info" />
              Exercise Tips
            </Typography>

            <List>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Follow the exercise instructions carefully" />
              </ListItem>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="You can save your progress and return later" />
              </ListItem>
              <ListItem sx={{ p: 1 }}>
                <ListItemIcon sx={{ minWidth: '36px' }}>
                  <CircleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Review your work before submitting for grading" />
              </ListItem>
            </List>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default ExerciseOverview; 