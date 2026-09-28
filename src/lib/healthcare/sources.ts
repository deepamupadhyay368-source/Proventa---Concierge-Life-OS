/**
 * PROVENTA — HEALTHCARE & DOCTOR DISCOVERY SOURCES
 * Multi-source research abstraction for querying verified healthcare directories, official hospital desks,
 * and future EHR/EMR appointment booking connectors.
 * Strictly adheres to zero fabrication and safe error isolation.
 */

import { NormalizedDoctor, HealthcareSearchConstraints, DoctorSpecialty } from './types';
import { VERIFIED_DOCTOR_DATABASE } from './registry';
import { logger } from '@/lib/logger';

export interface HealthcareDiscoverySource {
  readonly sourceId: string;
  readonly name: string;
  readonly isConfigured: boolean;
  search(constraints: HealthcareSearchConstraints): Promise<NormalizedDoctor[]>;
}

/**
 * Filter utility shared across registry-backed sources.
 */
export function filterDoctorByConstraints(
  doctor: NormalizedDoctor,
  constraints: HealthcareSearchConstraints
): boolean {
  // 1. City Check
  if (constraints.city && constraints.city.trim() !== '') {
    const targetCity = constraints.city.toLowerCase().trim();
    if (!doctor.city.toLowerCase().includes(targetCity)) {
      return false;
    }
  }

  // 2. Locality / Neighborhood Check
  if (constraints.locality && constraints.locality.trim() !== '') {
    const targetLocality = constraints.locality.toLowerCase().trim();
    const docLocality = (doctor.locality || '').toLowerCase();
    const docAddress = (doctor.address || '').toLowerCase();
    if (!docLocality.includes(targetLocality) && !docAddress.includes(targetLocality)) {
      return false;
    }
  }

  // 3. Specialty Check
  if (constraints.specialty && constraints.specialty !== 'ALL' && constraints.specialty !== 'OTHER_SPECIALTY') {
    if (doctor.specialty !== constraints.specialty) {
      // Check subspecialty or tags as secondary match
      const sub = (doctor.subSpecialty || '').toUpperCase();
      const tags = (doctor.tags || []).map((t) => t.toUpperCase());
      const specUpper = constraints.specialty.toUpperCase();
      const matchesSubOrTag = sub.includes(specUpper) || tags.some((t) => t.includes(specUpper));
      if (!matchesSubOrTag) {
        return false;
      }
    }
  }

  // 4. SubSpecialty Check
  if (constraints.subSpecialty && constraints.subSpecialty.trim() !== '') {
    const targetSub = constraints.subSpecialty.toLowerCase().trim();
    const docSub = (doctor.subSpecialty || '').toLowerCase();
    const docTags = (doctor.tags || []).map((t) => t.toLowerCase());
    if (!docSub.includes(targetSub) && !docTags.some((t) => t.includes(targetSub))) {
      return false;
    }
  }

  // 5. Doctor Name Check
  if (constraints.doctorName && constraints.doctorName.trim() !== '') {
    const targetName = constraints.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
    const docNameClean = doctor.doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
    const targetTokens = targetName.split(/\s+/).filter((t) => t.length > 2);
    const docTokens = docNameClean.split(/\s+/).filter((t) => t.length > 2);
    const tokenMatch = docTokens.every((t) => targetTokens.includes(t)) || targetTokens.every((t) => docTokens.includes(t));
    if (!docNameClean.includes(targetName) && !targetName.includes(docNameClean) && !tokenMatch) {
      return false;
    }
  }

  // 6. Hospital Check
  if (constraints.hospital && constraints.hospital.trim() !== '') {
    const targetHospital = constraints.hospital.toLowerCase().trim();
    const docHospital = (doctor.hospital || '').toLowerCase();
    if (!docHospital.includes(targetHospital)) {
      return false;
    }
  }

  // 7. Clinic Check
  if (constraints.clinic && constraints.clinic.trim() !== '') {
    const targetClinic = constraints.clinic.toLowerCase().trim();
    const docClinic = (doctor.clinic || '').toLowerCase();
    if (!docClinic.includes(targetClinic)) {
      return false;
    }
  }

  // 8. Gender Check
  if (constraints.gender) {
    if (doctor.gender !== constraints.gender) {
      return false;
    }
  }

  // 9. Appointment Type Check
  if (constraints.appointmentType && constraints.appointmentType !== 'BOTH') {
    if (doctor.appointmentType !== 'BOTH' && doctor.appointmentType !== constraints.appointmentType) {
      return false;
    }
  }

  // 10. Max Fee Check
  if (constraints.maxFee !== undefined && constraints.maxFee > 0) {
    if (doctor.consultationFee && doctor.consultationFee > constraints.maxFee) {
      return false;
    }
  }

  // 11. Language Check
  if (constraints.language && constraints.language.trim() !== '') {
    const targetLang = constraints.language.toLowerCase().trim();
    const docLangs = (doctor.languages || []).map((l) => l.toLowerCase());
    if (!docLangs.some((l) => l.includes(targetLang))) {
      return false;
    }
  }

  // 12. Excluded IDs Check
  if (constraints.excludedDoctorIds && constraints.excludedDoctorIds.length > 0) {
    if (constraints.excludedDoctorIds.includes(doctor.doctorId)) {
      return false;
    }
  }

  return true;
}

