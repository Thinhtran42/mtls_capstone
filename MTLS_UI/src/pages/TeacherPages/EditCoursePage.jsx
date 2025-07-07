import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { courseService } from '../../api/services/course.service';
import { s3StorageService } from '../../awsS3/s3Storage.service';
import PageTitle from '../../components/common/PageTitle';
import { useSnackbar } from '../../contexts/SnackbarContext';
import BackButton from '../../components/common/BackButton';
import { TinyMCEEditor } from "../../components/common/TinyMCEEditor";

const EditCoursePage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Get user information from local storage or context
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return {
      id: user._id || '',
      name: user.name || '',
    };
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about: '',
    learningObjectives: [],
    skills: [],
    image: '',
    level: 'Basic',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await courseService.getCourseById(courseId);
        if (courseResponse?.data) {
          const courseData = courseResponse.data;
          
          // Set form data from course details
          setFormData({
            title: courseData.title || '',
            description: courseData.description || '',
            about: courseData.about || '',
            learningObjectives: courseData.learningObjectives && courseData.learningObjectives.length > 0 
              ? courseData.learningObjectives 
              : ['', '', '', ''],
            skills: courseData.skills && courseData.skills.length > 0 
              ? courseData.skills 
              : ['Music Theory', 'Composition', 'Harmony'],
            image: courseData.image || '',
            level: courseData.level || 'Basic',
            status: courseData.status || 'active'
          });
          
          if (courseData.image) {
            setImageUrl(courseData.image);
          }
        } else {
          setError('Could not find course details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Display preview
      const tempImageUrl = URL.createObjectURL(file);
      setImageUrl(tempImageUrl);
      
      // Show uploading message
      setUpdating(true);
      
      // Prepare upload information
      const teacherInfo = {
        id: getUserInfo().id,
        name: getUserInfo().name
      };
      
      const courseInfo = {
        courseId: courseId,
        title: formData.title
      };
      
      // Upload file to S3
      const uploadResult = await s3StorageService.uploadLessonImage(file, courseInfo, teacherInfo);
      console.log('Image upload result:', uploadResult);
      
      // Release temporary URL to use S3 URL
      URL.revokeObjectURL(tempImageUrl);
      setImageUrl(uploadResult.imageUrl);
      
      // Success notification
      showSuccess('Image uploaded successfully');
    } catch (err) {
      console.error('Error uploading image:', err);
      showError('Error uploading image: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a course title';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a course description';
    }
    
    // Check if at least one learning objective is provided
    if (formData.learningObjectives.length === 0 || 
        (formData.learningObjectives.length === 1 && !formData.learningObjectives[0].trim())) {
      newErrors.learningObjectives = 'Please provide at least one learning objective';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle course update
  const handleUpdateCourse = async () => {
    console.log('Update button clicked');
    
    if (!validateForm()) {
      console.log('Form validation failed', errors);
      return;
    }
    
    try {
      setUpdating(true);
      
      // Filter out empty learning objectives
      const filteredObjectives = formData.learningObjectives.filter(obj => obj.trim() !== '');
      
      // Create data object to send, including the image URL
      const updateData = {
        ...formData,
        learningObjectives: filteredObjectives,
        image: imageUrl
      };
      
      console.log('Updating course data:', updateData);
      
      // Call API to update the course
      const result = await courseService.updateCourse(courseId, updateData);
      console.log('Course update result:', result);
      
      showSuccess('Course updated successfully!');
      
      // Redirect after successful update
      setTimeout(() => {
        navigate('/teacher/courses');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating course:', err);
      showError(err.message || 'An error occurred while updating the course. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle go back
  const handleBack = () => {
    navigate('/teacher/courses');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <BackButton
          text="Back to Course List"
          onClick={() => navigate('/teacher/courses')}
        />
      </Container>
    );
  }

  return (
    <>
      <PageTitle title="Edit Course" />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
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
          <Typography color="text.primary">Edit Course</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
          <BackButton
            text="Back to Courses"
            onClick={handleBack}
            sx={{ mr: 2 }}
          />
          <Typography variant="h4" fontWeight="bold">
            Edit Course
          </Typography>
        </Box>
        
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Course Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Course Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={5}
                required
                sx={{ mb: 3 }}
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="course-level-label">Course Level</InputLabel>
                <Select
                  labelId="course-level-label"
                  id="course-level"
                  name="level"
                  value={formData.level}
                  label="Course Level"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="subtitle1" gutterBottom>
                About This Course
              </Typography>
              <Box sx={{ mb: 3 }}>
                <TinyMCEEditor
                  initialValue={formData.about || ''}
                  onEditorChange={(content) => {
                    setFormData({
                      ...formData,
                      about: content
                    });
                  }}
                />
                {errors.about && (
                  <Typography color="error" variant="caption">
                    {errors.about}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Learning Objectives (What students will learn)
              </Typography>
              {formData.learningObjectives.map((objective, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder={`Objective #${index + 1}`}
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...formData.learningObjectives];
                      newObjectives[index] = e.target.value;
                      setFormData({
                        ...formData,
                        learningObjectives: newObjectives
                      });
                    }}
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    color="error" 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      const newObjectives = formData.learningObjectives.filter((_, i) => i !== index);
                      setFormData({
                        ...formData,
                        learningObjectives: newObjectives
                      });
                    }}
                    disabled={formData.learningObjectives.length <= 1}
                  >
                    REMOVE
                  </Button>
                </Box>
              ))}
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setFormData({
                    ...formData,
                    learningObjectives: [...formData.learningObjectives, '']
                  });
                }}
                sx={{ mb: 3 }}
              >
                ADD LEARNING OBJECTIVE
              </Button>
              
              <Typography variant="subtitle1" gutterBottom>
                Skills Students Will Gain
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter skills separated by commas (e.g., Music Theory, Composition, Harmony)"
                value={formData.skills.join(', ')}
                onChange={(e) => {
                  const skillsArray = e.target.value
                    .split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill !== '');
                  setFormData({
                    ...formData,
                    skills: skillsArray
                  });
                }}
                helperText="These will appear as tags on your course page"
                sx={{ mb: 3 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Course Cover Image
              </Typography>
              
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Course cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ position: 'absolute' }}
                  >
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Button>
                )}
              </Box>
              
              {imageUrl && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleUpdateCourse}
            disabled={updating}
            sx={{
              bgcolor: '#0F62FE',
              '&:hover': { bgcolor: '#0043CE' }
            }}
          >
            {updating ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Updating...
              </>
            ) : (
              'Update Course'
            )}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default EditCoursePage; 