import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum Role {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export class SignUpDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email của người dùng',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu người dùng (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Tên đầy đủ của người dùng',
  })
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại người dùng',
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'student',
    description: 'Vai trò người dùng (admin, student, teacher)',
    enum: Role,
    default: Role.STUDENT,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg', 
    description: 'URL avatar người dùng',
    required: false 
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ 
    example: '5 years teaching piano', 
    description: 'Kinh nghiệm của người dùng', 
    required: false 
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ 
    example: '123 Music Street, Harmony City', 
    description: 'Địa chỉ của người dùng', 
    required: false 
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    example: 'Piano, Music Theory', 
    description: 'Chuyên môn của người dùng', 
    required: false 
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ 
    example: 'Music teacher with focus on classical piano', 
    description: 'Thông tin về người dùng', 
    required: false 
  })
  @IsOptional()
  @IsString()
  about?: string;
}
