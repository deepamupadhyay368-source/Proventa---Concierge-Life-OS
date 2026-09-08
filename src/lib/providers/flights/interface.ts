import type { BaseProviderInterface, ProviderResult } from '../types';

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

export interface FlightOption {
  flightId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  cabinClass: string;
  seatsAvailable: number;
  baseFarePaise: number;
  taxesPaise: number;
  totalFarePaise: number;
  currency: string;
  fareKey: string;
}

export interface FlightBookingRequest {
  flightId: string;
  fareKey: string;
  passengers: Array<{
    title: 'MR' | 'MS' | 'MRS';
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    passportNumber?: string;
  }>;
  contactEmail: string;
  contactPhone: string;
}

export interface FlightBooking {
  bookingId: string;
  pnr: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  flightDetails: FlightOption;
  passengers: Array<{ firstName: string; lastName: string }>;
  ticketNumbers: string[];
  totalFarePaise: number;
  currency: string;
  cancellationPolicy: string;
}

export interface FlightProvider extends BaseProviderInterface {
  readonly category: 'FLIGHTS';
  searchFlights(params: FlightSearchQuery): Promise<ProviderResult<FlightOption[]>>;
  getFlightDetails(flightId: string): Promise<ProviderResult<FlightOption>>;
  revalidateFare(flightId: string, fareKey: string): Promise<ProviderResult<{ valid: boolean; fareKey: string; newFarePaise?: number }>>;
  createBooking(params: FlightBookingRequest): Promise<ProviderResult<FlightBooking>>;
  getBooking(bookingId: string): Promise<ProviderResult<FlightBooking>>;
  cancelBooking(bookingId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number; penaltyPaise: number }>>;
  getCancellationPolicy(bookingId: string): Promise<ProviderResult<{ refundable: boolean; deadline: string; penaltyPaise: number }>>;
}
