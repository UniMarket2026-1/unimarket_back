import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReportService } from '@/services/report.service';
import { CreateReportDto, ResolveReportDto } from '@/dto/report.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { AdminGuard } from '@/auth/admin.guard';

@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return await this.reportService.create(req.user.userId, createReportDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(
    @Query('status') status?: 'pending' | 'resolved' | 'dismissed',
    @Query('itemType') itemType?: 'product' | 'user',
  ) {
    return await this.reportService.findAll(status, itemType);
  }

  @Get('pending-count')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPendingCount() {
    return await this.reportService.getPendingCount();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string) {
    return await this.reportService.findOne(id);
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async resolve(
    @Param('id') id: string,
    @Body() resolveReportDto: ResolveReportDto,
    @Request() req,
  ) {
    return await this.reportService.resolve(id, resolveReportDto, req.user.userId);
  }

  @Post(':id/dismiss')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async dismiss(@Param('id') id: string) {
    return await this.reportService.dismiss(id);
  }
}
