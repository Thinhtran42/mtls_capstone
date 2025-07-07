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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';


@ApiTags('lessons')
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài học mới' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Bài học đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createLessonDto: CreateLessonDto) {
    try {
      const lesson = await this.lessonService.create(createLessonDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Lesson created successfully',
        data: lesson,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài học' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài học' })
  async findAll() {
    try {
      const lessons = await this.lessonService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lessons retrieved successfully',
        data: lessons,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bài học theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bài học' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin bài học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async findOne(@Param('id') id: string) {
    try {
      const lesson = await this.lessonService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lesson retrieved successfully',
        data: lesson,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Lấy danh sách bài học theo section' })
  @ApiParam({ name: 'sectionId', description: 'ID của section' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài học của section' })
  async findBySection(@Param('sectionId') sectionId: string) {
    try {
      const lessons = await this.lessonService.findBySection(sectionId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lessons retrieved successfully',
        data: lessons,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài học' })
  @ApiParam({ name: 'id', description: 'ID của bài học' })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({ status: 200, description: 'Bài học đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    try {
      const lesson = await this.lessonService.update(id, updateLessonDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lesson updated successfully',
        data: lesson,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiParam({ name: 'id', description: 'ID của bài học' })
  @ApiResponse({ status: 200, description: 'Bài học đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài học' })
  async remove(@Param('id') id: string) {
    try {
      await this.lessonService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lesson deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('section/:sectionId')
  @ApiOperation({ summary: 'Thêm bài học vào section' })
  @ApiParam({ name: 'sectionId', description: 'ID của section' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Bài học đã được thêm vào section' })
  async addLessonToSection(
    @Param('sectionId') sectionId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    try {
      const lesson = await this.lessonService.addLessonToSection(sectionId, createLessonDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Lesson added to section successfully',
        data: lesson,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}