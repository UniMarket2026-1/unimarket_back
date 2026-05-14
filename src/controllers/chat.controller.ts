import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChatService } from '@/services/chat.service';
import { CreateChatDto, SendMessageDto } from '@/dto/chat.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('api/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrGet(@Body() createChatDto: CreateChatDto, @Request() req) {
    return await this.chatService.findOrCreateChat(
      createChatDto.productId,
      createChatDto.buyerId,
      createChatDto.sellerId,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserChats(@Param('userId') userId: string, @Request() req) {
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized');
    }
    const chats = await this.chatService.getUserChats(userId);
    // Format with otherPartyName
    return chats.map(chat => ({
      ...chat,
      otherPartyName: chat.buyerId === userId ? chat.sellerName : chat.buyerName || 'Seller',
    }));
  }

  @Get(':chatId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('chatId') chatId: string) {
    return await this.chatService.getChatMessages(chatId);
  }

  @Post(':chatId/messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() messageDto: SendMessageDto,
    @Request() req,
  ) {
    return await this.chatService.sendMessage(chatId, req.user.userId, messageDto);
  }

  @Get(':chatId/suggestion')
  @UseGuards(JwtAuthGuard)
  async getSuggestion(@Param('chatId') chatId: string) {
    return await this.chatService.generateChatSuggestion(chatId);
  }
}
