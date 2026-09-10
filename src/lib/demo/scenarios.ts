export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  prompt: string;
  description: string;
  expectedAgent: string;
  budgetEstimate: string;
  tier: 'REAL' | 'SANDBOX';
  venues: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'heritage-dining-ahmedabad',
    title: 'Heritage Rooftop Gujarati Thali for 4',
    category: 'dining',
    categoryLabel: 'Fine Dining & Hospitality',
    prompt: 'Reserve an outdoor terrace table for 4 tonight at 8:00 PM at Agashiye in Ahmedabad. Client prefers authentic Heritage Thali and quiet seating.',
    description: 'Autonomous dining coordination connecting to Ahmedabad Verified Partner Network with multi-option selection and real reference pass issuance.',
    expectedAgent: 'Ahmedabad Verified Dining Specialist',
    budgetEstimate: '₹3,900 - ₹5,500',
    tier: 'REAL',
    venues: ['Agashiye — The House of MG', 'The Royal Vega Heritage', 'Vishalla'],
  },
  {
    id: 'svpia-chauffeured-transit',
    title: 'VIP Chauffeured Airport Transit (SVPIA)',
    category: 'travel',
    categoryLabel: 'Private Mobility & Chauffeur',
    prompt: 'Arrange a chauffeured luxury sedan from Sindhu Bhavan Road to Ahmedabad Airport (SVPIA) tomorrow morning at 6:30 AM with flight flight-sync tracking.',
    description: 'Chauffeured dispatch coordinated with real flight timing, multi-agent DAG subtask sync, and driver credential verification.',
    expectedAgent: 'Mobility & Airport Fleet Specialist',
    budgetEstimate: '₹1,800 - ₹3,200',
    tier: 'REAL',
    venues: ['SVPIA Executive Fleet Services', 'Ahmedabad Chauffeur Co.'],
  },
  {
    id: 'taj-skyline-suite',
    title: 'Taj Skyline Luxury Stay & Late Checkout',
    category: 'travel',
    categoryLabel: 'Luxury Hotel & Estate',
    prompt: 'Book a Club Room or Executive Suite at Taj Skyline Ahmedabad for 2 nights starting Friday with late checkout and breakfast included.',
    description: 'Hospitality booking with client policy authorization gate and direct partner confirmation webhook ingestion.',
    expectedAgent: 'Luxury Hotel & Hospitality Specialist',
    budgetEstimate: '₹22,000 - ₹35,000',
    tier: 'REAL',
    venues: ['Taj Skyline Ahmedabad', 'ITC Narmada Luxury Collection'],
  },
  {
    id: 'sandbox-artisan-gifting',
    title: '[SANDBOX] Handcrafted Patan Patola Silk Gift Sourcing',
    category: 'shopping',
    categoryLabel: 'Artisan Sourcing & Bespoke Gifts',
    prompt: 'Source a double-ikat handcrafted Patan Patola silk scarf gift wrapped with personal handwritten calligraphy note delivered by Friday.',
    description: 'Demonstrates human concierge fallback queue and custom proposal injection for unique bespoke artisan commissions.',
    expectedAgent: 'Concierge Sourcing Specialist (Human-Assisted)',
    budgetEstimate: '₹15,000+',
    tier: 'SANDBOX',
    venues: ['Patan Heritage Weavers Guild', 'Ahmedabad Artisan Collective'],
  },
];