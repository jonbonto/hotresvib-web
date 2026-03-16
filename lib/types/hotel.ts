export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  roomCount?: number;
  minPrice?: number;
  featured: boolean;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  starRating?: number;
  imageUrl?: string;
}

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  type: 'SINGLE' | 'DOUBLE' | 'SUITE';
  basePrice: number;
  currency: string;
  description?: string;
  capacity?: number;
  amenities?: string;
  imageUrl?: string;
}

export interface RoomSearchResponse extends Room {
  hotelName: string;
  city: string;
  country: string;
  available?: boolean;
}

export interface RoomAvailability extends Room {
  hotelName: string;
  city: string;
  country: string;
  totalPrice: number;
  nights: number;
}

export interface HotelSearchCriteria {
  city?: string;
  country?: string;
  name?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  page?: number;
  size?: number;
  sort?: string;
}
export interface RoomSearchCriteria {
  hotelId?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  checkInDate?: string;
  checkOutDate?: string;
  page?: number;
  size?: number;
}
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
