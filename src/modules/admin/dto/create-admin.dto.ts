import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: ['super_admin', 'product_manager'] })
  @IsArray()
  @IsOptional()
  roles?: string[];
}
