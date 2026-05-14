import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Report } from '@/entities/report.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { ReportService } from '@/services/report.service';
import { ReportController } from '@/controllers/report.controller';
import { UserService } from '@/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, Product]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  providers: [ReportService, UserService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
