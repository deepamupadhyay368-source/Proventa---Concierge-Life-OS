import { describe, it, expect } from 'vitest';
import {
  getFirstName,
  getTimeOfDay,
  getTimeAwareGreeting,
  getWelcomeMessage,
} from '@/lib/auth/greeting';

describe('PROVENTA — Personalized Customer Welcome Experience Suite', () => {
  describe('1. Name Extraction Logic', () => {
    it('extracts first name accurately from full names', () => {
      expect(getFirstName('Deepam Upadhyay')).toBe('Deepam');
      expect(getFirstName('Test Customer')).toBe('Test');
      expect(getFirstName('Arjun')).toBe('Arjun');
      expect(getFirstName('  Priya Sharma  ')).toBe('Priya');
    });

    it('handles honorific titles smoothly without treating title as first name', () => {
      expect(getFirstName('Dr. Deepam Upadhyay')).toBe('Deepam');
      expect(getFirstName('Mr. Arjun Patel')).toBe('Arjun');
      expect(getFirstName('Ms. Ananya Roy')).toBe('Ananya');
    });

    it('returns empty string on null, undefined, or empty names', () => {
      expect(getFirstName(null)).toBe('');
      expect(getFirstName(undefined)).toBe('');
      expect(getFirstName('')).toBe('');
      expect(getFirstName('   ')).toBe('');
    });
  });

  describe('2. Time-Aware Greeting Logic', () => {
    it('returns morning greeting between 05:00 and 11:59', () => {
      const morningDate = new Date('2026-09-23T08:30:00');
      expect(getTimeOfDay(morningDate)).toBe('morning');
      expect(getTimeAwareGreeting('Deepam Upadhyay', morningDate)).toBe('Good morning, Deepam.');
      expect(getTimeAwareGreeting(null, morningDate)).toBe('Good morning.');
    });

    it('returns afternoon greeting between 12:00 and 16:59', () => {
      const afternoonDate = new Date('2026-09-23T14:15:00');
      expect(getTimeOfDay(afternoonDate)).toBe('afternoon');
      expect(getTimeAwareGreeting('Deepam Upadhyay', afternoonDate)).toBe('Good afternoon, Deepam.');
      expect(getTimeAwareGreeting(null, afternoonDate)).toBe('Good afternoon.');
    });

    it('returns evening greeting between 17:00 and 21:59', () => {
      const eveningDate = new Date('2026-09-23T19:45:00');
      expect(getTimeOfDay(eveningDate)).toBe('evening');
      expect(getTimeAwareGreeting('Deepam Upadhyay', eveningDate)).toBe('Good evening, Deepam.');
      expect(getTimeAwareGreeting(null, eveningDate)).toBe('Good evening.');
    });

    it('returns welcome back greeting during late night hours', () => {
      const lateNightDate = new Date('2026-09-23T23:30:00');
      expect(getTimeOfDay(lateNightDate)).toBe('night');
      expect(getTimeAwareGreeting('Deepam Upadhyay', lateNightDate)).toBe('Welcome back, Deepam.');
      expect(getTimeAwareGreeting(null, lateNightDate)).toBe('Welcome back.');
    });
  });

  describe('3. First Login vs Returning Customer Logic', () => {
    it('formats first-time login greeting with brand welcome and subtitle', () => {
      const welcome = getWelcomeMessage({
        name: 'Deepam Upadhyay',
        isFirstLogin: true,
      });

      expect(welcome.title).toBe('Welcome to Proventa, Deepam.');
      expect(welcome.subtitle).toBe('Your life, handled. Tell your concierge what you need taken care of today.');
    });

    it('formats first-time login without name safely', () => {
      const welcome = getWelcomeMessage({
        name: null,
        isFirstLogin: true,
      });

      expect(welcome.title).toBe('Welcome to Proventa.');
      expect(welcome.subtitle).toBe('Your life, handled. Tell your concierge what you need taken care of today.');
    });

    it('formats returning customer greeting with time awareness', () => {
      const eveningDate = new Date('2026-09-23T20:00:00');
      const welcome = getWelcomeMessage({
        name: 'Deepam Upadhyay',
        isFirstLogin: false,
        date: eveningDate,
      });

      expect(welcome.title).toBe('Good evening, Deepam.');
      expect(welcome.subtitle).toBe('What would you like Proventa to take care of today?');
    });

    it('formats returning customer Test Customer accurately', () => {
      const afternoonDate = new Date('2026-09-23T13:00:00');
      const welcome = getWelcomeMessage({
        name: 'Test Customer',
        isFirstLogin: false,
        date: afternoonDate,
      });

      expect(welcome.title).toBe('Good afternoon, Test.');
      expect(welcome.subtitle).toBe('What would you like Proventa to take care of today?');
    });
  });

  describe('4. Multi-Tenant Customer Name Isolation', () => {
    it('strictly isolates greetings between two distinct customer sessions', () => {
      const sessionUserA = {
        id: 'usr_alpha_deepam',
        name: 'Deepam Upadhyay',
        email: 'deepam@proventa.in',
      };

      const sessionUserB = {
        id: 'usr_beta_test',
        name: 'Test Customer',
        email: 'test@example.com',
      };

      const greetingA = getWelcomeMessage({ name: sessionUserA.name });
      const greetingB = getWelcomeMessage({ name: sessionUserB.name });

      // Ensure customer A sees their own name
      expect(greetingA.title).toContain('Deepam');
      expect(greetingA.title).not.toContain('Test');

      // Ensure customer B sees their own name
      expect(greetingB.title).toContain('Test');
      expect(greetingB.title).not.toContain('Deepam');
    });
  });
});
