/**
 * PROVENTA — DUFFEL API CLIENT
 * High-reliability, zero-fabrication HTTP client for Duffel Flights & Stays API (v2).
 * Supports both test and live environments with strict idempotency and cryptographic webhook verification.
 */

import crypto from 'crypto';
import { logger } from '@/lib/logger';

export interface DuffelConfig {
  apiKey?: string;
  environment?: 'live' | 'test';
  webhookSecret?: string;
  apiVersion?: string;
}

export interface DuffelFlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: { type: 'adult' | 'child' | 'infant_without_seat'; age?: number }[];
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxConnections?: number;
}

export interface DuffelStaySearchParams {
  location: {
    geographicCoordinates?: { latitude: number; longitude: number };
    radius?: number;
  };
  checkInDate: string;
  checkOutDate: string;
  rooms: number;
  guests: { type: 'adult' | 'child'; age?: number }[];
}

export interface DuffelPassengerInput {
  id?: string;
  title?: string;
  givenName: string;
  familyName: string;
  gender?: 'm' | 'f';
  bornOn: string; // YYYY-MM-DD
  email?: string;
  phoneNumber?: string; // E.164
}

export class DuffelClient {
  private apiKey: string;
  private environment: 'live' | 'test';
  private baseUrl = 'https://api.duffel.com';
  private apiVersion = 'v2';
  private webhookSecret?: string;

  constructor(config?: DuffelConfig) {
    this.apiKey = config?.apiKey || process.env.DUFFEL_API_KEY || '';
    this.environment = config?.environment || (process.env.DUFFEL_ENV === 'live' ? 'live' : 'test');
    this.webhookSecret = config?.webhookSecret || process.env.DUFFEL_WEBHOOK_SECRET;
    if (config?.apiVersion) this.apiVersion = config.apiVersion;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  get isLive(): boolean {
    return this.environment === 'live';
  }

  private getHeaders(idempotencyKey?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Duffel-Version': this.apiVersion,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'ProventaConciergeOS/1.0',
    };

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    return headers;
  }

