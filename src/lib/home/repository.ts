import {
  HomeCustomerProfile,
  HomeTechnicianProfile,
  HomeSubscription,
  HomeServiceRequest,
  HouseholdAsset,
  MaintenancePassportEntry,
  ResidentialSociety,
  HomeComplaint,
  HomeTechnicianPayout,
  SubscriptionPlanTier,
  ServiceRequestStatus
} from './types';
import { HOME_SERVICE_CATEGORIES, HOME_SUBSCRIPTION_PLANS, AHMEDABAD_LOCALITIES } from './constants';

/**
 * Thread-safe In-Memory Store for PROVENTA Home
 * Provides reliable, zero-latency state with complete commercial simulation
 * and clean data integrity guards (visit entitlements, booking limits, approval flows).
 */
class HomeDataStore {
  private customers: Map<string, HomeCustomerProfile> = new Map();
  private technicians: Map<string, HomeTechnicianProfile> = new Map();
  private subscriptions: Map<string, HomeSubscription> = new Map();
  private requests: Map<string, HomeServiceRequest> = new Map();
  private assets: Map<string, HouseholdAsset> = new Map();
  private passportEntries: Map<string, MaintenancePassportEntry> = new Map();
  private societies: Map<string, ResidentialSociety> = new Map();
  private complaints: Map<string, HomeComplaint> = new Map();
  private payouts: Map<string, HomeTechnicianPayout> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Customer Profiles (Ahmedabad Households)
    const seedCustomers: HomeCustomerProfile[] = [
      {
        id: 'cust-bopal-01',
        userId: 'usr-cust-01',
        fullName: 'Rajesh & Meera Patel',
        mobile: '+91 98250 11223',
        email: 'rajesh.patel@example.in',
        addressLine1: 'B-702, Orchid Harmony',
        apartmentOrSociety: 'Orchid Harmony',
        flatOrHouseNumber: 'B-702',
        locality: 'South Bopal',
        city: 'Ahmedabad',
        pincode: '380058',
        landmark: 'Near Gala Gymkhana Road',
        activeSubscriptionId: 'sub-fam-01',
        preferredTechnicianId: 'tech-elec-01',
        registeredAt: '2026-01-15T10:00:00Z',
        totalRequestsCount: 5,
        totalCompletedJobs: 4,
        accountStatus: 'ACTIVE'
      },
      {
        id: 'cust-satellite-02',
        userId: 'usr-cust-02',
        fullName: 'Dr. Ananya Sharma',
        mobile: '+91 98980 44556',
        email: 'dr.ananya.s@example.in',
        addressLine1: '401, Dev Aurum',
        apartmentOrSociety: 'Dev Aurum',
        flatOrHouseNumber: '401',
        locality: 'Satellite',
        city: 'Ahmedabad',
        pincode: '380015',
        landmark: 'Opp. Shell Petrol Pump, Anandnagar Road',
        activeSubscriptionId: 'sub-prem-02',
        preferredTechnicianId: 'tech-plumb-02',
        registeredAt: '2026-02-01T11:30:00Z',
        totalRequestsCount: 7,
        totalCompletedJobs: 6,
        accountStatus: 'ACTIVE'
      },
      {
        id: 'cust-gota-03',
        userId: 'usr-cust-03',
        fullName: 'Amitabh & Sneha Joshi',
        mobile: '+91 97129 77889',
        email: 'amitabh.joshi@example.in',
        addressLine1: 'A-304, Godrej Garden City',
        apartmentOrSociety: 'Godrej Garden City',
        flatOrHouseNumber: 'A-304',
        locality: 'Gota',
        city: 'Ahmedabad',
        pincode: '382481',
        landmark: 'SG Highway',
        activeSubscriptionId: 'sub-ess-03',
        registeredAt: '2026-03-10T14:15:00Z',
        totalRequestsCount: 2,
        totalCompletedJobs: 2,
        accountStatus: 'ACTIVE'
      }
    ];
    seedCustomers.forEach(c => this.customers.set(c.id, c));

    // 2. Seed Subscriptions
    const seedSubscriptions: HomeSubscription[] = [
      {
        id: 'sub-fam-01',
        customerId: 'cust-bopal-01',
        planId: 'plan-family',
        planTier: 'FAMILY',
        billingFrequency: 'ANNUAL',
        status: 'ACTIVE',
        startDate: '2026-01-15T10:00:00Z',
        currentPeriodStart: '2026-01-15T10:00:00Z',
        currentPeriodEnd: '2027-01-14T23:59:59Z',
        nextBillingDate: '2027-01-15T00:00:00Z',
        autoRenew: true,
        visitsEntitlementTotal: 4,
        visitsUsedCurrentPeriod: 1,
        visitsRolloverCount: 1,
        visitsRemainingCurrentPeriod: 4,
        lastPaymentId: 'pay-ann-9921'
      },
      {
        id: 'sub-prem-02',
        customerId: 'cust-satellite-02',
        planId: 'plan-premium',
        planTier: 'PREMIUM',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        startDate: '2026-02-01T11:30:00Z',
        currentPeriodStart: '2026-11-01T00:00:00Z',
        currentPeriodEnd: '2026-11-30T23:59:59Z',
        nextBillingDate: '2026-12-01T00:00:00Z',
        autoRenew: true,
        visitsEntitlementTotal: 8,
        visitsUsedCurrentPeriod: 2,
        visitsRolloverCount: 2,
        visitsRemainingCurrentPeriod: 8,
        lastPaymentId: 'pay-mon-8812'
      },
      {
        id: 'sub-ess-03',
        customerId: 'cust-gota-03',
        planId: 'plan-essential',
        planTier: 'ESSENTIAL',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        startDate: '2026-03-10T14:15:00Z',
        currentPeriodStart: '2026-11-01T00:00:00Z',
        currentPeriodEnd: '2026-11-30T23:59:59Z',
        nextBillingDate: '2026-12-01T00:00:00Z',
        autoRenew: true,
        visitsEntitlementTotal: 2,
        visitsUsedCurrentPeriod: 1,
        visitsRolloverCount: 0,
        visitsRemainingCurrentPeriod: 1,
        lastPaymentId: 'pay-mon-4411'
      }
    ];
    seedSubscriptions.forEach(s => this.subscriptions.set(s.id, s));

