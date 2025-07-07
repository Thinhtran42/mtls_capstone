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
  QuestionAnswer as QuestionIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { exerciseService } from '../../api/services/exercise.service';
import { courseService } from '../../api/services/course.service';
import { moduleService } from '../../api/services/module.service';
import { sectionService } from '../../api/services/section.service';
import BackButton from '../../components/common/BackButton';

const EditExercisePage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, exerciseId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [exercise, setExercise] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [sections, setSections] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: 30,
    section: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
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
          setModuleTitle(moduleResponse.data.title);
        }
        
        // Fetch sections for this module
        const sectionsResponse = await sectionService.getSectionsByModule(moduleId);
        if (sectionsResponse?.data) {
          // Filter for exercise sections only
          const exerciseSections = sectionsResponse.data.filter(
            section => section.type === 'Exercise'
          );
          setSections(exerciseSections);
        }
        
        // Fetch exercise details
        const exerciseResponse = await exerciseService.getExerciseById(exerciseId);
        if (exerciseResponse?.data) {
          const exerciseData = exerciseResponse.data;
          setExercise(exerciseData);
          
          // Set form data from exercise details
          setFormData({
            title: exerciseData.title || '',
            description: exerciseData.description || '',
            instructions: exerciseData.instructions || '',
            duration: exerciseData.duration || 30,
            section: exerciseData.section || ''
          });
        } else {
          setError('Could not find exercise details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load exercise data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [exerciseId, courseId, moduleId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.section) {
      newErrors.section = 'Section is required';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}`);
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      // Prepare data for API
      const updatedExerciseData = {
        ...formData,
        duration: parseInt(formData.duration),
      };
      
      // Call API to update exercise
      const response = await exerciseService.updateExercise(exerciseId, updatedExerciseData);
      
      if (response) {
        setSuccess(true);
        // Redirect to exercise details page after success
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      setError('Failed to update exercise. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleManageQuestions = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}/questions`);
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
      <PageTitle title="Edit Exercise" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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
            onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}/exercises/${exerciseId}`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {exercise?.title || 'Exercise'}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
          <BackButton
            text={exercise?.title}
            onClick={handleCancel}
          />
          <Typography variant="h4" fontWeight="bold">
            Edit Exercise: {exercise?.title}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Exercise updated successfully!
          </Alert>
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
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2, position: 'sticky', top: 20 }}>
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
                    disabled={updating}
                    sx={{ mb: 2, py: 1 }}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ mb: 2, py: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EditExercisePage;