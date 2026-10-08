/**
 * PROVENTA — FLIGHT PROVIDER ADAPTER & REGISTRY INTERFACES
 * Provider-agnostic flight execution layer interface.
 * Standardizes search, offer retrieval, live revalidation, order creation,
 * booking retrieval, cancellation, webhook verification, and confirmation normalization.
 */

import type { OptionProposal, ProviderAdapterInterface, VerificationResult } from '@/lib/orchestration/types';
import type { BaseProviderInterface, ProviderResult } from '../types';

export type FlightCapabilityState =
  | 'LIVE_VERIFIED_AUTONOMOUS'
  | 'CONFIGURED_BUT_UNVERIFIED'
  | 'ASSISTED'
  | 'HUMAN_ONLY'
  | 'NOT_CONFIGURED';

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

export interface ExactFlightOfferMetadata {
  provider: string;
  providerOfferId: string;
  airline: string;
  airlineCode?: string;
  flightNumber?: string;
  origin: string;
  originCity?: string;
  destination: string;
  destinationCity?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  slices?: any[];
  cabinClass: string;
  passengers: number;
  currency: string;
  approvedPrice: number;
  displayedPrice?: string;
  fareConditions?: string;
  refundable?: boolean;
  expiresAt?: string;
  baggage?: string;
}

export interface FlightRevalidationResult {
  isValid: boolean;
  reason?: string;
  offer?: any;
  revalidatedPriceAmount?: number;
  revalidatedPricePaise?: number;
  currency?: string;
  expiresAt?: string;
  isExpired?: boolean;
  isPriceIncreased?: boolean;
  isSoldOut?: boolean;
  isRouteMismatch?: boolean;
  isCabinMismatch?: boolean;
}

export interface FlightPassengerDetails {
  title?: 'mr' | 'ms' | 'mrs' | 'dr' | string;
  givenName: string;
  familyName: string;
  gender?: 'm' | 'f';
  bornOn?: string; // YYYY-MM-DD
  email?: string;
  phoneNumber?: string;
  passportNumber?: string;
}

export interface FlightOrderCreationParams {
  offerId: string;
  approvedOption: OptionProposal;
  passengers: FlightPassengerDetails[];
  contactEmail: string;
  contactPhone: string;
  idempotencyKey: string;
  paymentReference?: string;
}

export interface FlightNormalizedBooking {
  success: boolean;
  status: 'CONFIRMED' | 'AWAITING_CONCIERGE_CALL' | 'FAILED' | 'CANCELLED';
  providerId: string;
  providerName: string;
  bookingReference?: string; // Real 6-char PNR
  orderId?: string; // Provider order id
  ticketNumbers?: string[];
  airline?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  cabinClass?: string;
  passengersCount?: number;
  totalAmount?: number;
  currency?: string;
  environment: 'REAL' | 'SANDBOX';
  isMock: boolean;
  rawResponse?: any;
  errorMessage?: string;
  errorCode?: string;
  cancellationPolicy?: string;
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

/**
 * Provider-agnostic Flight Provider Adapter interface.
 * Implemented by Duffel, Amadeus, and future aviation gateways (e.g. TBO).
 */
export interface FlightProviderAdapter extends ProviderAdapterInterface {
  readonly providerId: string;
  readonly name: string;
  readonly environment: 'REAL' | 'SANDBOX';

  /**
   * Evaluates the authentic capability state of the provider in the current environment.
   */
  getCapabilityState(): Promise<FlightCapabilityState> | FlightCapabilityState;

  /**
   * Searches for genuine flight offers matching the criteria.
   */
  searchOffers(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]>;

  /**
   * Retrieves a live offer by ID.
   */
  getOffer(offerId: string): Promise<any>;

  /**
   * Pre-execution revalidation of the exact approved offer.
   * Checks expiry, price hikes, seat availability, routes, and cabin invariants.
   */
  revalidateOffer(
    offerId: string,
    approvedOption: OptionProposal | ExactFlightOfferMetadata
  ): Promise<FlightRevalidationResult>;

  /**
   * Places an authentic order / tickets the flight with the provider.
   */
  createOrder(params: FlightOrderCreationParams): Promise<FlightNormalizedBooking>;

  /**
   * Retrieves an authentic booking / order by ID or reference.
   */
  getBooking(bookingRefOrOrderId: string): Promise<FlightNormalizedBooking>;

  /**
   * Cancels a booking where supported by provider and airline rules.
   */
  cancelBooking?(
    bookingRefOrOrderId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    cancellationRef?: string;
    refundAmount?: number;
    currency?: string;
    message?: string;
  }>;

  /**
   * Verifies incoming webhook signatures and returns normalized event data.
   */
  verifyWebhook(
    rawBody: string,
    headers: Record<string, string | null | undefined>
  ): {
    isValid: boolean;
    eventType?: string;
    eventId?: string;
    data?: any;
    reason?: string;
  };

  /**
   * Normalizes provider raw response into standard PNR, order ID, and tickets.
   */
  normalizeProviderConfirmation(rawResponse: any): {
    pnr?: string;
    orderId?: string;
    ticketNumbers?: string[];
    airline?: string;
    totalAmount?: number;
    currency?: string;
  };
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
