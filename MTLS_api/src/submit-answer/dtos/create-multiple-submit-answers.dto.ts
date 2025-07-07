import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubmitAnswerDto } from './create-submit-answer.dto';

export class CreateMultipleSubmitAnswersDto {
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
