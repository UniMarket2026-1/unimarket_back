import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Product } from '@/entities/product.entity';
import { User } from '@/entities/user.entity';
import { ProductService } from '@/services/product.service';
import { ProductController } from '@/controllers/product.controller';
import { AiService } from '@/services/ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  providers: [ProductService, AiService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
