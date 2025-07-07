import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import AdminLayout from '../../components/layout/admin/AdminLayout';

// Dữ liệu mẫu cho biểu đồ
const usageByDay = [
  { name: 'Thứ 2', users: 120, sessions: 200, newUsers: 40 },
  { name: 'Thứ 3', users: 145, sessions: 230, newUsers: 48 },
  { name: 'Thứ 4', users: 135, sessions: 210, newUsers: 35 },
  { name: 'Thứ 5', users: 160, sessions: 290, newUsers: 55 },
  { name: 'Thứ 6', users: 180, sessions: 320, newUsers: 60 },
  { name: 'Thứ 7', users: 110, sessions: 160, newUsers: 20 },
  { name: 'CN', users: 90, sessions: 120, newUsers: 15 },
];

const sessionsByHour = [
  { name: '00:00', sessions: 20 },
  { name: '03:00', sessions: 10 },
  { name: '06:00', sessions: 30 },
  { name: '09:00', sessions: 120 },
  { name: '12:00', sessions: 100 },
  { name: '15:00', sessions: 130 },
  { name: '18:00', sessions: 90 },
  { name: '21:00', sessions: 40 },
];

const userDeviceData = [
  { name: 'Desktop', value: 55 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 10 },
];

const browserData = [
  { name: 'Chrome', value: 62 },
  { name: 'Firefox', value: 15 },
  { name: 'Safari', value: 13 },
  { name: 'Edge', value: 8 },
  { name: 'Others', value: 2 },
];

const topPages = [
  { id: 1, path: '/lessons/intro', title: 'Introduction to MTLS', views: 1284, avgTime: '3:45' },
  { id: 2, path: '/dashboard', title: 'User Dashboard', views: 956, avgTime: '5:20' },
  { id: 3, path: '/lessons/advanced', title: 'Advanced Techniques', views: 824, avgTime: '7:12' },
  { id: 4, path: '/profile', title: 'User Profile', views: 752, avgTime: '2:30' },
  { id: 5, path: '/lessons/practice', title: 'Practice Exercises', views: 687, avgTime: '9:45' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SystemUsageContent = () => {
  const [timeRange, setTimeRange] = useState('7days');

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600} color="#333">
          Usage Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{ height: 40 }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                2,564
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label="+12.5%" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    color: 'success.main',
                    fontWeight: 500,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Active Sessions
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                186
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label="+5.2%" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    color: 'success.main',
                    fontWeight: 500,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  from previous hour
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Avg. Session Duration
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                12:42
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label="-1.8%" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                    color: 'error.main',
                    fontWeight: 500,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                New Users Today
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                48
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label="+8.4%" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    color: 'success.main',
                    fontWeight: 500,
                    mr: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  from yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Usage Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              User Activity Trends
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={usageByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="Active Users" fill="#8884d8" />
                <Bar dataKey="sessions" name="Sessions" fill="#82ca9d" />
                <Bar dataKey="newUsers" name="New Users" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Session Distribution by Hour
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={sessionsByHour}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={0.5}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Device Usage
            </Typography>
            <Box height={300} display="flex" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDeviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userDeviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Browser Distribution
            </Typography>
            <Box height={300} display="flex" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              System Load
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { time: '00:00', load: 25 },
                  { time: '04:00', load: 18 },
                  { time: '08:00', load: 42 },
                  { time: '12:00', load: 65 },
                  { time: '16:00', load: 78 },
                  { time: '20:00', load: 52 },
                  { time: '23:59', load: 30 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="load" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Pages Table */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Most Visited Pages
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Page</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Views</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Avg. Time on Page</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPages.map((page) => (
                <TableRow key={page.id} hover>
                  <TableCell component="th" scope="row">
                    {page.title}
                  </TableCell>
                  <TableCell>{page.path}</TableCell>
                  <TableCell align="right">{page.views.toLocaleString()}</TableCell>
                  <TableCell align="right">{page.avgTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const SystemUsagePage = () => {
  return (
    <AdminLayout>
      <SystemUsageContent />
    </AdminLayout>
  );
};

export default SystemUsagePage; 