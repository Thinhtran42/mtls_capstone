import { IsMongoId, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoAssignmentDto {
  @ApiProperty({
    description: 'ID của assignment',
    example: '6507d6f6c31c7948c831a456',
  })
  @IsOptional()
  @IsString()
  assignment: string;

  @ApiProperty({
    description: 'ID của học viên làm assignment',
    example: '6507d6f6c31c7948c831b789',
  })
  @IsOptional()
  @IsMongoId()
  student: string;

  @ApiProperty({
    description: 'Tiêu đề của bài làm',
    example: 'Bài tập về nhà môn Hóa học',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Điểm số',
    example: 85,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({
    description: 'Mô tả chi tiết của bài làm',
    example:
      'Bài làm này gồm các phản ứng hóa học cơ bản và giải thích nguyên lý',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL của bài nộp',
    example: 'https://example.com/submissions/assignment1.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionUrl?: string;
}
