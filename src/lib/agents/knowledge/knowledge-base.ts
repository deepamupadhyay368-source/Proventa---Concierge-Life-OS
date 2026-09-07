import { AHMEDABAD_PLACES, type SeedProvider } from '@/data/ahmedabad-places';

export interface CityKnowledgeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  address?: string;
  phone?: string;
  bookingMethod: string;
  operatingProtocols?: string[];
  reliabilityScore: number;
}

export interface OperatingRule {
  domain: string;
  rule: string;
  leadTimeHours: number;
  autoApproveMaxINR?: number;
  mandatoryEscalationConditions?: string[];
}

export const PROVENTA_OPERATING_POLICIES: OperatingRule[] = [
  {
    domain: 'dining',
    rule: 'Agashiye and Heritage venues require minimum 4-hour advance reservation during peak weekend evenings.',
    leadTimeHours: 4,
    autoApproveMaxINR: 5000,
    mandatoryEscalationConditions: ['groups greater than 12', 'celebrity guest protocols', 'private heritage terrace hire'],
  },
  {
    domain: 'mobility',
    rule: 'SVPIA Luxury Chauffeur fleet requires 2-hour flight manifest verification prior to touchdown.',
    leadTimeHours: 2,
    autoApproveMaxINR: 2500,
    mandatoryEscalationConditions: ['armored vehicle request', 'interstate transit permits'],
  },
  {
    domain: 'travel',
    rule: 'ITC Narmada, Taj Skyline, and Leela Gandhinagar presidential suites require direct concierge liaison verification.',
    leadTimeHours: 24,
    autoApproveMaxINR: 0, // Always requires client approval
    mandatoryEscalationConditions: ['unauthorized high-value card spend', 'presidential suite buyout'],
  },
  {
    domain: 'home',
    rule: 'Private estate technicians dispatched only through vetted and verified Proventa Ahmedabad partners.',
    leadTimeHours: 1,
    autoApproveMaxINR: 2000,
    mandatoryEscalationConditions: ['structural safety hazard', 'gas line emergency'],
  },
];

export class AgentKnowledgeBase {
  /**
   * Search curated Ahmedabad knowledge base by category and query.
   */
  static searchKnowledge(params: {
    category?: string;
    query?: string;
    citySlug?: string;
  }): CityKnowledgeItem[] {
    const { category, query } = params;
    const catLower = (category || '').toLowerCase();
    const queryLower = (query || '').toLowerCase();

    let items = AHMEDABAD_PLACES.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.categorySlug,
      description: place.description,
      address: place.address,
      phone: place.phone,
      bookingMethod: place.bookingMethod,
      reliabilityScore: place.reliabilityScore,
    }));

    if (catLower) {
      items = items.filter((i) => i.category.toLowerCase().includes(catLower) || catLower.includes(i.category.toLowerCase()));
    }

    if (queryLower) {
      items = items.filter((i) =>
        i.name.toLowerCase().includes(queryLower) ||
        i.description.toLowerCase().includes(queryLower) ||
        (i.address && i.address.toLowerCase().includes(queryLower))
      );
    }

    return items;
  }

  /**
   * Fetch operating policy for domain.
   */
  static getOperatingPolicy(domain: string): OperatingRule | undefined {
    return PROVENTA_OPERATING_POLICIES.find(
      (p) => p.domain.toLowerCase() === domain.toLowerCase()
    );
  }
}
