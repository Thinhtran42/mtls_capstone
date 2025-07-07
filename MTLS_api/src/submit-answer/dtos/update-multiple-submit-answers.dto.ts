import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubmitAnswerDto } from './create-submit-answer.dto';

export class UpdateMultipleSubmitAnswersDto {
  @ApiProperty({
    description: 'ID của bài làm quiz',
    type: String,
  })
  @IsString()
  @IsOptional()
  doQuiz: string;

  @ApiProperty({
    description: 'ID của bài làm exercise',
    type: String,
  })
  @IsString()
  @IsOptional()
  doExercise: string;

  @ApiProperty({
    description: 'Danh sách các câu trả lời cần submit',
    type: [CreateSubmitAnswerDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateSubmitAnswerDto)
  submitAnswers: CreateSubmitAnswerDto[];
}
