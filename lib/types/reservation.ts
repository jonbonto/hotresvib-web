export type ReservationStatus = 
  | 'DRAFT' 
  | 'PENDING_PAYMENT' 
  | 'CONFIRMED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'REFUNDED';

export interface Reservation {
  id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
}

export interface CreateReservationRequest {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface PaymentIntentRequest {
  reservationId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
