import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingService } from '@/services/rating.service';
import { CreateRatingDto } from '@/dto/rating.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('api/ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return await this.ratingService.create(req.user.userId, createRatingDto);
  }

  @Get('seller/:sellerId')
  async getSellerRatings(@Param('sellerId') sellerId: string) {
    return await this.ratingService.getSellerRatings(sellerId);
  }

  @Get('product/:productId')
  async getProductRatings(@Param('productId') productId: string) {
    return await this.ratingService.getProductRatings(productId);
  }

  @Get('user/:userId')
  async getUserRatings(@Param('userId') userId: string) {
    return await this.ratingService.getUserRatingsGiven(userId);
  }
}