    // 3. Seed Verified Technician Partners
    const seedTechnicians: HomeTechnicianProfile[] = [
      {
        id: 'tech-elec-01',
        userId: 'usr-tech-01',
        fullName: 'Jignesh V. Solanki',
        mobile: '+91 98790 23114',
        email: 'jignesh.solanki.tech@proventa.in',
        operatingLocality: 'Bopal',
        serviceRadiusKm: 6,
        serviceCategories: ['ELECTRICAL', 'PREVENTIVE'],
        primarySkills: ['Distribution Boards', 'MCB Tripping', 'Inverter Wiring', '16A Geyser Points', 'Earthing Audit'],
        experienceYears: 9,
        kycStatus: 'APPROVED',
        isAvailableForDispatch: true,
        ratingAverage: 4.88,
        ratingCount: 142,
        completedJobsCount: 186,
        bankDetails: {
          accountNumber: '918010045812903',
          ifscCode: 'UTIB0001334',
          beneficiaryName: 'Jignesh Valjibhai Solanki',
          bankName: 'Axis Bank Bopal Branch',
          upiId: 'jigneshsolanki@axisbank'
        },
        documents: [
          {
            id: 'doc-jig-01',
            technicianId: 'tech-elec-01',
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-9021',
            fileUrl: '/docs/technicians/aadhaar-jignesh.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-08-10T11:00:00Z'
          },
          {
            id: 'doc-jig-02',
            technicianId: 'tech-elec-01',
            docType: 'TRADE_CERTIFICATE',
            docNumber: 'ITI-ELEC-GUJ-2015-881',
            fileUrl: '/docs/technicians/iti-certificate-jignesh.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-08-10T11:15:00Z'
          },
          {
            id: 'doc-jig-03',
            technicianId: 'tech-elec-01',
            docType: 'POLICE_VERIFICATION',
            docNumber: 'POL-AMD-WEST-2025-994',
            fileUrl: '/docs/technicians/police-verification-jignesh.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-08-12T14:00:00Z'
          }
        ],
        safetyBriefingCompleted: true,
        joinedAt: '2025-08-15T09:00:00Z'
      },
      {
        id: 'tech-plumb-02',
        userId: 'usr-tech-02',
        fullName: 'Mohammad Farooq Shaikh',
        mobile: '+91 99241 87632',
        email: 'farooq.shaikh@proventa.in',
        operatingLocality: 'Satellite',
        serviceRadiusKm: 7,
        serviceCategories: ['PLUMBING', 'PREVENTIVE'],
        primarySkills: ['Concealed Leak Detection', 'Diverter Cartridge Replacement', 'Pressure Pump Tuning', 'Drain Clearing'],
        experienceYears: 12,
        kycStatus: 'APPROVED',
        isAvailableForDispatch: true,
        ratingAverage: 4.92,
        ratingCount: 198,
        completedJobsCount: 260,
        bankDetails: {
          accountNumber: '203910100084321',
          ifscCode: 'HDFC0000049',
          beneficiaryName: 'Mohammad Farooq Shaikh',
          bankName: 'HDFC Bank Satellite Branch',
          upiId: 'farooqshaikh@hdfcbank'
        },
        documents: [
          {
            id: 'doc-far-01',
            technicianId: 'tech-plumb-02',
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-4432',
            fileUrl: '/docs/technicians/aadhaar-farooq.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-06-05T10:00:00Z'
          },
          {
            id: 'doc-far-02',
            technicianId: 'tech-plumb-02',
            docType: 'POLICE_VERIFICATION',
            docNumber: 'POL-AMD-CENTRAL-2025-1102',
            fileUrl: '/docs/technicians/police-verification-farooq.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-06-08T15:00:00Z'
          }
        ],
        safetyBriefingCompleted: true,
        joinedAt: '2025-06-10T10:00:00Z'
      },
      {
        id: 'tech-carp-03',
        userId: 'usr-tech-03',
        fullName: 'Pravinbhai K. Suthar',
        mobile: '+91 97234 55190',
        operatingLocality: 'Gota',
        serviceRadiusKm: 8,
        serviceCategories: ['CARPENTRY'],
        primarySkills: ['Hydraulic Hinges', 'Sliding Wardrobe Channels', 'Godrej Rim Lock Fitting', 'Door Alignment'],
        experienceYears: 14,
        kycStatus: 'APPROVED',
        isAvailableForDispatch: true,
        ratingAverage: 4.81,
        ratingCount: 110,
        completedJobsCount: 145,
        bankDetails: {
          accountNumber: '0281000100482912',
          ifscCode: 'PUNB0028100',
          beneficiaryName: 'Pravinbhai Kanjibhai Suthar',
          bankName: 'Punjab National Bank Gota Branch',
          upiId: 'pravinsuthar@okhdfcbank'
        },
        documents: [
          {
            id: 'doc-prav-01',
            technicianId: 'tech-carp-03',
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-6712',
            fileUrl: '/docs/technicians/aadhaar-pravin.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-09-01T12:00:00Z'
          }
        ],
        safetyBriefingCompleted: true,
        joinedAt: '2025-09-05T11:00:00Z'
      },
      {
        id: 'tech-ac-04',
        userId: 'usr-tech-04',
        fullName: 'Dhaval R. Dave',
        mobile: '+91 98240 76543',
        operatingLocality: 'Science City',
        serviceRadiusKm: 6,
        serviceCategories: ['APPLIANCE', 'PREVENTIVE'],
        primarySkills: ['Inverter AC PCB Diagnostics', 'Foam Jet Servicing', 'Gas Leakage R32/R410A', 'Capacitor Replacement'],
        experienceYears: 8,
        kycStatus: 'APPROVED',
        isAvailableForDispatch: true,
        ratingAverage: 4.90,
        ratingCount: 175,
        completedJobsCount: 220,
        bankDetails: {
          accountNumber: '304910294821',
          ifscCode: 'SBIN0060381',
          beneficiaryName: 'Dhaval Ramanlal Dave',
          bankName: 'SBI Science City Branch',
          upiId: 'dhavaldave@sbi'
        },
        documents: [
          {
            id: 'doc-dhav-01',
            technicianId: 'tech-ac-04',
            docType: 'TRADE_CERTIFICATE',
            docNumber: 'ITI-REFAC-GUJ-2017-312',
            fileUrl: '/docs/technicians/iti-dhaval.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-05-18T10:00:00Z'
          }
        ],
        safetyBriefingCompleted: true,
        joinedAt: '2025-05-20T10:00:00Z'
      },
      {
        id: 'tech-clean-05',
        userId: 'usr-tech-05',
        fullName: 'Kishan M. Vaghela',
        mobile: '+91 96012 34981',
        operatingLocality: 'Prahlad Nagar',
        serviceRadiusKm: 7,
        serviceCategories: ['CLEANING', 'PREVENTIVE'],
        primarySkills: ['Overhead Water Tank Sanitisation', 'Bathroom Chemical Scale Scrubbing', 'Sump Sludge Extraction'],
        experienceYears: 7,
        kycStatus: 'APPROVED',
        isAvailableForDispatch: true,
        ratingAverage: 4.75,
        ratingCount: 88,
        completedJobsCount: 112,
        bankDetails: {
          accountNumber: '50100293847291',
          ifscCode: 'HDFC0001092',
          beneficiaryName: 'Kishan Mukesh Vaghela',
          bankName: 'HDFC Bank Prahlad Nagar',
          upiId: 'kishanvaghela@paytm'
        },
        documents: [
          {
            id: 'doc-kish-01',
            technicianId: 'tech-clean-05',
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-1982',
            fileUrl: '/docs/technicians/aadhaar-kishan.pdf',
            verificationStatus: 'VERIFIED',
            verifiedAt: '2025-07-12T11:00:00Z'
          }
        ],
        safetyBriefingCompleted: true,
        joinedAt: '2025-07-15T09:00:00Z'
      },
      {
        id: 'tech-pend-06',
        userId: 'usr-tech-06',
        fullName: 'Rameshwar Lal Sharma',
        mobile: '+91 94280 19283',
        operatingLocality: 'Thaltej',
        serviceRadiusKm: 5,
        serviceCategories: ['CARPENTRY', 'ADDITIONAL'],
        primarySkills: ['Door Lock Repair', 'Curtain Rod Fixing'],
        experienceYears: 5,
        kycStatus: 'VERIFICATION_IN_PROGRESS',
        isAvailableForDispatch: false,
        ratingAverage: 0,
        ratingCount: 0,
        completedJobsCount: 0,
        bankDetails: {
          accountNumber: '098102938491',
          ifscCode: 'BARB0THALTE',
          beneficiaryName: 'Rameshwar Lal Sharma',
          bankName: 'Bank of Baroda Thaltej',
          upiId: 'rameshwar@barodampay'
        },
        documents: [
          {
            id: 'doc-ram-01',
            technicianId: 'tech-pend-06',
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-7721',
            fileUrl: '/docs/technicians/aadhaar-rameshwar.pdf',
            verificationStatus: 'PENDING'
          }
        ],
        safetyBriefingCompleted: false,
        joinedAt: '2026-11-20T14:00:00Z'
      }
    ];
    seedTechnicians.forEach(t => this.technicians.set(t.id, t));

