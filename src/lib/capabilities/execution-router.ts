import { CapabilityRegistry } from './capability-registry';
import type { ServiceCategory, TaskCapability } from './types';

export type ClientExecutionTier = 'AUTOMATED' | 'ASSISTED' | 'HUMAN';
export type ProviderHealthStatus = 'AVAILABLE' | 'NOT_CONFIGURED' | 'DEGRADED' | 'DISABLED';

export interface ProviderCapabilityHealth {
  category: ServiceCategory;
  name: string;
  primaryProvider: string;
  status: ProviderHealthStatus;
  isAutomatedSupported: boolean;
  notes: string;
}

export interface PreparedContext {
  [key: string]: any;
  category: string;
  intent: string;
  originalRequest: string;
  dates?: string;
  partySize?: number;
  budget?: string | number;
  location?: string;
  constraints?: Record<string, any>;
  preferences?: Record<string, any>;
  aiResearchNotes?: string;
  proposedOptionsCount?: number;
}

export interface ExecutionResolution {
  tier: ClientExecutionTier;
  executionMethod: 'API' | 'HUMAN_CONCIERGE';
  executionModeType: 'AUTOMATED_INTERNAL_EXECUTION' | 'TRUE_AUTONOMOUS_EXTERNAL_EXECUTION' | 'CUSTOMER_AUTHORIZED_CHECKOUT' | 'ASSISTED_EXECUTION' | 'HUMAN_CONCIERGE_EXECUTION';
  requiresExternalTransaction: boolean;
  providerStatus: ProviderHealthStatus;
  providerConsidered?: string;
  reason: string;
  customerStatusMessage: string;
  preparedContext: PreparedContext;
}

export class ExecutionRouter {
  /**
   * Evaluates the availability and configuration of an automated provider without exposing secrets.
   */
  static checkProviderHealth(providerId: string): ProviderHealthStatus {
    switch (providerId.toLowerCase()) {
      case 'duffel_flights':
      case 'duffel':
      case 'duffel_aviation':
      case 'duffel_stays': {
        const hasKeys = Boolean(process.env.DUFFEL_API_KEY && process.env.DUFFEL_API_KEY.trim().length > 0);
        const isLive = process.env.DUFFEL_ENV === 'live' && Boolean(process.env.DUFFEL_API_KEY?.startsWith('duffel_live_'));
        return isLive ? 'AVAILABLE' : hasKeys ? 'DEGRADED' : 'NOT_CONFIGURED';
      }

      case 'amadeus_flights':
      case 'amadeus':
      case 'scheduled_flights': {
        const hasKeys = Boolean(
          (process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_API_KEY) &&
          (process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_API_SECRET)
        );
        return hasKeys ? 'AVAILABLE' : 'NOT_CONFIGURED';
      }

      case 'swiggy':
      case 'food_delivery': {
        return process.env.FEATURE_SWIGGY_LIVE === 'true' ? 'AVAILABLE' : 'NOT_CONFIGURED';
      }

      case 'cinema_pvr_inox':
      case 'cinema': {
        return process.env.CINEMA_API_KEY ? 'AVAILABLE' : 'NOT_CONFIGURED';
      }

      case 'ahmedabad_verified': {
        // Ahmedabad verified telephone venue coordination
        return 'AVAILABLE';
      }

      case 'healthcare_discovery':
      case 'healthcare':
      case 'doctors':
      case 'doctor':
      case 'verified_wellness': {
        return 'AVAILABLE';
      }

      case 'events_discovery':
      case 'events':
      case 'vip_access':
      case 'experiences':
      case 'navratri':
      case 'garba': {
        return 'AVAILABLE';
      }

      default:
        return 'NOT_CONFIGURED';
    }
  }

  /**
   * Internal capability health matrix for operators and administration.
   */
  static getCapabilitiesHealth(): ProviderCapabilityHealth[] {
    const all = CapabilityRegistry.getAllCapabilities();
    return all.map((cap) => {
      const primaryProvider = cap.supportedProviders[0] || 'concierge_desk';
      const status = this.checkProviderHealth(primaryProvider);
      return {
        category: cap.category,
        name: cap.name,
        primaryProvider,
        status,
        isAutomatedSupported: cap.liveProviderAvailable && status === 'AVAILABLE',
        notes: status === 'AVAILABLE'
          ? 'Live provider available with configured environment credentials.'
          : 'Provider automation unconfigured or requires concierge desk placement. Routed to Human Concierge.',
      };
    });
  }

