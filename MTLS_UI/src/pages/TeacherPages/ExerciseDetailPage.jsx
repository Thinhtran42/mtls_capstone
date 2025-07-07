import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  Chip,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  Timer as TimerIcon,
  CheckCircle as CorrectIcon,
  SportsScore as ExerciseIcon,
  QuestionAnswer as QuestionIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { exerciseService } from '../../api/services/exercise.service';
import { questionService } from '../../api/services/question.service';
import { optionService } from '../../api/services/option.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import PageTitle from '../../components/common/PageTitle';
import CustomSnackbar from '../../components/common/Snackbar';
import BackButton from '../../components/common/BackButton';
import VexFlowComponent from '../../vexflow/VexFlowComponent';

const ExerciseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('ExerciseDetailPage: Beginning data fetch for exercise ID:', exerciseId);
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          setCourseTitle(courseResponse.data.title);
        }
        
        // Fetch module details
        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title);
        }
        
        // Fetch exercise details
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        if (exerciseResponse?.data) {
          setExercise(exerciseResponse.data);
          // After getting exercise details, fetch its questions
          await fetchQuestions(exerciseId);
        } else {
          setError('Exercise not found');
          setLoadingQuestions(false);
        }
      } catch (error) {
        console.error('Error fetching exercise data:', error);
        setError('Failed to load exercise details. Please try again.');
        setLoadingQuestions(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [exerciseId, courseId, moduleId]);

  const fetchQuestions = async (exerciseId) => {
    try {
      setLoadingQuestions(true);
      
      // Fetch questions
      const questionsResponse = await questionService.getQuestionsByExercise(exerciseId);
      
      let questionData = [];
      if (questionsResponse?.data) {
        if (Array.isArray(questionsResponse.data)) {
          questionData = questionsResponse.data;
        } else if (questionsResponse.data.questions && Array.isArray(questionsResponse.data.questions)) {
          questionData = questionsResponse.data.questions;
        } else if (questionsResponse.data.data && Array.isArray(questionsResponse.data.data)) {
          questionData = questionsResponse.data.data;
        }
      }
      
      // Get options for each question
      const questionsWithOptions = [];

      for (const question of questionData) {
        try {
          const optionResponse = await optionService.getOptionsByQuestionId(question._id);

          let optionData = [];
          if (Array.isArray(optionResponse)) {
            optionData = optionResponse;
          } else if (optionResponse && optionResponse.data) {
            if (Array.isArray(optionResponse.data)) {
              optionData = optionResponse.data;
            } else if (optionResponse.data.options && Array.isArray(optionResponse.data.options)) {
              optionData = optionResponse.data.options;
            } else if (optionResponse.data.data && Array.isArray(optionResponse.data.data)) {
              optionData = optionResponse.data.data;
            }
          }

          questionsWithOptions.push({
            ...question,
            options: optionData,
          });
        } catch (error) {
          console.error(`Error fetching options for question ${question._id}:`, error);
          questionsWithOptions.push({
            ...question,
            options: [],
          });
        }
      }

      setQuestions(questionsWithOptions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEditExercise = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}/edit`);
  };

  const handleManageQuestions = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}/questions`);
  };

  const handleBackToModule = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleEditQuestion = (question) => {
    navigate(
      `/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}/questions/${question._id}/edit`
    );
  };
  
  // Show snackbar message
  const showSnackbar = (message, severity = "info") => {
    setSnackbarState({ open: true, message, severity });
  };

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Delete exercise with confirmation dialog
  const handleDeleteExercise = async () => {
    handleCloseDeleteDialog();
    setLoading(true);
    try {
      await exerciseService.deleteExercise(exerciseId);

      // Show success dialog
      setDeleteSuccessOpen(true);

      // Show snackbar
      showSnackbar("Exercise deleted successfully!", "success");

      // Set loading to false
      setLoading(false);

      // Add timer to auto-close the success dialog after 3 seconds and navigate
      setTimeout(() => {
        setDeleteSuccessOpen(false);
        navigate(`/teacher/course/${courseId}/module/${moduleId}`);
      }, 3000);
    } catch (error) {
      console.error("Error deleting exercise:", error);
      setError("Failed to delete exercise. Please try again.");
      showSnackbar("Failed to delete exercise.", "error");
      setLoading(false);
    }
  };

  // Handle close of success dialog with navigation
  const handleCloseSuccessDialog = () => {
    setDeleteSuccessOpen(false);
    // Navigate back to the module view
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  if (loading && !deleteSuccessOpen) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Exercise not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToModule}
        >
          Back to Module
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, ml: 10 }}>
      <PageTitle title={exercise.title} />
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/teacher/courses')}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          Courses
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teacher/course/${courseId}`)}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {courseTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={handleBackToModule}
          sx={{ color: '#666', textDecoration: 'none' }}
        >
          {moduleTitle}
        </Link>
        <Typography color="text.primary">
          {exercise.title}
        </Typography>
      </Breadcrumbs>

      {/* Top Bar with Title and Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <BackButton 
            text={moduleTitle || "Back to Module"} 
            onClick={handleBackToModule} 
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {exercise.title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditExercise}
          >
            Edit Exercise
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<QuestionIcon />}
            onClick={handleManageQuestions}
          >
            Manage Questions
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteDialog}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ mb: 6 }}>
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, mb: 4, boxShadow: "0 0 10px rgba(0,0,0,0.05)" }}
        >
          {/* Exercise Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<ExerciseIcon />}
                  label="Exercise"
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  {exercise.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {exercise.description || "No description available."}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimerIcon color="action" />
                  <Typography>
                    Duration: <strong>{exercise.duration || 0} minutes</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <QuestionIcon color="action" />
                  <Typography>
                    Questions: <strong>{questions.length}</strong>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Questions Section */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Questions ({questions.length})
        </Typography>

        {loadingQuestions ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : questions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.02)",
            }}
          >
            <QuestionIcon
              sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
            />
            <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
              No questions added yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add questions to make this exercise available to students
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuestionIcon />}
              onClick={handleManageQuestions}
            >
              Manage Questions
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {questions.map((question, index) => (
              <Card
                key={question._id}
                sx={{
                  borderRadius: 2,
                  overflow: "visible",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditQuestion(question)}
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>

                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Question {index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {question.questionText}
                    </Typography>
                    {question.questionType === 'vexFlow' && question.notation && (
                      <Box sx={{ my: 2, border: '1px solid #e0e0e0', p: 2, borderRadius: 1 }}>
                        <VexFlowComponent
                          notes={question.notation}
                          width={400}
                          height={120}
                          editable={false}
                        />
                      </Box>
                    )}
                  </Box>

                  <RadioGroup name={`question-${question._id}`} value="">
                    {question.options?.map((option) => (
                      <FormControlLabel
                        key={option._id}
                        value={option._id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography>{option.content}</Typography>
                            {option.isCorrect && (
                              <Chip
                                icon={<CorrectIcon />}
                                label="Correct Answer"
                                size="small"
                                color="success"
                                sx={{ ml: 2 }}
                              />
                            )}
                          </Box>
                        }
                        disabled
                      />
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-exercise-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(244, 67, 54, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              animation:
                "scaleIn 0.3s ease-out forwards, pulse 1.5s infinite 0.3s",
              "@keyframes scaleIn": {
                "0%": {
                  transform: "scale(0)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(0.95)",
                  boxShadow: "0 0 0 0 rgba(244, 67, 54, 0.4)",
                },
                "70%": {
                  transform: "scale(1)",
                  boxShadow: "0 0 0 10px rgba(244, 67, 54, 0)",
                },
                "100%": {
                  transform: "scale(0.95)",
                  boxShadow: "0 0 0 0 rgba(244, 67, 54, 0)",
                },
              },
            }}
          >
            <CloseIcon sx={{ color: "#f44336", fontSize: 32 }} />
          </Box>

          <Typography variant="h5" id="delete-exercise-dialog-title" sx={{ mb: 2 }}>
            Are you sure?
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Do you really want to delete this exercise?
            <Box
              component="span"
              sx={{
                fontWeight: "bold",
                display: "block",
                mt: 1,
              }}
            >
              {exercise?.title || "Untitled Exercise"}
            </Box>
            All questions and answers will be permanently removed. This process
            cannot be undone.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleCloseDeleteDialog}
              sx={{
                bgcolor: "#d9d9d9",
                color: "#555",
                "&:hover": { bgcolor: "#c9c9c9" },
                minWidth: 100,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteExercise}
              sx={{
                bgcolor: "#f44336",
                "&:hover": { bgcolor: "#d32f2f" },
                minWidth: 100,
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog
        open={deleteSuccessOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="delete-exercise-success-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(76, 175, 80, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              animation: "scaleIn 0.3s ease-out",
              "@keyframes scaleIn": {
                "0%": {
                  transform: "scale(0)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            <CheckIcon sx={{ color: "#4caf50", fontSize: 32 }} />
          </Box>

          <Typography
            variant="h5"
            id="delete-exercise-success-dialog-title"
            sx={{ mb: 2, color: "#555" }}
          >
            Success!
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: "#777" }}>
            The exercise &quot;{exercise?.title || "Untitled Exercise"}&quot; has been
            deleted successfully.
          </Typography>

          <Button
            variant="contained"
            onClick={handleCloseSuccessDialog}
            sx={{
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#388e3c" },
              minWidth: 100,
            }}
          >
            OK
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <CustomSnackbar
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        onClose={closeSnackbar}
        autoHideDuration={3000}
      />
    </Box>
  );
};

export default ExerciseDetailPage; 