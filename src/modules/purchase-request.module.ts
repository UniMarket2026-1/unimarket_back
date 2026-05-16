import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/entities/product.entity';
import { User } from '@/entities/user.entity';
import { PurchaseRequest } from '@/entities/purchase-request.entity';
import { PurchaseRequestService } from '@/services/purchase-request.service';
import { PurchaseRequestController } from '@/controllers/purchase-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequest, Product, User])],
  providers: [PurchaseRequestService],
  controllers: [PurchaseRequestController],
  exports: [PurchaseRequestService],
})
export class PurchaseRequestModule {}
