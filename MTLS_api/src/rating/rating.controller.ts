import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đánh giá mới cho khóa học' })
  @ApiResponse({ status: 201, description: 'Đánh giá đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Học viên đã đánh giá khóa học này' })
  async create(@Body() createRatingDto: CreateRatingDto, @GetUser() user) {
    try {
      // Lấy ID từ token
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const rating = await this.ratingService.create(createRatingDto, studentId);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Đánh giá đã được tạo thành công',
        data: rating
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả đánh giá' })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá' })
  async findAll() {
    try {
      const ratings = await this.ratingService.findAll();

      return {
        statusCode: HttpStatus.OK,
        message: 'Danh sách đánh giá',
        data: ratings
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy đánh giá theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin đánh giá' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá' })
  async findOne(@Param('id') id: string) {
    try {
      const rating = await this.ratingService.findById(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Thông tin đánh giá',
        data: rating
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Get('student/my-ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy đánh giá của học viên hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá của học viên' })
  async findMyRatings(@GetUser() user) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const ratings = await this.ratingService.findByStudent(studentId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Danh sách đánh giá của bạn',
        data: ratings
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đánh giá' })
  @ApiResponse({ status: 200, description: 'Đánh giá đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá hoặc không có quyền' })
  async update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto, @GetUser() user) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const rating = await this.ratingService.update(id, updateRatingDto, studentId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Đánh giá đã được cập nhật',
        data: rating
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiResponse({ status: 200, description: 'Đánh giá đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá hoặc không có quyền' })
  async remove(@Param('id') id: string, @GetUser() user) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const rating = await this.ratingService.remove(id, studentId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Đánh giá đã được xóa',
        data: rating
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Get('course/:courseId/stats')
  @ApiOperation({ summary: 'Lấy thống kê đánh giá của khóa học' })
  @ApiResponse({ status: 200, description: 'Thống kê đánh giá' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' })
  async getCourseRatingStats(@Param('courseId') courseId: string) {
    try {
      const stats = await this.ratingService.getCourseRatingStats(courseId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Thống kê đánh giá của khóa học',
        data: stats
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Get('student/:studentId/course/:courseId')
  @ApiOperation({ summary: 'Lấy đánh giá của học viên cho khóa học cụ thể' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiResponse({ status: 200, description: 'Trả về đánh giá của học viên' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đánh giá' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  async findByStudentAndCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    try {
      const rating = await this.ratingService.findByStudentAndCourse(studentId, courseId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student rating retrieved successfully',
        data: rating,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve rating',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đánh giá' })
  @ApiResponse({ status: 400, description: 'ID học viên không hợp lệ' })
  async findByStudent(@Param('studentId') studentId: string) {
    try {
      const result = await this.ratingService.findByStudent(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student ratings retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve ratings',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của khóa học' })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đánh giá' })
  @ApiResponse({ status: 400, description: 'ID khóa học không hợp lệ' })
  async findByCourse(@Param('courseId') courseId: string) {
    try {
      const result = await this.ratingService.findByCourse(courseId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Course ratings retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve ratings',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}