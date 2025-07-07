import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormHelperText,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { sectionService } from '../../api/services/section.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';

const CreateSectionPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Reading',
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, moduleId]);
  
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
      newErrors.title = 'Title is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Section type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/manage-sections`);
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API
      const sectionData = {
        ...formData,
        module: moduleId,
      };
      
      // Call API to create section
      const response = await sectionService.createSection(sectionData);
      
      if (response) {
        setSuccess(true);
        
        // Navigate back to sections page after success
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}/module/${moduleId}/manage-sections`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating section:', error);
      setError('Failed to create section. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <PageTitle title="Create New Section" />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
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
            {moduleTitle}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}/manage-sections`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            Manage Sections
          </Link>
          <Typography color="text.primary">
            Create Section
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Create New Section
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Section created successfully!
          </Alert>
        )}
        
        <Card elevation={1} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Section Title"
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
                <FormControl fullWidth required error={!!errors.type}>
                  <InputLabel id="section-type-label">Section Type</InputLabel>
                  <Select
                    labelId="section-type-label"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Section Type"
                  >
                    <MenuItem value="Reading">Reading</MenuItem>
                    <MenuItem value="Video">Video</MenuItem>
                    <MenuItem value="Exercise">Exercise</MenuItem>
                    <MenuItem value="Quiz">Quiz</MenuItem>
                    <MenuItem value="Assignment">Assignment</MenuItem>
                  </Select>
                  {errors.type && (
                    <FormHelperText>{errors.type}</FormHelperText>
                  )}
                </FormControl>
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
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Section'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default CreateSectionPage; 