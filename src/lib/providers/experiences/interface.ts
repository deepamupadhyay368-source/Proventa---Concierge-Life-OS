import type { BaseProviderInterface, ProviderResult } from '../types';

export interface ExperienceItem {
  experienceId: string;
  title: string;
  category: string; // 'HERITAGE_WALK' | 'PRIVATE_WORKSHOP' | 'SPA_WELLNESS' | 'SAFARI_PERMIT' | 'CULINARY_MASTERCLASS'
  city: string;
  location: string;
  durationHours: number;
  pricePerPersonPaise: number;
  currency: string;
  inclusions: string[];
  cancellationPolicy: string;
  minPartySize: number;
  maxPartySize: number;
}

export interface ExperienceBooking {
  bookingId: string;
  voucherCode: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  experienceTitle: string;
  date: string;
  time: string;
  partySize: number;
  meetingPoint: string;
  guideContact?: string;
  totalPricePaise: number;
}

export interface ExperienceProvider extends BaseProviderInterface {
  readonly category: 'EXPERIENCES';
  searchExperiences(query: { city: string; category?: string; keyword?: string }): Promise<ProviderResult<ExperienceItem[]>>;
  getExperienceDetails(experienceId: string): Promise<ProviderResult<ExperienceItem>>;
  checkAvailability(experienceId: string, date: string, partySize: number): Promise<ProviderResult<{ available: boolean; slots: string[] }>>;
  createBooking(params: { experienceId: string; date: string; time: string; partySize: number; leadGuestName: string; leadGuestPhone: string }): Promise<ProviderResult<ExperienceBooking>>;
  getBooking(bookingId: string): Promise<ProviderResult<ExperienceBooking>>;
  cancelBooking(bookingId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number }>>;
}
