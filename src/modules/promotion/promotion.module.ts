import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import {
  Promotion,
  PromotionSchema,
  CouponPromotion,
  CouponPromotionSchema,
  FullGiftPromotion,
  FullGiftPromotionSchema,
  FullReducePromotion,
  FullReducePromotionSchema,
  ReducePromotion,
  ReducePromotionSchema,
} from './schemas/promotion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Promotion.name,
        schema: PromotionSchema,
        discriminators: [
          { name: CouponPromotion.name, schema: CouponPromotionSchema },
          { name: FullGiftPromotion.name, schema: FullGiftPromotionSchema },
          { name: FullReducePromotion.name, schema: FullReducePromotionSchema },
          { name: ReducePromotion.name, schema: ReducePromotionSchema },
        ],
      },
    ]),
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
