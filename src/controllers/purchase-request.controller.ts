import { Body, Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { PurchaseRequestService } from '@/services/purchase-request.service';
import { ConfirmPurchaseCodeDto, CreatePurchaseRequestDto } from '@/dto/purchase-request.dto';

@Controller('purchase-requests')
@UseGuards(JwtAuthGuard)
export class PurchaseRequestController {
  constructor(private readonly purchaseRequestService: PurchaseRequestService) {}

  @Post()
  async create(@Body() body: CreatePurchaseRequestDto, @Request() req) {
    return await this.purchaseRequestService.createRequest(body.productId, req.user.userId);
  }

  @Get('my')
  async getMyRequests(@Request() req) {
    return await this.purchaseRequestService.getMyRequests(req.user.userId);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    return await this.purchaseRequestService.approveRequest(id, req.user.userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Request() req) {
    return await this.purchaseRequestService.rejectRequest(id, req.user.userId);
  }

  @Post(':id/confirm-code')
  async confirmCode(@Param('id') id: string, @Request() req, @Body() body: ConfirmPurchaseCodeDto) {
    return await this.purchaseRequestService.confirmCode(id, req.user.userId, body.code);
  }
}
