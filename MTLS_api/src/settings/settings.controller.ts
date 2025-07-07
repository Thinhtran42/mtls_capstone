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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async create(@Body() createSettingsDto: CreateSettingsDto) {
    try {
      const setting = await this.settingsService.create(createSettingsDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Setting created successfully',
        data: setting,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create or update multiple settings at once' })
  @ApiResponse({ status: 201, description: 'Settings created/updated successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async createMultiple(@Body() settingsArray: CreateSettingsDto[]) {
    try {
      const settings = await this.settingsService.createMultiple(settingsArray);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Settings created/updated successfully',
        data: settings,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Return all settings' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async findAll() {
    try {
      const settings = await this.settingsService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public settings (non-secret)' })
  @ApiResponse({ status: 200, description: 'Return public settings' })
  async findPublicSettings() {
    try {
      const settings = await this.settingsService.findPublicSettings();
      return {
        statusCode: HttpStatus.OK,
        message: 'Public settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system settings in structured format' })
  @ApiResponse({ status: 200, description: 'Return system settings' })
  async getSystemSettings() {
    try {
      const settings = await this.settingsService.getSystemSettings();
      return {
        statusCode: HttpStatus.OK,
        message: 'System settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a setting by key' })
  @ApiResponse({ status: 200, description: 'Return the setting' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async findByKey(@Param('key') key: string) {
    try {
      const setting = await this.settingsService.findByKey(key);
      return {
        statusCode: HttpStatus.OK,
        message: 'Setting retrieved successfully',
        data: setting,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a setting by key' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async update(@Param('key') key: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    try {
      const setting = await this.settingsService.update(key, updateSettingsDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Setting updated successfully',
        data: setting,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a setting by key' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async remove(@Param('key') key: string) {
    try {
      const setting = await this.settingsService.remove(key);
      return {
        statusCode: HttpStatus.OK,
        message: 'Setting deleted successfully',
        data: setting,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
