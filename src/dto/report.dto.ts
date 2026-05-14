export class CreateReportDto {
  itemId: string;
  itemType: 'product' | 'user';
  reason: string;
  category: 'spam' | 'inappropriate' | 'fraud' | 'other';
  description: string;
}

export class ResolveReportDto {
  resolution: 'warning' | 'suspension' | 'removal' | 'dismissed';
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
