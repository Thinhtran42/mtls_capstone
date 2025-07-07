import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateContentDto } from './create-content.dto';

export class CreateMultipleContentsDto {
  @ApiProperty({
    description: 'Danh sách các nội dung cần tạo',
    type: [CreateContentDto],
    example: [
      {
        lesson: '60d21b4667d0d8992e610c85',
        type: 'text',
        data: 'Âm nhạc là một hình thức nghệ thuật...'
      },
      {
        lesson: '60d21b4667d0d8992e610c85',
        type: 'video',
        data: 'https://example.com/video.mp4'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentDto)
  @IsNotEmpty()
  contents: CreateContentDto[];
}