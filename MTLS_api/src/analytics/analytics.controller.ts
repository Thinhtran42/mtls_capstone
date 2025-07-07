import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Lấy thông tin tổng quan cho dashboard' })
  @ApiResponse({ status: 200, description: 'Thông tin tổng quan dashboard' })
  async getDashboardOverview() {
    try {
      const data = await this.analyticsService.getDashboardOverview();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin tổng quan dashboard thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy thông tin tổng quan dashboard',
        error: error.message,
      };
    }
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Lấy dữ liệu hoạt động người dùng theo thời gian' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Phạm vi thời gian (day, week, month, year)' })
  @ApiResponse({ status: 200, description: 'Dữ liệu hoạt động người dùng' })
  async getUserActivity(@Query('timeRange') timeRange = 'week') {
    try {
      const data = await this.analyticsService.getUserActivity(timeRange);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu hoạt động người dùng thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu hoạt động người dùng',
        error: error.message,
      };
    }
  }

  @Get('user-distribution')
  @ApiOperation({ summary: 'Lấy phân phối người dùng theo vai trò' })
  @ApiResponse({ status: 200, description: 'Phân phối người dùng' })
  async getUserDistribution() {
    try {
      const data = await this.analyticsService.getUserDistribution();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy phân phối người dùng thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy phân phối người dùng',
        error: error.message,
      };
    }
  }

  @Get('user-registration-trend')
  @ApiOperation({ summary: 'Lấy dữ liệu đăng ký người dùng theo tháng' })
  @ApiResponse({ status: 200, description: 'Dữ liệu đăng ký người dùng' })
  async getUserRegistrationTrend() {
    try {
      const data = await this.analyticsService.getUserRegistrationTrend();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu đăng ký người dùng thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu đăng ký người dùng',
        error: error.message,
      };
    }
  }

  @Get('course-completion-rates')
  @ApiOperation({ summary: 'Lấy tỷ lệ hoàn thành khóa học' })
  @ApiResponse({ status: 200, description: 'Tỷ lệ hoàn thành khóa học' })
  async getCourseCompletionRates() {
    try {
      const data = await this.analyticsService.getCourseCompletionRates();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy tỷ lệ hoàn thành khóa học thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy tỷ lệ hoàn thành khóa học',
        error: error.message,
      };
    }
  }

  @Get('storage-usage')
  @ApiOperation({ summary: 'Lấy dữ liệu sử dụng lưu trữ' })
  @ApiResponse({ status: 200, description: 'Dữ liệu sử dụng lưu trữ' })
  async getStorageUsage() {
    try {
      const data = await this.analyticsService.getStorageUsage();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu sử dụng lưu trữ thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu sử dụng lưu trữ',
        error: error.message,
      };
    }
  }

  @Get('course-performance')
  @ApiOperation({ summary: 'Lấy thông tin điểm trung bình và hoàn thành khóa học' })
  @ApiResponse({ status: 200, description: 'Dữ liệu điểm trung bình và hoàn thành khóa học' })
  async getCoursePerformanceAnalytics() {
    try {
      const data = await this.analyticsService.getCoursePerformanceAnalytics();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu điểm trung bình và hoàn thành khóa học thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu điểm trung bình và hoàn thành khóa học',
        error: error.message,
      };
    }
  }

  @Get('popular-content')
  @ApiOperation({ summary: 'Lấy nội dung phổ biến' })
  @ApiResponse({ status: 200, description: 'Dữ liệu nội dung phổ biến' })
  async getPopularContent() {
    try {
      const data = await this.analyticsService.getPopularContent();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu nội dung phổ biến thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu nội dung phổ biến',
        error: error.message,
      };
    }
  }

  @Get('learning-time')
  @ApiOperation({ summary: 'Lấy phân tích thời gian học tập' })
  @ApiResponse({ status: 200, description: 'Dữ liệu phân tích thời gian học tập' })
  async getLearningTimeAnalytics() {
    try {
      const data = await this.analyticsService.getLearningTimeAnalytics();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu phân tích thời gian học tập thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu phân tích thời gian học tập',
        error: error.message,
      };
    }
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Lấy hoạt động gần đây của người dùng' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng hoạt động tối đa' })
  @ApiResponse({ status: 200, description: 'Dữ liệu hoạt động gần đây' })
  async getRecentActivities(@Query('limit') limit = '5') {
    try {
      const limitNumber = parseInt(limit, 10);
      const data = await this.analyticsService.getRecentActivities(limitNumber);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy dữ liệu hoạt động gần đây thành công',
        data,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Lỗi khi lấy dữ liệu hoạt động gần đây',
        error: error.message,
      };
    }
  }
}
