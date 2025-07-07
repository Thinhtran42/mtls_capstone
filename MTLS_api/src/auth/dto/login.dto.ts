import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe@gmail.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
