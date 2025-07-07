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
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { UpdateExerciseDto } from './dtos/update-exercise.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo bài tập mới' })
  @ApiBody({ type: CreateExerciseDto })
  @ApiResponse({ status: 201, description: 'Bài tập đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exerciseService.create(createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài tập' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài tập' })
  async findAll() {
    try {
      const result = await this.exerciseService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Exercises retrieved successfully',
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
  findOne(@Param('id') id: string) {
    return this.exerciseService.findById(id);
  }

  @Get('section/:id')
  @ApiOperation({ summary: 'Lấy danh sách bài tập theo ID của section' })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài tập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  findBySectionId(@Param('id') id: string) {
    return this.exerciseService.findBySectionId(id);
  }

  @Get('with-questions-count')
  @ApiOperation({
    summary: 'Lấy danh sách tất cả bài tập kèm số lượng câu hỏi',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài tập kèm số lượng câu hỏi',
  })
  async findAllWithQuestionsCount() {
    try {
      const result = await this.exerciseService.findAllWithQuestionsCount();
      return {
        statusCode: HttpStatus.OK,
        message: 'Exercises with questions count retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('section/:id/with-questions-count')
  @ApiOperation({
    summary: 'Lấy danh sách bài tập theo ID của section kèm số lượng câu hỏi',
  })
  @ApiParam({ name: 'id', description: 'ID của section' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách bài tập kèm số lượng câu hỏi',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  findBySectionIdWithQuestionsCount(@Param('id') id: string) {
    return this.exerciseService.findBySectionIdWithQuestionsCount(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiBody({ type: UpdateExerciseDto })
  @ApiResponse({ status: 200, description: 'Bài tập đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài tập' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({ status: 200, description: 'Bài tập đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập' })
  remove(@Param('id') id: string) {
    return this.exerciseService.remove(id);
  }
}
