import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CorrectIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  QuestionAnswer as QuestionIcon,
} from "@mui/icons-material";
import { quizService } from "../../api/services/quiz.service";
import { questionService } from "../../api/services/question.service";
import { optionService } from "../../api/services/option.service";
import { courseService } from "../../api/services/course.service";
import { moduleService } from "../../api/services/module.service";
import PageTitle from "../../components/common/PageTitle";
import CustomSnackbar from "../../components/common/Snackbar";
import BackButton from "../../components/common/BackButton";

const QuizDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Add states for delete and success dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        if (!quizId) {
          setLoading(false);
          setError("Quiz ID not found. Please go back to the quiz list page.");
          return;
        }

        try {
          // Get Quiz information
          const quizResponse = await quizService.getQuizById(quizId);
          console.log("Quiz response:", quizResponse);

          // Handle different data structure formats
          let quizData = null;

          if (quizResponse) {
            // Check for different data structures
            if (quizResponse.data) {
              quizData = quizResponse.data;
            } else if (quizResponse._id) {
              // Case where response is directly the quiz object
              quizData = quizResponse;
            } else if (quizResponse.quiz) {
              // Case where data is wrapped in a 'quiz' field
              quizData = quizResponse.quiz;
            } else {
              // Check if response is a JSON string
              try {
                if (typeof quizResponse === "string") {
                  const parsedData = JSON.parse(quizResponse);
                  quizData = parsedData.data || parsedData;
                }
              } catch (parseError) {
                console.error("Error parsing quiz data:", parseError);
              }
            }
          }

          if (!quizData) {
            throw new Error("Invalid quiz data format");
          }

          setQuiz(quizData);

          // Get lessons in module
          fetchQuestions(quizId);
        } catch (err) {
          console.error("Error loading quiz details:", err);
          setError(
            `Could not get module information. Error: ${err.message || "Unknown error"}`
          );
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error("QuizDetailPage: Error fetching quiz data:", error);
        setError(
          `Could not load quiz data. Error: ${error.message || "Unknown error"}`
        );
      }
    };

    fetchData();
  }, [quizId]);

  const fetchQuestions = async (quizId) => {
    try {
      setLoadingQuestions(true);
      const questionResponse =
        await questionService.getQuestionsByQuizId(quizId);

      let questionData = [];

      if (questionResponse && questionResponse.questions) {
        questionData = questionResponse.questions;
      } else if (questionResponse && Array.isArray(questionResponse)) {
        questionData = questionResponse;
      } else if (questionResponse && questionResponse.data) {
        if (Array.isArray(questionResponse.data)) {
          questionData = questionResponse.data;
        } else if (
          questionResponse.data.questions &&
          Array.isArray(questionResponse.data.questions)
        ) {
          questionData = questionResponse.data.questions;
        } else if (
          questionResponse.data.data &&
          Array.isArray(questionResponse.data.data)
        ) {
          questionData = questionResponse.data.data;
        }
      }

      // Get options for each question
      const questionsWithOptions = [];

      for (const question of questionData) {
        try {
          const optionResponse = await optionService.getOptionsByQuestionId(
            question._id
          );

          let optionData = [];
          if (Array.isArray(optionResponse)) {
            optionData = optionResponse;
          } else if (optionResponse && optionResponse.data) {
            if (Array.isArray(optionResponse.data)) {
              optionData = optionResponse.data;
            } else if (
              optionResponse.data.options &&
              Array.isArray(optionResponse.data.options)
            ) {
              optionData = optionResponse.data.options;
            } else if (
              optionResponse.data.data &&
              Array.isArray(optionResponse.data.data)
            ) {
              optionData = optionResponse.data.data;
            }
          }

          questionsWithOptions.push({
            ...question,
            options: optionData,
          });
        } catch (error) {
          console.error(
            `Error fetching options for question ${question._id}:`,
            error
          );
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

  const handleEditQuiz = () => {
    navigate(
      `/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}/edit`
    );
  };

  const handleBack = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
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

  // Delete quiz with confirmation dialog
  const handleDeleteQuiz = async () => {
    handleCloseDeleteDialog();
    setLoading(true);
    try {
      await quizService.deleteQuiz(quizId);

      // Show success dialog
      setDeleteSuccessOpen(true);

      // Show snackbar
      showSnackbar("Quiz deleted successfully!", "success");

      // Set loading to false
      setLoading(false);

      // Add timer to auto-close the success dialog after 3 seconds and navigate
      setTimeout(() => {
        setDeleteSuccessOpen(false);
        navigate(`/teacher/course/${courseId}/module/${moduleId}`);
      }, 3000);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("Failed to delete quiz. Please try again.");
      showSnackbar("Failed to delete quiz.", "error");
      setLoading(false);
    }
  };

  // Handle close of success dialog with navigation
  const handleCloseSuccessDialog = () => {
    setDeleteSuccessOpen(false);
    // Navigate back to the module view
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleQuestionManagement = () => {
    navigate(
      `/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}/question-management`
    );
  };

  const handleEditQuestion = (question) => {
    navigate(
      `/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}/questions/${question._id}/edit`
    );
  };

  if (loading && !deleteSuccessOpen) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Module
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, ml: 10 }}>
      <PageTitle title={quiz?.title || "Quiz Details"} />
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate("/teacher/courses")}
          sx={{ color: "#666", textDecoration: "none" }}
        >
          Courses
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/teacher/course/${courseId}`)}
          sx={{ color: "#666", textDecoration: "none" }}
        >
          {courseTitle}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() =>
            navigate(`/teacher/course/${courseId}/module/${moduleId}`)
          }
          sx={{ color: "#666", textDecoration: "none" }}
        >
          {moduleTitle}
        </Link>
        <Typography color="text.primary">
          {quiz?.title || "Quiz Details"}
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
            onClick={handleBack} 
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {quiz?.title || "Quiz Details"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditQuiz}
          >
            Edit Quiz
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<QuestionIcon />}
            onClick={handleQuestionManagement}
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
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 4,
            boxShadow: "0 0 10px rgba(0,0,0,0.05)",
          }}
        >
          {/* Quiz Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<QuizIcon />}
                  label="Quiz"
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  {quiz?.title || "Untitled Quiz"}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {quiz?.description || "No description available."}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimerIcon color="action" />
                  <Typography>
                    Duration: <strong>{quiz?.duration || 0} minutes</strong>
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
              Add questions to make this quiz available to students
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuestionIcon />}
              onClick={handleQuestionManagement}
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
                      {question.content || question.questionText}
                    </Typography>
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
        aria-labelledby="delete-quiz-dialog-title"
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

          <Typography variant="h5" id="delete-quiz-dialog-title" sx={{ mb: 2 }}>
            Are you sure?
          </Typography>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Do you really want to delete this quiz?
            <Box
              component="span"
              sx={{
                fontWeight: "bold",
                display: "block",
                mt: 1,
              }}
            >
              {quiz?.title || "Untitled Quiz"}
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
              onClick={handleDeleteQuiz}
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
        aria-labelledby="delete-quiz-success-dialog-title"
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
            id="delete-quiz-success-dialog-title"
            sx={{ mb: 2, color: "#555" }}
          >
            Success!
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: "#777" }}>
            The quiz &quot;{quiz?.title || "Untitled Quiz"}&quot; has been
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

export default QuizDetailPage;
