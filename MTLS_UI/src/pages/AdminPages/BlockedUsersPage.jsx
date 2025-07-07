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
  Dialog,
  DialogContent,
  Tooltip,
  useTheme,
  InputBase,
  TableSortLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from "@mui/material";
import { LockOpen as UnblockIcon, Close as CloseIcon, Search as SearchIcon, LockReset as ResetPasswordIcon } from "@mui/icons-material";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import { userService } from "../../api/services/user.service";

export default function BlockedUsersPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch inactive and locked users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch deactivated users
        const deactivatedResponse = await userService.getAllUsers();
        if (deactivatedResponse && deactivatedResponse.data && deactivatedResponse.data.users) {
          const inactiveUsers = deactivatedResponse.data.users
            .filter(user => !user.isActive)
            .map(user => ({
              id: user._id,
              name: user.fullname,
              email: user.email,
              role: user.role === 'teacher' ? 'Teacher' : 
                    user.role === 'admin' ? 'Admin' : 'Student',
              gender: user.gender || '',
              avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
              status: 'inactive',
              phone: user.phone || '',
              address: user.address || '',
              experience: user.experience || '',
              specialization: user.specialization || '',
              about: user.about || ''
            }));
          
          setBlockedUsers(inactiveUsers);
        }
        
        // Fetch locked users
        const lockedResponse = await userService.getAllLockedUsers();
        if (lockedResponse && lockedResponse.data && lockedResponse.data.users) {
          const locked = lockedResponse.data.users
            .map(user => ({
              id: user._id,
              name: user.fullname,
              email: user.email,
              role: user.role === 'teacher' ? 'Teacher' : 
                    user.role === 'admin' ? 'Admin' : 'Student',
              gender: user.gender || '',
              avatar: user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
              status: 'locked',
              phone: user.phone || '',
              address: user.address || '',
              failedLoginAttempts: user.failedLoginAttempts,
              lastFailedLogin: user.lastFailedLogin ? new Date(user.lastFailedLogin).toLocaleString() : 'Unknown',
              experience: user.experience || '',
              specialization: user.specialization || '',
              about: user.about || ''
            }));
          
          setLockedUsers(locked);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setSnackbar({
          open: true,
          message: 'Failed to load users. Please try again.',
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

  const handleActivate = async (userId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      
      // Gọi API để activate user
      await userService.toggleUserStatus(userId, true);
      
      // Xóa user khỏi danh sách blocked users
      setBlockedUsers(prevUsers => 
        prevUsers.filter(user => user.id !== userId)
      );
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'User has been activated successfully!',
        severity: 'success'
      });
      
      // Đóng dialog nếu đang mở
      if (selectedUser && selectedUser.id === userId) {
        handleCloseDialog();
      }
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

  const handleUnlockAccount = async (userId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      setLoading(true);
      
      // Call the API to unlock the user account
      await userService.unlockUser(userId);
      
      // Remove from locked users list
      setLockedUsers(prevUsers => 
        prevUsers.filter(user => user.id !== userId)
      );
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'User account has been unlocked successfully!',
        severity: 'success'
      });
      
      // Close dialog if open
      if (selectedUser && selectedUser.id === userId) {
        handleCloseDialog();
      }
    } catch (err) {
      console.error("Error unlocking user:", err);
      
      setSnackbar({
        open: true,
        message: 'Error occurred while unlocking user account!',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery(''); // Reset search when changing tabs
  };

  const getFilteredSortedUsers = () => {
    const usersToFilter = tabValue === 0 ? blockedUsers : lockedUsers;
    
    const filtered = usersToFilter.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return b[orderBy] < a[orderBy] ? -1 : 1;
      }
    });
  };

  const sortedUsers = getFilteredSortedUsers();

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
              Account Issues
            </Typography>

            {/* Tab Selection */}
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main
                }
              }}
            >
              <Tab 
                label={`Deactivated Users (${blockedUsers.length})`} 
                sx={{
                  fontWeight: tabValue === 0 ? 600 : 400,
                  color: tabValue === 0 ? theme.palette.primary.main : 'inherit',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main
                  }
                }}
              />
              <Tab 
                label={`Locked Users (${lockedUsers.length})`} 
                sx={{
                  fontWeight: tabValue === 1 ? 600 : 400,
                  color: tabValue === 1 ? theme.palette.primary.main : 'inherit',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main
                  }
                }}
              />
            </Tabs>

            {/* Actions Row */}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Search Box */}
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

              {/* Back Button */}
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/account')}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                }}
              >
                Back
              </Button>
            </Box>
          </Box>

          {/* Table Section */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="5%"></TableCell>
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
                    {tabValue === 0 ? "Status" : "Failed Attempts"}
                  </TableCell>
                  <TableCell width="10%" align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    onClick={() => handleRowClick(user)}
                    sx={{
                      cursor: "pointer",
                      "&:hover .action-buttons": {
                        opacity: 1,
                      },
                    }}
                  >
                    <TableCell>
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          backgroundColor:
                            user.role === "Teacher"
                              ? "rgba(16, 185, 129, 0.1)"
                              : user.role === "Admin"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(88, 80, 236, 0.1)",
                          color:
                            user.role === "Teacher"
                              ? "#10B981"
                              : user.role === "Admin"
                              ? "#EF4444"
                              : "#5850EC",
                          fontWeight: 500,
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {tabValue === 0 ? (
                        <Chip
                          label="Deactivated"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#EF4444",
                            fontWeight: 500,
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        <Typography variant="body2">
                          {user.failedLoginAttempts || 0} attempts
                        </Typography>
                      )}
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
                        {tabValue === 0 ? (
                          <Tooltip title="Activate Account">
                            <IconButton
                              size="small"
                              onClick={(e) => handleActivate(user.id, e)}
                              sx={{
                                color: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                },
                                mr: 1,
                              }}
                            >
                              <UnblockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Unlock Account">
                            <IconButton
                              size="small"
                              onClick={(e) => handleUnlockAccount(user.id, e)}
                              sx={{
                                color: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                '&:hover': {
                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                },
                                mr: 1,
                              }}
                            >
                              <ResetPasswordIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        {tabValue === 0 ? 'No deactivated users found' : 'No locked users found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* User Detail Dialog */}
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
                  <Chip
                    label={selectedUser.status === 'inactive' ? 'Deactivated' : 'Locked'}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#EF4444",
                      fontWeight: 500,
                      borderRadius: "6px",
                    }}
                  />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  User Information
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{selectedUser.email}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{selectedUser.phone || 'N/A'}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">{selectedUser.address || 'N/A'}</Typography>
                  </Box>
                  
                  {selectedUser.status === 'locked' && (
                    <>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Failed Login Attempts
                        </Typography>
                        <Typography variant="body1">{selectedUser.failedLoginAttempts || 0}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Failed Login
                        </Typography>
                        <Typography variant="body1">{selectedUser.lastFailedLogin || 'N/A'}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {selectedUser.status === 'inactive' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleActivate(selectedUser.id)}
                    >
                      Activate Account
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUnlockAccount(selectedUser.id)}
                    >
                      Unlock Account
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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