import React from 'react';
import { Snackbar as MuiSnackbar, Alert } from '@mui/material';

/**
 * Component Snackbar tùy chỉnh để hiển thị thông báo trong ứng dụng
 * @param {Object} props - Component props
 * @param {boolean} props.open - Trạng thái mở của snackbar
 * @param {string} props.message - Nội dung thông báo
 * @param {string} props.severity - Loại thông báo (success, error, warning, info)
 * @param {Function} props.onClose - Hàm xử lý khi đóng snackbar
 * @param {number} props.autoHideDuration - Thời gian tự động đóng (ms)
 * @param {Object} props.anchorOrigin - Vị trí hiển thị snackbar
 */
const Snackbar = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' }
}) => {
  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert 
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar; 