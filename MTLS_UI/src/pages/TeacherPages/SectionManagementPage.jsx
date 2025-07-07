import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sectionService } from '../../api/services/section.service';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { moduleService } from '../../api/services/module.service';
import { set } from 'react-hook-form';

const SectionManagementPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentSection, setCurrentSection] = useState({
    title: '',
    type: '',
    duration: 0,
    description: '',
    order: 1
  });
  const [formErrors, setFormErrors] = useState({});
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    duration: 4000
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  useEffect(() => {
    // Create fetchSections function for reuse
    const fetchSections = async () => {
      try {
        setLoading(true);

        const response = await moduleService.getModuleById(moduleId);
        console.log('Module details response:', response);

        setModuleTitle(response.data.title || 'Module has no title');

        // Fetch module details
        const moduleResponse = await moduleService.getModuleById(moduleId);
        const moduleData = moduleResponse.data;
        setModuleTitle(moduleData?.title);
        
        // Fetch sections
        const sectionsResponse = await sectionService.getSectionsByModule(moduleId);
        console.log('Sections response:', sectionsResponse);
        
        // Handle sections data
        const sectionsData = sectionsResponse.data || [];
        setSections(sectionsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Handle connection errors from baseApi
        if (error.name === 'AxiosError' && !error.response) {
          setError(error.userMessage || 'Cannot connect to API server. Please check your network connection and confirm that the API server is running.');
        } else {
          setError(error.userMessage || 'Failed to load data. Please try again later.');
        }
        
        // Show error notification
        setSnackbar({
          open: true,
          severity: 'error',
          message: error.userMessage || 'Error connecting to server. Please check your network connection.',
          duration: 6000
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSections();
  }, [moduleId, refreshTrigger]);

  useEffect(() => {
    let timer;
    if (successDialogOpen) {
      timer = setTimeout(() => {
        setSuccessDialogOpen(false);
      }, 3000); // Tự động đóng sau 3 giây
    }
    return () => clearTimeout(timer);
  }, [successDialogOpen]);
  
  const handleOpenDialog = (section = null) => {
    if (section) {
      // Chế độ chỉnh sửa - đảm bảo duration là số và tối thiểu là 1
      const editSection = {
        ...section,
        duration: Math.max(1, parseInt(section.duration || 1, 10))
      };
      setCurrentSection(editSection);
      setFormMode('edit');
    } else {
      // Chế độ thêm mới
      setCurrentSection({
        title: '',
        type: 'Lesson',
        duration: 1,  // Đặt mặc định là 1
        description: '',
        order: 1
      });
      setFormMode('add');
    }
    setIsFormOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsFormOpen(false);
    setFormErrors({});
  };
  
  const handleOpenDeleteDialog = (section, e) => {
    e.stopPropagation();
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSectionToDelete(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'order') {
      // Ensure order is a positive integer
      const numericValue = parseInt(value, 10);
      setCurrentSection(prev => ({
        ...prev,
        [name]: isNaN(numericValue) || numericValue < 1 ? 1 : numericValue
      }));
    } else if (name === 'duration') {
      // Special handling for duration field
      if (value === '') {
        // Allow empty for validation to catch
        setCurrentSection(prev => ({ ...prev, [name]: value }));
      } else {
        // Only allow positive integers
        const numericValue = value.replace(/\D/g, ''); // Remove all non-numeric characters
        setCurrentSection(prev => ({ 
          ...prev, 
          [name]: numericValue === '' ? 0 : parseInt(numericValue, 10)
        }));
      }
    } else {
      setCurrentSection({ ...currentSection, [name]: value });
    }
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!currentSection.title.trim()) {
      newErrors.title = 'Please enter a section name';
    }
    
    if (!currentSection.type) {
      newErrors.type = 'Please select a section type';
    }
    
    // Không cần validation cho duration vì nó luôn là 1 hoặc lớn hơn
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmitSection = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const sectionData = {
        ...currentSection,
        duration: Math.max(1, parseInt(currentSection.duration || 1, 10)), // Đảm bảo duration tối thiểu là 1
        module: moduleId
      };
      
      if (formMode === 'add') {
        // Create new section
        await sectionService.createSection(sectionData);
        setSnackbar({
          open: true,
          severity: 'success',
          message: 'Section created successfully'
        });
      } else {
        // Update existing section
        await sectionService.updateSection(currentSection._id, sectionData);
        setSnackbar({
          open: true,
          severity: 'success',
          message: 'Section updated successfully'
        });
      }
      
      // Close form and refresh data
      setIsFormOpen(false);
      setFormErrors({});
      setRefreshTrigger(prev => prev + 1); // Trigger data refresh
    } catch (error) {
      console.error('Error saving section:', error);
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to save section'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    
    // Cập nhật UI trước (optimistic update)
    const originalSections = [...sections];
    setSections(sections.filter(s => s._id !== sectionToDelete._id));
    
    try {
      await sectionService.deleteSection(sectionToDelete._id);
      
      // Đóng dialog xác nhận ngay lập tức
      setDeleteDialogOpen(false);
      
      // Hiển thị dialog thành công
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting section:', error);
      setSections(originalSections);
      setSnackbar({
        open: true,
        severity: 'error',
        message: error.message || 'Failed to delete section'
      });
      setDeleteDialogOpen(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/teacher/course/${courseId}/module/${moduleId}`);
  };

  // Handle closing Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <>
      <PageTitle title="Section Management" />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'block', alignItems: 'center',  mb: 2 }}>
        <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                color: "#0F62FE",
                borderColor: "#0F62FE",
                "&:hover": { bgcolor: "rgba(15, 98, 254, 0.08)" },
                textTransform: "none",
              }}
            >
              {moduleTitle}
            </Button>
          <Box>
            <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
              Section Management
            </Typography>
            {moduleTitle && (
              <Typography variant="subtitle1" color="text.secondary">
                Module: {moduleTitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Display error message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                Try Again
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Section List
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Section
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : sections.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Section Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sections.map((section) => (
                        <TableRow key={section._id}>
                          <TableCell>{section.title}</TableCell>
                          <TableCell>{section.type}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(section)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={(e) => handleOpenDeleteDialog(section, e)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  No sections available. Please add a new section.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Add/Edit Section Dialog */}
        <Dialog open={isFormOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
            {formMode === 'add' ? 'Add New Section' : 'Edit Section'}
          </DialogTitle>
          <DialogContent sx={{ pb: 2, pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{mt: 2}}>
                <TextField
                  fullWidth
                  label="Section Name"
                  name="title"
                  value={currentSection.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title || ''}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.type} required>
                  <InputLabel id="type-label">Section Type</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={currentSection.type}
                    onChange={handleInputChange}
                    label="Section Type"
                  >
                    <MenuItem value="Lesson">Lesson</MenuItem>
                    <MenuItem value="Quiz">Quiz</MenuItem>
                    <MenuItem value="Exercise">Exercise</MenuItem>
                    <MenuItem value="Assignment">Assignment</MenuItem>
                  </Select>
                  {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSection}
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: '#0F62FE',
                '&:hover': {
                  bgcolor: '#0043a8'
                }
              }}
            >
              {loading ? 'Saving...' : formMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
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
              Do you really want to delete the section{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {sectionToDelete?.title}
              </Box>
              ? All associated content will also be inaccessible. This process cannot be undone.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleCloseDeleteDialog}
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
              The section has been deleted successfully.
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
      </Box>
    </>
  );
};

export default SectionManagementPage; 