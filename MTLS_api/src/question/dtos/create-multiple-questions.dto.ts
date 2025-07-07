import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class CreateMultipleQuestionsDto {
  @ApiProperty({
    description: 'Danh sách các câu hỏi cần tạo',
    type: [CreateQuestionDto],
    example: [
      {
        quiz: '60d21b4667d0d8992e610c85',
        questionText: 'What is the relative minor of C major?',
        notation: 'c/4/q, e/4/q, g/4/q',
      },
      {
        exercise: '60d21b4667d0d8992e610c90',
        questionText: 'What is the dominant of G major?',
        notation: 'd/4/q, f#/4/q, a/4/q',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsNotEmpty()
  questions: CreateQuestionDto[];
}