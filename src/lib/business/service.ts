/**
 * PROVENTA — Industrial Procurement Platform
 * Business Registration, Onboarding & Document Verification Service
 */

import { db } from '@/lib/db';
import { slugify } from '@/lib/utils';
import type {
  PlatformRole,
  BusinessEntityType,
  BusinessVerificationStatus,
  BusinessDocumentType,
} from '@prisma/client';
import type {
  Step1IdentityInput,
  Step2TaxInput,
  Step3ContactsInput,
  Step4RoleInput,
  Step5BuyerInput,
  Step5SupplierInput,
  BusinessRegistrationWizardState,
  UploadedDocumentRecord,
} from './types';
import {
  validateGstin,
  validatePan,
  validateCin,
  validateLlpin,
  validateUdyam,
} from './validators';
import { sendBusinessNotification } from './notifications';

/**
 * Record an entry in the business audit log
 */
export async function createBusinessAuditLog(params: {
  businessId: string;
  userId?: string;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    return await db.businessAuditLog.create({
      data: {
        businessId: params.businessId,
        userId: params.userId,
        action: params.action,
        details: params.details,
        metadata: (params.metadata as any) ?? undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (err) {
    console.error('[createBusinessAuditLog] Error logging:', err);
    return null;
  }
}

/**
 * Get or initialize the active business profile for the given user
 */
export async function getOrCreateUserBusiness(userId: string) {
  // Check if user already owns a business
  let business = await db.business.findFirst({
    where: { ownerId: userId },
    include: {
      buyerProfile: true,
      supplierProfile: {
        include: { products: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      businessAuditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!business) {
    // Generate unique slug
    const user = await db.user.findUnique({ where: { id: userId } });
    const baseSlug = slugify(user?.name || 'industrial-enterprise');
    let slug = baseSlug;
    let counter = 1;
    while (await db.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    business = await db.business.create({
      data: {
        ownerId: userId,
        name: user?.name ? `${user.name} Enterprise` : 'New Industrial Enterprise',
        slug,
        city: 'Ahmedabad',
        state: 'Gujarat',
        platformRole: 'BUYER',
        verificationStatus: 'DRAFT',
        onboardingStep: 1,
        onboardingComplete: false,
      },
      include: {
        buyerProfile: true,
        supplierProfile: {
          include: { products: true },
        },
        documents: true,
        businessAuditLogs: true,
      },
    });

    await createBusinessAuditLog({
      businessId: business.id,
      userId,
      action: 'BUSINESS_DRAFT_CREATED',
      details: 'Initial onboarding draft started.',
    });
  }

  return business;
}

/**
 * Save Step 1: Business Identity
 */
export async function saveStep1Identity(params: {
  userId: string;
  businessId?: string;
  data: Step1IdentityInput;
  ipAddress?: string;
}) {
  const business = params.businessId
    ? await db.business.findUnique({ where: { id: params.businessId } })
    : await getOrCreateUserBusiness(params.userId);

  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  // Ensure unique slug if name changed
  let slug = business.slug;
  if (params.data.name && params.data.name !== business.name) {
    const base = slugify(params.data.name);
    let candidate = base;
    let i = 1;
    while (await db.business.findFirst({ where: { slug: candidate, NOT: { id: business.id } } })) {
      candidate = `${base}-${i}`;
      i++;
    }
    slug = candidate;
  }

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      name: params.data.name,
      legalName: params.data.legalName,
      slug,
      entityType: params.data.entityType,
      yearEstablished: params.data.yearEstablished,
      shortDescription: params.data.shortDescription,
      description: params.data.description,
      website: params.data.website || null,
      logoUrl: params.data.logoUrl || business.logoUrl,
      addressLine1: params.data.registeredOffice.addressLine1,
      addressLine2: params.data.registeredOffice.addressLine2,
      area: params.data.registeredOffice.area,
      city: params.data.registeredOffice.city,
      state: params.data.registeredOffice.state,
      postalCode: params.data.registeredOffice.postalCode,
      country: params.data.registeredOffice.country || 'India',
      onboardingStep: Math.max(business.onboardingStep || 1, 2),
    },
    include: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_1_IDENTITY_SAVED',
    details: `Updated legal name to "${params.data.legalName}" and entity type to ${params.data.entityType}.`,
    ipAddress: params.ipAddress,
  });

  return updated;
}

/**
 * Save Step 2: Legal & Tax Information (GSTIN, PAN, CIN, LLPIN, Udyam)
 */
export async function saveStep2Tax(params: {
  userId: string;
  businessId: string;
  data: Step2TaxInput;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  // Validate GSTIN
  const gstinResult = validateGstin(params.data.gstNumber);
  if (!gstinResult.valid) {
    throw new Error(gstinResult.error || 'Invalid GSTIN');
  }

  // Validate PAN
  const panResult = validatePan(params.data.pan);
  if (!panResult.valid) {
    throw new Error(panResult.error || 'Invalid PAN');
  }

  // Validate CIN if provided
  if (params.data.cin) {
    const cinResult = validateCin(params.data.cin);
    if (!cinResult.valid) throw new Error(cinResult.error || 'Invalid CIN');
  }

  // Validate LLPIN if provided
  if (params.data.llpin) {
    const llpinResult = validateLlpin(params.data.llpin);
    if (!llpinResult.valid) throw new Error(llpinResult.error || 'Invalid LLPIN');
  }

  // Validate Udyam if provided
  if (params.data.udyamNumber) {
    const udyamResult = validateUdyam(params.data.udyamNumber);
    if (!udyamResult.valid) throw new Error(udyamResult.error || 'Invalid Udyam number');
  }

  const cleanGstin = params.data.gstNumber.trim().toUpperCase();
  const cleanPan = params.data.pan.trim().toUpperCase();

  // Check for duplicate GSTIN
  const duplicateGst = await db.business.findFirst({
    where: {
      gstNumber: cleanGstin,
      NOT: { id: business.id },
    },
  });
  if (duplicateGst) {
    throw new Error(`GSTIN ${cleanGstin} is already registered by another business on PROVENTA.`);
  }

  // Check for duplicate PAN
  const duplicatePan = await db.business.findFirst({
    where: {
      pan: cleanPan,
      NOT: { id: business.id },
    },
  });
  if (duplicatePan) {
    throw new Error(`PAN ${cleanPan} is already registered on PROVENTA.`);
  }

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      gstNumber: cleanGstin,
      pan: cleanPan,
      cin: params.data.cin?.trim().toUpperCase() || null,
      llpin: params.data.llpin?.trim().toUpperCase() || null,
      udyamNumber: params.data.udyamNumber?.trim().toUpperCase() || null,
      onboardingStep: Math.max(business.onboardingStep || 1, 3),
    },
    include: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_2_TAX_SAVED',
    details: `Configured GSTIN ${cleanGstin} and PAN ${cleanPan}.`,
    ipAddress: params.ipAddress,
  });

  return updated;
}

/**
 * Save Step 3: Authorized Business Contacts
 */
export async function saveStep3Contacts(params: {
  userId: string;
  businessId: string;
  data: Step3ContactsInput;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  if (!params.data.contacts || params.data.contacts.length === 0) {
    throw new Error('At least one authorized contact is mandatory.');
  }

  // Ensure at least one primary contact
  const hasPrimary = params.data.contacts.some((c) => c.isPrimary);
  const contacts = params.data.contacts.map((c, idx) => ({
    ...c,
    isPrimary: hasPrimary ? c.isPrimary : idx === 0,
  }));

  const primary = contacts.find((c) => c.isPrimary) || contacts[0];

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      contactEmail: primary.email,
      contactPhone: primary.phone,
      authorizedContacts: contacts as any,
      onboardingStep: Math.max(business.onboardingStep || 1, 4),
    },
    include: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_3_CONTACTS_SAVED',
    details: `Saved ${contacts.length} authorized contact(s). Primary contact: ${primary.name} (${primary.designation}).`,
    ipAddress: params.ipAddress,
  });

  return updated;
}

/**
 * Save Step 4: Platform Role Selection (BUYER, SUPPLIER, or BOTH)
 */
export async function saveStep4Role(params: {
  userId: string;
  businessId: string;
  data: Step4RoleInput;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  const role = params.data.platformRole;

  // Initialize corresponding profile records if they don't exist yet
  if (role === 'BUYER' || role === 'BOTH') {
    await db.buyerProfile.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        industrySegment: 'General Construction & Infrastructure',
        procurementCategories: ['Structural Steel', 'Cement & RMC', 'Aggregates'],
      },
    });
  }

  if (role === 'SUPPLIER' || role === 'BOTH') {
    await db.supplierProfile.upsert({
      where: { businessId: business.id },
      update: {},
      create: {
        businessId: business.id,
        supplierType: 'Authorized Distributor',
        operatingCategories: ['building-materials'],
        brandsOffered: ['UltraTech', 'Tata Tiscon'],
        serviceableDistricts: ['Ahmedabad', 'Gandhinagar'],
        serviceableStates: ['Gujarat'],
        panIndiaDelivery: false,
      },
    });
  }

  // Update user role assignments in DB
  const existingAssignments = await db.userRoleAssignment.findMany({
    where: { userId: params.userId },
  });
  const existingRoles = existingAssignments.map((a) => a.role);

  if (role === 'BUYER' || role === 'BOTH') {
    if (!existingRoles.includes('BUYER')) {
      await db.userRoleAssignment.create({
        data: { userId: params.userId, role: 'BUYER' },
      }).catch(() => {});
    }
  }

  if (role === 'SUPPLIER' || role === 'BOTH') {
    if (!existingRoles.includes('SUPPLIER')) {
      await db.userRoleAssignment.create({
        data: { userId: params.userId, role: 'SUPPLIER' },
      }).catch(() => {});
    }
  }

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      platformRole: role,
      onboardingStep: Math.max(business.onboardingStep || 1, 5),
    },
    include: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_4_ROLE_SELECTED',
    details: `Selected platform role: ${role}.`,
    ipAddress: params.ipAddress,
  });

  return updated;
}

