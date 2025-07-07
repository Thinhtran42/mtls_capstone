import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SubmitAnswerService } from './submit-answer.service';
import { CreateSubmitAnswerDto } from './dtos/create-submit-answer.dto';
import { UpdateSubmitAnswerDto } from './dtos/update-submit-answer.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { CreateMultipleSubmitAnswersDto } from './dtos/create-multiple-submit-answers.dto';
import { UpdateMultipleSubmitAnswersDto } from './dtos/update-multiple-submit-answers.dto';

@ApiTags('submit-answers')
@Controller('submit-answers')
export class SubmitAnswerController {
  constructor(private readonly submitAnswerService: SubmitAnswerService) {}

  @Post('multiple')
  @ApiOperation({ summary: 'Submit nhiều câu trả lời cùng lúc' })
  @ApiResponse({
    status: 201,
    description:
      'Các câu trả lời đã được submit thành công và danh sách lỗi nếu có',
  })
  async createMultiple(
    @Body() createMultipleDto: CreateMultipleSubmitAnswersDto,
  ) {
    return this.submitAnswerService.createMultiple(createMultipleDto);
  }

  @Put('multiple')
  @ApiOperation({ summary: 'Cập nhật nhiều câu trả lời cùng lúc' })
  @ApiBody({ type: UpdateMultipleSubmitAnswersDto })
  @ApiResponse({
    status: 200,
    description:
      'Các câu trả lời đã được cập nhật thành công và danh sách lỗi nếu có',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async updateMultiple(
    @Body() updateMultipleDto: UpdateMultipleSubmitAnswersDto,
  ) {
    return this.submitAnswerService.updateMultiple(updateMultipleDto);
  }

  @Get('do-quiz/:doQuizId')
  @ApiOperation({ summary: 'Lấy ra các câu trả lời của 1 bài quiz' })
  @ApiParam({ name: 'doQuizId', description: 'ID của bài làm quiz' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách câu trả lời của bài làm quiz',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài làm quiz' })
  async getByDoQuizId(@Param('doQuizId') doQuizId: string) {
    return this.submitAnswerService.findByDoQuizId(doQuizId);
  }

  @Get('do-quiz/:doQuizId/correct-count')
  @ApiOperation({ summary: 'Đếm số câu đúng rồi cập nhật điểm cho bài quiz' })
  @ApiParam({ name: 'doQuizId', description: 'ID của bài làm quiz' })
  @ApiResponse({ status: 200, description: 'Điểm đã được cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài làm quiz' })
  async getCorrectOptionCountAndUpdateScore(
    @Param('doQuizId') doQuizId: string,
  ) {
    return this.submitAnswerService.countCorrectOptionsAndUpdateScore(doQuizId);
  }

  @Get('do-exercise/:doExerciseId')
  @ApiOperation({ summary: 'Lấy tất cả câu trả lời của một bài làm exercise' })
  @ApiParam({ name: 'doExerciseId', description: 'ID của bài làm exercise' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách các câu trả lời của bài làm exercise',
  })
  async findByDoExerciseId(@Param('doExerciseId') doExerciseId: string) {
    const submitAnswers =
      await this.submitAnswerService.findByDoExerciseId(doExerciseId);
    return {
      message: 'Submit answers retrieved successfully',
      data: submitAnswers,
    };
  }

  @Get('do-exercise/:doExerciseId/score')
  @ApiOperation({
    summary: 'Đếm số câu đúng và cập nhật điểm cho bài làm exercise',
  })
  @ApiParam({ name: 'doExerciseId', description: 'ID của bài làm exercise' })
  @ApiResponse({
    status: 200,
    description: 'Điểm số đã được cập nhật thành công',
  })
  async calculateExerciseScore(@Param('doExerciseId') doExerciseId: string) {
    const score =
      await this.submitAnswerService.countCorrectAnswersAndUpdateExerciseScore(
        doExerciseId,
      );
    return {
      message: 'Exercise score calculated and updated successfully',
      data: { score },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo câu trả lời mới' })
  @ApiBody({ type: CreateSubmitAnswerDto })
  @ApiResponse({
    status: 201,
    description: 'Câu trả lời đã được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createSubmitAnswerDto: CreateSubmitAnswerDto) {
    return this.submitAnswerService.create(createSubmitAnswerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả câu trả lời' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách câu trả lời' })
  findAll() {
    return this.submitAnswerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin câu trả lời theo ID' })
  @ApiParam({ name: 'id', description: 'ID của câu trả lời' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin câu trả lời' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu trả lời' })
  findOne(@Param('id') id: string) {
    return this.submitAnswerService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật câu trả lời' })
  @ApiParam({ name: 'id', description: 'ID của câu trả lời' })
  @ApiBody({ type: UpdateSubmitAnswerDto })
  @ApiResponse({ status: 200, description: 'Câu trả lời đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu trả lời' })
  update(
    @Param('id') id: string,
    @Body() updateSubmitAnswerDto: UpdateSubmitAnswerDto,
  ) {
    return this.submitAnswerService.update(id, updateSubmitAnswerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa câu trả lời' })
  @ApiParam({ name: 'id', description: 'ID của câu trả lời' })
  @ApiResponse({ status: 200, description: 'Câu trả lời đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy câu trả lời' })
  remove(@Param('id') id: string) {
    return this.submitAnswerService.remove(id);
  }
}
