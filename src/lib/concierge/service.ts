import { db } from '@/lib/db';
import { AHMEDABAD_PLACES } from '@/data/ahmedabad-places';
import type {
  SLAStatus,
  ConciergeBrief,
  ProviderContactDetails,
  OperationalConstraints,
  PaymentInfo,
  RequiredAction,
  TaskWorkspaceData,
} from './types';

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
      CRITICAL: 15,
      URGENT: 30,
      HIGH: 120,
      NORMAL: 360,
      MEDIUM: 360,
      LOW: 720,
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
    approvedOptionTitle?: string;
  }): string {
    const { customerName, venueName, targetDateTime, partySize, preferences, category, approvedOptionTitle } = params;
    const cat = (category || 'dining').toLowerCase();

    if (cat.includes('dine') || cat.includes('dining') || cat.includes('restaurant') || cat.includes('food')) {
      const pCount = partySize || 2;
      const timeStr = targetDateTime || 'this evening at 8:00 PM';
      const seatingPref = preferences?.seating || preferences?.outdoor ? 'outdoor/terrace seating' : 'a quiet corner table';
      const dietary = Array.isArray(preferences?.dietary) ? preferences.dietary.join(', ') : preferences?.dietary;
      const dietaryNote = dietary ? `\n• Special Dietary Requirement: ${dietary}` : '';

      return `Hello, this is the Proventa Executive Concierge desk calling on behalf of our private client, ${customerName}.

We are securing a VIP table reservation:
• Venue / Experience: ${venueName}${approvedOptionTitle ? ` (${approvedOptionTitle})` : ''}
• Guest Count: Party of ${pCount}
• Target Date & Time: ${timeStr}
• Table / Seating Preference: ${seatingPref}${dietaryNote}

Could you please confirm table availability, note this reservation under "${customerName} (Proventa Concierge)", and provide your direct booking confirmation reference code?`;
    }

    if (cat.includes('hotel') || cat.includes('stay') || cat.includes('resort') || cat.includes('villa')) {
      return `Good day, this is the Proventa Private Concierge calling on behalf of our member, ${customerName}.

We are placing a reservation for:
• Property: ${venueName}
• Target Schedule: ${targetDateTime || 'Upcoming requested stay dates'}
• Special Requests: Early check-in & VIP welcome amenities if available.

Could you please connect me with your Duty Reservations Manager to lock in the room rate, folio, and provide the hotel reservation reference?`;
    }

    if (cat.includes('flight') || cat.includes('aviation') || cat.includes('travel') || cat.includes('transit') || cat.includes('chauffeur')) {
      return `Hello, Proventa Executive Aviation & Travel Desk calling regarding itinerary arrangements for ${customerName}.

• Request: ${approvedOptionTitle || venueName}
• Timing: ${targetDateTime || 'Requested departure schedule'}

Please confirm carrier availability, passenger manifest requirements, and supply the direct PNR / booking confirmation code.`;
    }

    return `Hello, this is the Proventa Private Concierge Desk calling on behalf of our member, ${customerName}.

We are coordinating execution for: "${approvedOptionTitle || venueName}".
Could you please verify current availability and provide the direct booking reference and reservations manager name for our records?`;
  }

  /**
   * Resolves contact card details for a provider or curated venue.
   */
  static resolveProviderContact(vendorName?: string | null, category?: string): ProviderContactDetails | null {
    if (!vendorName) {
      return {
        providerId: 'prov-direct-desk',
        name: 'Partner Reservations Desk',
        venueName: 'Service Provider',
        bookingMethod: 'PHONE',
        notes: 'Contact provider reservations directly and obtain verified reference code.',
      };
    }
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
        notes: matchedPlace.notes || 'Verified partner desk. Priority allocation held for Proventa members.',
        contactPerson: 'Reservations Manager / Maître d\'',
      };
    }

    // Curated high-frequency national & regional providers
    if (lowerName.includes('agashiye') || lowerName.includes('house of mg')) {
      return {
        providerId: 'prov-agashiye',
        name: 'Agashiye — The House of MG',
        venueName: 'Agashiye Heritage Rooftop',
        phone: '+91 79 2550 6941',
        email: 'reservations@houseofmg.com',
        website: 'https://houseofmg.com/agashiye',
        address: 'Opposite Sidi Saiyyed Mosque, Gheekanta, Ahmedabad, Gujarat 380001',
        bookingMethod: 'PHONE',
        reliabilityScore: 5.0,
        notes: 'Heritage Gujarati Dining. Call front desk to reserve terrace table. Reference code required.',
        contactPerson: 'Maître d\' Desk',
      };
    }

    if (lowerName.includes('leela') || lowerName.includes('udaipur')) {
      return {
        providerId: 'prov-leela-palace',
        name: 'The Leela Palace Udaipur',
        venueName: 'The Leela Palace',
        phone: '+91 294 670 1234',
        email: 'reservations.udaipur@theleela.com',
        website: 'https://theleela.com/the-leela-palace-udaipur',
        address: 'Lake Pichola, Udaipur, Rajasthan 313001',
        bookingMethod: 'PHONE',
        reliabilityScore: 5.0,
        notes: 'VIP Luxury Suite reservation desk. Confirm boat transfer and butler allocation.',
        contactPerson: 'Duty Manager / VIP Concierge',
      };
    }

    if (lowerName.includes('air india') || lowerName.includes('vistara') || lowerName.includes('indigo')) {
      return {
        providerId: 'prov-airline-desk',
        name: vendorName,
        venueName: vendorName,
        phone: '+91 124 264 1407',
        bookingMethod: 'API',
        notes: 'Commercial Airline Corporate Desk. Secure PNR and issue ticket via corporate portal.',
      };
    }

    return {
      providerId: `prov-${lowerName.replace(/[^a-z0-9]/g, '-')}`,
      name: vendorName,
      venueName: vendorName,
      bookingMethod: 'PHONE',
      notes: 'Direct provider contact desk. Verify reservation and obtain genuine reference code.',
    };
  }

  /**
   * Prepares the comprehensive AI brief and structured mandate for the employee workspace.
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
      prefs.handoffMessage ||
      (task.executionMethod === 'HUMAN_CONCIERGE'
        ? 'Customer approved task requiring personal concierge desk reservation & phone verification.'
        : 'Automated inventory unconfigured or requires human confirmation.');

    const venueName = approvedOption?.providerName || approvedOption?.provider || task.vendorName || 'the venue';
    const approvedTitle = approvedOption?.title || approvedOption?.name || task.intent;

    const recommendedNextAction = venueName
      ? `Call ${venueName} reservations desk to secure verified reservation for ${customerName} and record authentic confirmation code.`
      : `Contact partner desk for "${task.intent}" and confirm reservation.`;

    const targetDateTime = prep.dates || prep.dateTime || prep.time || 'Requested Schedule';
    const partySize = prep.partySize || prefs.partySize || 2;
    const targetLocation = prep.location || prep.city || 'Ahmedabad';

    const constraints: OperationalConstraints = {
      partySize,
      targetDateTime,
      targetLocation,
      origin: prep.origin,
      destination: prep.destination,
      seatingPreference: prefs.seating || prep.seatingPreference || 'Quiet / Prime table',
      dietaryRestrictions: Array.isArray(prefs.dietary) ? prefs.dietary : prefs.dietary ? [prefs.dietary] : undefined,
      budgetFormatted: task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : approvedOption?.price ? `₹${approvedOption.price}` : 'Flexible',
      budgetAmount: task.budgetAmount,
      specialRequests: task.requiredInfo || prefs.specialRequests || [],
      clientNotes: prefs.notes || prefs.lastFeedback,
    };

    // Calculate Payment Info
    const isPaid = task.paymentStatus === 'CAPTURED' || prefs.paymentStatus === 'CAPTURED' || Boolean(task.paymentId);
    const paymentInfo: PaymentInfo = {
      status: task.paymentStatus || (isPaid ? 'CAPTURED' : 'PENDING'),
      amountFormatted: task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : approvedOption?.price ? `₹${approvedOption.price}` : '₹0',
      amountInr: task.budgetAmount,
      paymentMethod: prefs.paymentMethod || 'UPI / Razorpay',
      paymentId: task.paymentId || prefs.paymentId || null,
      orderId: prefs.orderId || null,
      paidAt: prefs.paidAt || (isPaid ? task.updatedAt : null),
      isPrePaid: isPaid,
      notes: isPaid ? 'Payment pre-authorized & captured. Proceed with immediate provider booking.' : 'Pending confirmation or billed upon fulfillment.',
    };

    // Construct Required Action
    const providerContact = this.resolveProviderContact(venueName, category);
    const requiredAction: RequiredAction = {
      code: 'CALL_PROVIDER_AND_CONFIRM',
      title: `Call ${venueName} & Confirm Booking`,
      summary: `Place direct reservation for ${customerName} (${partySize} guests) at ${venueName} for ${targetDateTime}.`,
      step1: `Call ${venueName} reservations desk at ${providerContact?.phone || 'direct phone number'}.`,
      step2: `State member name "${customerName}", party size of ${partySize}, and verify ${constraints.seatingPreference || 'seating preferences'}.`,
      step3: `Obtain verified reservation code and enter into "Confirm Provider Booking" modal.`,
      targetContact: providerContact?.contactPerson || 'Reservations Manager',
      targetPhone: providerContact?.phone,
    };

    const script = this.generateCallScript({
      customerName,
      venueName,
      targetDateTime,
      partySize,
      preferences: prefs,
      category,
      approvedOptionTitle: approvedTitle,
    });

    return {
      customerName,
      customerPhone: customerUser?.phone || undefined,
      customerEmail: customerUser?.email || '',
      category,
      originalRequest,
      approvedOptionTitle: approvedTitle,
      approvedOptionProvider: venueName,
      approvedOptionPrice: approvedOption?.priceFormatted || (task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : undefined),
      partySize,
      targetDateTime,
      targetLocation,
      budgetFormatted: task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : undefined,
      customerPreferences: prefs,
      specialRequirements: task.requiredInfo || [],
      automationAttemptStatus: task.executionMethod === 'API' ? 'API Attempt Failed / Unconfigured' : 'Human Concierge Mandate Active',
      handoffReason,
      recommendedNextAction,
      callScriptDraft: script,
      constraints,
      paymentInfo,
      requiredAction,
    };
  }
}
