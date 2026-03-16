export interface Review {
  id: string;
  hotelId: string;
  userId: string;
  userName: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  hotelId: string;
  reservationId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

export interface HotelRating {
  hotelId: string;
  averageRating: number;
  reviewCount: number;
}
