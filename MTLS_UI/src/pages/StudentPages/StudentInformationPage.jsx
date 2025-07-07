/* eslint-disable react/prop-types */
import {
  Box,
  Container,
  Avatar,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useState, useEffect } from 'react'
import EditUserInfoModal from '../../components/common/EditUserInfoModal'
import { userService } from '../../api'
import { s3StorageService } from '../../awsS3/s3Storage.service'

// Image resize function before upload
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            console.log('Original size:', Math.round(file.size / 1024), 'KB');
            console.log('Resized size:', Math.round(resizedFile.size / 1024), 'KB');
            
            resolve(resizedFile);
          } else {
            reject(new Error('Unable to resize image'));
          }
        }, file.type, quality);
      };
      
      img.onerror = () => {
        reject(new Error('Unable to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Unable to read file'));
    };
  });
};

const StudentInformationPage = () => {
  const [openModal, setOpenModal] = useState(false)
  const [studentData, setStudentData] = useState({
    fullname: '',
    email: '',
    phone: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  })

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Load user information from API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get user information from localStorage
        const currentUser = userService.getCurrentUser();
        
        if (!currentUser || !currentUser._id) {
          setError('User information not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Get detailed information from API
        const response = await userService.getUserById(currentUser._id);
        
        if (response && response.data) {
          const userData = response.data;
          
          // Update state with data from API
          setStudentData({
            id: userData._id,
            fullname: userData.fullname || '',
            email: userData.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar || ''
          });
        } else {
          setError('Unable to load user information');
        }
      } catch (error) {
        console.error('Error loading user information:', error)
        setError('An error occurred while loading user information')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return;
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      showSnackbar('File size too large. Maximum 10MB', 'error');
      return;
    }

    try {
      setUploadingAvatar(true)
      showSnackbar('Processing image...', 'info');
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        // Preview doesn't update state, just for display
        const previewImg = document.querySelector('.student-avatar');
        if (previewImg) {
          previewImg.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
      
      // Resize image if it's large
      let processedFile = file;
      const fileSizeInMB = file.size / (1024 * 1024);
      
      if (fileSizeInMB > 1) {
        showSnackbar(`Optimizing image (${fileSizeInMB.toFixed(2)}MB)...`, 'info');
        processedFile = await resizeImage(file, 800, 800, 0.7);
      }
      
      // Create information for upload
      const userInfo = {
        courseId: 'profile',
        title: 'Student Profile'
      };
      
      const studentInfo = {
        id: studentData.id,
        name: studentData.fullname
      };
      
      // Upload image to S3
      showSnackbar('Uploading image...', 'info');
      const uploadResult = await s3StorageService.uploadLessonImage(
        processedFile,
        userInfo,
        studentInfo
      );
      
      if (uploadResult && uploadResult.imageUrl) {
        // Update avatar URL in database
        const updateData = {
          avatar: uploadResult.imageUrl,
          phone: studentData.phone
        };
        
        await userService.updateUser(studentData.id, updateData);
        
        // Update state and localStorage
        setStudentData(prev => ({
          ...prev,
          avatar: uploadResult.imageUrl
        }));
        
        // Update localStorage
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
          userService.setCurrentUser({
            ...currentUser,
            avatar: uploadResult.imageUrl
          });
        }
        
        showSnackbar('Profile picture updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      showSnackbar('An error occurred while uploading profile picture: ' + error.message, 'error');
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Open edit information modal
  const handleEditInfo = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  // Save information after editing
  const handleSaveChanges = async () => {
    setLoading(true)
    setError(null)

    try {
      // Prepare data for update
      const updateData = {
        fullname: studentData.fullname,
        email: studentData.email,
        phone: studentData.phone
      }

      // Call API to update user information
      const response = await userService.updateUser(studentData.id, updateData)

      if (response && response.data) {
        // Update localStorage
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
          userService.setCurrentUser({
            ...currentUser,
            fullname: studentData.fullname,
            email: studentData.email,
            phone: studentData.phone
          });
        }

        showSnackbar('Information updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating information:', error)
      showSnackbar('An error occurred while updating information: ' + error.message, 'error');
    } finally {
      setLoading(false)
      setOpenModal(false)
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading && !openModal) {
    return (
      <Container
        maxWidth='lg'
        sx={{
          mt: 2,
          minHeight: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container
      maxWidth='lg'
      sx={{
        mt: 2,
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ width: '100%', mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          p: 3,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 1,
          width: '100%',
        }}
      >
        {/* Avatar Section */}
        <Box
          sx={{
            flex: '0 0 300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              className="student-avatar"
              src={studentData.avatar || 'https://avatar.iran.liara.run/public/boy'}
              sx={{
                width: 200,
                height: 200,
                border: '4px solid #fff',
                boxShadow: 2,
              }}
            />
          </Box>
        </Box>

        {/* Personal Information Section */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 6, mb: 3 }}>
            <Typography
              variant='h6'
              sx={{ mb: 1, pr: 1, pl: 1 }}
            >
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <InfoItem
                label='Full Name'
                value={studentData.fullname}
              />
              <InfoItem
                label='Email'
                value={studentData.email}
              />
              <InfoItem
                label='Phone Number'
                value={studentData.phone}
              />
            </Box>
            <Button
              variant='outlined'
              startIcon={<EditIcon sx={{ fontSize: 20 }} />}
              sx={{
                mt: 2,
                px: 3,
                py: 1,
                borderRadius: '50px',
                borderColor: '#000',
                color: '#000',
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  borderColor: '#000',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
              onClick={handleEditInfo}
            >
              Edit
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Edit information modal */}
      <EditUserInfoModal
        open={openModal}
        onClose={handleCloseModal}
        studentData={studentData}
        onChange={handleInputChange}
        onSave={handleSaveChanges}
        onAvatarChange={handleAvatarUpload}
        uploadingAvatar={uploadingAvatar}
      />

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

// Component to display each information item
const InfoItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography
      variant='body2'
      color='text.secondary'
    >
      {label}
    </Typography>
    <Typography variant='body1'>{value || "No information available"}</Typography>
  </Box>
)

export default StudentInformationPage