    // 4. Seed Service Requests across key statuses
    const seedRequests: HomeServiceRequest[] = [
      {
        id: 'req-2026-001',
        requestCode: 'PH-REQ-2026-0841',
        customerId: 'cust-bopal-01',
        customerName: 'Rajesh & Meera Patel',
        customerPhone: '+91 98250 11223',
        address: {
          fullAddress: 'B-702, Orchid Harmony, Gala Gymkhana Road, South Bopal, Ahmedabad 380058',
          apartmentOrSociety: 'Orchid Harmony',
          flatNumber: 'B-702',
          locality: 'South Bopal',
          city: 'Ahmedabad',
          pincode: '380058',
          landmark: 'Near Gala Gymkhana'
        },
        categoryKey: 'ELECTRICAL',
        serviceCode: 'ELEC-MCB-01',
        serviceName: 'Distribution Board & MCB Tripping Diagnostics',
        issueDescription: 'Kitchen power circuit tripping whenever microwave and induction stove are turned on together. Burning smell noticed near main DB.',
        preferredDate: '2026-11-24',
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        urgency: 'PRIORITY',
        photoUrls: ['/photos/requests/db-tripping-1.jpg'],
        isSubscriptionCovered: true,
        subscriptionId: 'sub-fam-01',
        baseServiceCharge: 0,
        additionalCharges: [
          {
            id: 'chg-001',
            requestId: 'req-2026-001',
            description: 'Replacement Schneider 32A C-Curve MCB + 4 sq.mm heat-resistant FR wire',
            materialCost: 680,
            labourExtraCost: 0,
            totalAmount: 680,
            requestedAt: '2026-11-24T10:45:00Z',
            status: 'PENDING_APPROVAL'
          }
        ],
        totalCustomerPayable: 680,
        paymentStatus: 'PENDING',
        assignedTechnicianId: 'tech-elec-01',
        assignedTechnicianName: 'Jignesh V. Solanki',
        assignedTechnicianPhone: '+91 98790 23114',
        assignedAt: '2026-11-23T15:30:00Z',
        scheduledDateTime: '2026-11-24T10:30:00Z',
        status: 'AWAITING_CUSTOMER_APPROVAL',
        beforePhotos: ['/photos/evidence/db-burnt-lead.jpg'],
        afterPhotos: [],
        technicianWorkNotes: 'Found loose contact at terminal 3 of kitchen ring circuit, leading to heat buildup and premature thermal tripping. Recommended MCB upgrade.',
        customerSignOffReceived: false,
        reopenedCount: 0,
        createdAt: '2026-11-23T14:00:00Z',
        updatedAt: '2026-11-24T10:50:00Z'
      },
      {
        id: 'req-2026-002',
        requestCode: 'PH-REQ-2026-0839',
        customerId: 'cust-satellite-02',
        customerName: 'Dr. Ananya Sharma',
        customerPhone: '+91 98980 44556',
        address: {
          fullAddress: '401, Dev Aurum, Opp. Shell Petrol Pump, Anandnagar Road, Satellite, Ahmedabad 380015',
          apartmentOrSociety: 'Dev Aurum',
          flatNumber: '401',
          locality: 'Satellite',
          city: 'Ahmedabad',
          pincode: '380015'
        },
        categoryKey: 'PLUMBING',
        serviceCode: 'PLUMB-DIV-02',
        serviceName: 'Concealed Bath Diverter & Mixer Overhaul',
        issueDescription: 'Master bathroom Kohler thermostatic shower diverter is jammed and constantly dripping lukewarm water.',
        preferredDate: '2026-11-22',
        preferredTimeSlot: '02:00 PM - 04:00 PM',
        urgency: 'STANDARD',
        photoUrls: ['/photos/requests/diverter-drip.jpg'],
        isSubscriptionCovered: true,
        subscriptionId: 'sub-prem-02',
        baseServiceCharge: 0,
        additionalCharges: [],
        totalCustomerPayable: 0,
        paymentStatus: 'NOT_REQUIRED',
        assignedTechnicianId: 'tech-plumb-02',
        assignedTechnicianName: 'Mohammad Farooq Shaikh',
        assignedTechnicianPhone: '+91 99241 87632',
        assignedAt: '2026-11-22T09:00:00Z',
        scheduledDateTime: '2026-11-22T14:30:00Z',
        workStartedAt: '2026-11-22T14:35:00Z',
        workCompletedAt: '2026-11-22T15:45:00Z',
        beforePhotos: ['/photos/evidence/diverter-calcified.jpg'],
        afterPhotos: ['/photos/evidence/diverter-cleaned-fitted.jpg'],
        technicianWorkNotes: 'Descaled internal cartridge using food-grade citric solution, replaced ceramic discs and lubricated O-rings. Tested flow at 3.5 bar.',
        customerSignOffReceived: true,
        status: 'CLOSED',
        customerRating: 5,
        customerFeedback: 'Farooq bhai was exceptionally polite, clean and fixed the issue without breaking any wall tiles. Superb service!',
        reopenedCount: 0,
        createdAt: '2026-11-21T18:00:00Z',
        updatedAt: '2026-11-22T16:00:00Z'
      },
      {
        id: 'req-2026-003',
        requestCode: 'PH-REQ-2026-0842',
        customerId: 'cust-gota-03',
        customerName: 'Amitabh & Sneha Joshi',
        customerPhone: '+91 97129 77889',
        address: {
          fullAddress: 'A-304, Godrej Garden City, SG Highway, Gota, Ahmedabad 382481',
          apartmentOrSociety: 'Godrej Garden City',
          flatNumber: 'A-304',
          locality: 'Gota',
          city: 'Ahmedabad',
          pincode: '382481'
        },
        categoryKey: 'CARPENTRY',
        serviceCode: 'CARP-HINGE-01',
        serviceName: 'Hydraulic Soft-Close Hinge Replacement & Realignment',
        issueDescription: 'Kitchen overhead cabinet door hinge snapped; door is hanging loosely and unable to close.',
        preferredDate: '2026-11-25',
        preferredTimeSlot: '11:00 AM - 01:00 PM',
        urgency: 'STANDARD',
        photoUrls: ['/photos/requests/cabinet-broken.jpg'],
        isSubscriptionCovered: true,
        subscriptionId: 'sub-ess-03',
        baseServiceCharge: 0,
        additionalCharges: [],
        totalCustomerPayable: 0,
        paymentStatus: 'NOT_REQUIRED',
        status: 'SUBMITTED',
        beforePhotos: [],
        afterPhotos: [],
        customerSignOffReceived: false,
        scheduledDateTime: '2026-11-25T11:00:00Z',
        reopenedCount: 0,
        createdAt: '2026-11-23T16:10:00Z',
        updatedAt: '2026-11-23T16:10:00Z'
      }
    ];
    seedRequests.forEach(r => this.requests.set(r.id, r));

