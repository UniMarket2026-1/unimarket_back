import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { UserService } from '@/services/user.service';
import { CreateUserDto, LoginDto, UpdateUserDto, VerifyEmailCodeDto } from '@/dto/user.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('auth')
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

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      throw new Error('Old password and new password are required');
    }
    return await this.userService.changePassword(req.user.userId, oldPassword, newPassword);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.userService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { code: string; newPassword: string }) {
    return await this.userService.resetPassword(body.code, body.newPassword);
  }

  @Post('send-verification-code')
  @UseGuards(JwtAuthGuard)
  async sendVerificationCode(@Request() req) {
    return await this.userService.sendVerificationCode(req.user.userId);
  }

  @Post('verify-email-code')
  @UseGuards(JwtAuthGuard)
  async verifyEmailCode(@Request() req, @Body() body: VerifyEmailCodeDto) {
    return await this.userService.verifyEmailCode(req.user.userId, body.code);
  }
}

@Controller('users')
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
