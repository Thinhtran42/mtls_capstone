import { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';

// Tạo context với giá trị mặc định để tránh lỗi khi sử dụng bên ngoài provider
const SnackbarContext = createContext({
  showSnackbar: () => {},
  hideSnackbar: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {}
});

// Hook để sử dụng Snackbar
export const useSnackbar = () => {
  return useContext(SnackbarContext);
};

// Provider component
export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success'); // success, error, warning, info
  const [duration, setDuration] = useState(3000);
  const [position, setPosition] = useState({
    vertical: 'bottom',
    horizontal: 'right'
  });

  const showSnackbar = (newMessage, newSeverity = 'success', newDuration = 3000, newPosition = {}) => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setDuration(newDuration);
    if (newPosition.vertical || newPosition.horizontal) {
      setPosition({ 
        vertical: newPosition.vertical || position.vertical, 
        horizontal: newPosition.horizontal || position.horizontal 
      });
    }
    setOpen(true);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  // Các hàm tiện ích
  const showSuccess = (msg, duration) => showSnackbar(msg, 'success', duration);
  const showError = (msg, duration) => showSnackbar(msg, 'error', duration);
  const showWarning = (msg, duration) => showSnackbar(msg, 'warning', duration);
  const showInfo = (msg, duration) => showSnackbar(msg, 'info', duration);

  const contextValue = {
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={hideSnackbar}
        anchorOrigin={position}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Thêm propTypes
SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default SnackbarContext; 