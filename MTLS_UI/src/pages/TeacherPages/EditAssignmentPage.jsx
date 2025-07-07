import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Breadcrumbs,
  Link,
  Grid,
  FormHelperText,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { assignmentService } from '../../api/services/assignment.service';
import { sectionService } from '../../api/services/section.service';
import { moduleService } from '../../api/services/module.service';
import { courseService } from '../../api/services/course.service';
import PageTitle from '../../components/common/PageTitle';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import BackButton from '../../components/common/BackButton';

const EditAssignmentPage = () => {
  const navigate = useNavigate();
  const { courseId, moduleId, assignmentId } = useParams();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    totalPoints: 100,
    section: ''
  });
  
  // State for additional information
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [sections, setSections] = useState([]);
  
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
          // Filter for assignment sections only
          const assignmentSections = sectionsResponse.data.filter(
            section => section.type === 'Assignment'
          );
          setSections(assignmentSections);
        }
        
        // Fetch assignment details - improved data handling
        console.log('==== FETCHING ASSIGNMENT INFORMATION ====');
        console.log('Fetching assignment with ID:', assignmentId);
        
        // Method 1: Using service API
        let assignmentData = null;
        let errorEncountered = false;
        
        try {
          // Try method through service
          const assignmentResponse = await assignmentService.getAssignmentById(assignmentId);
          console.log('Assignment API response:', assignmentResponse);
          
          // Check different data structures
          if (assignmentResponse) {
            console.log('Response data structure:', typeof assignmentResponse);
            
            if (assignmentResponse.data?.data) {
              // Structure { data: { data: {...} } }
              assignmentData = assignmentResponse.data.data;
              console.log('Assignment data extracted from data.data:', assignmentData);
            } else if (assignmentResponse.data) {
              // Structure { data: {...} }
              assignmentData = assignmentResponse.data;
              console.log('Assignment data extracted from data:', assignmentData);
            } else if (Array.isArray(assignmentResponse) && assignmentResponse.length > 0) {
              // Case of array response (rare)
              assignmentData = assignmentResponse[0];
              console.log('Assignment data extracted from array:', assignmentData);
            } else if (typeof assignmentResponse === 'object') {
              // Case of direct object response
              assignmentData = assignmentResponse;
              console.log('Assignment data is direct object:', assignmentData);
            }
          }
        } catch (assignmentError) {
          console.error('Error using assignment service:', assignmentError);
          errorEncountered = true;
          
          // Display detailed error for debugging
          if (assignmentError.response) {
            console.error('API error details:', {
              status: assignmentError.response.status,
              data: assignmentError.response.data,
              headers: assignmentError.response.headers
            });
          }
        }
        
        // Method 2: If method 1 fails, try direct API call
        if (!assignmentData && errorEncountered) {
          try {
            console.log('Trying direct API call');
            const axios = await import('axios');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            
            if (token) {
              const response = await axios.default.get(`${baseURL}/assignments/${assignmentId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                timeout: 8000
              });
              
              console.log('Direct API response:', response);
              
              if (response.data) {
                if (response.data.data) {
                  assignmentData = response.data.data;
                } else {
                  assignmentData = response.data;
                }
                console.log('Assignment data from direct API:', assignmentData);
              }
            }
          } catch (directApiError) {
            console.error('Error with direct API call:', directApiError);
          }
        }
        
        // Method 3: Try to get from different API - with submissions
        if (!assignmentData) {
          try {
            console.log('Trying to get assignment from submissions API');
            const withSubmissionsResponse = await assignmentService.getAssignmentWithSubmissions(assignmentId);
            console.log('API with submissions response:', withSubmissionsResponse);
            
            if (withSubmissionsResponse?.data) {
              if (withSubmissionsResponse.data.data) {
                assignmentData = withSubmissionsResponse.data.data;
              } else if (withSubmissionsResponse.data.assignment) {
                assignmentData = withSubmissionsResponse.data.assignment;
              } else {
                assignmentData = withSubmissionsResponse.data;
              }
              console.log('Assignment data from submissions API:', assignmentData);
            }
          } catch (submissionsError) {
            console.error('Error with submissions API:', submissionsError);
          }
        }
        
        // Process data if found
        if (assignmentData) {
          // Log details to analyze data structure
          console.log('Assignment data structure:', {
            hasTitle: !!assignmentData.title,
            hasDescription: !!assignmentData.description,
            hasDueDate: !!assignmentData.dueDate,
            hasSection: !!assignmentData.section,
            hasQuestionText: !!assignmentData.questionText,
            sectionType: assignmentData.section ? typeof assignmentData.section : 'none',
            hasTotalPoints: !!assignmentData.totalPoints,
            keys: Object.keys(assignmentData)
          });
          
          // Set form data from assignment details
          console.log('Setting form data with:', assignmentData);
          setFormData({
            title: assignmentData.title || '',
            description: assignmentData.description || '',
            questionText: assignmentData.questionText || '',
            dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalPoints: assignmentData.totalPoints || assignmentData.totalPoint || 100,
            section: assignmentData.section && typeof assignmentData.section === 'object' ? assignmentData.section._id : assignmentData.section || '',
          });
          setError(null); // Clear error if data loaded successfully
        } else {
          console.log('No valid assignment data found');
          setError('Could not find assignment details');
          
          // Create sample initial data if not found
          setFormData({
            title: `Assignment ${Date.now().toString().slice(-4)}`,
            description: '',
            questionText: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalPoints: 100,
            section: sections.length > 0 ? sections[0]._id : '',
          });
        }
        
        console.log('==== FINISHED GETTING ASSIGNMENT INFORMATION ====');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load assignment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assignmentId, courseId, moduleId]);
  
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
  
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      dueDate: newDate
    });
    
    if (errors.dueDate) {
      setErrors({
        ...errors,
        dueDate: null
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
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    if (!formData.totalPoints || formData.totalPoints <= 0) {
      newErrors.totalPoints = 'Total points must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare data with new fields
      const assignmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        questionText: formData.questionText.trim(),
        dueDate: formData.dueDate instanceof Date ? formData.dueDate.toISOString() : formData.dueDate,
        totalPoints: Number(formData.totalPoints),
        section: formData.section
      };
      
      console.log('Updating assignment with ID:', assignmentId);
      console.log('Assignment data being sent:', assignmentData);
      
      const response = await assignmentService.updateAssignment(assignmentId, assignmentData);
      console.log('Assignment update response:', response);
      
      setSuccess(true);
      setError(null);
      
      // After 2 seconds, redirect to assignment details page
      setTimeout(() => {
        navigate(`/teacher/course/${courseId}/module/${moduleId}/assignments/${assignmentId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating assignment:', error);
      
      // Display detailed error for debugging
      if (error.response) {
        console.error('API error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      setError('An error occurred while updating the assignment: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}/assignments/${assignmentId}`);
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
      <PageTitle title="Edit Assignment" />
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
            onClick={() => navigate(`/teacher/course/${courseId}/module/${moduleId}/assignments/${assignmentId}`)}
            sx={{ color: '#666', textDecoration: 'none' }}
          >
            {formData.title || 'Assignment'}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
          <BackButton
            text={formData?.title}
            onClick={handleCancel}
          />
          <Typography variant="h4" fontWeight="bold">
            Edit Assignment: {formData.title}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Assignment updated successfully!
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignment Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Assignment Title"
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Question"
                      name="questionText"
                      value={formData.questionText}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                    />
                  </Grid>  
                    
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="Due Date"
                      value={formData.dueDate}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.dueDate,
                          helperText: errors.dueDate,
                          size: "medium"
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Points"
                      name="totalPoints"
                      type="number"
                      value={formData.totalPoints}
                      onChange={handleInputChange}
                      required
                      error={!!errors.totalPoints}
                      helperText={errors.totalPoints}
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
                            No assignment sections available
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
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ mb: 2, py: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ py: 1 }}
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

export default EditAssignmentPage; 