/**
 * PROVENTA — Family Continuity & Records Module
 * 
 * Secure organization of nominees, succession documents, emergency directives,
 * and key professional advisors. Does not provide legal succession opinions.
 */

import {
  FamilyContinuityDTO,
  EmergencyContact,
} from './types';

interface ContinuityStore {
  records: Map<string, FamilyContinuityDTO>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaContinuityStore: ContinuityStore | undefined;
}

function getContinuityStore(): ContinuityStore {
  if (!globalThis.__proventaContinuityStore) {
    const store: ContinuityStore = {
      records: new Map(),
    };

    const demoFamilyId = 'fam_sharma_heritage';

    const demoRecord: FamilyContinuityDTO = {
      emergencyInstructions:
        'In any critical medical or unexpected circumstance: Contact Vikram Mehta (Family CA) for financial power of attorney and banking mandates. Property documents and original share certificates are in SBI Worli Safe Deposit Locker No. 412 (Key held jointly by Rajesh and Sunita Sharma).',
      importantContacts: [
        {
          id: 'con_1',
          name: 'Vikram Mehta, FCA',
          role: 'CHARTERED_ACCOUNTANT',
          phone: '+91 98200 12345',
          email: 'vikram.mehta@vmassociates.in',
          organization: 'VM & Associates Chartered Accountants, Fort, Mumbai',
          notes: 'Handles family direct tax, advance tax schedules, and corporate audit for Apex Precision.',
        },
        {
          id: 'con_2',
          name: 'Advocate Sneha Kulkarni',
          role: 'LAWYER',
          phone: '+91 98210 98765',
          email: 'sneha@kulkarnichambers.com',
          organization: 'Kulkarni Chambers, Bombay High Court',
          notes: 'Drafted family trust deed and registered mutual wills in 2023.',
        },
        {
          id: 'con_3',
          name: 'Dr. Farokh Udwadia',
          role: 'FAMILY_PHYSICIAN',
          phone: '+91 98201 55555',
          email: 'dr.udwadia@breachcandy.org',
          organization: 'Breach Candy Hospital Trust',
          notes: 'Primary physician for Rajesh and Sunita Sharma.',
        },
      ],
      nomineeRecords: [
        {
          assetOrPolicyName: 'HDFC Term Life (₹10 Cr)',
          nomineeName: 'Sunita Sharma (70%), Aarav Sharma (30%)',
          relationship: 'Spouse & Son',
          sharePercentage: 100,
        },
        {
          assetOrPolicyName: 'Worli Penthouse',
          nomineeName: 'Sunita Sharma (Joint Surviving Owner)',
          relationship: 'Spouse',
          sharePercentage: 100,
        },
        {
          assetOrPolicyName: 'Zerodha Demat Portfolio',
          nomineeName: 'Aarav Sharma',
          relationship: 'Son',
          sharePercentage: 100,
        },
      ],
      willsAndSuccessionDocumentIds: ['doc_will_registered_2023', 'doc_trust_deed_2020'],
      lastUpdated: '2026-01-20T12:00:00.000Z',
    };

    store.records.set(demoFamilyId, demoRecord);
    globalThis.__proventaContinuityStore = store;
  }
  return globalThis.__proventaContinuityStore;
}

export function getFamilyContinuity(familyId: string): FamilyContinuityDTO {
  const store = getContinuityStore();
  const record = store.records.get(familyId);
  if (!record) {
    return {
      emergencyInstructions: 'No emergency instructions recorded yet.',
      importantContacts: [],
      nomineeRecords: [],
      willsAndSuccessionDocumentIds: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  return record;
}

export function updateEmergencyInstructions(familyId: string, instructions: string): FamilyContinuityDTO {
  const store = getContinuityStore();
  const record = getFamilyContinuity(familyId);
  record.emergencyInstructions = instructions;
  record.lastUpdated = new Date().toISOString();
  store.records.set(familyId, record);
  return record;
}

export function addEmergencyContact(familyId: string, contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
  const store = getContinuityStore();
  const record = getFamilyContinuity(familyId);
  const newContact: EmergencyContact = {
    ...contact,
    id: `con_${Date.now()}`,
  };
  record.importantContacts.push(newContact);
  record.lastUpdated = new Date().toISOString();
  store.records.set(familyId, record);
  return newContact;
}
