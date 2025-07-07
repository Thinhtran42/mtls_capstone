import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Snackbar,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { moduleService } from '../../api/services/module.service';
import { courseService } from '../../api/services/course.service';

const EditModulePage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  const [courseTitle, setCourseTitle] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  
  const [errors, setErrors] = useState({
    title: false,
    description: false
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
          const moduleData = moduleResponse.data;
          
          setFormData({
            title: moduleData.title || '',
            description: moduleData.description || '',
          });
        } else {
          setError('Could not find module details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load module data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, moduleId]);
  
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
      setError(null);
      
      // Chuẩn bị dữ liệu cho API
      const updatedModuleData = {
        ...formData,
      };
      
      // Gọi API để cập nhật module
      const response = await moduleService.updateModule(moduleId, updatedModuleData);
      
      if (response) {
        // Hiển thị snackbar thành công thay vì set state success
        setSnackbar({
          open: true,
          message: 'Module updated successfully!',
          severity: 'success'
        });
        
        // Chuyển hướng về trang module details sau 1.5 giây
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating module:', error);
      // Hiển thị snackbar lỗi thay vì setError
      setSnackbar({
        open: true,
        message: 'Failed to update module. Please try again.',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}`);
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
      <PageTitle title="Edit Module" />
      <Box sx={{ ml: 20 }}>
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
              {courseTitle}
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}`)}
              sx={{ color: '#666', textDecoration: 'none' }}
            >
              {formData.title}
            </Link>
            <Typography color="text.primary">Edit</Typography>
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
          
          <Typography variant="h4" fontWeight="bold" color="#1a1a1a">
            Edit Module: {formData.title}
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
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
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={updating}
                  sx={{
                    bgcolor: '#0F62FE',
                    '&:hover': { bgcolor: '#0043a8' },
                    px: 4,
                    py: 1
                  }}
                >
                  Save
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ py: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
          
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
        </Stack>
      </Box>
    </>
  );
};

export default EditModulePage; 