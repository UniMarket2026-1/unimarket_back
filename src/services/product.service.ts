import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/entities/product.entity';
import { User } from '@/entities/user.entity';
import { Rating } from '@/entities/rating.entity';
import { CreateProductDto, UpdateProductDto } from '@/dto/product.dto';
import { AiService } from './ai.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    private readonly aiService: AiService,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      seller,
      sellerId,
    });

    const saved = await this.productRepository.save(product);
    return this.formatProduct({ ...saved, seller, ratings: [] });
  }

  async findAll(page = 1, limit = 20, category?: string, condition?: string) {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.active = :active', { active: true })
      .leftJoinAndSelect('product.seller', 'seller');

    if (category && category !== 'Todos') {
      query.andWhere('product.category = :category', { category });
    }

    if (condition && condition !== 'Todos') {
      query.andWhere('product.condition = :condition', { condition });
    }

    query.orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, total] = await query.getManyAndCount();
    const ratings = products.length
      ? await this.ratingRepository.find({
          where: products.map((product) => ({ productId: product.id })),
        })
      : [];
    const ratingsByProductId = ratings.reduce<Record<string, Rating[]>>((acc, rating) => {
      acc[rating.productId] = acc[rating.productId] ?? [];
      acc[rating.productId].push(rating);
      return acc;
    }, {});

    return {
      data: products.map((p) => this.formatProduct({ ...p, ratings: ratingsByProductId[p.id] ?? [] })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(searchTerm: string, page = 1, limit = 20) {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.active = :active', { active: true })
      .andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${searchTerm}%`,
      })
      .leftJoinAndSelect('product.seller', 'seller')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, total] = await query.getManyAndCount();
    const ratings = products.length
      ? await this.ratingRepository.find({
          where: products.map((product) => ({ productId: product.id })),
        })
      : [];
    const ratingsByProductId = ratings.reduce<Record<string, Rating[]>>((acc, rating) => {
      acc[rating.productId] = acc[rating.productId] ?? [];
      acc[rating.productId].push(rating);
      return acc;
    }, {});

    return {
      data: products.map((p) => this.formatProduct({ ...p, ratings: ratingsByProductId[p.id] ?? [] })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['seller', 'ratings'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto, sellerId: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new BadRequestException('You can only edit your own products');
    }

    Object.assign(product, updateProductDto);
    const saved = await this.productRepository.save(product);
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    return this.formatProduct({ ...saved, seller, ratings: [] });
  }

  async remove(id: string, sellerId: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new BadRequestException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  async generateDescription(
    productName: string,
    category: string,
    condition: string,
    price: number,
  ) {
    return await this.aiService.generateProductDescription(
      productName,
      category,
      condition,
      price,
    );
  }

  async getSellerProducts(sellerId: string) {
    const products = await this.productRepository.find({
      where: { sellerId },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });

    const ratings = products.length
      ? await this.ratingRepository.find({
          where: products.map((product) => ({ productId: product.id })),
        })
      : [];
    const ratingsByProductId = ratings.reduce<Record<string, Rating[]>>((acc, rating) => {
      acc[rating.productId] = acc[rating.productId] ?? [];
      acc[rating.productId].push(rating);
      return acc;
    }, {});

    return products.map((p) => this.formatProduct({ ...p, ratings: ratingsByProductId[p.id] ?? [] }));
  }

  async analyzeImage(
    imageData: string,
    hints?: { productName?: string; category?: string; condition?: string },
  ) {
    return this.aiService.analyzeProductImage(imageData, hints);
  }

  private formatProduct(product: any) {
    const avgRating = product.ratings && product.ratings.length > 0
      ? product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length
      : product.seller?.totalRating || 0;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      condition: product.condition,
      conditionDetail: product.conditionDetail,
      imageUrl: product.imageUrl,
      sellerId: product.sellerId,
      sellerName: product.seller?.name || 'Unknown',
      sellerRating: Math.round(avgRating * 10) / 10,
      sellerVerified: !!product.seller?.emailVerified,
      active: product.active,
      meetingPoint: product.meetingPoint,
      createdAt: product.createdAt,
    };
  }
}
