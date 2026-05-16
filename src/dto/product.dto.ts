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
  @IsIn(['Libros', 'Tecnología', 'Muebles', 'Ropa', 'Electrónica', 'Deportes', 'Arte', 'Instrumentos Musicales', 'Cocina', 'Accesorios', 'Otros'])
  category: string;

  @IsString()
  @IsIn(['Nuevo', 'Poco usado', 'Usado'])
  condition: string;

  @IsString()
  conditionDetail: string;

  @IsString()
  imageUrl: string;

  @IsString()
  meetingPoint: string;
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
  @IsIn(['Libros', 'Tecnología', 'Muebles', 'Ropa', 'Electrónica', 'Deportes', 'Arte', 'Instrumentos Musicales', 'Cocina', 'Accesorios', 'Otros'])
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
  @IsString()
  meetingPoint?: string;

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
  sellerVerified: boolean;
  active: boolean;
  meetingPoint: string;
  createdAt: Date;
}
