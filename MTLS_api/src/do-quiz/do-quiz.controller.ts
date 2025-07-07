import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DoQuizService } from './do-quiz.service';
import { CreateDoQuizDto } from './dtos/create-do-quiz.dto';
import { UpdateDoQuizDto } from './dtos/update-do-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('do-quizzes')
@Controller('do-quizzes')
export class DoQuizController {
  constructor(private readonly doQuizService: DoQuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nộp bài quiz' })
  @ApiResponse({ status: 201, description: 'Bài quiz đã được nộp thành công.' })
  async create(@Body() createDoQuizDto: CreateDoQuizDto, @GetUser() user) {
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
      const doQuiz = await this.doQuizService.create(
        createDoQuizDto,
        studentId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Quiz submitted successfully',
        data: doQuiz,
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw new HttpException(
        error.message || 'Error submitting quiz',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài làm quiz' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài làm quiz' })
  async findAll() {
    try {
      const result = await this.doQuizService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'DoQuizzes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi làm bài kiểm tra theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài kiểm tra' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin bản ghi làm bài kiểm tra',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài kiểm tra',
  })
  findOne(@Param('id') id: string) {
    return this.doQuizService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bản ghi làm bài kiểm tra' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài kiểm tra' })
  @ApiBody({ type: UpdateDoQuizDto })
  @ApiResponse({
    status: 200,
    description: 'Bản ghi làm bài kiểm tra đã được cập nhật',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài kiểm tra',
  })
  update(@Param('id') id: string, @Body() updateDoQuizDto: UpdateDoQuizDto) {
    return this.doQuizService.update(id, updateDoQuizDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bản ghi làm bài kiểm tra' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài kiểm tra' })
  @ApiResponse({
    status: 200,
    description: 'Bản ghi làm bài kiểm tra đã được xóa',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài kiểm tra',
  })
  remove(@Param('id') id: string) {
    return this.doQuizService.remove(id);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Lấy danh sách bài làm quiz theo quiz ID' })
  @ApiParam({ name: 'quizId', description: 'ID của bài kiểm tra' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài làm của bài kiểm tra',
  })
  async findByQuizId(@Param('quizId') quizId: string) {
    const doQuizzes = await this.doQuizService.findByQuizId(quizId);
    return {
      message: 'Do quizzes retrieved successfully',
      data: doQuizzes,
    };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách bài làm quiz của học sinh' })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài làm quiz của học sinh',
  })
  async findByStudentId(@Param('studentId') studentId: string) {
    try {
      const result = await this.doQuizService.findByStudentId(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student quiz attempts retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:studentId/:quizId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái làm bài quiz của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'quizId', description: 'ID của quiz' })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái làm bài quiz',
    schema: {
      type: 'object',
      properties: {
        started: {
          type: 'boolean',
          description: 'Học viên đã bắt đầu làm bài',
        },
        completed: {
          type: 'boolean',
          description: 'Học viên đã hoàn thành bài',
        },
      },
    },
  })
  async getStudentQuizStatus(
    @Param('studentId') studentId: string,
    @Param('quizId') quizId: string,
  ) {
    try {
      const status = await this.doQuizService.getStudentQuizStatus(
        studentId,
        quizId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Quiz status retrieved successfully',
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving quiz status',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('student/:studentId/quiz/:quizId')
  @ApiOperation({ summary: 'Lấy bài làm quiz của học sinh theo quiz ID' })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiParam({ name: 'quizId', description: 'ID của bài kiểm tra' })
  @ApiResponse({
    status: 200,
    description: 'Trả về bài làm quiz của học sinh',
  })
  async findByStudentIdAndQuizId(
    @Param('studentId') studentId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.doQuizService.findByStudentIdAndQuizId(studentId, quizId);
  }

  @Get('shuffle-questions/:quizId')
  @ApiOperation({
    summary:
      'Lấy danh sách câu hỏi và câu trả lời đã được xáo trộn của một quiz',
  })
  @ApiParam({ name: 'quizId', description: 'ID của bài kiểm tra' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi và câu trả lời đã được xáo trộn',
  })
  async getShuffledQuestionsAndOptions(
    @Param('quizId') quizId: string,
    @Query('shuffleQuestions') shuffleQuestions: string = 'true',
    @Query('shuffleOptions') shuffleOptions: string = 'true',
  ) {
    try {
      const shouldShuffleQuestions = shuffleQuestions === 'true';
      const shouldShuffleOptions = shuffleOptions === 'true';

      const result = await this.doQuizService.shuffleQuestionsAndOptions(
        quizId,
        shouldShuffleQuestions,
        shouldShuffleOptions,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Questions and options shuffled successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error shuffling questions and options',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
