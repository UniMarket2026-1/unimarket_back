export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'admin';
}

export class LoginDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  name?: string;
  interests?: string[];
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
