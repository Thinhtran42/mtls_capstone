import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateStudentSubmissionDto {
  @ApiProperty({
    description: 'Tiêu đề của bài làm',
    example: 'Bài tập về nhà môn Hóa học (đã cập nhật)',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết của bài làm',
    example: 'Bài làm đã được cập nhật với các phản ứng hóa học mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL của bài nộp',
    example: 'https://example.com/submissions/assignment1_updated.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionUrl?: string;

  // Các trường bổ sung (chỉ sử dụng nội bộ)
  @IsOptional()
  @IsBoolean()
  isGraded?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiPropertyOptional({ 
    description: 'Trạng thái của bài làm exercise', 
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}