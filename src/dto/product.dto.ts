import { IsString, IsNumber, IsUrl, IsIn, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  @IsIn(['Nuevo', 'Poco usado', 'Usado'])
  condition: string;

  @IsString()
  conditionDetail: string;

  @IsString()
  imageUrl: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Nuevo', 'Poco usado', 'Usado'])
  condition?: string;

  @IsOptional()
  @IsString()
  conditionDetail?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
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
