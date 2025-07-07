import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DoAssignmentService } from './do-assignment.service';
import { CreateDoAssignmentDto } from './dto/create-do-assignment.dto';
import { UpdateDoAssignmentDto } from './dto/update-do-assignment.dto';
import { DoAssignment } from './schemas/do-assignment.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateStudentSubmissionDto } from './dto/update-student-submission.dto';

@ApiTags('do-assignments')
@Controller('do-assignments')
export class DoAssignmentController {
  constructor(private readonly doAssignmentService: DoAssignmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nộp bài assignment' })
  @ApiResponse({ status: 201, description: 'Bài đã được nộp thành công.' })
  async create(
    @Body() createDoAssignmentDto: CreateDoAssignmentDto,
    @GetUser() user,
  ) {
    try {
      console.log('User from token:', user); // Log để debug

      // Lấy ID từ token
      const studentId = user.sub || user.userId;

      if (!studentId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Student ID from token:', studentId);

      // Tự động gán student ID từ token
      const doAssignment = await this.doAssignmentService.create(
        createDoAssignmentDto,
        studentId,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Assignment submitted successfully',
        data: doAssignment,
      };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw new HttpException(
        error.message || 'Error submitting assignment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài nộp hoặc theo filter' })
  @ApiQuery({
    name: 'assignment',
    required: false,
    description: 'ID của assignment để lọc bài nộp',
  })
  @ApiQuery({
    name: 'student',
    required: false,
    description: 'ID của học viên để lọc bài nộp',
  })
  @ApiQuery({
    name: 'teacher',
    required: false,
    description: 'ID của giáo viên để lọc bài nộp',
  })
  @ApiQuery({
    name: 'ungraded',
    required: false,
    description: 'Lọc bài nộp chưa chấm điểm',
  })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp.' })
  findAll(
    @Query('assignment') assignmentId?: string,
    @Query('student') studentId?: string,
    @Query('teacher') teacherId?: string,
    @Query('ungraded') ungraded?: string,
  ): Promise<DoAssignment[]> {
    if (ungraded === 'true') {
      return this.doAssignmentService.findUngraded();
    }
    if (assignmentId) {
      return this.doAssignmentService.findByAssignment(assignmentId);
    }
    if (studentId) {
      return this.doAssignmentService.findByStudent(studentId);
    }
    if (teacherId) {
      return this.doAssignmentService.findByTeacher(teacherId);
    }
    return this.doAssignmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một bài nộp theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiResponse({ status: 200, description: 'Thông tin bài nộp.' })
  @ApiResponse({ status: 404, description: 'Bài nộp không tồn tại.' })
  findOne(@Param('id') id: string): Promise<DoAssignment> {
    return this.doAssignmentService.findOne(id);
  }

  @Get(':id/detailed')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một bài nộp theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết bài nộp.' })
  @ApiResponse({ status: 404, description: 'Bài nộp không tồn tại.' })
  findOneDetailed(@Param('id') id: string): Promise<DoAssignment> {
    return this.doAssignmentService.findOneDetailed(id);
  }

  @Get('student/:studentId/assignment/:assignmentId')
  @ApiOperation({
    summary: 'Lấy danh sách bài nộp theo student ID và assignment ID',
  })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'assignmentId', description: 'ID của assignment' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài nộp của học viên và assignment.',
  })
  @ApiResponse({
    status: 404,
    description: 'Học viên hoặc assignment không tồn tại.',
  })
  findByStudentAndAssignment(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
  ): Promise<DoAssignment | null> {
    return this.doAssignmentService.findByStudentAndAssignment(
      studentId,
      assignmentId,
    );
  }

  @Get('assignment/:assignmentId')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp theo assignment ID' })
  @ApiParam({ name: 'assignmentId', description: 'ID của assignment' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài nộp của assignment.',
  })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  findByAssignment(
    @Param('assignmentId') assignmentId: string,
  ): Promise<DoAssignment[]> {
    return this.doAssignmentService.findByAssignment(assignmentId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp theo student ID' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp của học viên.' })
  @ApiResponse({ status: 404, description: 'Học viên không tồn tại.' })
  findByStudent(
    @Param('studentId') studentId: string,
  ): Promise<DoAssignment[]> {
    return this.doAssignmentService.findByStudent(studentId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Lấy danh sách bài nộp theo teacher ID' })
  @ApiParam({ name: 'teacherId', description: 'ID của giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài nộp được chấm bởi giáo viên.',
  })
  @ApiResponse({ status: 404, description: 'Giáo viên không tồn tại.' })
  findByTeacher(
    @Param('teacherId') teacherId: string,
  ): Promise<DoAssignment[]> {
    return this.doAssignmentService.findByTeacher(teacherId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin bài nộp (chấm điểm)' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiResponse({ status: 200, description: 'Bài nộp đã được cập nhật.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Bài nộp không tồn tại.' })
  async update(
    @Param('id') id: string,
    @Body() updateDoAssignmentDto: UpdateDoAssignmentDto,
    @GetUser() user,
  ): Promise<any> {
    try {
      console.log('User from token:', user); // Log để debug

      // Lấy ID từ token (giáo viên)
      const teacherId = user.sub || user.userId || user._id;

      if (!teacherId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Teacher ID from token:', teacherId);

      // Tự động gán teacher ID từ token vào DTO
      updateDoAssignmentDto.teacher = teacherId;

      const doAssignment = await this.doAssignmentService.update(
        id,
        updateDoAssignmentDto,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Assignment graded successfully',
        data: doAssignment,
      };
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw new HttpException(
        error.message || 'Error updating assignment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một bài nộp' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiResponse({ status: 200, description: 'Bài nộp đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Bài nộp không tồn tại.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.doAssignmentService.remove(id);
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đầy đủ về một bài nộp' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài nộp.' })
  @ApiResponse({ status: 404, description: 'Bài nộp không tồn tại.' })
  getSubmissionDetails(@Param('id') id: string): Promise<any> {
    return this.doAssignmentService.getSubmissionDetails(id);
  }

  @Get('graded')
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài nộp đã được chấm điểm' })
  @ApiResponse({ status: 200, description: 'Danh sách bài nộp đã chấm điểm.' })
  getGradedSubmissions(): Promise<DoAssignment[]> {
    return this.doAssignmentService.getGradedSubmissions();
  }

  @Get('statistics/assignment/:assignmentId')
  @ApiOperation({ summary: 'Lấy thống kê điểm số cho một assignment' })
  @ApiParam({ name: 'assignmentId', description: 'ID của assignment' })
  @ApiResponse({ status: 200, description: 'Thống kê điểm số.' })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  getAssignmentStatistics(
    @Param('assignmentId') assignmentId: string,
  ): Promise<any> {
    return this.doAssignmentService.getAssignmentStatistics(assignmentId);
  }

  @Get('students/assignment/:assignmentId')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh đã làm assignment và trạng thái chấm điểm',
  })
  @ApiParam({ name: 'assignmentId', description: 'ID của assignment' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách học sinh và trạng thái chấm điểm.',
  })
  @ApiResponse({ status: 404, description: 'Assignment không tồn tại.' })
  getStudentSubmissionsByAssignment(
    @Param('assignmentId') assignmentId: string,
  ): Promise<any[]> {
    return this.doAssignmentService.getStudentSubmissionsByAssignment(
      assignmentId,
    );
  }

  @Get('assignments/student/:studentId')
  @ApiOperation({
    summary:
      'Lấy danh sách assignment mà học sinh đã làm và trạng thái chấm điểm',
  })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách assignment và trạng thái chấm điểm.',
  })
  @ApiResponse({ status: 404, description: 'Học sinh không tồn tại.' })
  getAssignmentSubmissionsByStudent(
    @Param('studentId') studentId: string,
  ): Promise<any[]> {
    return this.doAssignmentService.getAssignmentSubmissionsByStudent(
      studentId,
    );
  }

  @Get('graded/teacher/:teacherId')
  @ApiOperation({ summary: 'Lấy danh sách bài đã chấm của giáo viên' })
  @ApiParam({ name: 'teacherId', description: 'ID của giáo viên' })
  @ApiResponse({ status: 200, description: 'Danh sách bài đã chấm.' })
  @ApiResponse({ status: 404, description: 'Giáo viên không tồn tại.' })
  getGradedSubmissionsByTeacher(
    @Param('teacherId') teacherId: string,
  ): Promise<any[]> {
    return this.doAssignmentService.getGradedSubmissionsByTeacher(teacherId);
  }

  @Patch(':id/student-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Học viên cập nhật bài nộp của mình' })
  @ApiParam({ name: 'id', description: 'ID của bài nộp' })
  @ApiBody({ type: UpdateStudentSubmissionDto })
  @ApiResponse({ status: 200, description: 'Bài nộp đã được cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài nộp' })
  @ApiResponse({ status: 401, description: 'Không có quyền cập nhật bài nộp này' })
  async updateStudentSubmission(
    @Param('id') id: string,
    @Body() updateStudentSubmissionDto: UpdateStudentSubmissionDto,
    @GetUser() user,
  ) {
    try {
      // Lấy ID từ token
      const studentId = user.sub || user.userId || user._id;

      if (!studentId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Student ID from token:', studentId);

      const doAssignment = await this.doAssignmentService.updateStudentSubmission(
        id,
        updateStudentSubmissionDto,
        studentId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Assignment submission updated successfully',
        data: doAssignment,
      };
    } catch (error) {
      console.error('Error updating assignment submission:', error);
      throw new HttpException(
        error.message || 'Error updating assignment submission',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status/:studentId/:assignmentId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái làm bài assignment của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'assignmentId', description: 'ID của assignment' })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái làm bài assignment',
    schema: {
      type: 'object',
      properties: {
        started: { type: 'boolean', description: 'Học viên đã bắt đầu làm bài' },
        completed: { type: 'boolean', description: 'Học viên đã hoàn thành bài' }
      }
    }
  })
  async getStudentAssignmentStatus(
    @Param('studentId') studentId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    try {
      const status = await this.doAssignmentService.getStudentAssignmentStatus(
        studentId,
        assignmentId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Assignment status retrieved successfully',
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving assignment status',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
