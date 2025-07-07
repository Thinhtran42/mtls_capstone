import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Dialog
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { courseService } from '../../api/services/course.service';
import { useSnackbar } from '../../contexts/SnackbarContext';

const ManageCoursesPage = () => {
  const navigate = useNavigate();
  const { showError, showInfo } = useSnackbar();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho dialog Delete và Success
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (successDialogOpen) {
      timer = setTimeout(() => {
        setSuccessDialogOpen(false);
      }, 3000); // Tự động đóng sau 3 giây
    }
    return () => clearTimeout(timer);
  }, [successDialogOpen]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getAllCourses();
        console.log('Fetched courses:', response);
        
        // Get list of courses
        const coursesData = response.data || [];
        setCourses(coursesData);
        
        if (coursesData.length === 0) {
          showInfo('No courses yet. Create your first course!');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        showError('Could not load the course list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to navigate to course edit page
  const handleEditCourse = (courseId, e) => {
    if (e) e.stopPropagation(); // Prevent card click event
    navigate(`/teacher/edit-course/${courseId}`);
  };

  // Function to navigate to course details page
  const handleViewCourse = (courseId) => {
    navigate(`/teacher/course/${courseId}`);
  };

  // Function to navigate to course creation page
  const handleCreateCourse = () => {
    navigate('/teacher/courses/create');
  };

  // Hàm mở dialog xác nhận xóa khóa học
  const handleOpenDeleteDialog = (e, course) => {
    e.stopPropagation(); // Prevent card click event
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  // Hàm đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  // Hàm xử lý xóa khóa học sau khi xác nhận
  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    const originalCourses = [...courses];
    try {
      // Cập nhật UI trước (optimistic update)
      setCourses(courses.filter(course => course._id !== courseToDelete._id));
      
      // Gọi API xóa khóa học
      await courseService.deleteCourse(courseToDelete._id);
      
      // Đóng dialog xác nhận ngay lập tức
      setDeleteDialogOpen(false);
      
      // Hiển thị dialog thành công
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting course:', error);
      // Nếu có lỗi, khôi phục lại danh sách khóa học
      setCourses(originalCourses);
      showError(`Could not delete course: ${error.message}`);
      setDeleteDialogOpen(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not updated';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  return (
    <>
      <PageTitle title="Course Management" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="#1a1a1a">
            Course Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
            sx={{
              bgcolor: '#0F62FE',
              '&:hover': { bgcolor: '#0043a8' },
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Add Course
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && courses.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column',
            height: '60vh'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No courses available
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
              sx={{ mt: 2 }}
            >
              Create your first course
            </Button>
          </Box>
        )}

        {!loading && courses.length > 0 && (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} md={6} lg={4} key={course._id || index}>
                <Card 
                  onClick={() => handleViewCourse(course._id)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: '#f5f7fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      backgroundImage: course.image ? `url(${course.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!course.image && <SchoolIcon sx={{ fontSize: 48, color: '#0F62FE' }} />}
                  </Box>
                  
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                      {course.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {course.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {course.enrollments && (
                        <Chip 
                          icon={<PersonIcon fontSize="small" />}
                          label={`${course.enrollments.length || 0} students`}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      )}
                    </Stack>
                    
                    {course.createdAt && (
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                        Created on: {formatDate(course.createdAt)}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end' }}>
                    <Box>
                      <IconButton
                        onClick={(e) => handleEditCourse(course._id, e)}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            bgcolor: 'rgba(15, 98, 254, 0.1)',
                            color: '#0F62FE'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleOpenDeleteDialog(e, course)}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            bgcolor: 'rgba(211, 47, 47, 0.1)',
                            color: '#d32f2f'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              bgcolor: 'rgba(244, 67, 54, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              animation: 'scaleIn 0.3s ease-out forwards, pulse 1.5s infinite 0.3s',
              '@keyframes scaleIn': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)'
                },
                '70%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)'
                },
                '100%': {
                  transform: 'scale(0.95)',
                  boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)'
                }
              }
            }}
          >
            <CloseIcon sx={{ color: '#f44336', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h5" id="delete-dialog-title" sx={{ mb: 2 }}>
            Are you sure?
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Do you really want to delete the course{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {courseToDelete?.title}
            </Box>
            ? All associated content and student data will also be deleted. This process cannot be undone.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleCloseDeleteDialog}
              sx={{ 
                bgcolor: '#d9d9d9', 
                color: '#555',
                '&:hover': { bgcolor: '#c9c9c9' },
                minWidth: 100
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmDelete}
              sx={{ 
                bgcolor: '#f44336', 
                '&:hover': { bgcolor: '#d32f2f' },
                minWidth: 100
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
      
      {/* SUCCESS DIALOG */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        aria-labelledby="success-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              bgcolor: 'rgba(76, 175, 80, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              animation: 'scaleIn 0.3s ease-out',
              '@keyframes scaleIn': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h5" id="success-dialog-title" sx={{ mb: 2, color: '#555' }}>
            Success!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#777' }}>
            The course has been deleted successfully.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={() => setSuccessDialogOpen(false)}
            sx={{ 
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#388e3c' },
              minWidth: 100
            }}
          >
            OK
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default ManageCoursesPage; 