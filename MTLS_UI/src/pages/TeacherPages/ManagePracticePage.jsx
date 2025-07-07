import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';

// Dữ liệu mẫu
const samplePractices = [
  { 
    id: 1, 
    title: 'Nhận biết nốt nhạc', 
    type: 'Nhận biết', 
    difficulty: 'Dễ', 
    attempts: 156, 
    completionRate: 65,
    status: 'Đã xuất bản' 
  },
  { 
    id: 2, 
    title: 'Nhận biết khóa', 
    type: 'Nhận biết', 
    difficulty: 'Trung bình', 
    attempts: 120, 
    completionRate: 72,
    status: 'Đã xuất bản' 
  },
  { 
    id: 3, 
    title: 'Nhận biết nốt trên bàn phím', 
    type: 'Nhận biết', 
    difficulty: 'Dễ', 
    attempts: 98, 
    completionRate: 90,
    status: 'Đã xuất bản' 
  },
  { 
    id: 4, 
    title: 'Nghe và nhận biết nốt', 
    type: 'Nghe', 
    difficulty: 'Khó', 
    attempts: 75, 
    completionRate: 65,
    status: 'Bản nháp' 
  },
  { 
    id: 5, 
    title: 'Tạo giai điệu với AI', 
    type: 'AI', 
    difficulty: 'Trung bình', 
    attempts: 45, 
    completionRate: 78,
    status: 'Đã xuất bản' 
  },
];

const ManagePracticePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [practices, setPractices] = useState(samplePractices);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('');

  // Xử lý tìm kiếm
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value === '') {
      setPractices(samplePractices);
    } else {
      const filteredPractices = samplePractices.filter(practice => 
        practice.title.toLowerCase().includes(event.target.value.toLowerCase())
      );
      setPractices(filteredPractices);
    }
  };

  // Xử lý lọc theo loại
  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    if (event.target.value === '') {
      setPractices(samplePractices);
    } else {
      const filteredPractices = samplePractices.filter(practice => 
        practice.type === event.target.value
      );
      setPractices(filteredPractices);
    }
  };

  // Xử lý menu
  const handleMenuOpen = (event, practice) => {
    setAnchorEl(event.currentTarget);
    setSelectedPractice(practice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý chỉnh sửa
  const handleEdit = () => {
    handleMenuClose();
    // Chuyển đến trang chỉnh sửa với ID bài luyện tập
    navigate(`/teacher/edit-practice/${selectedPractice.id}`);
  };

  // Xử lý xóa
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Xóa bài luyện tập
    const updatedPractices = practices.filter(practice => practice.id !== selectedPractice.id);
    setPractices(updatedPractices);
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Xử lý tạo mới
  const handleCreatePractice = () => {
    navigate('/teacher/create-practice');
  };

  // Xử lý xem thống kê
  const handleViewStats = () => {
    handleMenuClose();
    navigate(`/teacher/practice-stats/${selectedPractice.id}`);
  };

  // Hàm lấy màu cho chip trạng thái
  const getStatusColor = (status) => {
    return status === 'Đã xuất bản' ? '#2e7d32' : '#ed6c02';
  };

  // Hàm lấy màu cho chip độ khó
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Dễ': return '#2e7d32';
      case 'Trung bình': return '#ed6c02';
      case 'Khó': return '#d32f2f';
      default: return '#1976d2';
    }
  };

  // Hàm lấy màu cho progress bar
  const getProgressColor = (rate) => {
    if (rate >= 80) return '#2e7d32';
    if (rate >= 60) return '#ed6c02';
    return '#d32f2f';
  };

  return (
    <>
      <PageTitle title="Quản lý luyện tập" />
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Quản lý luyện tập
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreatePractice}
            sx={{ 
              bgcolor: '#1976d2', 
              '&:hover': { bgcolor: '#1565c0' },
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              px: 2
            }}
          >
            Tạo bài luyện tập mới
          </Button>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              placeholder="Tìm kiếm bài luyện tập"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ width: '100%', maxWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px' }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150, ml: 2 }}>
                <InputLabel id="filter-type-label">Loại</InputLabel>
                <Select
                  labelId="filter-type-label"
                  id="filter-type"
                  value={filterType}
                  label="Loại"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Tất cả loại</MenuItem>
                  <MenuItem value="Nhận biết">Nhận biết</MenuItem>
                  <MenuItem value="Nghe">Nghe</MenuItem>
                  <MenuItem value="AI">AI</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên bài luyện tập</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Độ khó</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số lần thực hiện</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Điểm trung bình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {practices.map((practice) => (
                  <TableRow 
                    key={practice.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell>{practice.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={practice.type} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          color: '#1976d2',
                          fontWeight: 500,
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={practice.difficulty} 
                        size="small"
                        sx={{ 
                          bgcolor: `rgba(${getDifficultyColor(practice.difficulty).replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.1)`,
                          color: getDifficultyColor(practice.difficulty),
                          fontWeight: 500,
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell>{practice.attempts}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={practice.completionRate} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 5,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(practice.completionRate)
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">{`${practice.completionRate}%`}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={(event) => handleMenuOpen(event, practice)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Menu cho các hành động */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewStats}>
            <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
            Xem thống kê
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        </Menu>

        {/* Dialog xác nhận xóa */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn xóa bài luyện tập "{selectedPractice?.title}"? Hành động này không thể hoàn tác.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Hủy
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ManagePracticePage; 