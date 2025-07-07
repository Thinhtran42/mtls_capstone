import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoQuizDto {

  @ApiProperty({ example: '60d21b4667d0d8992e610c86' })
  @IsMongoId()
  @IsNotEmpty()
  quiz: string;

  @ApiProperty({ example: 85 })
  @IsNumber()
  @IsNotEmpty()
  score: number;
}
