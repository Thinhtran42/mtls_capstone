import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'ID của section mà assignment thuộc về',
    example: '6507d6f6c31c7948c831a123',
  })
  @IsNotEmpty()
  @IsMongoId()
  section: string;

  @ApiProperty({
    description: 'Tiêu đề của assignment',
    example: 'Bài tập về nhà: Lập trình hướng đối tượng',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Nội dung câu hỏi của assignment',
    example: 'Hãy viết một chương trình minh họa tính kế thừa trong OOP',
    required: false,
  })
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về assignment',
    example: 'Bài tập này giúp sinh viên hiểu rõ hơn về tính kế thừa trong lập trình hướng đối tượng',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL của file đính kèm (nếu có)',
    example: 'https://example.com/files/assignment1.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({
    description: 'Thời gian làm bài (tính bằng phút)',
    example: 60,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;
}