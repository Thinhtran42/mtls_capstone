import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoExerciseDto {
  @ApiPropertyOptional({
    description: 'ID của học viên',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @IsOptional()
  student?: string;

  @ApiPropertyOptional({
    description: 'ID của bài tập',
    example: '60d21b4667d0d8992e610c86'
  })
  @IsMongoId()
  @IsOptional()
  exercise?: string;

  @ApiPropertyOptional({
    description: 'Điểm số',
    example: 90
  })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái của bài làm exercise',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}