import { db } from '@/lib/db';
import { AHMEDABAD_PLACES } from '@/data/ahmedabad-places';
import type { SLAStatus, ConciergeBrief, ProviderContactDetails, TaskWorkspaceData } from './types';

export class ConciergeOperationsService {
  /**
   * Calculates real-time SLA status based on task priority, creation time, and deadline.
   */
  static calculateSLA(task: {
    createdAt: Date | string;
    priority: string;
    deadline?: Date | string | null;
    status: string;
  }): { status: SLAStatus; minutesRemaining?: number; waitingMinutes: number } {
    const created = new Date(task.createdAt).getTime();
    const now = Date.now();
    const waitingMinutes = Math.max(0, Math.floor((now - created) / 60000));

    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
      return { status: 'NORMAL', waitingMinutes };
    }

    // Standard SLA thresholds by priority (in minutes)
    const slaLimits: Record<string, number> = {
      URGENT: 30,     // 30 mins
      HIGH: 120,      // 2 hours
      NORMAL: 360,    // 6 hours
      LOW: 720,       // 12 hours
    };

    const targetMinutes = slaLimits[task.priority] || 360;
    const minutesRemaining = targetMinutes - waitingMinutes;

    if (minutesRemaining < 0) {
      return { status: 'OVERDUE', minutesRemaining, waitingMinutes };
    }
    if (minutesRemaining <= 30) {
      return { status: 'URGENT', minutesRemaining, waitingMinutes };
    }
    if (minutesRemaining <= 60) {
      return { status: 'DUE_SOON', minutesRemaining, waitingMinutes };
    }

    return { status: 'NORMAL', minutesRemaining, waitingMinutes };
  }

  /**
   * Generates a contextual phone call script for the concierge employee.
   */
  static generateCallScript(params: {
    customerName: string;
    venueName: string;
    targetDateTime?: string;
    partySize?: number;
    preferences?: Record<string, any>;
    category: string;
  }): string {
    const { customerName, venueName, targetDateTime, partySize, preferences, category } = params;
    const cat = (category || 'dining').toLowerCase();

    if (cat.includes('dine') || cat.includes('dining') || cat.includes('restaurant')) {
      const pCount = partySize || 2;
      const timeStr = targetDateTime || 'this evening at 8:00 PM';
      const seatingPref = preferences?.seating || preferences?.outdoor ? 'outdoor/terrace seating' : 'a quiet corner table';
      return `Hello, I'm calling from the Proventa Concierge Desk on behalf of our private member, ${customerName}.

I'd like to confirm reservation availability for a party of ${pCount} for ${timeStr} at ${venueName}.

Our member has requested ${seatingPref} if available.

Could you please confirm the table and provide your reservation reference code?`;
    }

    if (cat.includes('hotel') || cat.includes('stay') || cat.includes('resort')) {
      return `Hello, this is the Proventa Concierge Desk calling regarding accommodation for our member, ${customerName}.

We would like to coordinate booking details and VIP arrival amenities for ${venueName}.

Could you please connect me with the reservations manager to confirm availability and folio confirmation?`;
    }

    if (cat.includes('flight') || cat.includes('travel') || cat.includes('transit')) {
      return `Good day, Proventa Concierge Desk calling regarding flight booking verification for ${customerName}.

Please confirm the itinerary schedule and passenger manifest record.`;
    }

    return `Hello, this is the Proventa Concierge Desk calling on behalf of our member, ${customerName}, regarding ${venueName}.

We would like to coordinate direct reservation details. Could you please provide your desk confirmation reference?`;
  }

  /**
   * Resolves contact card details for a provider or curated venue.
   */
  static resolveProviderContact(vendorName?: string | null, category?: string): ProviderContactDetails | null {
    if (!vendorName) return null;
    const lowerName = vendorName.toLowerCase();

    // Check curated Ahmedabad places
    const matchedPlace = AHMEDABAD_PLACES.find((p) =>
      lowerName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lowerName)
    );

    if (matchedPlace) {
      return {
        providerId: matchedPlace.id,
        name: matchedPlace.name,
        venueName: matchedPlace.name,
        phone: matchedPlace.phone || '+91 79 2550 6554',
        email: `${matchedPlace.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.proventa.in`,
        website: matchedPlace.website || 'https://thehouseofmg.com',
        address: matchedPlace.address,
        bookingMethod: (matchedPlace.bookingMethod as any) || 'PHONE',
        reliabilityScore: matchedPlace.reliabilityScore || 4.9,
        notes: matchedPlace.notes || 'Verified partner desk. Priority table allocation held for Proventa members.',
      };
    }

    return {
      providerId: `prov-${lowerName.replace(/[^a-z0-9]/g, '-')}`,
      name: vendorName,
      venueName: vendorName,
      bookingMethod: 'PHONE',
      notes: 'Provider contact details to be looked up directly by Concierge operator.',
    };
  }

  /**
   * Prepares the comprehensive AI brief for the employee workspace.
   */
  static generateBrief(task: any, customerUser?: any): ConciergeBrief {
    const prefs = (task.clientPreferences as Record<string, any>) || {};
    const prep = prefs.preparedContext || {};
    const approvedOption = prefs.approvedOption || (Array.isArray(task.proposedOptions) ? task.proposedOptions[0] : null);

    const customerName = customerUser?.name || 'Valued Member';
    const category = task.category || 'concierge';
    const originalRequest = task.originalRequest || task.intent || '';

    const handoffReason =
      prefs.executionReason ||
      (task.executionMethod === 'HUMAN_CONCIERGE'
        ? 'Direct telephone reservation / operator placement required with venue desk.'
        : 'Automated inventory unconfigured or required human confirmation.');

    const recommendedNextAction = approvedOption?.providerName
      ? `Contact ${approvedOption.providerName} via phone to secure verified booking and obtain authentic reference.`
      : `Contact partner desk for "${task.intent}" and confirm availability.`;

    const script = this.generateCallScript({
      customerName,
      venueName: approvedOption?.providerName || task.vendorName || 'the venue',
      targetDateTime: prep.dates || prep.dateTime || 'this evening at 8:00 PM',
      partySize: prep.partySize || 2,
      preferences: prefs,
      category,
    });

    return {
      customerName,
      customerPhone: customerUser?.phone || undefined,
      customerEmail: customerUser?.email || '',
      category,
      originalRequest,
      approvedOptionTitle: approvedOption?.title || task.vendorName,
      approvedOptionProvider: approvedOption?.providerName || task.vendorName,
      approvedOptionPrice: approvedOption?.priceFormatted || task.budgetAmount ? `₹${task.budgetAmount?.toLocaleString('en-IN')}` : undefined,
      partySize: prep.partySize || 2,
      targetDateTime: prep.dates || prep.dateTime,
      targetLocation: prep.location || 'Ahmedabad',
      budgetFormatted: task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : undefined,
      customerPreferences: prefs,
      specialRequirements: task.requiredInfo || [],
      automationAttemptStatus: task.executionMethod === 'API' ? 'API Attempt Failed / Unconfigured' : 'Human Desk Execution Required',
      handoffReason,
      recommendedNextAction,
      callScriptDraft: script,
    };
  }
}
