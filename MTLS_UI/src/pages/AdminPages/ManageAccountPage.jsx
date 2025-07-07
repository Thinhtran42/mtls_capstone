import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Snackbar,
  Alert,
  InputBase,
  TableSortLabel,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Close as CloseIcon, Block as BlockIcon, CloudUpload as CloudUploadIcon, Search as SearchIcon, CheckCircleOutline as CheckCircleOutlineIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { useUsers } from "../../contexts/UserContext";
import { userService } from "../../api/services/user.service";

const studyTimeData = {
  'T2': 2.5,
  'T3': 1.5,
  'T4': 3,
  'T5': 2,
  'T6': 4,
  'T7': 1,
  'CN': 0.5
};

export default function ManageAccountPage() {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const navigate = useNavigate();
  const { blockUser, updateUser, addUser } = useUsers();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [orderBy, setOrderBy] = React.useState('name');
  const [order, setOrder] = React.useState('asc');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState({
    name: '',
    email: '',
    gender: '',
    phone: '',
    address: '',
    role: 'Teacher',
    avatar: null,
    experience: '',
    specialization: '',
    about: ''
  });
  
  // Add state for users and loading
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state for filters
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllUsers();
        
        if (response && response.data && response.data.users) {
          // Sửa lại để chỉ lấy các active users
          const formattedUsers = response.data.users
            .filter(user => user.isActive === true) // Chỉ lấy active users
            .map(user => ({
              id: user._id,
              name: user.fullname,
              email: user.email,
              role: user.role === 'teacher' ? 'Teacher' : 
                    user.role === 'admin' ? 'Admin' : 'Student',
              gender: user.gender || '',
              avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
              status: user.isActive ? 'active' : 'inactive',
              phone: user.phone || '',
              address: user.address || '',
              experience: user.experience || '',
              specialization: user.specialization || '',
              about: user.about || ''
            }));
          setUsers(formattedUsers);
        } else if (response && response.users && Array.isArray(response.users)) {
          // Nếu response.users là mảng
          const formattedUsers = response.users
            .filter(user => user.isActive === true) // Chỉ lấy active users
            .map(user => ({
              id: user._id,
              name: user.fullname,
              email: user.email,
              role: user.role === 'teacher' ? 'Teacher' : 
                    user.role === 'admin' ? 'Admin' : 'Student',
              gender: user.gender || '',
              avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
              status: user.isActive ? 'active' : 'inactive',
              phone: user.phone || '',
              address: user.address || '',
              experience: user.experience || '',
              specialization: user.specialization || '',
              about: user.about || ''
            }));
          setUsers(formattedUsers);
        } else {
          // Nếu không tìm thấy mảng users
          console.error("Không tìm thấy mảng users trong response:", response);
          throw new Error("Cấu trúc dữ liệu không đúng");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Hiển thị thông báo lỗi cụ thể hơn dựa trên loại lỗi
        let errorMessage = 'Failed to load users. Please try again later.';
        if (error.isConnectionError) {
          errorMessage = 'Cannot connect to server. Please check if the backend server is running.';
        } else if (error.userMessage) {
          errorMessage = error.userMessage;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNavigateToBlockList = () => {
    navigate('/admin/blocked-users');
  };

  const handleBlock = async (userId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      
      console.log(`Deactivating user with ID: ${userId}`);
      
      // Gọi API để deactivate user và đợi kết quả trả về
      const response = await userService.toggleUserStatus(userId, false);
      console.log("API response:", response);
      
      // Chỉ cập nhật state sau khi API thành công
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'inactive' } 
            : user
        )
      );
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'User has been deactivated successfully!',
        severity: 'success'
      });
      
      // Đóng dialog nếu đang mở
      handleCloseDialog();
    } catch (err) {
      console.error("Error deactivating user:", err);
      
      // Hiển thị thông báo lỗi
      let errorMessage = 'Error occurred while deactivating user!';
      
      if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      
      // Gọi API để activate user
      await userService.toggleUserStatus(userId, true);
      
      // Cập nhật state sau khi thành công
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: 'active' } 
            : user
        )
      );
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'User has been activated successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error("Error activating user:", err);
      
      setSnackbar({
        open: true,
        message: 'Error occurred while activating user!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (user) => {
    setEditFormData({
      name: user.name,
      email: user.email,
      gender: user.gender || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
      avatar: null,
      experience: user.experience || '',
      specialization: user.specialization || '',
      about: user.about || ''
    });
    setAvatarPreview(user.avatar);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditFormData(null);
    setAvatarPreview(null);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        avatar: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!editFormData.name || !editFormData.email || !editFormData.phone) {
        setSnackbar({
          open: true,
          message: 'Please fill in required fields (Name, Email, Phone)',
          severity: 'error'
        });
        return;
      }

      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (key === 'avatar' && editFormData[key]) {
          formData.append('avatar', editFormData[key]);
        } else if (editFormData[key]) {
          formData.append(key, editFormData[key]);
        }
      });

      // Xử lý avatar
      let avatarUrl = avatarPreview;
      if (editFormData.avatar) {
        // TODO: Upload ảnh lên server và nhận về URL
        // avatarUrl = await uploadImage(formData.get('avatar'));
      }

      // Cập nhật thông tin người dùng với API
      const userData = {
        fullname: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        gender: editFormData.gender,
        address: editFormData.address,
        role: 'teacher', // Đảm bảo luôn là teacher
        avatar: avatarUrl,
        experience: editFormData.experience || '',
        specialization: editFormData.specialization || '',
        about: editFormData.about || '',
        updateAt: new Date().toISOString()
      };
      
      // Gọi API cập nhật (nếu có)
      // const apiResponse = await userService.updateUser(selectedUser.id, userData);
      
      // Cập nhật state với thông tin đã chỉnh sửa
      const updatedData = {
        name: editFormData.name,
        email: editFormData.email,
        gender: editFormData.gender,
        phone: editFormData.phone,
        address: editFormData.address,
        role: 'Teacher',
        avatar: avatarUrl,
        experience: editFormData.experience || '',
        specialization: editFormData.specialization || '',
        about: editFormData.about || ''
      };

      // Gọi hàm từ context để cập nhật user
      updateUser(selectedUser.id, updatedData);
      
      setSnackbar({
        open: true,
        message: 'Teacher information updated successfully!',
        severity: 'success'
      });
      
      // Cập nhật selectedUser với thông tin mới
      setSelectedUser(prev => ({
        ...prev,
        ...updatedData
      }));
      
      // Đóng dialog chỉnh sửa và mở lại dialog thông tin chi tiết
      handleCloseEditDialog();
      setOpenDialog(true);
    } catch (err) {
      console.error("Error updating teacher:", err);
      
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Error occurred while updating information!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = React.useMemo(() => {
    const comparator = (a, b) => {
      if (order === 'asc') {
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return b[orderBy] < a[orderBy] ? -1 : 1;
      }
    };

    // Lọc theo tìm kiếm, vai trò và trạng thái, loại trừ Admin
    const filteredUsers = users.filter(user => {
      // Loại bỏ người dùng có role là Admin
      if (user.role === 'Admin') {
        return false;
      }
      
      // Kiểm tra điều kiện tìm kiếm
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Kiểm tra điều kiện lọc role
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      
      // Kiểm tra điều kiện lọc status
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      // Trả về true nếu thỏa mãn tất cả điều kiện
      return matchesSearch && matchesRole && matchesStatus;
    });

    return [...filteredUsers].sort(comparator);
  }, [users, order, orderBy, searchQuery, roleFilter, statusFilter]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewUserData({
      name: '',
      email: '',
      gender: '',
      phone: '',
      address: '',
      role: 'Teacher',
      avatar: null,
      experience: '',
      specialization: '',
      about: ''
    });
  };

  const handleAddUserSubmit = async () => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!newUserData.name || !newUserData.email || !newUserData.phone) {
        setSnackbar({
          open: true,
          message: 'Please fill in required fields (Name, Email, Phone)',
          severity: 'error'
        });
        return;
      }

      // Tạo mật khẩu mặc định - có thể thay đổi sau
      const defaultPassword = "Password123";

      // Format data for API theo đúng cấu trúc yêu cầu
      const userData = {
        fullname: newUserData.name,
        email: newUserData.email,
        password: defaultPassword,
        phone: newUserData.phone,
        role: 'teacher', // Luôn là teacher, không phải admin
        isActive: true,
        gender: newUserData.gender,
        address: newUserData.address,
        avatar: newUserData.avatar || `https://avatar.iran.liara.run/public/boy`,
        experience: newUserData.experience || '',
        specialization: newUserData.specialization || '',
        about: newUserData.about || '',
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString()
      };
      
      // Gọi API để tạo người dùng mới
      const apiResponse = await userService.createUser(userData);
      
      console.log("API Response:", apiResponse);
      
      // Nếu API trả về thành công, cập nhật state của ứng dụng
      if (apiResponse) {
        // Kiểm tra các giá trị từ API trước khi sử dụng
        const newUser = {
          id: apiResponse._id || apiResponse.id || `temp-${Date.now()}`,
          name: apiResponse.fullname || newUserData.name || '',
          email: apiResponse.email || newUserData.email || '',
          role: 'Teacher',
          gender: apiResponse.gender || newUserData.gender || '',
          avatar: apiResponse.avatar || newUserData.avatar || null,
          status: 'active',
          phone: apiResponse.phone || newUserData.phone || '',
          address: apiResponse.address || newUserData.address || '',
          experience: apiResponse.experience || newUserData.experience || '',
          specialization: apiResponse.specialization || newUserData.specialization || '',
          about: apiResponse.about || newUserData.about || ''
        };
        
        // Cập nhật danh sách người dùng
        setUsers(prev => [...prev, newUser]);
        
        setSnackbar({
          open: true,
          message: 'Teacher account created successfully!',
          severity: 'success'
        });
        
        // Đóng dialog
        handleCloseAddDialog();
      }
    } catch (err) {
      console.error("Error adding teacher:", err);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Error occurred while adding teacher account!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  return (
    <AdminLayout>
      {/* Show loading indicator if data is being fetched */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            width: "80%",
            mt: 8,
            ml: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Title */}
            <Typography 
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: '1.75rem',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              User List
            </Typography>

            {/* Actions Row */}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Left side: Search Box */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  width: '320px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#E5E7EB',
                  },
                }}
              >
                <SearchIcon sx={{ color: '#6B7280', mr: 1 }} />
                <InputBase
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ 
                    width: '100%',
                    '& input': {
                      padding: '0',
                      fontSize: '0.875rem',
                    }
                  }}
                />
              </Box>

              {/* Middle: Filters */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                flexGrow: 1,
                justifyContent: 'center'
              }}>
                {/* Role Filter */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#64748B' }}>
                    Role
                  </Typography>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    displayEmpty
                    variant="outlined"
                    sx={{ 
                      height: '40px',
                      minWidth: 120,
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      transform: 'translateY(-2px)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4F46E5',
                      },
                      '& .MuiSelect-select': {
                        paddingTop: '8px',
                        paddingBottom: '8px',
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All">All Roles</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                  </Select>
                </Box>

                {/* Status Filter */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#64748B' }}>
                    Status
                  </Typography>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    variant="outlined"
                    sx={{ 
                      height: '40px',
                      minWidth: 120,
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      transform: 'translateY(-2px)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CBD5E1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4F46E5',
                      },
                      '& .MuiSelect-select': {
                        paddingTop: '8px',
                        paddingBottom: '8px',
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        }
                      }
                    }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Right side: Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<BlockIcon />}
                  onClick={handleNavigateToBlockList}
                  sx={{
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    '&:hover': {
                      borderColor: '#DC2626',
                      backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    },
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                  }}
                >
                  Deactivate List
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  sx={{
                    backgroundColor: "#4F46E5",
                    "&:hover": {
                      backgroundColor: "#4338CA",
                    },
                    borderRadius: "10px",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Add Account
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Table Section */}
          <TableContainer 
            component={Paper}
            sx={{
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            <Table
              sx={{
                minWidth: 650,
                borderCollapse: 'separate',
                borderSpacing: '0 12px', // Thêm khoảng cách giữa các rows
                '& .MuiTableCell-root': {
                  borderBottom: 'none', // Xóa border mặc định
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#F9FAFB',
                    '& th': {
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#374151',
                      padding: '16px 24px',
                      borderBottom: '2px solid #E5E7EB',
                    },
                  }}
                >
                  <TableCell width="25%">
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Full Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="25%">
                    <TableSortLabel
                      active={orderBy === 'email'}
                      direction={orderBy === 'email' ? order : 'asc'}
                      onClick={() => handleRequestSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%">
                    <TableSortLabel
                      active={orderBy === 'role'}
                      direction={orderBy === 'role' ? order : 'asc'}
                      onClick={() => handleRequestSort('role')}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%">
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="10%" align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => handleRowClick(user)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#F8FAFF',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        '& .action-buttons': {
                          opacity: 1,
                        },
                      },
                      '& td': {
                        padding: '16px 24px',
                        fontSize: '0.875rem',
                        color: '#1F2937',
                        borderTop: '1px solid #F3F4F6',
                        borderBottom: '1px solid #F3F4F6',
                        '&:first-of-type': {
                          borderLeft: '1px solid #F3F4F6',
                          borderTopLeftRadius: '12px',
                          borderBottomLeftRadius: '12px',
                        },
                        '&:last-of-type': {
                          borderRight: '1px solid #F3F4F6',
                          borderTopRightRadius: '12px',
                          borderBottomRightRadius: '12px',
                        },
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={user.avatar}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            border: '2px solid #E5E7EB'
                          }}
                        />
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: '#6B7280' }}
                          >
                            {user.gender}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role}
                        sx={{ 
                          borderRadius: '6px',
                          backgroundColor: user.role === 'Teacher' 
                            ? 'rgba(0, 167, 111, 0.08)'
                            : user.role === 'Admin'
                            ? 'rgba(79, 70, 229, 0.08)'
                            : 'rgba(14, 165, 233, 0.08)',
                          color: user.role === 'Teacher'
                            ? '#00A76F'
                            : user.role === 'Admin'
                            ? '#4F46E5'
                            : '#0EA5E9',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: '24px',
                          '& .MuiChip-label': {
                            px: 1.5,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: user.status === 'active' ? '#10B981' : '#6B7280'
                      }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: user.status === 'active' ? '#10B981' : '#6B7280'
                          }}
                        />
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box 
                        className="action-buttons"
                        sx={{ 
                          opacity: { xs: 1, md: 0 },
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1
                        }}
                      >
                        {/* <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDialog(user);
                          }}
                          sx={{
                            color: '#4F46E5',
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(79, 70, 229, 0.12)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton> */}
                        
                        <Tooltip title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}>
                          <IconButton
                            size="small"
                            onClick={(e) => user.status === 'active' ? handleBlock(user.id, e) : handleActivate(user.id, e)}
                            sx={{
                              color: user.status === 'active' ? '#EF4444' : '#10B981',
                              backgroundColor: user.status === 'active' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              '&:hover': {
                                backgroundColor: user.status === 'active' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                              },
                              mr: 1,
                            }}
                          >
                            {user.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ p: 3 }}>
            {selectedUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Avatar
                    src={selectedUser.avatar}
                    sx={{ width: 100, height: 100, mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {selectedUser.role}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Personal Information
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2,
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                      📧
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Email
                      </Typography>
                      <Typography>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                      📱
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Phone
                      </Typography>
                      <Typography>
                        {selectedUser.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                      📍
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Address
                      </Typography>
                      <Typography>
                        {selectedUser.address || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Thêm phần hiển thị thông tin chuyên môn của teacher */}
                {selectedUser.role === 'Teacher' && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                      Professional Information
                    </Typography>

                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 2,
                      mb: 3
                    }}>
                      {selectedUser.experience && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                            🎓
                          </Box>
                          <Box>
                            <Typography color="text.secondary" variant="caption">
                              Experience
                            </Typography>
                            <Typography>
                              {selectedUser.experience}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {selectedUser.specialization && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                            🔍
                          </Box>
                          <Box>
                            <Typography color="text.secondary" variant="caption">
                              Specialization
                            </Typography>
                            <Typography>
                              {selectedUser.specialization}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {selectedUser.about && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ width: 24, display: 'flex', alignItems: 'center' }}>
                            📝
                          </Box>
                          <Box>
                            <Typography color="text.secondary" variant="caption">
                              About
                            </Typography>
                            <Typography>
                              {selectedUser.about}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                <Box sx={{ 
                  mt: 2, 
                  mb: 3, 
                  p: 2, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {selectedUser.status === 'active'}
                </Box>

                <Box sx={{ 
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2
                }}>
                  {/* Conditional Block/Activate button */}
                  {selectedUser.status === 'active' ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={(e) => handleBlock(selectedUser.id, e)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 3,
                        borderColor: '#EF4444',
                        color: '#EF4444',
                        '&:hover': {
                          borderColor: '#DC2626',
                          backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        }
                      }}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={(e) => handleActivate(selectedUser.id, e)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 3,
                        borderColor: '#10B981',
                        color: '#10B981',
                        '&:hover': {
                          borderColor: '#059669',
                          backgroundColor: 'rgba(16, 185, 129, 0.04)',
                        }
                      }}
                    >
                      Activate
                    </Button>
                  )}
                  
                  {/* <Button
                    variant="contained"
                    onClick={() => {
                      handleCloseDialog();
                      handleOpenEditDialog(selectedUser);
                    }}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 3,
                      backgroundColor: '#4F46E5',
                      '&:hover': {
                        backgroundColor: '#4338CA',
                      }
                    }}
                  >
                    Edit
                  </Button> */}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'relative', p: 3 }}>
          <IconButton
            onClick={handleCloseEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>

          <DialogTitle sx={{ 
            p: 0, 
            mb: 3, 
            fontWeight: 600,
            fontSize: '1.25rem'
          }}>
            Edit User Information
          </DialogTitle>

          <Box component="form" sx={{ mt: 1 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 2
                }}
              >
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '2px solid #E5E7EB'
                  }}
                />
                <Button
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 'auto',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <CloudUploadIcon sx={{ fontSize: 20 }} />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Click the icon to change the profile picture
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={editFormData?.name || ''}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFormData?.email || ''}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editFormData?.phone}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editFormData?.address || ''}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={editFormData?.role}
                    onChange={handleEditFormChange}
                    label="Role"
                    disabled
                  >
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Experience"
                  name="experience"
                  placeholder="e.g. 5 years teaching piano"
                  value={editFormData?.experience || ''}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  placeholder="e.g. Piano, Music Theory"
                  value={editFormData?.specialization || ''}
                  onChange={handleEditFormChange}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="About"
                  name="about"
                  placeholder="Brief description about the teacher"
                  value={editFormData?.about || ''}
                  onChange={handleEditFormChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 3 
            }}>
              <Button
                variant="outlined"
                onClick={handleCloseEditDialog}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSubmit}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                  backgroundColor: '#4F46E5',
                  '&:hover': {
                    backgroundColor: '#4338CA',
                  }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'relative', p: 3 }}>

          <DialogTitle sx={{ 
            p: 0, 
            mb: 3, 
            fontWeight: 600,
            fontSize: '1.25rem'
          }}>
            Add New Account
          </DialogTitle>

          <Box component="form" sx={{ mt: 1 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 2
                }}
              >
                <Avatar
                  src={newUserData.avatar}
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '2px solid #E5E7EB'
                  }}
                />
                <Button
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 'auto',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewUserData(prev => ({
                            ...prev,
                            avatar: reader.result
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <CloudUploadIcon sx={{ fontSize: 20 }} />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Click the icon to add a profile picture
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={newUserData.address}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Các trường mới dành cho giáo viên */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Experience"
                  name="experience"
                  placeholder="e.g. 5 years teaching piano"
                  value={newUserData.experience}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    experience: e.target.value
                  }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  placeholder="e.g. Piano, Music Theory"
                  value={newUserData.specialization}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    specialization: e.target.value
                  }))}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="About"
                  name="about"
                  placeholder="Brief description about the teacher"
                  value={newUserData.about}
                  onChange={(e) => setNewUserData(prev => ({
                    ...prev,
                    about: e.target.value
                  }))}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    name="role"
                    value="Teacher"
                    disabled
                    label="Role"
                  >
                    Teacher
                  </TextField>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 3 
            }}>
              <Button
                variant="outlined"
                onClick={handleCloseAddDialog}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddUserSubmit}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                  backgroundColor: '#4F46E5',
                  '&:hover': {
                    backgroundColor: '#4338CA',
                  }
                }}
              >
                Add New
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
