import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff, Settings, SmartToy, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * AI Configuration Page for administrators - Read-only display of environment variables
 */
const AIConfigPage = () => {
  // State for displaying API key and test results
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const navigate = useNavigate();

  // State to store environment variable values (for display only)
  const [envApiKey, setEnvApiKey] = useState('');
  const [envModel, setEnvModel] = useState('');
  const [envApiUrl, setEnvApiUrl] = useState('');

  // Load configuration from environment variables when component mounts
  useEffect(() => {
    try {
      // Get environment variables using the same priority as AIFeedbackService
      const getEnvVariable = (key, defaultValue = '') => {
        if (window && window._env_ && window._env_[key]) {
          return window._env_[key];
        }
        
        if (window && window.env && window.env[key]) {
          return window.env[key];
        }
        
        if (import.meta && import.meta.env && import.meta.env[key]) {
          return import.meta.env[key];
        }
        
        return defaultValue;
      };

      // Get environment variables for display
      const apiKey = getEnvVariable('REACT_APP_OPENAI_API_KEY', '');
      const model = getEnvVariable('REACT_APP_OPENAI_MODEL', 'gpt-4o');
      const apiUrl = getEnvVariable('REACT_APP_OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions');

      // Mask the API key for security
      const maskedKey = apiKey.length > 8 
        ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
        : '****';

      setEnvApiKey(maskedKey);
      setEnvModel(model);
      setEnvApiUrl(apiUrl);
    } catch (error) {
      console.error('Error loading AI config from environment:', error);
      setSnackbarMessage('Error loading AI configuration from environment!');
      setSnackbarOpen(true);
    }
  }, []);

  /**
   * Check if the API key has a valid format
   * 
   * @param {string} apiKey - The API key to check
   * @returns {boolean} - Whether the API key has a valid format
   */
  const isValidApiKeyFormat = (apiKey) => {
    // OpenAI API keys typically start with "sk-" and are 51 characters long
    return typeof apiKey === 'string' && 
           apiKey.startsWith('sk-') && 
           apiKey.length >= 40;
  };

  const testOpenAIConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      // Get the actual API key from environment variables
      const getEnvVariable = (key, defaultValue = '') => {
        if (window && window._env_ && window._env_[key]) {
          return window._env_[key];
        }
        
        if (window && window.env && window.env[key]) {
          return window.env[key];
        }
        
        if (import.meta && import.meta.env && import.meta.env[key]) {
          return import.meta.env[key];
        }
        
        return defaultValue;
      };

      const apiKey = getEnvVariable('REACT_APP_OPENAI_API_KEY', '');
      
      // Check if the API key has a valid format before making the API call
      if (!isValidApiKeyFormat(apiKey)) {
        setTestResult({
          success: false,
          message: 'Invalid API key format in environment variable. OpenAI API keys should start with "sk-" and be at least 40 characters long.'
        });
        setIsTestingConnection(false);
        return;
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.data) {
        setTestResult({
          success: true,
          message: 'OpenAI connection successful! API key from environment is valid.'
        });
      } else {
        setTestResult({
          success: false,
          message: `Connection error: ${data.error?.message || 'Invalid API key in environment'}`
        });
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      setTestResult({
        success: false,
        message: `Connection error: ${error.message}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Render the OpenAI configuration section
  const renderOpenAIConfig = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          OpenAI Configuration (Environment Variables)
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            This page shows the current environment variable configuration for OpenAI integration.
            To change these values, update your environment variables or .env file.
          </Typography>
        </Alert>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Important: Environment Variable Setup
          </Typography>
          <Typography variant="body2">
            Make sure your environment variables are correctly set in your deployment environment:
          </Typography>
          <Typography component="ul" variant="body2" sx={{ mt: 1 }}>
            <li>REACT_APP_OPENAI_API_KEY: Your OpenAI API key</li>
            <li>REACT_APP_OPENAI_MODEL: The model to use (default: gpt-4o)</li>
            <li>REACT_APP_OPENAI_API_URL: API endpoint URL</li>
          </Typography>
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            API Key from Environment:
          </Typography>
          <TextField
            value={envApiKey}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    edge="end"
                  >
                    {showApiKeys ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="This is the masked API key from your environment variables"
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Model from Environment:
          </Typography>
          <TextField
            value={envModel}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
            helperText="The OpenAI model configured in your environment variables"
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            API URL from Environment:
          </Typography>
          <TextField
            value={envApiUrl}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
            helperText="The API endpoint URL configured in your environment variables"
          />
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            GPT-4o có thể phân tích hình ảnh, PDF và các tệp tin có nội dung trực quan.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Đây là model mới nhất của OpenAI, cho phép phản hồi chi tiết về bản nhạc, sơ đồ và các nội dung trực quan khác trong bài tập.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Hệ thống đã được cấu hình để cung cấp phản hồi bằng tiếng Việt, giúp học viên dễ dàng hiểu và áp dụng.
          </Typography>
        </Alert>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Settings sx={{ mr: 1 }} /> OpenAI GPT-4 Configuration
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <SmartToy sx={{ mr: 1 }} /> OpenAI Configuration
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderOpenAIConfig()}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={testOpenAIConnection}
            disabled={isTestingConnection}
          >
            Test OpenAI Connection
          </Button>
        </Box>

        {/* Test result display */}
        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {testResult.message}
          </Alert>
        )}
      </Paper>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            OpenAI GPT-4o Environment Setup Guide
          </Typography>
          <Typography variant="body2" paragraph>
            Hệ thống hiện được cấu hình để sử dụng OpenAI GPT-4o cho phản hồi AI. Để cấu hình:
          </Typography>
          <Typography component="ol" variant="body2">
            <li>Lấy API key từ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">nền tảng OpenAI</a></li>
            <li><strong>Quan trọng:</strong> Khi tạo API key, đảm bảo bạn chọn <strong>&quot;Create new secret key&quot;</strong> với <strong>no scope restrictions</strong> để cho phép các yêu cầu suy luận</li>
            <li>Thêm các biến môi trường sau vào file .env của bạn:</li>
            <li><code>REACT_APP_OPENAI_API_KEY=sk-your-api-key</code></li>
            <li><code>REACT_APP_OPENAI_MODEL=gpt-4o</code></li>
            <li><code>REACT_APP_OPENAI_API_URL=https://api.openai.com/v1/chat/completions</code></li>
          </Typography>
          <Typography variant="body2" paragraph sx={{ mt: 1 }}>
            <strong>Note:</strong> Using OpenAI&apos;s API will incur charges based on your usage. Please check OpenAI&apos;s pricing page for current rates.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Troubleshooting Common Issues
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            &quot;Your API key doesn&apos;t have permission to make inference requests&quot;
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This error occurs when your API key has scope restrictions. To fix it:
          </Typography>
          <Typography component="ol" variant="body2" sx={{ pl: 2, mb: 2 }}>
            <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
            <li>Click &quot;Create new secret key&quot;</li>
            <li>Give it a name (e.g., &quot;MTLS App&quot;)</li>
            <li>Important: Select &quot;No scope restrictions&quot; (this is required for our app)</li>
            <li>Copy the new key and update your environment variable</li>
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            &quot;Invalid API key&quot;
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This error occurs when your API key is not recognized. Check that:
          </Typography>
          <Typography component="ul" variant="body2" sx={{ pl: 2, mb: 2 }}>
            <li>You&apos;ve copied the entire key correctly (it should start with &quot;sk-&quot;)</li>
            <li>The key is still active (not expired or revoked)</li>
            <li>There are no extra spaces before or after the key</li>
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
            &quot;Quota exceeded&quot; or &quot;Rate limit exceeded&quot;
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            These errors occur when you&apos;ve reached your usage limits. To fix them:
          </Typography>
          <Typography component="ul" variant="body2" sx={{ pl: 2, mb: 2 }}>
            <li>Check your <a href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">billing status</a></li>
            <li>Ensure you have a payment method set up at <a href="https://platform.openai.com/account/billing/payment-methods" target="_blank" rel="noopener noreferrer">payment methods</a></li>
            <li>If you&apos;re on a free tier, consider upgrading to a paid account</li>
            <li>For rate limits, wait a few minutes between requests</li>
            <li>Check your <a href="https://platform.openai.com/account/limits" target="_blank" rel="noopener noreferrer">rate limits</a> to understand your current usage</li>
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', color: 'warning.main' }}>
            About OpenAI Free Tier
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            New OpenAI accounts receive a $5 credit that expires after 3 months. After that, you need to add a payment method to continue using the API. GPT-4 usage costs approximately $0.01-0.03 per feedback generation.
          </Typography>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 4 }}
      >
        Back
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default AIConfigPage; 