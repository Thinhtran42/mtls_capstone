import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Chip,
  Divider,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  PeopleAlt,
  Book,
  Assignment,
  Psychology,
  Refresh,
  Visibility,
  Star,
  People,
  Score,
  AssignmentTurnedIn,
  Assignment as AssignmentIcon,
  Timer,
} from "@mui/icons-material";
import AdminLayout from "../../components/layout/admin/AdminLayout";
import '../../styles/AdminPages/dashboard.css';
import { userService } from '../../api/services/user.service';
import { analyticsService } from '../../api/services/analytics.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Component for stat cards
const StatCard = ({ icon, count, label, color }) => (
  <Card className="stat-card" sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {count}
          </Typography>
        </Box>
      </Box>
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        {label}
      </Typography>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.node]).isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

// Component for system status cards
const StatusCard = ({ icon, title, status, details, color }) => (
  <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>{title}</Typography>
          <Chip 
            label={status} 
            size="small" 
            sx={{ 
              bgcolor: status === 'Online' ? 'success.light' : status === 'Warning' ? 'warning.light' : 'error.light',
              color: status === 'Online' ? 'success.dark' : status === 'Warning' ? 'warning.dark' : 'error.dark',
              fontWeight: 500,
              mt: 0.5
            }} 
          />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">{details}</Typography>
    </CardContent>
  </Card>
);

StatusCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLessons: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    totalActive: 0,
    studentChange: "0.0",
    lessonChange: "0.0",
    assignmentChange: "0.0",
    activeUserChange: "0.0"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [tabValue, setTabValue] = useState(0);

  // State cho dữ liệu từ API
  const [userActivityData, setUserActivityData] = useState([]);
  const [userRegistrationData, setUserRegistrationData] = useState([]);
  
  // State mới cho Popular Content
  const [topLessons, setTopLessons] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);
  const [topAssignments, setTopAssignments] = useState([]);
  const [popularContentLoading, setPopularContentLoading] = useState(true);
  
  // State mới cho Recent Activities
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Import và sử dụng analytics service
      try {
        // Lấy thông tin tổng quan
        const overview = await analyticsService.getDashboardOverview();
        
        // Truy cập đúng cấu trúc dữ liệu
        const overviewData = overview?.data;
        
        if (overviewData) {
          setStats({
            totalStudents: overviewData.totalStudents || 0,
            totalLessons: overviewData.totalLessons || 0,
            totalAssignments: overviewData.totalAssignments || 0,
            totalQuizzes: 0, // Giữ lại vì không có trong API
            totalActive: overviewData.activeUsers || 0,
            studentChange: overviewData.studentChange || "0.0",
            lessonChange: overviewData.lessonChange || "0.0",
            assignmentChange: overviewData.assignmentChange || "0.0",
            activeUserChange: overviewData.activeUserChange || "0.0"
          });
        }
        
        // Lấy dữ liệu cho User Activity chart
        const activityResponse = await analyticsService.getUserActivity(timeRange);
        const activityData = activityResponse?.data;
        
        if (activityData && Array.isArray(activityData)) {
          // Format dữ liệu từ API
          const formattedData = activityData.map(item => {
            // Nếu date là string ISO, chuyển thành ngày
            let date;
            try {
              date = new Date(item.date);
            } catch {
              // Nếu không phải date hợp lệ, giữ nguyên
              date = item.date;
            }
            
            // Nếu là date object, chuyển đổi thành tên ngày
            const dayName = date instanceof Date ? 
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] : 
              item.date;
            
            return {
              date: dayName,
              lessons: item.lessons || 0,
              exercises: item.exercises || 0,
              quizzes: item.quizzes || 0
            };
          });
          
          setUserActivityData(formattedData);
        }
        
        // Lấy dữ liệu đăng ký theo tháng
        const registrationResponse = await analyticsService.getUserRegistrationTrend();
        const registrationData = registrationResponse?.data;
        
        if (registrationData && Array.isArray(registrationData)) {
          setUserRegistrationData(registrationData.map(item => ({
            month: item.month || 'Unknown',
            count: item.count || 0
          })));
        }
        
        // Lấy dữ liệu nội dung phổ biến
        const popularContentResponse = await analyticsService.getPopularContent();
        const popularContentData = popularContentResponse?.data;
        
        if (popularContentData) {
          const { topLessons: apiTopLessons, topQuizzes: apiTopQuizzes, topAssignments: apiTopAssignments } = popularContentData;
          
          // Cập nhật state cho các list nội dung phổ biến nếu có dữ liệu hợp lệ
          if (apiTopLessons && Array.isArray(apiTopLessons) && apiTopLessons.length > 0) {
            setTopLessons(apiTopLessons);
          }
          
          if (apiTopQuizzes && Array.isArray(apiTopQuizzes) && apiTopQuizzes.length > 0) {
            setTopQuizzes(apiTopQuizzes);
          }
          
          if (apiTopAssignments && Array.isArray(apiTopAssignments) && apiTopAssignments.length > 0) {
            setTopAssignments(apiTopAssignments);
          }
        }
        
        setPopularContentLoading(false);
        
        // Lấy dữ liệu thời gian học tập
        const learningTimeResponse = await analyticsService.getLearningTimeAnalytics();
        const learningTimeData = learningTimeResponse?.data;
        
        if (learningTimeData) {
          const { dailyData, timeDistribution, sessionStats } = learningTimeData;
          
          // Cập nhật state cho các biểu đồ thời gian học tập nếu có dữ liệu hợp lệ
          if (dailyData && Array.isArray(dailyData) && dailyData.length > 0) {
            // Cập nhật state cho biểu đồ thời gian học tập theo ngày
          }
          
          if (timeDistribution && Array.isArray(timeDistribution) && timeDistribution.length > 0) {
            // Cập nhật state cho biểu đồ phân phối thời gian học tập
          }
          
          if (sessionStats) {
            // Cập nhật state cho thống kê phiên học tập
          }
        }
        
        // Lấy dữ liệu hoạt động gần đây
        const recentActivitiesResponse = await analyticsService.getRecentActivities();
        const recentActivitiesData = recentActivitiesResponse?.data;
        
        if (recentActivitiesData && Array.isArray(recentActivitiesData)) {
          setRecentActivities(recentActivitiesData);
        }
        
        setRecentActivitiesLoading(false);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Error fetching analytics data. Using fallback data.');
        
        // Fallback to using alternative services
      try {
        const studentsResponse = await userService.getAllStudents();
          const totalStudents = studentsResponse?.data?.users?.length || 0;
        
        // Calculate active users (just a mock for demonstration)
          const totalActive = Math.floor(totalStudents * 0.8);
          
          // Cập nhật một phần stats
          setStats(prevStats => ({
            ...prevStats,
            totalStudents,
            totalActive
          }));
        } catch (error) {
          console.error('Error fetching students:', error);
      }
      
      try {
        const { lessonService } = await import('../../api/services/lesson.service');
        const lessonsResponse = await lessonService.getAllLessons();
          const totalLessons = lessonsResponse?.data?.length || 0;
          
          setStats(prevStats => ({
            ...prevStats,
            totalLessons
          }));
      } catch (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }
      
      try {
        const { quizService } = await import('../../api/services/quiz.service');
        const quizzesResponse = await quizService.getAllQuizzes();
          const totalQuizzes = quizzesResponse?.data?.quizzes?.length || 0;
          
          setStats(prevStats => ({
            ...prevStats,
            totalQuizzes
          }));
      } catch (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
      }
      
      try {
        const { assignmentService } = await import('../../api/services/assignment.service');
        const assignmentsResponse = await assignmentService.getAllAssignments();
          const totalAssignments = assignmentsResponse?.data?.assignments?.length || 0;
          
          setStats(prevStats => ({
            ...prevStats,
            totalAssignments
          }));
      } catch (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        }
      }
      
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Sửa lại useEffect
  useEffect(() => {
    fetchStats(); // Hàm fetchStats đã bao gồm mọi API call cần thiết
    
    // Reset tab value to ensure it's valid with the reduced number of tabs
    setTabValue(0);
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  const handleTabChange = (event, newValue) => {
    // Since we now only have 2 tabs (0 and 1), ensure value is within range
    if (newValue >= 0 && newValue <= 1) {
      setTabValue(newValue);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Hàm định dạng thời gian thành dạng "x minutes/hours/days ago"
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'just now';
    }
  };

  return (
    <AdminLayout>
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          backgroundColor: "#F7F9FC",
          minHeight: "100vh",
          ml: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                bgcolor: '#5850EC', 
                '&:hover': { bgcolor: '#4A44C9' },
                borderRadius: '8px',
                boxShadow: 'none'
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.dark">{error}</Typography>
          </Box>
        )}

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<PeopleAlt />}
              count={loading ? <CircularProgress size={24} /> : formatNumber(stats.totalStudents)}
              label="Total Students"
              color="#5850EC"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<Book />}
              count={loading ? <CircularProgress size={24} /> : formatNumber(stats.totalLessons)}
              label="Total Lessons"
              color="#82ca9d"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<Assignment />}
              count={loading ? <CircularProgress size={24} /> : formatNumber(stats.totalAssignments)}
              label="Assignments"
              color="#ffc658"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<Psychology />}
              count={loading ? <CircularProgress size={24} /> : formatNumber(stats.totalActive)}
              label="Active Users"
              color="#8884d8"
            />
          </Grid>
        </Grid>

        {/* Analytics and Charts */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="User Activity" />
                <Tab label="Registration Trend" />
              </Tabs>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                >
                  <MenuItem value="day">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 350 }}>
              {tabValue === 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userActivityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="lessons" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="exercises" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="quizzes" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {tabValue === 1 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userRegistrationData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="User Registrations" fill="#5850EC" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Recent Activity and Open Issues */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                {/* <Button 
                  size="small" 
                  sx={{ 
                    color: '#5850EC', 
                    '&:hover': { backgroundColor: 'rgba(88, 80, 236, 0.08)' } 
                  }}
                >
                  View All
                </Button> */}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                {recentActivitiesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={activity.userAvatar} sx={{ width: 32, height: 32, mr: 1.5 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.user}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">{activity.action}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>• {formatTimeAgo(activity.time)}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No recent activities found</Typography>
                    </Box>
                  )
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Popular Content */}
        <Box sx={{ mb: 4, mt: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Popular Content
            </Typography>
            
            <Grid container spacing={3}>
              {/* Popular Lessons */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Book sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                  Top Lessons
                </Typography>
                {popularContentLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {(topLessons.length > 0 ? topLessons : []).map((lesson, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemText 
                          primary={lesson.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {lesson.views || 0}
                                </Typography>
                              </Box>
                              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Star sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {lesson.rating || 0}
                                </Typography>
                              </Box> */}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
              
              {/* Popular Quizzes */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ mr: 1, color: 'secondary.main' }} fontSize="small" />
                  Top Quizzes
                </Typography>
                {popularContentLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {(topQuizzes.length > 0 ? topQuizzes : []).map((quiz, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemText 
                          primary={quiz.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <People sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {quiz.attempts || 0} attempts
                                </Typography>
                              </Box>
                              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Score sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {quiz.avgScore || 0}% avg
                                </Typography>
                              </Box> */}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
              
              {/* Popular Assignments */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <AssignmentTurnedIn sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
                  Top Assignments
                </Typography>
                {popularContentLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {(topAssignments.length > 0 ? topAssignments : []).map((assignment, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemText 
                          primary={assignment.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {assignment.submissions || 0} submissions
                                </Typography>
                              </Box>
                              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Timer sx={{ fontSize: 16, mr: 0.5, color: 'info.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {assignment.onTime || '0%'} on time
                                </Typography>
                              </Box> */}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
            </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
}
