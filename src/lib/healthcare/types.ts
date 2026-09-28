/**
 * PROVENTA — DOCTOR & HEALTHCARE APPOINTMENT DISCOVERY TYPES
 * Canonical domain types, master specialty taxonomy, normalized doctor model, and search constraints.
 * Strict Zero-Fabrication • Administrative Concierge Support • Medical Safety Guardrails
 */

// ============================================================
// 1. MASTER DOCTOR SPECIALTY TAXONOMY
// ============================================================

export type DoctorSpecialty =
  | 'GENERAL_PHYSICIAN'
  | 'FAMILY_MEDICINE'
  | 'INTERNAL_MEDICINE'
  | 'CARDIOLOGY'
  | 'DERMATOLOGY'
  | 'PEDIATRICS'
  | 'GYNECOLOGY'
  | 'OBSTETRICS'
  | 'ORTHOPEDICS'
  | 'ENT'
  | 'OPHTHALMOLOGY'
  | 'NEUROLOGY'
  | 'NEUROSURGERY'
  | 'PSYCHIATRY'
  | 'PSYCHOLOGY'
  | 'DENTISTRY'
  | 'ENDOCRINOLOGY'
  | 'GASTROENTEROLOGY'
  | 'UROLOGY'
  | 'NEPHROLOGY'
  | 'PULMONOLOGY'
  | 'RHEUMATOLOGY'
  | 'ONCOLOGY'
  | 'HEMATOLOGY'
  | 'INFECTIOUS_DISEASE'
  | 'GENERAL_SURGERY'
  | 'PLASTIC_SURGERY'
  | 'PHYSIOTHERAPY'
  | 'NUTRITION'
  | 'DIETETICS'
  | 'AYURVEDA'
  | 'HOMEOPATHY'
  | 'OTHER_SPECIALTY'
  | 'ALL';

export type AppointmentType = 'IN_PERSON' | 'TELECONSULTATION' | 'BOTH';

export type DoctorAvailabilityStatus =
  | 'AVAILABLE'
  | 'SUBJECT_TO_CONFIRMATION'
  | 'UNVERIFIED';

// ============================================================
// 2. NORMALIZED DOCTOR / CLINIC MODEL
// ============================================================

export interface NormalizedDoctor {
  doctorId: string;
  doctorName: string;
  specialty: DoctorSpecialty;
  subSpecialty?: string;
  qualifications?: string;
  registrationInformation?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  hospital?: string;
  clinic?: string;
  city: string;
  locality?: string;
  address?: string;
  phone?: string;
  website?: string;
  appointmentUrl?: string;
  consultationFee?: number; // In INR
  feeDisplay?: string;
  appointmentType: AppointmentType;
  availabilityStatus: DoctorAvailabilityStatus;
  availabilitySchedule?: string; // e.g. "Mon-Fri: 10:00 AM - 1:00 PM, 5:00 PM - 8:00 PM"
  source: string;
  sourceUrl?: string;
  sourceId?: string;
  verifiedAt: string;
  languages?: string[];
  experienceYears?: number;
  tags?: string[];
}

// ============================================================
// 3. SEARCH CONSTRAINTS & FILTERING
// ============================================================

export interface HealthcareSearchConstraints {
  city?: string;
  locality?: string;
  specialty?: DoctorSpecialty;
  subSpecialty?: string;
  doctorName?: string;
  hospital?: string;
  clinic?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  appointmentType?: AppointmentType;
  date?: string; // YYYY-MM-DD or relative
  timeWindow?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY';
  maxFee?: number;
  language?: string;
  rawInput?: string;
  limit?: number;
  excludedDoctorIds?: string[];
}

// ============================================================
// 4. MEDICAL SAFETY & EMERGENCY TYPES
// ============================================================

export interface MedicalSafetyCheckResult {
  isEmergency: boolean;
  emergencyMessage?: string;
  isMedicalAdviceRequest: boolean;
  safeGuidance?: string;
}

// ============================================================
// 5. DIAGNOSTICS & OBSERVABILITY
// ============================================================

export interface HealthcareDiagnostics {
  researchStartedAt: string;
  rawInput: string;
  resolvedCity: string;
  resolvedSpecialty: DoctorSpecialty;
  resolvedHospital?: string;
  resolvedDoctorName?: string;
  genderPreference?: string;
  sourcesQueried: Array<{
    sourceId: string;
    sourceName: string;
    isConfigured: boolean;
    status: 'SUCCESS' | 'FAILED' | 'NOT_CONFIGURED';
    candidatesFound: number;
    latencyMs: number;
  }>;
  rawCandidateCount: number;
  deduplicatedCount: number;
  validatedCount: number;
  rankedCount: number;
  returnedOptionCount: number;
  conciergeFallback: boolean;
  fallbackReason?: string;
  safetyCheck: MedicalSafetyCheckResult;
}
