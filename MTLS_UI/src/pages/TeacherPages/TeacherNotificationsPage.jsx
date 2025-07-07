import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider,
  IconButton,
  Badge,
  Paper,
  Button,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { notificationData } from '../../data/teacherData';
import PageTitle from '../../components/common/PageTitle';

const TeacherNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // Get notification data from JSON
  useEffect(() => {
    setNotifications(notificationData);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Extract details from notification
  const extractNotificationDetails = (notification) => {
    let details = [];
    
    if (notification.courseId) {
      details.push({ label: 'Course', value: `ID: ${notification.courseId}` });
    }
    
    if (notification.lessonId) {
      details.push({ label: 'Lesson', value: `ID: ${notification.lessonId}` });
    }
    
    if (notification.studentId) {
      details.push({ label: 'Student', value: `ID: ${notification.studentId}` });
    }
    
    if (notification.systemNotice) {
      details.push({ label: 'System', value: 'System Notification' });
    }
    
    return details;
  };

  return (
    <>
      <PageTitle title="Notifications" />
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <NotificationsIcon sx={{ fontSize: 30, mr: 2, color: '#1976d2' }} />
              </Badge>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-label">Filter by</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filter}
                  label="Filter by"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="unread">Unread</MenuItem>
                  <MenuItem value="info">Information</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => !n.read)}
              >
                Mark all as read
              </Button>
            </Stack>
          </Box>

          {filteredNotifications.length > 0 ? (
            <List>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: notification.read ? 400 : 600,
                            color: notification.read ? 'text.primary' : '#1976d2'
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.content}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {extractNotificationDetails(notification).map((detail, i) => (
                              <Chip 
                                key={i} 
                                label={`${detail.label}: ${detail.value}`} 
                                size="small" 
                                variant="outlined" 
                              />
                            ))}
                            <Chip 
                              label={notification.time} 
                              size="small" 
                              variant="outlined" 
                              color="primary" 
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <Box>
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton onClick={() => handleMarkAsRead(notification.id)} size="small" color="primary">
                            <MarkEmailReadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete notification">
                        <IconButton onClick={() => handleDelete(notification.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No notifications {filter !== 'all' ? 'matching your filter' : ''}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default TeacherNotificationsPage; 