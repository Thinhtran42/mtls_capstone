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
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@ApiTags('modules')
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  async create(@Body() createModuleDto: CreateModuleDto) {
    try {
      const module = await this.moduleService.create(createModuleDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Module created successfully',
        data: module,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all active modules' })
  @ApiResponse({ status: 200, description: 'Return all active modules' })
  async findAll() {
    try {
      const modules = await this.moduleService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Modules retrieved successfully',
        data: modules,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiResponse({ status: 200, description: 'Return the module' })
  async findById(@Param('id') id: string) {
    try {
      const module = await this.moduleService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Module retrieved successfully',
        data: module,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get modules by course ID' })
  @ApiResponse({ status: 200, description: 'Return modules for the course' })
  async findByCourseId(@Param('courseId') courseId: string) {
    try {
      const modules = await this.moduleService.findByCourseId(courseId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Modules retrieved successfully',
        data: modules,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    try {
      const module = await this.moduleService.update(id, updateModuleDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Module updated successfully',
        data: module,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update module status' })
  @ApiResponse({
    status: 200,
    description: 'Module status updated successfully',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    try {
      const module = await this.moduleService.updateStatus(id, isActive);
      return {
        statusCode: HttpStatus.OK,
        message: 'Module status updated successfully',
        data: module,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a module' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  async remove(@Param('id') id: string) {
    try {
      const module = await this.moduleService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Module deleted successfully',
        data: module,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
