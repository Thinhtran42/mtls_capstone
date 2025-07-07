import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import {
  Assignment,
  AssignmentWithSubmissions,
} from './schemas/assignment.schema';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo bài tập mới' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({ status: 201, description: 'Bài tập đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài tập được giao' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài tập được giao',
  })
  async findAll() {
    try {
      const result = await this.assignmentService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Assignments retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bài tập theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin bài tập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  findOne(@Param('id') id: string): Promise<Assignment> {
    return this.assignmentService.findOne(id);
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Lấy danh sách bài tập theo section' })
  @ApiParam({ name: 'sectionId', description: 'ID của section' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài tập của section',
  })
  findBySection(@Param('sectionId') sectionId: string): Promise<Assignment[]> {
    return this.assignmentService.findBySection(sectionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiResponse({ status: 200, description: 'Bài tập đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({ status: 200, description: 'Bài tập đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  remove(@Param('id') id: string): Promise<void> {
    return this.assignmentService.remove(id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp của bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về bài tập và danh sách bài nộp',
  })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  findOneWithSubmissions(
    @Param('id') id: string,
  ): Promise<AssignmentWithSubmissions> {
    return this.assignmentService.findOneWithSubmissions(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Lấy danh sách học viên đã làm bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách học viên đã làm bài',
  })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  getStudentsWhoSubmitted(@Param('id') id: string): Promise<any[]> {
    return this.assignmentService.getStudentsWhoSubmitted(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Lấy thống kê bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({ status: 200, description: 'Trả về thống kê của bài tập' })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  getAssignmentStats(@Param('id') id: string): Promise<any> {
    return this.assignmentService.getAssignmentStats(id);
  }
}
