// Comprehensive Directory of Curated Ahmedabad Places, Establishments & Providers
// Spanning Dining, Luxury Hotels & Transfers, Wellness & Spas, Heritage & Experiences, Retail & Home Services.

export interface SeedProvider {
  id: string;
  name: string;
  categorySlug: 'dining' | 'travel' | 'shopping' | 'experiences' | 'appointments' | 'home' | 'personal' | 'business';
  description: string;
  address: string;
  phone?: string;
  website?: string;
  instagramUrl?: string;
  bookingMethod: 'PHONE' | 'EMAIL' | 'WEBSITE' | 'WHATSAPP' | 'APP' | 'WALK_IN';
  reliabilityScore: number;
  notes?: string;
  tags: string[];
  services: Array<{
    name: string;
    description?: string;
    priceRange?: string;
  }>;
}

export const AHMEDABAD_PLACES: SeedProvider[] = [
  // ==========================================
  // 1. FINE DINING & HERITAGE CUISINE
  // ==========================================
  {
    id: 'prov_agashiye_the_house_of_mg',
    name: 'Agashiye — The House of MG',
    categorySlug: 'dining',
    description: 'World-renowned rooftop heritage Gujarati thali dining situated in a restored 1924 mansion in the UNESCO World Heritage City.',
    address: 'Opposite Sidi Saiyyed Mosque, Gheekanta, Lal Darwaja, Ahmedabad, Gujarat 380001',
    phone: '+91 79 2550 6946',
    website: 'https://houseofmg.com/agashiye',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Prior reservation essential (24-48h). Concierge VIP terrace tables available upon request.',
    tags: ['gujarati', 'heritage', 'fine dining', 'rooftop', 'old ahmedabad', 'thali'],
    services: [
      { name: 'Heritage Gujarati Thali Experience', priceRange: '?1,250 - ?1,850 per guest' },
      { name: 'Private Verandah Dining & Butler Service', priceRange: '?3,500 per guest' }
    ]
  },
  {
    id: 'prov_tinello_hyatt_regency',
    name: 'Tinello — Hyatt Regency',
    categorySlug: 'dining',
    description: 'Premier Italian fine dining restaurant with an open live kitchen, bespoke pastas, risottos, and wood-fired artisanal pizzas overlooking the Sabarmati River.',
    address: 'Hyatt Regency, 17/A Ashram Road, Usmanpura, Ahmedabad, Gujarat 380014',
    phone: '+91 79 4017 1234',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Smart casual dress code. Quiet mezzanine alcove recommended for corporate or discreet dinners.',
    tags: ['italian', 'fine dining', 'riverfront', 'five star', 'hyatt', 'ashram road'],
    services: [
      { name: 'Artisanal Italian A La Carte Dinner', priceRange: '?2,500 - ?3,500 for two' },
      { name: 'Chef Tasting 4-Course Menu', priceRange: '?3,200 per guest' }
    ]
  },
  {
    id: 'prov_the_greenhouse_house_of_mg',
    name: 'The Green House — House of MG',
    categorySlug: 'dining',
    description: 'Courtyard cafe with wrought-iron furniture and vintage aesthetics serving fresh juices, hand-cranked ice creams, and light regional delicacies.',
    address: 'The House of MG, Opp. Sidi Saiyyed Mosque, Lal Darwaja, Ahmedabad 380001',
    phone: '+91 79 2550 6946',
    bookingMethod: 'PHONE',
    reliabilityScore: 96,
    notes: 'Ideal for relaxed breakfast, high tea, or casual cultural rendezvous.',
    tags: ['courtyard', 'cafe', 'heritage', 'light dining', 'beverages'],
    services: [
      { name: 'Signature Morning Heritage Breakfast', priceRange: '?650 per guest' },
      { name: 'Artisanal Hand-Churned Ice Cream Tasting', priceRange: '?350 - ?500' }
    ]
  },
  {
    id: 'prov_vishalla_heritage',
    name: 'Vishalla Heritage Restaurant',
    categorySlug: 'dining',
    description: 'Authentic village-style open-air dining under lanterns, traditional baithak floor seating, mud-plastered huts, and live folk music.',
    address: 'Opposite APMC Market, Vasna Road, Ahmedabad, Gujarat 380055',
    phone: '+91 79 2660 7977',
    website: 'https://vishalla.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 95,
    notes: 'Home to the famous Vechaar Utensils Museum on premises. Evening timings 7:30 PM to 11:00 PM.',
    tags: ['traditional', 'village theme', 'open air', 'museum', 'gujarati thali', 'vasna'],
    services: [
      { name: 'Traditional Village Thali on Leaf Plates', priceRange: '?950 per guest' },
      { name: 'Vechaar Utensils Museum Private Tour', priceRange: '?200 per guest' }
    ]
  },
  {
    id: 'prov_gordhan_thal_bodakdev',
    name: 'Gordhan Thal',
    categorySlug: 'dining',
    description: 'One of the most acclaimed Gujarati and Rajasthani thali destinations on SG Highway, famed for hospitality, farsan, and seasonal delicacies like Aamras and Undhiyu.',
    address: 'Ground Floor, Shapath III, Next to Rajpath Club, SG Highway, Bodakdev, Ahmedabad 380054',
    phone: '+91 79 2687 1222',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Expect weekend queues; concierge pre-booking ensures fast-tracked seating.',
    tags: ['gujarati', 'rajasthani', 'thali', 'sg highway', 'bodakdev', 'family dining'],
    services: [
      { name: 'Royal Gujarati-Rajasthani Unlimited Thali', priceRange: '?600 - ?800 per guest' }
    ]
  },
  {
    id: 'prov_china_house_hyatt_regency',
    name: 'China House — Hyatt Regency',
    categorySlug: 'dining',
    description: 'High-end Sichuan and Cantonese dining restaurant featuring interactive show kitchen, dim sum bar, and bespoke tea sommelier service.',
    address: 'Hyatt Regency, 17/A Ashram Road, Usmanpura, Ahmedabad 380014',
    phone: '+91 79 4017 1234',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Private dining room (PDR) available for 10-14 guests with custom tailored banquet menus.',
    tags: ['chinese', 'sichuan', 'dim sum', 'fine dining', 'hyatt', 'riverfront'],
    services: [
      { name: 'Imperial Dim Sum Lunch / Dinner', priceRange: '?3,000 for two' },
      { name: 'Private Dining Room Chef Experience', priceRange: '?4,000 per guest' }
    ]
  },
  {
    id: 'prov_under_the_neem_tree',
    name: 'Under The Neem Tree',
    categorySlug: 'dining',
    description: 'Upscale al-fresco fine dining restaurant in a serene lush courtyard serving refined North Indian, Pan-Asian, and continental plates.',
    address: 'Opposite Shaligram 3, B/h Rajpath Club, Bodakdev, Ahmedabad 380054',
    phone: '+91 99099 22000',
    bookingMethod: 'PHONE',
    reliabilityScore: 94,
    notes: 'Magical open-air ambiance with fairy lights in the evening. Prior table reservation strongly advised.',
    tags: ['al fresco', 'courtyard', 'continental', 'north indian', 'romantic', 'bodakdev'],
    services: [
      { name: 'Courtyard Candlelight Dinner For Two', priceRange: '?2,500 - ?3,500' }
    ]
  },
  {
    id: 'prov_nonna_italian_bistro',
    name: 'Bella — Crowne Plaza',
    categorySlug: 'dining',
    description: 'Sophisticated contemporary Italian specialty dining with authentic wood stone oven, artisanal pasta, and handcrafted mocktails.',
    address: 'Crowne Plaza, S.G. Highway, Prahlad Nagar, Ahmedabad 380015',
    phone: '+91 79 6777 9000',
    bookingMethod: 'PHONE',
    reliabilityScore: 96,
    notes: 'Popular for quiet executive power lunches and private anniversary dinners.',
    tags: ['italian', 'fine dining', 'prahlad nagar', 'five star', 'sg highway'],
    services: [
      { name: 'Signature Hand-Rolled Pasta Dinner', priceRange: '?2,800 for two' }
    ]
  },
  {
    id: 'prov_moksha_the_leela_gandhinagar',
    name: 'Citrus Bistro & Moksha Lounge — The Leela Gandhinagar',
    categorySlug: 'dining',
    description: 'Ultra-luxurious dining venue built atop the Gandhinagar Capital railway station offering world-class multi-cuisine culinary mastery and patisserie.',
    address: 'The Leela Gandhinagar, Airspace, Sector 14, Gandhinagar / Greater Ahmedabad 382014',
    phone: '+91 79 6922 1234',
    website: 'https://theleela.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: '25-minute executive chauffeur drive from Ahmedabad Airport. Ideal for VVIPs and diplomatic delegations.',
    tags: ['luxury', 'the leela', 'five star deluxe', 'gandhinagar', 'multi cuisine'],
    services: [
      { name: 'Gourmet High Tea & Pastry Flight', priceRange: '?1,500 per guest' },
      { name: 'Grand Degustation Buffet & A La Carte', priceRange: '?3,500 - ?5,000 for two' }
    ]
  },
  {
    id: 'prov_souq_middle_eastern',
    name: 'Souq — Bistro & Lounge',
    categorySlug: 'dining',
    description: 'Mediterranean and Middle Eastern specialty bistro known for cold mezze, freshly baked pita, falafel platters, and Turkish coffees.',
    address: 'Near Sindhu Bhavan Marg, PRL Colony, Thaltej, Ahmedabad 380059',
    phone: '+91 79 4890 5566',
    bookingMethod: 'PHONE',
    reliabilityScore: 93,
    notes: 'Located right off the buzzing Sindhu Bhavan hub.',
    tags: ['mediterranean', 'middle eastern', 'sindhu bhavan', 'thaltej', 'mezze'],
    services: [
      { name: 'Grand Mezze Feast for Two', priceRange: '?1,800 - ?2,500' }
    ]
  },

  // ==========================================
  // 2. LUXURY HOTELS, RESORTS & TRAVEL
  // ==========================================
  {
    id: 'prov_itc_narmada_luxury_collection',
    name: 'ITC Narmada, a Luxury Collection Hotel',
    categorySlug: 'travel',
    description: 'Architectural jewel paying homage to the stepwells of Gujarat, featuring bespoke butler service, Kaya Kalp Spa, and world-class suites.',
    address: 'Judges Bungalow Rd, Bodakdev, Ahmedabad, Gujarat 380015',
    phone: '+91 79 6966 4000',
    website: 'https://itchotels.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Houses royal royal dining venues: Peshawri, Yi Jing, and Royal Vega.',
    tags: ['luxury hotel', 'five star', 'itc', 'bodakdev', 'butler service', 'spa', 'suites'],
    services: [
      { name: 'Luxury Executive Suite Booking', priceRange: '?18,000 - ?35,000 / night' },
      { name: 'Peshawri Royal Table Reservation', priceRange: '?4,500 for two' },
      { name: 'Kaya Kalp Ayurvedic Wellness Treatment', priceRange: '?5,500 - ?12,000' }
    ]
  },
  {
    id: 'prov_taj_skyline_ahmedabad',
    name: 'Taj Skyline Ahmedabad',
    categorySlug: 'travel',
    description: 'Contemporary luxury 5-star destination featuring modern suites, J Wellness Circle spa, temperature-controlled indoor infinity pool, and pan-Asian dining.',
    address: 'Sindhu Bhavan Road, Thaltej, Ahmedabad, Gujarat 380058',
    phone: '+91 79 4040 0000',
    website: 'https://tajhotels.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Situated at the heart of Sindhu Bhavan high-street district.',
    tags: ['luxury hotel', 'taj', 'five star', 'sindhu bhavan', 'thaltej', 'spa', 'indoor pool'],
    services: [
      { name: 'Taj Club Suite with Skyline View', priceRange: '?16,000 - ?28,000 / night' },
      { name: 'J Wellness Circle Signature Therapy', priceRange: '?6,000 - ?10,000' }
    ]
  },
  {
    id: 'prov_the_house_of_mg_hotel',
    name: 'The House of MG Heritage Hotel',
    categorySlug: 'travel',
    description: 'Historic 1924 heritage hotel in Old Ahmedabad with restored antique rooms, indoor lotus pool, craft shops, and guided heritage night walks.',
    address: 'Opp. Sidi Saiyyed Mosque, Gheekanta, Lal Darwaja, Ahmedabad 380001',
    phone: '+91 79 2550 6946',
    website: 'https://houseofmg.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Prime choice for cultural dignitaries, authors, and connoisseurs of Indian crafts.',
    tags: ['heritage hotel', 'boutique', 'unesco', 'old ahmedabad', 'pool', 'crafts'],
    services: [
      { name: 'Heritage Grand Suite Night Stay', priceRange: '?12,000 - ?20,000 / night' },
      { name: 'Private Guided Walled City Heritage Walk', priceRange: '?2,500 per group' }
    ]
  },
  {
    id: 'prov_courtyard_by_marriott_sindhu_bhavan',
    name: 'Courtyard by Marriott Ahmedabad Sindhu Bhavan',
    categorySlug: 'travel',
    description: 'Modern luxury hotel with sprawling event ballrooms, rooftop terrace, and state-of-the-art business facilities on Sindhu Bhavan Road.',
    address: 'Sindhu Bhavan Road, Bodakdev, Ahmedabad, Gujarat 380054',
    phone: '+91 79 6912 6666',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Exceptional executive conference rooms and rooftop gatherings.',
    tags: ['marriott', 'five star', 'sindhu bhavan', 'business travel', 'events'],
    services: [
      { name: 'Deluxe Executive King Room', priceRange: '?10,000 - ?16,000 / night' }
    ]
  },
  {
    id: 'prov_hyatt_regency_ashram_road',
    name: 'Hyatt Regency Ahmedabad',
    categorySlug: 'travel',
    description: 'Leading five-star riverfront business hotel with panoramic Sabarmati views, outdoor pool, and 24-hour fitness centre.',
    address: '17/A Ashram Road, Usmanpura, Ahmedabad 380014',
    phone: '+91 79 4017 1234',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Closest five-star hotel to Ahmedabad central business district and Gandhinagar highway.',
    tags: ['hyatt', 'riverfront', 'ashram road', 'business', 'pool', 'spa'],
    services: [
      { name: 'Regency Riverfront Suite', priceRange: '?14,000 - ?24,000 / night' }
    ]
  },
  {
    id: 'prov_ahmedabad_executive_chauffeur',
    name: 'Proventa Executive Chauffeur & Airport Fleet',
    categorySlug: 'travel',
    description: 'Private chauffeur fleet of immaculate Mercedes-Benz E-Class, Toyota Camry Hybrid, and Innova Crysta/Hycross vehicles for airport transit and intercity journeys.',
    address: 'Terminal 1 & 2 Sardar Vallabhbhai Patel International Airport (SVPIA), Hansol, Ahmedabad 380003',
    phone: '+91 79 2286 9211',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Meet-and-greet curbside service with nameboard. Mineral water, high-speed Wi-Fi hotspot, and phone chargers included.',
    tags: ['chauffeur', 'airport transfer', 'luxury car', 'mercedes', 'innova hycross', 'intercity'],
    services: [
      { name: 'Airport VIP Transfer (Innova Hycross / Camry)', priceRange: '?2,500 - ?3,500' },
      { name: 'Full-Day 8hr/80km Executive Chauffeur (Mercedes / BMW)', priceRange: '?9,500 - ?14,000' },
      { name: 'Ahmedabad to GIFT City / Gandhinagar Return Transfer', priceRange: '?3,500 - ?4,800' }
    ]
  },

  // ==========================================
  // 3. APPOINTMENTS, WELLNESS & SALONS
  // ==========================================
  {
    id: 'prov_kaya_kalp_spa_itc',
    name: 'Kaya Kalp Spa — ITC Narmada',
    categorySlug: 'appointments',
    description: 'Award-winning luxury spa sanctuary providing signature royal wellness rituals, indigenous aromatherapy, and Ayurvedic rejuvenation therapies.',
    address: 'ITC Narmada, Judges Bungalow Rd, Bodakdev, Ahmedabad 380015',
    phone: '+91 79 6966 4000',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Advance booking required 12-24h. Couples suites and customized bridal packages available.',
    tags: ['spa', 'wellness', 'ayurveda', 'massage', 'luxury', 'bodakdev', 'itc'],
    services: [
      { name: 'Signature Exotic Pomegranate Body Scrub & Massage (90 min)', priceRange: '?7,500' },
      { name: 'Deep Rejuvenating Abhyanga Therapy (60 min)', priceRange: '?5,500' },
      { name: 'Royal Couples Wellness Retreat (120 min)', priceRange: '?15,000' }
    ]
  },
  {
    id: 'prov_j_wellness_circle_taj',
    name: 'J Wellness Circle — Taj Skyline',
    categorySlug: 'appointments',
    description: 'Ancient Indian wellness sanctuary by Taj rooted in holistic Ayurveda, yoga, and meditation therapies in a serene private setting.',
    address: 'Taj Skyline, Sindhu Bhavan Road, Thaltej, Ahmedabad 380058',
    phone: '+91 79 4040 0000',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Natural organic essential oils crafted in India.',
    tags: ['taj', 'j wellness circle', 'spa', 'thaltej', 'sindhu bhavan', 'holistic'],
    services: [
      { name: 'Vishrama Deep Muscular Rejuvenation (90 min)', priceRange: '?7,000' },
      { name: 'Sushupti Sleep Enhancing Treatment (120 min)', priceRange: '?9,500' }
    ]
  },
  {
    id: 'prov_toni_and_guy_bodakdev',
    name: 'Toni & Guy — Bodakdev',
    categorySlug: 'appointments',
    description: 'Internationally trained hair stylists and colorists delivering luxury hair design, K—rastase hair spa rituals, and grooming for men and women.',
    address: 'Near Pakwan Cross Roads, SG Highway, Bodakdev, Ahmedabad 380054',
    phone: '+91 79 4006 1818',
    bookingMethod: 'PHONE',
    reliabilityScore: 95,
    notes: 'Senior Art Director appointments should be booked 48h in advance.',
    tags: ['salon', 'hair styling', 'kerastase', 'bodakdev', 'grooming', 'luxury salon'],
    services: [
      { name: 'Senior Director Hair Cut & Styling', priceRange: '?2,200 - ?3,500' },
      { name: 'K—rastase Fusio-Dose Tailored Hair Ritual', priceRange: '?3,500 - ?5,500' }
    ]
  },
  {
    id: 'prov_enrich_luxury_salon_sindhu_bhavan',
    name: 'Enrich Salon & Skincare Clinic',
    categorySlug: 'appointments',
    description: 'Comprehensive beauty and wellness destination offering dermatologically backed facials, nail architecture, and luxury pedicures.',
    address: 'Times Square Grand, Sindhu Bhavan Road, Thaltej, Ahmedabad 380059',
    phone: '+91 93222 22222',
    bookingMethod: 'PHONE',
    reliabilityScore: 94,
    notes: 'VIP private rooms for bridal consultations.',
    tags: ['skincare', 'salon', 'facials', 'nail art', 'sindhu bhavan', 'thaltej'],
    services: [
      { name: 'Hydra-Infusion Glow Facial', priceRange: '?4,500 - ?7,000' },
      { name: 'Organic Spa Pedicure & Manicure', priceRange: '?2,500' }
    ]
  },
  {
    id: 'prov_vlcc_wellness_vastrapur',
    name: 'VLCC Luxury Wellness & Slimming Centre',
    categorySlug: 'appointments',
    description: 'Specialized aesthetic dermatology, body contouring, and holistic wellness programs.',
    address: 'Near Alpha One / Ahmedabad One Mall, Vastrapur, Ahmedabad 380015',
    phone: '+91 79 4004 0555',
    bookingMethod: 'PHONE',
    reliabilityScore: 92,
    notes: 'Consultation with certified clinical nutritionist included.',
    tags: ['wellness', 'slimming', 'dermatology', 'vastrapur'],
    services: [
      { name: 'Clinical Aesthetic Skin Assessment & Treatment', priceRange: '?3,500 - ?8,000' }
    ]
  },

  // ==========================================
  // 4. EXPERIENCES, CULTURE & LEISURE
  // ==========================================
  {
    id: 'prov_calico_museum_of_textiles',
    name: 'Calico Museum of Textiles',
    categorySlug: 'experiences',
    description: 'One of the worlds most celebrated textile museums housing five centuries of rare royal Indian textiles, pichhwais, and bronze sculptures.',
    address: 'The Retreat, Shahibaug, Ahmedabad, Gujarat 380004',
    phone: '+91 79 2286 8172',
    website: 'https://calicomuseum.org',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Extremely restricted admission; tickets must be reserved weeks in advance. Closed on Wednesdays and public holidays. Concierge assists with VIP bookings.',
    tags: ['museum', 'textiles', 'heritage', 'shahibaug', 'exclusive', 'culture'],
    services: [
      { name: 'Private Historical Textile Gallery Tour', priceRange: 'Complimentary (Restricted pass required)' }
    ]
  },
  {
    id: 'prov_sabarmati_riverfront_waterfront',
    name: 'Sabarmati Riverfront & Atal Bridge',
    categorySlug: 'experiences',
    description: 'Modern pedestrian suspension bridge with iconic architecture, river cruisers, promenade strolls, and waterfront leisure.',
    address: 'Sabarmati Riverfront West, Between Ellis Bridge & Sardar Bridge, Ahmedabad 380009',
    bookingMethod: 'WALK_IN',
    reliabilityScore: 95,
    notes: 'Best experienced during sunset (5:30 PM - 7:30 PM). Luxury speed boats and dinner cruises available.',
    tags: ['riverfront', 'atal bridge', 'cruise', 'sightseeing', 'architecture'],
    services: [
      { name: 'Akshar River Cruise Sunset Dinner', priceRange: '?1,999 - ?2,999 for two' },
      { name: 'Private Motorboat River Tour', priceRange: '?1,500 per ride' }
    ]
  },
  {
    id: 'prov_heritage_night_walk_old_city',
    name: 'Ahmedabad UNESCO World Heritage Walk',
    categorySlug: 'experiences',
    description: 'Curated walking tour through the 600-year-old Pols of Ahmedabad, bird feeders (chabutaras), hidden secret passages, and carving heritage.',
    address: 'Starting at Kalupur Swaminarayan Mandir, ending at Jama Masjid, Ahmedabad 380001',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Conducted daily by municipal heritage historians. Private custom dawn walks arranged by concierge.',
    tags: ['heritage walk', 'unesco', 'pols', 'walled city', 'history', 'photography'],
    services: [
      { name: 'Private Heritage Historian Guided Pol Walk', priceRange: '?2,500 - ?4,000 per group' }
    ]
  },
  {
    id: 'prov_kankaria_lake_cultural_enclosure',
    name: 'Kankaria Lakefront & Nagina Wadi',
    categorySlug: 'experiences',
    description: 'Historic circular lake built in the 15th century by Sultan Qutb-ud-Din, featuring Nagina Wadi musical fountain, hot air ballooning, and gardens.',
    address: 'Kankaria, Maninagar, Ahmedabad 380022',
    bookingMethod: 'WALK_IN',
    reliabilityScore: 94,
    notes: 'Fast-track entry and private golf cart tours around the 2.5km circumference.',
    tags: ['lake', 'kankaria', 'maninagar', 'leisure', 'fountain', 'balloon safari'],
    services: [
      { name: 'VIP Golf Cart Lake Promenade Tour', priceRange: '?1,000 per group' }
    ]
  },
  {
    id: 'prov_adalaj_stepwell_cultural_tour',
    name: 'Adalaj Ni Vav (Stepwell of Adalaj)',
    categorySlug: 'experiences',
    description: 'Five-storey deep 15th-century subterranean architectural marvel featuring Solanki-style carved pillars, galleries, and timeless serenity.',
    address: 'Adalaj, Gandhinagar Highway, Greater Ahmedabad 382421',
    bookingMethod: 'WALK_IN',
    reliabilityScore: 98,
    notes: 'Located 18 km north of Ahmedabad. Superb combined trip with Gandhinagar or airport transfers.',
    tags: ['stepwell', 'monument', 'architecture', 'solanki', 'adalaj', 'heritage'],
    services: [
      { name: 'Chauffeur + Historian Half-Day Heritage Excursion', priceRange: '?4,500 per group' }
    ]
  },

  // ==========================================
  // 5. LUXURY SHOPPING, TEXTILES & JEWELLERY
  // ==========================================
  {
    id: 'prov_bandhej_heritage_fashion',
    name: 'Bandhej — Handcrafted Indian Fashion',
    categorySlug: 'shopping',
    description: 'Pioneering luxury Indian design house celebrating indigenous textile arts: Bandhani, Shibori, Ajrakh block print, and Khadi.',
    address: 'Near Mithakhali Six Roads, Navrangpura, Ahmedabad 380006',
    phone: '+91 79 2642 2149',
    website: 'https://bandhej.com',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Private fashion preview appointments and bridal trousseau consultations.',
    tags: ['fashion', 'textiles', 'handloom', 'bandhani', 'ajrakh', 'navrangpura', 'luxury'],
    services: [
      { name: 'Personal Stylist & Trousseau Consultation', priceRange: 'Complimentary with purchase' },
      { name: 'Custom Tailored Handloom Silks', priceRange: '?15,000 - ?60,000+' }
    ]
  },
  {
    id: 'prov_raw_mango_ahmedabad',
    name: 'Raw Mango by Sanjay Garg',
    categorySlug: 'shopping',
    description: 'Acclaimed contemporary Indian handloom design house specializing in Chanderi, Varanasi silk, and Brocade saris and garments.',
    address: 'Sindhu Bhavan Marg, Bodakdev / Thaltej, Ahmedabad 380059',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Bespoke bridal sari draping sessions available upon concierge request.',
    tags: ['raw mango', 'saris', 'handloom', 'silk', 'designer wear', 'sindhu bhavan'],
    services: [
      { name: 'Exclusive Bridal Sari Curation', priceRange: '?25,000 - ?1,50,000' }
    ]
  },
  {
    id: 'prov_c_krishniah_chetty_or_tbz_jewellers',
    name: 'TBZ — The Original & C.G. Road Jewellery Guild',
    categorySlug: 'shopping',
    description: 'Prestigious jewellery house delivering certified heritage Polki, uncut diamonds, Kundan bridal ornaments, and pure gold craft.',
    address: 'C.G. Road, Navrangpura, Ahmedabad 380009',
    phone: '+91 79 2640 4555',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Private VIP jewellery viewing lounge with dedicated gemologist.',
    tags: ['jewellery', 'gold', 'diamonds', 'polki', 'cg road', 'navrangpura', 'bridal'],
    services: [
      { name: 'VIP Diamond & Polki Private Lounge Consultation', priceRange: 'Bespoke' },
      { name: 'Custom Bridal Jewellery Crafting', priceRange: 'On Consultation' }
    ]
  },
  {
    id: 'prov_ahmedabad_one_mall_vastrapur',
    name: 'Ahmedabad One Mall (Nexus Malls)',
    categorySlug: 'shopping',
    description: 'Premier shopping mall housing top international luxury and premium brands: Sephora, Tommy Hilfiger, Mango, Steve Madden, Starbucks, and Cinepolis VIP.',
    address: 'Plot No. 216, T.P. Scheme-1, Vastrapur, Ahmedabad 380054',
    phone: '+91 79 4019 3677',
    bookingMethod: 'WALK_IN',
    reliabilityScore: 97,
    notes: 'Valet parking assistance and VIP cinema booking.',
    tags: ['mall', 'shopping', 'luxury brands', 'vastrapur', 'cinema', 'dining'],
    services: [
      { name: 'Personal Shopper Assistance & Store Pickup', priceRange: 'Concierge Arranged' },
      { name: 'Cinepolis VIP Recliner Ticket Booking', priceRange: '?600 - ?1,200 per ticket' }
    ]
  },
  {
    id: 'prov_law_garden_night_market',
    name: 'Law Garden Handicraft Market',
    categorySlug: 'shopping',
    description: 'Vibrant evening market known for authentic Kutchi embroidery, mirror-work chaniya cholis, traditional oxidized silver jewellery, and handicrafts.',
    address: 'Netaji Road, Ellisbridge, Law Garden, Ahmedabad 380006',
    bookingMethod: 'WALK_IN',
    reliabilityScore: 94,
    notes: 'Evening market opens from 6:30 PM until late midnight.',
    tags: ['handicrafts', 'law garden', 'kutchi', 'chaniya choli', 'traditional jewellery', 'ellisbridge'],
    services: [
      { name: 'Concierge Sourced Traditional Attire Selection', priceRange: '?3,500 - ?12,000' }
    ]
  },

  // ==========================================
  // 6. HOME, REPAIRS & PRIVATE ESTATE SUPPORT
  // ==========================================
  {
    id: 'prov_proventa_estate_and_home_squad',
    name: 'Proventa Premium Estate & Villa Maintenance',
    categorySlug: 'home',
    description: 'White-glove home services catering to bungalows, penthouses, and farmhouses in Ambli, Bopal, Bodakdev, and Thaltej.',
    address: 'Serving Greater Ahmedabad Prime Residential Zones',
    phone: '+91 79 2692 0000',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Vetted, background-verified technicians and supervisors on every assignment.',
    tags: ['home maintenance', 'villa repair', 'hvac', 'plumbing', 'electrical', 'ambli', 'bopal', 'bodakdev'],
    services: [
      { name: 'Comprehensive HVAC & Chiller Seasonal Deep Clean', priceRange: '?2,500 - ?6,000' },
      { name: 'Emergency Plumbing / Electrical Master Dispatch (Under 60 min)', priceRange: '?1,500 base + parts' },
      { name: 'Post-Renovation / Move-in Architectural Deep Cleaning', priceRange: '?8,000 - ?25,000' }
    ]
  },
  {
    id: 'prov_urban_green_landscape_studio',
    name: 'Urban Greenery & Terrace Garden Architects',
    categorySlug: 'home',
    description: 'Bespoke terrace garden design, vertical green walls, drip irrigation setups, and rare exotic plant procurement for luxury residences.',
    address: 'Sindhu Bhavan Road / Ambli-Bopal Road, Ahmedabad 380058',
    phone: '+91 98250 88811',
    bookingMethod: 'PHONE',
    reliabilityScore: 95,
    notes: 'Includes bi-weekly horticultural care subscription option.',
    tags: ['landscape', 'gardening', 'terrace garden', 'plants', 'ambli', 'bopal'],
    services: [
      { name: 'Terrace Garden Design & Installation Assessment', priceRange: '?3,500 consultation' },
      { name: 'Monthly Estate Horticultural Maintenance', priceRange: '?6,000 - ?15,000 / month' }
    ]
  },

  // ==========================================
  // 7. BUSINESS, PROTOCOL & GIFTING
  // ==========================================
  {
    id: 'prov_gift_city_executive_concierge',
    name: 'GIFT City Corporate Suite & Meeting Desk',
    categorySlug: 'business',
    description: 'On-demand boardroom bookings, VIP delegate logistics, and financial district coordination in Gujarat International Finance Tec-City.',
    address: 'GIFT City, Gandhinagar / Greater Ahmedabad 382355',
    phone: '+91 79 6170 8300',
    bookingMethod: 'PHONE',
    reliabilityScore: 99,
    notes: 'Ideal for tech, banking, and international arbitration executives visiting GIFT City.',
    tags: ['gift city', 'corporate', 'boardroom', 'finance', 'gandhinagar', 'meeting'],
    services: [
      { name: 'Executive Boardroom Half-Day / Full-Day Booking', priceRange: '?12,000 - ?25,000' },
      { name: 'GIFT City Club & Hospitality Day Access', priceRange: '?3,500 per delegate' }
    ]
  },
  {
    id: 'prov_artisan_mithai_and_gifting',
    name: 'Kandoi Bhogilal Mulchand — Heritage Mithai & Gifting',
    categorySlug: 'shopping',
    description: 'Historic heritage confectioners established in 1845, famous for Mohanthal, Kaju Katli, golden-leaf sweets, and royal festive gift hampers.',
    address: 'Near C.G. Road & Lal Darwaja Branches, Ahmedabad 380009',
    phone: '+91 79 2646 6480',
    bookingMethod: 'PHONE',
    reliabilityScore: 98,
    notes: 'Standard corporate and wedding gifting provider across Gujarat.',
    tags: ['sweets', 'mithai', 'mohanthal', 'gifting', 'heritage', 'cg road'],
    services: [
      { name: 'Signature Heritage Mohanthal Gift Box (1 kg)', priceRange: '?950 - ?1,400' },
      { name: 'Corporate Bespoke Dry Fruit & Confection Hamper', priceRange: '?2,500 - ?7,500' }
    ]
  },
  {
    id: 'prov_gwalia_sweets_sindhu_bhavan',
    name: 'Gwalia Sweets & Signature Gourmet',
    categorySlug: 'shopping',
    description: 'Modern luxury confectionery and dry fruit gifting house renowned for imported chocolates, artisanal baklava, and vacuum-sealed festive packaging.',
    address: 'Sindhu Bhavan Road, Bodakdev, Ahmedabad 380054',
    phone: '+91 79 4007 7777',
    bookingMethod: 'PHONE',
    reliabilityScore: 97,
    notes: 'Custom branding and same-day delivery to corporate offices.',
    tags: ['gourmet', 'sweets', 'baklava', 'hampers', 'sindhu bhavan', 'corporate gift'],
    services: [
      { name: 'Artisanal Baklava & Nut Hamper Curation', priceRange: '?1,800 - ?5,000' }
    ]
  }
];
