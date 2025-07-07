import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { CourseLevel } from './course-level.enum';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Music Theory Basics',
    description: 'Title of the course',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Learn the fundamentals of music theory',
    description: 'Description of the course',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'This course covers basic to advanced music theory concepts',
    description: 'Detailed information about the course',
    required: false,
  })
  @IsOptional()
  @IsString()
  about: string;

  @ApiProperty({
    example: CourseLevel.BASIC,
    description: 'Course difficulty level',
    enum: CourseLevel,
    default: CourseLevel.BASIC,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    example: [
      'Master music theory fundamentals',
      'Develop practical skills in music notation',
      'Apply music theory principles to various genres',
    ],
    description: 'List of specific learning objectives for the course',
    required: false,
    type: [String],
  })
  @IsOptional()
  learningObjectives: string[];

  @ApiProperty({
    example: ['Music Theory', 'Composition', 'Rhythm', 'Harmony', 'Notation'],
    description: 'List of skills students will gain from the course',
    required: false,
    type: [String],
  })
  @IsOptional()
  skills: string[];

  @ApiProperty({
    example: 'https://example.com/course-image.jpg',
    description: 'Image URL for the course',
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Teacher ID (FK to User)',
  })
  @IsOptional()
  @IsString()
  teacher: string; // FK to User (Teacher)
}
