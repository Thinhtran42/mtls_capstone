import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LessonProgressService } from './lesson-progress.service';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('lesson-progress')
@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bản ghi tiến độ bài học mới' })
  @ApiResponse({ status: 201, description: 'Bản ghi tiến độ đã được tạo thành công.' })
  async create(@Body() createLessonProgressDto: CreateLessonProgressDto, @GetUser() user) {
    try {
      console.log('User from token:', user); // Log để debug

      const studentId = user.sub || user.userId;
      if (!studentId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('Student ID from token:', studentId);
      // Tự động gán student ID từ token
      const lessonProgress = await this.lessonProgressService.create(
        createLessonProgressDto,
        studentId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Lesson progress created successfully',
        data: lessonProgress,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating lesson progress',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bản ghi tiến độ' })
  @ApiResponse({ status: 200, description: 'Danh sách bản ghi tiến độ.' })
  async findAll() {
    try {
      const progressRecords = await this.lessonProgressService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Progress records retrieved successfully',
        data: progressRecords,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving progress records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi tiến độ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi tiến độ' })
  @ApiResponse({ status: 200, description: 'Thông tin bản ghi tiến độ.' })
  async findOne(@Param('id') id: string) {
    try {
      const progressRecord = await this.lessonProgressService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Progress record retrieved successfully',
        data: progressRecord,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving progress record',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách tiến độ của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Danh sách tiến độ của học viên.' })
  async findByStudent(@Param('studentId') studentId: string) {
    try {
      const progressRecords = await this.lessonProgressService.findByStudent(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student progress records retrieved successfully',
        data: progressRecords,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving student progress records',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:studentId/lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy tiến độ của học viên cho một bài học cụ thể' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'lessonId', description: 'ID của bài học' })
  @ApiResponse({ status: 200, description: 'Tiến độ của học viên cho bài học.' })
  async findByStudentAndLesson(
    @Param('studentId') studentId: string,
    @Param('lessonId') lessonId: string,
  ) {
    try {
      const progressRecord = await this.lessonProgressService.findByStudentAndLesson(
        studentId,
        lessonId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Student lesson progress retrieved successfully',
        data: progressRecord,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving student lesson progress',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tiến độ học tập' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi tiến độ' })
  @ApiResponse({ status: 200, description: 'Tiến độ học tập đã được cập nhật.' })
  async update(
    @Param('id') id: string,
    @Body() updateLessonProgressDto: UpdateLessonProgressDto,
  ) {
    try {
      const updatedProgress = await this.lessonProgressService.update(
        id,
        updateLessonProgressDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Progress record updated successfully',
        data: updatedProgress,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating progress record',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bản ghi tiến độ học tập' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi tiến độ' })
  @ApiResponse({ status: 200, description: 'Bản ghi tiến độ đã được xóa.' })
  async remove(@Param('id') id: string) {
    try {
      const deletedProgress = await this.lessonProgressService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Progress record deleted successfully',
        data: deletedProgress,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting progress record',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
} 