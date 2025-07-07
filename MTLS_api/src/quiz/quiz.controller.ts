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
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo bài kiểm tra mới' })
  @ApiBody({ type: CreateQuizDto })
  @ApiResponse({
    status: 201,
    description: 'Bài kiểm tra đã được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả quiz' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách quiz' })
  async findAll() {
    try {
      const result = await this.quizService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Quizzes retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bài kiểm tra theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bài kiểm tra' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin bài kiểm tra' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài kiểm tra' })
  findOne(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @Get('section/:id')
  @ApiOperation({ summary: 'Lấy danh sách bài kiểm tra theo ID của section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài kiểm tra' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài kiểm tra' })
  findBySectionId(@Param('id') id: string) {
    return this.quizService.findBySectionId(id);
  }

  @Get('with-questions-count')
  @ApiOperation({ summary: 'Lấy danh sách tất cả quiz kèm số lượng câu hỏi' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách quiz kèm số lượng câu hỏi',
  })
  async findAllWithQuestionsCount() {
    try {
      const result = await this.quizService.findAllWithQuestionsCount();
      return {
        statusCode: HttpStatus.OK,
        message: 'Quizzes with questions count retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('section/:id/with-questions-count')
  @ApiOperation({
    summary:
      'Lấy danh sách bài kiểm tra theo ID của section kèm số lượng câu hỏi',
  })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài kiểm tra kèm số lượng câu hỏi',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài kiểm tra' })
  findBySectionIdWithQuestionsCount(@Param('id') id: string) {
    return this.quizService.findBySectionIdWithQuestionsCount(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài kiểm tra' })
  @ApiParam({ name: 'id', description: 'ID của bài kiểm tra' })
  @ApiBody({ type: UpdateQuizDto })
  @ApiResponse({ status: 200, description: 'Bài kiểm tra đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài kiểm tra' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài kiểm tra' })
  @ApiParam({ name: 'id', description: 'ID của bài kiểm tra' })
  @ApiResponse({ status: 200, description: 'Bài kiểm tra đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài kiểm tra' })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
