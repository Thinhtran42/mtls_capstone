import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('notes')
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo ghi chú mới cho module' })
  @ApiResponse({ status: 201, description: 'Ghi chú đã được tạo thành công' })
  async create(@Body() createNoteDto: CreateNoteDto, @GetUser() user) {
    try {
      // Lấy ID từ token
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const note = await this.noteService.create(createNoteDto, studentId);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Note created successfully',
        data: note,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả ghi chú' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách ghi chú' })
  async findAll() {
    try {
      const result = await this.noteService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Notes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin ghi chú theo ID' })
  @ApiParam({ name: 'id', description: 'ID của ghi chú' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin ghi chú' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú' })
  async findOne(@Param('id') id: string) {
    try {
      const note = await this.noteService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Note retrieved successfully',
        data: note,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật ghi chú' })
  @ApiParam({ name: 'id', description: 'ID của ghi chú' })
  @ApiResponse({ status: 200, description: 'Ghi chú đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú hoặc không có quyền' })
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @GetUser() user
  ) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const note = await this.noteService.update(id, updateNoteDto, studentId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Note updated successfully',
        data: note,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa ghi chú' })
  @ApiParam({ name: 'id', description: 'ID của ghi chú' })
  @ApiResponse({ status: 200, description: 'Ghi chú đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú hoặc không có quyền' })
  async remove(@Param('id') id: string, @GetUser() user) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const note = await this.noteService.remove(id, studentId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Note deleted successfully',
        data: note,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Get('student/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách ghi chú của học viên đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách ghi chú' })
  async findMyNotes(@GetUser() user) {
    try {
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException('User ID not found in token', HttpStatus.BAD_REQUEST);
      }

      const result = await this.noteService.findByStudentId(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Notes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách ghi chú của học viên theo ID' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách ghi chú' })
  async findByStudentId(@Param('studentId') studentId: string) {
    try {
      const result = await this.noteService.findByStudentId(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Notes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách ghi chú của module theo ID' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách ghi chú' })
  async findByModuleId(@Param('moduleId') moduleId: string) {
    try {
      const result = await this.noteService.findByModuleId(moduleId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Notes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('student/:studentId/module/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách ghi chú của học viên cho một module cụ thể' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách ghi chú' })
  async findByStudentAndModule(
    @Param('studentId') studentId: string,
    @Param('moduleId') moduleId: string
  ) {
    try {
      const result = await this.noteService.findByStudentAndModule(studentId, moduleId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Notes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}