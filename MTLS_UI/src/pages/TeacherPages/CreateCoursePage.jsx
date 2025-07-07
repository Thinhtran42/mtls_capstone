import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { courseService } from '../../api/services/course.service';
import { s3StorageService } from '../../awsS3/s3Storage.service';
import PageTitle from '../../components/common/PageTitle';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { TinyMCEEditor } from "../../components/common/TinyMCEEditor";

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const courseManagement = "Course Management";

  // Get user information from local storage or context
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return {
      id: user._id || '',
      name: user.name || '',
    };
  };

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    image: '',
    teacher: getUserInfo().id,
    about: '',
    learningObjectives: ['', '', '', ''],
    skills: ['Music Theory', 'Composition', 'Harmony'],
    level: 'Basic' // Default level
  });

  const [formErrors, setFormErrors] = useState({});

  // Handle field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
    
    // Clear error for edited field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle select field changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value
    });
    
    // Clear error for edited field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Display preview
      const tempImageUrl = URL.createObjectURL(file);
      setImageUrl(tempImageUrl);
      
      // Show loading notification
      setLoading(true);
      
      // Prepare upload information
      const teacherInfo = {
        id: getUserInfo().id,
        name: getUserInfo().name
      };
      
      const courseInfo = {
        courseId: 'new-course',
        title: courseData.title || 'New Course'
      };
      
      // Upload file to S3
      const uploadResult = await s3StorageService.uploadLessonImage(file, courseInfo, teacherInfo);
      console.log('Image upload result:', uploadResult);
      
      // Update image URL from S3 to state
      setCourseData({
        ...courseData,
        image: uploadResult.imageUrl
      });
      
      // Release temporary URL to use S3 URL
      URL.revokeObjectURL(tempImageUrl);
      setImageUrl(uploadResult.imageUrl);
      
      // Success notification
      showSuccess('Image uploaded successfully');
    } catch (err) {
      console.error('Error uploading image:', err);
      showError('Error uploading image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!courseData.title.trim()) {
      errors.title = 'Please enter a course title';
    }
    
    if (!courseData.description.trim()) {
      errors.description = 'Please enter a course description';
    }
    
    if (!courseData.image) {
      errors.image = 'Please upload a course cover image';
    }
    
    if (!courseData.teacher) {
      errors.teacher = 'Invalid teacher ID';
    }
    
    // Check if at least one learning objective is provided
    if (courseData.learningObjectives.length === 0 || 
        (courseData.learningObjectives.length === 1 && !courseData.learningObjectives[0].trim())) {
      errors.learningObjectives = 'Please provide at least one learning objective';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle course saving
  const handleSaveCourse = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter out empty learning objectives
      const filteredObjectives = courseData.learningObjectives.filter(obj => obj.trim() !== '');
      
      // Prepare data for API
      const courseDataToSend = {
        ...courseData,
        learningObjectives: filteredObjectives
      };
      
      console.log('Submitting course data:', courseDataToSend);
      
      // Call API to create course
      const result = await courseService.createCourse(courseDataToSend);
      console.log('Course creation result:', result);
      
      showSuccess('Course created successfully!');
      
      // Redirect after successful creation
      setTimeout(() => {
        navigate('/teacher/courses');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating course:', err);
      showError(err.message || 'An error occurred while creating the course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle go back
  const handleBack = () => {
    navigate('/teacher/courses');
  };

  return (
    <>
      <PageTitle title="Create New Course" />
      
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
          <Typography color="text.primary">Create New Course</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
          {/* Back Navigation */}
          <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/teacher/courses')}
              sx={{
                color: '#0F62FE',
                borderColor: '#0F62FE',
                '&:hover': { bgcolor: 'rgba(15, 98, 254, 0.08)' },
                textTransform: 'none',
                mb: 2
              }}
            >
             {courseManagement} 
            </Button>
          <Typography variant="h4" fontWeight="bold">
            Create New Course
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
                value={courseData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Course Description"
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
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
                  value={courseData.level}
                  label="Course Level"
                  onChange={handleSelectChange}
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
                  initialValue={courseData.about || ''}
                  onEditorChange={(content) => {
                    setCourseData(prevData => ({
                      ...prevData,
                      about: content
                    }));
                  }}
                />
                {formErrors.about && (
                  <Typography color="error" variant="caption">
                    {formErrors.about}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Learning Objectives (What students will learn)
              </Typography>
              {courseData.learningObjectives.map((objective, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder={`Learning objective #${index + 1}`}
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...courseData.learningObjectives];
                      newObjectives[index] = e.target.value;
                      setCourseData({
                        ...courseData,
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
                      const newObjectives = courseData.learningObjectives.filter((_, i) => i !== index);
                      setCourseData({
                        ...courseData,
                        learningObjectives: newObjectives
                      });
                    }}
                    disabled={courseData.learningObjectives.length <= 1}
                  >
                    REMOVE
                  </Button>
                </Box>
              ))}
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setCourseData({
                    ...courseData,
                    learningObjectives: [...courseData.learningObjectives, '']
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
                value={skillsInput}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSkillsInput(newValue);
                  
                  // Cập nhật courseData.skills khi có thay đổi
                  const skillsArray = newValue
                    .split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill !== '');
                  
                  setCourseData(prev => ({
                    ...prev,
                    skills: skillsArray
                  }));
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
                  <>
                    <img
                      src={imageUrl}
                      alt="Course cover"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        bgcolor: 'rgba(0,0,0,0.6)', 
                        display: 'flex', 
                        justifyContent: 'center',
                        p: 1,
                        gap: 2
                      }}
                    >
                      <Button
                        component="label"
                        variant="contained"
                        size="small"
                        startIcon={<UploadIcon />}
                        sx={{ color: 'white' }}
                      >
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageChange}
                        />
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ color: 'white', borderColor: 'white' }}
                        onClick={() => {
                          setImageUrl('');
                          setCourseData({...courseData, image: ''});
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </>
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
              {formErrors.image && (
                <Typography color="error" variant="caption">
                  {formErrors.image}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveCourse}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Course'}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default CreateCoursePage; 