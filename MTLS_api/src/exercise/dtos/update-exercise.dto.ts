import { IsString, IsOptional, IsNumber } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExerciseDto {
  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  section?: string;

  @ApiPropertyOptional({ example: 'Advanced Music Theory Exercise' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'An advanced exercise to practice music theory.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @IsOptional()
  duration?: number;
} 