import { PrismaClient, BookingMethod } from '@prisma/client';
import { AHMEDABAD_PLACES } from '../src/data/ahmedabad-places';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ahmedabad places into Neon database...');

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

  const categoriesList = await prisma.serviceCategory.findMany();
  const categoryMap = new Map(categoriesList.map((c) => [c.slug, c.id]));

  console.log(`Processing ${AHMEDABAD_PLACES.length} curated Ahmedabad venues...`);
  let count = 0;

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

    count++;
    console.log(`[${count}/${AHMEDABAD_PLACES.length}] ✓ ${place.name}`);
  }

  const totalInDb = await prisma.provider.count();
  console.log(`\n🎉 Done! Successfully synced. Total providers in DB: ${totalInDb}`);
}

main()
  .catch((e) => {
    console.error('Error seeding places:', e);
  })
  .finally(() => prisma.$disconnect());
