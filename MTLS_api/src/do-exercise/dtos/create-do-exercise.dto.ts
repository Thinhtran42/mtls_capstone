import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoExerciseDto {

  @ApiProperty({
    description: 'ID của bài tập',
    example: '60d21b4667d0d8992e610c86'
  })
  @IsMongoId()
  @IsNotEmpty()
  exercise: string;

  @ApiProperty({
    description: 'Điểm số',
    example: 85,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  score?: number;
}
