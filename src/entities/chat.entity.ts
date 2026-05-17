import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.chats, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => User, (user) => user.chatsAsBuyer, { onDelete: 'CASCADE' })
  buyer: User;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, (user) => user.chatsAsSeller, { onDelete: 'CASCADE' })
  seller: User;

  @Column()
  sellerId: string;

  @Column({ default: '' })
  lastMessage: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  lastMessageAt: Date;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
