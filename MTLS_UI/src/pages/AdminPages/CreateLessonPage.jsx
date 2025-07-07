import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { categories, difficulties } from "./ManageLessonPage";
import { contentService } from "../../api/services/content.service";

const steps = [
  'Basic Information',
  'Lesson Content',
  'Materials & Media',
  'Preview & Publish'
];

function CreateLessonPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    duration: "",
    content: "",
    requirements: "",
    objectives: "",
    thumbnail: null,
    attachments: [],
    status: "draft" // draft, published
  });

  const handleBack = () => {
    if (activeStep === 0) {
      navigate("/admin/manage-lessons");
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleSave = async () => {
    // Save lesson handling
    console.log("Saving lesson:", lessonData);
    
    try {
      // Assuming you have an API endpoint to create a lesson and return a lessonId
      const lessonResponse = { data: { _id: "temp-lesson-id" } }; // Replace with actual API call
      
      // If there's content to save, use createMultipleContents
      if (lessonData.content) {
        const contentPayload = {
          lessonId: lessonResponse.data._id,
          contents: [
            {
              type: "Reading",
              data: lessonData.content,
              caption: lessonData.title,
              order: 1
            }
          ]
        };
        
        await contentService.createMultipleContents(contentPayload);
      }
      
      // Success notification
      console.log("Lesson saved successfully");
    } catch (error) {
      console.error("Error saving lesson:", error);
    }
  };

  const handlePublish = () => {
    // Handle lesson publishing
    setLessonData(prev => ({ ...prev, status: "published" }));
    console.log("Publishing lesson:", lessonData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesson Title"
                value={lessonData.title}
                onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                required
                helperText="Create a concise, clear, and engaging title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesson Description"
                value={lessonData.description}
                onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={4}
                required
                helperText="Briefly describe the content and objectives of the lesson"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={lessonData.category}
                onChange={(e) => setLessonData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Difficulty"
                value={lessonData.difficulty}
                onChange={(e) => setLessonData(prev => ({ ...prev, difficulty: e.target.value }))}
                required
              >
                {difficulties.map((difficulty) => (
                  <MenuItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={lessonData.duration}
                onChange={(e) => setLessonData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 45 minutes"
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prerequisites"
                value={lessonData.requirements}
                onChange={(e) => setLessonData(prev => ({ ...prev, requirements: e.target.value }))}
                multiline
                rows={3}
                helperText="List the knowledge and skills required before taking this lesson"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Learning Objectives"
                value={lessonData.objectives}
                onChange={(e) => setLessonData(prev => ({ ...prev, objectives: e.target.value }))}
                multiline
                rows={3}
                required
                helperText="List what students will achieve after completing this lesson"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Lesson Content
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                You can use Markdown for formatting:
                - **bold text** for bold
                - *italic text* for italic
                - ## Heading 2
                - ### Heading 3
                - - List item (with a dash)
                - 1. Numbered list
                - [Link text](URL)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={lessonData.content}
                onChange={(e) => setLessonData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your lesson content using Markdown..."
                sx={{ fontFamily: "monospace" }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Lesson Thumbnail
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  border: "2px dashed #ccc",
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: "#999", mb: 2 }} />
                <Typography>Click to upload thumbnail image</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recommended size: 1280x720px, Max: 2MB
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Attachments & Resources
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Add Attachment
              </Button>
              <Typography variant="body2" color="text.secondary">
                You can upload PDFs, images, audio files, and other resources for students
              </Typography>
              {lessonData.attachments.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {/* List of attachments */}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No attachments added yet
                </Typography>
              )}
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={() => window.open(`/admin/lesson-preview/${lessonData.id || 'temp'}`, '_blank')}
                  sx={{ mr: 1 }}
                >
                  Preview Lesson
                </Button>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Publish Settings
                </Typography>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography gutterBottom>
                    Status: <Chip label={lessonData.status === 'draft' ? 'Draft' : 'Published'} color={lessonData.status === 'draft' ? 'default' : 'success'} size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    When you publish a lesson, it will be visible to students in the course.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePublish}
                    disabled={lessonData.status === 'published'}
                  >
                    Publish Lesson
                  </Button>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ backgroundColor: "#f5f7f9", p: 4, minHeight: "100vh", mr: "200px" }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Create New Lesson
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: 4 }}>
            {renderStepContent(activeStep)}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              <Box>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ ml: 1 }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ ml: 1 }}
                  >
                    Save Lesson
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </AdminLayout>
  );
}

export default CreateLessonPage; 