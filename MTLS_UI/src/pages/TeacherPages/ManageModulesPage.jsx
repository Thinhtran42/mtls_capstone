import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Dialog
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MenuBook as MenuBookIcon,
  Quiz as QuizIcon,
  NavigateNext as NavigateNextIcon,
  FitnessCenter as FitnessCenterIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import PageTitle from '../../components/common/PageTitle';

const ManageModulesPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [moduleDetails, setModuleDetails] = useState({});
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const courseManagement = "Course Management";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sử dụng API getCourseWithStructure để lấy dữ liệu đầy đủ
        const courseResponse = await courseService.getCourseWithStructure(courseId, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        console.log('Course with structure response:', courseResponse);
        
        if (courseResponse && courseResponse.data) {
          const courseData = courseResponse.data;
          setCourseTitle(courseData.title);
          
          // Lọc chỉ lấy các module đang active
          const moduleList = (courseData.modules || []).filter(module => module.isActive !== false);
          setModules(moduleList);
          
          // Tính toán số lượng thành phần cho mỗi module
          const details = {};
          for (const module of moduleList) {
            // Khởi tạo đối tượng thống kê
            const stats = {
              lessons: 0,
              quizzes: 0,
              exercises: 0,
              assignments: 0
            };
            
            // Đếm tổng số lesson từ tất cả các sections loại LESSON
            if (Array.isArray(module.sections)) {
              let totalLessons = 0;
              let totalQuizzes = 0;
              let totalExercises = 0;
              let totalAssignments = 0;
              for (const section of module.sections) {
                const type = section.type?.toString().trim().toUpperCase();
                if (type === 'LESSON' || type.includes('LESSON')) {
                  totalLessons += section.components?.length || 0;
                } else if (type === 'QUIZ' || type.includes('QUIZ')) {
                  totalQuizzes += section.components?.length || 0;
                } else if (type === 'EXERCISE' || type.includes('EXERCISE')) {
                  totalExercises += section.components?.length || 0;
                } else if (type === 'ASSIGNMENT' || type.includes('ASSIGNMENT')) {
                  totalAssignments += section.components?.length || 0;
                }
              }
              stats.lessons = totalLessons;
              stats.quizzes = totalQuizzes;
              stats.exercises = totalExercises;
              stats.assignments = totalAssignments;
            }
            
            details[module._id] = stats;
            console.log(`Module ${module.title} stats:`, stats);
          }
          
          setModuleDetails(details);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);

  useEffect(() => {
    let timer;
    if (successDialogOpen) {
      timer = setTimeout(() => {
        setSuccessDialogOpen(false);
      }, 3000); // Tự động đóng sau 3 giây
    }
    return () => clearTimeout(timer);
  }, [successDialogOpen]);

  const handleViewModule = (moduleId) => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  const handleEditModule = (moduleId, e) => {
    e.stopPropagation();
    navigate(`/teacher/course/${courseId}/module/${moduleId}/edit`);
  };

  const handleCreateModule = () => {
    navigate(`/teacher/course/${courseId}/modules/create`);
  };

  // Count number of lessons in module
  const getLessonsCount = (moduleId) => {
    return moduleDetails[moduleId]?.lessons || 0;
  };

  // Count number of quizzes in module
  const getQuizzesCount = (moduleId) => {
    return moduleDetails[moduleId]?.quizzes || 0;
  };

  // Count number of exercises in module
  const getExercisesCount = (moduleId) => {
    return moduleDetails[moduleId]?.exercises || 0;
  };

  // Count number of assignments in module
  const getAssignmentsCount = (moduleId) => {
    return moduleDetails[moduleId]?.assignments || 0;
  };

  const handleDeleteModule = (moduleId, e) => {
    e.stopPropagation();
    setModuleToDelete(moduleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!moduleToDelete) return;
    
    // Cập nhật UI trước (optimistic update)
    const originalModules = [...modules];
    setModules(modules.filter(m => m._id !== moduleToDelete));
    
    moduleService.deleteModule(moduleToDelete)
      .then(() => {
        // Đóng dialog xác nhận ngay lập tức
        setDeleteDialogOpen(false);
        
        // Hiển thị dialog thành công
          setSuccessDialogOpen(true);
      })
      .catch(error => {
        console.error('Error deleting module:', error);
        setModules(originalModules);
        setError('Failed to delete module. Please try again.');
        setDeleteDialogOpen(false);
      });
  };

  console.log("Rendering component, successDialogOpen =", successDialogOpen);

  useEffect(() => {
    console.log("Delete dialog state:", deleteDialogOpen);
    console.log("Success dialog state:", successDialogOpen);
  }, [deleteDialogOpen, successDialogOpen]);

  return (
    <>
      <PageTitle title="Module Management" />
      <Box sx={{ maxWidth: 1200, mx: 5 }}>
        <Stack spacing={3}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/teacher/courses')}
              sx={{ color: '#666', textDecoration: 'none' }}
            >
              Courses
            </Link>
            <Typography color="text.primary">{courseTitle}</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/teacher/courses/')}
              sx={{
                color: '#0F62FE',
                borderColor: '#0F62FE',
                '&:hover': { bgcolor: 'rgba(15, 98, 254, 0.08)' },
                textTransform: 'none'
              }}
            >
             {courseManagement} 
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="#1a1a1a">
              Module Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateModule}
              sx={{
                bgcolor: '#0F62FE',
                '&:hover': { bgcolor: '#0043a8' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Add Module
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && modules.length === 0 && (
            <Alert severity="info" sx={{ mb: 4 }}>
              No modules yet. Create your first module!
            </Alert>
          )}

          {!loading && !error && modules.length > 0 && (
            <Grid container spacing={3}>
              {modules.map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: '1px solid #e0e0e0',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => handleViewModule(module._id)}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module._id, e);
                      }}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#d32f2f',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(module._id, e);
                      }}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 40,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#0F62FE',
                        '&:hover': {
                          bgcolor: 'rgba(15, 98, 254, 0.1)'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" fontWeight="bold" color="#1a1a1a">
                            {module.title}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="#666" sx={{ lineHeight: 1.6 }}>
                          {module.description || 'No description'}
                        </Typography>

                        <Divider />

                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MenuBookIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                            <Typography variant="body2" color="#666">
                              {getLessonsCount(module._id)} lessons
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QuizIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                            <Typography variant="body2" color="#666">
                              {getQuizzesCount(module._id)} quizzes
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FitnessCenterIcon sx={{ color: '#ed6c02', fontSize: 20 }} />
                            <Typography variant="body2" color="#666">
                              {getExercisesCount(module._id)} exercises
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentTurnedInIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                            <Typography variant="body2" color="#666">
                              {getAssignmentsCount(module._id)} assignments
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
            Do you really want to delete the module{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {modules.find(m => m._id === moduleToDelete)?.title}
            </Box>
            ? All associated content will also be inaccessible. This process cannot be undone.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => setDeleteDialogOpen(false)}
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
            The module has been deleted successfully.
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

export default ManageModulesPage;