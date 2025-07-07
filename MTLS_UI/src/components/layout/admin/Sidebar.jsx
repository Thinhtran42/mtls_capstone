import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  MonitorHeart as MonitorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import Logo from "../../../assets/Logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from '../../../api/services/auth.service';

// CSS cho custom scrollbar
const scrollbarStyles = {
  '::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '10px',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(88, 80, 236, 0.3)',
    borderRadius: '10px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(88, 80, 236, 0.5)',
    },
  },
};

export default function Sidebar() {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Mở các dropdown tương ứng dựa trên URL hiện tại
    if (isActive("/admin/account") || isActive("/admin/blocked-users")) {
      setAccountDropdownOpen(true);
    }
  }, [location.pathname]); // Chạy khi đường dẫn thay đổi

  const handleLogout = () => {
    authService.logout();
    console.log('Logged out');
    navigate("/admin/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Xử lý click vào item con của dropdown
  const handleSubItemClick = (e, path) => {    
    e.stopPropagation();
    
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Xử lý toggle dropdown
  const toggleDropdown = (setter, currentState) => {
    setter(!currentState);
  };

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        backgroundColor: "white",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "auto",
        }}
        onClick={() => navigate('/admin/dashboard')}
      >
        <img 
          src={Logo} 
          alt="Logo" 
          style={{ 
            height: 100,
          }} 
        />
      </Box>

      <Stack
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none', // Cho IE và Edge
          ...scrollbarStyles, // Áp dụng custom scrollbar styles
        }}
      >
        <Box>
          <List sx={{ 
            gap: "8px", 
            display: "flex", 
            flexDirection: "column", 
            p: 2,
          }}>
            {/* Dashboard */}
            <ListItem
              button
              onClick={() => navigate("/admin/dashboard")}
              sx={{
                py: 1.5,
                px: 2,
                justifyContent: "flex-start",
                cursor: "pointer",
                backgroundColor: isActive("/admin/dashboard")
                  ? "rgba(88, 80, 236, 0.08)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: isActive("/admin/dashboard")
                    ? "rgba(88, 80, 236, 0.12)"
                    : "rgba(0, 0, 0, 0.04)",
                },
                minHeight: 48,
                borderRadius: "8px",
                "& .MuiListItemIcon-root": {
                  color: isActive("/admin/dashboard") ? "#5850EC" : "inherit",
                },
                "& .MuiListItemText-primary": {
                  color: isActive("/admin/dashboard") ? "#5850EC" : "inherit",
                  fontWeight: isActive("/admin/dashboard") ? 600 : 400,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: "center",
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                sx={{
                  whiteSpace: "nowrap",
                  "& .MuiTypography-root": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </ListItem>

            {/* Account Management */}
            <ListItem
              button
              onClick={() => toggleDropdown(setAccountDropdownOpen, accountDropdownOpen)}
              sx={{
                py: 1.5,
                px: 2,
                justifyContent: "flex-start",
                cursor: "pointer",
                backgroundColor: (isActive("/admin/account") || isActive("/admin/blocked-users"))
                  ? "rgba(88, 80, 236, 0.08)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: (isActive("/admin/account") || isActive("/admin/blocked-users"))
                    ? "rgba(88, 80, 236, 0.12)"
                    : "rgba(0, 0, 0, 0.04)",
                },
                minHeight: 48,
                minWidth: 40,
                borderRadius: "8px",
                position: 'relative',
                "& .MuiListItemIcon-root": {
                  color: (isActive("/admin/account") || isActive("/admin/blocked-users")) ? "#5850EC" : "inherit",
                },
                "& .MuiListItemText-primary": {
                  color: (isActive("/admin/account") || isActive("/admin/blocked-users")) ? "#5850EC" : "inherit",
                  fontWeight: (isActive("/admin/account") || isActive("/admin/blocked-users")) ? 600 : 400,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: "center",
                }}
              >
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="User Management"
                sx={{
                  whiteSpace: "nowrap",
                }}
              />
              {accountDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse 
              in={accountDropdownOpen} 
              timeout={0}
              unmountOnExit
              sx={{ 
                transition: 'none !important'
              }}
            >
              <List component="div" disablePadding>
                <ListItem
                  button
                  onClick={(e) => handleSubItemClick(e, "/admin/account")}
                  sx={{
                    pl: 4,
                    py: 1,
                    cursor: "pointer",
                    backgroundColor: isActive("/admin/account")
                      ? "rgba(88, 80, 236, 0.08)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(88, 80, 236, 0.12)",
                    },
                    "& .MuiListItemText-primary": {
                      color: isActive("/admin/account") ? "#5850EC" : "inherit",
                      fontWeight: isActive("/admin/account") ? 600 : 400,
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    },
                    borderRadius: "8px",
                    mx: 2,
                    width: "80%"
                  }}
                >
                  <ListItemText primary="User List" />
                </ListItem>
                <ListItem
                  button
                  onClick={(e) => handleSubItemClick(e, "/admin/blocked-users")}
                  sx={{
                    pl: 4,
                    py: 1,
                    cursor: "pointer",
                    backgroundColor: isActive("/admin/blocked-users")
                      ? "rgba(88, 80, 236, 0.08)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(88, 80, 236, 0.12)",
                    },
                    "& .MuiListItemText-primary": {
                      color: isActive("/admin/blocked-users") ? "#5850EC" : "inherit",
                      fontWeight: isActive("/admin/blocked-users") ? 600 : 400,
                      fontSize: "0.875rem"
                    },
                    borderRadius: "8px",
                    mx: 2,
                    width: "80%"
                  }}
                >
                  <ListItemText primary="Blocked Users" />
                </ListItem>
              </List>
            </Collapse>

            {/* System Monitoring */}
            <ListItem
              button
              onClick={() => navigate("/admin/system-monitoring")}
              sx={{
                py: 1.5,
                px: 2,
                justifyContent: "flex-start",
                cursor: "pointer",
                backgroundColor: isActive("/admin/system-monitoring")
                  ? "rgba(88, 80, 236, 0.08)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: isActive("/admin/system-monitoring")
                    ? "rgba(88, 80, 236, 0.12)"
                    : "rgba(0, 0, 0, 0.04)",
                },
                minHeight: 48,
                borderRadius: "8px",
                "& .MuiListItemIcon-root": {
                  color: isActive("/admin/system-monitoring") ? "#5850EC" : "inherit",
                },
                "& .MuiListItemText-primary": {
                  color: isActive("/admin/system-monitoring") ? "#5850EC" : "inherit",
                  fontWeight: isActive("/admin/system-monitoring") ? 600 : 400,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: "center",
                }}
              >
                <MonitorIcon />
              </ListItemIcon>
              <ListItemText
                primary="System Monitoring"
                sx={{
                  whiteSpace: "nowrap",
                  "& .MuiTypography-root": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </ListItem>

            {/* Settings */}
            <ListItem
              button
              onClick={() => navigate("/admin/settings")}
              sx={{
                py: 1.5,
                px: 2,
                justifyContent: "flex-start",
                cursor: "pointer",
                backgroundColor: isActive("/admin/settings")
                  ? "rgba(88, 80, 236, 0.08)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                minHeight: 48,
                borderRadius: "8px",
                "& .MuiListItemIcon-root": {
                  color: isActive("/admin/settings") ? "#5850EC" : "inherit",
                },
                "& .MuiListItemText-primary": {
                  color: isActive("/admin/settings") ? "#5850EC" : "inherit",
                  fontWeight: isActive("/admin/settings") ? 600 : 400,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: "center",
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="System Settings"
                sx={{
                  whiteSpace: "nowrap",
                }}
              />
            </ListItem>
          </List>
        </Box>

        <Box 
          sx={{ 
            mt: "auto",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            p: 2
          }}
        >
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              justifyContent: "flex-start",
              cursor: "pointer",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              minHeight: 48,
              borderRadius: "8px"
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: "center",
                color: "#f44336"
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                whiteSpace: "nowrap",
                color: "#f44336"
              }}
            />
          </ListItem>
        </Box>
      </Stack>
    </Box>
  );
}