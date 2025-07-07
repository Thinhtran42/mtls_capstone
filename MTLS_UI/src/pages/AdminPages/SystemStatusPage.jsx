import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";
import AdminLayout from "../../components/layout/admin/AdminLayout";

const SystemStatusContent = () => {
  const [systemData, setSystemData] = useState({
    serverStatus: "Online",
    cpuUsage: 28,
    memoryUsage: 42,
    diskSpace: 35,
    networkLatency: "Good",
    activeUsers: 218,
    lastChecked: new Date().toLocaleString(),
    incidents: [],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // Giả lập việc làm mới dữ liệu
  const refreshSystemData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSystemData({
        ...systemData,
        cpuUsage: Math.floor(Math.random() * 40) + 20,
        memoryUsage: Math.floor(Math.random() * 30) + 30,
        diskSpace: Math.floor(Math.random() * 20) + 30,
        activeUsers: Math.floor(Math.random() * 100) + 150,
        lastChecked: new Date().toLocaleString(),
      });
      setIsRefreshing(false);
      setAlertOpen(true);
    }, 1500);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Xác định màu sắc dựa trên mức sử dụng
  const getStatusColor = (value) => {
    if (value < 40) return "success";
    if (value < 70) return "warning";
    return "error";
  };

  return (
    <Box p={3} alignItems="center" sx={{ backgroundColor: "#f4f6f8" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        height="10vh"
      >
        <Typography variant="h4" fontWeight={600} color="#333">
          System Status
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutorenewIcon />}
          onClick={refreshSystemData}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </Box>

      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{ width: "100%" }}
        >
          System data updated successfully!
        </Alert>
      </Snackbar>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              position: "relative",
              overflow: "visible",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  position: "absolute",
                  top: -15,
                  left: 20,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CloudIcon sx={{ color: "white" }} />
              </Box>
              <Box pt={3} pb={1}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Server Status
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h5" fontWeight={600}>
                    {systemData.serverStatus}
                  </Typography>
                  <Chip
                    label="Healthy"
                    color="success"
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 500 }}
                  />
                </Stack>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last checked: {systemData.lastChecked}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              position: "relative",
              overflow: "visible",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  position: "absolute",
                  top: -15,
                  left: 20,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "warning.main",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <MemoryIcon sx={{ color: "white" }} />
              </Box>
              <Box pt={3} pb={1}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  CPU Usage
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {systemData.cpuUsage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemData.cpuUsage}
                color={getStatusColor(systemData.cpuUsage)}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Running optimally
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              position: "relative",
              overflow: "visible",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  position: "absolute",
                  top: -15,
                  left: 20,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "info.main",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <StorageIcon sx={{ color: "white" }} />
              </Box>
              <Box pt={3} pb={1}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Memory Usage
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {systemData.memoryUsage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemData.memoryUsage}
                color={getStatusColor(systemData.memoryUsage)}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {8 - Math.floor(systemData.memoryUsage / 12.5)}GB free of 8GB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              position: "relative",
              overflow: "visible",
              height: "100%",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  position: "absolute",
                  top: -15,
                  left: 20,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: "success.main",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <NetworkIcon sx={{ color: "white" }} />
              </Box>
              <Box pt={3} pb={1}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Active Users
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {systemData.activeUsers}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {systemData.activeUsers < 200
                  ? "Normal traffic"
                  : "High traffic"}
              </Typography>
              <Chip
                label={systemData.networkLatency}
                color="success"
                size="small"
                sx={{ borderRadius: 1, fontWeight: 500 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed System Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} mb={3}>
              System Resources
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  CPU Usage
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Core 1</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.cpuUsage * 0.8)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.cpuUsage * 0.8}
                    color={getStatusColor(systemData.cpuUsage * 0.8)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Core 2</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.cpuUsage * 1.1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.cpuUsage * 1.1}
                    color={getStatusColor(systemData.cpuUsage * 1.1)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Core 3</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.cpuUsage * 0.7)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.cpuUsage * 0.7}
                    color={getStatusColor(systemData.cpuUsage * 0.7)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Core 4</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.cpuUsage * 0.9)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.cpuUsage * 0.9}
                    color={getStatusColor(systemData.cpuUsage * 0.9)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Storage Usage
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">System Disk (C:)</Typography>
                    <Typography variant="body2">
                      {systemData.diskSpace}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.diskSpace}
                    color={getStatusColor(systemData.diskSpace)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Data Disk (D:)</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.diskSpace * 0.7)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.diskSpace * 0.7}
                    color={getStatusColor(systemData.diskSpace * 0.7)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Database Storage</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.diskSpace * 1.2)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(systemData.diskSpace * 1.2, 100)}
                    color={getStatusColor(systemData.diskSpace * 1.2)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Backup Storage</Typography>
                    <Typography variant="body2">
                      {Math.floor(systemData.diskSpace * 0.5)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={systemData.diskSpace * 0.5}
                    color={getStatusColor(systemData.diskSpace * 0.5)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} mb={3}>
              System Health
            </Typography>

            <Stack spacing={2}>
              <Box
                p={2}
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color="success.main"
                >
                  All Services Running
                </Typography>
                <Typography variant="body2">
                  Web server, database, and API services are operating normally.
                </Typography>
              </Box>

              <Box
                p={2}
                sx={{
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color="info.main"
                >
                  Database Connection
                </Typography>
                <Typography variant="body2">
                  Connection pool: 15/50 active connections
                </Typography>
              </Box>

              <Box
                p={2}
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(255, 152, 0, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color="warning.main"
                >
                  Scheduled Maintenance
                </Typography>
                <Typography variant="body2">
                  System backup scheduled for tonight at 2:00 AM.
                </Typography>
              </Box>

              <Box
                p={2}
                sx={{
                  backgroundColor: "rgba(156, 39, 176, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(156, 39, 176, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  sx={{ color: "#9c27b0" }}
                >
                  Security Status
                </Typography>
                <Typography variant="body2">
                  Firewall active. Last scan: 2 hours ago.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const SystemStatusPage = () => {
  return (
    <AdminLayout>
      <SystemStatusContent />
    </AdminLayout>
  );
};

export default SystemStatusPage;
