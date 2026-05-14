import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '@/entities/chat.entity';
import { Message } from '@/entities/message.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { CreateChatDto, SendMessageDto } from '@/dto/chat.dto';
import { AiService } from './ai.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly aiService: AiService,
  ) {}

  async findOrCreateChat(productId: string, buyerId: string, sellerId: string) {
    let chat = await this.chatRepository.findOne({
      where: {
        productId,
        buyerId,
        sellerId,
      },
      relations: ['product', 'seller', 'buyer'],
    });

    if (!chat) {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
      const seller = await this.userRepository.findOne({ where: { id: sellerId } });

      if (!product || !buyer || !seller) {
        throw new NotFoundException('Product, buyer, or seller not found');
      }

      chat = this.chatRepository.create({
        product,
        productId,
        buyer,
        buyerId,
        seller,
        sellerId,
      });

      await this.chatRepository.save(chat);
    }

    return this.formatChat(chat);
  }

  async getUserChats(userId: string) {
    const chats = await this.chatRepository.find({
      where: [
        { buyerId: userId },
        { sellerId: userId },
      ],
      relations: ['product', 'seller', 'buyer', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });

    return chats.map(chat => this.formatChat(chat));
  }

  async getChatMessages(chatId: string) {
    const messages = await this.messageRepository.find({
      where: { chatId },
      relations: ['sender'],
      order: { timestamp: 'ASC' },
    });

    return messages.map(m => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.senderId,
      text: m.text,
      timestamp: m.timestamp,
    }));
  }

  async sendMessage(chatId: string, senderId: string, messageDto: SendMessageDto) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
      throw new BadRequestException('You are not part of this chat');
    }

    const message = this.messageRepository.create({
      chat,
      chatId,
      senderId,
      text: messageDto.text,
    });

    await this.messageRepository.save(message);

    // Update chat's last message
    chat.lastMessage = messageDto.text;
    chat.lastMessageAt = new Date();
    await this.chatRepository.save(chat);

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      text: message.text,
      timestamp: message.timestamp,
    };
  }

  async generateChatSuggestion(chatId: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const context = `Recent message: ${chat.lastMessage}`;
    const suggestion = await this.aiService.generateChatSuggestion(context);

    return { suggestion };
  }

  private formatChat(chat: any) {
    return {
      id: chat.id,
      productId: chat.productId,
      productName: chat.product?.name || 'Product',
      buyerId: chat.buyerId,
      sellerId: chat.sellerId,
      otherPartyName: '', // Will be set by controller
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    };
  }
}
