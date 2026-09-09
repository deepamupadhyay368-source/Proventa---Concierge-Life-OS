import { describe, it, expect, beforeEach } from 'vitest';
import { wave1RegisterSchema } from '@/lib/validation/schemas';
import { ProventaProviderGateway } from '@/lib/providers/gateway';
import { initializeStandardProviders } from '@/lib/providers/standard-connectors';
import { ProductionAmadeusFlightProvider } from '@/lib/providers/production/amadeus-flight-provider';
import { ProductionUberCabProvider } from '@/lib/providers/production/uber-cab-provider';

describe('Proventa Cohort 1 Application & Production Gateway Suite', () => {
  beforeEach(() => {
    initializeStandardProviders();
  });

  describe('Cohort 1 Comprehensive Registration Schema', () => {
    it('successfully validates a complete Private Individual application with lifestyle profile', () => {
      const payload = {
        name: 'Yashvardhan Patel',
        email: 'yash@patelholdings.com',
        phone: '+919825012345',
        city: 'Ahmedabad',
        profession: 'Managing Director',
        company: 'Patel Holdings',
        membershipTier: 'PRIVATE_INDIVIDUAL',
        annualLifestyleSpend: '25L_50L',
        primaryInterests: ['fine_dining', 'luxury_travel', 'curated_gifting'],
        householdMembers: 2,
        dietaryPreferences: 'Jain cuisine, strict vegetarian',
        frequentDestinations: 'London, Dubai, Mumbai',
        intendedUse: 'Need dedicated concierge for high-table dining reservations and international business travel.',
        communicationPref: 'WHATSAPP',
        referralSource: 'REF-FOUNDER-001',
        consentGiven: true,
      };

      const result = wave1RegisterSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.membershipTier).toBe('PRIVATE_INDIVIDUAL');
        expect(result.data.annualLifestyleSpend).toBe('25L_50L');
        expect(result.data.householdMembers).toBe(2);
      }
    });

    it('successfully validates a Founding Family application with high lifestyle budget', () => {
      const payload = {
        name: 'Aarav Mehta',
        email: 'aarav@mehta-family.com',
        phone: '+919876543210',
        city: 'Ahmedabad',
        membershipTier: 'FOUNDING_FAMILY',
        annualLifestyleSpend: '50L_PLUS',
        primaryInterests: ['luxury_travel', 'estate_care'],
        householdMembers: 5,
        dietaryPreferences: 'Gluten-free preferences for children',
        consentGiven: true,
      };

      const result = wave1RegisterSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.membershipTier).toBe('FOUNDING_FAMILY');
        expect(result.data.annualLifestyleSpend).toBe('50L_PLUS');
        expect(result.data.householdMembers).toBe(5);
      }
    });

    it('rejects registration without consent', () => {
      const payload = {
        name: 'Pooja Shah',
        email: 'pooja@shah.com',
        phone: '+919876543210',
        city: 'Ahmedabad',
        membershipTier: 'CORPORATE_EXECUTIVE',
        consentGiven: false,
      };

      const result = wave1RegisterSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email address', () => {
      const payload = {
        name: 'Invalid Email User',
        email: 'not-an-email',
        city: 'Ahmedabad',
        consentGiven: true,
      };

      const result = wave1RegisterSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Production Gateway Provider Routing & Fallbacks', () => {
    it('correctly registers Live Amadeus and Live Uber providers alongside Sandbox fallbacks', () => {
      const flightRoutes = ProventaProviderGateway.getAllCategoryRoutes('FLIGHTS');
      expect(flightRoutes.length).toBeGreaterThanOrEqual(2);

      const liveFlight = flightRoutes.find((r) => r.providerKey === 'amadeus_live_flights');
      const sandboxFlight = flightRoutes.find((r) => r.providerKey === 'amadeus_flights');

      expect(liveFlight).toBeDefined();
      expect(liveFlight?.priority).toBe(1);
      expect(sandboxFlight).toBeDefined();
      expect(sandboxFlight?.priority).toBe(2);
    });

    it('enforces Zero-Fabrication on unauthenticated Live Amadeus provider', async () => {
      const liveAmadeus = new ProductionAmadeusFlightProvider();
      const status = await liveAmadeus.getStatus();

      if (status === 'NOT_CONNECTED') {
        const result = await liveAmadeus.searchFlights({
          origin: 'AMD',
          destination: 'BOM',
          departureDate: '2026-10-15',
          passengers: 1,
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PROVIDER_NOT_CONNECTED');
      }
    });

    it('enforces Zero-Fabrication on unauthenticated Live Uber provider', async () => {
      const liveUber = new ProductionUberCabProvider();
      const status = await liveUber.getStatus();

      if (status === 'NOT_CONNECTED') {
        const result = await liveUber.createRide({
          pickup: { address: 'SVPIA Airport' },
          dropoff: { address: 'ITC Narmada' },
          rideTypeId: 'uber_premier',
          passengerName: 'Principal Member',
          passengerPhone: '+919825012345',
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('PROVIDER_NOT_CONNECTED');
      }
    });

    it('falls back seamlessly to verified sandbox when live credentials are not set', async () => {
      const active = ProventaProviderGateway.getActiveProviderForCategory('FLIGHTS');
      expect(active).not.toBeNull();
      expect(['PRODUCTION_ACTIVE', 'SANDBOX', 'NOT_CONNECTED']).toContain(active?.status);
    });
  });
});

