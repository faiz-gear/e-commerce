import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车' })
  async findOne(@User('userId') userId: string): Promise<Cart> {
    return this.cartService.findByUser(userId);
  }

  @Post('items')
  @ApiOperation({ summary: '添加商品到购物车' })
  async addItem(
    @User('userId') userId: string,
    @Body() item: { productId: string; quantity: number },
  ): Promise<Cart> {
    return this.cartService.addItem(userId, item.productId, item.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: '从购物车移除商品' })
  async removeItem(
    @User('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<Cart> {
    return this.cartService.removeItem(userId, productId);
  }
}
