import { Box, Typography, Chip, Tooltip, Badge } from '@mui/material';
import { SmartToy, Info, Sync } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Component hiển thị thông tin về AI model đang được sử dụng
 */
const AIModelInfo = ({ modelName, isActive, provider, hasFallback }) => {
  // Xác định màu sắc và tooltip dựa trên nhà cung cấp
  const getProviderInfo = () => {
    switch (provider) {
      case 'deepseek':
        return {
          color: 'secondary',
          tooltip: 'Deepseek AI được sử dụng để phân tích bài làm và đưa ra nhận xét chi tiết, cá nhân hóa cho từng câu hỏi.'
        };
      case 'huggingface':
        return {
          color: 'success',
          tooltip: 'Hugging Face (miễn phí) được sử dụng để phân tích bài làm và đưa ra nhận xét chi tiết, cá nhân hóa cho từng câu hỏi.'
        };
      case 'openai':
      default:
        return {
          color: 'primary',
          tooltip: 'OpenAI GPT-4 được sử dụng để phân tích bài làm và đưa ra nhận xét chi tiết, cá nhân hóa cho từng câu hỏi.'
        };
    }
  };

  const providerInfo = getProviderInfo();
  
  // Hiển thị tên nhà cung cấp
  const getProviderName = () => {
    switch (provider) {
      case 'deepseek':
        return 'Deepseek';
      case 'huggingface':
        return 'Hugging Face';
      case 'openai':
      default:
        return 'OpenAI';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <SmartToy sx={{ mr: 1, color: isActive ? `${providerInfo.color}.main` : 'text.disabled' }} />
      <Typography variant="body2" color={isActive ? 'text.primary' : 'text.disabled'}>
        AI Feedback powered by:
      </Typography>
      {hasFallback ? (
        <Badge
          badgeContent={<Sync fontSize="small" />}
          color="success"
          overlap="circular"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          sx={{ 
            '& .MuiBadge-badge': { 
              fontSize: '0.5rem',
              width: 16,
              height: 16,
              minWidth: 16
            } 
          }}
        >
          <Chip 
            label={`${getProviderName()} ${modelName}`}
            size="small"
            color={isActive ? providerInfo.color : "default"}
            sx={{ ml: 1 }}
          />
        </Badge>
      ) : (
        <Chip 
          label={`${getProviderName()} ${modelName}`}
          size="small"
          color={isActive ? providerInfo.color : "default"}
          sx={{ ml: 1 }}
        />
      )}
      <Tooltip title={providerInfo.tooltip}>
        <Info sx={{ ml: 1, fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
      </Tooltip>
      {hasFallback && (
        <Tooltip title="Hệ thống sẽ tự động chuyển sang AI dự phòng nếu AI chính gặp lỗi">
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
              <Sync fontSize="inherit" sx={{ mr: 0.5 }} />
              Dự phòng
            </Typography>
          </Box>
        </Tooltip>
      )}
      {provider === 'huggingface' && (
        <Chip 
          label="Miễn phí" 
          size="small" 
          color="success"
          variant="outlined"
          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
        />
      )}
    </Box>
  );
};

// Định nghĩa PropTypes
AIModelInfo.propTypes = {
  modelName: PropTypes.string,
  isActive: PropTypes.bool,
  provider: PropTypes.oneOf(['openai', 'deepseek', 'huggingface']),
  hasFallback: PropTypes.bool
};

// Giá trị mặc định
AIModelInfo.defaultProps = {
  modelName: 'GPT-4',
  isActive: true,
  provider: 'openai',
  hasFallback: false
};

export default AIModelInfo; 