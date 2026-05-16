import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import { CreateUserDto, LoginDto, UpdateUserDto } from '@/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private get isResendEnabled() {
    return !!process.env.RESEND_API_KEY;
  }

  private get isUniandesDomain() {
    return (email: string) => email.toLowerCase().endsWith('@uniandes.edu.co');
  }

  private generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationEmail(email: string, name: string, code: string) {
    if (!this.isResendEnabled) {
      console.warn(`[verification] Code for ${email}: ${code}`);
      return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'UniMarket <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'Tu código de verificación de UniMarket',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
            <h2 style="margin: 0 0 16px;">Hola, ${name}</h2>
            <p>Tu código para verificar tu correo en UniMarket es:</p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; padding: 16px 20px; background: #f8fafc; border-radius: 12px; display: inline-block; margin: 12px 0;">${code}</div>
            <p>Este código expira en 10 minutos.</p>
            <p>Si tú no solicitaste este correo, ignóralo.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to send verification email: ${text}`);
    }
  }

  private async issueVerificationCode(user: User) {
    const code = this.generateVerificationCode();
    user.emailVerificationCodeHash = await bcrypt.hash(code, 10);
    user.emailVerificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepository.save(user);
    await this.sendVerificationEmail(user.email, user.name, code);
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, name, role = 'student' } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: false,
    });

    await this.userRepository.save(user);
    await this.issueVerificationCode(user);

    return this.formatUser(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.formatUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return this.formatUser(user);
  }

  async toggleFavorite(userId: string, productId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.indexOf(productId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(productId);
    }

    await this.userRepository.save(user);
    return { favorites: user.favorites };
  }

  async getFavorites(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { favorites: user.favorites || [] };
  }

  async suspendUser(userId: string, reason: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.suspended = true;
    user.suspensionReason = reason;
    await this.userRepository.save(user);

    return this.formatUser(user);
  }

  async warnUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.warnings = (user.warnings || 0) + 1;
    if (user.warnings >= 3) {
      user.suspended = true;
      user.suspensionReason = 'Too many warnings';
    }

    await this.userRepository.save(user);
    return this.formatUser(user);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('New password must be different from old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return this.formatUser(user);
  }

  async sendVerificationCode(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    await this.issueVerificationCode(user);
    return { message: 'Verification code sent' };
  }

  async verifyEmailCode(userId: string, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return this.formatUser(user);
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationCodeExpiresAt) {
      throw new BadRequestException('Verification code not found. Request a new one.');
    }

    if (user.emailVerificationCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }

    const valid = await bcrypt.compare(code.trim(), user.emailVerificationCodeHash);
    if (!valid) {
      throw new BadRequestException('Invalid verification code');
    }

    user.emailVerified = true;
    user.emailVerificationCodeHash = null;
    user.emailVerificationCodeExpiresAt = null;
    await this.userRepository.save(user);

    return this.formatUser(user);
  }

  private formatUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      uniandesVerified: this.isUniandesDomain(user.email),
      role: user.role,
      favorites: user.favorites || [],
      interests: user.interests || [],
      notificationsEnabled: user.notificationsEnabled,
      totalRating: user.totalRating,
      ratingCount: user.ratingCount,
      suspended: user.suspended,
      warnings: user.warnings,
      createdAt: user.createdAt,
    };
  }
}
