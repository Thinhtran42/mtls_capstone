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
import { quizService } from '../../api/services/quiz.service';
import { sectionService } from '../../api/services/section.service';
import { moduleService } from '../../api/services/module.service';
import { courseService } from '../../api/services/course.service';
import PageTitle from '../../components/common/PageTitle';

const EditQuizPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, quizId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [quiz, setQuiz] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [sections, setSections] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
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
          // Filter for quiz sections only
          const quizSections = sectionsResponse.data.filter(
            section => section.type === 'Quiz'
          );
          setSections(quizSections);
        }
        
        // Fetch quiz details
        const quizResponse = await quizService.getQuizById(quizId);
        console.log('Quiz response:', quizResponse);
        
        // Handle different data structures from API
        let quizData = null;
        
        if (quizResponse) {
          // Check data structure
          if (quizResponse.data) {
            quizData = quizResponse.data;
          } else if (quizResponse._id) {
            // Response is directly the quiz object
            quizData = quizResponse;
          } else if (quizResponse.quiz) {
            // Data is wrapped in a 'quiz' field
            quizData = quizResponse.quiz;
          } else {
            // Try to parse JSON if it's a string
            try {
              if (typeof quizResponse === 'string') {
                const parsedData = JSON.parse(quizResponse);
                if (parsedData && (parsedData.data || parsedData._id)) {
                  quizData = parsedData.data || parsedData;
                }
              }
            } catch (parseError) {
              console.error('Error parsing quiz data:', parseError);
            }
          }
        }
        
        if (quizData) {
          console.log('Parsed quiz data:', quizData);
          setQuiz(quizData);
          
          // Set form data from quiz details, with safe handling for fields
          const timeLimit = quizData.timeLimit || quizData.duration || 30;
          
          setFormData({
            title: quizData.title || '',
            description: quizData.description || '',
            timeLimit: timeLimit,
            section: quizData.section || ''
          });
        } else {
          console.error('Could not find quiz details in response:', quizResponse);
          setError('Could not find quiz details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load quiz data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [quizId, courseId, moduleId]);
  
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
    
    if (!formData.timeLimit || formData.timeLimit <= 0) {
      newErrors.timeLimit = 'Valid time limit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}`);
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      // Prepare data for API
      const updatedQuizData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        timeLimit: parseInt(formData.timeLimit),
        duration: parseInt(formData.timeLimit), // Ensure both timeLimit and duration have values
        section: formData.section
      };
      
      console.log('Sending update request with data:', updatedQuizData);
      console.log('Quiz ID for update:', quizId);
      
      // Call API to update quiz
      const response = await quizService.updateQuiz(quizId, updatedQuizData);
      
      if (response) {
        console.log('Update response:', response);
        setSuccess(true);
        // Redirect to quiz details page after success
        setTimeout(() => {
          navigate(`/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        setError(`Failed to update quiz: ${error.response.data?.message || error.message || 'Unknown error'}`);
      } else {
        setError('Failed to update quiz. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };
  
  const handleManageQuestions = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}/questions`);
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
      <PageTitle title="Edit Quiz" />
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
            onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}/quizzes/${quizId}`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {quiz?.title || 'Quiz'}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
        <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
              sx={{
                color: "#0F62FE",
                borderColor: "#0F62FE",
                "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                textTransform: "none",
              }}
            >
              {quiz?.title}
            </Button>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Edit Quiz: {quiz?.title}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Quiz updated successfully!
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quiz Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Quiz Title"
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
                      label="Time Limit (minutes)"
                      name="timeLimit"
                      type="number"
                      value={formData.timeLimit}
                      onChange={handleInputChange}
                      required
                      error={!!errors.timeLimit}
                      helperText={errors.timeLimit}
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
                            No quiz sections available
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

export default EditQuizPage; 