import { fetcher } from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  RegisterResponse,
  User
} from '../types/user';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return fetcher<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return fetcher<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(): Promise<User> {
  return fetcher<User>('/auth/me');
}

export async function refreshToken(refreshTokenValue: string): Promise<{ accessToken: string }> {
  return fetcher<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

export async function updateProfile(data: { displayName: string }): Promise<User> {
  return fetcher<User>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
