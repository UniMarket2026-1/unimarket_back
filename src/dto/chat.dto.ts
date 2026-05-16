import { IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  productId: string;

  @IsString()
  buyerId: string;

  @IsString()
  sellerId: string;
}

export class ChatResponseDto {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  sellerId: string;
  otherPartyName: string;
  lastMessage: string;
  createdAt: Date;
}

export class SendMessageDto {
  @IsString()
  text: string;
}

export class MessageResponseDto {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Date;
}
