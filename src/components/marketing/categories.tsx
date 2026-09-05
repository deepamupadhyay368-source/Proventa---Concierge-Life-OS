import { UtensilsCrossed, Plane, ShoppingBag, Ticket, Calendar, Home, User, Briefcase, Sparkles, Cpu } from 'lucide-react';

const CATEGORIES = [
  { id: 'MOD-01', icon: UtensilsCrossed, name: 'Dining Matrix', description: 'Curated reservations, private chef pairings & tables.', tag: 'PRIORITY' },
  { id: 'MOD-02', icon: Plane, name: 'Global Travel', description: 'Bespoke routing, premium stays & itinerary automation.', tag: 'EXPEDITE' },
  { id: 'MOD-03', icon: ShoppingBag, name: 'Sourcing & Luxury', description: 'Rare acquisitions, global gifts & verification.', tag: 'SECURE' },
  { id: 'MOD-04', icon: Ticket, name: 'Private Access', description: 'VIP passes, sold-out galas & exclusive admissions.', tag: 'VIP' },
  { id: 'MOD-05', icon: Calendar, name: 'Wellness & Spas', description: 'Elite practitioners, discreet slots & appointments.', tag: 'SCHEDULE' },
  { id: 'MOD-06', icon: Home, name: 'Estate & Living', description: 'Vetted maintenance, renovations & operational support.', tag: 'VETTED' },
  { id: 'MOD-07', icon: User, name: 'Personal Protocol', description: 'Discreet errand execution & lifestyle management.', tag: 'STEALTH' },
  { id: 'MOD-08', icon: Briefcase, name: 'Executive Suite', description: 'Corporate logistics, boardroom dinners & client care.', tag: 'ENTERPRISE' },
  { id: 'MOD-09', icon: Sparkles, name: 'Custom Directive', description: 'Arbitrary complex requirements fulfilled safely.', tag: 'ANY' },
];

export function CategoriesSection() {
  return (
    <section className="py-24 relative border-t border-slate-200/80 bg-white backdrop-blur-md">
      <div className="tech-grid absolute inset-0 opacity-40 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-50 text-cyan-700 font-mono text-xs mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>CAPABILITIES MATRIX // 9 ACTIVE MODULES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              What Proventa <span className="tech-gradient-text">Executes</span>
            </h2>
            <p className="text-slate-600 max-w-xl text-sm md:text-base">
              From an impossible table in Ahmedabad to a complex multi-continent relocation. If it can be delegated, Proventa handles the full lifecycle.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-500 border-l border-cyan-500/30 pl-4 py-1 hidden md:block">
            STATUS: FULL DISPATCH READY<br />
            TARGET LATENCY: &lt; 30 SECONDS
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="group relative p-6 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-cyan-500/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{cat.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-slate-100 text-cyan-700 border border-slate-200">
                        {cat.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-cyan-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between font-mono text-[11px] text-slate-400">
                  <span className="group-hover:text-cyan-600 font-medium transition-colors">INITIATE DISPATCH</span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform group-hover:text-cyan-600">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
