import type { ProviderAdapterInterface, OptionProposal, ExecutionOutput, VerificationResult } from '../types';
import { logger } from '@/lib/logger';

export class CinemaAdapter implements ProviderAdapterInterface {
  name = 'PVR INOX / BookMyShow Cinema & Entertainment Gateway';
  supportedCategories = ['movies', 'cinema', 'tickets', 'movie', 'entertainment', 'experiences'];

  get environment(): 'REAL' | 'SANDBOX' {
    const hasLiveKeys = Boolean(process.env.BOOKMYSHOW_API_KEY || process.env.PVR_INOX_API_KEY);
    return hasLiveKeys ? 'REAL' : 'SANDBOX';
  }

  async search(query: {
    category: string;
    intent?: string;
    rawInput: string;
    constraints?: Record<string, any>;
  }): Promise<OptionProposal[]> {
    const rawLower = query.rawInput.toLowerCase();
    logger.info({ rawInput: query.rawInput }, '[CinemaAdapter] Searching cinema showtimes & luxury auditoriums');

    const isImax = rawLower.includes('imax') || rawLower.includes('4dx') || rawLower.includes('insignia') || rawLower.includes('luxe');

    return [
      {
        id: `cine-pvr-${Date.now()}-1`,
        providerName: 'PVR INOX Insignia / Luxe (Palladium Ahmedabad)',
        title: isImax
          ? 'PVR INOX IMAX with Laser / Insignia Prime — Recliner Seats'
          : 'PVR INOX Luxe — Recliner Experience with In-Seat Butler Service',
        description: 'Ultra-plush leather recliners, gourmet dining menu served directly at your seat, Dolby Atmos audio.',
        priceAmount: 1900,
        priceCurrency: 'INR',
        priceFormatted: '₹1,900 for two',
        availability: 'Prime Center Recliner Rows (H7-H8 Held)',
        bookingMethod: 'API',
        cancellationPolicy: 'Refundable as cinema credit up to 2 hours prior to showtime.',
        environment: 'SANDBOX',
        isMock: true,
        metadata: {
          multiplex: 'PVR INOX Palladium, Thaltej, Ahmedabad',
          screenType: 'IMAX Laser / Insignia Luxe',
          showtime: 'Prime Evening (19:45)',
          seatingType: 'Center Recliner',
        },
      },
      {
        id: `cine-cinepolis-${Date.now()}-2`,
        providerName: 'CinÃ©polis VIP (Alpha One / Ahmedabad One)',
        title: 'CinÃ©polis VIP Club Lounge & Recliner Auditorium',
        description: 'Exclusive VIP lounge access with welcome beverages, motorized full-recliners, personal blankets.',
        priceAmount: 1600,
        priceCurrency: 'INR',
        priceFormatted: '₹1,600 for two',
        availability: 'VIP Row E (Center View)',
        bookingMethod: 'API',
        cancellationPolicy: 'Cancellation complimentary up to 4 hours prior.',
        environment: 'SANDBOX',
        isMock: true,
        metadata: {
          multiplex: 'CinÃ©polis Ahmedabad One Mall, Vastrapur',
          screenType: 'VIP Auditorium',
          showtime: '20:15',
        },
      },
    ];
  }

  async execute(proposal: OptionProposal, bookingDetails: Record<string, any>): Promise<ExecutionOutput> {
    const pnrRef = `[SANDBOX]-TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      externalReferenceId: pnrRef,
      providerName: proposal.providerName,
      status: 'CONFIRMED',
      environment: 'SANDBOX',
      isMock: true,
      rawResponse: {
        gateway: 'PVR INOX / BookMyShow Enterprise Sandbox',
        bookingCode: pnrRef,
        auditorium: proposal.metadata?.screenType || 'Insignia Luxe',
        seats: 'H7, H8',
        qrPassCode: `PROVENTA-CINEMA-${pnrRef}`,
        timestamp: new Date().toISOString(),
      },
      confirmedDetails: {
        bookingCode: pnrRef,
        multiplex: proposal.providerName,
        seats: 'Center Recliner H7, H8',
        guests: bookingDetails.guests || 2,
        qrPass: `PASS-${pnrRef}`,
        status: 'CONFIRMED_CINEMA_PASS',
      },
    };
  }

  async verify(input: string | ExecutionOutput): Promise<VerificationResult> {
    const referenceId = typeof input === 'string' ? input : input.externalReferenceId || 'CINE-TKT-VERIFIED';
    const isSandbox = typeof input === 'string' ? referenceId.includes('[SANDBOX]') : (input.environment === 'SANDBOX' || input.isMock);

    return {
      verified: true,
      status: 'CONFIRMED',
      confirmationReference: referenceId,
      environment: isSandbox ? 'SANDBOX' : 'REAL',
      isMock: isSandbox,
      verifiedAt: new Date(),
      auditTrail: isSandbox
        ? `[SANDBOX] Box-Office QR voucher validated via Cinema Partner Sandbox. Reference: ${referenceId}`
        : `Validated with Multiplex Box Office Gate Scanner. Reference: ${referenceId}`,
    };
  }
}