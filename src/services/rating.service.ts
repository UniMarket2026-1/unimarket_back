import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '@/entities/rating.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { CreateRatingDto } from '@/dto/rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(buyerId: string, createRatingDto: CreateRatingDto) {
    const { productId, sellerId, rating, comment } = createRatingDto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!seller || !buyer || !product) {
      throw new NotFoundException('Seller, buyer, or product not found');
    }

    // Check if already rated
    const existingRating = await this.ratingRepository.findOne({
      where: {
        buyerId,
        productId,
        sellerId,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this product');
    }

    const newRating = this.ratingRepository.create({
      seller,
      sellerId,
      buyer,
      buyerId,
      product,
      productId,
      rating,
      comment,
    });

    await this.ratingRepository.save(newRating);

    // Update seller's average rating
    const allRatings = await this.ratingRepository.find({ where: { sellerId } });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    seller.totalRating = Math.round(avgRating * 10) / 10;
    seller.ratingCount = allRatings.length;
    await this.userRepository.save(seller);

    return this.formatRating(newRating);
  }

  async getSellerRatings(sellerId: string) {
    const ratings = await this.ratingRepository.find({
      where: { sellerId },
      relations: ['buyer', 'product'],
      order: { date: 'DESC' },
    });

    return ratings.map(r => this.formatRating(r));
  }

  async getProductRatings(productId: string) {
    const ratings = await this.ratingRepository.find({
      where: { productId },
      relations: ['buyer'],
      order: { date: 'DESC' },
    });

    return ratings.map(r => this.formatRating(r));
  }

  async getUserRatingsGiven(buyerId: string) {
    const ratings = await this.ratingRepository.find({
      where: { buyerId },
      relations: ['seller', 'product'],
      order: { date: 'DESC' },
    });

    return ratings.map(r => this.formatRating(r));
  }

  private formatRating(rating: any) {
    return {
      id: rating.id,
      sellerId: rating.sellerId,
      buyerId: rating.buyerId,
      buyerName: rating.buyer?.name || 'Anonymous',
      productId: rating.productId,
      productName: rating.product?.name || 'Product',
      rating: rating.rating,
      comment: rating.comment,
      date: rating.date,
    };
  }
}
