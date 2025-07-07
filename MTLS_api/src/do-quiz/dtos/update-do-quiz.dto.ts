import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoQuizDto {
  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  student?: string;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c86' })
  @IsMongoId()
  @IsOptional()
  quiz?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  score?: number;
  
  @ApiPropertyOptional({ 
    description: 'Trạng thái của bài làm quiz', 
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
} 