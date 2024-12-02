import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PromotionDocument = Promotion & Document;

export enum PromotionType {
  COUPON = 'Coupon', // 优惠券
  FULL_GIFT = 'FullGift', // 满赠
  FULL_REDUCE = 'FullReduce', // 满减
  REDUCE = 'Reduce', // 直减
}

export enum PromotionStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 活动中
  INACTIVE = 'inactive', // 已停用
  EXPIRED = 'expired', // 已过期
}

@Schema({
  timestamps: true,
  discriminatorKey: 'promotionType',
})
export class Promotion {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: PromotionStatus,
    default: PromotionStatus.DRAFT,
  })
  status: PromotionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }] })
  applicableProducts?: string[];

  @Prop({ type: [String] })
  applicableCategories?: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: String,
    enum: PromotionType,
    required: true,
    immutable: true,
  })
  promotionType: PromotionType;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

export class PromotionCommonProperty {
  name: string;

  description: string;

  status: PromotionStatus;

  startDate: Date;

  endDate: Date;

  usageCount: number;

  applicableProducts?: string[];

  applicableCategories?: string[];

  isActive: boolean;

  promotionType: PromotionType;
}

// 优惠券
@Schema({})
export class CouponPromotion extends PromotionCommonProperty {
  @Prop({ required: true, min: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  minimumPurchase: number;

  @Prop({ required: true, min: 1 })
  totalQuantity: number;

  @Prop({ required: true, min: 1 })
  perUserLimit: number;
}

// 满赠
@Schema({})
export class FullGiftPromotion extends PromotionCommonProperty {
  @Prop({ required: true, min: 0 })
  threshold: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }], required: true })
  giftProducts: string[];

  @Prop({ type: [Number], required: true })
  giftQuantities: number[];
}

// 满减
@Schema({})
export class FullReducePromotion extends PromotionCommonProperty {
  @Prop([
    {
      threshold: { type: Number, required: true },
      reduction: { type: Number, required: true },
    },
  ])
  tiers: { threshold: number; reduction: number }[];
}

// 直减
@Schema({})
export class ReducePromotion extends PromotionCommonProperty {
  @Prop({ required: true, min: 0 })
  reduction: number;

  @Prop({ default: false })
  isPercentage: boolean;

  @Prop({ min: 0 })
  maxReduction?: number;
}

export const CouponPromotionSchema = SchemaFactory.createForClass(CouponPromotion);
export const FullGiftPromotionSchema = SchemaFactory.createForClass(FullGiftPromotion);
export const FullReducePromotionSchema = SchemaFactory.createForClass(FullReducePromotion);
export const ReducePromotionSchema = SchemaFactory.createForClass(ReducePromotion);
