import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

export type PurchaseRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  buyer: User;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  seller: User;

  @Column({ type: 'text', default: 'pending' })
  status: PurchaseRequestStatus;

  @Column({ nullable: true })
  accessCodeHash: string;

  @Column({ nullable: true })
  accessCodeExpiresAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  buyerConfirmedAt: Date;

  @Column({ nullable: true })
  sellerConfirmedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
