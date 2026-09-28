/**
 * PROVENTA — CANONICAL CITY RESOLVER & MULTI-CITY PARSER
 * Provides robust city normalization, alias resolution, and multi-city parsing.
 */

export interface CityMetadata {
  canonicalName: string;
  state: string;
  country: string;
  timezone: string;
  aliases: string[];
}

export const CANONICAL_CITY_REGISTRY: Record<string, CityMetadata> = {
  Ahmedabad: {
    canonicalName: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['AHMEDABAD', 'AMD', 'AMDAVAD', 'AHMEDABAD CITY', 'SABARMATI'],
  },
  Mumbai: {
    canonicalName: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['MUMBAI', 'BOMBAY', 'BOM', 'BOMBAY CITY', 'SOUTH MUMBAI', 'BKC', 'BANDRA', 'NAVI MUMBAI'],
  },
  Delhi: {
    canonicalName: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['DELHI', 'NEW DELHI', 'DEL', 'NCR', 'GURGAON', 'GURUGRAM', 'NOIDA', 'SOUTH DELHI'],
  },
  Bengaluru: {
    canonicalName: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['BENGALURU', 'BANGALORE', 'BLR', 'BENGALURU CITY', 'WHITEFIELD', 'KORAMANGALA', 'INDIRANAGAR'],
  },
  Hyderabad: {
    canonicalName: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['HYDERABAD', 'HYD', 'SECUNDERABAD', 'CYBERABAD', 'HITECH CITY', 'JUBILEE HILLS'],
  },
  Pune: {
    canonicalName: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['PUNE', 'POONA', 'PNQ', 'KOREGAON PARK', 'BANER', 'VIMAN NAGAR'],
  },
  Chennai: {
    canonicalName: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['CHENNAI', 'MADRAS', 'MAA', 'ADYAR', 'NUNGAMBAKKAM'],
  },
  Kolkata: {
    canonicalName: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['KOLKATA', 'CALCUTTA', 'CCU', 'SALT LAKE', 'PARK STREET'],
  },
  Jaipur: {
    canonicalName: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['JAIPUR', 'JAI', 'PINK CITY'],
  },
  Goa: {
    canonicalName: 'Goa',
    state: 'Goa',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['GOA', 'NORTH GOA', 'SOUTH GOA', 'PANJIM', 'PANAJI', 'VAGATOR', 'ANJUNA', 'CANDOLIM'],
  },
  Surat: {
    canonicalName: 'Surat',
    state: 'Gujarat',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['SURAT', 'STV'],
  },
  Vadodara: {
    canonicalName: 'Vadodara',
    state: 'Gujarat',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['VADODARA', 'BARODA', 'BDQ'],
  },
  Udaipur: {
    canonicalName: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['UDAIPUR', 'UDR', 'CITY OF LAKES'],
  },
  Chandigarh: {
    canonicalName: 'Chandigarh',
    state: 'Punjab/Haryana',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['CHANDIGARH', 'IXC', 'TRI-CITY', 'MOHALI', 'PANCHKULA'],
  },
  Kochi: {
    canonicalName: 'Kochi',
    state: 'Kerala',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['KOCHI', 'COCHIN', 'COK', 'ERNAKULAM', 'FORT KOCHI'],
  },
  Lucknow: {
    canonicalName: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['LUCKNOW', 'LKO'],
  },
  Indore: {
    canonicalName: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    timezone: 'Asia/Kolkata',
    aliases: ['INDORE', 'IDR'],
  },
};

export class CityResolver {
  /**
   * Resolves a raw input string or city mention to its canonical city name.
   * If the city is known, returns the canonical name.
   * If it is an unlisted legitimate city, normalizes capitalization and returns it cleanly.
   */
  static normalizeCity(cityInput: string | undefined | null): string {
    if (!cityInput || typeof cityInput !== 'string') return 'Ahmedabad';
    const clean = cityInput.trim();
    if (!clean) return 'Ahmedabad';

    const upper = clean.toUpperCase();

    // Direct match or alias check in canonical registry
    for (const [canonical, meta] of Object.entries(CANONICAL_CITY_REGISTRY)) {
      if (upper === canonical.toUpperCase()) return canonical;
      for (const alias of meta.aliases) {
        if (upper === alias || upper === alias.replace(/\s+/g, '')) {
          return canonical;
        }
      }
    }

    // Capitalize arbitrary legitimate city (e.g. "varanasi" -> "Varanasi", "mysuru" -> "Mysuru")
    return clean
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Extracts one or more cities mentioned in a user prompt.
   * Handles multi-city queries like "Find events in Ahmedabad or Mumbai on 20 October".
   */
  static extractCities(rawInput: string): { primaryCity: string; allCities: string[]; isMultiCity: boolean } {
    if (!rawInput || typeof rawInput !== 'string') {
      return { primaryCity: 'Ahmedabad', allCities: ['Ahmedabad'], isMultiCity: false };
    }

    const raw = rawInput.trim();
    const found: { city: string; index: number; length: number }[] = [];

    // Scan for all registered cities/aliases
    for (const [canonical, meta] of Object.entries(CANONICAL_CITY_REGISTRY)) {
      for (const alias of meta.aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        const match = raw.match(regex);
        if (match && match.index !== undefined) {
          if (!found.some((f) => f.city === canonical)) {
            found.push({
              city: canonical,
              index: match.index,
              length: match[0].length,
            });
          }
          break;
        }
      }
    }

    // Check for "in <City>" grammar for unlisted arbitrary cities
    if (found.length === 0) {
      const inCityMatch = raw.match(/\b(?:in|at|around|for)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/i);
      if (inCityMatch) {
        const candidate = inCityMatch[1].trim();
        const nonCityWords = [
          'this', 'next', 'the', 'my', 'october', 'november', 'december', 'january', 'february',
          'march', 'april', 'may', 'june', 'july', 'august', 'september', 'friday', 'saturday',
          'sunday', 'weekend', 'tonight', 'today', 'tomorrow', 'evening', 'morning', 'afternoon',
          'events', 'concerts', 'shows', 'comedy', 'theatre', 'family', 'food', 'luxury', 'couple',
        ];
        if (!nonCityWords.includes(candidate.toLowerCase())) {
          const norm = this.normalizeCity(candidate);
          return { primaryCity: norm, allCities: [norm], isMultiCity: false };
        }
      }
    }

    if (found.length === 0) {
      return { primaryCity: 'Ahmedabad', allCities: ['Ahmedabad'], isMultiCity: false };
    }

    // Sort by occurrence order in text
    found.sort((a, b) => a.index - b.index);
    const uniqueCities = Array.from(new Set(found.map((f) => f.city)));

    return {
      primaryCity: uniqueCities[0],
      allCities: uniqueCities,
      isMultiCity: uniqueCities.length > 1,
    };
  }

  /**
   * Checks whether a venue or event string matches a target city.
   */
  static isCityMatch(eventCity: string, targetCity: string): boolean {
    const normEvent = this.normalizeCity(eventCity).toLowerCase();
    const normTarget = this.normalizeCity(targetCity).toLowerCase();
    return normEvent === normTarget;
  }
}
