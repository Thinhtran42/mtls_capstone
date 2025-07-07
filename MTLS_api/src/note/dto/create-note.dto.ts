import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'ID của module mà note thuộc về',
    example: '6507d6f6c31c7948c831a123',
  })
  @IsNotEmpty()
  @IsMongoId()
  module: string;

  @ApiProperty({
    description: 'ID của học viên (sẽ được lấy từ token)',
    example: '6507d6f6c31c7948c831b789',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  student?: string;

  @ApiProperty({
    description: 'Nội dung ghi chú',
    example: 'Cần nhớ về các dấu chấm nhịp trong âm nhạc',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}