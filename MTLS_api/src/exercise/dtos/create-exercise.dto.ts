import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsNotEmpty()
  section: string;

  @ApiProperty({ example: 'Music Theory Exercise' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'An exercise to practice music theory.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @IsNotEmpty()
  duration: number;
} 