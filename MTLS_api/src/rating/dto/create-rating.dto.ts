import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    description: 'ID của khóa học',
    example: '6507d6f6c31c7948c831a123',
  })
  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @ApiProperty({
    description: 'ID của khóa học',
    example: '6507d6f6c31c7948c831a123',
  })
  @IsOptional()
  @IsMongoId()
  student: string;

  @ApiProperty({
    description: 'Số sao đánh giá (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({
    description: 'Nhận xét về khóa học',
    example: 'Khóa học rất hay và dễ hiểu',
    required: false
  })
  @IsOptional()
  @IsString()
  comment?: string;
}