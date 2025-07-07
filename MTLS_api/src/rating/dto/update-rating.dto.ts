import { PartialType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @ApiProperty({
    description: 'Số sao đánh giá (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiProperty({
    description: 'Nhận xét về khóa học',
    example: 'Khóa học rất hay và dễ hiểu',
    required: false
  })
  @IsOptional()
  @IsString()
  comment?: string;
}