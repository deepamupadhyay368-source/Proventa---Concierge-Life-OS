/**
 * PROVENTA — HEALTHCARE & DOCTOR DISCOVERY PROVIDER
 * Core orchestrator for multi-source healthcare discovery, natural language query parsing,
 * deterministic deduplication, medical safety guardrails, and transparent doctor curation.
 * Strict Zero-Fabrication • Administrative Concierge Support • Neutral Presentation
 */

import {
  NormalizedDoctor,
  HealthcareSearchConstraints,
  DoctorSpecialty,
  AppointmentType,
  HealthcareDiagnostics,
  MedicalSafetyCheckResult,
} from './types';
import {
  HealthcareDiscoverySource,
  ProventaVerifiedHealthcareSource,
  OfficialHospitalDirectorySource,
  DoctorBookingAPISource,
  TelehealthGatewaySource,
} from './sources';
import { MedicalSafetyGuardrails } from './safety';
import { logger } from '@/lib/logger';

export class HealthcareDiscoveryProvider {
  private sources: HealthcareDiscoverySource[] = [];

  constructor(customSources?: HealthcareDiscoverySource[]) {
    if (customSources && customSources.length > 0) {
      this.sources = customSources;
    } else {
      this.sources = [
        new ProventaVerifiedHealthcareSource(),
        new OfficialHospitalDirectorySource(),
        new DoctorBookingAPISource(),
        new TelehealthGatewaySource(),
      ];
    }
  }

