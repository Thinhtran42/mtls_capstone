import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { sectionService } from "../../api/services/section.service";
import { quizService } from "../../api/services/quiz.service";
import { moduleService } from "../../api/services/module.service";
import { courseService } from "../../api/services/course.service";

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sectionIdFromQuery = queryParams.get("sectionId");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [sections, setSections] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    section: "",
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);

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

        // Fetch sections for this module
        const sectionsResponse =
          await sectionService.getSectionsByModule(moduleId);
        if (sectionsResponse?.data) {
          // Filter for quiz sections only
          const quizSections = sectionsResponse.data.filter(
            (section) => section.type === "Quiz"
          );

          setSections(quizSections);

          // If section ID is provided in query params, pre-select it
          if (
            sectionIdFromQuery &&
            quizSections.some((s) => s._id === sectionIdFromQuery)
          ) {
            setFormData((prev) => ({ ...prev, section: sectionIdFromQuery }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId, sectionIdFromQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.section) {
      newErrors.section = "Section is required";
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const quizData = {
        ...formData,
        duration: parseInt(formData.duration),
        module: moduleId,
      };

      // Call API to create quiz
      const response = await quizService.createQuiz(quizData);

      if (response) {
        setSuccess(true);

        // Navigate to quiz question management page
        setTimeout(() => {
          navigate(
            `/teacher/course/${courseId}/module/${moduleId}/quizzes/${response.data._id}/question-management`
          );
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  return (
    <>
      <PageTitle title="Create New Quiz" />
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
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
          <Typography color="text.primary">Create Quiz</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "block", alignItems: "center", mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{
              color: "#0F62FE",
              borderColor: "#0F62FE",
              "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
              textTransform: "none",
              mr: 2,
              mb: 2,
            }}
          >
            {moduleTitle}
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Create New Quiz
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Quiz created successfully! Redirecting to add questions...
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quiz Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Quiz Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      error={!!errors.title}
                      helperText={errors.title}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Duration (minutes)"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      error={!!errors.duration}
                      helperText={errors.duration}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.section}>
                      <InputLabel id="section-label">Section</InputLabel>
                      <Select
                        labelId="section-label"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        label="Section"
                      >
                        {sections.length > 0 ? (
                          sections.map((section) => (
                            <MenuItem key={section._id} value={section._id}>
                              {section.title}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No quiz sections available
                          </MenuItem>
                        )}
                      </Select>
                      {errors.section && (
                        <FormHelperText>{errors.section}</FormHelperText>
                      )}
                      {sections.length === 0 && (
                        <FormHelperText>
                          You need to create a Quiz type section first
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{ mb: 4, borderRadius: 2, position: "sticky", top: 20 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || sections.length === 0}
                    sx={{ mb: 2, py: 1 }}
                  >
                    {loading ? "Creating..." : "Create Quiz"}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ py: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>

                {sections.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    You need to create a Quiz type section before you can create
                    a quiz.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default CreateQuizPage;
