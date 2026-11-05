/**
 * PROVENTA — Industrial Procurement Platform
 * Business Identity & Tax Identification Validators
 */

import { z } from 'zod';

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}(PLC|PTC|NPL|ULL|FLC)[0-9]{6}$/i;
export const LLPIN_REGEX = /^[A-Z]{3}-[0-9]{4}$|^[A-Z0-9]{7,8}$/i;
export const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

// Standard Indian state codes used in GSTIN prefix
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
};

/**
 * Validate GSTIN structure and return associated state
 */
export function validateGstin(gstin: string): { valid: boolean; stateName?: string; error?: string } {
  const clean = gstin.trim().toUpperCase();
  if (!clean) return { valid: false, error: 'GSTIN is required' };
  if (clean.length !== 15) return { valid: false, error: 'GSTIN must be exactly 15 characters' };
  if (!GSTIN_REGEX.test(clean)) return { valid: false, error: 'Invalid GSTIN format (e.g., 24AAACG1928K1Z5)' };

  const stateCode = clean.substring(0, 2);
  const stateName = GST_STATE_CODES[stateCode];
  if (!stateName) return { valid: false, error: `Invalid GST state code prefix: ${stateCode}` };

  const panFromGst = clean.substring(2, 12);
  if (!PAN_REGEX.test(panFromGst)) {
    return { valid: false, error: 'Embedded PAN in GSTIN is invalid' };
  }

  return { valid: true, stateName };
}

/**
 * Validate PAN format and verify entity type character
 */
export function validatePan(pan: string, expectedEntityType?: string): { valid: boolean; entityChar?: string; error?: string } {
  const clean = pan.trim().toUpperCase();
  if (!clean) return { valid: false, error: 'PAN is required' };
  if (clean.length !== 10) return { valid: false, error: 'PAN must be exactly 10 characters' };
  if (!PAN_REGEX.test(clean)) return { valid: false, error: 'Invalid PAN format (e.g., AAACG1928K)' };

  const entityChar = clean.charAt(3); // 4th character
  // C: Company, P: Person, H: HUF, F: Firm/LLP, A: AOP, T: Trust, B: BOI, L: Local Authority, J: Artificial Juridical Person, G: Government
  return { valid: true, entityChar };
}

/**
 * Validate CIN (Corporate Identification Number)
 */
export function validateCin(cin: string): { valid: boolean; error?: string } {
  const clean = cin.trim().toUpperCase();
  if (!clean) return { valid: true }; // optional if not Pvt Ltd / Ltd
  if (clean.length !== 21) return { valid: false, error: 'CIN must be exactly 21 characters' };
  if (!CIN_REGEX.test(clean)) return { valid: false, error: 'Invalid CIN format (e.g., U45200GJ2018PTC104521)' };
  return { valid: true };
}

/**
 * Validate LLPIN (Limited Liability Partnership Identification Number)
 */
export function validateLlpin(llpin: string): { valid: boolean; error?: string } {
  const clean = llpin.trim().toUpperCase();
  if (!clean) return { valid: true }; // optional
  if (!LLPIN_REGEX.test(clean)) return { valid: false, error: 'Invalid LLPIN format (e.g., AAB-1234 or 7-8 characters)' };
  return { valid: true };
}

/**
 * Validate Udyam Registration (MSME)
 */
export function validateUdyam(udyam: string): { valid: boolean; error?: string } {
  const clean = udyam.trim().toUpperCase();
  if (!clean) return { valid: true }; // optional
  if (!UDYAM_REGEX.test(clean)) return { valid: false, error: 'Invalid Udyam format (e.g., UDYAM-GJ-01-0012345)' };
  return { valid: true };
}

// Zod Schemas for wizard step validations
export const step1IdentitySchema = z.object({
  name: z.string().min(2, 'Trade name must be at least 2 characters'),
  legalName: z.string().min(2, 'Legal business name must be at least 2 characters'),
  entityType: z.enum([
    'SOLE_PROPRIETORSHIP',
    'PARTNERSHIP',
    'LIMITED_LIABILITY_PARTNERSHIP',
    'PRIVATE_LIMITED',
    'PUBLIC_LIMITED',
    'INDIVIDUAL',
    'OTHER',
  ]),
  yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()),
  shortDescription: z.string().max(250).optional(),
  description: z.string().max(3000).optional(),
  industry: z.string().default('Construction & Infrastructure'),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  registeredOffice: z.object({
    addressLine1: z.string().min(5, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    area: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    district: z.string().min(2, 'District is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(PINCODE_REGEX, 'Valid 6-digit PIN code is required'),
    country: z.string().default('India'),
  }),
});

export const step2TaxSchema = z.object({
  gstNumber: z.string().regex(GSTIN_REGEX, 'Valid 15-character GSTIN is required'),
  pan: z.string().regex(PAN_REGEX, 'Valid 10-character PAN is required'),
  cin: z.string().optional().or(z.literal('')),
  llpin: z.string().optional().or(z.literal('')),
  udyamNumber: z.string().optional().or(z.literal('')),
});

export const authorizedContactSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  designation: z.string().min(2, 'Designation is required'),
  email: z.string().email('Valid official email is required'),
  phone: z.string().min(10, 'Valid contact phone number is required'),
  isPrimary: z.boolean().default(false),
  authorizedSignatory: z.boolean().default(false),
  department: z.string().optional(),
});

export const step3ContactsSchema = z.object({
  contacts: z.array(authorizedContactSchema).min(1, 'At least one authorized contact is mandatory'),
});

export const step4RoleSchema = z.object({
  platformRole: z.enum(['BUYER', 'SUPPLIER', 'BOTH']),
});

export const step5BuyerSchema = z.object({
  industrySegment: z.string().min(2, 'Industry segment is required'),
  procurementCategories: z.array(z.string()).min(1, 'Select at least one procurement category'),
  materialsOfInterest: z.array(z.string()).optional(),
  annualBudget: z.string().optional(),
  purchaseFrequency: z.string().optional(),
  projectLocations: z.array(
    z.object({
      name: z.string().min(2, 'Project site name is required'),
      address: z.string().min(5, 'Site address is required'),
      district: z.string().min(2, 'District is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z.string().regex(PINCODE_REGEX, 'Valid 6-digit PIN code is required'),
      siteEngineerContact: z.string().optional(),
      active: z.boolean().default(true),
    })
  ).optional(),
});

export const step5SupplierSchema = z.object({
  supplierType: z.string().min(2, 'Supplier type is required'),
  operatingCategories: z.array(z.string()).min(1, 'Select at least one operating category'),
  subcategories: z.array(z.string()).optional(),
  brandsOffered: z.array(z.string()).min(1, 'List at least one brand offered'),
  manufacturingCapacity: z.string().optional(),
  monthlySupplyCapacity: z.string().optional(),
  minimumOrderValue: z.number().int().nonnegative().optional(),
  warehouseLocations: z.array(
    z.object({
      name: z.string().min(2, 'Warehouse/Yard name is required'),
      address: z.string().min(5, 'Address is required'),
      district: z.string().min(2, 'District is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z.string().regex(PINCODE_REGEX, 'Valid 6-digit PIN code is required'),
      capacitySqFt: z.number().optional(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
    })
  ).optional(),
  serviceableDistricts: z.array(z.string()).min(1, 'Select at least one serviceable district'),
  serviceableStates: z.array(z.string()).min(1, 'Select at least one serviceable state'),
  panIndiaDelivery: z.boolean().default(false),
  standardLeadTimeDays: z.number().int().min(1).default(3),
  fleetDetails: z.string().optional(),
});
