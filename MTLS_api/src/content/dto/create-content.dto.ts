import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../schemas/content.schema';

export class CreateContentDto {
  @ApiProperty({
    description: 'The ID of the lesson this content belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  lesson: string;

  @ApiProperty({
    description: 'The type of content',
    example: 'Video',
    enum: ContentType,
  })
  @IsNotEmpty()
  @IsEnum(ContentType)
  type: string;

  @ApiProperty({
    description: 'The content data (URL for video, text for reading)',
    example: 'https://example.com/video.mp4',
  })
  @IsNotEmpty()
  @IsString()
  data: string;

  @ApiProperty({
    description: 'The caption of the content',
    example: 'This is a caption',
  })
  @IsOptional()
  @IsString()
  caption: string;
}