import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(
    @User('userId') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.create(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户所有订单' })
  async findAll(@User('userId') userId: string): Promise<Order[]> {
    return this.orderService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@User('userId') userId: string, @Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(userId, id);
  }
}
