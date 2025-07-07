import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmitType } from '../schemas/submit-answer.schema';

export class UpdateSubmitAnswerDto {
  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c86' })
  @IsMongoId()
  @IsOptional()
  option?: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c87', required: false })
  @IsMongoId()
  @IsOptional()
  doQuiz?: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c88', required: false })
  @IsMongoId()
  @IsOptional()
  doExercise?: string;

  @ApiPropertyOptional({ example: SubmitType.EXERCISE })
  @IsEnum(SubmitType)
  @IsOptional()
  submitType?: SubmitType;
}
