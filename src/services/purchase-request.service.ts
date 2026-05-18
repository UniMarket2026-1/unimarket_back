import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from '@/entities/product.entity';
import { User } from '@/entities/user.entity';
import { PurchaseRequest, PurchaseRequestStatus } from '@/entities/purchase-request.entity';

@Injectable()
export class PurchaseRequestService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private generateAccessCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isUniandesUser(email?: string) {
    return !!email && email.toLowerCase().endsWith('@uniandes.edu.co');
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[purchase-mail] ${subject} -> ${to}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'UniMarket <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send purchase mail: ${await response.text()}`);
    }
  }

  private async sendCodeEmails(request: PurchaseRequest, code: string) {
    const buyer = request.buyer ?? (await this.userRepository.findOne({ where: { id: request.buyerId } }));
    const seller = request.seller ?? (await this.userRepository.findOne({ where: { id: request.sellerId } }));
    const product = request.product ?? (await this.productRepository.findOne({ where: { id: request.productId } }));

    if (!buyer || !seller || !product) return;

    const subject = `Código de entrega para ${product.name}`;
    const baseHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 16px;">Compra aprobada</h2>
        <p>Tu solicitud para <strong>${product.name}</strong> fue aprobada.</p>
        <p>Cuando se encuentren en persona para entregar el producto y realizar el pago, ambos deben ingresar este código dentro de la app:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; padding: 16px 20px; background: #f8fafc; border-radius: 12px; display: inline-block; margin: 12px 0;">${code}</div>
        <p>El código expira en 7 días.</p>
        <p>Si tú no solicitaste esta compra, puedes ignorar este mensaje.</p>
      </div>
    `;

    await Promise.all([
      this.sendMail(buyer.email, subject, baseHtml),
      this.sendMail(seller.email, subject, baseHtml),
    ]);
  }

  private async sendCompletionEmails(request: PurchaseRequest) {
    const buyer = request.buyer ?? (await this.userRepository.findOne({ where: { id: request.buyerId } }));
    const seller = request.seller ?? (await this.userRepository.findOne({ where: { id: request.sellerId } }));
    const product = request.product ?? (await this.productRepository.findOne({ where: { id: request.productId } }));

    if (!buyer || !seller || !product) return;

    const subject = `Compra completada: ${product.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 16px;">Compra completada</h2>
        <p>La compra de <strong>${product.name}</strong> quedó confirmada por ambas partes.</p>
        <p>Ya pueden continuar con la entrega/pago final sin cambios en la app.</p>
      </div>
    `;

    await Promise.all([
      this.sendMail(buyer.email, subject, html),
      this.sendMail(seller.email, subject, html),
    ]);
  }

  private normalizeRequest(request: PurchaseRequest) {
    const isUniandesSeller = this.isUniandesUser(request.seller?.email);
    const isUniandesBuyer = this.isUniandesUser(request.buyer?.email);

    return {
      id: request.id,
      productId: request.productId,
      productName: request.product?.name ?? '',
      productPrice: Number(request.product?.price ?? 0),
      productImageUrl: request.product?.imageUrl ?? '',
      meetingPoint: request.product?.meetingPoint ?? '',
      buyerId: request.buyerId,
      buyerName: request.buyer?.name ?? 'Unknown',
      buyerEmail: request.buyer?.email ?? '',
      buyerVerified: !!request.buyer?.emailVerified,
      buyerUniandesVerified: !!request.buyer?.emailVerified && isUniandesBuyer,
      sellerId: request.sellerId,
      sellerName: request.seller?.name ?? 'Unknown',
      sellerEmail: request.seller?.email ?? '',
      sellerVerified: !!request.seller?.emailVerified,
      sellerUniandesVerified: !!request.seller?.emailVerified && isUniandesSeller,
      status: request.status,
      buyerConfirmed: !!request.buyerConfirmedAt,
      sellerConfirmed: !!request.sellerConfirmedAt,
      approvedAt: request.approvedAt,
      buyerConfirmedAt: request.buyerConfirmedAt,
      sellerConfirmedAt: request.sellerConfirmedAt,
      completedAt: request.completedAt,
      accessCodeExpiresAt: request.accessCodeExpiresAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  private async completeIfReady(request: PurchaseRequest) {
    if (request.buyerConfirmedAt && request.sellerConfirmedAt && request.status !== 'completed') {
      request.status = 'completed';
      request.completedAt = new Date();
      await this.purchaseRequestRepository.save(request);

      const product = await this.productRepository.findOne({ where: { id: request.productId } });
      if (product) {
        product.active = false;
        await this.productRepository.save(product);
      }

      await this.sendCompletionEmails(request);
    } catch (err) {
      console.error('[purchase-request] Failed to send completion emails:', err instanceof Error ? err.message : err);
      // Do not propagate email errors to the API response — purchase was completed.
    }
  }

  async createRequest(productId: string, buyerId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId }, relations: ['seller'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.active) {
      throw new BadRequestException('Product is no longer available');
    }

    if (product.sellerId === buyerId) {
      throw new BadRequestException('You cannot buy your own product');
    }

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    const existing = await this.purchaseRequestRepository.findOne({
      where: { productId, buyerId, status: 'pending' },
      relations: ['product', 'buyer', 'seller'],
    });

    if (existing) {
      return this.normalizeRequest(existing);
    }

    const request = this.purchaseRequestRepository.create({
      productId,
      product,
      buyerId,
      buyer,
      sellerId: product.sellerId,
      seller: product.seller,
      status: 'pending',
    });

    const saved = await this.purchaseRequestRepository.save(request);
    return this.normalizeRequest(saved);
  }

  async getMyRequests(userId: string) {
    const requests = await this.purchaseRequestRepository.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      relations: ['product', 'buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.normalizeRequest(request));
  }

  async approveRequest(requestId: string, sellerId: string) {
    const request = await this.purchaseRequestRepository.findOne({
      where: { id: requestId },
      relations: ['product', 'buyer', 'seller'],
    });

    if (!request) {
      throw new NotFoundException('Purchase request not found');
    }

    if (request.sellerId !== sellerId) {
      throw new BadRequestException('You can only approve your own sale requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const code = this.generateAccessCode();
    request.accessCodeHash = await bcrypt.hash(code, 10);
    request.accessCodeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    request.status = 'approved';
    request.approvedAt = new Date();

    await this.purchaseRequestRepository.save(request);

    const siblingRequests = await this.purchaseRequestRepository.find({
      where: { productId: request.productId, status: 'pending' },
      relations: ['product', 'buyer', 'seller'],
    });

    for (const sibling of siblingRequests) {
      if (sibling.id !== request.id) {
        sibling.status = 'cancelled';
        await this.purchaseRequestRepository.save(sibling);
      }
    }

    try {
      await this.sendCodeEmails(request, code);
    } catch (error) {
      console.error('[purchase-request] Failed to send approval code emails:', error instanceof Error ? error.message : error);
    }
    return this.normalizeRequest(request);
  }

  async rejectRequest(requestId: string, sellerId: string) {
    const request = await this.purchaseRequestRepository.findOne({
      where: { id: requestId },
      relations: ['product', 'buyer', 'seller'],
    });

    if (!request) {
      throw new NotFoundException('Purchase request not found');
    }

    if (request.sellerId !== sellerId) {
      throw new BadRequestException('You can only reject your own sale requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.status = 'rejected';
    await this.purchaseRequestRepository.save(request);

    await this.sendMail(
      request.buyer.email,
      `Solicitud rechazada: ${request.product.name}`,
      `<div style="font-family: Arial, sans-serif;"><h2>Solicitud rechazada</h2><p>Tu solicitud para <strong>${request.product.name}</strong> fue rechazada por el vendedor.</p></div>`,
    );

    return this.normalizeRequest(request);
  }

  async confirmCode(requestId: string, userId: string, code: string) {
    const request = await this.purchaseRequestRepository.findOne({
      where: { id: requestId },
      relations: ['product', 'buyer', 'seller'],
    });

    if (!request) {
      throw new NotFoundException('Purchase request not found');
    }

    if (request.status === 'completed') {
      return this.normalizeRequest(request);
    }

    if (request.status !== 'approved') {
      throw new BadRequestException('This request is not ready for code confirmation');
    }

    if (!request.accessCodeHash || !request.accessCodeExpiresAt) {
      throw new BadRequestException('Access code not generated');
    }

    if (request.accessCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Access code expired');
    }

    const valid = await bcrypt.compare(code.trim(), request.accessCodeHash);
    if (!valid) {
      throw new BadRequestException('Invalid access code');
    }

    if (request.buyerId === userId) {
      request.buyerConfirmedAt = request.buyerConfirmedAt ?? new Date();
    } else if (request.sellerId === userId) {
      request.sellerConfirmedAt = request.sellerConfirmedAt ?? new Date();
    } else {
      throw new BadRequestException('You are not part of this purchase request');
    }

    await this.purchaseRequestRepository.save(request);
    await this.completeIfReady(request);

    const refreshed = await this.purchaseRequestRepository.findOne({
      where: { id: requestId },
      relations: ['product', 'buyer', 'seller'],
    });

    return this.normalizeRequest(refreshed ?? request);
  }
}