  /**
   * Centralized Execution Router:
   * Resolves execution hierarchy: AUTOMATED -> ASSISTED -> HUMAN.
   *
   * 1. Is the capability supported?
   * 2. Is a verified automated provider available with valid credentials?
   * 3. Can the provider safely perform the operation automatically?
   *    If yes -> AUTOMATED.
   * 4. If not, can AI prepare useful structured information for the concierge?
   *    If yes -> ASSISTED.
   * 5. If not -> HUMAN.
   *
   * Crucial invariant: Missing provider API NEVER fails the request.
   */
  static resolveExecutionMode(params: {
    rawInput: string;
    category?: string;
    objective?: string;
    extractedData?: Record<string, any>;
    preferences?: Record<string, any>;
    capability?: TaskCapability;
  }): ExecutionResolution {
    const raw = (params.rawInput || '').toLowerCase().trim();

    // 1. Resolve capability
    const normCategory = (params.category || 'bespoke_requests').toUpperCase().replace(/[\s-]/g, '_') as ServiceCategory;
    const capability = params.capability || CapabilityRegistry.getCapability(normCategory);

    // 2. Identify candidate provider
    const candidateProvider = capability.supportedProviders[0] || 'concierge_desk';
    const providerStatus = this.checkProviderHealth(candidateProvider);

    const isWeekendEscapeBooking =
      normCategory === 'WEEKEND_ESCAPES' ||
      raw.includes('weekend getaway') ||
      raw.includes('weekend escape');

    // 3. Pure Internal Deliverables: Research, Comparisons, Itineraries, Discovery Lists, Reminders, Planning
    const isPureInternalDeliverable =
      !isWeekendEscapeBooking &&
      (
        params.objective === 'RESEARCH' ||
        params.objective === 'COMPARE' ||
        raw.startsWith('compare ') ||
        raw.includes('compare ') ||
        raw.includes('itinerary') ||
        raw.includes('plan me') ||
        raw.includes('plan a ') ||
        raw.includes('remind me') ||
        raw.startsWith('find me 20') ||
        raw.includes('find me 20') ||
        raw.startsWith('research ') ||
        raw.includes('research ')
      );

    // 4. Actionable External Transactions: Explicit booking, reservation, ordering, tickets, passes, appointments
    const isExplicitBooking =
      !isPureInternalDeliverable &&
      (
        raw.startsWith('book ') ||
        raw.includes('book me') ||
        raw.includes('book a ') ||
        raw.includes('book 2') ||
        raw.includes('book 3') ||
        raw.includes('book two') ||
        raw.includes('book tickets') ||
        raw.includes('reservation') ||
        raw.includes('reserve ') ||
        raw.includes('reserve a') ||
        raw.includes('table for') ||
        raw.includes('order ') ||
        raw.includes('buy ') ||
        raw.includes('purchase ') ||
        /\b(?:garba\s+passes?|event\s+passes?|entry\s+passes?|tickets?)\b/i.test(raw) ||
        raw.includes('doctor') ||
        raw.includes('appointment') ||
        raw.includes('cardiolog') ||
        raw.includes('restaurant') ||
        raw.includes('restaurants') ||
        raw.includes('fine-dining') ||
        (normCategory === 'DINING' && Boolean(params.extractedData?.partySize || params.extractedData?.intent)) ||
        normCategory === 'WEEKEND_ESCAPES' ||
        params.objective === 'BOOK' ||
        params.objective === 'ARRANGE' ||
        params.extractedData?.executionRequired === true
      );

    const isExplicitManual =
      raw.includes('call ') ||
      raw.includes('call the') ||
      raw.includes('specific table') ||
      raw.includes('offline') ||
      raw.includes('handwritten') ||
      raw.includes('courier');

    const requiresExternalTransaction = !isPureInternalDeliverable && (isExplicitBooking || isExplicitManual);

    // 5. Determine execution mode type & tier
    const canAutomateSafely =
      !isExplicitManual &&
      capability.executionMode === 'PROVIDER_API' &&
      capability.liveProviderAvailable &&
      candidateProvider !== 'ahmedabad_verified' && // phone venue coordination requires concierge desk
      providerStatus === 'AVAILABLE';

    let tier: ClientExecutionTier;
    let executionMethod: 'API' | 'HUMAN_CONCIERGE';
    let executionModeType: 'AUTOMATED_INTERNAL_EXECUTION' | 'TRUE_AUTONOMOUS_EXTERNAL_EXECUTION' | 'CUSTOMER_AUTHORIZED_CHECKOUT' | 'ASSISTED_EXECUTION' | 'HUMAN_CONCIERGE_EXECUTION';
    let reason: string;

    if (isExplicitManual) {
      tier = 'HUMAN';
      executionMethod = 'HUMAN_CONCIERGE';
      executionModeType = 'HUMAN_CONCIERGE_EXECUTION';
      reason = 'Member requested bespoke human concierge assistance, offline coordination, or specialized mandate.';
    } else if (!requiresExternalTransaction) {
      tier = 'AUTOMATED';
      executionMethod = 'API';
      executionModeType = 'AUTOMATED_INTERNAL_EXECUTION';
      reason = 'Internal task: Automated internal completion without external provider transaction.';
    } else if (canAutomateSafely) {
      tier = 'AUTOMATED';
      executionMethod = 'API';
      executionModeType = 'TRUE_AUTONOMOUS_EXTERNAL_EXECUTION';
      reason = `Verified automated provider (${candidateProvider}) active with live credentials.`;
    } else {
      // Missing provider or desk requirement: Never fail! Fall back to ASSISTED or HUMAN.
      executionMethod = 'HUMAN_CONCIERGE';

      // Check if request has structured intent/entities that AI can prepare
      const hasStructuredEntities = Boolean(
        params.extractedData?.destination ||
        params.extractedData?.location ||
        params.extractedData?.guests ||
        params.extractedData?.partySize ||
        params.extractedData?.dates ||
        params.extractedData?.dateTime ||
        params.extractedData?.scheduledTime ||
        params.extractedData?.budgetRange ||
        raw.includes('dinner') ||
        raw.includes('flight') ||
        raw.includes('hotel') ||
        raw.includes('table') ||
        raw.includes('for ') ||
        raw.includes('tomorrow') ||
        raw.includes('at ')
      );

      if (isExplicitManual) {
        tier = 'HUMAN';
        executionModeType = 'HUMAN_CONCIERGE_EXECUTION';
        reason = 'Member requested bespoke human concierge coordination.';
      } else if (hasStructuredEntities && !raw.includes('purely manual')) {
        tier = 'ASSISTED';
        executionModeType = 'ASSISTED_EXECUTION';
        reason = providerStatus !== 'AVAILABLE'
          ? `Provider automation (${candidateProvider}) is unconfigured in current wave. AI structured request context for Senior Concierge Desk.`
          : `Capability requires concierge placement or venue verification. AI prepared structured context for Senior Concierge Desk.`;
      } else {
        tier = 'HUMAN';
        executionModeType = 'HUMAN_CONCIERGE_EXECUTION';
        reason = 'Manual concierge execution: Direct Senior Concierge coordination without AI dependency.';
      }
    }

    // 5. Build prepared context for operator workspace
    const ext = params.extractedData || {};
    const preparedContext: PreparedContext = {
      category: capability.category.toLowerCase(),
      intent: ext.intent || (raw.length > 80 ? `${raw.slice(0, 77)}...` : raw),
      originalRequest: params.rawInput,
      dates: ext.scheduledTime || ext.dateTime || ext.dates || undefined,
      partySize: ext.guests || ext.partySize || undefined,
      budget: ext.budgetRange || ext.budgetAmount || undefined,
      location: ext.destination || ext.location || 'Ahmedabad',
      constraints: ext.constraints || {},
      preferences: params.preferences || {},
      aiResearchNotes: ext.notes || `Prepared context for ${capability.name}. Ready for operator review and execution.`,
      proposedOptionsCount: Array.isArray(ext.proposedOptions) ? ext.proposedOptions.length : 0,
    };

    // 6. Customer status message (Clean, confident, zero technical leaks)
    const customerStatusMessage = 'Your Proventa Concierge is handling this.';

    return {
      tier,
      executionMethod,
      executionModeType,
      requiresExternalTransaction,
      providerStatus,
      providerConsidered: candidateProvider,
      reason,
      customerStatusMessage,
      preparedContext,
    };
  }
}
