import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoAssignmentDto {
  @ApiProperty({
    description: 'ID của giáo viên chấm assignment',
    example: '6507d6f6c31c7948c831c123',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  teacher?: string;

  @ApiProperty({
    description: 'Điểm số (0-10)',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @ApiProperty({
    description: 'Nhận xét của giáo viên',
    example: 'Bài làm tốt, cần cải thiện phần phân tích yêu cầu',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'URL của bài nộp',
    example: 'https://example.com/submissions/assignment1_updated.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionUrl?: string;

  @ApiProperty({
    description: 'Trạng thái đã chấm điểm',
    example: true,
    required: false,
  })
  @IsOptional()
  isGraded?: boolean;

  @ApiPropertyOptional({ 
    description: 'Trạng thái của bài làm exercise', 
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}