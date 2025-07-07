import { IsString, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: 'Music Theory Basics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A quiz to test your basic knowledge of music theory.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsNotEmpty()
  duration: number;
} 