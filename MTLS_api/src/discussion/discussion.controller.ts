import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto } from './dtos/create-discussion.dto';
import { UpdateDiscussionDto } from './dtos/update-discussion.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('discussions')
@Controller('discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo một thảo luận mới' })
  @ApiResponse({
    status: 201,
    description: 'Thảo luận đã được tạo thành công.',
  })
  async create(
    @Body() createDiscussionDto: CreateDiscussionDto,
    @GetUser() user,
  ) {
    try {
      //log id cua user de check
      console.log('User from token: ', user);

      // Lấy ID từ token (có thể sub hoặc userId)
      const studentId = user.sub || user.userId;
      if (!studentId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('Student ID from token: ', studentId);
      //Tự động gán student Id từ token
      const discussion = await this.discussionService.createDiscussion(
        createDiscussionDto,
        studentId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'DiscussionDiscussion created successfully',
        data: discussion,
      };
    } catch (error) {
      console.error('Error created discusstion.', error);
      throw new HttpException(
        error.message || 'Error creating course',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thảo luận' })
  findAll() {
    return this.discussionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một thảo luận theo ID' })
  findOne(@Param('id') id: string) {
    return this.discussionService.findById(id);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách thảo luận theo module' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách thảo luận' })
  @ApiResponse({ status: 400, description: 'ID module không hợp lệ' })
  async findByModule(@Param('moduleId') moduleId: string) {
    try {
      const result = await this.discussionService.findByModule(moduleId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Discussions retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve discussions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách thảo luận theo học viên' })
  findByStudentId(@Param('studentId') studentId: string) {
    return this.discussionService.findByStudentId(studentId);
  }

  @Get('student/:studentId/module/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách thảo luận của học viên theo module' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'moduleId', description: 'ID của module' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách thảo luận' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  async findByStudentAndModule(
    @Param('studentId') studentId: string,
    @Param('moduleId') moduleId: string,
  ) {
    try {
      const result = await this.discussionService.findByStudentAndModule(
        studentId,
        moduleId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Student discussions retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve discussions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin thảo luận' })
  update(
    @Param('id') id: string,
    @Body() updateDiscussionDto: UpdateDiscussionDto,
  ) {
    return this.discussionService.update(id, updateDiscussionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một thảo luận' })
  remove(@Param('id') id: string) {
    return this.discussionService.remove(id);
  }
}
