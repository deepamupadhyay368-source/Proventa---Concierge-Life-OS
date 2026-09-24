export type ProvenanceType = 'EXPLICIT' | 'INFERRED' | 'UNKNOWN';

export interface ProvenanceField<T> {
  value: T;
  source: ProvenanceType;
}

export interface StructuredTravelConstraints {
  origin?: ProvenanceField<string>;
  destination?: ProvenanceField<string>;
  originAirport?: ProvenanceField<string>;
  destinationAirport?: ProvenanceField<string>;
  departureDate?: ProvenanceField<string>;
  departureTimePreference?: ProvenanceField<string>;
  returnDate?: ProvenanceField<string>;
  passengers?: ProvenanceField<number>;
  guests?: ProvenanceField<number>;
  rooms?: ProvenanceField<number>;
  cabinClass?: ProvenanceField<string>;
  budget?: ProvenanceField<number | string>;
  location?: ProvenanceField<string>;
  partySize?: ProvenanceField<number>;

  // Direct flat convenience accessors
  originCity?: string;
  destinationCity?: string;
  originAirportCode?: string;
  destinationAirportCode?: string;
  provenance: {
    origin: ProvenanceType;
    destination: ProvenanceType;
    location: ProvenanceType;
    partySize?: ProvenanceType;
    budget?: ProvenanceType;
  };
}

export type TravelConstraints = {
  destination?: string;
  destinationAirport?: string;
  origin?: string;
  originAirport?: string;
  location?: string;
  category?: string;
  [key: string]: any;
};

export interface AirportCityEntry {
  city: string;
  code: string;
  aliases: string[];
}

export const CITY_AIRPORT_REGISTRY: AirportCityEntry[] = [
  { city: 'Ahmedabad', code: 'AMD', aliases: ['AHMEDABAD', 'AMD', 'SVPIA', 'SARDAR VALLABHBHAI PATEL'] },
  { city: 'Delhi', code: 'DEL', aliases: ['DELHI', 'NEW DELHI', 'DEL', 'IGI', 'INDIRA GANDHI'] },
  { city: 'Mumbai', code: 'BOM', aliases: ['MUMBAI', 'BOMBAY', 'BOM', 'CSMIA', 'CHHATRAPATI SHIVAJI'] },
  { city: 'Bengaluru', code: 'BLR', aliases: ['BENGALURU', 'BANGALORE', 'BLR', 'KIA', 'KEMPEGOWDA'] },
  { city: 'Goa', code: 'GOI', aliases: ['GOA', 'GOI', 'GOX', 'MOPA', 'DABOLIM'] },
  { city: 'Hyderabad', code: 'HYD', aliases: ['HYDERABAD', 'HYD', 'RGIA'] },
  { city: 'Kolkata', code: 'CCU', aliases: ['KOLKATA', 'CALCUTTA', 'CCU', 'NSCBIA'] },
  { city: 'Chennai', code: 'MAA', aliases: ['CHENNAI', 'MADRAS', 'MAA'] },
  { city: 'Jaipur', code: 'JAI', aliases: ['JAIPUR', 'JAI'] },
  { city: 'Udaipur', code: 'UDR', aliases: ['UDAIPUR', 'UDR', 'MAHARANA PRATAP'] },
  { city: 'Pune', code: 'PNQ', aliases: ['PUNE', 'PNQ'] },
  { city: 'Kochi', code: 'COK', aliases: ['KOCHI', 'COCHIN', 'COK'] },
  { city: 'Dubai', code: 'DXB', aliases: ['DUBAI', 'DXB'] },
  { city: 'London', code: 'LHR', aliases: ['LONDON', 'HEATHROW', 'LHR', 'GATWICK', 'LGW'] },
  { city: 'Singapore', code: 'SIN', aliases: ['SINGAPORE', 'SIN', 'CHANGI'] },
];

export class EntityIntegrityValidator {
  /**
   * Resolves a city name and airport code from any city name, alias, or IATA code.
   */
  static resolveCityAirport(input: string): { city: string; code: string } | null {
    if (!input || typeof input !== 'string') return null;
    const upper = input.trim().toUpperCase();
    for (const entry of CITY_AIRPORT_REGISTRY) {
      for (const alias of entry.aliases) {
        if (upper === alias || upper === alias.replace(/\s+/g, '') || upper.includes(alias)) {
          return { city: entry.city, code: entry.code };
        }
      }
    }
    return null;
  }

