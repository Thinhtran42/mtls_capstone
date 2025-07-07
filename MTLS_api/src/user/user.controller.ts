import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiResponse({
    status: 201,
    description: 'Người dùng đã được tạo thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
  })
  async findAll() {
    try {
      const result = await this.usersService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('locked')
  @ApiOperation({ summary: 'Get all locked users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users with isLocked=true',
  })
  async findAllLockedUsers() {
    try {
      const result = await this.usersService.findAllLockedUsers();
      return {
        statusCode: HttpStatus.OK,
        message: 'Locked users retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async findById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo email' })
  @ApiParam({ name: 'email', description: 'Email của người dùng' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async findByEmail(@Param('email') email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Người dùng đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng cần xóa' })
  @ApiResponse({ status: 200, description: 'Người dùng đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.remove(id);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'User soft deleted successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('role/teachers')
  @ApiOperation({ summary: 'Lấy danh sách tất cả giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách người dùng với role là teacher',
  })
  async findAllTeachers() {
    try {
      const result = await this.usersService.findAllTeachers();
      return {
        statusCode: HttpStatus.OK,
        message: 'Teachers retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('role/students')
  @ApiOperation({ summary: 'Lấy danh sách tất cả học viên' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách người dùng với role là student',
  })
  async findAllStudents() {
    try {
      const result = await this.usersService.findAllStudents();
      return {
        statusCode: HttpStatus.OK,
        message: 'Students retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/unlock')
  @ApiOperation({ summary: 'Unlock a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User account unlocked successfully',
  })
  async unlockUser(@Param('id') id: string) {
    try {
      const user = await this.usersService.unlockUser(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'User account unlocked successfully',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
