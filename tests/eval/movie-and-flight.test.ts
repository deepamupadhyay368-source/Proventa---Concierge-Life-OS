import { describe, it, expect } from 'vitest';
import { FlightsAdapter } from '@/lib/orchestration/adapters/flights.adapter';
import { CinemaAdapter } from '@/lib/orchestration/adapters/cinema.adapter';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import { understandRequest } from '@/lib/ai/agents/understanding';

describe('Flight & Movie/Cinema Booking Suite', () => {
  const flightAdapter = new FlightsAdapter();
  const cinemaAdapter = new CinemaAdapter();

  describe('1. Natural Language Intent & Category Extraction', () => {
    it('accurately identifies flight requests and routes to flights category', async () => {
      const parsed = await understandRequest('Book me 2 business class flight tickets from Ahmedabad to Delhi tomorrow morning');
      expect(parsed.category).toBe('flights');
      expect(parsed.urgency).toBeDefined();
    });

    it('accurately identifies movie & cinema ticket requests and routes to movies category', async () => {
      const parsed = await understandRequest('Book 2 recliner tickets for IMAX at PVR Palladium Ahmedabad tonight at 8 PM');
      expect(parsed.category).toBe('movies');
      expect(parsed.urgency).toBe('URGENT');
    });
  });

  describe('2. Flights Gateway Lifecycle (Aviation GDS Protocol)', () => {
    it('discovers verified scheduled flights with cabin class and baggage privileges', async () => {
      const options = await flightAdapter.search({
        category: 'flights',
        rawInput: 'Book business class flights Ahmedabad to Mumbai',
      });

      expect(options.length).toBeGreaterThanOrEqual(1);
      const first = options[0];
      expect(first.title).toContain('Business Class');
      expect(first.priceAmount).toBeGreaterThan(5000);
      expect(first.bookingMethod).toBe('API');
      expect(first.environment).toBe('SANDBOX');
    });

    it('executes e-ticket reservation and returns verified GDS PNR', async () => {
      const options = await flightAdapter.search({
        category: 'flights',
        rawInput: 'Air India Vistara',
      });

      const execution = await flightAdapter.execute(options[0], { guests: 2 });
      expect(execution.success).toBe(true);
      expect(execution.externalReferenceId).toContain('PNR');
      expect(execution.status).toBe('CONFIRMED');

      const verification = await flightAdapter.verify(execution);
      expect(verification.verified).toBe(true);
      expect(verification.status).toBe('CONFIRMED');
    });
  });

  describe('3. Movie & Cinema Gateway Lifecycle (PVR INOX / BookMyShow Protocol)', () => {
    it('searches luxury auditoriums (Insignia, Luxe, IMAX with Laser)', async () => {
      const options = await cinemaAdapter.search({
        category: 'movies',
        rawInput: 'PVR INOX IMAX recliner seats',
      });

      expect(options.length).toBeGreaterThanOrEqual(1);
      const top = options[0];
      expect(top.title).toContain('IMAX');
      expect(top.priceAmount).toBeGreaterThan(1000);
      expect(top.availability).toContain('Recliner');
    });

    it('executes box office reservation and returns authentic QR pass reference', async () => {
      const options = await cinemaAdapter.search({
        category: 'movies',
        rawInput: 'Cinema tickets',
      });

      const execution = await cinemaAdapter.execute(options[0], { guests: 2 });
      expect(execution.success).toBe(true);
      expect(execution.externalReferenceId).toContain('TKT');
      expect(execution.status).toBe('CONFIRMED');

      const verification = await cinemaAdapter.verify(execution);
      expect(verification.verified).toBe(true);
      expect(verification.confirmationReference).toBe(execution.externalReferenceId);
    });
  });

  describe('4. Adapter Registry Routing', () => {
    it('registers flight adapter under flights and travel', () => {
      const adapters = AdapterRegistry.getAdaptersForCategory('flights');
      expect(adapters.some((a) => a.name.includes('Aviation GDS'))).toBe(true);
    });

    it('registers cinema adapter under movies and cinema', () => {
      const adapters = AdapterRegistry.getAdaptersForCategory('movies');
      expect(adapters.some((a) => a.name.includes('Cinema & Entertainment'))).toBe(true);
    });
  });
});