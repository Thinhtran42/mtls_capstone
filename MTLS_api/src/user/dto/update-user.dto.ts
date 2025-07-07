import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  IsEnum,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Role } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly fullname?: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'User email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Invalid email format',
  })
  readonly email?: string;

  // @ApiProperty({
  //   example: 'password123',
  //   description: 'User password',
  //   minLength: 8,
  //   required: false,
  // })
  // @IsNotEmpty()
  // @IsString()
  // @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // readonly password?: string;

  @ApiProperty({
    example: '0123456789',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({
    example: 'admin',
    enum: Role,
    description: 'User role',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be admin, student, or teacher' })
  readonly role?: Role;

  @ApiProperty({ description: 'Is the user active?', required: false })
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @ApiProperty({
    example: '5 years teaching piano',
    description: 'User experience',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly experience?: string;

  @ApiProperty({
    example: '123 Music Street, Harmony City',
    description: 'User address',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiProperty({
    example: 'Piano, Music Theory',
    description: 'User specialization',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly specialization?: string;

  @ApiProperty({
    example: 'Music teacher with focus on classical piano',
    description: 'About the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly about?: string;

  @ApiProperty({ description: 'Update date', required: false })
  @IsOptional()
  readonly updateAt?: Date;
}
