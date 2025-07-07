import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingsDto {
  @ApiProperty({
    description: 'Unique key for the setting',
    example: 'site.name',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Value of the setting',
    example: 'Music Theory Learning System',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Type of the setting value',
    example: 'string',
    enum: ['string', 'number', 'boolean', 'json'],
  })
  @IsString()
  @IsIn(['string', 'number', 'boolean', 'json'])
  @IsOptional()
  type?: string = 'string';

  @ApiPropertyOptional({
    description: 'Description of what this setting does',
    example: 'The name of the site displayed in header and title',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this setting contains sensitive information',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean = false;
}
