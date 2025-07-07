import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dtos/create-question.dto';
import { UpdateQuestionDto } from './dtos/update-question.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateMultipleQuestionsDto } from './dtos/create-multiple-questions.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo câu hỏi mới' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Câu hỏi đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách câu hỏi' })
  async findAll() {
    try {
      const result = await this.questionService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Questions retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin câu hỏi theo ID' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin câu hỏi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  findOne(@Param('id') id: string) {
    return this.questionService.findById(id);
  }

  @Get('quiz/:id')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi theo ID của quiz' })
  @ApiParam({ name: 'id', description: 'ID của quiz' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách câu hỏi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  findByQuizId(@Param('id') id: string) {
    return this.questionService.findByQuizId(id);
  }

  @Get('exercise/:id')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi theo ID của exercise' })
  @ApiParam({ name: 'id', description: 'ID của exercise' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách câu hỏi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  findByExerciseId(@Param('id') id: string) {
    return this.questionService.findByExerciseId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật câu hỏi' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Câu hỏi đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa câu hỏi' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiResponse({ status: 200, description: 'Câu hỏi đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu hỏi' })
  remove(@Param('id') id: string) {
    return this.questionService.remove(id);
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Tạo nhiều câu hỏi cùng lúc',
    description: 'Tạo nhiều câu hỏi thuộc quiz hoặc exercise cùng lúc',
  })
  @ApiResponse({
    status: 201,
    description: 'Các câu hỏi đã được tạo thành công',
  })
  async createMultiple(
    @Body() createMultipleQuestionsDto: CreateMultipleQuestionsDto,
  ) {
    return this.questionService.createMultiple(createMultipleQuestionsDto);
  }
}
