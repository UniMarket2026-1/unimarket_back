import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@/modules/auth.module';
import { ProductModule } from '@/modules/product.module';
import { ChatModule } from '@/modules/chat.module';
import { RatingModule } from '@/modules/rating.module';
import { ReportModule } from '@/modules/report.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedController } from '@/controllers/seed.controller';
import { SeedService } from '@/services/seed.service';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { Chat } from '@/entities/chat.entity';
import { Message } from '@/entities/message.entity';
import { Rating } from '@/entities/rating.entity';
import { Report } from '@/entities/report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'unimarket'),
        entities: [User, Product, Chat, Message, Rating, Report],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Product, Chat, Message, Rating, Report]),
    AuthModule,
    ProductModule,
    ChatModule,
    RatingModule,
    ReportModule,
  ],
  controllers: [AppController, SeedController],
  providers: [AppService, SeedService],
})
export class AppModule {}
