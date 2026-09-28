/**
 * PROVENTA — CANONICAL DATE & TIME WINDOW RESOLVER
 * Resolves exact dates, DD/MM/YYYY, DD-MM-YYYY, relative dates, date ranges, and upcoming discovery windows in Asia/Kolkata (IST).
 */

import { ResolvedDateRange } from './types';

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const DAY_OF_WEEK_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export class DateResolver {
  /**
   * Reference current date for Proventa in IST (Asia/Kolkata).
   */
  static getNow(customAnchor?: Date): Date {
    if (customAnchor) return new Date(customAnchor);
    return new Date();
  }

  static formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Resolves date expressions from raw user input into a canonical ResolvedDateRange.
   */
  static resolveDate(rawInput: string, anchorDate?: Date): ResolvedDateRange {
    const now = this.getNow(anchorDate);
    const raw = (rawInput || '').toLowerCase().trim();
    const currentYear = now.getFullYear();

    // 1. Check for Exact DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY e.g. "29/09/2026", "29-09-2026", "29/9/2026"
    const ddmmyyyyMatch = raw.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10);
      const year = parseInt(ddmmyyyyMatch[3], 10);

      const dt = new Date(year, month - 1, day);
      const iso = this.formatDateISO(dt);
      return {
        startDate: iso,
        endDate: iso,
        isSpecificDate: true,
        isDateRange: false,
        isUpcomingWindow: false,
        displayText: iso,
        resolvedFrom: ddmmyyyyMatch[0],
      };
    }

    // 2. Check for Exact DD/MM or DD-MM without year e.g. "29/09"
    const ddmmMatch = raw.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
    if (ddmmMatch) {
      const day = parseInt(ddmmMatch[1], 10);
      const month = parseInt(ddmmMatch[2], 10);
      if (day <= 31 && month >= 1 && month <= 12) {
        const dt = new Date(currentYear, month - 1, day);
        const iso = this.formatDateISO(dt);
        return {
          startDate: iso,
          endDate: iso,
          isSpecificDate: true,
          isDateRange: false,
          isUpcomingWindow: false,
          displayText: iso,
          resolvedFrom: ddmmMatch[0],
        };
      }
    }

    // 3. Check for ISO Date: "2026-09-29"
    const isoMatch = raw.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (isoMatch) {
      const dt = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
      const iso = this.formatDateISO(dt);
      return {
        startDate: iso,
        endDate: iso,
        isSpecificDate: true,
        isDateRange: false,
        isUpcomingWindow: false,
        displayText: iso,
        resolvedFrom: isoMatch[0],
      };
    }

    // 4. Check for Exact Date Range: "from 15 to 20 October" or "15-20 October" or "15 to 20 Oct 2026"
    const rangeMatch =
      raw.match(/(?:from\s+)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|until|through)\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?/i) ||
      raw.match(/([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|until)\s*(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i);

    if (rangeMatch) {
      let d1: number, d2: number, monthStr: string, yearStr: string | undefined;
      if (isNaN(Number(rangeMatch[1]))) {
        monthStr = rangeMatch[1];
        d1 = parseInt(rangeMatch[2], 10);
        d2 = parseInt(rangeMatch[3], 10);
        yearStr = rangeMatch[4];
      } else {
        d1 = parseInt(rangeMatch[1], 10);
        d2 = parseInt(rangeMatch[2], 10);
        monthStr = rangeMatch[3];
        yearStr = rangeMatch[4];
      }

      const monthNum = MONTH_MAP[monthStr.toLowerCase()];
      if (monthNum) {
        const year = yearStr ? parseInt(yearStr, 10) : currentYear;
        const start = new Date(year, monthNum - 1, d1);
        const end = new Date(year, monthNum - 1, d2);

        return {
          startDate: this.formatDateISO(start),
          endDate: this.formatDateISO(end),
          isSpecificDate: false,
          isDateRange: true,
          isUpcomingWindow: false,
          displayText: `${d1} to ${d2} ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase()} ${year}`,
          resolvedFrom: rangeMatch[0],
        };
      }
    }

    // 5. Check for Natural Single Date: "29 September 2026", "29 September", "15 October", "12 Nov"
    const exactMatch =
      raw.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?\b/i) ||
      raw.match(/\b([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/i);

    if (exactMatch) {
      let day: number, monthStr: string, yearStr: string | undefined;
      if (isNaN(Number(exactMatch[1]))) {
        monthStr = exactMatch[1];
        day = parseInt(exactMatch[2], 10);
        yearStr = exactMatch[3];
      } else {
        day = parseInt(exactMatch[1], 10);
        monthStr = exactMatch[2];
        yearStr = exactMatch[3];
      }

      const monthNum = MONTH_MAP[monthStr.toLowerCase()];
      if (monthNum) {
        const year = yearStr ? parseInt(yearStr, 10) : currentYear;
        const dt = new Date(year, monthNum - 1, day);
        const iso = this.formatDateISO(dt);
        return {
          startDate: iso,
          endDate: iso,
          isSpecificDate: true,
          isDateRange: false,
          isUpcomingWindow: false,
          displayText: `${day} ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase()} ${year}`,
          resolvedFrom: exactMatch[0],
        };
      }
    }

    // 6. Relative Terms: "today", "tonight"
    if (raw.includes('today') || raw.includes('tonight')) {
      const iso = this.formatDateISO(now);
      return {
        startDate: iso,
        endDate: iso,
        isSpecificDate: true,
        isDateRange: false,
        isUpcomingWindow: false,
        displayText: raw.includes('tonight') ? 'Tonight' : 'Today',
        resolvedFrom: raw.includes('tonight') ? 'tonight' : 'today',
      };
    }

    // 7. "tomorrow"
    if (raw.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const iso = this.formatDateISO(tomorrow);
      return {
        startDate: iso,
        endDate: iso,
        isSpecificDate: true,
        isDateRange: false,
        isUpcomingWindow: false,
        displayText: 'Tomorrow',
        resolvedFrom: 'tomorrow',
      };
    }

    // 8. "this weekend" / "next weekend" / "weekend"
    if (raw.includes('next weekend')) {
      const sat = new Date(now);
      const currentDay = now.getDay();
      const daysUntilNextSat = ((6 - currentDay + 7) % 7) + 7;
      sat.setDate(now.getDate() + daysUntilNextSat);

      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);

      return {
        startDate: this.formatDateISO(sat),
        endDate: this.formatDateISO(sun),
        isSpecificDate: false,
        isDateRange: true,
        isUpcomingWindow: false,
        displayText: 'Next Weekend',
        resolvedFrom: 'next weekend',
      };
    }

    if (raw.includes('this weekend') || raw.includes('the weekend') || raw.includes('weekend')) {
      const sat = new Date(now);
      const currentDay = now.getDay();
      const daysUntilSat = (6 - currentDay + 7) % 7;
      sat.setDate(now.getDate() + daysUntilSat);

      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);

      return {
        startDate: this.formatDateISO(sat),
        endDate: this.formatDateISO(sun),
        isSpecificDate: false,
        isDateRange: true,
        isUpcomingWindow: false,
        displayText: 'This Weekend',
        resolvedFrom: 'this weekend',
      };
    }

    // 9. "next week"
    if (raw.includes('next week')) {
      const startNextWeek = new Date(now);
      const currentDay = now.getDay();
      const daysUntilNextMon = ((1 - currentDay + 7) % 7) || 7;
      startNextWeek.setDate(now.getDate() + daysUntilNextMon);

      const endNextWeek = new Date(startNextWeek);
      endNextWeek.setDate(startNextWeek.getDate() + 6);

      return {
        startDate: this.formatDateISO(startNextWeek),
        endDate: this.formatDateISO(endNextWeek),
        isSpecificDate: false,
        isDateRange: true,
        isUpcomingWindow: false,
        displayText: 'Next Week',
        resolvedFrom: 'next week',
      };
    }

    // 10. Specific Day of Week: "this Friday", "next Saturday", "on Sunday", "this Saturday", "Saturday"
    for (const [dayName, targetDayNum] of Object.entries(DAY_OF_WEEK_MAP)) {
      const regex = new RegExp(`\\b(this|next|on)?\\s*${dayName}\\b`, 'i');
      const match = raw.match(regex);
      if (match) {
        const modifier = (match[1] || '').toLowerCase();
        const currentDay = now.getDay();
        let daysToAdd = (targetDayNum - currentDay + 7) % 7;
        if (daysToAdd === 0 && modifier !== 'this') daysToAdd = 7;
        if (modifier === 'next') daysToAdd += 7;

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysToAdd);
        const iso = this.formatDateISO(targetDate);
        const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();

        return {
          startDate: iso,
          endDate: iso,
          isSpecificDate: true,
          isDateRange: false,
          isUpcomingWindow: false,
          displayText: `${modifier ? modifier.charAt(0).toUpperCase() + modifier.slice(1) + ' ' : ''}${formattedDay}`,
          resolvedFrom: match[0],
        };
      }
    }

    // 11. "next month" or "in [month]"
    if (raw.includes('next month')) {
      const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return {
        startDate: this.formatDateISO(startNextMonth),
        endDate: this.formatDateISO(endNextMonth),
        isSpecificDate: false,
        isDateRange: true,
        isUpcomingWindow: true,
        displayText: 'Next Month',
        resolvedFrom: 'next month',
      };
    }

    // 12. Default to upcoming 30-day window
    const windowEnd = new Date(now);
    windowEnd.setDate(now.getDate() + 30);
    return {
      startDate: this.formatDateISO(now),
      endDate: this.formatDateISO(windowEnd),
      isSpecificDate: false,
      isDateRange: false,
      isUpcomingWindow: true,
      displayText: 'Upcoming Events Window',
      resolvedFrom: 'DEFAULT_NEAR_TERM_WINDOW',
    };
  }

  /**
   * Checks if an event date falls within the resolved date constraints.
   */
  static isDateMatch(eventDate: string, dateRange: ResolvedDateRange): boolean {
    if (!eventDate) return false;
    const evDateStr = eventDate.slice(0, 10);

    if (dateRange.isSpecificDate) {
      return evDateStr === dateRange.startDate;
    }

    // Date range or upcoming window
    return evDateStr >= dateRange.startDate && evDateStr <= dateRange.endDate;
  }
}
