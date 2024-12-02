import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../schemas/payment.schema';

export class CreatePaymentDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: '订单ID',
  })
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.ALIPAY,
    description: '支付方式',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
