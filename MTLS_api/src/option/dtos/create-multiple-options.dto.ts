import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateOptionDto } from './create-option.dto';

export class CreateMultipleOptionsDto {
  @ApiProperty({
    description: 'Danh sách các tùy chọn cần tạo',
    type: [CreateOptionDto],
    example: [
      {
        question: '60d21b4667d0d8992e610c85',
        content: 'A minor',
        isCorrect: true,
      },
      {
        question: '60d21b4667d0d8992e610c85',
        content: 'B minor',
        isCorrect: false,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsNotEmpty()
  options: CreateOptionDto[];
}
