import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  student: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsNotEmpty()
  @IsString()
  course: string;

  @ApiProperty({ example: 'active', enum: ['active', 'completed', 'dropped'] })
  @IsNotEmpty()
  @IsEnum(['active', 'completed', 'dropped'])
  status: string;

  @ApiProperty({ description: 'Date when the student enrolled' })
  enrolledAt: Date;
}
