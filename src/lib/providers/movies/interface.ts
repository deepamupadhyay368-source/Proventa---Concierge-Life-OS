import type { BaseProviderInterface, ProviderResult } from '../types';

export interface MovieShowtime {
  showtimeId: string;
  movieId: string;
  theatreId: string;
  theatreName: string;
  screenName: string;
  format: '2D' | '3D' | 'IMAX' | '4DX' | 'INSIGNIA';
  dateTime: string;
  priceStartingPaise: number;
}

export interface SeatLayout {
  showtimeId: string;
  rows: Array<{
    rowName: string;
    seats: Array<{
      seatNumber: string;
      tier: 'EXECUTIVE' | 'CLUB' | 'ROYAL' | 'RECLINER';
      pricePaise: number;
      available: boolean;
    }>;
  }>;
}

export interface MovieTicket {
  ticketId: string;
  bookingRef: string;
  movieTitle: string;
  theatreName: string;
  screenName: string;
  showtime: string;
  seats: string[];
  totalFarePaise: number;
  qrCodeUrl?: string;
  status: 'CONFIRMED' | 'HELD' | 'CANCELLED';
}

export interface MovieProvider extends BaseProviderInterface {
  readonly category: 'MOVIES';
  searchMovies(query: string, city: string): Promise<ProviderResult<any[]>>;
  searchTheatres(city: string, movieId?: string): Promise<ProviderResult<any[]>>;
  getShowtimes(theatreId: string, movieId: string, date: string): Promise<ProviderResult<MovieShowtime[]>>;
  getSeats(showtimeId: string): Promise<ProviderResult<SeatLayout>>;
  holdSeats(showtimeId: string, seats: string[]): Promise<ProviderResult<{ holdId: string; expiresAt: string; totalAmountPaise: number }>>;
  confirmBooking(holdId: string, paymentDetails: { paymentId: string }): Promise<ProviderResult<MovieTicket>>;
  getTicket(bookingId: string): Promise<ProviderResult<MovieTicket>>;
  cancelBooking(bookingId: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number }>>;
}
