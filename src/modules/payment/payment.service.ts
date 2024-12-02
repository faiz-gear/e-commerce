import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/schemas/order.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private orderService: OrderService,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // 获取订单信息
    const order = await this.orderService.findOne(userId, createPaymentDto.orderId);

    // 检查订单状态
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending status');
    }

    // 检查是否已存在支付记录
    const existingPayment = await this.paymentModel.findOne({ order: createPaymentDto.orderId });
    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this order');
    }

    // 创建支付记录
    const payment = new this.paymentModel({
      order: createPaymentDto.orderId,
      amount: order.totalAmount,
      method: createPaymentDto.method,
    });

    return payment.save();
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ order: orderId });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async updateStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndUpdate(paymentId, { status }, { new: true });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 如果支付成功，更新订单状态
    if (status === PaymentStatus.SUCCESS) {
      await this.orderService.updateStatus(payment.order.toString(), OrderStatus.PAID);
    }

    return payment;
  }

  async handleCallback(paymentId: string, callbackData: any): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 根据回调数据更新支付状态
    const status = this.validateCallback(callbackData)
      ? PaymentStatus.SUCCESS
      : PaymentStatus.FAILED;

    return this.updateStatus(paymentId, status);
  }

  private validateCallback(callbackData: any): boolean {
    // 实现支付回调验证逻辑
    // 这里应该根据具体的支付平台实现验证逻辑
    return true;
  }
}
