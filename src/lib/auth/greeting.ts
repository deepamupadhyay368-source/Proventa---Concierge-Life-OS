/**
 * Proventa — Personalized Greeting & Welcome System
 * Pure, secure functions to format time-aware, personalized customer greetings.
 */

/**
 * Extracts a safe, elegant first name from a full name string.
 * Trims extra spaces and capitalizes cleanly without exposing internal details.
 */
export function getFirstName(fullName?: string | null): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  if (!trimmed) return '';

  // Handle titles if present (e.g., "Dr. Deepam", "Mr. Arjun")
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const titles = ['mr', 'mr.', 'ms', 'ms.', 'mrs', 'mrs.', 'dr', 'dr.', 'prof', 'prof.'];
  
  if (parts.length > 1 && titles.includes(parts[0].toLowerCase())) {
    return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  }

  const first = parts[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Determines time of day based on current hour.
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Generates a personalized, time-aware greeting.
 * Examples:
 * - "Good morning, Deepam."
 * - "Good afternoon, Deepam."
 * - "Good evening, Deepam."
 * - "Welcome back, Deepam."
 */
export function getTimeAwareGreeting(name?: string | null, date: Date = new Date()): string {
  const firstName = getFirstName(name);
  const timeOfDay = getTimeOfDay(date);

  if (firstName) {
    switch (timeOfDay) {
      case 'morning':
        return `Good morning, ${firstName}.`;
      case 'afternoon':
        return `Good afternoon, ${firstName}.`;
      case 'evening':
        return `Good evening, ${firstName}.`;
      case 'night':
      default:
        return `Welcome back, ${firstName}.`;
    }
  }

  // Fallback when name is not provided
  switch (timeOfDay) {
    case 'morning':
      return 'Good morning.';
    case 'afternoon':
      return 'Good afternoon.';
    case 'evening':
      return 'Good evening.';
    case 'night':
    default:
      return 'Welcome back.';
  }
}

/**
 * Generates full welcome payload with title and contextual subtitle.
 */
export function getWelcomeMessage(params: {
  name?: string | null;
  isFirstLogin?: boolean;
  date?: Date;
}): { title: string; subtitle: string } {
  const { name, isFirstLogin = false, date = new Date() } = params;
  const firstName = getFirstName(name);

  if (isFirstLogin) {
    return {
      title: firstName ? `Welcome to Proventa, ${firstName}.` : 'Welcome to Proventa.',
      subtitle: 'Your life, handled. Tell your concierge what you need taken care of today.',
    };
  }

  const title = getTimeAwareGreeting(name, date);
  const subtitle = 'What would you like Proventa to take care of today?';

  return { title, subtitle };
}
