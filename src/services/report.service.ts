import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '@/entities/report.entity';
import { User } from '@/entities/user.entity';
import { Product } from '@/entities/product.entity';
import { CreateReportDto, ResolveReportDto } from '@/dto/report.dto';
import { UserService } from './user.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UserService,
  ) {}

  async create(reporterId: string, createReportDto: CreateReportDto) {
    const reporter = await this.userRepository.findOne({ where: { id: reporterId } });
    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    const report = this.reportRepository.create({
      ...createReportDto,
      reporter,
      reporterId,
    });

    if (createReportDto.itemType === 'product') {
      const product = await this.productRepository.findOne({
        where: { id: createReportDto.itemId },
      });
      if (product) {
        report.product = product;
      }
    }

    return await this.reportRepository.save(report);
  }

  async findAll(status?: 'pending' | 'resolved' | 'dismissed', itemType?: 'product' | 'user') {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.product', 'product');

    if (status) {
      query.where('report.status = :status', { status });
    }

    if (itemType) {
      query.andWhere('report.itemType = :itemType', { itemType });
    }

    query.orderBy('report.date', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'product'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async resolve(id: string, resolveReportDto: ResolveReportDto, adminId: string) {
    const report = await this.findOne(id);

    report.status = 'resolved';
    report.resolution = resolveReportDto.resolution;
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    report.notes = resolveReportDto.notes;

    // Take action based on resolution
    if (report.itemType === 'user') {
      const targetUser = await this.userRepository.findOne({
        where: { id: report.itemId },
      });

      if (targetUser) {
        if (resolveReportDto.resolution === 'warning') {
          await this.userService.warnUser(targetUser.id);
        } else if (resolveReportDto.resolution === 'suspension') {
          await this.userService.suspendUser(targetUser.id, report.reason);
        } else if (resolveReportDto.resolution === 'removal') {
          // Mark user for deletion or ban
          targetUser.suspended = true;
          targetUser.suspensionReason = `Banned: ${report.reason}`;
          await this.userRepository.save(targetUser);
        }
      }
    } else if (report.itemType === 'product' && resolveReportDto.resolution === 'removal') {
      const product = await this.productRepository.findOne({
        where: { id: report.itemId },
      });

      if (product) {
        product.active = false;
        await this.productRepository.save(product);
      }
    }

    return await this.reportRepository.save(report);
  }

  async dismiss(id: string) {
    const report = await this.findOne(id);
    report.status = 'dismissed';
    report.resolution = 'dismissed';
    return await this.reportRepository.save(report);
  }

  async getPendingCount() {
    const count = await this.reportRepository.count({
      where: { status: 'pending' },
    });
    return { pendingCount: count };
  }
}
