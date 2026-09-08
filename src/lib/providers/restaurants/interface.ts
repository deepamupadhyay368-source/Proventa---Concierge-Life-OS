import type { BaseProviderInterface, ProviderResult } from '../types';

export interface RestaurantSearchQuery {
  city: string;
  cuisine?: string;
  query?: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export interface DiningTimeSlot {
  time: string;
  slotKey: string;
  tableType: string; // 'INDOOR' | 'OUTDOOR' | 'ROOFTOP' | 'PRIVATE_DINING'
  available: boolean;
  depositRequiredPaise: number;
}

export interface RestaurantDetails {
  restaurantId: string;
  name: string;
  cuisine: string[];
  address: string;
  phone: string;
  priceCategory: '₹₹' | '₹₹₹' | '₹₹₹₹';
  rating: number;
  dressCode?: string;
  cancellationPolicy: string;
}

export interface ReservationRequest {
  restaurantId: string;
  slotKey: string;
  date: string;
  time: string;
  partySize: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  dietaryRequirements?: string[];
  seatingPreference?: string;
}

export interface RestaurantReservation {
  reservationId: string;
  confirmationCode: string;
  restaurantName: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  date: string;
  time: string;
  partySize: number;
  tableAllocated?: string;
  depositPaidPaise: number;
  cancellationPolicy: string;
}

export interface RestaurantProvider extends BaseProviderInterface {
  readonly category: 'RESTAURANTS';
  searchRestaurants(params: RestaurantSearchQuery): Promise<ProviderResult<RestaurantDetails[]>>;
  getRestaurantDetails(restaurantId: string): Promise<ProviderResult<RestaurantDetails>>;
  getAvailability(restaurantId: string, partySize: number, date: string, time?: string): Promise<ProviderResult<DiningTimeSlot[]>>;
  createReservation(params: ReservationRequest): Promise<ProviderResult<RestaurantReservation>>;
  getReservation(reservationId: string): Promise<ProviderResult<RestaurantReservation>>;
  cancelReservation(reservationId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number }>>;
}
