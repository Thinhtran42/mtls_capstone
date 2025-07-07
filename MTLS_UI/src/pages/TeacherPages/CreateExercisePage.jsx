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
  Snackbar,
  Alert,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  CircularProgress,
  FormHelperText
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { sectionService } from "../../api/services/section.service";
import { exerciseService } from "../../api/services/exercise.service";
import { moduleService } from "../../api/services/module.service";
import { questionService } from "../../api/services/question.service";
import { optionService } from "../../api/services/option.service";
import { courseService } from "../../api/services/course.service";

const CreateExercisePage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const location = useLocation();
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [savingExercise, setSavingExercise] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const queryParams = new URLSearchParams(location.search);
  const sectionIdFromQuery = queryParams.get("sectionId");

  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration: 30,
    section: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSections(true);

        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          setCourseTitle(courseResponse.data.title);
        }

        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title);
        }

        const sectionsResponse =
          await sectionService.getSectionsByModule(moduleId);
        if (sectionsResponse?.data) {
          const exerciseSections = sectionsResponse.data.filter(
            (section) => section.type === "Exercise"
          );

          setSections(exerciseSections);

          if (
            sectionIdFromQuery &&
            exerciseSections.some((s) => s._id === sectionIdFromQuery)
          ) {
            setFormData((prev) => ({ ...prev, section: sectionIdFromQuery }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load data. Please try again.",
          severity: "error",
        });
      } finally {
        setLoadingSections(false);
      }
    };

    fetchData();
  }, [courseId, moduleId, sectionIdFromQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

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
      newErrors.duration = "Valid duration is required";
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
      setSavingExercise(true);
      setSnackbar({
        open: true,
        message: "Creating exercise...",
        severity: "info",
      });

      const exerciseData = {
        ...formData,
        duration: parseInt(formData.duration),
        module: moduleId,
      };

      const response = await exerciseService.createExercise(exerciseData);

      if (response) {
        setSnackbar({
          open: true,
          message:
            "Exercise created successfully! Redirecting to add questions...",
          severity: "success",
        });
        console.log(response._id);
        setTimeout(() => {
          navigate(
            `/teacher/course/${courseId}/module/${moduleId}/exercises/${response._id}/questions`
          );
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      setSnackbar({
        open: true,
        message: "Failed to create exercise. Please try again.",
        severity: "error",
      });
    } finally {
      setSavingExercise(false);
    }
  };

  if (loadingSections) {
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
      <PageTitle title="Create New Exercise" />
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
          <Typography color="text.primary">Create Exercise</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "block", alignItems: "center", mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                navigate(`/teacher/course/${courseId}/module/${moduleId}`)
              }
              sx={{
                color: "#0F62FE",
                borderColor: "#0F62FE",
                "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                textTransform: "none",
              }}
            >
              {moduleTitle}
            </Button>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Create New Exercise
          </Typography>
        </Box>

        {snackbar.open && (
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Exercise Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Exercise Title"
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
                            No exercise sections available
                          </MenuItem>
                        )}
                      </Select>
                      {errors.section && (
                        <FormHelperText>{errors.section}</FormHelperText>
                      )}
                      {sections.length === 0 && (
                        <FormHelperText>
                          You need to create an Exercise type section first
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
                    disabled={savingExercise || sections.length === 0}
                    sx={{ mb: 2, py: 1 }}
                  >
                    {savingExercise ? "Creating..." : "Create Exercise"}
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
                    You need to create an Exercise type section before you can
                    create an exercise.
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

export default CreateExercisePage;
