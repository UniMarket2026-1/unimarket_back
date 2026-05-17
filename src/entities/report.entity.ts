import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string; // product ID or user ID

  @Column({ type: 'text' })
  itemType: 'product' | 'user';

  @ManyToOne(() => User, (user) => user.reportsCreated, { onDelete: 'CASCADE' })
  reporter: User;

  @Column()
  reporterId: string;

  @Column()
  reason: string;

  @Column({ type: 'text' })
  category: 'spam' | 'inappropriate' | 'fraud' | 'other';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', default: 'pending' })
  status: 'pending' | 'resolved' | 'dismissed';

  @Column({ type: 'text', nullable: true })
  resolution: 'warning' | 'suspension' | 'removal' | 'dismissed' | null;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Product, (product) => product.reports, { nullable: true, onDelete: 'CASCADE' })
  product: Product;
}
