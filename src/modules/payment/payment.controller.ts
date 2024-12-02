import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './schemas/payment.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: '创建支付' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(
    @User('userId') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.create(userId, createPaymentDto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '获取订单支付信息' })
  async findByOrderId(
    @User('userId') userId: string,
    @Param('orderId') orderId: string,
  ): Promise<Payment> {
    return this.paymentService.findByOrderId(orderId);
  }

  @Post(':id/callback')
  @ApiOperation({ summary: '支付回调' })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async handlePaymentCallback(
    @Param('id') paymentId: string,
    @Body() callbackData: any,
  ): Promise<Payment> {
    // 处理支付回调逻辑
    return this.paymentService.handleCallback(paymentId, callbackData);
  }
}
