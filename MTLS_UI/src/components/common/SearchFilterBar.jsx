import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Grid, 
  TextField, 
  MenuItem, 
  Paper, 
  Box, 
  IconButton 
} from '@mui/material';
import { 
  GridView as GridViewIcon, 
  ViewList as ListViewIcon, 
  Sort as SortIcon 
} from '@mui/icons-material';
import AdvancedSearch from './AdvancedSearch';

/**
 * Component thanh tìm kiếm và lọc kết hợp
 * Bao gồm:
 * - Tìm kiếm nâng cao hỗ trợ tiếng Việt
 * - Bộ lọc tùy chỉnh
 * - Tùy chọn sắp xếp và chế độ xem (grid/list)
 */
const SearchFilterBar = ({
  onSearch,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterOptions = [],
  sortOptions = [],
  enableViewModeSwitch = true,
  initialValues = {
    filters: {},
    sortBy: '',
    sortDirection: 'asc',
    viewMode: 'grid'
  }
}) => {
  // State quản lý các giá trị lọc
  const [filters, setFilters] = useState(initialValues.filters || {});
  const [sortBy, setSortBy] = useState(initialValues.sortBy || '');
  const [sortDirection, setSortDirection] = useState(initialValues.sortDirection || 'asc');
  const [viewMode, setViewMode] = useState(initialValues.viewMode || 'grid');

  // Xử lý tìm kiếm nâng cao
  const handleSearch = (searchData) => {
    if (onSearch) {
      onSearch(searchData);
    }
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (newSortBy) => {
    // Nếu chọn cùng một loại, đảo chiều sắp xếp
    if (sortBy === newSortBy) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      
      if (onSortChange) {
        onSortChange({ sortBy, direction: newDirection });
      }
    } else {
      // Nếu chọn loại mới, sắp xếp theo chiều mặc định
      setSortBy(newSortBy);
      
      if (onSortChange) {
        onSortChange({ sortBy: newSortBy, direction: sortDirection });
      }
    }
  };

  // Xử lý thay đổi chế độ xem
  const handleViewModeChange = () => {
    const newViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newViewMode);
    
    if (onViewModeChange) {
      onViewModeChange(newViewMode);
    }
  };

  // Áp dụng các giá trị ban đầu khi component được tạo
  useEffect(() => {
    if (initialValues && onFilterChange) {
      onFilterChange(initialValues.filters || {});
    }
    
    if (initialValues && initialValues.sortBy && onSortChange) {
      onSortChange({
        sortBy: initialValues.sortBy,
        direction: initialValues.sortDirection || 'asc'
      });
    }
    
    if (initialValues && initialValues.viewMode && onViewModeChange) {
      onViewModeChange(initialValues.viewMode);
    }
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Thanh tìm kiếm */}
        <Grid item xs={12} md={4}>
          <AdvancedSearch
            placeholder={searchPlaceholder}
            onSearch={handleSearch}
          />
        </Grid>

        {/* Các bộ lọc */}
        {filterOptions.map((filterOption, index) => (
          <Grid item xs={12} md={filterOption.width || 2} key={index}>
            <TextField
              select
              fullWidth
              value={filters[filterOption.name] || filterOption.defaultValue || 'all'}
              onChange={(e) => handleFilterChange(filterOption.name, e.target.value)}
              label={filterOption.label}
              size="medium"
            >
              <MenuItem value="all">{filterOption.allLabel || `Tất cả ${filterOption.label}`}</MenuItem>
              {filterOption.options.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ))}

        {/* Sắp xếp */}
        {sortOptions.length > 0 && (
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              value={sortBy || (sortOptions[0] && sortOptions[0].value) || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              label="Sắp xếp theo"
              InputProps={{
                startAdornment: (
                  <SortIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                  {sortBy === option.value && (
                    <span style={{ marginLeft: '8px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      ({sortDirection === 'asc' ? '↑' : '↓'})
                    </span>
                  )}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Chuyển đổi chế độ xem */}
        {enableViewModeSwitch && (
          <Grid item xs={12} md={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={handleViewModeChange}
                sx={{
                  backgroundColor: theme => theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.dark,
                  },
                }}
              >
                {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
              </IconButton>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

SearchFilterBar.propTypes = {
  onSearch: PropTypes.func,
  onFilterChange: PropTypes.func,
  onSortChange: PropTypes.func,
  onViewModeChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.number,
      defaultValue: PropTypes.string,
      allLabel: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ),
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  enableViewModeSwitch: PropTypes.bool,
  initialValues: PropTypes.shape({
    filters: PropTypes.object,
    sortBy: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    viewMode: PropTypes.oneOf(['grid', 'list'])
  })
};

export default SearchFilterBar; 