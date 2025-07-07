import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'ID của quiz',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId()
  @IsOptional()
  quiz?: string;

  @ApiProperty({
    description: 'ID của bài tập nếu câu hỏi thuộc bài tập',
    example: '60d21b4667d0d8992e610c88',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  exercise?: string;

  @ApiProperty({
    description: 'Nội dung câu hỏi',
    example: 'What is the capital of France?',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của câu hỏi',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Chuỗi notation để hiển thị khuông nhạc',
    example: 'c/4/q, e/4/q, g/4/q',
    required: false,
  })
  @IsString()
  @IsOptional()
  notation?: string;

  @ApiProperty({
    description: 'Loại câu hỏi',
    example: 'multipleChoice',
    default: 'multipleChoice',
    enum: ['multipleChoice', 'vexFlow'],
    required: false,
  })
  @IsString()
  @IsOptional()
  questionType?: string;
}