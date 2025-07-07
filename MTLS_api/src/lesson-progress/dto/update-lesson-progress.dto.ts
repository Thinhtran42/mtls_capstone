import { IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateLessonProgressDto {
  @ApiPropertyOptional({
    description: 'Trạng thái hoàn thành bài học',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
  
  @ApiPropertyOptional({
    description: 'Thời gian đánh dấu tiến độ',
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  markAt?: Date;
} 