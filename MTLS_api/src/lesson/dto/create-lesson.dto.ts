import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {

  @ApiProperty({
    description: 'The ID of the section this lesson belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Introduction to Programming',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the lesson',
    example: 'Learn the fundamentals of programming concepts',
    required: false,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The duration of the lesson in minutes',
    example: 45,
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

}