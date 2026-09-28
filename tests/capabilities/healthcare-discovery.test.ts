import { describe, it, expect } from 'vitest';
import { healthcareDiscoveryProvider, HealthcareDiscoveryProvider } from '@/lib/healthcare/provider';
import { MedicalSafetyGuardrails } from '@/lib/healthcare/safety';
import {
  ProventaVerifiedHealthcareSource,
  OfficialHospitalDirectorySource,
  DoctorBookingAPISource,
  TelehealthGatewaySource,
} from '@/lib/healthcare/sources';
import { HealthcareDiscoveryAdapter } from '@/lib/orchestration/adapters/healthcare.adapter';
import { AdapterRegistry } from '@/lib/orchestration/adapters';
import { findAgentForTask, HealthcareAgent } from '@/lib/orchestration/agents';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { VERIFIED_DOCTOR_DATABASE } from '@/lib/healthcare/registry';

describe('PROVENTA — Healthcare & Doctor Discovery Engine', () => {
  // ============================================================
  // 1. DOMAIN & REGISTRY INTEGRITY
  // ============================================================
  describe('Registry & Doctor Model Integrity', () => {
    it('1. Database contains verified doctors with genuine attributes and zero synthetic placeholders', () => {
      expect(VERIFIED_DOCTOR_DATABASE.length).toBeGreaterThanOrEqual(10);
      for (const doc of VERIFIED_DOCTOR_DATABASE) {
        expect(doc.doctorId).toBeDefined();
        expect(doc.doctorName).toMatch(/^Dr\./);
        expect(doc.specialty).toBeDefined();
        expect(doc.city).toBeDefined();
        expect(doc.consultationFee).toBeGreaterThan(0);
        expect(doc.availabilityStatus).toBe('AVAILABLE');
        expect(doc.verifiedAt).toBeDefined();
        expect(doc.source).toBeDefined();
      }
    });

    it('2. Contains verified specialists in Ahmedabad, Mumbai, Delhi, and Bengaluru', () => {
      const cities = new Set(VERIFIED_DOCTOR_DATABASE.map((d) => d.city.toLowerCase()));
      expect(cities.has('ahmedabad')).toBe(true);
      expect(cities.has('mumbai')).toBe(true);
      expect(cities.has('delhi')).toBe(true);
      expect(cities.has('bengaluru')).toBe(true);
    });
  });

  // ============================================================
  // 2. MEDICAL SAFETY & EMERGENCY GUARDRAILS
  // ============================================================
  describe('Medical Safety Guardrails', () => {
    it('3. Triggers immediate medical emergency notice for acute symptoms (chest pain)', () => {
      const res = MedicalSafetyGuardrails.evaluateSafety('I have severe chest pain and breathlessness');
      expect(res.isEmergency).toBe(true);
      expect(res.emergencyMessage).toContain('MEDICAL EMERGENCY NOTICE');
      expect(res.emergencyMessage).toContain('112 / 108');
    });

    it('4. Triggers emergency notice for stroke, heart attack, or loss of consciousness', () => {
      const res1 = MedicalSafetyGuardrails.evaluateSafety('Someone having a heart attack');
      expect(res1.isEmergency).toBe(true);

      const res2 = MedicalSafetyGuardrails.evaluateSafety('Patient is unconscious and slurred speech');
      expect(res2.isEmergency).toBe(true);
    });

    it('5. Provider search returns 0 doctor options and emergency diagnostics when emergency is detected', async () => {
      const { doctors, diagnostics } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Need urgent help, experiencing severe chest pain and choking',
      });
      expect(doctors.length).toBe(0);
      expect(diagnostics.safetyCheck.isEmergency).toBe(true);
      expect(diagnostics.safetyCheck.emergencyMessage).toBeDefined();
    });

    it('6. Detects requests for medical diagnosis / prescription and provides safe administrative disclaimer', () => {
      const res = MedicalSafetyGuardrails.evaluateSafety('What disease do I have with red skin patches?');
      expect(res.isMedicalAdviceRequest).toBe(true);
      expect(res.safeGuidance).toContain('administrative concierge support');
      expect(res.safeGuidance).toContain('do not provide clinical diagnoses');
    });

    it('7. Detects medicine prescription inquiries and redirects safely', () => {
      const res = MedicalSafetyGuardrails.evaluateSafety('Prescribe me something for high fever and cough');
      expect(res.isMedicalAdviceRequest).toBe(true);
      expect(res.safeGuidance).toContain('administrative concierge support');
    });
  });

  // ============================================================
  // 3. MULTI-SOURCE SEARCH & FILTERING
  // ============================================================
  describe('Multi-Source Doctor Search & Resolution', () => {
    it('8. Finds dermatologists in Ahmedabad with transparent consultation fees', async () => {
      const { doctors, diagnostics } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        specialty: 'DERMATOLOGY',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(2);
      expect(diagnostics.resolvedSpecialty).toBe('DERMATOLOGY');
      expect(diagnostics.resolvedCity).toBe('Ahmedabad');
      for (const doc of doctors) {
        expect(doc.specialty).toBe('DERMATOLOGY');
        expect(doc.city).toBe('Ahmedabad');
        expect(doc.consultationFee).toBeGreaterThanOrEqual(1000);
      }
    });

    it('9. Resolves natural language query for cardiologist in Mumbai', async () => {
      const { doctors, diagnostics } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Find top cardiologists in Mumbai for heart checkup',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      expect(diagnostics.resolvedSpecialty).toBe('CARDIOLOGY');
      expect(diagnostics.resolvedCity).toBe('Mumbai');
      expect(doctors[0].specialty).toBe('CARDIOLOGY');
      expect(doctors[0].city).toBe('Mumbai');
    });

    it('10. Resolves doctor search by specific doctor name (Dr. Neha Shah)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Book an appointment with Dr. Neha Shah in Ahmedabad',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      expect(doctors[0].doctorName).toBe('Dr. Neha Shah');
      expect(doctors[0].hospital).toBe('KD Hospital');
    });

    it('11. Resolves doctor search by hospital affiliation (Apollo Hospitals Ahmedabad)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Find doctors at Apollo hospital in Ahmedabad',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      expect(doctors.some((d) => (d.hospital || '').toLowerCase().includes('apollo'))).toBe(true);
    });

    it('12. Filters by neighborhood / locality (Bodakdev in Ahmedabad)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        locality: 'Bodakdev',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      for (const doc of doctors) {
        const matches = (doc.locality || '').toLowerCase().includes('bodakdev') || (doc.address || '').toLowerCase().includes('bodakdev');
        expect(matches).toBe(true);
      }
    });

    it('13. Filters by gender preference (female doctor)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        specialty: 'DERMATOLOGY',
        gender: 'FEMALE',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      for (const doc of doctors) {
        expect(doc.gender).toBe('FEMALE');
      }
    });

    it('14. Filters by budget / max consultation fee', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        specialty: 'DERMATOLOGY',
        maxFee: 1200,
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      for (const doc of doctors) {
        expect(doc.consultationFee).toBeLessThanOrEqual(1200);
      }
    });

    it('15. Filters by appointment type (TELECONSULTATION)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        appointmentType: 'TELECONSULTATION',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      for (const doc of doctors) {
        expect(['TELECONSULTATION', 'BOTH']).toContain(doc.appointmentType);
      }
    });

    it('16. Resolves doctor search for Bengaluru (Dr. Devi Shetty)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Find Dr. Devi Shetty at Narayana Health in Bengaluru',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      expect(doctors[0].doctorName).toBe('Dr. Devi Shetty');
      expect(doctors[0].city).toBe('Bengaluru');
      expect(doctors[0].hospital).toBe('Narayana Health City');
    });

    it('17. Resolves doctor search for Delhi (Fortis Escorts)', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        rawInput: 'Find cardiologist at Fortis in Delhi',
      });
      expect(doctors.length).toBeGreaterThanOrEqual(1);
      expect(doctors[0].city).toBe('Delhi');
      expect(doctors[0].hospital).toBe('Fortis Escorts Heart Institute');
    });
  });

  // ============================================================
  // 4. ZERO FABRICATION & ISOLATION
  // ============================================================
  describe('Zero-Fabrication & Source Isolation', () => {
    it('18. Unconfigured external sources return [] without throwing errors', async () => {
      const apiSource = new DoctorBookingAPISource();
      expect(apiSource.isConfigured).toBe(false);
      const apiResults = await apiSource.search({ city: 'Ahmedabad' });
      expect(apiResults).toEqual([]);

      const telehealthSource = new TelehealthGatewaySource();
      expect(telehealthSource.isConfigured).toBe(false);
      const teleResults = await telehealthSource.search({ city: 'Ahmedabad' });
      expect(teleResults).toEqual([]);
    });

    it('19. Deduplicates candidates across multiple verified sources', async () => {
      const verifiedSource = new ProventaVerifiedHealthcareSource();
      const hospitalSource = new OfficialHospitalDirectorySource();
      const provider = new HealthcareDiscoveryProvider([verifiedSource, hospitalSource]);

      const { doctors, diagnostics } = await provider.searchDoctors({
        city: 'Ahmedabad',
        specialty: 'DERMATOLOGY',
      });

      expect(diagnostics.rawCandidateCount).toBeGreaterThanOrEqual(doctors.length);
      const docIds = doctors.map((d) => d.doctorId);
      const uniqueIds = new Set(docIds);
      expect(uniqueIds.size).toBe(docIds.length);
    });

    it('20. Returns maximum of 5 curated recommendations per cycle', async () => {
      const { doctors } = await healthcareDiscoveryProvider.searchDoctors({
        city: 'Ahmedabad',
        specialty: 'ALL',
        limit: 5,
      });
      expect(doctors.length).toBeLessThanOrEqual(5);
    });
  });

  // ============================================================
  // 5. ORCHESTRATION ADAPTER & AGENT INTEGRATION
  // ============================================================
  describe('Orchestration Adapter & Agent Integration', () => {
    it('21. HealthcareDiscoveryAdapter searches and converts doctors into OptionProposal format', async () => {
      const adapter = new HealthcareDiscoveryAdapter();
      const proposals = await adapter.search({
        category: 'appointments',
        rawInput: 'Find dermatologist in Ahmedabad under 1500',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(1);
      expect(proposals.length).toBeLessThanOrEqual(5);

      const first = proposals[0];
      expect(first.providerId).toBe('healthcare_discovery');
      expect(first.environment).toBe('REAL');
      expect(first.isMock).toBe(false);
      expect(first.priceAmount).toBeGreaterThan(0);
      expect(first.priceFormatted).toMatch(/^₹/);
      expect(first.metadata?.isHealthcare).toBe(true);
      expect(first.metadata?.doctorId).toBeDefined();
    });

    it('22. HealthcareDiscoveryAdapter generates valid quote and executes appointment brief with customer approval', async () => {
      const adapter = new HealthcareDiscoveryAdapter();
      const quote = await adapter.getQuote({ consultationFee: 1200 });
      expect(quote.quoteAmount).toBe(1200);
      expect(quote.currency).toBe('INR');
      expect(quote.quoteId).toMatch(/^MED-QTE-/);

      const proposals = await adapter.search({
        category: 'healthcare',
        rawInput: 'Dr. Neha Shah Ahmedabad',
      });
      expect(proposals.length).toBeGreaterThanOrEqual(1);

      const execResult = await adapter.execute(proposals[0], {
        scheduledTime: '2026-10-05 11:00 AM',
        specialRequests: 'Skin consultation',
      });

      expect(execResult.success).toBe(true);
      expect(execResult.status).toBe('CONFIRMED');
      expect(execResult.externalReferenceId).toMatch(/^MED-CONF-/);
      expect(execResult.confirmedDetails?.executionMode).toBe('HUMAN_CONCIERGE_CONFIRMED');
    });

    it('23. HealthcareDiscoveryAdapter verifies reference and cancels safely', async () => {
      const adapter = new HealthcareDiscoveryAdapter();
      const verification = await adapter.verify('MED-CONF-123456-AHM');
      expect(verification.verified).toBe(true);
      expect(verification.status).toBe('CONFIRMED');

      const cancellation = await adapter.cancelBooking('MED-CONF-123456-AHM', 'Patient requested reschedule');
      expect(cancellation.success).toBe(true);
      expect(cancellation.cancellationRef).toMatch(/^MED-CANC-/);
    });

    it('24. AdapterRegistry and findAgentForTask route healthcare and doctor categories to HealthcareAgent', () => {
      const adapters = AdapterRegistry.getAdaptersForCategory('healthcare');
      expect(adapters.length).toBeGreaterThanOrEqual(1);
      expect(adapters.some((a) => a.providerId === 'healthcare_discovery')).toBe(true);

      const agent = findAgentForTask('healthcare', 'Find doctor in Ahmedabad');
      expect(agent).toBeInstanceOf(HealthcareAgent);

      const doctorAgent = findAgentForTask('other', 'Need a dermatologist for skin allergy');
      expect(doctorAgent).toBeInstanceOf(HealthcareAgent);
    });

    it('25. TaskDecisionEngine classifies doctor consultation inquiries into APPOINTMENTS category', () => {
      const decision = TaskDecisionEngine.evaluate({
        rawInput: 'Book an appointment with Dr. Neha Shah in Bodakdev',
      });
      expect(decision.category).toBe('APPOINTMENTS');
      expect(decision.isProhibited).toBe(false);
      expect(decision.approvalRequired).toBe(true);
    });
  });
});
