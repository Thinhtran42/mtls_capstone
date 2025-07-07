import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { removeVietnameseTones, getInitials, getWords } from '../../utils/stringUtils';

/**
 * Component tìm kiếm nâng cao với hỗ trợ tiếng Việt
 * - Tìm kiếm không phân biệt dấu (có thể nhập "Nguyen" để tìm "Nguyễn")
 * - Tìm kiếm theo từ khóa riêng lẻ và kết hợp
 * - Tìm kiếm theo viết tắt (chữ cái đầu của mỗi từ)
 */
const AdvancedSearch = ({ 
  placeholder = 'Tìm kiếm...', 
  onSearch, 
  debounceMs = 300,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  backgroundColor = '#f8f9fa',
  sx = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Chức năng debounce để tránh gọi tìm kiếm quá nhiều lần
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, debounceMs]);

  // Khi debounced term thay đổi, thực hiện tìm kiếm
  useEffect(() => {
    if (onSearch) {
      // Trả về cả term gốc và thông tin cần thiết cho tìm kiếm nâng cao
      onSearch({
        rawTerm: debouncedTerm,
        normalizedTerm: removeVietnameseTones(debouncedTerm.toLowerCase().trim()),
        initials: getInitials(debouncedTerm),
        words: getWords(debouncedTerm)
      });
    }
  }, [debouncedTerm]);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: backgroundColor,
            '&:hover': {
              backgroundColor: '#fff',
            },
            ...sx
          },
        }}
      />
    </Box>
  );
};

AdvancedSearch.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  debounceMs: PropTypes.number,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  backgroundColor: PropTypes.string,
  sx: PropTypes.object
};

export default AdvancedSearch; 