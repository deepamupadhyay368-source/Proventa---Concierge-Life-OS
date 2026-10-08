import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildSynthesizedPrompt,
  mapExtractedDataToForm,
  StructuredRequestForm,
} from '@/lib/requests/request-builder';
import { POST as parseIntentHandler } from '@/app/api/requests/parse-intent/route';
import { NextRequest } from 'next/server';

describe('PROVENTA — CLIENT REQUEST EXPERIENCE REDESIGN SUITE', () => {
  describe('1. Structured Request Form -> Synthesized Prompt Builder', () => {
    it('1.1 builds clear flight prompt with origin, destination, date, passengers, cabin, and budget', () => {
      const form: StructuredRequestForm = {
        service: 'FLIGHTS',
        origin: 'Ahmedabad (AMD)',
        destination: 'Mumbai (BOM)',
        date: '2026-10-15',
        returnDate: '2026-10-18',
        tripType: 'ROUND_TRIP',
        partySize: 3,
        cabinClass: 'BUSINESS',
        budgetMode: 'MAX',
        budgetAmount: 35000,
        preferences: ['Non-stop flights only', 'Morning departure'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Book 3 business class from Ahmedabad (AMD) to Mumbai (BOM)');
      expect(prompt).toContain('on 2026-10-15');
      expect(prompt).toContain('returning on 2026-10-18');
      expect(prompt).toContain('under ₹35,000');
      expect(prompt).toContain('Preferences: Non-stop flights only, Morning departure');
    });

    it('1.2 builds hotel prompt with destination, dates, guests, rooms, and luxury preferences', () => {
      const form: StructuredRequestForm = {
        service: 'HOTELS',
        city: 'Udaipur',
        destination: 'Udaipur',
        date: '2026-11-01',
        returnDate: '2026-11-04',
        partySize: 2,
        rooms: 1,
        budgetMode: 'EXACT',
        budgetAmount: 60000,
        preferences: ['5-Star Luxury', 'Heritage / Palace'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Book luxury hotel in Udaipur for 2 guests');
      expect(prompt).toContain('from 2026-11-01');
      expect(prompt).toContain('to 2026-11-04');
      expect(prompt).toContain('with budget around ₹60,000');
      expect(prompt).toContain('5-Star Luxury');
    });

    it('1.3 builds events prompt for Garba passes in Ahmedabad', () => {
      const form: StructuredRequestForm = {
        service: 'EVENTS',
        city: 'Ahmedabad',
        targetName: 'VIP Garba passes',
        date: '2026-10-15',
        partySize: 4,
        budgetMode: 'MAX',
        budgetAmount: 10000,
        preferences: ['VIP Pass Access', 'Valet Parking'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Book 4 VIP Garba passes in Ahmedabad');
      expect(prompt).toContain('on 2026-10-15');
      expect(prompt).toContain('under ₹10,000');
      expect(prompt).toContain('VIP Pass Access');
    });

    it('1.4 builds dining prompt for Agashiye terrace reservation', () => {
      const form: StructuredRequestForm = {
        service: 'DINING',
        city: 'Ahmedabad',
        targetName: 'Agashiye Heritage',
        date: '2026-10-17',
        time: '8:00 PM',
        partySize: 4,
        budgetMode: 'FLEXIBLE',
        preferences: ['Rooftop Seating', 'Heritage Gujarati Thali'],
        notes: 'Anniversary celebration with family',
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Reserve a table for 4 at a top Agashiye Heritage restaurant in Ahmedabad');
      expect(prompt).toContain('on 2026-10-17 at 8:00 PM');
      expect(prompt).toContain('Preferences: Rooftop Seating, Heritage Gujarati Thali');
      expect(prompt).toContain('Special notes: Anniversary celebration with family');
    });

    it('1.5 builds healthcare prompt for cardiologist consultation', () => {
      const form: StructuredRequestForm = {
        service: 'HEALTHCARE',
        city: 'Ahmedabad',
        targetName: 'Chief Cardiologist',
        date: '2026-10-20',
        partySize: 1,
        budgetMode: 'FLEXIBLE',
        preferences: ['Senior Consultant / Chief Specialist'],
        urgency: 'URGENT',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Schedule consultation with top Chief Cardiologist in Ahmedabad for 1 person');
      expect(prompt).toContain('on 2026-10-20');
      expect(prompt).toContain('Senior Consultant / Chief Specialist');
    });

    it('1.6 builds transport prompt for airport executive chauffeur', () => {
      const form: StructuredRequestForm = {
        service: 'TRANSPORT',
        city: 'Ahmedabad',
        pickupLocation: 'SVPIA Airport T2',
        destination: 'GIFT City Club',
        targetName: 'Mercedes-Benz E-Class',
        date: '2026-10-16',
        time: '11:30 AM',
        partySize: 2,
        budgetMode: 'FLEXIBLE',
        preferences: ['Uniformed Chauffeur', 'Meet & Greet at Airport Terminal'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Arrange Mercedes-Benz E-Class chauffeur pickup from SVPIA Airport T2 to GIFT City Club');
      expect(prompt).toContain('for 2 passengers');
      expect(prompt).toContain('on 2026-10-16 at 11:30 AM');
    });

    it('1.7 builds gifting prompt for luxury Diwali hamper', () => {
      const form: StructuredRequestForm = {
        service: 'GIFTING',
        deliveryLocation: 'Ahmedabad',
        city: 'Ahmedabad',
        targetName: 'Artisanal Gourmet Hamper',
        recipient: 'Key Corporate Client',
        occasion: 'Diwali Festival',
        date: '2026-10-25',
        partySize: 1,
        budgetMode: 'MAX',
        budgetAmount: 15000,
        preferences: ['Personalized Calligraphy Card'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Arrange bespoke Artisanal Gourmet Hamper for Key Corporate Client on the occasion of Diwali Festival delivered in Ahmedabad');
      expect(prompt).toContain('under ₹15,000');
    });

    it('1.8 builds trips prompt with surprise getaway mode', () => {
      const form: StructuredRequestForm = {
        service: 'TRIPS',
        origin: 'Ahmedabad',
        isSurpriseDestination: true,
        date: '2026-11-10',
        returnDate: '2026-11-15',
        partySize: 2,
        budgetMode: 'MAX',
        budgetAmount: 150000,
        preferences: ['Private Luxury Villa', 'Beach & Ocean View'],
        urgency: 'NORMAL',
      };

      const prompt = buildSynthesizedPrompt(form);
      expect(prompt).toContain('Curate and plan a getaway to curated surprise getaway destination from Ahmedabad for 2 people');
      expect(prompt).toContain('under ₹1,50,000');
    });
  });

  describe('2. AI Auto-Fill / Intent Mapping', () => {
    it('2.1 maps natural language Garba pass request to structured form', () => {
      const raw = 'Book 3 Garba passes in Ahmedabad on October 15, 2026 under ₹6,000';
      const extracted = {
        category: 'events',
        action: 'BOOK',
        objective: 'BOOK' as any,
        intent: raw,
        location: 'Ahmedabad',
        partySize: 3,
        budgetAmount: 6000,
        budgetRange: '₹6,000',
        date: 'October 15, 2026',
        urgency: 'NORMAL' as const,
        executionRequired: true,
        approvalRequired: true,
        requiresClarification: false,
      };

      const structured = mapExtractedDataToForm(extracted, raw);
      expect(structured.service).toBe('EVENTS');
      expect(structured.city).toBe('Ahmedabad');
      expect(structured.partySize).toBe(3);
      expect(structured.budgetAmount).toBe(6000);
      expect(structured.budgetMode).toBe('MAX');
      expect(structured.targetName).toBe('Garba passes');
    });

    it('2.2 maps natural language flight request to structured form with cabin and route', () => {
      const raw = 'I need business class flights from Ahmedabad to Mumbai on 15 October for 2 people under ₹30,000';
      const extracted = {
        category: 'flights',
        action: 'BOOK',
        objective: 'BOOK' as any,
        intent: raw,
        origin: 'Ahmedabad',
        destination: 'Mumbai',
        location: 'Ahmedabad',
        partySize: 2,
        budgetAmount: 30000,
        date: '15 October',
        urgency: 'NORMAL' as const,
        executionRequired: true,
        approvalRequired: true,
        requiresClarification: false,
      };

      const structured = mapExtractedDataToForm(extracted, raw);
      expect(structured.service).toBe('FLIGHTS');
      expect(structured.origin).toBe('Ahmedabad');
      expect(structured.destination).toBe('Mumbai');
      expect(structured.partySize).toBe(2);
      expect(structured.cabinClass).toBe('BUSINESS');
      expect(structured.budgetAmount).toBe(30000);
    });

    it('2.3 maps dining request with restaurant name and time', () => {
      const raw = 'Reserve dinner at Agashiye for 4 this Saturday at 8pm';
      const extracted = {
        category: 'dining',
        action: 'BOOK',
        objective: 'BOOK' as any,
        intent: raw,
        destination: 'Agashiye — The House of MG',
        location: 'Ahmedabad',
        partySize: 4,
        date: 'Saturday',
        time: '8pm',
        urgency: 'NORMAL' as const,
        executionRequired: true,
        approvalRequired: true,
        requiresClarification: false,
      };

      const structured = mapExtractedDataToForm(extracted, raw);
      expect(structured.service).toBe('DINING');
      expect(structured.partySize).toBe(4);
      expect(structured.time).toBe('8pm');
    });
  });

  describe('3. API /api/requests/parse-intent', () => {
    it('3.1 parses valid request and returns structured mapping', async () => {
      const req = new NextRequest('http://localhost:3000/api/requests/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Book 3 Garba passes in Ahmedabad on October 15, 2026 under ₹6,000',
        }),
      });

      const res = await parseIntentHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.structured.service).toBe('EVENTS');
      expect(data.structured.partySize).toBe(3);
      expect(data.structured.budgetAmount).toBe(6000);
    });

    it('3.2 rejects empty text with 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/requests/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '  ' }),
      });

      const res = await parseIntentHandler(req);
      expect(res.status).toBe(400);
    });
  });
});
