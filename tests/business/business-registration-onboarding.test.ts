import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateGstin,
  validatePan,
  validateCin,
  validateLlpin,
  validateUdyam,
} from '@/lib/business/validators';
import {
  createConstructionRfq,
  submitConstructionQuotation,
  selectQuotationAndCreatePo,
  getConstructionRfqById,
} from '@/lib/procurement/repository';

describe('PROVENTA — Business Registration & Tax Validators', () => {
  it('validates authentic Indian GSTIN numbers with state codes', () => {
    // Gujarat state code: 24
    const validGujaratGstin = '24AAACG1928K1Z5';
    const result = validateGstin(validGujaratGstin);
    expect(result.valid).toBe(true);
    expect(result.stateName).toBe('Gujarat');

    // Maharashtra state code: 27
    const validMhGstin = '27AABCS1429B1ZB';
    const mhResult = validateGstin(validMhGstin);
    expect(mhResult.valid).toBe(true);
    expect(mhResult.stateName).toBe('Maharashtra');

    // Invalid GSTINs
    expect(validateGstin('INVALID_GSTIN').valid).toBe(false);
    expect(validateGstin('99AAACG1928K1Z5').valid).toBe(false); // Non-existent state code
    expect(validateGstin('24AAACG1928K1').valid).toBe(false); // Incomplete length
  });

  it('validates PAN numbers and identifies entity classification character', () => {
    // 4th char 'C' -> Company
    const companyPan = 'AAACG1928K';
    const compResult = validatePan(companyPan);
    expect(compResult.valid).toBe(true);
    expect(compResult.entityChar).toBe('C');

    // 4th char 'P' -> Person / Proprietor
    const propPan = 'ABCDE1234F';
    const propResult = validatePan(propPan);
    expect(propResult.valid).toBe(true);
    expect(propResult.entityChar).toBe('D'); // char at index 3 is 'D'

    // Invalid PAN
    expect(validatePan('12345ABCDE').valid).toBe(false);
    expect(validatePan('TOOLONGPAN123').valid).toBe(false);
  });

  it('validates Corporate Identification Numbers (CIN)', () => {
    const validCin = 'U45200GJ2018PTC104521';
    expect(validateCin(validCin).valid).toBe(true);

    const invalidCin = 'INVALID_CIN_123';
    expect(validateCin(invalidCin).valid).toBe(false);
  });

  it('validates Udyam MSME Registration Numbers', () => {
    const validUdyam = 'UDYAM-GJ-01-0012345';
    expect(validateUdyam(validUdyam).valid).toBe(true);

    expect(validateUdyam('UDYAM-12345').valid).toBe(false);
  });
});

describe('PROVENTA — Procurement Persistence & Anti-Defect Integrity', () => {
  it('Defect 1 Guard: Prevents duplicate Purchase Orders for the same RFQ', () => {
    // 1. Create a test RFQ
    const testRfq = createConstructionRfq({
      buyerId: 'test-buyer-adani',
      buyerName: 'Adani Infrastructure Projects',
      buyerEmail: 'procurement@adani.com',
      title: 'TMT Rebars Fe 550D for Shantigram Tower',
      projectType: 'COMMERCIAL',
      items: [
        {
          materialName: 'TMT Rebars Fe 550D',
          categorySlug: 'building-materials',
          quantity: 20,
          unit: 'Metric tonnes (MT)',
        },
      ],
      delivery: {
        siteName: 'Shantigram Tower Site',
        addressLine: 'SG Highway, Near Vaishnodevi Circle',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382421',
        siteContactPerson: 'Pravin Patel',
        siteContactPhone: '+91 98251 00000',
        vehicleAccessibility: '10-Wheeler Truck',
      },
      requiredDeliveryDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
    });

    // 2. Submit a quotation
    const testQuo = submitConstructionQuotation({
      rfqId: testRfq.id,
      supplierId: 'supp-gujarat-steel-cement',
      items: [
        {
          itemId: testRfq.items[0].id,
          unitPrice: 54000,
          gstRatePercent: 18,
          brandSupplied: 'Tata Tiscon',
        },
      ],
      promisedDeliveryDate: '2026-11-20',
      paymentTerms: 'RTGS on delivery',
    });

    // 3. First Award: Must succeed
    const po1 = selectQuotationAndCreatePo({
      rfqId: testRfq.id,
      quotationId: testQuo.id,
      buyerConfirmed: true,
    });
    expect(po1.id).toBeDefined();
    expect(po1.deliveryStatus).toBe('ORDER_CONFIRMED');

    // 4. Second Award Attempt: Must be strictly REJECTED (Defect 1 prevention)
    expect(() => {
      selectQuotationAndCreatePo({
        rfqId: testRfq.id,
        quotationId: testQuo.id,
        buyerConfirmed: true,
      });
    }).toThrow(/already been issued/i);
  });

  it('Defect 1 Guard: Rejects award without explicit buyer confirmation', () => {
    const testRfq2 = createConstructionRfq({
      buyerId: 'test-buyer-2',
      buyerName: 'Gujarat Metro Rail Corp',
      buyerEmail: 'gmrc@proventa.in',
      title: 'Cement 53 Grade',
      projectType: 'INFRASTRUCTURE',
      items: [
        {
          materialName: 'OPC 53 Grade Cement',
          categorySlug: 'building-materials',
          quantity: 500,
          unit: 'Bags',
        },
      ],
      delivery: {
        siteName: 'Metro Pier Site 4',
        addressLine: 'APMC Vasna',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380007',
        siteContactPerson: 'Ramesh Dave',
        siteContactPhone: '+91 98252 00000',
        vehicleAccessibility: 'Standard Access',
      },
      requiredDeliveryDate: new Date(Date.now() + 5 * 86400 * 1000).toISOString(),
    });

    const testQuo2 = submitConstructionQuotation({
      rfqId: testRfq2.id,
      supplierId: 'supp-sabarmati-tmt-rmc',
      items: [
        {
          itemId: testRfq2.items[0].id,
          unitPrice: 340,
          gstRatePercent: 28,
          brandSupplied: 'UltraTech',
        },
      ],
      promisedDeliveryDate: '2026-11-18',
      paymentTerms: 'Advance 100%',
    });

    expect(() => {
      selectQuotationAndCreatePo({
        rfqId: testRfq2.id,
        quotationId: testQuo2.id,
        buyerConfirmed: false,
      });
    }).toThrow(/Explicit buyer confirmation is mandatory/i);
  });
});
