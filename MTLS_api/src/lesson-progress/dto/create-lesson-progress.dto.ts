import { IsMongoId, IsNotEmpty, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLessonProgressDto {
  @ApiProperty({
    description: 'ID của bài học',
    example: '60d21b4667d0d8992e610c86'
  })
  @IsMongoId()
  @IsNotEmpty()
  lesson: string;

  @ApiProperty({
    description: 'Trạng thái hoàn thành bài học',
    example: false,
    default: false
  })
  @IsBoolean()
  status: boolean;
  
  @ApiProperty({
    description: 'Thời gian đánh dấu tiến độ',
    type: Date,
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  markAt?: Date;
} 