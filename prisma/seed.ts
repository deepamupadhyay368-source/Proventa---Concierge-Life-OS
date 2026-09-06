import { PrismaClient, UserRole, ProviderStatus, BookingMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AHMEDABAD_PLACES } from '../src/data/ahmedabad-places';

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
  // Curated Providers for Ahmedabad Wave 1 & Beyond
  const categoriesList = await prisma.serviceCategory.findMany();
  const categoryMap = new Map(categoriesList.map((c) => [c.slug, c.id]));

  for (const place of AHMEDABAD_PLACES) {
    const categoryId = categoryMap.get(place.categorySlug) || categoryMap.get('other') || categoriesList[0].id;

    await prisma.provider.upsert({
      where: { id: place.id },
      update: {
        name: place.name,
        description: place.description,
        address: place.address,
        phone: place.phone || null,
        website: place.website || null,
        bookingMethod: place.bookingMethod as BookingMethod,
        status: 'ACTIVE',
        reliabilityScore: place.reliabilityScore,
        notes: place.notes || null,
        tags: place.tags,
      },
      create: {
        id: place.id,
        name: place.name,
        cityId: ahmedabad.id,
        categoryId,
        description: place.description,
        address: place.address,
        phone: place.phone || null,
        website: place.website || null,
        bookingMethod: place.bookingMethod as BookingMethod,
        status: 'ACTIVE',
        reliabilityScore: place.reliabilityScore,
        notes: place.notes || null,
        tags: place.tags,
        services: {
          create: place.services.map((s) => ({
            name: s.name,
            description: s.description || null,
            priceRange: s.priceRange || null,
            available: true,
          })),
        },
      },
    });
  }

  console.log(`✓ Seeded ${AHMEDABAD_PLACES.length} curated Ahmedabad places across all categories`);

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
