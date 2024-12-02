import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { PromotionType, PromotionStatus } from '../schemas/promotion.schema';

// 基础 DTO
export class BasePromotionDto {
  @ApiProperty({ example: '双11优惠活动' })
  @IsString()
  name: string;

  @ApiProperty({ example: '活动描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicableProducts?: string[];

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];
}

// 优惠券 DTO
export class CreateCouponPromotionDto extends BasePromotionDto {
  @ApiProperty({ enum: PromotionType, example: PromotionType.COUPON })
  @IsEnum(PromotionType)
  readonly type = PromotionType.COUPON;

  @ApiProperty({ example: 100, description: '优惠金额' })
  @IsNumber()
  @Min(0)
  discountAmount: number;

  @ApiProperty({ example: 1000, description: '最低消费金额' })
  @IsNumber()
  @Min(0)
  minimumPurchase: number;

  @ApiProperty({ example: 1000, description: '发放总量' })
  @IsNumber()
  @Min(1)
  totalQuantity: number;

  @ApiProperty({ example: 1, description: '每人限领数量' })
  @IsNumber()
  @Min(1)
  perUserLimit: number;
}

// 满赠 DTO
export class CreateFullGiftPromotionDto extends BasePromotionDto {
  @ApiProperty({ enum: PromotionType, example: PromotionType.FULL_GIFT })
  @IsEnum(PromotionType)
  readonly type = PromotionType.FULL_GIFT;

  @ApiProperty({ example: 1000, description: '满足金额' })
  @IsNumber()
  @Min(0)
  threshold: number;

  @ApiProperty({ type: [String], description: '赠品商品ID列表' })
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  giftProducts: string[];

  @ApiProperty({ type: [Number], description: '赠品数量列表' })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  giftQuantities: number[];
}

// 满减层级 DTO
class FullReduceTier {
  @ApiProperty({ example: 1000, description: '满足金额' })
  @IsNumber()
  @Min(0)
  threshold: number;

  @ApiProperty({ example: 100, description: '减免金额' })
  @IsNumber()
  @Min(0)
  reduction: number;
}

// 满减 DTO
export class CreateFullReducePromotionDto extends BasePromotionDto {
  @ApiProperty({ enum: PromotionType, example: PromotionType.FULL_REDUCE })
  @IsEnum(PromotionType)
  readonly type = PromotionType.FULL_REDUCE;

  @ApiProperty({ type: [FullReduceTier], description: '满减层级' })
  @ValidateNested({ each: true })
  @Type(() => FullReduceTier)
  @ArrayMinSize(1)
  tiers: FullReduceTier[];
}

// 直减 DTO
export class CreateReducePromotionDto extends BasePromotionDto {
  @ApiProperty({ enum: PromotionType, example: PromotionType.REDUCE })
  @IsEnum(PromotionType)
  readonly type = PromotionType.REDUCE;

  @ApiProperty({ example: 100, description: '减免金额/百分比' })
  @IsNumber()
  @Min(0)
  reduction: number;

  @ApiProperty({ example: false, description: '是否为百分比' })
  @IsBoolean()
  isPercentage: boolean;

  @ApiProperty({ example: 1000, description: '最大减免金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxReduction?: number;
}
