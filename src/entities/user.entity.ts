import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { Chat } from './chat.entity';
import { Rating } from './rating.entity';
import { Report } from './report.entity';
import { Message } from './message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['student', 'admin'], default: 'student' })
  role: 'student' | 'admin';

  @Column({ type: 'simple-array', default: '' })
  favorites: string[];

  @Column({ type: 'simple-array', default: 'Libros,Tecnología,Muebles,Ropa,Electrónica,Deportes,Arte,Instrumentos Musicales,Cocina,Accesorios,Otros' })
  interests: string[];

  @Column({ default: true })
  notificationsEnabled: boolean;

  @Column({ type: 'float', default: 0 })
  totalRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ default: false })
  suspended: boolean;

  @Column({ nullable: true })
  suspensionReason: string;

  @Column({ default: 0 })
  warnings: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Chat, (chat) => chat.buyer)
  chatsAsBuyer: Chat[];

  @OneToMany(() => Chat, (chat) => chat.seller)
  chatsAsSeller: Chat[];

  @OneToMany(() => Rating, (rating) => rating.seller)
  ratingsReceived: Rating[];

  @OneToMany(() => Rating, (rating) => rating.buyer)
  ratingsGiven: Rating[];

  @OneToMany(() => Report, (report) => report.reporter)
  reportsCreated: Report[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