  /**
   * Safe, non-transactional verification check against Duffel API.
   * Checks if credentials are valid and live without creating any orders or charges.
   */
  async verifyProductionAccess(): Promise<{
    verified: boolean;
    environment: 'live' | 'test';
    liveAuthorized: boolean;
    error?: string;
  }> {
    if (!this.isConfigured) {
      return {
        verified: false,
        environment: this.environment,
        liveAuthorized: false,
        error: 'DUFFEL_API_KEY not configured.',
      };
    }

    try {
      // Non-transactional read-only lookup of aircraft reference dataset
      const res = await fetch(`${this.baseUrl}/air/aircraft?limit=1`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.errors?.[0]?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          verified: false,
          environment: this.environment,
          liveAuthorized: false,
          error: errMsg,
        };
      }

      // Check key prefix: live keys start with 'duffel_live_'
      const isLiveKey = this.apiKey.startsWith('duffel_live_');
      const isLiveAuthorized = this.environment === 'live' && isLiveKey;

      return {
        verified: true,
        environment: this.environment,
        liveAuthorized: isLiveAuthorized,
      };
    } catch (err: any) {
      return {
        verified: false,
        environment: this.environment,
        liveAuthorized: false,
        error: err.message || 'Network error connecting to Duffel API',
      };
    }
  }

  // ============================================================
  // FLIGHTS API
  // ============================================================

  /**
   * Creates a flight offer request (Search).
   */
  async createOfferRequest(params: DuffelFlightSearchParams): Promise<any> {
    const slices = [
      {
        origin: params.origin.toUpperCase(),
        destination: params.destination.toUpperCase(),
        departure_date: params.departureDate,
      },
    ];

    if (params.returnDate) {
      slices.push({
        origin: params.destination.toUpperCase(),
        destination: params.origin.toUpperCase(),
        departure_date: params.returnDate,
      });
    }

    const payload = {
      data: {
        slices,
        passengers: params.passengers.map((p) => ({
          type: p.type,
          age: p.age,
        })),
        cabin_class: params.cabinClass || 'economy',
        max_connections: params.maxConnections ?? 1,
      },
    };

    const res = await fetch(`${this.baseUrl}/air/offer_requests?return_offers=true`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Flight Offer Request failed';
      throw new Error(`[Duffel Flight Search] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Revalidates / fetches an existing flight offer by ID.
   */
  async getOffer(offerId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/air/offers/${offerId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Offer lookup failed';
      throw new Error(`[Duffel Offer Revalidation] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Creates an authentic Duffel Flight Order (Ticketing / Booking).
   */
  async createOrder(params: {
    selectedOffers: string[];
    passengers: DuffelPassengerInput[];
    payments?: any[];
    idempotencyKey: string;
  }): Promise<any> {
    const payload = {
      data: {
        selected_offers: params.selectedOffers,
        passengers: params.passengers.map((p, idx) => ({
          id: p.id,
          title: p.title || (p.gender === 'f' ? 'ms' : 'mr'),
          given_name: p.givenName,
          family_name: p.familyName,
          gender: p.gender || 'm',
          born_on: p.bornOn,
          email: p.email,
          phone_number: p.phoneNumber,
        })),
        type: 'instant',
        payments: params.payments || [
          {
            type: 'balance',
            amount: undefined, // Duffel balance auto-settles exact fare
            currency: 'INR',
          },
        ],
      },
    };

    const res = await fetch(`${this.baseUrl}/air/orders`, {
      method: 'POST',
      headers: this.getHeaders(params.idempotencyKey),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Order Creation failed';
      const errCode = data?.errors?.[0]?.code || 'ORDER_CREATION_FAILED';
      const err = new Error(`[Duffel Order] ${errMsg}`);
      (err as any).code = errCode;
      (err as any).rawError = data;
      throw err;
    }

    return data.data;
  }

  /**
   * Retrieves an authentic Duffel Flight Order by ID.
   */
  async getOrder(orderId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/air/orders/${orderId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Order lookup failed';
      throw new Error(`[Duffel Order Lookup] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Requests a flight order cancellation quote.
   */
  async createOrderCancellation(orderId: string): Promise<any> {
    const payload = {
      data: {
        order_id: orderId,
      },
    };

    const res = await fetch(`${this.baseUrl}/air/order_cancellations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Cancellation Quote failed';
      throw new Error(`[Duffel Cancellation Quote] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Confirms a flight order cancellation quote.
   */
  async confirmOrderCancellation(cancellationId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/air/order_cancellations/${cancellationId}/actions/confirm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Cancellation Confirmation failed';
      throw new Error(`[Duffel Cancellation Confirm] ${errMsg}`);
    }

    return data.data;
  }

  // ============================================================
  // STAYS API (HOTELS)
  // ============================================================

  /**
   * Searches for hotels and stays accommodation.
   */
  async searchStays(params: DuffelStaySearchParams): Promise<any> {
    const payload = {
      data: {
        location: params.location,
        check_in_date: params.checkInDate,
        check_out_date: params.checkOutDate,
        rooms: params.rooms || 1,
        guests: params.guests,
      },
    };

    const res = await fetch(`${this.baseUrl}/stays/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Stays Search failed';
      throw new Error(`[Duffel Stays Search] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Creates a stay rate quote (Locks price & cancellation policy).
   */
  async createStayQuote(rateId: string): Promise<any> {
    const payload = {
      data: {
        rate_id: rateId,
      },
    };

    const res = await fetch(`${this.baseUrl}/stays/quotes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Stay Quote failed';
      throw new Error(`[Duffel Stay Quote] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Creates a stay booking with genuine CRS hotel confirmation code.
   */
  async createStayBooking(params: {
    quoteId: string;
    guests: { givenName: string; familyName: string }[];
    email?: string;
    phoneNumber?: string;
    specialRequests?: string;
    idempotencyKey: string;
  }): Promise<any> {
    const payload = {
      data: {
        quote_id: params.quoteId,
        guests: params.guests.map((g) => ({
          given_name: g.givenName,
          family_name: g.familyName,
        })),
        email: params.email,
        phone_number: params.phoneNumber,
        special_requests: params.specialRequests,
        payments: [
          {
            type: 'balance',
            currency: 'INR',
          },
        ],
      },
    };

    const res = await fetch(`${this.baseUrl}/stays/bookings`, {
      method: 'POST',
      headers: this.getHeaders(params.idempotencyKey),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Stay Booking failed';
      const errCode = data?.errors?.[0]?.code || 'STAY_BOOKING_FAILED';
      const err = new Error(`[Duffel Stay Booking] ${errMsg}`);
      (err as any).code = errCode;
      (err as any).rawError = data;
      throw err;
    }

    return data.data;
  }

  /**
   * Retrieves an authentic stay booking by ID.
   */
  async getStayBooking(bookingId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/stays/bookings/${bookingId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Stay Booking lookup failed';
      throw new Error(`[Duffel Stay Booking Lookup] ${errMsg}`);
    }

    return data.data;
  }

  /**
   * Cancels a stay booking.
   */
  async cancelStayBooking(bookingId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/stays/bookings/${bookingId}/actions/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.message || 'Duffel Stay Cancellation failed';
      throw new Error(`[Duffel Stay Cancellation] ${errMsg}`);
    }

    return data.data;
  }

  // ============================================================
  // WEBHOOK SIGNATURE VERIFICATION
  // ============================================================

  /**
   * Verifies incoming webhook HMAC-SHA256 signature using DUFFEL_WEBHOOK_SECRET.
   */
  verifyWebhookSignature(rawBody: string, signatureHeader?: string | null): boolean {
    if (!this.webhookSecret) {
      logger.warn('[DuffelClient] DUFFEL_WEBHOOK_SECRET not configured; rejecting webhook verification');
      return false;
    }

    if (!signatureHeader) {
      return false;
    }

    // Duffel-Signature format: t=1614859200,v1=6a3b...
    const parts = signatureHeader.split(',').reduce((acc: Record<string, string>, item) => {
      const [k, v] = item.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const timestamp = parts['t'];
    const signature = parts['v1'];

    if (!timestamp || !signature) {
      return false;
    }

    // Check replay attack window (5 minutes)
    const eventTime = parseInt(timestamp, 10) * 1000;
    if (Math.abs(Date.now() - eventTime) > 5 * 60 * 1000) {
      logger.warn({ timestamp }, '[DuffelClient] Webhook timestamp outside allowed 5-minute window');
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }
}

export const duffelClient = new DuffelClient();
