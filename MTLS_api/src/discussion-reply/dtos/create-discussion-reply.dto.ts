import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscussionReplyDto {
  @ApiProperty({
    description: 'ID của discussion',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsMongoId()
  @IsNotEmpty()
  discussionId: string;

  @ApiProperty({
    description: 'Nội dung phản hồi',
    example: 'Đây là câu trả lời cho thắc mắc của bạn...'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Trạng thái active của reply',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 