    // 5. Seed Household Assets & Maintenance Passport
    const seedAssets: HouseholdAsset[] = [
      {
        id: 'asset-01',
        customerId: 'cust-bopal-01',
        assetType: 'AIR_CONDITIONER',
        customName: 'Master Bedroom 1.5T Daikin Inverter AC',
        brand: 'Daikin',
        modelNumber: 'FTKM50TV16U',
        serialNumber: 'DAIK-2023-90812',
        purchaseDate: '2023-04-10',
        warrantyExpiryDate: '2028-04-09',
        installedLocation: 'Master Bedroom',
        lastServicedDate: '2026-04-12',
        nextRecommendedServiceDate: '2027-02-15',
        notes: 'Copper coil coated with anti-corrosion layer during 2026 preseason servicing.'
      },
      {
        id: 'asset-02',
        customerId: 'cust-bopal-01',
        assetType: 'WATER_PURIFIER_RO',
        customName: 'Kitchen RO + Copper Alkaline Purifier',
        brand: 'Kent Grand Plus',
        serialNumber: 'KNT-2024-4412',
        purchaseDate: '2024-01-20',
        installedLocation: 'Kitchen Counter',
        lastServicedDate: '2026-07-15',
        nextRecommendedServiceDate: '2027-01-15',
        notes: 'Sediment and carbon pre-filters replaced. TDS input 650 ppm, output 85 ppm.'
      },
      {
        id: 'asset-03',
        customerId: 'cust-satellite-02',
        assetType: 'GEYSER',
        customName: 'Guest Bath 25L Storage Geyser',
        brand: 'AO Smith HSE-SES-025',
        serialNumber: 'AOS-2022-8819',
        purchaseDate: '2022-11-15',
        installedLocation: 'Guest Bathroom',
        lastServicedDate: '2025-11-10',
        nextRecommendedServiceDate: '2026-11-30',
        notes: 'Anode rod descaled in 2025.'
      }
    ];
    seedAssets.forEach(a => this.assets.set(a.id, a));

