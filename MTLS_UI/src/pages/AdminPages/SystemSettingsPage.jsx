import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/layout/admin/AdminLayout';
import { settingsService } from '../../api/services/settings.service';

const SystemSettingsPage = () => {
  // General settings state
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [timezone, setTimezone] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  
  // Security settings
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [loginAttempts, setLoginAttempts] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  
  // Storage settings
  const [maxUploadSize, setMaxUploadSize] = useState(10);
  const [allowedFileTypes, setAllowedFileTypes] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSystemSettings();
      const settings = response.data;
      
      // Nếu đã có dữ liệu, cập nhật state
      if (settings) {
        if (settings.site) {
          setSiteName(settings.site.name);
          setSiteDescription(settings.site.description);
          setAdminEmail(settings.site.adminEmail);
          setTimezone(settings.site.timezone);
          setDefaultLanguage(settings.site.defaultLanguage);
        }
        
        if (settings.security) {
          setPasswordMinLength(settings.security.passwordMinLength || 8);
          setLoginAttempts(settings.security.loginAttempts || 5);
          setSessionTimeout(settings.security.sessionTimeout || 60);
          setEnableTwoFactor(settings.security.enableTwoFactor === true);
        }
        
        if (settings.storage) {
          setMaxUploadSize(settings.storage.maxUploadSize);
          setAllowedFileTypes(settings.storage.allowedFileTypes);
        }
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
      showSnackbar('Error loading system settings', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Chuẩn bị mảng các cài đặt sẽ gửi
      const settingsToUpdate = [
        // General settings
        {
          key: 'site.name',
          value: siteName,
          type: 'string',
          description: 'The name of the site displayed in header and title',
        },
        {
          key: 'site.description',
          value: siteDescription,
          type: 'string',
          description: 'Site description used in metadata',
        },
        {
          key: 'site.adminEmail',
          value: adminEmail,
          type: 'string',
          description: 'Email address of the administrator',
        },
        {
          key: 'site.timezone',
          value: timezone,
          type: 'string',
          description: 'Default timezone for the application',
        },
        {
          key: 'site.defaultLanguage',
          value: defaultLanguage,
          type: 'string',
          description: 'Default language for the application',
        },
        
        // Security settings
        {
          key: 'security.passwordMinLength',
          value: passwordMinLength.toString(),
          type: 'number',
          description: 'Minimum length for passwords',
        },
        {
          key: 'security.loginAttempts',
          value: loginAttempts.toString(),
          type: 'number',
          description: 'Maximum number of login attempts before lockout',
        },
        {
          key: 'security.sessionTimeout',
          value: sessionTimeout.toString(),
          type: 'number',
          description: 'Session timeout in minutes',
        },
        {
          key: 'security.enableTwoFactor',
          value: enableTwoFactor.toString(),
          type: 'boolean',
          description: 'Whether two-factor authentication is enabled',
        },
        
        // Storage settings
        {
          key: 'storage.maxUploadSize',
          value: maxUploadSize.toString(),
          type: 'number',
          description: 'Maximum upload size in MB',
        },
        {
          key: 'storage.allowedFileTypes',
          value: allowedFileTypes,
          type: 'string',
          description: 'Comma-separated list of allowed file extensions',
        }
      ];
      
      // Gửi API cập nhật
      await settingsService.updateMultipleSettings(settingsToUpdate);
      
      // Show success message
      showSnackbar('System settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving system settings:', error);
      showSnackbar('Error saving system settings', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Render general settings
  const renderGeneralSettings = () => (
    <Card sx={{ mb: 4, width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LanguageIcon sx={{ mr: 1 }} /> General Settings
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Site Name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Admin Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              fullWidth
              margin="normal"
              type="email"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Site Description"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="timezone-label">Timezone</InputLabel>
              <Select
                labelId="timezone-label"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                label="Timezone"
              >
                <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</MenuItem>
                <MenuItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</MenuItem>
                <MenuItem value="Asia/Singapore">Asia/Singapore (GMT+8)</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</MenuItem>
                <MenuItem value="America/New_York">America/New_York (GMT-5)</MenuItem>
                <MenuItem value="Europe/London">Europe/London (GMT+0)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-label">Default Language</InputLabel>
              <Select
                labelId="language-label"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                label="Default Language"
              >
                <MenuItem value="vi">Vietnamese</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  // Render security settings
  const renderSecuritySettings = () => (
    <Card sx={{ mb: 4, width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} /> Security Settings
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Minimum Password Length"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 6, max: 32 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Maximum Login Attempts"
              value={loginAttempts}
              onChange={(e) => setLoginAttempts(Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 3, max: 10 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Session Timeout (minutes)"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 15, max: 1440 }}
            />
          </Grid>
          
          {/* <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableTwoFactor}
                  onChange={(e) => setEnableTwoFactor(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Two-Factor Authentication"
              sx={{ mt: 2 }}
            />
          </Grid> */}
        </Grid>
      </CardContent>
    </Card>
  );
  
  // Render storage settings
  const renderStorageSettings = () => (
    <Card sx={{ mb: 4, width: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <StorageIcon sx={{ mr: 1 }} /> Storage Settings
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Maximum Upload Size (MB)"
              value={maxUploadSize}
              onChange={(e) => setMaxUploadSize(Number(e.target.value))}
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Allowed File Types (comma separated)"
              value={allowedFileTypes}
              onChange={(e) => setAllowedFileTypes(e.target.value)}
              fullWidth
              margin="normal"
              helperText="e.g. jpg,jpeg,png,pdf,mp3,wav"
            />
          </Grid>
          
          <Grid item xs={12} md={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Current storage usage: 235.7 MB / 5.0 GB (4.7%)
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Box sx={{ p: 3, width: '100%', mx: 'auto', ml: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} /> System Settings
          </Typography>
          
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSaveSettings}
            sx={{ 
              bgcolor: '#5850EC', 
              '&:hover': { bgcolor: '#4A44C9' },
              borderRadius: '8px',
              boxShadow: 'none'
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            Configure the basic system settings below. These settings affect the overall operation of the MTLS platform.
          </Typography>
        </Alert>
        
        {/* General Settings Section */}
        {renderGeneralSettings()}
        
        {/* Security Settings Section */}
        {renderSecuritySettings()}
        
        {/* Storage Settings Section */}
        {/* {renderStorageSettings()} */}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default SystemSettingsPage; 