import { CapabilityRegistry } from './capability-registry';
import type {
  ServiceCategory,
  ExecutionMode,
  TaskObjective,
  TaskDecision,
} from './types';

interface IntentInput {
  rawInput: string;
  category?: string;
  objective?: string;
  destination?: string;
  location?: string;
  partySize?: number;
  budgetRange?: string;
  executionRequired?: boolean;
}

export class TaskDecisionEngine {
  private static PROHIBITED_KEYWORDS = [
    'hack',
    'password',
    'credential',
    'illegal',
    'weapon',
    'drug',
    'narcotic',
    'counterfeit',
    'bypass kyc',
    'fake id',
    'unauthorized access',
    'steal',
  ];

  static evaluate(input: IntentInput): TaskDecision {
    const raw = input.rawInput.toLowerCase().trim();

    // 1. Safety & Legality Check
    const isProhibited = this.PROHIBITED_KEYWORDS.some((kw) => raw.includes(kw));
    if (isProhibited) {
      const cap = CapabilityRegistry.getCapability('OTHER_CONCIERGE');
      return {
        category: 'OTHER_CONCIERGE',
        objective: 'INQUIRE',
        capability: cap,
        executionMode: 'UNSUPPORTED',
        specialistAgent: cap.specialistAgent,
        approvalRequired: false,
        requiresHumanHandoff: false,
        isProhibited: true,
        explanation: 'This request involves prohibited, unauthorized, or unlawful actions that Proventa Concierge Life OS cannot legitimately fulfill.',
        suggestedAction: 'Please submit lawful concierge requests related to dining, travel, mobility, lifestyle, or family office logistics.',
      };
    }

    // 2. Classify Category
    const category = this.classifyCategory(raw, input.category);
    const capability = CapabilityRegistry.getCapability(category);

    // 3. Classify Objective
    const objective = this.classifyObjective(raw, input.objective);

    // 4. Determine Execution Mode
    let executionMode: ExecutionMode;
    let approvalRequired = false;
    let requiresHumanHandoff = false;
    let explanation = '';

    const isExplicitBooking =
      objective === 'BOOK' ||
      objective === 'ARRANGE' ||
      input.executionRequired === true ||
      raw.startsWith('book ') ||
      raw.includes('book me') ||
      raw.includes('arrange a') ||
      raw.includes('arrange the reservation') ||
      raw.includes('call the restaurant') ||
      raw.includes('call and ask') ||
      raw.includes('buy me');

    if (!isExplicitBooking || objective === 'RESEARCH' || objective === 'COMPARE') {
      // Advisory / Research Mode
      executionMode = 'AI_RESEARCH';
      approvalRequired = false;
      requiresHumanHandoff = false;
      explanation = `Research and curation mode: Sourcing verified ${capability.name.toLowerCase()} for member review.`;
    } else {
      // Execution Mode requested
      approvalRequired = capability.customerApprovalRequired;

      if (raw.includes('call') || raw.includes('specific table') || raw.includes('offline')) {
        // Explicit phone / human concierge mandate
        executionMode = 'HUMAN_CONCIERGE';
        requiresHumanHandoff = true;
        explanation = `Human Concierge execution: Request requires bespoke coordination with venue desk via Senior Concierge.`;
      } else if (capability.executionMode === 'PROVIDER_API' && capability.liveProviderAvailable) {
        // Automated provider API available
        executionMode = 'PROVIDER_API';
        requiresHumanHandoff = false;
        explanation = `Automated API execution: Verified live inventory connector available for ${capability.name}. Consequential booking gated behind explicit member approval.`;
      } else if (capability.humanConciergeAvailable) {
        // Fallback to Human Concierge
        executionMode = 'HUMAN_CONCIERGE';
        requiresHumanHandoff = true;
        explanation = `Human Concierge execution: Automated booking provider not configured for this category in Wave 1. Handed off to Senior Concierge Desk with full call sheet upon member approval.`;
      } else {
        executionMode = 'UNSUPPORTED';
        explanation = `Capability not currently available for automated or concierge execution in Wave 1.`;
      }
    }

    return {
      category,
      objective,
      capability,
      executionMode,
      specialistAgent: capability.specialistAgent,
      approvalRequired,
      requiresHumanHandoff,
      isProhibited: false,
      explanation,
    };
  }

