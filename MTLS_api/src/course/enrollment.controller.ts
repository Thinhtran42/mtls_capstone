import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @GetUser() user
  ) {
    try {
      console.log('User from token:', user); // Log để debug

      // Lấy ID từ token (học viên)
      const studentId = user.sub || user.userId || user._id;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      console.log('Student ID from token:', studentId);

      // Tự động gán student ID từ token vào DTO
      createEnrollmentDto.student = studentId;

      const enrollment = await this.enrollmentService.create(createEnrollmentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Enrollment created successfully',
        data: enrollment,
      };
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw new HttpException(
        error.message || 'Error creating enrollment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đăng ký' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đăng ký' })
  async findAll() {
    try {
      const enrollments = await this.enrollmentService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin đăng ký theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đăng ký' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin đăng ký' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async findById(@Param('id') id: string) {
    try {
      const enrollment = await this.enrollmentService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollment retrieved successfully',
        data: enrollment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách đăng ký theo học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đăng ký của học viên' })
  async findByStudentId(@Param('studentId') studentId: string) {
    try {
      const enrollments = await this.enrollmentService.findByStudentId(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Lấy danh sách đăng ký theo khóa học' })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách đăng ký của khóa học' })
  async findByCourseId(@Param('courseId') courseId: string) {
    try {
      const enrollments = await this.enrollmentService.findByCourseId(courseId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollments retrieved successfully',
        data: enrollments,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('student/:studentId/course/:courseId')
  @ApiOperation({ summary: 'Kiểm tra đăng ký của học viên cho khóa học' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin đăng ký' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async findByStudentAndCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    try {
      const enrollment = await this.enrollmentService.findByStudentAndCourse(
        studentId,
        courseId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollment retrieved successfully',
        data: enrollment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin đăng ký' })
  @ApiParam({ name: 'id', description: 'ID của đăng ký' })
  @ApiResponse({ status: 200, description: 'Đăng ký đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    try {
      const enrollment = await this.enrollmentService.update(
        id,
        updateEnrollmentDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollment updated successfully',
        data: enrollment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy đăng ký khóa học' })
  @ApiParam({ name: 'id', description: 'ID của đăng ký' })
  @ApiResponse({ status: 200, description: 'Đăng ký đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  async remove(@Param('id') id: string) {
    try {
      const enrollment = await this.enrollmentService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Enrollment deleted successfully',
        data: enrollment,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
