export class CreateProductDto {
  name: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  conditionDetail: string;
  imageUrl: string;
}

export class UpdateProductDto {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  condition?: string;
  conditionDetail?: string;
  imageUrl?: string;
  active?: boolean;
}

export class ProductResponseDto {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  conditionDetail: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  active: boolean;
  createdAt: Date;
}
