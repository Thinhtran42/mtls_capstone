import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const EditUserInfoModal = ({ open, onClose, studentData, onChange, onSave, onAvatarChange, uploadingAvatar }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Information</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          {/* Avatar upload section */}
          <Avatar
            className="student-avatar"
            src={studentData.avatar || 'https://avatar.iran.liara.run/public/boy'}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid #fff',
              boxShadow: 2,
              mb: 2
            }}
          />
          
          {/* Image upload button */}
          <Button
            component='label'
            sx={{
              mt: 1,
              width: '60%',
              border: '2px dashed #ccc',
              color: '#a39999',
            }}
            variant='outlined'
            startIcon={<PhotoCameraIcon />}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : 'Change Photo'}
            <input
              type='file'
              hidden
              accept='image/*'
              onChange={onAvatarChange}
              disabled={uploadingAvatar}
            />
          </Button>
          
          <Typography variant="caption" sx={{ mt: 1, mb: 2, color: 'text.secondary', textAlign: 'center' }}>
            Upload a new profile picture (max 10MB)
          </Typography>
        </Box>

        <Box>
          <TextField
            fullWidth
            label="Full Name"
            name="fullname"
            value={studentData.fullname || ''}
            onChange={onChange}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={studentData.email || ''}
            onChange={onChange}
            margin="normal"
            type="email"
          />
          
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={studentData.phone || ''}
            onChange={onChange}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserInfoModal;