import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Book as BookIcon, 
  People as PeopleIcon, 
  Assignment as AssignmentIcon, 
  Logout as LogoutIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import logo from '../../../assets/Logo.svg';
import { authService } from '../../../api/services/auth.service';

const TeacherSidebar = ({ open }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsExpanded(true);
    };

    handleRouteChange();
  }, [location]);

  const handleLogout = () => {
    // Use authService.logout() instead of manual deletion
    authService.logout();
    console.log('Logged out');
    // Redirect to admin login page
    navigate("/admin/login");
  };

  const isActive = (path) => {
    if (path === '/teacher/courses') {
      return (
        location.pathname === path || 
        location.pathname.match(/^\/teacher\/course\/[^/]+\/?$/) || // module management
        location.pathname.includes('/modules/') || // module create/edit
        location.pathname.includes('/module/') // module create/edit
      );
    }
    
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        width: isExpanded ? 270 : 65,
        height: '100vh',
        backgroundColor: 'white',
        transition: 'width 0.3s ease',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1100,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          height: 64,
        }}
        onClick={() => navigate('/teacher/overview')}
      >
        <img src={logo} alt="Logo" style={{ height: 50, cursor: 'pointer' }} />
      </Box>
      <List sx={{ gap: '8px', display: 'flex', flexDirection: 'column', p: 2 }}>
        <ListItem
          button
          onClick={() => navigate('/teacher/courses')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            backgroundColor: isActive('/teacher/courses')
              ? 'rgba(25, 118, 210, 0.08)'
              : 'transparent',
            '&:hover': {
              backgroundColor: isActive('/teacher/courses')
                ? 'rgba(25, 118, 210, 0.12)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            minHeight: 48,
            borderRadius: '8px',
            '& .MuiListItemIcon-root': {
              color: isActive('/teacher/courses') ? '#1976d2' : 'inherit',
            },
            '& .MuiListItemText-primary': {
              color: isActive('/teacher/courses') ? '#1976d2' : 'inherit',
              fontWeight: isActive('/teacher/courses') ? 600 : 400,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <BookIcon />
          </ListItemIcon>
          <ListItemText
            primary="Course Management"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? 'block' : 'none',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
              '& .MuiTypography-root': {
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigate('/teacher/students')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            backgroundColor: isActive('/teacher/students')
              ? 'rgba(25, 118, 210, 0.08)'
              : 'transparent',
            '&:hover': {
              backgroundColor: isActive('/teacher/students')
                ? 'rgba(25, 118, 210, 0.12)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            minHeight: 48,
            borderRadius: '8px',
            '& .MuiListItemIcon-root': {
              color: isActive('/teacher/students') ? '#1976d2' : 'inherit',
            },
            '& .MuiListItemText-primary': {
              color: isActive('/teacher/students') ? '#1976d2' : 'inherit',
              fontWeight: isActive('/teacher/students') ? 600 : 400,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText
            primary="Student Management"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? 'block' : 'none',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
              '& .MuiTypography-root': {
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={() => navigate('/teacher/assignments')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            backgroundColor: isActive('/teacher/assignments')
              ? 'rgba(25, 118, 210, 0.08)'
              : 'transparent',
            '&:hover': {
              backgroundColor: isActive('/teacher/assignments')
                ? 'rgba(25, 118, 210, 0.12)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            minHeight: 48,
            borderRadius: '8px',
            '& .MuiListItemIcon-root': {
              color: isActive('/teacher/assignments') ? '#1976d2' : 'inherit',
            },
            '& .MuiListItemText-primary': {
              color: isActive('/teacher/assignments') ? '#1976d2' : 'inherit',
              fontWeight: isActive('/teacher/assignments') ? 600 : 400,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText
            primary="Grade Assignments"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? 'block' : 'none',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
              '& .MuiTypography-root': {
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </ListItem>

        {/* <ListItem
          button
          onClick={() => navigate('/teacher/practice')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            backgroundColor: isActive('/teacher/practice')
              ? 'rgba(25, 118, 210, 0.08)'
              : 'transparent',
            '&:hover': {
              backgroundColor: isActive('/teacher/practice')
                ? 'rgba(25, 118, 210, 0.12)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            minHeight: 48,
            borderRadius: '8px',
            '& .MuiListItemIcon-root': {
              color: isActive('/teacher/practice') ? '#1976d2' : 'inherit',
            },
            '& .MuiListItemText-primary': {
              color: isActive('/teacher/practice') ? '#1976d2' : 'inherit',
              fontWeight: isActive('/teacher/practice') ? 600 : 400,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <FitnessCenterIcon />
          </ListItemIcon>
          <ListItemText
            primary="Practice Management"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? 'block' : 'none',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
              '& .MuiTypography-root': {
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </ListItem> */}

      </List>
      <Box sx={{ flexGrow: 1 }} />
      <List sx={{ p: 2 }}>
        <ListItem
          button
          onClick={() => navigate('/teacher/profile')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '& .MuiListItemIcon-root': {
                color: '#1976d2',
              },
              "& .MuiListItemText-primary": {
                color: "#1976d2",
              },
            },
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <PersonIcon />
          </ListItemIcon>
          <ListItemText
            primary="Personal Profile"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? "block" : "none",
              whiteSpace: "nowrap",
              transition: "opacity 0.3s ease",
              "& .MuiTypography-root": {
                transition: "all 0.3s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </ListItem>

        {/* <ListItem
          button
          onClick={() => navigate('/teacher/notifications')}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '& .MuiListItemIcon-root': {
                color: '#1976d2',
              },
              "& .MuiListItemText-primary": {
                color: "#1976d2",
              },
            },
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Notifications"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? "block" : "none",
              whiteSpace: "nowrap",
              transition: "opacity 0.3s ease",
              "& .MuiTypography-root": {
                transition: "all 0.3s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </ListItem> */}

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: isExpanded ? 2 : 'auto',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            cursor: 'pointer',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              '& .MuiListItemIcon-root': {
                color: '#EF4444',
              },
              "& .MuiListItemText-primary": {
                color: "#EF4444",
              },
            },
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              opacity: isExpanded ? 1 : 0,
              display: isExpanded ? "block" : "none",
              whiteSpace: "nowrap",
              transition: "opacity 0.3s ease",
              "& .MuiTypography-root": {
                transition: "all 0.3s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

TeacherSidebar.propTypes = {
  open: PropTypes.bool
};

export default TeacherSidebar; 