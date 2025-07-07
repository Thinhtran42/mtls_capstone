import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscussionDto {
  @ApiProperty({
    description: 'ID của module',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({
    description: 'Nội dung thảo luận',
    example: 'Tôi có thắc mắc về bài học này...'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
} 