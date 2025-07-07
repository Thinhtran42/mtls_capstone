import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { sectionService } from '../../api/services/section.service';
import { assignmentService } from '../../api/services/assignment.service';
import { moduleService } from '../../api/services/module.service';
import BackButton from '../../components/common/BackButton';

const CreateAssignmentPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [moduleTitle, setModuleTitle] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dữ liệu của bài tập tự luận
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    questionText: '',
    duration: 60,
    section: '',
    allowFileUpload: true,
    maxFileSize: 5, // MB
    allowedFileTypes: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip'
  });

  // Các steps trong quá trình tạo bài tập
  const steps = ['General information', 'Question', 'Preview'];

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const sectionIdFromUrl = queryParams.get('sectionId');

  // Fetch module title
  useEffect(() => {
    const fetchModuleInfo = async () => {
      try {
        const moduleResponse = await moduleService.getModuleById(moduleId);
        if (moduleResponse?.data) {
          setModuleTitle(moduleResponse.data.title || 'Module');
        }
      } catch (error) {
        console.error('Error fetching module info:', error);
      }
    };
    
    fetchModuleInfo();
  }, [moduleId]);

  useEffect(() => {
    // Fetch sections from the API
    const fetchSections = async () => {
      try {
        setLoadingSections(true);
        
        // Get sections for this module
        const response = await sectionService.getSectionsByModule(moduleId);
        console.log('Sections response:', response);
        
        if (response && response.data) {
          // Filter for Assignment sections only
          const assignmentSections = response.data.filter(section => 
            section.type === 'Assignment'
          );
          
          // Set the filtered sections in state
          setSections(assignmentSections);
          
          // If we have a section ID from URL, pre-select it
          if (sectionIdFromUrl && assignmentSections.some(section => section._id === sectionIdFromUrl)) {
            setAssignmentData(prevData => ({
              ...prevData,
              section: sectionIdFromUrl
            }));
          } else if (assignmentSections.length > 0) {
            // Default to the first section if none is specified
            setAssignmentData(prevData => ({
              ...prevData,
              section: assignmentSections[0]._id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load sections. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoadingSections(false);
      }
    };
    
    fetchSections();
  }, [moduleId, sectionIdFromUrl]);

  // Xử lý thay đổi thông tin chung của bài tập
  const handleAssignmentDataChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData({
      ...assignmentData,
      [name]: value
    });
  };

  // Chuyển sang bước tiếp theo
  const handleNext = () => {
    // Validate dữ liệu trước khi chuyển bước
    if (activeStep === 0) {
      if (!assignmentData.title || !assignmentData.description || !assignmentData.duration || !assignmentData.section) {
        setSnackbar({
          open: true,
          message: 'Please fill in all the information',
          severity: 'error'
        });
        return;
      }
    } else if (activeStep === 1) {
      if (!assignmentData.questionText) {
        setSnackbar({
          open: true,
          message: 'Please enter the question',
          severity: 'error'
        });
        return;
      }
    }
    
    setActiveStep((prevStep)=> prevStep + 1);
  };

  // Quay lại bước trước
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  // Lưu bài tập
  const handleSaveAssignment = async () => {
    try {
      setSavingAssignment(true);
      
      // Chuẩn bị dữ liệu gửi lên API
      const assignmentDataToSend = {
        title: assignmentData.title,
        description: assignmentData.description,
        questionText: assignmentData.questionText,
        duration: Number(assignmentData.duration),
        section: assignmentData.section,
        type: "Assignment", // Thêm trường type để xác định loại
        allowFileUpload: assignmentData.allowFileUpload,
        maxFileSize: Number(assignmentData.maxFileSize),
        allowedFileTypes: assignmentData.allowedFileTypes,
      };
      
      console.log('Saving assignment...', { assignmentDataToSend });
      
      // Kiểm tra xem section đã được chọn và tồn tại chưa
      if (!assignmentData.section) {
        throw new Error('Please select a section for the assignment');
      }
      
      // Sử dụng assignmentService để tạo assignment
      const response = await assignmentService.createAssignment(assignmentDataToSend);
      
      console.log('Assignment created:', response);
      
      setSnackbar({
        open: true,
        message: 'Assignment created successfully!',
        severity: 'success'
      });
      
      // Đợi hiển thị thông báo thành công trước khi chuyển hướng
      setTimeout(() => {
        navigate(`/teacher/course/${courseId}/module/${moduleId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving assignment:', error);
      setSnackbar({
        open: true,
        message: `Error saving assignment: ${error.response?.data?.message || error.message || 'Please try again'}`,
        severity: 'error'
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  // Render nội dung dựa theo step hiện tại
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={assignmentData.title}
                  onChange={handleAssignmentDataChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={assignmentData.description}
                  onChange={handleAssignmentDataChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  type="number"
                  value={assignmentData.duration}
                  onChange={handleAssignmentDataChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="section-label">Section</InputLabel>
                  <Select
                    labelId="section-label"
                    name="section"
                    value={assignmentData.section}
                    onChange={handleAssignmentDataChange}
                    label="Section"
                  >
                    {loadingSections ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : sections.length > 0 ? (
                      sections.map((section) => (
                        <MenuItem key={section._id} value={section._id}>
                          {section.title}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No section available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Question & Instructions</Typography>
              
              <TextField
                fullWidth
                label="Question"
                name="questionText"
                value={assignmentData.questionText}
                onChange={handleAssignmentDataChange}
                multiline
                rows={5}
                required
                sx={{ mb: 3 }}
              />
            </Paper>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                border: '1px solid #e0e0e0',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" gutterBottom>{assignmentData.title}</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{assignmentData.description}</Typography>
              
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography variant="body2" sx={{ mr: 4 }}>
                  <strong>Duration:</strong> {assignmentData.duration} minutes
                </Typography>
                {sections.find(s => s._id === assignmentData.section) && (
                  <Typography variant="body2">
                    <strong>Section:</strong> {sections.find(s => s._id === assignmentData.section).title}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>Question:</Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {assignmentData.questionText}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle title="Create assignment" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'block', alignItems: 'center', mb: 4 }}>
          <BackButton
            text={moduleTitle}
            onClick={handleCancel}
          />
          <Typography variant="h4" fontWeight="bold">
            Create assignment
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? handleCancel : handleBack}
            sx={{ mr: 1 }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleSaveAssignment}
                startIcon={<SaveIcon />}
                disabled={savingAssignment}
              >
                {savingAssignment ? 'Saving...' : 'Complete and save'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default CreateAssignmentPage; 