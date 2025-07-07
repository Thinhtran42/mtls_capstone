import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentType } from './schemas/content.schema';
import { CreateMultipleContentsDto } from './dto/create-multiple-contents.dto';

@ApiTags('contents')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  async create(@Body() createContentDto: CreateContentDto) {
    try {
      const content = await this.contentService.create(createContentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Content created successfully',
        data: content,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all contents' })
  @ApiResponse({ status: 200, description: 'Return all contents' })
  async findAll() {
    try {
      const contents = await this.contentService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Contents retrieved successfully',
        data: contents,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a content by ID' })
  @ApiResponse({ status: 200, description: 'Return the content' })
  async findOne(@Param('id') id: string) {
    try {
      const content = await this.contentService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Content retrieved successfully',
        data: content,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get contents by lesson ID' })
  @ApiResponse({ status: 200, description: 'Return contents for the lesson' })
  async findByLesson(@Param('lessonId') lessonId: string) {
    try {
      const contents = await this.contentService.findByLesson(lessonId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Contents retrieved successfully',
        data: contents,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get contents by type (Video or Reading)' })
  @ApiResponse({ status: 200, description: 'Return contents of the specified type' })
  async findByType(@Param('type') type: string) {
    try {
      // Validate type
      if (!Object.values(ContentType).includes(type as ContentType)) {
        throw new Error(`Invalid content type. Must be one of: ${Object.values(ContentType).join(', ')}`);
      }

      const contents = await this.contentService.findByType(type as ContentType);
      return {
        statusCode: HttpStatus.OK,
        message: `${type} contents retrieved successfully`,
        data: contents,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a content' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    try {
      const content = await this.contentService.update(id, updateContentDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Content updated successfully',
        data: content,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a content' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  async remove(@Param('id') id: string) {
    try {
      const content = await this.contentService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Content deleted successfully',
        data: content,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('lesson/:lessonId')
  @ApiOperation({ summary: 'Add a content to a lesson' })
  @ApiResponse({ status: 201, description: 'Content added to lesson successfully' })
  async addContentToLesson(
    @Param('lessonId') lessonId: string,
    @Body() createContentDto: CreateContentDto,
  ) {
    try {
      const content = await this.contentService.addContentToLesson(lessonId, createContentDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Content added to lesson successfully',
        data: content,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('batch')
  @ApiOperation({ summary: 'Tạo nhiều nội dung cùng lúc' })
  @ApiResponse({ status: 201, description: 'Các nội dung đã được tạo thành công' })
  async createMultiple(@Body() createMultipleContentsDto: CreateMultipleContentsDto) {
    return this.contentService.createMultiple(createMultipleContentsDto);
  }
}
