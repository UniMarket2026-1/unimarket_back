import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Chat } from './chat.entity';
import { Rating } from './rating.entity';
import { Report } from './report.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string; // 'Libros' | 'Tecnología' | 'Muebles' | 'Ropa' | 'Otros'

  @Column()
  condition: string; // 'Nuevo' | 'Poco usado' | 'Usado'

  @Column({ type: 'text' })
  conditionDetail: string;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ type: 'text', default: '' })
  meetingPoint: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  seller: User;

  @Column()
  sellerId: string;

  @OneToMany(() => Chat, (chat) => chat.product)
  chats: Chat[];

  @OneToMany(() => Rating, (rating) => rating.product)
  ratings: Rating[];

  @OneToMany(() => Report, (report) => report.product)
  reports: Report[];
}
