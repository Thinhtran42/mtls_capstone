import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { userService } from '../../api/services/user.service';
import { s3StorageService } from '../../awsS3/s3Storage.service';
import PageTitle from '../../components/common/PageTitle';
import { TinyMCEEditor } from "../../components/common/TinyMCEEditor";

const TeacherProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch teacher data from API
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        // Get current user from localStorage
        const currentUser = userService.getCurrentUser();
        
        if (!currentUser || !currentUser._id) {
          setError('User information not found. Please log in again.');
          return;
        }
        
        // Fetch user details from API
        const response = await userService.getUserById(currentUser._id);
        
        if (response && response.data) {
          const userData = response.data;
          
          // Transform API data to match profile structure
          const profileData = {
            id: userData._id,
            name: userData.fullname || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            experience: userData.experience || '',
            specialization: userData.specialization || '',
            about: userData.about || '',
            avatar: userData.avatar || '',
            courses: userData.courses || []
          };
          
          setProfile(profileData);
          setOriginalProfile(profileData); // Keep original data for cancel operation
        } else {
          setError('Could not retrieve teacher profile data');
        }
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError('Failed to load profile: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Kiểm tra kích thước trước khi resize
        const fileSizeInMB = file.size / (1024 * 1024);
        
        // Hiển thị preview ngay lập tức
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Thông báo nếu file lớn
        if (fileSizeInMB > 5) {
          showSnackbar(`File size (${fileSizeInMB.toFixed(2)}MB) is large. Resizing...`, 'info');
        }
        
        // Resize ảnh nếu kích thước lớn
        let processedFile = file;
        if (fileSizeInMB > 1) {
          processedFile = await resizeImage(file, 800, 800, 0.7);
        }
        
        setAvatarFile(processedFile);
      } catch (err) {
        console.error('Error processing image:', err);
        showSnackbar('Error processing image: ' + err.message, 'error');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      // Tạo FileReader để đọc file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        // Tạo Image element để xử lý
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Tính toán kích thước mới với tỷ lệ khung hình giữ nguyên
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
          
          // Tạo canvas để vẽ ảnh với kích thước mới
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Vẽ ảnh lên canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển canvas thành file mới
          canvas.toBlob((blob) => {
            if (blob) {
              // Tạo file mới từ blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              
              // Log kích thước trước và sau khi resize
              console.log('Original size:', Math.round(file.size / 1024), 'KB');
              console.log('Resized size:', Math.round(resizedFile.size / 1024), 'KB');
              console.log('Dimensions:', width, 'x', height);
              
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          }, file.type, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    try {
      setUploadingAvatar(true);
      
      // Kiểm tra kích thước cuối cùng
      const fileSizeInMB = avatarFile.size / (1024 * 1024);
      if (fileSizeInMB > 2) {
        const resizedFile = await resizeImage(avatarFile, 600, 600, 0.6);
        console.log(`Image resized from ${fileSizeInMB.toFixed(2)}MB to ${(resizedFile.size / (1024 * 1024)).toFixed(2)}MB`);
        setAvatarFile(resizedFile);
      }
      
      // Prepare user info for upload
      const teacherInfo = {
        id: profile.id,
        name: profile.name
      };
      
      // Prepare course info (can use placeholder values)
      const userInfo = {
        courseId: 'profile',
        title: 'Teacher Profile'
      };
      
      // Upload avatar to S3
      const uploadResult = await s3StorageService.uploadLessonImage(
        avatarFile,
        userInfo,
        teacherInfo
      );
      
      // Return the URL from the upload
      return uploadResult.imageUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      showSnackbar('Error uploading avatar: ' + err.message, 'error');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Upload avatar if there's a new one
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      // Prepare data for update - đảm bảo trường đúng với DTO backend
      const updateData = {
        fullname: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role || 'teacher',
        isActive: true,
        avatar: avatarUrl,
        experience: profile.experience,
        address: profile.address,
        specialization: profile.specialization,
        about: profile.about,
        updateAt: new Date().toISOString()
      };
      
      console.log('Sending update data:', updateData);
      
      // Call API to update user data
      const response = await userService.updateUser(profile.id, updateData);
      console.log('Update response:', response);
      
      // Update local storage user data
      const currentUser = userService.getCurrentUser();
      if (currentUser) {
        userService.setCurrentUser({
          ...currentUser,
          fullname: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          experience: profile.experience,
          specialization: profile.specialization,
          about: profile.about,
          avatar: avatarUrl
        });
      }
      
      setIsEditing(false);
      setAvatarFile(null);
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar('Failed to update profile: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    setProfile({...originalProfile});
    setIsEditing(false);
    setAvatarPreview('');
    setAvatarFile(null);
  };

  if (loading && !profile) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Profile not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <PageTitle title="Personal Information" />
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Personal Information
            </Typography>
            {!isEditing ? (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  color="primary"
                  disabled={loading || uploadingAvatar}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  onClick={handleCancel}
                  color="error"
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                  src={avatarPreview || profile.avatar}
                >
                  {profile.name?.charAt(0)}
                </Avatar>
                {isEditing && (
                  <Button
                    component="label"
                    startIcon={uploadingAvatar ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
                    variant="outlined"
                    size="small"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    <input 
                      hidden 
                      accept="image/*" 
                      type="file"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </Button>
                )}
                
                <Card sx={{ width: '100%', mt: 10, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Specialization
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.specialization && profile.specialization.split(',').map((skill, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            bgcolor: '#f0f7ff', 
                            color: '#0F62FE',
                            borderRadius: '16px',
                            px: 2,
                            py: 0.75,
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        >
                          {skill.trim()}
                        </Box>
                      ))}
                      {!profile.specialization && (
                        <Typography variant="body2" color="text.secondary">
                          No specialization information available
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
                
                {/* <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contributed Courses
                    </Typography>
                    {profile.courses && profile.courses.length > 0 ? (
                      <List>
                        {profile.courses.map((course, index) => (
                          <div key={course.id || index}>
                            <ListItem>
                              <ListItemText primary={course.name || course.title} />
                            </ListItem>
                            {index < profile.courses.length - 1 && <Divider />}
                          </div>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No courses yet
                      </Typography>
                    )}
                  </CardContent>
                </Card> */}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Experience"
                    name="experience"
                    value={profile.experience || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={profile.address || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    value={profile.specialization || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    helperText="Enter specializations, separated by commas"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>About</Typography>
                  {isEditing ? (
                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                      <TinyMCEEditor
                        initialValue={profile.about || ''}
                        onEditorChange={(content) => {
                          setProfile(prev => ({
                            ...prev,
                            about: content
                          }));
                        }}
                      />
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #eee', 
                        borderRadius: 1, 
                        minHeight: '100px',
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& a': { color: '#0F62FE', textDecoration: 'underline' },
                        '& ul, & ol': { paddingLeft: 3, marginBottom: 2 },
                        '& p': { marginBottom: 2 },
                        '& h1, & h2, & h3, & h4, & h5, & h6': { marginTop: 2, marginBottom: 1 },
                      }} 
                      dangerouslySetInnerHTML={{ __html: profile.about || '<p>No information provided</p>' }}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Thông báo snackbar */}
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
    </>
  );
};

export default TeacherProfilePage;