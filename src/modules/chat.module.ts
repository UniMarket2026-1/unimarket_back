import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from '@/entities/chat.entity';
import { Message } from '@/entities/message.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { ChatService } from '@/services/chat.service';
import { ChatController } from '@/controllers/chat.controller';
import { AiService } from '@/services/ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, User, Product]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-here',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
  ],
  providers: [ChatService, AiService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
