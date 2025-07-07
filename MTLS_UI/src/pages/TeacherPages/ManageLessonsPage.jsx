import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  BookmarkAdd as SectionIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { lessonService } from '../../api/services/lesson.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';

const ManageLessonsPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get course data
        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          setCourseTitle(courseResponse.data.title);
        }

        // Get module data
        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title);
        }

        // Get lessons for this module
        const lessonsResponse = await lessonService.getLessonsByModule(moduleId);
        console.log('Lessons response:', lessonsResponse);
        
        if (lessonsResponse?.data) {
          setLessons(lessonsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load lessons. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId]);

  const handleViewLesson = (lessonId) => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/lessons/${lessonId}`);
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/lessons/${lessonId}/edit`);
  };

  const handleCreateLesson = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/lessons/create`);
  };

  const handleGoToCourses = () => {
    navigate('/teacher/courses');
  };

  const handleGoToCourse = () => {
    navigate(`/teacher/course/${courseId}`);
  };

  const handleGoToModule = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleManageSections = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/manage-sections`);
  };

  const handleOpenDeleteDialog = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      await lessonService.deleteLesson(lessonToDelete._id);
      setLessons(lessons.filter(lesson => lesson._id !== lessonToDelete._id));
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('Failed to delete lesson. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageTitle title="Lesson Management" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={handleGoToCourses}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            Courses
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={handleGoToCourse}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {courseTitle}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={handleGoToModule}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {moduleTitle}
          </Link>
          <Typography color="text.primary">Lesson Management</Typography>
        </Breadcrumbs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleGoToModule} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              Lesson Management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SectionIcon />}
              onClick={handleManageSections}
              sx={{ textTransform: 'none' }}
            >
              Manage Sections
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateLesson}
              sx={{ textTransform: 'none' }}
            >
              Create New Lesson
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell width="5%" align="center">No.</TableCell>
                <TableCell width="40%">Title</TableCell>
                <TableCell width="15%">Type</TableCell>
                <TableCell width="20%">Created Date</TableCell>
                <TableCell width="20%" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <TableRow key={lesson._id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>{lesson.type || 'Lesson'}</TableCell>
                    <TableCell>
                      {new Date(lesson.createdAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewLesson(lesson._id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          color="warning"
                          onClick={() => handleEditLesson(lesson._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(lesson)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No lessons found. Create your first lesson!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the lesson &quot;{lessonToDelete?.title}&quot;? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteLesson} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ManageLessonsPage; 