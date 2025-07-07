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
  Assignment as AssignmentIcon,
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
 * AssignmentOverview component displays the overview of an assignment before starting
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the assignment
 * @param {string} props.type - Type of assignment: 'quiz', 'exercise', or 'assignment'
 * @param {string} props.courseName - Name of the course
 * @param {string} props.moduleName - Name of the module
 * @param {Object} props.details - Details of the assignment
 * @param {Date|string} props.details.dueDate - Due date for the assignment
 * @param {number} props.details.attemptsLeft - Number of attempts left
 * @param {number} props.details.attemptsMax - Maximum number of attempts
 * @param {number} props.details.timePerAttempt - Hours between attempts
 * @param {string|null} props.details.grade - Current grade if attempted before
 * @param {boolean} props.details.submitted - Whether the assignment has been submitted
 * @param {function} props.onStart - Function to call when starting the assignment
 * @param {Object} props.navigation - Navigation paths for breadcrumbs and prev/next
 * @param {string} props.navigation.course - Path to the course
 * @param {string} props.navigation.module - Path to the module
 * @param {string} props.navigation.prev - Path to the previous lesson (optional)
 * @param {string} props.navigation.next - Path to the next lesson (optional)
 * @param {string} props.buttonText - Text for the start button
 * @param {React.ReactNode} props.customButtons - Custom buttons to replace the default start button
 */
const AssignmentOverview = ({
  title,
  type,
  courseName,
  moduleName,
  details,
  onStart,
  buttonText = "Start Quiz", // Default button text
  navigation,
  customButtons
}) => {
  const navigate = useNavigate();
  const [coach, setCoach] = useState('');

  const handleCoachChange = (event) => {
    setCoach(event.target.value);
  };

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
              {courseName}
            </Link>
            <NavigateNext fontSize="small" />
            <Link
              component={RouterLink}
              to={navigation?.module || "#"}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {moduleName}
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
                startIcon={type === 'quiz' ? <QuizIcon /> : <AssignmentIcon />}
                onClick={onStart}
                size="large"
              >
                {buttonText}
              </Button>
            )}
          </Box>

          {/* Description */}
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
              {type === 'quiz' ? 'Quiz' : 'Assignment'} Information
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
                      {formatTime(details?.timePerAttempt)}
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
                      {formatDate(details?.dueDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                {details?.submitted && (
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
          {details?.submitted && details?.grade !== null && (
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
                        color={details.grade >= 8 ? 'success.main' : 'warning.main'}
                      >
                        {details.grade}/10
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  {details?.lastAttemptDate && (
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date:
                        </Typography>
                        <Typography>
                          {formatDate(details.lastAttemptDate)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Instructions */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#fffaf0' // Light yellow background
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <HelpOutline sx={{ mr: 1 }} color="warning" />
              Instructions
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CircleOutlined sx={{ fontSize: 10 }} />
                </ListItemIcon>
                <ListItemText
                  primary={type === 'quiz'
                    ? "Answer all questions to complete the quiz."
                    : "Complete the assignment according to the requirements."}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CircleOutlined sx={{ fontSize: 10 }} />
                </ListItemIcon>
                <ListItemText
                  primary={type === 'quiz'
                    ? "Your results will be available immediately after completion."
                    : "Submit your work before the due date."}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CircleOutlined sx={{ fontSize: 10 }} />
                </ListItemIcon>
                <ListItemText
                  primary={type === 'quiz'
                    ? "You need to score at least 8/10 to pass this quiz."
                    : "Your work will be reviewed by your instructor."}
                />
              </ListItem>
            </List>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default AssignmentOverview;