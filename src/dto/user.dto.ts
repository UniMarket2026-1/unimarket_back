import { IsString, IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsIn(['student', 'admin'])
  role?: 'student' | 'admin';
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  interests?: string[];

  @IsOptional()
  notificationsEnabled?: boolean;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  favorites: string[];
  interests: string[];
  notificationsEnabled: boolean;
  totalRating: number;
  ratingCount: number;
  suspended: boolean;
  warnings: number;
  createdAt: Date;
}