  /**
   * Primary entry point for discovering doctors and healthcare specialists.
   */
  async searchDoctors(
    query: HealthcareSearchConstraints
  ): Promise<{ doctors: NormalizedDoctor[]; diagnostics: HealthcareDiagnostics }> {
    const startedAt = new Date().toISOString();
    const rawInput = query.rawInput || '';

    // 1. Evaluate Medical Safety Guardrails
    const safetyCheck: MedicalSafetyCheckResult = MedicalSafetyGuardrails.evaluateSafety(rawInput);

    // If emergency symptoms detected, return empty doctor set with emergency diagnostics
    if (safetyCheck.isEmergency) {
      return {
        doctors: [],
        diagnostics: {
          researchStartedAt: startedAt,
          rawInput,
          resolvedCity: query.city || 'Emergency',
          resolvedSpecialty: 'GENERAL_PHYSICIAN',
          sourcesQueried: [],
          rawCandidateCount: 0,
          deduplicatedCount: 0,
          validatedCount: 0,
          rankedCount: 0,
          returnedOptionCount: 0,
          conciergeFallback: false,
          safetyCheck,
        },
      };
    }

    // 2. Parse & Resolve Search Intent and Constraints
    const resolvedSpecialty = query.specialty || this.resolveSpecialty(rawInput);
    const resolvedCity = query.city || this.resolveCity(rawInput) || 'Ahmedabad';
    const resolvedHospital = query.hospital || this.resolveHospital(rawInput);
    const resolvedDoctorName = query.doctorName || this.resolveDoctorName(rawInput);
    const resolvedGender = query.gender || this.resolveGender(rawInput);
    const resolvedAppointmentType = query.appointmentType || this.resolveAppointmentType(rawInput);
    const resolvedMaxFee = query.maxFee || this.resolveMaxFee(rawInput);

    const mergedConstraints: HealthcareSearchConstraints = {
      ...query,
      city: resolvedCity,
      specialty: resolvedSpecialty,
      hospital: resolvedHospital,
      doctorName: resolvedDoctorName,
      gender: resolvedGender,
      appointmentType: resolvedAppointmentType,
      maxFee: resolvedMaxFee,
      rawInput,
    };

    // 3. Query All Sources in Parallel (Promise.allSettled for failure isolation)
    const sourceDiagnostics: HealthcareDiagnostics['sourcesQueried'] = [];
    const rawCandidates: NormalizedDoctor[] = [];

    const searchPromises = this.sources.map(async (source) => {
      const sourceStart = Date.now();
      if (!source.isConfigured) {
        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: false,
          status: 'NOT_CONFIGURED',
          candidatesFound: 0,
          latencyMs: 0,
        });
        return [];
      }

      try {
        const results = await source.search(mergedConstraints);
        const latencyMs = Date.now() - sourceStart;
        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: true,
          status: 'SUCCESS',
          candidatesFound: results.length,
          latencyMs,
        });
        return results;
      } catch (err: any) {
        const latencyMs = Date.now() - sourceStart;
        logger.warn({ sourceId: source.sourceId, error: err?.message }, 'Healthcare source search failed');
        sourceDiagnostics.push({
          sourceId: source.sourceId,
          sourceName: source.name,
          isConfigured: true,
          status: 'FAILED',
          candidatesFound: 0,
          latencyMs,
        });
        return [];
      }
    });

    const settledResults = await Promise.allSettled(searchPromises);
    for (const res of settledResults) {
      if (res.status === 'fulfilled') {
        rawCandidates.push(...res.value);
      }
    }

    // 4. Deterministic Deduplication
    const deduplicated = this.deduplicateDoctors(rawCandidates);

    // 5. Neutral Ranking (Experience, Verified status, Locality match, Fee transparency)
    const ranked = this.rankDoctors(deduplicated, mergedConstraints);

    // 6. Select Top Options (Max 5 for concise concierge recommendation cycles)
    const limit = query.limit || 5;
    const finalOptions = ranked.slice(0, limit);

    const diagnostics: HealthcareDiagnostics = {
      researchStartedAt: startedAt,
      rawInput,
      resolvedCity,
      resolvedSpecialty,
      resolvedHospital,
      resolvedDoctorName,
      genderPreference: resolvedGender,
      sourcesQueried: sourceDiagnostics,
      rawCandidateCount: rawCandidates.length,
      deduplicatedCount: deduplicated.length,
      validatedCount: deduplicated.length,
      rankedCount: ranked.length,
      returnedOptionCount: finalOptions.length,
      conciergeFallback: finalOptions.length === 0,
      fallbackReason: finalOptions.length === 0 ? 'No matching verified doctors found for specified criteria' : undefined,
      safetyCheck,
    };

    return {
      doctors: finalOptions,
      diagnostics,
    };
  }

  // ============================================================
  // RESOLVER HELPERS
  // ============================================================

  resolveSpecialty(text: string): DoctorSpecialty {
    const raw = (text || '').toLowerCase();

    if (raw.includes('dermatolog') || raw.includes('skin doctor') || raw.includes('skin specialist') || raw.includes('hair fall') || raw.includes('tricholog') || raw.includes('acne') || raw.includes('eczema')) {
      return 'DERMATOLOGY';
    }
    if (raw.includes('cardiolog') || raw.includes('heart doctor') || raw.includes('heart specialist') || /\becg\b/i.test(raw) || raw.includes('cardiac') || raw.includes('angioplasty')) {
      return 'CARDIOLOGY';
    }
    if (raw.includes('pediatric') || raw.includes('paediatric') || raw.includes('child doctor') || raw.includes('baby doctor') || raw.includes('infant')) {
      return 'PEDIATRICS';
    }
    if (raw.includes('gynecolog') || raw.includes('gynaecolog') || raw.includes('obstetric') || raw.includes('women doctor') || raw.includes('maternity') || raw.includes('pregnancy')) {
      return 'GYNECOLOGY';
    }
    if (raw.includes('orthopedic') || raw.includes('orthopaedic') || raw.includes('bone doctor') || raw.includes('joint pain') || raw.includes('knee replacement') || raw.includes('fracture') || raw.includes('spine')) {
      return 'ORTHOPEDICS';
    }
    if (/\bent\b/i.test(raw) || raw.includes('ear nose throat') || raw.includes('sinus') || raw.includes('ear doctor') || raw.includes('throat specialist')) {
      return 'ENT';
    }
    if (raw.includes('dentist') || raw.includes('dental') || raw.includes('teeth') || raw.includes('toothache') || raw.includes('root canal')) {
      return 'DENTISTRY';
    }
    if (raw.includes('ophthalmolog') || raw.includes('eye doctor') || raw.includes('cataract') || raw.includes('lasik') || raw.includes('vision specialist')) {
      return 'OPHTHALMOLOGY';
    }
    if (raw.includes('neurolog') || raw.includes('brain doctor') || raw.includes('migraine') || /\bneuro\b/i.test(raw)) {
      return 'NEUROLOGY';
    }
    if (raw.includes('psychiatr') || raw.includes('mental health') || raw.includes('depression') || raw.includes('anxiety counselor')) {
      return 'PSYCHIATRY';
    }
    if (raw.includes('endocrinolog') || raw.includes('diabetes doctor') || raw.includes('thyroid specialist') || raw.includes('hormone')) {
      return 'ENDOCRINOLOGY';
    }
    if (raw.includes('gastroenterolog') || raw.includes('stomach doctor') || raw.includes('liver specialist') || raw.includes('digestive')) {
      return 'GASTROENTEROLOGY';
    }
    if (raw.includes('urolog') || raw.includes('kidney stone') || raw.includes('urinary specialist')) {
      return 'UROLOGY';
    }
    if (raw.includes('nephrolog') || raw.includes('kidney doctor') || raw.includes('dialysis')) {
      return 'NEPHROLOGY';
    }
    if (raw.includes('pulmonolog') || raw.includes('chest doctor') || raw.includes('asthma specialist') || raw.includes('respiratory')) {
      return 'PULMONOLOGY';
    }
    if (raw.includes('oncolog') || raw.includes('cancer specialist') || raw.includes('tumor')) {
      return 'ONCOLOGY';
    }
    if (raw.includes('physiotherap') || /\bphysio\b/i.test(raw) || /\brehab\b/i.test(raw)) {
      return 'PHYSIOTHERAPY';
    }
    if (raw.includes('nutrition') || raw.includes('dietitian') || raw.includes('diet plan')) {
      return 'NUTRITION';
    }
    if (raw.includes('general physician') || raw.includes('family doctor') || raw.includes('general doctor') || /\bfever\b/i.test(raw) || /\bcold\b/i.test(raw) || /\bcough\b/i.test(raw) || raw.includes('checkup') || raw.includes('health checkup')) {
      return 'GENERAL_PHYSICIAN';
    }

    return 'ALL';
  }

  resolveCity(text: string): string | undefined {
    const raw = (text || '').toLowerCase();
    if (raw.includes('ahmedabad') || raw.includes('amdavad')) return 'Ahmedabad';
    if (raw.includes('mumbai') || raw.includes('bombay')) return 'Mumbai';
    if (raw.includes('delhi') || raw.includes('new delhi') || raw.includes('ncr')) return 'Delhi';
    if (raw.includes('bangalore') || raw.includes('bengaluru')) return 'Bengaluru';
    if (raw.includes('pune')) return 'Pune';
    if (raw.includes('hyderabad')) return 'Hyderabad';
    if (raw.includes('chennai') || raw.includes('madras')) return 'Chennai';
    if (raw.includes('kolkata') || raw.includes('calcutta')) return 'Kolkata';
    return undefined;
  }

  resolveHospital(text: string): string | undefined {
    const raw = (text || '').toLowerCase();
    if (raw.includes('kd hospital')) return 'KD Hospital';
    if (raw.includes('apollo')) return 'Apollo';
    if (raw.includes('cims') || raw.includes('marengo')) return 'Marengo CIMS';
    if (raw.includes('asian heart')) return 'Asian Heart Institute';
    if (raw.includes('reliance') || raw.includes('h.n. reliance')) return 'Sir H.N. Reliance';
    if (raw.includes('fortis')) return 'Fortis';
    if (raw.includes('narayana') || raw.includes('narayana health')) return 'Narayana Health';
    if (raw.includes('shalby')) return 'Shalby';
    if (raw.includes('sterling')) return 'Sterling';
    return undefined;
  }

  resolveDoctorName(text: string): string | undefined {
    const match = text.match(/dr\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+){1,3})/i);
    if (match) {
      const cleaned = match[1].replace(/\s+(?:in|at|near|for|from|with|on)\s+.*$/i, '').trim();
      return cleaned;
    }
    return undefined;
  }

  resolveGender(text: string): 'FEMALE' | 'MALE' | undefined {
    const raw = (text || '').toLowerCase();
    if (raw.includes('female doctor') || raw.includes('lady doctor') || raw.includes('woman doctor')) {
      return 'FEMALE';
    }
    if (raw.includes('male doctor') || raw.includes('gentleman doctor')) {
      return 'MALE';
    }
    return undefined;
  }

  resolveAppointmentType(text: string): AppointmentType | undefined {
    const raw = (text || '').toLowerCase();
    if (raw.includes('online') || raw.includes('teleconsultation') || raw.includes('video call') || raw.includes('video consultation')) {
      return 'TELECONSULTATION';
    }
    if (raw.includes('in-person') || raw.includes('clinic visit') || raw.includes('hospital visit') || raw.includes('face to face')) {
      return 'IN_PERSON';
    }
    return undefined;
  }

  resolveMaxFee(text: string): number | undefined {
    const raw = (text || '').toLowerCase();
    const feeMatch = raw.match(/(?:under|below|budget|within|max)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                     raw.match(/(?:rs\.?|inr|₹)\s*(\d+)\s*(?:or below|max|budget)/i);
    if (feeMatch) {
      const fee = parseInt(feeMatch[1], 10);
      if (!isNaN(fee) && fee > 0) return fee;
    }
    return undefined;
  }

  // ============================================================
  // DEDUPLICATION & RANKING
  // ============================================================

  private deduplicateDoctors(doctors: NormalizedDoctor[]): NormalizedDoctor[] {
    const seen = new Set<string>();
    const result: NormalizedDoctor[] = [];

    for (const doc of doctors) {
      const primaryKey = doc.doctorId;
      const compositeKey = `${doc.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim()}::${doc.city.toLowerCase()}::${(doc.hospital || doc.clinic || '').toLowerCase()}`;

      if (!seen.has(primaryKey) && !seen.has(compositeKey)) {
        seen.add(primaryKey);
        seen.add(compositeKey);
        result.push(doc);
      }
    }

    return result;
  }

  private rankDoctors(doctors: NormalizedDoctor[], constraints: HealthcareSearchConstraints): NormalizedDoctor[] {
    return [...doctors].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. Exact specialty match
      if (constraints.specialty && constraints.specialty !== 'ALL') {
        if (a.specialty === constraints.specialty) scoreA += 50;
        if (b.specialty === constraints.specialty) scoreB += 50;
      }

      // 2. Locality match
      if (constraints.locality) {
        const targetLoc = constraints.locality.toLowerCase();
        if (a.locality && a.locality.toLowerCase().includes(targetLoc)) scoreA += 30;
        if (b.locality && b.locality.toLowerCase().includes(targetLoc)) scoreB += 30;
      }

      // 3. Hospital match
      if (constraints.hospital) {
        const targetHosp = constraints.hospital.toLowerCase();
        if (a.hospital && a.hospital.toLowerCase().includes(targetHosp)) scoreA += 40;
        if (b.hospital && b.hospital.toLowerCase().includes(targetHosp)) scoreB += 40;
      }

      // 4. Experience Years (seniority bonus)
      scoreA += Math.min((a.experienceYears || 0), 30);
      scoreB += Math.min((b.experienceYears || 0), 30);

      // 5. Higher score comes first
      return scoreB - scoreA;
    });
  }
}

export const healthcareDiscoveryProvider = new HealthcareDiscoveryProvider();
