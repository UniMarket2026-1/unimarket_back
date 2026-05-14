export class CreateRatingDto {
  productId: string;
  sellerId: string;
  rating: number;
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
