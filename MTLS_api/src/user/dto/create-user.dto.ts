/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, IsEnum, MinLength, IsOptional } from 'class-validator';

export enum Role {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  readonly fullname: string;

  @ApiProperty({ example: 'johndoe@gmail.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ example: 'password123', description: 'User password', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password: string;

  @ApiProperty({ example: '0123456789', description: 'User phone number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?([0-9]{9,15})$/, { message: 'Phone number must be 9-15 digits' })
  readonly phone: string;

  @ApiProperty({ example: 'admin', enum: Role, description: 'User role' })
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Role must be admin, student, or teacher' })
  readonly role: Role;

  @ApiProperty({ default: true, description: 'Is the user active?' })
  readonly isActive: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL', required: false })
  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @ApiProperty({ example: '5 years teaching piano', description: 'User experience', required: false })
  @IsOptional()
  @IsString()
  readonly experience?: string;

  @ApiProperty({ example: '123 Music Street, Harmony City', description: 'User address', required: false })
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiProperty({ example: 'Piano, Music Theory', description: 'User specialization', required: false })
  @IsOptional()
  @IsString()
  readonly specialization?: string;

  @ApiProperty({ example: 'Music teacher with focus on classical piano', description: 'About the user', required: false })
  @IsOptional()
  @IsString()
  readonly about?: string;

  @ApiProperty({ description: 'Creation date' })
  readonly createAt: Date;

  @ApiProperty({ description: 'Update date' })
  readonly updateAt: Date;
}
