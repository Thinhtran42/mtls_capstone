import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('analytics/system')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('admin')
export class SystemMonitorController {
  constructor(private readonly systemMonitorService: SystemMonitorService) {}

  @Get('current')
  async getCurrentSystemInfo() {
    const data = await this.systemMonitorService.getCurrentSystemInfo();
    return {
      statusCode: 200,
      message: 'Lấy thông tin hệ thống hiện tại thành công',
      data,
    };
  }

  @Get('cpu-history')
  getCpuHistory() {
    const data = this.systemMonitorService.getCpuHistory();
    return {
      statusCode: 200,
      message: 'Lấy lịch sử CPU thành công',
      data,
    };
  }

  @Get('memory-history')
  getMemoryHistory() {
    const data = this.systemMonitorService.getMemoryHistory();
    return {
      statusCode: 200,
      message: 'Lấy lịch sử memory thành công',
      data,
    };
  }

  @Get('request-history')
  getRequestHistory() {
    const data = this.systemMonitorService.getRequestHistory();
    return {
      statusCode: 200,
      message: 'Lấy lịch sử request thành công',
      data,
    };
  }

  @Get('error-history')
  getErrorHistory() {
    const data = this.systemMonitorService.getErrorHistory();
    return {
      statusCode: 200,
      message: 'Lấy lịch sử lỗi thành công',
      data,
    };
  }

  @Get('api-performance')
  getApiPerformance() {
    const data = this.systemMonitorService.getApiPerformance();
    return {
      statusCode: 200,
      message: 'Lấy thông tin hiệu suất API thành công',
      data,
    };
  }
}
