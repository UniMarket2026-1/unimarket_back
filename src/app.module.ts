import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@/modules/auth.module';
import { ProductModule } from '@/modules/product.module';
import { ChatModule } from '@/modules/chat.module';
import { RatingModule } from '@/modules/rating.module';
import { ReportModule } from '@/modules/report.module';
import { PurchaseRequestModule } from '@/modules/purchase-request.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedController } from '@/controllers/seed.controller';
import { AiController } from '@/controllers/ai.controller';
import { SeedService } from '@/services/seed.service';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { Chat } from '@/entities/chat.entity';
import { Message } from '@/entities/message.entity';
import { Rating } from '@/entities/rating.entity';
import { Report } from '@/entities/report.entity';
import { PurchaseRequest } from '@/entities/purchase-request.entity';
import { AiService } from '@/services/ai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const usePostgres =
          process.env.USE_POSTGRES === '1' ||
          !!databaseUrl ||
          configService.get('NODE_ENV') === 'production';
        if (usePostgres) {
          return {
            type: 'postgres',
            url: databaseUrl || undefined,
            host: databaseUrl ? undefined : configService.get('DATABASE_HOST', 'localhost'),
            port: databaseUrl ? undefined : parseInt(configService.get('DATABASE_PORT', '5432'), 10),
            username: databaseUrl ? undefined : configService.get('DATABASE_USER', 'postgres'),
            password: databaseUrl ? undefined : configService.get('DATABASE_PASSWORD', 'postgres'),
            database: databaseUrl ? undefined : configService.get('DATABASE_NAME', 'unimarket'),
            ssl:
              configService.get('DATABASE_SSL', 'false') === 'true' ||
              (databaseUrl && configService.get('NODE_ENV') === 'production')
              ? { rejectUnauthorized: false }
              : false,
            entities: [User, Product, Chat, Message, Rating, Report, PurchaseRequest],
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'sqlite',
          database: configService.get('SQLITE_DB_PATH', 'dev.sqlite'),
          entities: [User, Product, Chat, Message, Rating, Report, PurchaseRequest],
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Product, Chat, Message, Rating, Report, PurchaseRequest]),
    AuthModule,
    ProductModule,
    ChatModule,
    RatingModule,
    ReportModule,
    PurchaseRequestModule,
  ],
  controllers: [AppController, SeedController, AiController],
  providers: [AppService, SeedService, AiService],
})
export class AppModule {}
