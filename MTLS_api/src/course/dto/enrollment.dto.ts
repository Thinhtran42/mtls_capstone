import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export class EnrollmentDto {
  @ApiProperty({
    example: '60d5ec49f1c2b8b1f8c8e4e1',
    description: 'Student ID (FK to User)',
  })
  @IsNotEmpty()
  @IsString()
  student: string; // FK to User (Student)

  @ApiProperty({
    example: '60d5ec49f1c2b8b1f8c8e4e2',
    description: 'Course ID (FK to Course)',
  })
  @IsNotEmpty()
  @IsString()
  course: string; // FK to Course

  @ApiProperty({
    enum: EnrollmentStatus,
    description: 'Status of the enrollment',
  })
  @IsNotEmpty()
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @ApiProperty({ description: 'Date when the student enrolled' })
  enrolledAt: Date; // Automatically set to current date
}
