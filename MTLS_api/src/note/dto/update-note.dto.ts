import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Nội dung ghi chú',
    example: 'Cập nhật: Cần nhớ về các dấu chấm nhịp và dấu lặng trong âm nhạc',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}