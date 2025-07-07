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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(@Body() createCourseDto: CreateCourseDto, @GetUser() user) {
    try {
      console.log('User from token:', user); // Log để debug

      // Lấy ID từ token (có thể là sub hoặc userId)
      const teacherId = user.sub || user.userId;

      if (!teacherId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Teacher ID from token:', teacherId);

      // Tự động gán teacher ID từ token
      const course = await this.courseService.createCourse(
        createCourseDto,
        teacherId,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Course created successfully',
        data: course,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw new HttpException(
        error.message || 'Error creating course',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Return all courses' })
  async findAll() {
    try {
      const courses = await this.courseService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Courses retrieved successfully',
        data: courses,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Return the course' })
  async findById(@Param('id') id: string) {
    try {
      const course = await this.courseService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Course retrieved successfully',
        data: course,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Get courses by teacher ID' })
  @ApiResponse({ status: 200, description: 'Return courses for the teacher' })
  async findByTeacherId(@Param('teacherId') teacherId: string) {
    try {
      const courses = await this.courseService.findByTeacherId(teacherId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Courses retrieved successfully',
        data: courses,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    try {
      const course = await this.courseService.update(id, updateCourseDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Course updated successfully',
        data: course,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async remove(@Param('id') id: string) {
    try {
      const course = await this.courseService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Course deleted successfully',
        data: course,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':courseId/:studentId/progress')
  @ApiOperation({
    summary: 'Lấy chi tiết khóa học kèm tiến trình của học sinh',
  })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiResponse({
    status: 200,
    description: 'Return course details with progress',
  })
  async getCourseWithProgress(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
  ) {
    try {
      const courseDetails =
        await this.courseService.getCourseDetailWithProgress(
          courseId,
          studentId,
        );

      return {
        statusCode: HttpStatus.OK,
        message: 'Course details with progress retrieved successfully',
        data: courseDetails,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':courseId/structure')
  @ApiOperation({
    summary: 'Lấy chi tiết khóa học',
  })
  @ApiParam({ name: 'courseId', description: 'ID của khóa học' })
  @ApiResponse({
    status: 200,
    description: 'Return course details with progress',
  })
  async getCourseWithStructure(@Param('courseId') courseId: string) {
    try {
      const courseDetails =
        await this.courseService.getCourseWithStructure(courseId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Course details with structure retrieved successfully',
        data: courseDetails,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
