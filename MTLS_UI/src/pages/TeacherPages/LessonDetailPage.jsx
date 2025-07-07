import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  MenuBook as MenuBookIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { lessonService } from "../../api/services/lesson.service";
import { courseService } from "../../api/services/course.service";
import { moduleService } from "../../api/services/module.service";
import { sectionService } from "../../api/services/section.service";
import { contentService } from "../../api/services/content.service";

const LessonDetailPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, lessonId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        try {
          const courseResponse = await courseService.getCourseById(courseId);
          if (courseResponse?.data) {
            setCourseTitle(courseResponse.data.title);
          }
        } catch (courseError) {
          console.error("Error fetching course details:", courseError);
        }

        // Fetch module details
        try {
          const moduleResponse = await moduleService.getModuleById(moduleId);
          if (moduleResponse?.data) {
            setModuleTitle(moduleResponse.data.title);
          }
        } catch (moduleError) {
          console.error("Error fetching module details:", moduleError);
        }

        // Fetch lesson details
        const lessonResponse = await lessonService.getLessonById(lessonId);
        if (lessonResponse) {
          const lessonData = lessonResponse.data || lessonResponse;
          setLesson(lessonData);

          // Fetch content items for this lesson
          try {
            const contentResponse =
              await contentService.getContentsByLesson(lessonId);
            if (contentResponse?.data && Array.isArray(contentResponse.data)) {
              // Sort contents by order if available
              const sortedContents = [...contentResponse.data].sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              );
              setContents(sortedContents);
              console.log("Loaded contents:", sortedContents);
            }
          } catch (contentError) {
            console.error("Error fetching lesson contents:", contentError);
          }

          // Fetch section details
          if (lessonData.section) {
            try {
              const sectionResponse = await sectionService.getSectionById(
                lessonData.section
              );
              if (sectionResponse?.data) {
                setSectionTitle(sectionResponse.data.title);
              }
            } catch (sectionError) {
              console.error("Error fetching section details:", sectionError);
            }
          }
        } else {
          setError("Lesson not found");
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        setError("Failed to load lesson. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, moduleId, lessonId]);

  const handleBackToModule = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleEditLesson = () => {
    navigate(
      `/teacher/course/${courseId}/module/${moduleId}/lessons/${lessonId}/edit`
    );
  };

  if (loading) {
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

  if (error || !lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Lesson not found"}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={lesson.title} />
      <Box sx={{ maxWidth: 1500, mx: "auto", p: 3, ml: 5   }}>
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
            onClick={handleBackToModule}
            sx={{ color: "#666", textDecoration: "none" }}
          >
            {moduleTitle}
          </Link>
          <Typography color="text.primary">{lesson.title}</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "block", alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToModule}
              sx={{
                color: "#0F62FE",
                borderColor: "#0F62FE",
                "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                textTransform: "none",
                mr: 2,
                mb: 2,
              }}
            >
              {moduleTitle || "Module"}
            </Button>
            <Typography variant="h4" fontWeight="bold">
              {lesson.title}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditLesson}
            sx={{
              color: "#0F62FE",
              borderColor: "#0F62FE",
              "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
              mr: 30,
            }}
          >
            Edit Lesson
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={10}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    icon={<MenuBookIcon />}
                    label="Reading"
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    {lesson.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Section:</strong> {sectionTitle}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Duration:</strong> {lesson.duration} minutes
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {lesson.description || "No description available."}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Content
                </Typography>

                {contents.length > 0 ? (
                  <Box>
                    {contents.map((content, index) => (
                      <Paper
                        key={content._id || index}
                        variant="outlined"
                        sx={{ p: 3, borderRadius: 2, mb: 3 }}
                      >
                        {content.caption && (
                          <Typography
                            variant="subtitle1"
                            fontWeight="medium"
                            gutterBottom
                          >
                            {content.caption}
                          </Typography>
                        )}

                        {content.type === "Reading" && (
                          <div
                            dangerouslySetInnerHTML={{ __html: content.data }}
                          />
                        )}

                        {content.type === "Video" && (
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <VideoIcon color="primary" sx={{ mr: 1 }} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Video Content
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                position: "relative",
                                paddingBottom: "56.25%",
                                height: 0,
                                overflow: "hidden",
                              }}
                            >
                              <iframe
                                src={
                                  content.data.includes("youtube.com") ||
                                  content.data.includes("youtu.be")
                                    ? content.data.replace("watch?v=", "embed/")
                                    : content.data
                                }
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={content.caption || `Video ${index + 1}`}
                              />
                            </Box>
                          </Box>
                        )}

                        {content.type === "Image" && (
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <ImageIcon color="primary" sx={{ mr: 1 }} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Image Content
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              <img
                                src={content.data}
                                alt={content.caption || "Lesson image"}
                                style={{ maxWidth: "100%", maxHeight: "500px" }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : lesson.content ? (
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </Paper>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: "center" }}
                  >
                    No content available for this lesson.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default LessonDetailPage;
