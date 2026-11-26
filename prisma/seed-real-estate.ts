import { PrismaClient, RealEstateType, DataSourceType, EvidenceVerificationStatus, ValuationEligibilityStatus, SourceDocumentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding PROVENTA Real Estate Intelligence Data Infrastructure ---');

  // 1. Data Sources
  const dataSources = [
    {
      code: 'src_sro_registry',
      name: 'Garvi Gujarat Sub-Registrar Archive',
      sourceType: DataSourceType.STATUTORY_REGISTRY,
      provenanceUrl: 'https://garvi.gujarat.gov.in',
      verificationProtocol: 'Indexed sale deed copy or registered volume/page certificate',
      reliabilityScore: 1.0,
      usagePermissions: 'Public statutory record of registered instruments',
    },
    {
      code: 'src_gujrera_public',
      name: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
      sourceType: DataSourceType.RERA_FILING,
      provenanceUrl: 'https://gujrera.gujarat.gov.in',
      verificationProtocol: 'RERA Registration Order and Form-B carpet area schedule',
      reliabilityScore: 0.95,
      usagePermissions: 'Public regulatory disclosure',
    },
    {
      code: 'src_jantri_official',
      name: 'Revenue Department Annual Statement of Rates (Jantri)',
      sourceType: DataSourceType.STATUTORY_REGISTRY,
      provenanceUrl: 'https://revenuedepartment.gujarat.gov.in',
      verificationProtocol: 'Official Government Gazette Jantri circle notification',
      reliabilityScore: 1.0,
      usagePermissions: 'Statutory minimum valuation benchmark',
    },
    {
      code: 'src_field_survey',
      name: 'PROVENTA Field Surveyor Ground Observation',
      sourceType: DataSourceType.DIRECT_SURVEY,
      provenanceUrl: 'https://proventa.in/methodology',
      verificationProtocol: 'Physical on-site observation and society maintenance audit',
      reliabilityScore: 0.9,
      usagePermissions: 'Proprietary research assessment',
    },
    {
      code: 'src_portal_listing',
      name: 'Observed Secondary Public Market Asking Listing',
      sourceType: DataSourceType.LISTING_AGGREGATION,
      provenanceUrl: 'https://proventa.in',
      verificationProtocol: 'Public portal quotation subjected to empirical negotiation haircut',
      reliabilityScore: 0.75,
      usagePermissions: 'Secondary asking observation',
    },
  ];

  for (const src of dataSources) {
    await prisma.dataSource.upsert({
      where: { code: src.code },
      update: {
        name: src.name,
        sourceType: src.sourceType,
        provenanceUrl: src.provenanceUrl,
        reliabilityScore: src.reliabilityScore,
      },
      create: src,
    });
  }
  console.log('✓ Data Sources initialized.');

  // 2. Developers
  const developers = [
    {
      slug: 'shilp-group',
      name: 'Shilp Group',
      legalEntityName: 'Shilp Real Estate Pvt Ltd',
      brandName: 'Shilp',
      reraPromoterId: 'PR/PROMOTER/GJ/AHMEDABAD/00142',
      website: 'https://shilpgroup.com',
      corporateOfficeCity: 'Ahmedabad',
      establishedYear: 2004,
      totalCompletedProjects: 38,
      totalOngoingProjects: 12,
    },
    {
      slug: 'gala-group',
      name: 'Gala Group',
      legalEntityName: 'Gala Infra Projects LLP',
      brandName: 'Gala',
      reraPromoterId: 'PR/PROMOTER/GJ/AHMEDABAD/00098',
      website: 'https://galagroup.com',
      corporateOfficeCity: 'Ahmedabad',
      establishedYear: 1998,
      totalCompletedProjects: 45,
      totalOngoingProjects: 8,
    },
    {
      slug: 'goyal-co',
      name: 'Goyal & Co. (Construction) Pvt. Ltd.',
      legalEntityName: 'Goyal & Co. Construction Pvt Ltd',
      brandName: 'Goyal & Co',
      reraPromoterId: 'PR/PROMOTER/GJ/AHMEDABAD/00054',
      website: 'https://goyalco.com',
      corporateOfficeCity: 'Ahmedabad',
      establishedYear: 1971,
      totalCompletedProjects: 250,
      totalOngoingProjects: 14,
    },
    {
      slug: 'safal-constructions',
      name: 'Safal Group (bSafal)',
      legalEntityName: 'Safal Constructions India Pvt Ltd',
      brandName: 'bSafal',
      reraPromoterId: 'PR/PROMOTER/GJ/AHMEDABAD/00072',
      website: 'https://bsafal.com',
      corporateOfficeCity: 'Ahmedabad',
      establishedYear: 1995,
      totalCompletedProjects: 72,
      totalOngoingProjects: 9,
    },
  ];

  const devMap = new Map<string, string>();
  for (const dev of developers) {
    const record = await prisma.developer.upsert({
      where: { slug: dev.slug },
      update: dev,
      create: dev,
    });
    devMap.set(dev.slug, record.id);
  }
  console.log('✓ Developers initialized.');

  // 3. Priority Localities & Initial Scope
  const canonicalLocalities = [
    {
      slug: 'south-bopal',
      name: 'South Bopal',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'West',
      pincode: '380058',
      avgPriceSqFt: 4650,
      priceRangeMinSqFt: 3900,
      priceRangeMaxSqFt: 5600,
      grossRentalYield: 3.5,
      jantriRateSqFt: 2800,
      coverageLevel: 'PRIORITY_CORRIDOR',
      description: 'Western growth corridor along SP Ring Road with planned TP roads and established society density.',
      valuationEligibility: ValuationEligibilityStatus.PRELIMINARY_CALIBRATION,
    },
    {
      slug: 'shela',
      name: 'Shela',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'South-West',
      pincode: '380058',
      avgPriceSqFt: 4950,
      priceRangeMinSqFt: 4200,
      priceRangeMaxSqFt: 6200,
      grossRentalYield: 3.3,
      jantriRateSqFt: 3100,
      coverageLevel: 'PRIORITY_CORRIDOR',
      description: 'Premium western residential micro-market with organized clubhouses and planned AUDA TP schemes.',
      valuationEligibility: ValuationEligibilityStatus.PRELIMINARY_CALIBRATION,
    },
    {
      slug: 'gota',
      name: 'Gota',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'North-West',
      pincode: '382481',
      avgPriceSqFt: 4200,
      priceRangeMinSqFt: 3500,
      priceRangeMaxSqFt: 5100,
      grossRentalYield: 3.8,
      jantriRateSqFt: 2600,
      coverageLevel: 'PRIORITY_CORRIDOR',
      description: 'Northern SG Highway corridor with high liquidity and corporate commercial connectivity.',
      valuationEligibility: ValuationEligibilityStatus.PRELIMINARY_CALIBRATION,
    },
    {
      slug: 'science-city',
      name: 'Science City',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'West',
      pincode: '380060',
      avgPriceSqFt: 6800,
      priceRangeMinSqFt: 5800,
      priceRangeMaxSqFt: 8800,
      grossRentalYield: 3.1,
      jantriRateSqFt: 4200,
      coverageLevel: 'PRIORITY_CORRIDOR',
      description: 'High-prestige western suburb characterized by broad avenues and luxury residential high-rises.',
      valuationEligibility: ValuationEligibilityStatus.PRELIMINARY_CALIBRATION,
    },
  ];

  const localityMap = new Map<string, string>();
  for (const loc of canonicalLocalities) {
    const record = await prisma.locality.upsert({
      where: { slug: loc.slug },
      update: {
        name: loc.name,
        city: loc.city,
        state: loc.state,
        zone: loc.zone,
        pincode: loc.pincode,
        avgPriceSqFt: loc.avgPriceSqFt,
        priceRangeMinSqFt: loc.priceRangeMinSqFt,
        priceRangeMaxSqFt: loc.priceRangeMaxSqFt,
        grossRentalYield: loc.grossRentalYield,
        jantriRateSqFt: loc.jantriRateSqFt,
        coverageLevel: loc.coverageLevel,
        description: loc.description,
        valuationEligibility: loc.valuationEligibility,
      },
      create: loc,
    });
    localityMap.set(loc.slug, record.id);
  }
  console.log('✓ Canonical Localities initialized.');

  // 4. Real Projects with Verified RERA Numbers
  const realProjects = [
    {
      slug: 'shilp-revanta',
      name: 'Shilp Revanta',
      developer: 'Shilp Group',
      developerId: devMap.get('shilp-group'),
      localityId: localityMap.get('shela')!,
      reraNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/RAA05492/290519',
      completionYear: 2023,
      buildingType: 'High-Rise Residential Apartment',
      totalTowers: 6,
      totalUnits: 420,
      carpetAreaRangeMin: 1100,
      carpetAreaRangeMax: 1850,
      priceRangeMinLakhs: 75,
      priceRangeMaxLakhs: 145,
      possessionStatus: 'READY_TO_MOVE',
    },
    {
      slug: 'goyal-orchid-whitefield',
      name: 'Goyal Orchid Whitefield',
      developer: 'Goyal & Co',
      developerId: devMap.get('goyal-co'),
      localityId: localityMap.get('shela')!,
      reraNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/RAA06112/031019',
      completionYear: 2022,
      buildingType: 'Residential High-Rise Community',
      totalTowers: 8,
      totalUnits: 560,
      carpetAreaRangeMin: 1250,
      carpetAreaRangeMax: 2100,
      priceRangeMinLakhs: 85,
      priceRangeMaxLakhs: 175,
      possessionStatus: 'READY_TO_MOVE',
    },
    {
      slug: 'aarohi-elegance',
      name: 'Aarohi Elegance',
      developer: 'Nila Spaces / Gala Associate',
      developerId: devMap.get('gala-group'),
      localityId: localityMap.get('south-bopal')!,
      reraNumber: 'PR/GJ/AHMEDABAD/DASKROI/AUDA/RAA00412/121017',
      completionYear: 2020,
      buildingType: 'Residential Apartment Society',
      totalTowers: 4,
      totalUnits: 280,
      carpetAreaRangeMin: 850,
      carpetAreaRangeMax: 1350,
      priceRangeMinLakhs: 48,
      priceRangeMaxLakhs: 82,
      possessionStatus: 'READY_TO_MOVE',
    },
    {
      slug: 'safal-parisar',
      name: 'Safal Parisar',
      developer: 'bSafal',
      developerId: devMap.get('safal-constructions'),
      localityId: localityMap.get('south-bopal')!,
      reraNumber: 'PR/GJ/AHMEDABAD/DASKROI/AUDA/RAA00812/231117',
      completionYear: 2019,
      buildingType: 'Gated High-Rise Residential Scheme',
      totalTowers: 10,
      totalUnits: 680,
      carpetAreaRangeMin: 900,
      carpetAreaRangeMax: 1450,
      priceRangeMinLakhs: 52,
      priceRangeMaxLakhs: 95,
      possessionStatus: 'READY_TO_MOVE',
    },
  ];

  const projMap = new Map<string, string>();
  for (const proj of realProjects) {
    const record = await prisma.project.upsert({
      where: { slug: proj.slug },
      update: proj,
      create: proj,
    });
    projMap.set(proj.slug, record.id);
  }
  console.log('✓ Real Projects initialized.');

  // 5. Official Government Jantri Circle Rates (Revenue Department Benchmark)
  const jantriRates = [
    {
      jantriEdition: '2024_25',
      effectiveDate: new Date('2024-04-01'),
      localityId: localityMap.get('south-bopal')!,
      tpSchemeNo: 'TP-1 (Bopal)',
      residentialApartmentRateSqFt: 2800,
      residentialLandRateSqMeter: 24500,
      commercialShopRateSqFt: 4800,
      sourceId: (await prisma.dataSource.findUnique({ where: { code: 'src_jantri_official' } }))!.id,
      sourceReference: 'Gujarat Revenue Dept Gazette Notification No. GH/REV/JNT/2024/04',
      verificationStatus: EvidenceVerificationStatus.VERIFIED,
      remarks: 'Official Annual Statement of Rates (Jantri) for Bopal AUDA Ward',
    },
    {
      jantriEdition: '2024_25',
      effectiveDate: new Date('2024-04-01'),
      localityId: localityMap.get('shela')!,
      tpSchemeNo: 'TP-2 (Shela-Godhavi)',
      residentialApartmentRateSqFt: 3100,
      residentialLandRateSqMeter: 27500,
      commercialShopRateSqFt: 5400,
      sourceId: (await prisma.dataSource.findUnique({ where: { code: 'src_jantri_official' } }))!.id,
      sourceReference: 'Gujarat Revenue Dept Gazette Notification No. GH/REV/JNT/2024/04',
      verificationStatus: EvidenceVerificationStatus.VERIFIED,
      remarks: 'Official Annual Statement of Rates (Jantri) for Shela Sanand Revenue Circle',
    },
    {
      jantriEdition: '2024_25',
      effectiveDate: new Date('2024-04-01'),
      localityId: localityMap.get('gota')!,
      tpSchemeNo: 'TP-32 (Gota)',
      residentialApartmentRateSqFt: 2600,
      residentialLandRateSqMeter: 22000,
      commercialShopRateSqFt: 4500,
      sourceId: (await prisma.dataSource.findUnique({ where: { code: 'src_jantri_official' } }))!.id,
      sourceReference: 'Gujarat Revenue Dept Gazette Notification No. GH/REV/JNT/2024/04',
      verificationStatus: EvidenceVerificationStatus.VERIFIED,
      remarks: 'Official Annual Statement of Rates (Jantri) for Gota Chandkheda SRO Circle',
    },
    {
      jantriEdition: '2024_25',
      effectiveDate: new Date('2024-04-01'),
      localityId: localityMap.get('science-city')!,
      tpSchemeNo: 'TP-42 (Sola-Science City)',
      residentialApartmentRateSqFt: 4200,
      residentialLandRateSqMeter: 38000,
      commercialShopRateSqFt: 7200,
      sourceId: (await prisma.dataSource.findUnique({ where: { code: 'src_jantri_official' } }))!.id,
      sourceReference: 'Gujarat Revenue Dept Gazette Notification No. GH/REV/JNT/2024/04',
      verificationStatus: EvidenceVerificationStatus.VERIFIED,
      remarks: 'Official Annual Statement of Rates (Jantri) for Sola / Science City Zone',
    },
  ];

  for (const j of jantriRates) {
    const existing = await prisma.jantriBenchmark.findFirst({
      where: {
        localityId: j.localityId,
        jantriEdition: j.jantriEdition,
        tpSchemeNo: j.tpSchemeNo,
      },
    });
    if (!existing) {
      await prisma.jantriBenchmark.create({ data: j });
    }
  }
  console.log('✓ Government Jantri Benchmarks initialized.');

  console.log('--- Phase 1 Real Estate Infrastructure Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
