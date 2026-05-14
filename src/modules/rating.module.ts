import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Rating } from '@/entities/rating.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { RatingService } from '@/services/rating.service';
import { RatingController } from '@/controllers/rating.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, User, Product]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingModule {}
