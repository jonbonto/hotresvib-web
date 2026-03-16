import { fetcher } from './client';
import type { 
  Reservation, 
  CreateReservationRequest,
  PaymentIntentRequest,
  PaymentIntentResponse
} from '../types/reservation';

export async function createReservation(
  data: CreateReservationRequest
): Promise<Reservation> {
  return fetcher<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReservation(id: string): Promise<Reservation> {
  return fetcher<Reservation>(`/reservations/${id}`);
}

export async function getUserReservations(userId?: string): Promise<Reservation[]> {
  const url = userId ? `/reservations?userId=${encodeURIComponent(userId)}` : '/reservations';
  return fetcher<Reservation[]>(url);
}

export async function cancelReservation(id: string): Promise<Reservation> {
  return fetcher<Reservation>(`/reservations/${id}`, {
    method: 'DELETE',
  });
}

export async function createPaymentIntent(
  data: PaymentIntentRequest
): Promise<PaymentIntentResponse> {
  return fetcher<PaymentIntentResponse>('/payments/intent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
