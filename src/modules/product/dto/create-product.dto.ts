import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 13' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Latest iPhone model' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 999.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  images: string[];

  @ApiProperty({ example: 'Electronics' })
  @IsNotEmpty()
  @IsString()
  category: string;
}
