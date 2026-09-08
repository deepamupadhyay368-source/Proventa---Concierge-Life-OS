import type { BaseProviderInterface, ProviderResult } from '../types';

export interface HotelSearchQuery {
  city: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  guests: number;
  rooms?: number;
  minRating?: number;
}

export interface HotelRoomOption {
  roomId: string;
  roomName: string;
  bedType: string;
  maxGuests: number;
  rateKey: string;
  pricePerNightPaise: number;
  taxesPaise: number;
  totalPricePaise: number;
  currency: string;
  freeCancellationUntil?: string;
  amenities: string[];
}

export interface HotelOption {
  hotelId: string;
  name: string;
  address: string;
  starRating: number;
  reviewScore: number;
  rooms: HotelRoomOption[];
}

export interface HotelBookingRequest {
  hotelId: string;
  roomId: string;
  rateKey: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

export interface HotelBooking {
  bookingId: string;
  confirmationCode: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPricePaise: number;
  currency: string;
  cancellationPolicy: string;
}

export interface HotelProvider extends BaseProviderInterface {
  readonly category: 'HOTELS';
  searchHotels(params: HotelSearchQuery): Promise<ProviderResult<HotelOption[]>>;
  getHotelDetails(hotelId: string): Promise<ProviderResult<HotelOption>>;
  checkAvailability(hotelId: string, dates: { checkIn: string; checkOut: string }): Promise<ProviderResult<{ available: boolean; rooms: HotelRoomOption[] }>>;
  revalidatePrice(hotelId: string, roomId: string, dates: { checkIn: string; checkOut: string }): Promise<ProviderResult<{ valid: boolean; rateKey: string; currentPricePaise: number }>>;
  createBooking(params: HotelBookingRequest): Promise<ProviderResult<HotelBooking>>;
  getBooking(bookingId: string): Promise<ProviderResult<HotelBooking>>;
  cancelBooking(bookingId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number; penaltyPaise: number }>>;
}
