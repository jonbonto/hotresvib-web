import { fetcher } from './client';
import type { Review, CreateReviewRequest, UpdateReviewRequest, HotelRating } from '../types/review';

export async function getHotelReviews(hotelId: string): Promise<Review[]> {
  return fetcher<Review[]>(`/reviews/hotel/${hotelId}`);
}

export async function getHotelRating(hotelId: string): Promise<HotelRating> {
  return fetcher<HotelRating>(`/reviews/hotel/${hotelId}/rating`);
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  return fetcher<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
  return fetcher<Review>(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await fetcher(`/reviews/${id}`, {
    method: 'DELETE',
  });
}
