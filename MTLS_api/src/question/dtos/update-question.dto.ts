import { IsString, IsOptional } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiProperty({
    description: 'ID của quiz',
    example: '60d21b4667d0d8992e610c85',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  quiz?: string;

  @ApiProperty({
    description: 'Nội dung câu hỏi',
    example: 'What is the capital of France?',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiProperty({
    description: 'ID của bài tập nếu câu hỏi thuộc bài tập',
    example: '60d21b4667d0d8992e610c88',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  exercise?: string;

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
    enum: ['multipleChoice', 'vexFlow'],
    required: false,
  })
  @IsString()
  @IsOptional()
  questionType?: string;
}