/**
 * 1. Proventa Verified Healthcare Source
 * Primary verified database of certified specialists, clinics, and hospital consultants.
 */
export class ProventaVerifiedHealthcareSource implements HealthcareDiscoverySource {
  readonly sourceId = 'proventa_verified_healthcare';
  readonly name = 'Proventa Verified Healthcare Directory';
  readonly isConfigured = true;

  private customDoctors: NormalizedDoctor[] = [];

  constructor(customDoctors: NormalizedDoctor[] = []) {
    this.customDoctors = customDoctors;
  }

  addDoctors(doctors: NormalizedDoctor[]) {
    this.customDoctors.push(...doctors);
  }

  async search(constraints: HealthcareSearchConstraints): Promise<NormalizedDoctor[]> {
    const all = [...VERIFIED_DOCTOR_DATABASE, ...this.customDoctors];
    return all.filter((doc) => filterDoctorByConstraints(doc, constraints));
  }
}

/**
 * 2. Official Hospital Directory Source
 * Direct official hospital specialist directories across premier partner healthcare institutions.
 */
export class OfficialHospitalDirectorySource implements HealthcareDiscoverySource {
  readonly sourceId = 'official_hospital_directory';
  readonly name = 'Official Hospital Specialist Registry';
  readonly isConfigured = true;

  async search(constraints: HealthcareSearchConstraints): Promise<NormalizedDoctor[]> {
    // Queries doctors with institutional hospital affiliations and desk desks
    const hospitalDoctors = VERIFIED_DOCTOR_DATABASE.filter(
      (doc) => doc.hospital && doc.hospital.trim() !== ''
    );

    return hospitalDoctors.filter((doc) => filterDoctorByConstraints(doc, constraints));
  }
}

/**
 * 3. Doctor Booking API Source (Enterprise Integrator)
 * Connects to hospital OPD/consultation scheduling APIs.
 * Cleanly marked NOT_CONFIGURED in Wave 1 to maintain strict zero-fabrication.
 */
export class DoctorBookingAPISource implements HealthcareDiscoverySource {
  readonly sourceId = 'doctor_booking_api';
  readonly name = 'Hospital OPD Booking Integration';
  readonly isConfigured = false;

  async search(_constraints: HealthcareSearchConstraints): Promise<NormalizedDoctor[]> {
    // Graceful no-op when external hospital API is not configured
    return [];
  }
}

/**
 * 4. Telehealth Gateway Source
 * Connects to verified digital teleconsultation video platforms.
 * Cleanly marked NOT_CONFIGURED in Wave 1.
 */
export class TelehealthGatewaySource implements HealthcareDiscoverySource {
  readonly sourceId = 'telehealth_gateway';
  readonly name = 'Telehealth Video Consultation Gateway';
  readonly isConfigured = false;

  async search(_constraints: HealthcareSearchConstraints): Promise<NormalizedDoctor[]> {
    return [];
  }
}