/**
 * Save Step 5: Role-Specific Onboarding (Buyer)
 */
export async function saveStep5Buyer(params: {
  userId: string;
  businessId: string;
  data: Step5BuyerInput;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({
    where: { id: params.businessId },
    include: { buyerProfile: true },
  });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  const buyerProfile = await db.buyerProfile.upsert({
    where: { businessId: business.id },
    update: {
      industrySegment: params.data.industrySegment,
      procurementCategories: params.data.procurementCategories,
      materialsOfInterest: params.data.materialsOfInterest || [],
      annualBudget: params.data.annualBudget,
      purchaseFrequency: params.data.purchaseFrequency,
      projectLocations: params.data.projectLocations ? (params.data.projectLocations as any) : undefined,
      billingAddresses: params.data.billingAddresses ? (params.data.billingAddresses as any) : undefined,
      shippingAddresses: params.data.shippingAddresses ? (params.data.shippingAddresses as any) : undefined,
    },
    create: {
      businessId: business.id,
      industrySegment: params.data.industrySegment,
      procurementCategories: params.data.procurementCategories,
      materialsOfInterest: params.data.materialsOfInterest || [],
      annualBudget: params.data.annualBudget,
      purchaseFrequency: params.data.purchaseFrequency,
      projectLocations: params.data.projectLocations ? (params.data.projectLocations as any) : undefined,
      billingAddresses: params.data.billingAddresses ? (params.data.billingAddresses as any) : undefined,
      shippingAddresses: params.data.shippingAddresses ? (params.data.shippingAddresses as any) : undefined,
    },
  });

  await db.business.update({
    where: { id: business.id },
    data: {
      onboardingStep: Math.max(business.onboardingStep || 1, 6),
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_5_BUYER_ONBOARDING_SAVED',
    details: `Saved buyer requirements for categories: ${params.data.procurementCategories.join(', ')}.`,
    ipAddress: params.ipAddress,
  });

  return buyerProfile;
}

/**
 * Save Step 5: Role-Specific Onboarding (Supplier & Product Catalogue)
 */
export async function saveStep5Supplier(params: {
  userId: string;
  businessId: string;
  data: Step5SupplierInput;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({
    where: { id: params.businessId },
    include: { supplierProfile: true },
  });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  const supplierProfile = await db.supplierProfile.upsert({
    where: { businessId: business.id },
    update: {
      supplierType: params.data.supplierType,
      operatingCategories: params.data.operatingCategories,
      subcategories: params.data.subcategories || [],
      brandsOffered: params.data.brandsOffered,
      manufacturingCapacity: params.data.manufacturingCapacity,
      monthlySupplyCapacity: params.data.monthlySupplyCapacity,
      minimumOrderValue: params.data.minimumOrderValue,
      warehouseLocations: params.data.warehouseLocations ? (params.data.warehouseLocations as any) : undefined,
      serviceableDistricts: params.data.serviceableDistricts,
      serviceableStates: params.data.serviceableStates,
      panIndiaDelivery: params.data.panIndiaDelivery ?? false,
      standardLeadTimeDays: params.data.standardLeadTimeDays || 3,
      fleetDetails: params.data.fleetDetails,
    },
    create: {
      businessId: business.id,
      supplierType: params.data.supplierType,
      operatingCategories: params.data.operatingCategories,
      subcategories: params.data.subcategories || [],
      brandsOffered: params.data.brandsOffered,
      manufacturingCapacity: params.data.manufacturingCapacity,
      monthlySupplyCapacity: params.data.monthlySupplyCapacity,
      minimumOrderValue: params.data.minimumOrderValue,
      warehouseLocations: params.data.warehouseLocations ? (params.data.warehouseLocations as any) : undefined,
      serviceableDistricts: params.data.serviceableDistricts,
      serviceableStates: params.data.serviceableStates,
      panIndiaDelivery: params.data.panIndiaDelivery ?? false,
      standardLeadTimeDays: params.data.standardLeadTimeDays || 3,
      fleetDetails: params.data.fleetDetails,
    },
  });

  // Save initial catalogue items if provided
  if (params.data.initialProducts && params.data.initialProducts.length > 0) {
    for (const prod of params.data.initialProducts) {
      if (prod.name && prod.category) {
        await db.supplierProduct.create({
          data: {
            supplierProfileId: supplierProfile.id,
            name: prod.name,
            category: prod.category,
            brand: prod.brand,
            unit: prod.unit || 'MT',
            indicativePrice: prod.indicativePrice,
            moq: prod.moq || 1,
            availableQuantity: prod.availableQuantity,
            hsnCode: prod.hsnCode,
            gstRate: prod.gstRate || 18,
          },
        });
      }
    }
  }

  await db.business.update({
    where: { id: business.id },
    data: {
      onboardingStep: Math.max(business.onboardingStep || 1, 6),
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'STEP_5_SUPPLIER_ONBOARDING_SAVED',
    details: `Saved supplier capabilities (${params.data.supplierType}) and serviceable districts: ${params.data.serviceableDistricts.join(', ')}.`,
    ipAddress: params.ipAddress,
  });

  return supplierProfile;
}

/**
 * Upload & attach a business verification document
 */
export async function uploadBusinessDocument(params: {
  userId: string;
  businessId: string;
  documentType: BusinessDocumentType;
  documentNumber?: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  const doc = await db.businessDocument.create({
    data: {
      businessId: business.id,
      documentType: params.documentType,
      documentNumber: params.documentNumber,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      fileSizeBytes: params.fileSizeBytes,
      mimeType: params.mimeType,
      status: 'SUBMITTED',
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'DOCUMENT_UPLOADED',
    details: `Uploaded ${params.documentType}: "${params.fileName}".`,
    metadata: { documentId: doc.id, documentType: params.documentType, fileName: params.fileName },
    ipAddress: params.ipAddress,
  });

  return doc;
}

/**
 * Submit the complete business profile for official verification
 */
export async function submitBusinessForVerification(params: {
  userId: string;
  businessId: string;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({
    where: { id: params.businessId },
    include: {
      documents: true,
      buyerProfile: true,
      supplierProfile: true,
    },
  });

  if (!business || business.ownerId !== params.userId) {
    throw new Error('Unauthorized or business not found.');
  }

  // Verification checks: Must have legal name, GSTIN, PAN, and at least one document
  if (!business.legalName) throw new Error('Legal business name is required.');
  if (!business.gstNumber) throw new Error('Valid GSTIN is required.');
  if (!business.pan) throw new Error('Valid PAN is required.');
  if (business.documents.length === 0) {
    throw new Error('Please upload at least one verification document (e.g., GST Registration Certificate or PAN card).');
  }

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      verificationStatus: 'UNDER_REVIEW',
      verificationSubmittedAt: new Date(),
      onboardingComplete: true,
    },
    include: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.userId,
    action: 'PROFILE_SUBMITTED_FOR_VERIFICATION',
    details: 'Complete business profile and documents submitted for PROVENTA compliance verification.',
    ipAddress: params.ipAddress,
  });

  // Dispatch in-app & email notification to user
  await sendBusinessNotification({
    userId: params.userId,
    type: 'VERIFICATION_SUBMITTED',
    title: 'Business Profile Submitted for Verification',
    body: `Your business "${business.name}" has been submitted for PROVENTA verification. Our industrial desk will review your credentials within 24 hours.`,
    actionUrl: '/settings/business-profile',
  });

  return updated;
}

/**
 * Admin Desk: Review business application (VERIFIED, REJECTED, ADDITIONAL_INFO_REQUIRED)
 */
export async function adminReviewBusiness(params: {
  adminUserId: string;
  businessId: string;
  status: 'VERIFIED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  notes?: string;
  rejectionReason?: string;
  ipAddress?: string;
}) {
  const business = await db.business.findUnique({ where: { id: params.businessId } });
  if (!business) throw new Error('Business not found.');

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      verificationStatus: params.status,
      verificationReviewedAt: new Date(),
      verificationNotes: params.notes,
      verificationLevel: params.status === 'VERIFIED' ? 'VERIFIED_BUSINESS' : business.verificationLevel,
    },
    include: {
      documents: true,
      buyerProfile: true,
      supplierProfile: true,
    },
  });

  await createBusinessAuditLog({
    businessId: business.id,
    userId: params.adminUserId,
    action: `ADMIN_${params.status}`,
    details: `Application marked as ${params.status}. Notes: ${params.notes || 'None'}.`,
    metadata: { status: params.status, notes: params.notes, rejectionReason: params.rejectionReason },
    ipAddress: params.ipAddress,
  });

  // Notify business owner
  const title =
    params.status === 'VERIFIED'
      ? 'PROVENTA Verified: Business Profile Approved'
      : params.status === 'REJECTED'
      ? 'Verification Update: Business Profile Rejected'
      : 'Action Required: Additional Information Needed';

  const body =
    params.status === 'VERIFIED'
      ? `Congratulations! Your business "${business.name}" is now officially verified on PROVENTA. You now have full access to the procurement exchange.`
      : params.status === 'REJECTED'
      ? `Your verification application for "${business.name}" was not approved. Reason: ${params.rejectionReason || params.notes || 'Document inconsistency.'}`
      : `Additional information or clearer documents are required for "${business.name}": ${params.notes}`;

  await sendBusinessNotification({
    userId: business.ownerId,
    type: `VERIFICATION_${params.status}` as any,
    title,
    body,
    actionUrl: '/settings/business-profile',
  });

  return updated;
}
