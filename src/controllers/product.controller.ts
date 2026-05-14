import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProductService } from '@/services/product.service';
import { CreateProductDto, UpdateProductDto } from '@/dto/product.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return await this.productService.create(createProductDto, req.user.userId);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: string,
    @Query('condition') condition?: string,
  ) {
    return await this.productService.findAll(page, limit, category, condition);
  }

  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return await this.productService.search(searchTerm, page, limit);
  }

  @Get('seller/:sellerId')
  async getSellerProducts(@Param('sellerId') sellerId: string) {
    return await this.productService.getSellerProducts(sellerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return await this.productService.update(id, updateProductDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    return await this.productService.remove(id, req.user.userId);
  }

  @Post(':id/generate-description')
  @UseGuards(JwtAuthGuard)
  async generateDescription(
    @Param('id') id: string,
    @Body() body: { productName: string; category: string; condition: string; price: number },
  ) {
    return await this.productService.generateDescription(
      body.productName,
      body.category,
      body.condition,
      body.price,
    );
  }
}
