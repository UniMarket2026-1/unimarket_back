import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  productId: string;

  @IsString()
  sellerId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;
}

export class RatingResponseDto {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: Date;
}
