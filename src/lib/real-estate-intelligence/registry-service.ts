/**
 * PROVENTA — MODULE 1: LIVING PROPERTY REGISTRY ENGINE
 * Generates permanent unique PROVENTA Property IDs (PV-PROP-...),
 * normalizes addresses for duplicate detection, enforces 5-tier hierarchy,
 * and separates public/verified intelligence from private owner records.
 */

import crypto from 'node:crypto';

export function generateProventaPropertyId(city = 'Ahmedabad'): string {
  const cityCode = city.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'IND';
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PV-PROP-${cityCode}-${year}-${suffix}`;
}

export function normalizePropertyAddressKey(params: {
  address: string;
  locality: string;
  city?: string;
  buildingName?: string | null;
  unitNumber?: string | null;
}): string {
  const parts = [
    params.city || 'ahmedabad',
    params.locality,
    params.buildingName || '',
    params.unitNumber || '',
    params.address,
  ];
  return parts
    .join('|')
    .toLowerCase()
    .replace(/[^a-z0-9|]/g, '')
    .replace(/\|+/g, '|');
}

export interface DuplicateCandidate {
  id: string;
  proventaPropertyId: string;
  title: string;
  normalizedAddressKey: string;
  reraNumber?: string | null;
}

export function detectDuplicateRegistryProperty(
  incoming: { normalizedAddressKey: string; reraNumber?: string | null; unitNumber?: string | null },
  existing: readonly DuplicateCandidate[]
): { isDuplicate: boolean; matchedPropertyId?: string; reason?: string } {
  for (const item of existing) {
    if (item.normalizedAddressKey === incoming.normalizedAddressKey) {
      return {
        isDuplicate: true,
        matchedPropertyId: item.proventaPropertyId,
        reason: `EXACT_ADDRESS_MATCH: Matches existing registry property ${item.proventaPropertyId}.`,
      };
    }
    if (
      incoming.reraNumber &&
      incoming.unitNumber &&
      item.reraNumber &&
      item.reraNumber.trim().toUpperCase() === incoming.reraNumber.trim().toUpperCase() &&
      item.normalizedAddressKey.includes(incoming.unitNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
    ) {
      return {
        isDuplicate: true,
        matchedPropertyId: item.proventaPropertyId,
        reason: `RERA_UNIT_MATCH: Same RERA registration (${incoming.reraNumber}) and unit already registered as ${item.proventaPropertyId}.`,
      };
    }
  }
  return { isDuplicate: false };
}

export function formatHierarchyBreadcrumbs(record: {
  landParcelCode?: string | null;
  projectSlug?: string | null;
  buildingName?: string | null;
  unitNumber?: string | null;
  proventaPropertyId: string;
}): string[] {
  const chain: string[] = [];
  if (record.landParcelCode) chain.push(`Land: ${record.landParcelCode}`);
  if (record.projectSlug) chain.push(`Project: ${record.projectSlug}`);
  if (record.buildingName) chain.push(`Building: ${record.buildingName}`);
  if (record.unitNumber) chain.push(`Unit: ${record.unitNumber}`);
  chain.push(`Property: ${record.proventaPropertyId}`);
  return chain;
}
