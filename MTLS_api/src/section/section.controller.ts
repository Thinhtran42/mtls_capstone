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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from '../lesson/dto/create-lesson.dto';

@ApiTags('sections')
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo section mới trong module học' })
  @ApiBody({ type: CreateSectionDto })
  @ApiResponse({ status: 201, description: 'Section đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createSectionDto: CreateSectionDto) {
    try {
      const section = await this.sectionService.create(createSectionDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Section created successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả section' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách section' })
  async findAll() {
    try {
      const sections = await this.sectionService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin section theo ID' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin section' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy section' })
  async findById(@Param('id') id: string) {
    try {
      const section = await this.sectionService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Section retrieved successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách section theo module' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách section của module',
  })
  async findByModuleId(@Param('moduleId') moduleId: string) {
    try {
      const sections = await this.sectionService.findByModuleId(moduleId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy danh sách section theo loại' })
  @ApiParam({ name: 'type', description: 'Loại section (lesson, quiz, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách section theo loại',
  })
  async findByType(@Param('type') type: string) {
    try {
      const sections = await this.sectionService.findByType(type);
      return {
        statusCode: HttpStatus.OK,
        message: 'Sections retrieved successfully',
        data: sections,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiBody({ type: UpdateSectionDto })
  @ApiResponse({ status: 200, description: 'Section đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy section' })
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    try {
      const section = await this.sectionService.update(id, updateSectionDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Section updated successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiBody({ schema: { properties: { isActive: { type: 'boolean' } } } })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái section đã được cập nhật',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    try {
      const section = await this.sectionService.updateStatus(id, isActive);
      return {
        statusCode: HttpStatus.OK,
        message: 'Section status updated successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({ status: 200, description: 'Section đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy section' })
  async remove(@Param('id') id: string) {
    try {
      const section = await this.sectionService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Section deleted successfully',
        data: section,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/lessons')
  @ApiOperation({ summary: 'Thêm bài học vào section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Bài học đã được thêm vào section' })
  async addLessonToSection(
    @Param('id') id: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    try {
      const lesson = await this.sectionService.addLessonToSection(
        id,
        createLessonDto,
      );
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