    const seedPassport: MaintenancePassportEntry[] = [
      {
        id: 'pass-01',
        customerId: 'cust-satellite-02',
        serviceRequestId: 'req-2026-002',
        serviceType: 'Concealed Bath Diverter Overhaul',
        date: '2026-11-22',
        performedBy: 'Mohammad Farooq Shaikh (Verified PROVENTA Partner)',
        findingsAndWork: 'Diverter cartridge descaling, mineral deposit clearance and O-ring replacement.',
        partsReplaced: ['Food-grade Nitrile O-rings (x3)'],
        warrantyGrantedMonths: 3,
        nextActionRecommendation: 'Inspect aerators and pressure relief valves in 6 months.'
      },
      {
        id: 'pass-02',
        customerId: 'cust-bopal-01',
        assetId: 'asset-01',
        serviceType: 'AC Deep Chemical Jet Foam Service',
        date: '2026-04-12',
        performedBy: 'Dhaval R. Dave (PROVENTA Technician)',
        findingsAndWork: 'Full indoor blower wheel foam jet clean, condenser coil backflush, ampere check at 5.2A.',
        warrantyGrantedMonths: 3,
        nextActionRecommendation: 'Pre-summer maintenance check recommended in Feb 2027.'
      }
    ];
    seedPassport.forEach(p => this.passportEntries.set(p.id, p));

    // 6. Seed Residential Societies
    const seedSocieties: ResidentialSociety[] = [
      {
        id: 'soc-01',
        societyName: 'Orchid Harmony Co-op Housing Society',
        locality: 'South Bopal',
        city: 'Ahmedabad',
        pincode: '380058',
        totalFlatsOrUnits: 320,
        secretaryName: 'Vipulbhai Shah',
        secretaryPhone: '+91 98251 90211',
        secretaryEmail: 'orchid.harmony.mgmt@gmail.com',
        partnershipModel: 'BULK_COMMUNITY_CONTRACT',
        contractStatus: 'ACTIVE',
        enrolledHouseholdsCount: 84,
        negotiatedDiscountPercent: 15,
        startDate: '2026-01-01',
        endDate: '2026-12-31'
      },
      {
        id: 'soc-02',
        societyName: 'Godrej Garden City (Pine & Cassia Clusters)',
        locality: 'Gota',
        city: 'Ahmedabad',
        pincode: '382481',
        totalFlatsOrUnits: 850,
        secretaryName: 'Naveen Nair',
        secretaryPhone: '+91 98982 33412',
        secretaryEmail: 'ggc.cluster.rep@example.com',
        partnershipModel: 'INDIVIDUAL_PREFERENTIAL',
        contractStatus: 'ACTIVE',
        enrolledHouseholdsCount: 142,
        negotiatedDiscountPercent: 10,
        startDate: '2026-03-01',
        endDate: '2027-02-28'
      }
    ];
    seedSocieties.forEach(s => this.societies.set(s.id, s));

