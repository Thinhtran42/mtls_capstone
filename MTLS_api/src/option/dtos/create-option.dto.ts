import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'Option content here' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;

  @ApiProperty({
    description: 'Trạng thái hoạt động của tùy chọn',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