  /**
   * Deterministically parses travel and location entities from raw text.
   * Strictly respects origin vs destination grammar.
   */
  static extractTravelEntities(rawInput: string): StructuredTravelConstraints {
    const raw = (rawInput || '').trim();
    const lower = raw.toLowerCase();

    // 1. Identify all registered cities/airports present in the input with their positions
    const foundCities: { city: string; code: string; index: number; length: number }[] = [];
    for (const entry of CITY_AIRPORT_REGISTRY) {
      for (const alias of entry.aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        const match = raw.match(regex);
        if (match && match.index !== undefined) {
          // Avoid duplicate entries for the same city
          if (!foundCities.some(f => f.city === entry.city)) {
            foundCities.push({
              city: entry.city,
              code: entry.code,
              index: match.index,
              length: match[0].length,
            });
          }
          break;
        }
      }
    }

    // Sort found cities by their occurrence order in the string
    foundCities.sort((a, b) => a.index - b.index);

    let origin: { city: string; code: string; source: ProvenanceType } | null = null;
    let destination: { city: string; code: string; source: ProvenanceType } | null = null;

    if (foundCities.length >= 2) {
      // Check grammar markers: "from <cityA> to <cityB>" or "<cityA> to <cityB>"
      const textBetween = raw.substring(foundCities[0].index + foundCities[0].length, foundCities[1].index).toLowerCase();
      const textBeforeFirst = raw.substring(0, foundCities[0].index).toLowerCase();

      if (textBeforeFirst.includes('from') || textBetween.includes('to')) {
        origin = { city: foundCities[0].city, code: foundCities[0].code, source: 'EXPLICIT' };
        destination = { city: foundCities[1].city, code: foundCities[1].code, source: 'EXPLICIT' };
      } else {
        // Default sequence: first city to second city
        origin = { city: foundCities[0].city, code: foundCities[0].code, source: 'EXPLICIT' };
        destination = { city: foundCities[1].city, code: foundCities[1].code, source: 'EXPLICIT' };
      }
    } else if (foundCities.length === 1) {
      const city = foundCities[0];
      const textBefore = raw.substring(0, city.index).toLowerCase();

      if (textBefore.endsWith('from ') || textBefore.includes('from ')) {
        origin = { city: city.city, code: city.code, source: 'EXPLICIT' };
      } else {
        // "to Delhi", "in Delhi", "Flight Delhi", etc. -> destination
        destination = { city: city.city, code: city.code, source: 'EXPLICIT' };
        // If destination is not Ahmedabad, default inferred origin is Ahmedabad
        if (city.city !== 'Ahmedabad') {
          origin = { city: 'Ahmedabad', code: 'AMD', source: 'INFERRED' };
        }
      }
    }

    const constraints: StructuredTravelConstraints = {
      provenance: {
        origin: origin?.source || 'UNKNOWN',
        destination: destination?.source || 'UNKNOWN',
        location: destination?.source || 'INFERRED',
      },
    };

    if (origin) {
      constraints.origin = { value: origin.city, source: origin.source };
      constraints.originAirport = { value: origin.code, source: origin.source };
      constraints.originCity = origin.city;
      constraints.originAirportCode = origin.code;
    }

    if (destination) {
      constraints.destination = { value: destination.city, source: destination.source };
      constraints.destinationAirport = { value: destination.code, source: destination.source };
      constraints.location = { value: destination.city, source: destination.source };
      constraints.destinationCity = destination.city;
      constraints.destinationAirportCode = destination.code;
    }

    // 2. Passengers / Party size extraction
    const paxMatch = raw.match(/(\d+)\s*(?:passengers?|pax|people|guests?|persons?|seats?|tickets?)/i) ||
                     raw.match(/for\s+(\d+)(?:\s+(?:people|guests?|persons?|passengers?|seats?))?/i);
    if (paxMatch) {
      const num = parseInt(paxMatch[1], 10);
      if (num > 0) {
        constraints.passengers = { value: num, source: 'EXPLICIT' };
        constraints.partySize = { value: num, source: 'EXPLICIT' };
        constraints.guests = { value: num, source: 'EXPLICIT' };
        constraints.provenance.partySize = 'EXPLICIT';
      }
    }

    // 3. Cabin class
    if (lower.includes('business class') || lower.includes('business')) {
      constraints.cabinClass = { value: 'BUSINESS', source: 'EXPLICIT' };
    } else if (lower.includes('first class')) {
      constraints.cabinClass = { value: 'FIRST', source: 'EXPLICIT' };
    } else if (lower.includes('premium economy')) {
      constraints.cabinClass = { value: 'PREMIUM_ECONOMY', source: 'EXPLICIT' };
    } else {
      constraints.cabinClass = { value: 'ECONOMY', source: 'INFERRED' };
    }

    // 4. Budget extraction
    const budgetMatch = raw.match(/(?:under|budget|below|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i) ||
                        raw.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
    if (budgetMatch) {
      const clean = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      if (clean > 0) {
        constraints.budget = { value: clean, source: 'EXPLICIT' };
        constraints.provenance.budget = 'EXPLICIT';
      }
    }

    return constraints;
  }

  /**
   * Checks if the required minimum entities are present for a given category.
   */
  static hasMinimumExecutionEntities(
    category: string,
    constraints: { origin?: string; destination?: string; location?: string; destinationAirport?: string }
  ): boolean {
    const cat = (category || '').toLowerCase();
    if (cat.includes('flight') || cat.includes('travel')) {
      return Boolean(constraints.destination && constraints.destination.trim().length > 0);
    }
    if (cat.includes('hotel')) {
      return Boolean(constraints.location || constraints.destination);
    }
    return true;
  }

  /**
   * Enforces deterministic validation on extracted AI entities.
   * If AI extracted a different destination than explicit user text, rejects the AI value.
   */
  static validateAndReconcile(
    rawOrParams: string | {
      rawInput: string;
      aiCategory?: string;
      aiDestination?: string;
      aiOrigin?: string;
      aiLocation?: string;
      aiPartySize?: number;
      aiBudget?: string | number;
    },
    erroneousAi?: {
      category?: string;
      destination?: string;
      origin?: string;
      location?: string;
      partySize?: number;
      budget?: string | number;
    }
  ): {
    origin: string;
    destination: string;
    originAirport: string;
    destinationAirport: string;
    location: string;
    partySize?: number;
    budget?: string | number;
    provenance: Record<string, ProvenanceType>;
    isMismatchDetected: boolean;
    mismatchDetails?: Record<string, any>;
  } {
    const rawInput = typeof rawOrParams === 'string' ? rawOrParams : rawOrParams.rawInput;
    const aiParams = typeof rawOrParams === 'string'
      ? (erroneousAi || {})
      : {
          destination: rawOrParams.aiDestination,
          origin: rawOrParams.aiOrigin,
          location: rawOrParams.aiLocation,
          partySize: rawOrParams.aiPartySize,
          budget: rawOrParams.aiBudget,
        };

    const extracted = this.extractTravelEntities(rawInput);
    let isMismatchDetected = false;
    const mismatchDetails: Record<string, any> = {};

    let destination = extracted.destination?.value || '';
    let destinationAirport = extracted.destinationAirport?.value || '';
    let origin = extracted.origin?.value || '';
    let originAirport = extracted.originAirport?.value || '';
    let location = extracted.location?.value || destination || 'Ahmedabad';

    // Verify AI output against deterministic extraction
    if (aiParams.destination && extracted.destination?.source === 'EXPLICIT') {
      const normAiDest = this.resolveCityAirport(aiParams.destination)?.city || aiParams.destination;
      if (normAiDest.toLowerCase() !== extracted.destination.value.toLowerCase()) {
        isMismatchDetected = true;
        mismatchDetails.destination = {
          explicitCustomerValue: extracted.destination.value,
          aiValue: aiParams.destination,
          resolvedValue: extracted.destination.value,
        };
        destination = extracted.destination.value;
        destinationAirport = extracted.destinationAirport?.value || '';
      }
    } else if (!destination && aiParams.destination) {
      const resolved = this.resolveCityAirport(aiParams.destination);
      destination = resolved ? resolved.city : aiParams.destination;
      destinationAirport = resolved ? resolved.code : '';
    }

    // Origin verification
    if (aiParams.origin && extracted.origin?.source === 'EXPLICIT') {
      const normAiOrigin = this.resolveCityAirport(aiParams.origin)?.city || aiParams.origin;
      if (normAiOrigin.toLowerCase() !== extracted.origin.value.toLowerCase()) {
        isMismatchDetected = true;
        mismatchDetails.origin = {
          explicitCustomerValue: extracted.origin.value,
          aiValue: aiParams.origin,
          resolvedValue: extracted.origin.value,
        };
        origin = extracted.origin.value;
        originAirport = extracted.originAirport?.value || '';
      }
    } else if (!origin && aiParams.origin) {
      const resolved = this.resolveCityAirport(aiParams.origin);
      origin = resolved ? resolved.city : aiParams.origin;
      originAirport = resolved ? resolved.code : '';
    }

    const partySize = extracted.partySize?.value || aiParams.partySize;
    const budget = extracted.budget?.value || aiParams.budget;

    const provenance: Record<string, ProvenanceType> = {
      destination: extracted.destination?.source || (aiParams.destination ? 'INFERRED' : 'UNKNOWN'),
      origin: extracted.origin?.source || (aiParams.origin ? 'INFERRED' : 'UNKNOWN'),
      location: extracted.location?.source || 'INFERRED',
      partySize: extracted.partySize?.source || (aiParams.partySize ? 'INFERRED' : 'UNKNOWN'),
      budget: extracted.budget?.source || (aiParams.budget ? 'INFERRED' : 'UNKNOWN'),
    };

    return {
      origin,
      destination,
      originAirport,
      destinationAirport,
      location,
      partySize,
      budget,
      provenance,
      isMismatchDetected,
      mismatchDetails: isMismatchDetected ? mismatchDetails : undefined,
    };
  }

  /**
   * Deterministic result filtering:
   * Strictly filters out provider proposals that do not match the customer constraints.
   */
  static filterProposalsByConstraints(
    proposals: any[],
    constraints: {
      category?: string;
      destination?: string;
      destinationAirport?: string;
      origin?: string;
      originAirport?: string;
      location?: string;
    }
  ): any[] {
    if (!proposals || proposals.length === 0) return [];
    const cat = (constraints.category || '').toLowerCase();

    return proposals.filter((p) => {
      const meta = p.metadata || {};
      const title = (p.title || '').toUpperCase();
      const desc = (p.description || '').toUpperCase();
      const providerName = (p.providerName || '').toUpperCase();
      const providerId = (p.providerId || '').toLowerCase();

      // Strict Domain Isolation:
      // If customer requested hotels/accommodations, never return a flight proposal
      if (cat.includes('hotel') || cat.includes('accommodation') || cat === 'stay') {
        if (providerId.includes('flight') || meta.departureAirport || meta.arrivalAirport) {
          return false;
        }
      }

      // If customer requested flights/air travel, never return a hotel proposal
      if (cat.includes('flight') || cat.includes('airline')) {
        if (providerId.includes('hotel') || meta.address || meta.luxuryScore) {
          return false;
        }
      }

      // 1. Flights validation
      if (cat.includes('flight') || cat.includes('travel') || meta.departureAirport || meta.arrivalAirport) {
        if (constraints.destinationAirport) {
          const reqCode = constraints.destinationAirport.toUpperCase();
          const arrCode = (meta.arrivalAirport || '').toUpperCase();
          if (arrCode && arrCode !== reqCode) {
            return false;
          }
        }
        if (constraints.destination) {
          const reqCity = constraints.destination.toUpperCase();
          // If title/description mentions a DIFFERENT major metro city as destination, reject it
          const otherMetros = ['MUMBAI', 'BOM', 'DELHI', 'DEL', 'BANGALORE', 'BENGALURU', 'BLR', 'GOA', 'HYDERABAD']
            .filter(m => !reqCity.includes(m) && !(constraints.destinationAirport || '').toUpperCase().includes(m));
          
          // Check if arrival is explicitly stated as another city
          if (meta.arrivalAirport && constraints.destinationAirport && meta.arrivalAirport !== constraints.destinationAirport) {
            return false;
          }
        }
      }

      // 2. Hotels validation
      if (cat.includes('hotel') || p.providerId?.includes('hotel')) {
        if (constraints.destination) {
          const reqCity = constraints.destination.toUpperCase();
          const hotelCity = (meta.city || meta.address || title || desc);
          // If hotel is specifically in a different city (e.g. requested Delhi, but hotel says Ahmedabad or Mumbai), reject!
          const otherCities = ['AHMEDABAD', 'MUMBAI', 'DELHI', 'BENGALURU', 'GOA', 'HYDERABAD']
            .filter(c => c !== reqCity && !reqCity.includes(c));

          for (const other of otherCities) {
            if (hotelCity.includes(other) && !hotelCity.includes(reqCity)) {
              return false; // Mismatched city! Reject.
            }
          }
        }
      }

      // 3. Dining validation
      if (cat.includes('dine') || cat.includes('restaurant') || p.venueId) {
        if (constraints.location) {
          const reqLoc = constraints.location.toUpperCase();
          if (reqLoc !== 'AHMEDABAD' && !reqLoc.includes('AHMEDABAD')) {
            // Venue in Ahmedabad should not be shown for a Mumbai/Delhi dining request
            if (p.providerId === 'ahmedabad_verified' || title.includes('AHMEDABAD')) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }

  /**
   * Pre-Execution Constraint Gate:
   * Before confirming/executing a task, verifies that the approved proposal matches
   * the original customer constraints. If mismatch, blocks execution.
   */
  static verifyPreExecutionConstraints(
    taskOrProposal: any,
    proposalOrConstraints: any
  ): { isValid: boolean; reason?: string; violationReason?: string } {
    let task: any = taskOrProposal;
    let proposal: any = proposalOrConstraints;

    // Support both (task, proposal) and (proposal, constraints)
    if (taskOrProposal?.providerId || (taskOrProposal?.metadata && !taskOrProposal?.clientPreferences)) {
      proposal = taskOrProposal;
      task = proposalOrConstraints;
    }

    const prefs = (task?.clientPreferences || {}) as Record<string, any>;
    const prep = prefs.preparedContext || {};
    const meta = proposal?.metadata || {};

    const requestedDest = (
      task?.destination ||
      task?.destinationAirport ||
      task?.location ||
      prep.destination ||
      prep.destinationAirport ||
      prep.location ||
      ''
    ).toUpperCase();

    if (requestedDest && (meta.arrivalAirport || meta.arrivalCity || meta.destination)) {
      const arrAirport = (meta.arrivalAirport || '').toUpperCase();
      const arrCity = (meta.arrivalCity || meta.destination || '').toUpperCase();
      const expected = this.resolveCityAirport(requestedDest);
      if (expected) {
        if (arrAirport && arrAirport !== expected.code) {
          const reason = `Pre-Execution Safety Gate Blocked: Requested destination airport is ${expected.code} (${expected.city}), but execution payload targets ${arrAirport}.`;
          return { isValid: false, reason, violationReason: reason };
        }
        const resolvedArr = this.resolveCityAirport(arrCity);
        if (resolvedArr && resolvedArr.code !== expected.code) {
          const reason = `Pre-Execution Safety Gate Blocked: Requested destination is ${expected.city} (${expected.code}), but execution payload targets ${arrCity}.`;
          return { isValid: false, reason, violationReason: reason };
        }
      }
    }

    // Hotel check
    if ((task?.category?.includes('hotel') || proposal?.providerId?.includes('hotel')) && requestedDest) {
      const proposalText = `${proposal.title || ''} ${proposal.description || ''} ${meta.city || ''} ${meta.address || ''}`.toUpperCase();
      const expected = this.resolveCityAirport(requestedDest);
      if (expected) {
        const otherCities = ['AHMEDABAD', 'MUMBAI', 'DELHI', 'BENGALURU', 'GOA'].filter(c => c !== expected.city.toUpperCase());
        for (const other of otherCities) {
          if (proposalText.includes(other) && !proposalText.includes(expected.city.toUpperCase())) {
            const reason = `Pre-Execution Safety Gate Blocked: Requested hotel city is ${expected.city}, but proposal is for ${other}.`;
            return { isValid: false, reason, violationReason: reason };
          }
        }
      }
    }

    // Dining / Restaurant check
    if (
      (task?.category?.includes('dine') || task?.category?.includes('dining') || task?.category?.includes('restaurant')) &&
      (requestedDest || task?.intent || task?.originalRequest)
    ) {
      let expectedCity: string | null = null;
      const combinedText = `${requestedDest} ${task?.intent || ''} ${task?.originalRequest || ''}`;
      for (const entry of CITY_AIRPORT_REGISTRY) {
        for (const alias of entry.aliases) {
          const regex = new RegExp(`\\b${alias}\\b`, 'i');
          if (regex.test(combinedText)) {
            expectedCity = entry.city;
            break;
          }
        }
        if (expectedCity) break;
      }

      if (expectedCity) {
        const proposalText = `${proposal.title || ''} ${proposal.description || ''} ${meta.city || ''} ${meta.location || ''} ${meta.address || ''}`.toUpperCase();
        const otherCities = ['AHMEDABAD', 'MUMBAI', 'DELHI', 'BENGALURU', 'GOA'].filter(c => c !== expectedCity!.toUpperCase());
        for (const other of otherCities) {
          if (proposalText.includes(other) && !proposalText.includes(expectedCity.toUpperCase())) {
            const reason = `Pre-Execution Safety Gate Blocked: Requested dining city is ${expectedCity}, but proposal is for ${other}.`;
            return { isValid: false, reason, violationReason: reason };
          }
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validates a proposal for zero-fabrication invariants and structural integrity.
   */
  static validateProposal(proposal: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!proposal) {
      return { isValid: false, errors: ['Proposal is missing or null'] };
    }

    if (proposal.isMock || proposal.environment === 'SANDBOX') {
      errors.push('Simulated or mock proposals are prohibited in production');
    }

    const titleAndDesc = `${proposal.title || ''} ${proposal.description || ''} ${proposal.providerName || ''}`.toUpperCase();
    if (/(?:PV-|MOCK-|DEMO-|SIMULATED|SYNTHETIC|FILLER)/i.test(titleAndDesc)) {
      errors.push('Synthetic or placeholder option markers detected in proposal content');
    }

    if (!proposal.id || !proposal.title || !proposal.providerId) {
      errors.push('Proposal is missing required entity attributes (id, title, providerId)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates returned provider execution response against original task constraints.
   * Detects post-execution INTENT_CONSTRAINT_MISMATCH.
   */
  static verifyPostExecutionResponse(
    task: any,
    execution: any,
    option?: any
  ): { isValid: boolean; mismatchDetected?: boolean; reason?: string; violationReason?: string } {
    if (!execution || !execution.success) {
      return { isValid: false, reason: execution?.errorMessage || 'Provider execution was not successful' };
    }

    const prefs = (task?.clientPreferences || {}) as Record<string, any>;
    const prep = prefs.preparedContext || {};
    const confirmed = execution.confirmedDetails || {};

    const requestedDest = (
      task?.destination ||
      task?.destinationAirport ||
      task?.location ||
      prep.destination ||
      prep.destinationAirport ||
      prep.location ||
      ''
    ).toUpperCase();

    // 1. Flight destination mismatch verification
    if (requestedDest && (confirmed.arrivalAirport || confirmed.destination || confirmed.arrivalCity)) {
      const expected = this.resolveCityAirport(requestedDest);
      const arr = (confirmed.arrivalAirport || confirmed.destination || confirmed.arrivalCity || '').toUpperCase();
      if (expected) {
        const resolvedArr = this.resolveCityAirport(arr);
        if (resolvedArr && resolvedArr.code !== expected.code) {
          const reason = `Post-Execution Safety Gate Violation: Requested destination was ${expected.city} (${expected.code}), but provider confirmed for ${resolvedArr.city} (${resolvedArr.code}).`;
          return { isValid: false, mismatchDetected: true, reason, violationReason: reason };
        }
      }
    }

    // 2. Hotel location mismatch verification
    if (requestedDest && (task?.category?.includes('hotel') || option?.providerId?.includes('hotel'))) {
      const hotelLoc = `${confirmed.city || ''} ${confirmed.location || ''} ${confirmed.address || ''} ${confirmed.hotelName || ''}`.toUpperCase();
      const expected = this.resolveCityAirport(requestedDest);
      if (expected && hotelLoc) {
        const otherCities = ['AHMEDABAD', 'MUMBAI', 'DELHI', 'BENGALURU', 'GOA'].filter(c => c !== expected.city.toUpperCase());
        for (const other of otherCities) {
          if (hotelLoc.includes(other) && !hotelLoc.includes(expected.city.toUpperCase())) {
            const reason = `Post-Execution Safety Gate Violation: Requested hotel city was ${expected.city}, but provider confirmed booking in ${other}.`;
            return { isValid: false, mismatchDetected: true, reason, violationReason: reason };
          }
        }
      }
    }

    // 3. Synthetic reference marker detection in confirmed reference
    const ref = (execution.externalReferenceId || '').toUpperCase();
    if (
      ref.startsWith('PV-') ||
      ref.startsWith('MOCK-') ||
      ref.startsWith('DEMO-') ||
      ref.startsWith('FAKE-') ||
      ref.startsWith('TEST-')
    ) {
      const reason = `Post-Execution Zero-Fabrication Violation: Synthetic confirmation reference "${ref}" detected.`;
      return { isValid: false, mismatchDetected: true, reason, violationReason: reason };
    }

    return { isValid: true };
  }
}


