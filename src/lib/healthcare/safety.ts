/**
 * PROVENTA — MEDICAL SAFETY & EMERGENCY GUARDRAIL ENGINE
 * Strictly enforces administrative concierge boundaries:
 * - Detects medical emergencies and directs user to emergency services.
 * - Refuses diagnosis, prescription, or medical treatment advice.
 * - Provides safe, neutral administrative guidance.
 */

import { MedicalSafetyCheckResult } from './types';

export class MedicalSafetyGuardrails {
  private static EMERGENCY_TRIGGERS = [
    'chest pain',
    'heart attack',
    'cannot breathe',
    'difficulty breathing',
    'severe breathlessness',
    'choking',
    'stroke',
    'paralysis',
    'slurred speech',
    'facial drooping',
    'heavy bleeding',
    'unconscious',
    'seizure',
    'convulsion',
    'poisoning',
    'overdose',
    'anaphylaxis',
    'severe burn',
    'suicidal',
    'suicide',
  ];

  private static DIAGNOSIS_TRIGGERS = [
    'what disease do i have',
    'diagnose my',
    'what medicine should i take',
    'prescribe me',
    'what is the cure for',
    'what do my symptoms mean',
    'interpret my test report',
    'should i take this medicine',
  ];

  /**
   * Evaluates a user request against clinical safety boundaries.
   */
  static evaluateSafety(rawInput: string): MedicalSafetyCheckResult {
    const raw = (rawInput || '').toLowerCase().trim();

    // 1. Emergency Detection
    const isEmergency = this.EMERGENCY_TRIGGERS.some((trigger) => raw.includes(trigger));
    if (isEmergency) {
      return {
        isEmergency: true,
        emergencyMessage:
          '⚠️ MEDICAL EMERGENCY NOTICE: Your message mentions potential emergency symptoms. Proventa Concierge is an administrative scheduling assistant and cannot provide emergency medical care. Please immediately call National Emergency Services (112 / 108 in India) or proceed to the nearest hospital emergency department.',
        isMedicalAdviceRequest: false,
      };
    }

    // 2. Diagnosis / Prescription Request Detection
    const isMedicalAdviceRequest = this.DIAGNOSIS_TRIGGERS.some((trigger) => raw.includes(trigger));
    if (isMedicalAdviceRequest) {
      return {
        isEmergency: false,
        isMedicalAdviceRequest: true,
        safeGuidance:
          'Proventa provides administrative concierge support for doctor discovery and appointment scheduling. We do not provide clinical diagnoses, symptom interpretations, or medication prescriptions. We can help you discover and schedule a consultation with a qualified General Physician or medical specialist.',
      };
    }

    return {
      isEmergency: false,
      isMedicalAdviceRequest: false,
    };
  }
}
