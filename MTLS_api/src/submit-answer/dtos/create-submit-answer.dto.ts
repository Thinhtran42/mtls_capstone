import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubmitType } from '../schemas/submit-answer.schema';

export class CreateSubmitAnswerDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c86' })
  @IsMongoId()
  @IsNotEmpty()
  option: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c87', required: false })
  @IsMongoId()
  @IsOptional()
  doQuiz?: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c88', required: false })
  @IsMongoId()
  @IsOptional()
  doExercise?: string;

  @ApiProperty({ example: SubmitType.QUIZ })
  @IsEnum(SubmitType)
  @IsNotEmpty()
  submitType: SubmitType;
} 