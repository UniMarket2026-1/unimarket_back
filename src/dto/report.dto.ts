import { IsString, IsIn, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  itemId: string;

  @IsString()
  @IsIn(['product', 'user'])
  itemType: 'product' | 'user';

  @IsString()
  reason: string;

  @IsString()
  @IsIn(['spam', 'inappropriate', 'fraud', 'other'])
  category: 'spam' | 'inappropriate' | 'fraud' | 'other';

  @IsString()
  description: string;
}

export class ResolveReportDto {
  @IsString()
  @IsIn(['warning', 'suspension', 'removal', 'dismissed'])
  resolution: 'warning' | 'suspension' | 'removal' | 'dismissed';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReportResponseDto {
  id: string;
  itemId: string;
  itemType: 'product' | 'user';
  reporterId: string;
  reporterName: string;
  reason: string;
  category: 'spam' | 'inappropriate' | 'fraud' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolution: 'warning' | 'suspension' | 'removal' | 'dismissed' | null;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
  date: Date;
}
