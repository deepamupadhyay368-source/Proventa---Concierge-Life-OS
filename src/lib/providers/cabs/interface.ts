import type { BaseProviderInterface, ProviderResult } from '../types';

export interface LocationCoord {
  address: string;
  lat?: number;
  lng?: number;
  landmark?: string;
}

export interface RideOption {
  rideTypeId: string;
  categoryName: string; // 'Executive Sedan' | 'Luxury SUV' | 'Premier' | 'EV'
  estimatedFarePaise: number;
  currency: string;
  etaMinutes: number;
  capacity: number;
  carModelExample: string;
}

export interface RideBooking {
  rideId: string;
  externalReference: string;
  status: 'SCHEDULED' | 'DRIVER_ASSIGNED' | 'ARRIVING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  pickup: LocationCoord;
  dropoff: LocationCoord;
  rideType: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  otp?: string;
  farePaise: number;
  currency: string;
}

export interface CabProvider extends BaseProviderInterface {
  readonly category: 'CABS';
  getRideOptions(pickup: LocationCoord, dropoff: LocationCoord): Promise<ProviderResult<RideOption[]>>;
  getFareEstimate(pickup: LocationCoord, dropoff: LocationCoord, rideTypeId: string): Promise<ProviderResult<RideOption>>;
  createRide(params: { pickup: LocationCoord; dropoff: LocationCoord; rideTypeId: string; passengerName: string; passengerPhone: string; scheduleTime?: string }): Promise<ProviderResult<RideBooking>>;
  getRide(rideId: string): Promise<ProviderResult<RideBooking>>;
  cancelRide(rideId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; cancellationFeePaise: number }>>;
  trackRide(rideId: string): Promise<ProviderResult<{ status: string; driverLocation?: { lat: number; lng: number }; etaMinutes: number }>>;
}
