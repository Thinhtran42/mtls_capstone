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
import { DoExerciseService } from './do-exercise.service';
import { CreateDoExerciseDto } from './dtos/create-do-exercise.dto';
import { UpdateDoExerciseDto } from './dtos/update-do-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('do-exercises')
@Controller('do-exercises')
export class DoExerciseController {
  constructor(private readonly doExerciseService: DoExerciseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nộp bài exercise' })
  @ApiResponse({
    status: 201,
    description: 'Bài exercise đã được nộp thành công.',
  })
  async create(
    @Body() createDoExerciseDto: CreateDoExerciseDto,
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
      const doExercise = await this.doExerciseService.create(
        createDoExerciseDto,
        studentId,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Exercise submitted successfully',
        data: doExercise,
      };
    } catch (error) {
      console.error('Error submitting exercise:', error);
      throw new HttpException(
        error.message || 'Error submitting exercise',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài làm exercise' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài làm exercise',
  })
  async findAll() {
    try {
      const result = await this.doExerciseService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'DoExercises retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi làm bài tập theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin bản ghi làm bài tập',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài tập',
  })
  findOne(@Param('id') id: string) {
    return this.doExerciseService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bản ghi làm bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài tập' })
  @ApiBody({ type: UpdateDoExerciseDto })
  @ApiResponse({
    status: 200,
    description: 'Bản ghi làm bài tập đã được cập nhật',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài tập',
  })
  update(
    @Param('id') id: string,
    @Body() updateDoExerciseDto: UpdateDoExerciseDto,
  ) {
    return this.doExerciseService.update(id, updateDoExerciseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bản ghi làm bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bản ghi làm bài tập' })
  @ApiResponse({ status: 200, description: 'Bản ghi làm bài tập đã được xóa' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi làm bài tập',
  })
  remove(@Param('id') id: string) {
    return this.doExerciseService.remove(id);
  }

  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Lấy danh sách bài làm exercise theo exercise ID' })
  @ApiParam({ name: 'exerciseId', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài làm của bài tập',
  })
  async findByExerciseId(@Param('exerciseId') exerciseId: string) {
    const doExercises =
      await this.doExerciseService.findByExerciseId(exerciseId);
    return {
      message: 'Do exercises retrieved successfully',
      data: doExercises,
    };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách bài làm exercise của học sinh' })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài làm exercise của học sinh',
  })
  async findByStudentId(@Param('studentId') studentId: string) {
    try {
      const result = await this.doExerciseService.findByStudentId(studentId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Student exercise attempts retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:studentId/:exerciseId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái làm bài exercise của học viên' })
  @ApiParam({ name: 'studentId', description: 'ID của học viên' })
  @ApiParam({ name: 'exerciseId', description: 'ID của exercise' })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái làm bài exercise',
    schema: {
      type: 'object',
      properties: {
        started: { type: 'boolean', description: 'Học viên đã bắt đầu làm bài' },
        completed: { type: 'boolean', description: 'Học viên đã hoàn thành bài' }
      }
    }
  })
  async getStudentExerciseStatus(
    @Param('studentId') studentId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    try {
      const status = await this.doExerciseService.getStudentExerciseStatus(
        studentId,
        exerciseId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Exercise status retrieved successfully',
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error retrieving exercise status',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('student/:studentId/exercise/:exerciseId')
  @ApiOperation({
    summary: 'Lấy bài làm exercise của học sinh theo exercise ID',
  })
  @ApiParam({ name: 'studentId', description: 'ID của học sinh' })
  @ApiParam({ name: 'exerciseId', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về bài làm exercise của học sinh',
  })
  async findByStudentIdAndExerciseId(
    @Param('studentId') studentId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.doExerciseService.findByStudentIdAndExerciseId(
      studentId,
      exerciseId,
    );
  }

  @Get('shuffle-questions/:exerciseId')
  @ApiOperation({
    summary:
      'Lấy danh sách câu hỏi và câu trả lời đã được xáo trộn của một exercise',
  })
  @ApiParam({ name: 'exerciseId', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu hỏi và câu trả lời đã được xáo trộn',
  })
  async getShuffledQuestionsAndOptions(
    @Param('exerciseId') exerciseId: string,
    @Query('shuffleQuestions') shuffleQuestions: string = 'true',
    @Query('shuffleOptions') shuffleOptions: string = 'true',
  ) {
    try {
      const shouldShuffleQuestions = shuffleQuestions === 'true';
      const shouldShuffleOptions = shuffleOptions === 'true';

      const result = await this.doExerciseService.shuffleQuestionsAndOptions(
        exerciseId,
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
