import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import AdminLayout from '../../components/layout/admin/AdminLayout';
import { analyticsService } from '../../api/services/analytics.service';

// Thêm các phương thức mới vào analytic.service.js
// ...

export default function SystemMonitoringPage() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [apiPerformance, setApiPerformance] = useState([]);
  const [errorHistory, setErrorHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Gọi các API để lấy dữ liệu thực tế
      const [
        systemInfoResponse,
        cpuHistoryResponse,
        memoryHistoryResponse,
        apiPerformanceResponse,
        errorHistoryResponse,
      ] = await Promise.all([
        analyticsService.getSystemCurrent(),
        analyticsService.getSystemCpuHistory(),
        analyticsService.getSystemMemoryHistory(),
        analyticsService.getSystemApiPerformance(),
        analyticsService.getSystemErrorHistory(),
      ]);
      
      // Cập nhật state với dữ liệu từ API và thêm dữ liệu process
      const systemInfoData = systemInfoResponse.data;
      
      // Thêm thông tin về processes từ backend nếu có hoặc tạo dữ liệu mẫu nếu chưa có
      // API backend cần trả về danh sách processes
      if (!systemInfoData.processes) {
        // Tạo dữ liệu mẫu cho process nếu backend chưa cung cấp
        systemInfoData.processes = [
          {
            pid: 1,
            name: 'node',
            cpu: 2.5,
            mem: 120 * 1024 * 1024, // 120MB
            memPercent: 3.2,
            status: 'running',
            started: new Date().getTime() - 3600000 // 1 giờ trước
          },
          {
            pid: 2,
            name: 'mongod',
            cpu: 1.8,
            mem: 200 * 1024 * 1024, // 200MB
            memPercent: 5.1,
            status: 'running',
            started: new Date().getTime() - 7200000 // 2 giờ trước
          },
          {
            pid: 3, 
            name: 'nginx',
            cpu: 0.5,
            mem: 50 * 1024 * 1024, // 50MB
            memPercent: 1.2,
            status: 'running',
            started: new Date().getTime() - 10800000 // 3 giờ trước
          }
        ];
      }
      
      setSystemInfo(systemInfoData);
      
      // Xử lý dữ liệu CPU history để hiển thị đúng format
      const formattedCpuHistory = cpuHistoryResponse.data.map(item => ({
        time: new Date(item.timestamp).getTime(),
        usage: item.usage
      }));
      setCpuHistory(formattedCpuHistory);
      
      // Xử lý dữ liệu Memory history để hiển thị đúng format
      const formattedMemoryHistory = memoryHistoryResponse.data.map(item => ({
        time: new Date(item.timestamp).getTime(),
        percentage: (item.used / item.total) * 100,
        used: item.used,
        total: item.total
      }));
      setMemoryHistory(formattedMemoryHistory);
      
      // Xử lý dữ liệu API performance 
      const formattedApiPerformance = apiPerformanceResponse.data.map(item => {
        // Tính error rate từ mã trạng thái
        const totalRequests = item.count;
        const errorRequests = Object.entries(item.statusCodes || {})
          .filter(([code]) => code.startsWith('4') || code.startsWith('5'))
          .reduce((sum, [, count]) => sum + count, 0);
        
        const [method, endpoint] = item.endpoint.split(' ');
        
        return {
          endpoint,
          method,
          count: item.count,
          avgResponseTime: item.avgTime,
          minResponseTime: item.min,
          maxResponseTime: item.max,
          errorRate: totalRequests > 0 ? errorRequests / totalRequests : 0
        };
      });
      setApiPerformance(formattedApiPerformance);
      
      // Xử lý dữ liệu lỗi
      // Phân tích lỗi theo loại
      const errorTypes = {};
      errorHistoryResponse.data.forEach(error => {
        const type = error.context || 'Unknown';
        if (!errorTypes[type]) {
          errorTypes[type] = 0;
        }
        errorTypes[type]++;
      });
      
      // Tạo dữ liệu cho biểu đồ pie chart
      const formattedErrorTypes = Object.entries(errorTypes).map(([name, count]) => ({
        name, 
        count
      }));
      
      // Tạo dữ liệu trend lỗi theo ngày
      const errorsByDay = {};
      errorHistoryResponse.data.forEach(error => {
        const date = new Date(error.timestamp).toLocaleDateString();
        if (!errorsByDay[date]) {
          errorsByDay[date] = 0;
        }
        errorsByDay[date]++;
      });
      
      const formattedErrorTrend = Object.entries(errorsByDay).map(([date, count]) => ({
        time: new Date(date).getTime(),
        count
      }));
      
      // Tạo dữ liệu lỗi gần đây với định dạng hữu ích hơn
      const recentErrors = errorHistoryResponse.data.map(error => ({
        timestamp: error.timestamp,
        type: error.context || 'Server Error',
        message: error.message,
        stack: error.stack,
        route: 'Unknown', // API hiện tại không trả về route
        userId: 'Unknown',  // API hiện tại không trả về userId
        status: 500 // Giả định status mặc định
      }));
      
      setErrorHistory({
        errorTypes: formattedErrorTypes,
        trend: formattedErrorTrend,
        recentErrors: recentErrors
      });
    } catch (error) {
      console.error('Error fetching system monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
    
    // Cập nhật dữ liệu mỗi 10 giây
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRefresh = () => {
    fetchData();
  };
  
  if (loading && !systemInfo) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Box sx={{ p: 3, ml: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">System Monitoring</Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="CPU & Memory" />
          <Tab label="API Performance" />
          <Tab label="Errors" />
          <Tab label="Processes" />
        </Tabs>
        
        {/* Overview Tab */}
        {tabValue === 0 && systemInfo && (
          <Grid container spacing={3}>
            {/* CPU Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>CPU</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={systemInfo.cpu.usage} 
                      size={80}
                      thickness={8}
                      sx={{ 
                        color: systemInfo.cpu.usage > 80 ? 'error.main' 
                             : systemInfo.cpu.usage > 60 ? 'warning.main' 
                             : 'success.main' 
                      }}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h4">{Math.round(systemInfo.cpu.usage)}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {systemInfo.cpu.cores} cores @ {systemInfo.cpu.model}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Memory Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Memory</Typography>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Used: {((systemInfo.memory.used || 0) / 1024 / 1024 / 1024).toFixed(2)} GB</Typography>
                      <Typography variant="body2">Total: {((systemInfo.memory.total || 0) / 1024 / 1024 / 1024).toFixed(2)} GB</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemInfo.memory.usedPercent}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: systemInfo.memory.usedPercent > 80 ? 'error.main' 
                                 : systemInfo.memory.usedPercent > 60 ? 'warning.main' 
                                 : 'success.main',
                        }
                      }}
                    />
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {Math.round(systemInfo.memory.usedPercent)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Requests Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Requests</Typography>
                  <Typography variant="h4">{systemInfo.requests.perMinute}</Typography>
                  <Typography variant="body2" color="text.secondary">requests per minute</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Total: {systemInfo.requests.total} requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Uptime Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>System Uptime</Typography>
                  <Typography variant="h4">
                    {Math.floor(systemInfo.os.uptime / 86400)}d {Math.floor((systemInfo.os.uptime % 86400) / 3600)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {systemInfo.os.platform} {systemInfo.os.release} ({systemInfo.os.arch})
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Disk Usage */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Disk Usage</Typography>
                  <Grid container spacing={2}>
                    {systemInfo.disk.map((disk) => (
                      <Grid item xs={12} sm={6} md={4} key={disk.mount}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1">{disk.mount}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {disk.fs} ({disk.type})
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 1 }}>
                            <Typography variant="body2">
                              {(disk.used / 1024 / 1024 / 1024).toFixed(1)} GB used
                            </Typography>
                            <Typography variant="body2">
                              {((disk.size || 0) / 1024 / 1024 / 1024).toFixed(1)} GB total
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={disk.usedPercent}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: disk.usedPercent > 90 ? 'error.main' 
                                      : disk.usedPercent > 70 ? 'warning.main' 
                                      : 'success.main',
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                            {disk.usedPercent}%
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* CPU & Memory Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {/* CPU History Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>CPU Usage History</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cpuHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'CPU Usage']}
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="usage" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Memory History Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Memory Usage History</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={memoryHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Memory Usage']}
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* CPU Core Usage */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>CPU Core Usage</Typography>
                  <Grid container spacing={2}>
                    {systemInfo && systemInfo.cpu.coreUsage && Object.entries(systemInfo.cpu.coreUsage).map(([core, usage]) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={core}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="subtitle2">Core {parseInt(core) + 1}</Typography>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={usage}
                              size={80}
                              thickness={6}
                              sx={{ 
                                color: usage > 80 ? 'error.main' 
                                      : usage > 60 ? 'warning.main' 
                                      : 'success.main'
                              }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary">
                                {`${Math.round(usage)}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* API Performance Tab */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            {/* API Response Time Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>API Response Time</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={apiPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="endpoint" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Requests Count', angle: 90, position: 'insideRight' }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="avgResponseTime" name="Avg Response Time (ms)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="count" name="Requests Count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* API Endpoints Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>API Endpoints Performance</Typography>
                  <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Endpoint</TableCell>
                          <TableCell align="right">Calls</TableCell>
                          <TableCell align="right">Avg Response (ms)</TableCell>
                          <TableCell align="right">Min (ms)</TableCell>
                          <TableCell align="right">Max (ms)</TableCell>
                          <TableCell align="right">Error Rate</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiPerformance.map((endpoint) => (
                          <TableRow key={endpoint.endpoint}>
                            <TableCell component="th" scope="row">
                              {endpoint.method} {endpoint.endpoint}
                            </TableCell>
                            <TableCell align="right">{endpoint.count}</TableCell>
                            <TableCell align="right">{(endpoint.avgResponseTime || 0).toFixed(2)}</TableCell>
                            <TableCell align="right">{endpoint.minResponseTime}</TableCell>
                            <TableCell align="right">{endpoint.maxResponseTime}</TableCell>
                            <TableCell align="right">{`${((endpoint.errorRate || 0) * 100).toFixed(1)}%`}</TableCell>
                            <TableCell>
                              <Chip 
                                label={endpoint.errorRate > 0.05 ? "Issues" : "Healthy"} 
                                color={endpoint.errorRate > 0.05 ? "error" : "success"} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Errors Tab */}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            {/* Error Types Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Error Types Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={errorHistory.errorTypes || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {errorHistory.errorTypes && errorHistory.errorTypes.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][i % 5]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value} errors`, 'Error Type']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Error Trend Line Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Error Trend</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={errorHistory.trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleDateString()} />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} errors`, 'Count']}
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                      />
                      <Line type="monotone" dataKey="count" stroke="#ff5252" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Recent Errors Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Errors</Typography>
                  <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Route</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errorHistory.recentErrors && errorHistory.recentErrors.map((error, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(error.timestamp).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={error.type}
                                color={
                                  error.type === 'Server Error' ? 'error' : 
                                  error.type === 'Validation Error' ? 'warning' : 
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={error.stack || 'No stack trace available'}>
                                <Typography variant="body2" sx={{ 
                                  maxWidth: 300, 
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {error.message}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>{error.route}</TableCell>
                            <TableCell>{error.userId || 'Không xác định'}</TableCell>
                            <TableCell>{error.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Processes Tab */}
        {tabValue === 4 && (
          <Grid container spacing={0}>
            {/* Process List */}
            <Grid item xs={12}>
              <Card sx={{ width: '100%', maxWidth: '100%', mt: 2, boxShadow: 'none', borderRadius: 0 }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" sx={{ p: 2, pb: 1 }}>System Processes</Typography>
                  <Paper sx={{ width: '100%', overflow: 'auto', boxShadow: 'none' }}>
                    <Table sx={{ minWidth: '100%' }} size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell width="8%">PID</TableCell>
                          <TableCell width="24%">Name</TableCell>
                          <TableCell width="12%" align="right">CPU (%)</TableCell>
                          <TableCell width="12%" align="right">Memory (%)</TableCell>
                          <TableCell width="14%" align="right">Memory Usage</TableCell>
                          <TableCell width="14%">Status</TableCell>
                          <TableCell width="16%">Started</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {systemInfo && systemInfo.processes && systemInfo.processes.map((process) => (
                          <TableRow key={process.pid} hover>
                            <TableCell>{process.pid}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                maxWidth: '100%', 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {process.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                color={
                                  process.cpu > 50 ? 'error.main' :
                                  process.cpu > 20 ? 'warning.main' :
                                  'inherit'
                                }
                              >
                                {(process.cpu || 0).toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                color={
                                  process.memPercent > 10 ? 'error.main' :
                                  process.memPercent > 5 ? 'warning.main' :
                                  'inherit'
                                }
                              >
                                {(process.memPercent || 0).toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {((process.mem || 0) / (1024 * 1024)).toFixed(1)} MB
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={process.status} 
                                color={
                                  process.status === 'running' ? 'success' :
                                  process.status === 'sleeping' ? 'primary' :
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(process.started).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
}