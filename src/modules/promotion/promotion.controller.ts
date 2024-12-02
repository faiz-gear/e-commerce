import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionService } from './promotion.service';
import {
  CreateCouponPromotionDto,
  CreateFullGiftPromotionDto,
  CreateFullReducePromotionDto,
  CreateReducePromotionDto,
} from './dto/create-promotion.dto';
import { CouponPromotion, Promotion, PromotionType } from './schemas/promotion.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@ApiTags('promotions')
@ApiBearerAuth()
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('coupon')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建优惠券活动' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: CouponPromotion,
  })
  async createCoupon(@Body() createDto: CreateCouponPromotionDto): Promise<Promotion> {
    return this.promotionService.createPromotion(PromotionType.COUPON, createDto);
  }

  @Post('full-gift')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建满赠活动' })
  async createFullGift(@Body() createDto: CreateFullGiftPromotionDto): Promise<Promotion> {
    return this.promotionService.createPromotion(PromotionType.FULL_GIFT, createDto);
  }

  @Post('full-reduce')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建满减活动' })
  async createFullReduce(@Body() createDto: CreateFullReducePromotionDto): Promise<Promotion> {
    return this.promotionService.createPromotion(PromotionType.FULL_REDUCE, createDto);
  }

  @Post('reduce')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '创建直减活动' })
  async createReduce(@Body() createDto: CreateReducePromotionDto): Promise<Promotion> {
    return this.promotionService.createPromotion(PromotionType.REDUCE, createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有活动' })
  async findAll(@Query('type') type?: PromotionType): Promise<Promotion[]> {
    if (type) {
      return this.promotionService.findByType(type);
    }
    return this.promotionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个活动详情' })
  async findOne(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.findOne(id);
  }

  @Put(':id/activate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '激活活动' })
  async activate(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.activate(id);
  }

  @Put(':id/deactivate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '停用活动' })
  async deactivate(@Param('id') id: string): Promise<Promotion> {
    return this.promotionService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '删除活动' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.promotionService.delete(id);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: '计算优惠金额' })
  async calculateDiscount(
    @Param('id') id: string,
    @Body() data: { orderAmount: number; items: any[] },
  ): Promise<{ discount: number }> {
    const discount = await this.promotionService.calculateDiscount(
      id,
      data.orderAmount,
      data.items,
    );
    return { discount };
  }
}
