import { PrismaClient, UserRole, ProviderStatus, BookingMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Proventa database...');

  // Cities
  const ahmedabad = await prisma.city.upsert({
    where: { slug: 'ahmedabad' },
    update: {},
    create: {
      name: 'Ahmedabad',
      slug: 'ahmedabad',
      country: 'IN',
      timezone: 'Asia/Kolkata',
      active: true,
      launchDate: new Date('2024-10-01'),
    },
  });
  console.log('✓ City: Ahmedabad');

  // Placeholder cities for future expansion
  await prisma.city.upsert({
    where: { slug: 'mumbai' },
    update: {},
    create: { name: 'Mumbai', slug: 'mumbai', country: 'IN', timezone: 'Asia/Kolkata', active: false },
  });
  await prisma.city.upsert({
    where: { slug: 'bangalore' },
    update: {},
    create: { name: 'Bangalore', slug: 'bangalore', country: 'IN', timezone: 'Asia/Kolkata', active: false },
  });

  // Service Categories
  const categories = [
    { name: 'Dining', slug: 'dining', description: 'Restaurants, reservations, and dining experiences', icon: 'utensils', sortOrder: 1 },
    { name: 'Travel', slug: 'travel', description: 'Flights, hotels, transfers, and itineraries', icon: 'plane', sortOrder: 2 },
    { name: 'Shopping', slug: 'shopping', description: 'Gifts, products, and sourcing', icon: 'shopping-bag', sortOrder: 3 },
    { name: 'Experiences', slug: 'experiences', description: 'Events, cinema, sports, and activities', icon: 'ticket', sortOrder: 4 },
    { name: 'Appointments', slug: 'appointments', description: 'Salons, spas, wellness, and coordination', icon: 'calendar', sortOrder: 5 },
    { name: 'Home', slug: 'home', description: 'Repairs, cleaning, maintenance, and home services', icon: 'home', sortOrder: 6 },
    { name: 'Personal', slug: 'personal', description: 'Research, errands, planning, and coordination', icon: 'user', sortOrder: 7 },
    { name: 'Business', slug: 'business', description: 'Business travel, gifting, meetings, and arrangements', icon: 'briefcase', sortOrder: 8 },
    { name: 'Anything Else', slug: 'other', description: 'If it can reasonably be delegated, ask', icon: 'sparkles', sortOrder: 9 },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✓ Service categories seeded');

  // Feature Flags
  const flags = [
    { key: 'WAVE1_REGISTRATION', value: true, description: 'Allow Wave 1 registrations' },
    { key: 'GOOGLE_AUTH', value: false, description: 'Google OAuth login' },
    { key: 'AI_ENABLED', value: false, description: 'AI agent processing (requires GEMINI_API_KEY)' },
    { key: 'PAYMENTS_ENABLED', value: false, description: 'Payment processing (requires Razorpay config)' },
    { key: 'WHATSAPP_ENABLED', value: false, description: 'WhatsApp notifications' },
    { key: 'SMS_ENABLED', value: false, description: 'SMS notifications' },
    { key: 'VOICE_ENABLED', value: false, description: 'Voice input support' },
    { key: 'IMAGE_REQUESTS', value: false, description: 'Image-based requests' },
    { key: 'CUSTOMER_EXPORT', value: true, description: 'Allow customers to export their data' },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }
  console.log('✓ Feature flags seeded');

  // System Settings
  const settings = [
    { key: 'LAUNCH_STATE', value: 'PRE_LAUNCH', type: 'string' },
    { key: 'SLA_INITIAL_RESPONSE_MINUTES', value: '30', type: 'number' },
    { key: 'SLA_OPTIONS_HOURS', value: '2', type: 'number' },
    { key: 'SLA_EXECUTION_HOURS', value: '4', type: 'number' },
    { key: 'AI_CONFIDENCE_THRESHOLD', value: '0.7', type: 'number' },
    { key: 'AI_HANDOFF_AMOUNT_INR', value: '10000', type: 'number' },
    { key: 'MAX_UPLOAD_SIZE_MB', value: '10', type: 'number' },
    { key: 'CONCIERGE_OPERATING_HOURS_START', value: '09:00', type: 'string' },
    { key: 'CONCIERGE_OPERATING_HOURS_END', value: '21:00', type: 'string' },
    { key: 'PRIMARY_CITY', value: 'ahmedabad', type: 'string' },
    { key: 'SUPPORT_EMAIL', value: 'support@proventa.in', type: 'string' },
    { key: 'CONCIERGE_EMAIL', value: 'concierge@proventa.in', type: 'string' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  // Curated Providers for Ahmedabad Wave 1
  const diningCategory = await prisma.serviceCategory.findUnique({ where: { slug: 'dining' } });
  const travelCategory = await prisma.serviceCategory.findUnique({ where: { slug: 'travel' } });
  const shoppingCategory = await prisma.serviceCategory.findUnique({ where: { slug: 'shopping' } });
  const appointmentsCategory = await prisma.serviceCategory.findUnique({ where: { slug: 'appointments' } });
  const homeCategory = await prisma.serviceCategory.findUnique({ where: { slug: 'home' } });

  if (diningCategory && ahmedabad) {
    const agashiye = await prisma.provider.upsert({
      where: { id: 'prov_agashiye_ahm' },
      update: {},
      create: {
        id: 'prov_agashiye_ahm',
        name: 'Agashiye — The House of MG',
        cityId: ahmedabad.id,
        categoryId: diningCategory.id,
        description: 'Iconic heritage Gujarati rooftop dining experience in Old Ahmedabad.',
        address: 'Opp. Sidi Saiyyed Mosque, Gheekanta, Ahmedabad, Gujarat 380001',
        bookingMethod: 'PHONE',
        status: 'ACTIVE',
        reliabilityScore: 98,
        notes: 'Requires reservation 24-48h in advance for weekend dinner. Concierge phone verification required.',
        services: {
          create: [
            { name: 'Heritage Gujarati Thali Dinner', priceRange: '₹1,200 - ₹1,800 per person' },
            { name: 'Terrace Private Seating', priceRange: '₹2,500 per person' },
          ],
        },
      },
    });

    await prisma.provider.upsert({
      where: { id: 'prov_tinello_ahm' },
      update: {},
      create: {
        id: 'prov_tinello_ahm',
        name: 'Tinello — Hyatt Regency',
        cityId: ahmedabad.id,
        categoryId: diningCategory.id,
        description: 'Contemporary Italian fine dining featuring an open show kitchen.',
        address: '17/A, Ashram Rd, Usmanpura, Ahmedabad, Gujarat 380014',
        bookingMethod: 'PHONE',
        status: 'ACTIVE',
        reliabilityScore: 95,
        notes: 'Smart casual dress code. Quiet tables available in the mezzanine section.',
        services: {
          create: [
            { name: 'Italian A La Carte Dinner', priceRange: '₹2,000 - ₹3,000 per person' },
          ],
        },
      },
    });
  }

  if (travelCategory && ahmedabad) {
    await prisma.provider.upsert({
      where: { id: 'prov_transfers_ahm' },
      update: {},
      create: {
        id: 'prov_transfers_ahm',
        name: 'Ahmedabad Chauffeur & Airport Fleet',
        cityId: ahmedabad.id,
        categoryId: travelCategory.id,
        description: 'Premium executive transfers to/from Sardar Vallabhbhai Patel International Airport.',
        bookingMethod: 'PHONE',
        status: 'ACTIVE',
        reliabilityScore: 96,
        notes: 'Chauffeur details shared 2 hours before scheduled pickup.',
        services: {
          create: [
            { name: 'Sedan Airport Transfer', priceRange: '₹1,500 - ₹2,200' },
            { name: 'Executive SUV City Transit', priceRange: '₹3,500 - ₹5,000' },
          ],
        },
      },
    });
  }

  console.log('✓ Ahmedabad Wave 1 providers seeded');

  // Admin user (for development)
  if (process.env.NODE_ENV !== 'production') {
    const adminEmail = 'admin@proventa.dev';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('ProvEntaDev2024!', 12);
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Proventa Admin',
          emailVerified: new Date(),
          passwordHash,
          status: 'ACTIVE',
          userRoles: {
            create: [
              { role: 'ADMIN' },
              { role: 'CONCIERGE_MANAGER' },
            ],
          },
        },
      });
      console.log('✓ Dev admin user created:', adminEmail);
    } else {
      console.log('✓ Dev admin user already exists');
    }
  }

  console.log('\n✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
