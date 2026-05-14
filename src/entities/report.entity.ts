import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string; // product ID or user ID

  @Column({ type: 'enum', enum: ['product', 'user'] })
  itemType: 'product' | 'user';

  @ManyToOne(() => User, (user) => user.reportsCreated, { onDelete: 'CASCADE' })
  reporter: User;

  @Column()
  reporterId: string;

  @Column()
  reason: string;

  @Column({ type: 'enum', enum: ['spam', 'inappropriate', 'fraud', 'other'] })
  category: 'spam' | 'inappropriate' | 'fraud' | 'other';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'resolved', 'dismissed'], default: 'pending' })
  status: 'pending' | 'resolved' | 'dismissed';

  @Column({ type: 'enum', enum: ['warning', 'suspension', 'removal', 'dismissed'], nullable: true })
  resolution: 'warning' | 'suspension' | 'removal' | 'dismissed' | null;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Product, (product) => product.reports, { nullable: true, onDelete: 'CASCADE' })
  product: Product;
}
