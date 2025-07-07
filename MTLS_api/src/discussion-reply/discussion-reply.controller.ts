import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DiscussionReplyService } from './discussion-reply.service';
import { CreateDiscussionReplyDto } from './dtos/create-discussion-reply.dto';
import { UpdateDiscussionReplyDto } from './dtos/update-discussion-reply.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('discussion-replies')
@Controller('discussion-replies')
export class DiscussionReplyController {
  constructor(
    private readonly discussionReplyService: DiscussionReplyService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo một reply mới' })
  @ApiResponse({ status: 201, description: 'Reply đã được tạo thành công.' })
  async create(
    @Body() createDiscussionReplyDto: CreateDiscussionReplyDto,
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
      const reply = await this.discussionReplyService.createReply(
        createDiscussionReplyDto,
        studentId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Reply created successfully',
        data: reply,
      };
    } catch (error) {
      console.error('Error created reply.', error);
      throw new HttpException(
        error.message || 'Error creating reply',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả replies' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách các replies đang active',
  })
  async findAll() {
    const replies = await this.discussionReplyService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Replies retrieved successfully',
      data: replies,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một reply theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin của reply' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy reply' })
  async findOne(@Param('id') id: string) {
    const reply = await this.discussionReplyService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply retrieved successfully',
      data: reply,
    };
  }

  @Get('discussion/:discussionId')
  @ApiOperation({ summary: 'Lấy danh sách replies theo discussion' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách các replies của discussion',
  })
  async findByDiscussionId(@Param('discussionId') discussionId: string) {
    const replies =
      await this.discussionReplyService.findByDiscussionId(discussionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Replies retrieved successfully',
      data: replies,
    };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách replies theo học viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách các replies của học viên',
  })
  async findByStudentId(@Param('studentId') studentId: string) {
    const replies =
      await this.discussionReplyService.findByStudentId(studentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Replies retrieved successfully',
      data: replies,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin reply' })
  @ApiResponse({ status: 200, description: 'Reply đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy reply' })
  async update(
    @Param('id') id: string,
    @Body() updateDiscussionReplyDto: UpdateDiscussionReplyDto,
  ) {
    const updatedReply = await this.discussionReplyService.update(
      id,
      updateDiscussionReplyDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply updated successfully',
      data: updatedReply,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa một reply (soft delete)' })
  @ApiResponse({ status: 200, description: 'Reply đã được xóa (soft delete)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy reply' })
  async remove(@Param('id') id: string) {
    const deletedReply = await this.discussionReplyService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply deleted successfully',
      data: deletedReply,
    };
  }

  @Get('discussion/:discussionId')
  @ApiOperation({ summary: 'Lấy danh sách trả lời theo thảo luận' })
  @ApiParam({ name: 'discussionId', description: 'ID của thảo luận' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách trả lời' })
  @ApiResponse({ status: 400, description: 'ID thảo luận không hợp lệ' })
  async findByDiscussion(@Param('discussionId') discussionId: string) {
    try {
      const result =
        await this.discussionReplyService.findByDiscussion(discussionId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Discussion replies retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve discussion replies',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:studentId/discussion/:discussionId')
  @ApiOperation({
    summary: 'Lấy danh sách trả lời của học viên theo thảo luận',
  })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'discussionId', description: 'ID của thảo luận' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách trả lời' })
  @ApiResponse({ status: 400, description: 'ID không hợp lệ' })
  async findByStudentAndDiscussion(
    @Param('studentId') studentId: string,
    @Param('discussionId') discussionId: string,
  ) {
    try {
      const result =
        await this.discussionReplyService.findByStudentAndDiscussion(
          studentId,
          discussionId,
        );
      return {
        statusCode: HttpStatus.OK,
        message: 'Student discussion replies retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve discussion replies',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy tất cả trả lời của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách trả lời' })
  @ApiResponse({ status: 400, description: 'ID học viên không hợp lệ' })
  async findByStudent(@Param('studentId') studentId: string) {
    try {
      const result = await this.discussionReplyService.findByStudent(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student replies retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve student replies',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
