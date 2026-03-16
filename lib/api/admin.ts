import { fetcher } from './client';
import type { User } from '../types/user';
import type { Hotel } from '../types/hotel';
import type { Reservation } from '../types/reservation';

export interface AdminAnalytics {
  totalUsers: number;
  totalHotels: number;
  totalReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  recentReservations: Reservation[];
}

export interface UpdateHotelRequest {
  name?: string;
  city?: string;
  country?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  starRating?: number;
  featured?: boolean;
  imageUrl?: string;
}

// --- User Management ---

export async function listUsers(): Promise<User[]> {
  return fetcher<User[]>('/admin/users');
}

export async function getUser(id: string): Promise<User> {
  return fetcher<User>(`/admin/users/${id}`);
}

export async function updateUserRole(id: string, role: string): Promise<User> {
  return fetcher<User>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

// --- Hotel Management ---

export async function updateHotel(id: string, data: UpdateHotelRequest): Promise<Hotel> {
  return fetcher<Hotel>(`/admin/hotels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHotel(id: string): Promise<void> {
  await fetcher(`/admin/hotels/${id}`, {
    method: 'DELETE',
  });
}

// --- Reservation Management ---

export async function listAllReservations(status?: string): Promise<Reservation[]> {
  const url = status ? `/admin/reservations?status=${encodeURIComponent(status)}` : '/admin/reservations';
  return fetcher<Reservation[]>(url);
}

export async function checkInReservation(id: string): Promise<Reservation> {
  return fetcher<Reservation>(`/admin/reservations/${id}/check-in`, {
    method: 'PUT',
  });
}

export async function checkOutReservation(id: string): Promise<Reservation> {
  return fetcher<Reservation>(`/admin/reservations/${id}/check-out`, {
    method: 'PUT',
  });
}

// --- Analytics ---

export async function getAnalytics(): Promise<AdminAnalytics> {
  return fetcher<AdminAnalytics>('/admin/analytics');
}
