import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Typography, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Badge, 
  Divider 
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Menu as MenuIcon, 
  Person as PersonIcon, 
  Logout as LogoutIcon 
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import logo from '../../../assets/Logo.svg';
import { authService } from '../../../api/services/auth.service';

const TeacherNavbar = ({ onMenuToggle }) => {
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isOverviewPage = location.pathname === '/teacher/overview';
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/teacher/profile');
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    // Sử dụng authService.logout() để đăng xuất
    authService.logout();
    console.log('Đã đăng xuất');
    handleUserMenuClose();
    // Chuyển hướng về trang đăng nhập admin
    navigate('/admin/login');
  };

  // Dữ liệu mẫu cho thông báo
  const notifications = [
    { id: 1, content: 'Học sinh Nguyễn Văn A đã nộp bài tập', time: '5 phút trước', read: false },
    { id: 2, content: 'Bài giảng mới đã được tạo', time: '1 giờ trước', read: false },
    { id: 3, content: 'Nhắc nhở: Kiểm tra vào ngày mai', time: '3 giờ trước', read: true },
  ];

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isOverviewPage && (
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={onMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Link to="/teacher/overview">
            <img src={logo} alt="Logo" style={{ height: 50 }} />
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <IconButton 
            color="inherit" 
            sx={{ mr: 2 }}
            onClick={handleNotificationsOpen}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}
          
          <IconButton 
            color="inherit"
            onClick={handleUserMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>T</Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>Profile</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Popup */}
      <Popover
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto', p: 1 }}>
          <Typography variant="h6" sx={{ p: 1 }}>Thông báo</Typography>
          <Divider />
          <List>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem 
                  key={notification.id} 
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemText 
                    primary={notification.content}
                    secondary={notification.time}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có thông báo mới" />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </AppBar>
  );
};

TeacherNavbar.propTypes = {
  onMenuToggle: PropTypes.func
};

export default TeacherNavbar; 