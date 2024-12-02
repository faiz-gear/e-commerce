import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    let totalAmount = 0;
    const orderItems = [];

    // Calculate total amount and prepare order items
    for (const item of createOrderDto.items) {
      const product = await this.productService.findOne(item.productId);
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = new this.orderModel({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
    });

    return order.save();
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.orderModel.find({ user: userId }).populate('items.product').exec();
  }

  async findOne(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: orderId, user: userId })
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
