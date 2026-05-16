import { IsString, MinLength } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsString()
  productId: string;
}

export class ConfirmPurchaseCodeDto {
  @IsString()
  @MinLength(4)
  code: string;
}
