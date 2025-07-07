import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuizDto {
  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  section?: string;

  @ApiPropertyOptional({ example: 'Advanced Music Theory' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'An advanced quiz to test your knowledge of music theory.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'] })
  @IsArray()
  @IsOptional()
  questions?: string[];
} 