    // 7. Seed Technician Payouts
    const seedPayouts: HomeTechnicianPayout[] = [
      {
        id: 'pay-001',
        technicianId: 'tech-plumb-02',
        requestId: 'req-2026-002',
        requestCode: 'PH-REQ-2026-0839',
        grossAmount: 450,
        materialReimbursement: 0,
        platformCommissionOrFee: 0,
        netPayoutAmount: 450,
        status: 'PAID',
        payoutDate: '2026-11-23T06:00:00Z',
        transactionReference: 'NEFT-AXIS-20261123-00912',
        calculatedAt: '2026-11-22T16:00:00Z'
      }
    ];
    seedPayouts.forEach(p => this.payouts.set(p.id, p));
  }

  // ==========================================
  // CUSTOMER REPOSITORY METHODS
  // ==========================================
  public getAllCustomers(): HomeCustomerProfile[] {
    return Array.from(this.customers.values());
  }

  public getCustomerById(id: string): HomeCustomerProfile | null {
    return this.customers.get(id) || null;
  }

  public getCustomerByUserId(userId: string): HomeCustomerProfile | null {
    for (const c of this.customers.values()) {
      if (c.userId === userId) return c;
    }
    return null;
  }

  public createCustomer(data: Omit<HomeCustomerProfile, 'id' | 'registeredAt' | 'totalRequestsCount' | 'totalCompletedJobs' | 'accountStatus'>): HomeCustomerProfile {
    const id = `cust-${Date.now().toString(36)}`;
    const profile: HomeCustomerProfile = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
      totalRequestsCount: 0,
      totalCompletedJobs: 0,
      accountStatus: 'ACTIVE'
    };
    this.customers.set(id, profile);
    return profile;
  }

  // ==========================================
  // SUBSCRIPTION & ENTITLEMENT METHODS
  // ==========================================
  public getAllSubscriptions(): HomeSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getSubscriptionById(id: string): HomeSubscription | null {
    return this.subscriptions.get(id) || null;
  }

  public getSubscriptionByCustomerId(customerId: string): HomeSubscription | null {
    for (const sub of this.subscriptions.values()) {
      if (sub.customerId === customerId && sub.status === 'ACTIVE') {
        return sub;
      }
    }
    return null;
  }

  public createSubscription(params: {
    customerId: string;
    planTier: SubscriptionPlanTier;
    billingFrequency: 'MONTHLY' | 'ANNUAL';
    paymentId?: string;
  }): HomeSubscription {
    const plan = HOME_SUBSCRIPTION_PLANS.find(p => p.tier === params.planTier);
    if (!plan) throw new Error(`Invalid plan tier: ${params.planTier}`);

    const id = `sub-${params.planTier.toLowerCase()}-${Date.now().toString(36)}`;
    const now = new Date();
    const startDate = now.toISOString();

    const endDate = new Date(now);
    if (params.billingFrequency === 'ANNUAL') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const sub: HomeSubscription = {
      id,
      customerId: params.customerId,
      planId: plan.id,
      planTier: params.planTier,
      billingFrequency: params.billingFrequency,
      status: 'ACTIVE',
      startDate,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate.toISOString(),
      nextBillingDate: endDate.toISOString(),
      autoRenew: true,
      visitsEntitlementTotal: plan.includedVisitsPerBillingMonth,
      visitsUsedCurrentPeriod: 0,
      visitsRolloverCount: 0,
      visitsRemainingCurrentPeriod: plan.includedVisitsPerBillingMonth,
      lastPaymentId: params.paymentId || `pay-${Date.now().toString(36)}`
    };

    this.subscriptions.set(id, sub);

    // Update customer active subscription link
    const cust = this.customers.get(params.customerId);
    if (cust) {
      cust.activeSubscriptionId = id;
      this.customers.set(cust.id, cust);
    }

    return sub;
  }

  /**
   * Deducts a visit from current active subscription entitlement.
   * Enforces visit cap and rollover rules.
   */
  public consumeSubscriptionVisit(subscriptionId: string): { success: boolean; remaining: number; message: string } {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) return { success: false, remaining: 0, message: 'Subscription not found' };
    if (sub.status !== 'ACTIVE') return { success: false, remaining: 0, message: 'Subscription is not active' };

    if (sub.visitsRemainingCurrentPeriod <= 0) {
      return {
        success: false,
        remaining: 0,
        message: 'All included monthly visits exhausted. Additional visit will be billed at preferential member rates.'
      };
    }

    sub.visitsUsedCurrentPeriod += 1;
    sub.visitsRemainingCurrentPeriod -= 1;
    this.subscriptions.set(subscriptionId, sub);

    return {
      success: true,
      remaining: sub.visitsRemainingCurrentPeriod,
      message: `Visit successfully booked. ${sub.visitsRemainingCurrentPeriod} visits remaining this billing cycle.`
    };
  }

  // ==========================================
  // TECHNICIAN PARTNER METHODS
  // ==========================================
  public getAllTechnicians(filters?: { category?: string; locality?: string; approvedOnly?: boolean }): HomeTechnicianProfile[] {
    let list = Array.from(this.technicians.values());
    if (filters?.approvedOnly) {
      list = list.filter(t => t.kycStatus === 'APPROVED' && t.isAvailableForDispatch);
    }
    if (filters?.locality) {
      list = list.filter(t => t.operatingLocality.toLowerCase() === filters.locality?.toLowerCase());
    }
    if (filters?.category) {
      list = list.filter(t => t.serviceCategories.includes(filters.category as any));
    }
    return list;
  }

  public getTechnicianById(id: string): HomeTechnicianProfile | null {
    return this.technicians.get(id) || null;
  }

  public registerTechnician(data: Omit<HomeTechnicianProfile, 'id' | 'kycStatus' | 'isAvailableForDispatch' | 'ratingAverage' | 'ratingCount' | 'completedJobsCount' | 'safetyBriefingCompleted' | 'joinedAt'>): HomeTechnicianProfile {
    const id = `tech-${Date.now().toString(36)}`;
    const profile: HomeTechnicianProfile = {
      ...data,
      id,
      kycStatus: 'APPLICATION_SUBMITTED',
      isAvailableForDispatch: false,
      ratingAverage: 0,
      ratingCount: 0,
      completedJobsCount: 0,
      safetyBriefingCompleted: false,
      joinedAt: new Date().toISOString()
    };
    this.technicians.set(id, profile);
    return profile;
  }

  public updateTechnicianKycStatus(id: string, status: HomeTechnicianProfile['kycStatus'], notes?: string): HomeTechnicianProfile | null {
    const tech = this.technicians.get(id);
    if (!tech) return null;
    tech.kycStatus = status;
    tech.isAvailableForDispatch = status === 'APPROVED';
    this.technicians.set(id, tech);
    return tech;
  }

  // ==========================================
  // SERVICE REQUEST LIFECYCLE METHODS
  // ==========================================
  public getAllRequests(filters?: { customerId?: string; technicianId?: string; status?: ServiceRequestStatus }): HomeServiceRequest[] {
    let list = Array.from(this.requests.values());
    if (filters?.customerId) {
      list = list.filter(r => r.customerId === filters.customerId);
    }
    if (filters?.technicianId) {
      list = list.filter(r => r.assignedTechnicianId === filters.technicianId);
    }
    if (filters?.status) {
      list = list.filter(r => r.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getRequestById(id: string): HomeServiceRequest | null {
    return this.requests.get(id) || null;
  }

  public createServiceRequest(params: {
    customerId: string;
    categoryKey: any;
    serviceCode: string;
    serviceName: string;
    issueDescription: string;
    preferredDate: string;
    preferredTimeSlot: string;
    urgency: 'STANDARD' | 'PRIORITY' | 'EMERGENCY';
    photoUrls?: string[];
  }): HomeServiceRequest {
    const customer = this.customers.get(params.customerId);
    if (!customer) throw new Error('Customer account not found');

    const sub = this.getSubscriptionByCustomerId(params.customerId);
    const isCovered = Boolean(sub && sub.visitsRemainingCurrentPeriod > 0);

    const now = new Date();
    const seqNum = Math.floor(1000 + Math.random() * 9000);
    const requestCode = `PH-REQ-${now.getFullYear()}-${seqNum}`;
    const id = `req-${Date.now().toString(36)}`;

    // Consume visit if covered
    if (isCovered && sub) {
      this.consumeSubscriptionVisit(sub.id);
    }

    const request: HomeServiceRequest = {
      id,
      requestCode,
      customerId: params.customerId,
      customerName: customer.fullName,
      customerPhone: customer.mobile,
      address: {
        fullAddress: `${customer.flatOrHouseNumber}, ${customer.apartmentOrSociety}, ${customer.addressLine1}, ${customer.locality}, ${customer.city} ${customer.pincode}`,
        apartmentOrSociety: customer.apartmentOrSociety,
        flatNumber: customer.flatOrHouseNumber,
        locality: customer.locality,
        city: customer.city,
        pincode: customer.pincode,
        landmark: customer.landmark
      },
      categoryKey: params.categoryKey,
      serviceCode: params.serviceCode,
      serviceName: params.serviceName,
      issueDescription: params.issueDescription,
      preferredDate: params.preferredDate,
      preferredTimeSlot: params.preferredTimeSlot,
      urgency: params.urgency,
      photoUrls: params.photoUrls || [],
      isSubscriptionCovered: isCovered,
      subscriptionId: sub?.id,
      baseServiceCharge: isCovered ? 0 : 399,
      additionalCharges: [],
      totalCustomerPayable: isCovered ? 0 : 399,
      paymentStatus: isCovered ? 'NOT_REQUIRED' : 'PENDING',
      scheduledDateTime: `${params.preferredDate}T10:00:00Z`,
      beforePhotos: [],
      afterPhotos: [],
      customerSignOffReceived: false,
      status: 'SUBMITTED',
      reopenedCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    this.requests.set(id, request);
    customer.totalRequestsCount += 1;
    this.customers.set(customer.id, customer);

    return request;
  }

  public assignTechnician(requestId: string, technicianId: string): HomeServiceRequest | null {
    const req = this.requests.get(requestId);
    const tech = this.technicians.get(technicianId);
    if (!req || !tech) return null;

    req.assignedTechnicianId = tech.id;
    req.assignedTechnicianName = tech.fullName;
    req.assignedTechnicianPhone = tech.mobile;
    req.assignedAt = new Date().toISOString();
    req.status = 'TECHNICIAN_ASSIGNED';
    req.updatedAt = new Date().toISOString();

    tech.activeJobId = req.id;
    this.requests.set(requestId, req);
    this.technicians.set(tech.id, tech);

    return req;
  }

  public updateRequestStatus(
    requestId: string,
    status: ServiceRequestStatus,
    metadata?: {
      workStartedAt?: string;
      workCompletedAt?: string;
      beforePhotos?: string[];
      afterPhotos?: string[];
      notes?: string;
      customerRating?: number;
      customerFeedback?: string;
    }
  ): HomeServiceRequest | null {
    const req = this.requests.get(requestId);
    if (!req) return null;

    req.status = status;
    req.updatedAt = new Date().toISOString();

    if (metadata?.workStartedAt) req.workStartedAt = metadata.workStartedAt;
    if (metadata?.workCompletedAt) req.workCompletedAt = metadata.workCompletedAt;
    if (metadata?.beforePhotos) req.beforePhotos = metadata.beforePhotos;
    if (metadata?.afterPhotos) req.afterPhotos = metadata.afterPhotos;
    if (metadata?.notes) req.technicianWorkNotes = metadata.notes;
    if (metadata?.customerRating) req.customerRating = metadata.customerRating;
    if (metadata?.customerFeedback) req.customerFeedback = metadata.customerFeedback;

    if (status === 'WORK_COMPLETED' || status === 'CLOSED') {
      req.customerSignOffReceived = true;
      if (req.assignedTechnicianId) {
        const tech = this.technicians.get(req.assignedTechnicianId);
        if (tech) {
          tech.completedJobsCount += 1;
          tech.activeJobId = undefined;
          if (metadata?.customerRating) {
            const totalScore = (tech.ratingAverage * tech.ratingCount) + metadata.customerRating;
            tech.ratingCount += 1;
            tech.ratingAverage = Number((totalScore / tech.ratingCount).toFixed(2));
          }
          this.technicians.set(tech.id, tech);

          // Generate technician payout record automatically
          this.createTechnicianPayout(tech.id, req);
        }
      }

      const cust = this.customers.get(req.customerId);
      if (cust) {
        cust.totalCompletedJobs += 1;
        this.customers.set(cust.id, cust);
      }
    }

    this.requests.set(requestId, req);
    return req;
  }

  public addAdditionalCharge(requestId: string, data: { description: string; materialCost: number; labourExtraCost: number }): HomeServiceRequest | null {
    const req = this.requests.get(requestId);
    if (!req) return null;

    const chargeId = `chg-${Date.now().toString(36)}`;
    const totalAmount = data.materialCost + data.labourExtraCost;

    req.additionalCharges.push({
      id: chargeId,
      requestId,
      description: data.description,
      materialCost: data.materialCost,
      labourExtraCost: data.labourExtraCost,
      totalAmount,
      requestedAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL'
    });

    req.status = 'AWAITING_CUSTOMER_APPROVAL';
    req.updatedAt = new Date().toISOString();
    this.requests.set(requestId, req);
    return req;
  }

  public respondToAdditionalCharge(requestId: string, chargeId: string, approved: boolean): HomeServiceRequest | null {
    const req = this.requests.get(requestId);
    if (!req) return null;

    const chg = req.additionalCharges.find(c => c.id === chargeId);
    if (!chg) return null;

    chg.status = approved ? 'APPROVED_BY_CUSTOMER' : 'REJECTED_BY_CUSTOMER';
    if (approved) {
      chg.approvedAt = new Date().toISOString();
      req.totalCustomerPayable += chg.totalAmount;
      req.paymentStatus = 'PENDING';
      req.status = 'WORK_STARTED';
    } else {
      req.status = 'WORK_STARTED'; // continue with base service without additional material
    }

    req.updatedAt = new Date().toISOString();
    this.requests.set(requestId, req);
    return req;
  }

  // ==========================================
  // PAYOUTS & REIMBURSEMENTS
  // ==========================================
  private createTechnicianPayout(technicianId: string, request: HomeServiceRequest): HomeTechnicianPayout {
    // Base agreed technician payout for visit is ₹350 + any approved material reimbursement
    let materialReimbursement = 0;
    request.additionalCharges.forEach(chg => {
      if (chg.status === 'APPROVED_BY_CUSTOMER') {
        materialReimbursement += chg.materialCost;
      }
    });

    const grossAmount = 350 + materialReimbursement;
    const payout: HomeTechnicianPayout = {
      id: `payout-${Date.now().toString(36)}`,
      technicianId,
      requestId: request.id,
      requestCode: request.requestCode,
      grossAmount,
      materialReimbursement,
      platformCommissionOrFee: 0,
      netPayoutAmount: grossAmount,
      status: 'PENDING_APPROVAL',
      calculatedAt: new Date().toISOString()
    };

    this.payouts.set(payout.id, payout);
    return payout;
  }

  public getAllPayouts(technicianId?: string): HomeTechnicianPayout[] {
    let list = Array.from(this.payouts.values());
    if (technicianId) {
      list = list.filter(p => p.technicianId === technicianId);
    }
    return list;
  }

  // ==========================================
  // ASSETS & PASSPORT
  // ==========================================
  public getAssetsByCustomerId(customerId: string): HouseholdAsset[] {
    return Array.from(this.assets.values()).filter(a => a.customerId === customerId);
  }

  public createAsset(data: Omit<HouseholdAsset, 'id'>): HouseholdAsset {
    const id = `asset-${Date.now().toString(36)}`;
    const asset: HouseholdAsset = { ...data, id };
    this.assets.set(id, asset);
    return asset;
  }

  public getPassportEntries(customerId: string): MaintenancePassportEntry[] {
    return Array.from(this.passportEntries.values()).filter(p => p.customerId === customerId);
  }

  // ==========================================
  // SOCIETIES & COMPLAINTS
  // ==========================================
  public getAllSocieties(): ResidentialSociety[] {
    return Array.from(this.societies.values());
  }

  public getAllComplaints(): HomeComplaint[] {
    return Array.from(this.complaints.values());
  }
}

// Global Singleton Instance
export const homeDataStore = new HomeDataStore();
