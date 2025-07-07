import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as si from 'systeminformation'; // Cần cài đặt: npm install systeminformation

@Injectable()
export class SystemMonitorService {
  private static cpuHistory = [];
  private static memoryHistory = [];
  private static requestHistory = [];
  private static errorHistory = [];
  private static requestsPerMinute = 0;
  private static requestCounter = 0;

  constructor() {
    // Khởi động việc thu thập dữ liệu mỗi 5 giây
    setInterval(() => this.collectSystemInfo(), 5000);

    // Đặt lại bộ đếm request mỗi phút
    setInterval(() => {
      SystemMonitorService.requestsPerMinute = SystemMonitorService.requestCounter;
      SystemMonitorService.requestCounter = 0;
    }, 60000);
  }

  async collectSystemInfo() {
    try {
      // Thông tin CPU
      const cpuLoad = await si.currentLoad();
      const cpuTemp = await si.cpuTemperature();

      // Thông tin memory
      const memory = await si.mem();

      // Thông tin disk
      const disk = await si.fsSize();

      // Thông tin network
      const networkStats = await si.networkStats();

      // Thông tin process
      const processInfo = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      };

      // Lưu vào lịch sử (giữ tối đa 100 điểm dữ liệu)
      const timestamp = new Date();

      SystemMonitorService.cpuHistory.push({
        timestamp,
        usage: cpuLoad.currentLoad,
        temp: cpuTemp.main || 0,
      });

      SystemMonitorService.memoryHistory.push({
        timestamp,
        total: memory.total,
        used: memory.used,
        free: memory.free,
      });

      // Giới hạn kích thước lịch sử
      if (SystemMonitorService.cpuHistory.length > 100) {
        SystemMonitorService.cpuHistory.shift();
      }

      if (SystemMonitorService.memoryHistory.length > 100) {
        SystemMonitorService.memoryHistory.shift();
      }
    } catch (error) {
      console.error('Error collecting system information:', error);
    }
  }

  // Ghi lại request mới
  static logRequest(method: string, url: string, statusCode: number, responseTime: number) {
    this.requestCounter++;

    this.requestHistory.push({
      timestamp: new Date(),
      method,
      url,
      statusCode,
      responseTime,
    });

    // Giới hạn kích thước lịch sử
    if (this.requestHistory.length > 1000) {
      this.requestHistory.shift();
    }
  }

  // Ghi lại lỗi mới
  static logError(error: Error, context: string) {
    this.errorHistory.push({
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context,
    });

    // Giới hạn kích thước lịch sử
    if (this.errorHistory.length > 100) {
      this.errorHistory.shift();
    }
  }

  // Lấy thông tin hệ thống hiện tại
  async getCurrentSystemInfo() {
    try {
      const [cpuLoad, cpuTemp, memory, disk, networkStats, processes] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.processes(),
      ]);

      return {
        cpu: {
          usage: cpuLoad.currentLoad,
          cores: os.cpus().length,
          temp: cpuTemp.main || 0,
          model: os.cpus()[0].model,
        },
        memory: {
          total: memory.total,
          used: memory.used,
          free: memory.free,
          usedPercent: (memory.used / memory.total) * 100,
        },
        disk: disk.map(d => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          usedPercent: d.use,
          mount: d.mount,
        })),
        network: networkStats.map(n => ({
          interface: n.iface,
          bytesReceived: n.rx_bytes,
          bytesSent: n.tx_bytes,
          packetsReceived: n.rx_bytes || 0,
          packetsSent: n.tx_bytes || 0,
          errors: (n.rx_errors || 0) + (n.tx_errors || 0),
        })),
        os: {
          platform: os.platform(),
          release: os.release(),
          uptime: os.uptime(),
          hostname: os.hostname(),
          arch: os.arch(),
        },
        process: {
          count: processes.all,
          running: processes.running,
          blocked: processes.blocked,
          sleeping: processes.sleeping,
        },
        requests: {
          perMinute: SystemMonitorService.requestsPerMinute,
          total: SystemMonitorService.requestHistory.length,
        },
        errors: {
          count: SystemMonitorService.errorHistory.length,
        },
      };
    } catch (error) {
      console.error('Error getting current system info:', error);
      throw error;
    }
  }

  // Lấy lịch sử CPU
  getCpuHistory() {
    return SystemMonitorService.cpuHistory;
  }

  // Lấy lịch sử memory
  getMemoryHistory() {
    return SystemMonitorService.memoryHistory;
  }

  // Lấy lịch sử request
  getRequestHistory() {
    return SystemMonitorService.requestHistory;
  }

  // Lấy lịch sử lỗi
  getErrorHistory() {
    return SystemMonitorService.errorHistory;
  }

  // Phân tích hiệu suất API
  getApiPerformance() {
    interface ApiStat {
      count: number;
      totalTime: number;
      avgTime: number;
      min: number;
      max: number;
      statusCodes: Record<string, number>;
    }

    const apiStats: Record<string, ApiStat> = {};

    // Nhóm request theo endpoint
    SystemMonitorService.requestHistory.forEach(req => {
      const endpoint = `${req.method} ${req.url.split('?')[0]}`;

      if (!apiStats[endpoint]) {
        apiStats[endpoint] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
          min: Infinity,
          max: 0,
          statusCodes: {},
        };
      }

      const stats = apiStats[endpoint];
      stats.count++;
      stats.totalTime += req.responseTime;
      stats.avgTime = stats.totalTime / stats.count;
      stats.min = Math.min(stats.min, req.responseTime);
      stats.max = Math.max(stats.max, req.responseTime);

      // Đếm mã trạng thái
      const statusCode = req.statusCode.toString();
      stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
    });

    // Sử dụng as để chỉ định kiểu rõ ràng cho Object.entries
    return Object.entries(apiStats).map(([endpoint, stats]: [string, ApiStat]) => ({
      endpoint,
      ...stats
    }));
  }
}
