import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  Alert,
  IconButton,
  Snackbar,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { moduleService } from '../../api/services/module.service';
import { courseService } from '../../api/services/course.service';

const CreateModulePage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [courseData, setCourseData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  // Validation state
  const [errors, setErrors] = useState({
    title: false,
    description: false
  });
  
  // State cho snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  
  // State for updating
  const [updating, setUpdating] = useState(false);
  
  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseService.getCourseById(courseId);
        if (response && response.data) {
          setCourseData(response.data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details');
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi validation khi người dùng nhập vào trường đó
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim(),
      description: !formData.description.trim()
    };
    
    setErrors(newErrors);
    
    // Trả về true nếu không có lỗi
    return !Object.values(newErrors).includes(true);
  };
  
  const handleSave = async () => {
    // Kiểm tra validation trước khi lưu
    if (!validateForm()) {
      // Hiển thị snackbar lỗi nếu form không hợp lệ
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      // Chuẩn bị dữ liệu cho API
      const newModuleData = {
        ...formData,
        course: courseId
      };
      
      // Gọi API để tạo module mới
      const response = await moduleService.createModule(newModuleData);
      
      if (response) {
        // Hiển thị snackbar thành công
        setSnackbar({
          open: true,
          message: 'Module created successfully!',
          severity: 'success'
        });
        
        // Chuyển hướng về trang quản lý module sau một khoảng thời gian
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      // Hiển thị snackbar lỗi
      setSnackbar({
        open: true,
        message: 'Failed to create module. Please try again.',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}`);
  };

  return (
    <>
      <PageTitle title="Create Module" />
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
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate(`/teacher/course/${courseId}`)}
              sx={{ color: '#666', textDecoration: 'none' }}
            >
              {courseData?.title || 'Course'}
            </Link>
            <Typography color="text.primary">Create New Module</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/teacher/course/${courseId}`)}
              sx={{
                color: '#0F62FE',
                borderColor: '#0F62FE',
                '&:hover': { bgcolor: 'rgba(15, 98, 254, 0.08)' },
                textTransform: 'none'
              }}
            >
              Back to Module Management
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold">
              Create New Module
            </Typography>
          </Box>

          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Module created successfully!
            </Alert>
          )}
          
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Module Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Module Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  error={errors.title}
                  helperText={errors.title ? "Title is required" : ""}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  error={errors.description}
                  helperText={errors.description ? "Description is required" : ""}
                  sx={{ mb: 3 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Module'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateModulePage; 