  private static classifyCategory(raw: string, hint?: string): ServiceCategory {
    if (hint) {
      const normalized = hint.toUpperCase().replace(/[\s-]/g, '_') as ServiceCategory;
      const validCategories: ServiceCategory[] = [
        'DINING',
        'TRAVEL',
        'HOTELS',
        'TRANSPORT',
        'FOOD_DELIVERY',
        'MOVIES_ENTERTAINMENT',
        'GIFTS',
        'SHOPPING',
        'SALON_WELLNESS',
        'APPOINTMENTS',
        'EVENTS',
        'WEEKEND_ESCAPES',
        'RESEARCH_PLANNING',
        'OTHER_CONCIERGE',
      ];
      if (validCategories.includes(normalized)) return normalized;
    }

    // Heuristic Classification
    if (raw.includes('weekend getaway') || raw.includes('plan my entire weekend') || raw.includes('weekend escape')) {
      return 'WEEKEND_ESCAPES';
    }
    if (raw.includes('compare three hotels') || raw.includes('compare hotels') || raw.includes('market survey') || raw.includes('research') || raw.includes('itinerary') || raw.includes('plan a ') || raw.includes('planning')) {
      return 'RESEARCH_PLANNING';
    }
    if (raw.includes('hotel') || raw.includes('suite') || raw.includes('villa') || raw.includes('resort') || raw.includes('stay')) {
      return 'HOTELS';
    }
    if (raw.includes('flight') || raw.includes('airline') || raw.includes('airfare') || raw.includes('fly') || raw.includes('pnr') || raw.includes('aviation')) {
      return 'TRAVEL';
    }
    if (raw.includes('dinner') || raw.includes('restaurant') || raw.includes('table for') || raw.includes('dining') || raw.includes('lunch') || raw.includes('agashiye')) {
      return 'DINING';
    }
    if (raw.includes('cab') || raw.includes('sedan') || raw.includes('chauffeur') || raw.includes('pickup') || raw.includes('airport transfer') || raw.includes('car')) {
      return 'TRANSPORT';
    }
    if (raw.includes('food delivery') || raw.includes('swiggy') || raw.includes('order dinner to') || raw.includes('delivery')) {
      return 'FOOD_DELIVERY';
    }
    if (raw.includes('movie') || raw.includes('cinema') || raw.includes('imax') || raw.includes('pvr') || raw.includes('inox') || raw.includes('showtime')) {
      return 'MOVIES_ENTERTAINMENT';
    }
    if (raw.includes('birthday gift') || raw.includes('gift under') || raw.includes('flowers') || raw.includes('hampers')) {
      return 'GIFTS';
    }
    if (raw.includes('shop') || raw.includes('stole') || raw.includes('bandhej') || raw.includes('watch') || raw.includes('luxury buy') || raw.includes('procure')) {
      return 'SHOPPING';
    }
    if (raw.includes('salon') || raw.includes('spa') || raw.includes('massage') || raw.includes('haircut') || raw.includes('wellness')) {
      return 'SALON_WELLNESS';
    }
    if (raw.includes('appointment') || raw.includes('doctor') || raw.includes('dentist') || raw.includes('consultation')) {
      return 'APPOINTMENTS';
    }
    if (raw.includes('concert') || raw.includes('tickets to') || raw.includes('exhibition') || raw.includes('galas') || raw.includes('event')) {
      return 'EVENTS';
    }

    return 'OTHER_CONCIERGE';
  }

  private static classifyObjective(raw: string, hint?: string): TaskObjective {
    if (hint) {
      const normalized = hint.toUpperCase() as TaskObjective;
      const valid: TaskObjective[] = ['BOOK', 'SEARCH', 'RECOMMEND', 'RESEARCH', 'COMPARE', 'CANCEL', 'INQUIRE', 'ARRANGE'];
      if (valid.includes(normalized)) return normalized;
    }

    if (raw.includes('compare')) return 'COMPARE';
    if (raw.includes('cancel')) return 'CANCEL';
    if (raw.includes('book') || raw.includes('reserve')) return 'BOOK';
    if (raw.includes('arrange') || raw.includes('call the') || raw.includes('schedule')) return 'ARRANGE';
    if (raw.includes('find me') || raw.includes('search') || raw.includes('where can')) return 'SEARCH';
    if (raw.includes('recommend') || raw.includes('best ') || raw.includes('nice ')) return 'RECOMMEND';
    if (raw.includes('research') || raw.includes('tell me about')) return 'RESEARCH';

    return 'INQUIRE';
  }
}
