import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { OptionService } from './option.service';
import { CreateOptionDto } from './dtos/create-option.dto';
import { UpdateOptionDto } from './dtos/update-option.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateMultipleOptionsDto } from './dtos/create-multiple-options.dto';

@ApiTags('options')
@Controller('options')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo tùy chọn mới cho câu hỏi' })
  @ApiBody({ type: CreateOptionDto })
  @ApiResponse({ status: 201, description: 'Tùy chọn đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  create(@Body() createOptionDto: CreateOptionDto) {
    return this.optionService.create(createOptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các tùy chọn' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tùy chọn' })
  findAll() {
    return this.optionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin tùy chọn theo ID' })
  @ApiParam({ name: 'id', description: 'ID của tùy chọn' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin tùy chọn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tùy chọn' })
  findOne(@Param('id') id: string) {
    return this.optionService.findById(id);
  }

  @Get('question/:id')
  @ApiOperation({ summary: 'Lấy danh sách tùy chọn theo ID của câu hỏi' })
  @ApiParam({ name: 'id', description: 'ID của câu hỏi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tùy chọn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tùy chọn' })
  findListOptionByQuestionId(@Param('id') id: string) {
    return this.optionService.findByQuestionId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tùy chọn' })
  @ApiParam({ name: 'id', description: 'ID của tùy chọn' })
  @ApiBody({ type: UpdateOptionDto })
  @ApiResponse({ status: 200, description: 'Tùy chọn đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tùy chọn' })
  update(@Param('id') id: string, @Body() updateOptionDto: UpdateOptionDto) {
    return this.optionService.update(id, updateOptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tùy chọn' })
  @ApiParam({ name: 'id', description: 'ID của tùy chọn' })
  @ApiResponse({ status: 200, description: 'Tùy chọn đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tùy chọn' })
  remove(@Param('id') id: string) {
    return this.optionService.remove(id);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Tạo nhiều tùy chọn cùng lúc' })
  @ApiResponse({
    status: 201,
    description: 'Các tùy chọn đã được tạo thành công',
  })
  async createMultiple(
    @Body() createMultipleOptionsDto: CreateMultipleOptionsDto,
  ) {
    return this.optionService.createMultiple(createMultipleOptionsDto);
  }
}
