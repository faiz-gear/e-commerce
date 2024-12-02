import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Promotion,
  PromotionDocument,
  PromotionStatus,
  PromotionType,
  CouponPromotion,
  FullGiftPromotion,
  FullReducePromotion,
  ReducePromotion,
} from './schemas/promotion.schema';
import {
  CreateCouponPromotionDto,
  CreateFullGiftPromotionDto,
  CreateFullReducePromotionDto,
  CreateReducePromotionDto,
} from './dto/create-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(@InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>) {}

  async createPromotion(
    type: PromotionType,
    createDto:
      | CreateCouponPromotionDto
      | CreateFullGiftPromotionDto
      | CreateFullReducePromotionDto
      | CreateReducePromotionDto,
  ): Promise<Promotion> {
    // 验证日期
    if (new Date(createDto.startDate) <= new Date()) {
      throw new BadRequestException('开始日期必须大于当前日期');
    }

    // 验证商品是否存在（如果指定了适用商品）
    if (createDto.applicableProducts?.length) {
      // TODO: 调用商品服务验证商品是否存在
    }

    // 根据不同类型进行特定验证
    switch (type) {
      case PromotionType.COUPON:
        await this.validateCouponPromotion(createDto as CreateCouponPromotionDto);
        break;
      case PromotionType.FULL_GIFT:
        await this.validateFullGiftPromotion(createDto as CreateFullGiftPromotionDto);
        break;
      // ... 其他类型的验证
    }

    const model = this.promotionModel.discriminators[type];
    if (!model) {
      throw new BadRequestException('Invalid promotion type');
    }

    const promotion = new model({
      ...createDto,
      promotionType: type,
      status: PromotionStatus.DRAFT,
    });

    return promotion.save();
  }

  private async validateCouponPromotion(dto: CreateCouponPromotionDto) {
    // 添加优惠券特定的验证逻辑
    if (dto.discountAmount > dto.minimumPurchase) {
      throw new BadRequestException('优惠金额不能大于最低消费金额');
    }
  }

  private async validateFullGiftPromotion(dto: CreateFullGiftPromotionDto) {
    // 验证赠品商品是否存在
    // TODO: 调用商品服务验证赠品商品是否存在
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionModel.find().exec();
  }

  async findByType(type: PromotionType): Promise<Promotion[]> {
    return this.promotionModel.find({ promotionType: type }).exec();
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }
    return promotion;
  }

  async activate(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.status !== PromotionStatus.DRAFT) {
      throw new BadRequestException('Only draft promotions can be activated');
    }

    promotion.status = PromotionStatus.ACTIVE;
    return promotion.save();
  }

  async deactivate(id: string): Promise<Promotion> {
    const promotion = await this.promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new BadRequestException('Only active promotions can be deactivated');
    }

    promotion.status = PromotionStatus.INACTIVE;
    return promotion.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.promotionModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Promotion not found');
    }
  }

  // 计算优惠金额的方法
  async calculateDiscount(promotionId: string, orderAmount: number, items: any[]): Promise<number> {
    const promotion = await this.findOne(promotionId);

    switch (promotion['promotionType']) {
      case PromotionType.COUPON:
        return this.calculateCouponDiscount(promotion as CouponPromotion, orderAmount);
      case PromotionType.FULL_REDUCE:
        return this.calculateFullReduceDiscount(promotion as FullReducePromotion, orderAmount);
      case PromotionType.REDUCE:
        return this.calculateReduceDiscount(promotion as ReducePromotion, orderAmount);
      default:
        return 0;
    }
  }

  private calculateCouponDiscount(promotion: CouponPromotion, orderAmount: number): number {
    if (orderAmount >= promotion.minimumPurchase) {
      return Math.min(promotion.discountAmount, orderAmount);
    }
    return 0;
  }

  private calculateFullReduceDiscount(promotion: FullReducePromotion, orderAmount: number): number {
    const applicableTier = [...promotion.tiers]
      .sort((a, b) => b.threshold - a.threshold)
      .find((tier) => orderAmount >= tier.threshold);

    return applicableTier ? applicableTier.reduction : 0;
  }

  private calculateReduceDiscount(promotion: ReducePromotion, orderAmount: number): number {
    if (promotion.isPercentage) {
      const discount = orderAmount * (promotion.reduction / 100);
      return promotion.maxReduction ? Math.min(discount, promotion.maxReduction) : discount;
    }
    return Math.min(promotion.reduction, orderAmount);
  }
}
