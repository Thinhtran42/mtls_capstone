import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  AccessTime as AccessTimeIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { useLessons } from "../../contexts/LessonContext";
import ReactMarkdown from 'react-markdown';

function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLessonById } = useLessons();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const lessonData = getLessonById(id);
    if (lessonData) {
      setLesson(lessonData);
    }
  }, [id, getLessonById]);

  if (!lesson) {
    return (
      <AdminLayout>
        <Container>
          <Typography>Lesson not found</Typography>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ backgroundColor: "#f5f7f9", minHeight: "100vh", mr: "200px" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin/manage-lesson")}
              sx={{ mb: 2 }}
            >
              Back
            </Button>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {lesson.title}
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/manage-lesson/edit/${id}`)}
              >
                Edit
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={lesson.difficulty}
                    size="small"
                    sx={{
                      mr: 1,
                      backgroundColor: 
                        lesson.difficulty === "Basic" ? "#e3f2fd" :
                        lesson.difficulty === "Intermediate" ? "#fff3e0" : "#fbe9e7",
                      color:
                        lesson.difficulty === "Basic" ? "#1976d2" :
                        lesson.difficulty === "Intermediate" ? "#f57c00" : "#d32f2f",
                    }}
                  />
                  <Chip
                    label={lesson.category}
                    size="small"
                    sx={{ backgroundColor: "#f5f5f5" }}
                  />
                </Box>

                <Typography variant="body1" paragraph>
                  {lesson.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Prerequisites
                  </Typography>
                  <Typography>{lesson.requirements}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Learning Objectives
                  </Typography>
                  {Array.isArray(lesson.objectives) ? (
                    <ul>
                      {lesson.objectives.map((objective, index) => (
                        <li key={index}>
                          <Typography>{objective}</Typography>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography>{lesson.objectives}</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Lesson Content
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={lesson.teacher.avatar}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{lesson.teacher.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.teacher.role}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>Duration: {lesson.duration}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UpdateIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>
                    Updated: {new Date(lesson.updatedAt).toLocaleDateString('en-US')}
                  </Typography>
                </Box>
              </Paper>

              {lesson.attachments && lesson.attachments.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  <Box>
                    {lesson.attachments.map((attachment, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        {/* Display attachments */}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </AdminLayout>
  );
}

export default LessonDetail; 