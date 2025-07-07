import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  course: string;

  @ApiProperty({ example: 'Introduction to Music Theory' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn the basics of music theory' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
