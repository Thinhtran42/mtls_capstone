import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  module: string;

  @ApiProperty({ example: 'Introduction to Music Notation' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Lesson',
    enum: ['Lesson', 'Quiz', 'Exercise', 'Assignment'],
    description: 'Type of section'
  })
  @IsNotEmpty()
  @IsEnum(['Lesson', 'Quiz', 'Exercise', 'Assignment'])
  type: string;

  @ApiProperty({
    example: 30,
    description: 'Duration in minutes'
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Section is active or not'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
