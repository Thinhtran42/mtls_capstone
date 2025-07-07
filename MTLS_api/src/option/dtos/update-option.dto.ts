import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOptionDto {
  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ example: 'Updated option content here' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
} 