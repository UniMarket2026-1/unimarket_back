import { Controller, Post, Get, Body, Param, UseGuards, Request, Put, Delete, Query } from '@nestjs/common';
import { UserService } from '@/services/user.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from '@/dto/user.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return await this.userService.findOne(req.user.userId);
  }
}

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    if (req.user.userId !== id && req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return await this.userService.update(id, updateUserDto);
  }

  @Post(':id/favorites/:productId')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(
    @Param('id') userId: string,
    @Param('productId') productId: string,
    @Request() req,
  ) {
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized');
    }
    return await this.userService.toggleFavorite(userId, productId);
  }

  @Get(':id/favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Param('id') userId: string, @Request() req) {
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized');
    }
    return await this.userService.getFavorites(userId);
  }
}
