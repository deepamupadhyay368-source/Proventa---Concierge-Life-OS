'use client';

import { StructuredRequestForm } from '@/lib/requests/request-builder';
import { LocationSelector } from './LocationSelector';
import { BudgetSelector } from './BudgetSelector';
import { PartySizeSelector } from './PartySizeSelector';
import {
  Calendar,
  Clock,
  Sparkles,
  Plane,
  Building2,
  Ticket,
  Film,
  Utensils,
  Stethoscope,
  Car,
  Gift,
  Compass,
  FileText,
  Check
} from 'lucide-react';

interface ServiceSpecificFieldsProps {
  form: StructuredRequestForm;
  onChange: (updated: Partial<StructuredRequestForm>) => void;
  activeStep: number;
}

export function ServiceSpecificFields({ form, onChange, activeStep }: ServiceSpecificFieldsProps) {
  const togglePreference = (pref: string) => {
    const current = form.preferences || [];
    if (current.includes(pref)) {
      onChange({ preferences: current.filter((p) => p !== pref) });
    } else {
      onChange({ preferences: [...current, pref] });
    }
  };

  // Helper for quick preference chips
  const renderPreferenceChips = (chips: string[]) => (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
        Preferences & Amenities
      </label>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => {
          const isSelected = (form.preferences || []).includes(chip);
          return (
            <button
              key={chip}
              type="button"
              onClick={() => togglePreference(chip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'bg-[#1F2933] text-white border-[#1F2933] font-semibold shadow-2xs'
                  : 'bg-[#F7F8FA] hover:bg-white text-[#1F2933] border-[#E1E5E8]'
              }`}
            >
              {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
              <span>{chip}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* -------------------- FLIGHTS -------------------- */}
      {form.service === 'FLIGHTS' && (
        <>
          {/* Trip Type & Cabin Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Trip Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F3F5] rounded-xl border border-[#E1E5E8] text-xs">
                {(['ONE_WAY', 'ROUND_TRIP'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ tripType: t })}
                    className={`py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                      form.tripType === t || (!form.tripType && t === 'ONE_WAY')
                        ? 'bg-white text-[#1F2933] shadow-2xs font-semibold'
                        : 'text-[#66717C] hover:text-[#1F2933]'
                    }`}
                  >
                    {t === 'ONE_WAY' ? 'One Way' : 'Round Trip'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Cabin Class
              </label>
              <select
                value={form.cabinClass || 'ECONOMY'}
                onChange={(e) => onChange({ cabinClass: e.target.value as any })}
                className="w-full p-2.5 bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs font-medium text-[#1F2933] focus:outline-none transition-colors cursor-pointer shadow-2xs"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business Class</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>
          </div>

          {/* Route Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="From City / Airport"
              value={form.origin || 'Ahmedabad (AMD)'}
              onChange={(val) => onChange({ origin: val })}
              placeholder="e.g. Ahmedabad (AMD)"
              isAirportMode
              required
            />
            <LocationSelector
              label="To City / Airport"
              value={form.destination || 'Mumbai (BOM)'}
              onChange={(val) => onChange({ destination: val })}
              placeholder="e.g. Mumbai (BOM) or London (LHR)"
              isAirportMode
              required
            />
          </div>

          {/* Departure & Return Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Departure Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
                required
              />
            </div>

            {form.tripType === 'ROUND_TRIP' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                  Return Date
                </label>
                <input
                  type="date"
                  value={form.returnDate || ''}
                  onChange={(e) => onChange({ returnDate: e.target.value })}
                  min={form.date || undefined}
                  className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            )}
          </div>

          {/* Passengers & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Passengers"
              unit="passengers"
              value={form.partySize || 1}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {/* Preferences */}
          {renderPreferenceChips([
            'Non-stop flights only',
            'Morning departure',
            'Evening departure',
            'Window seat',
            'Aisle seat',
            'Extra baggage allowance',
            'IndiGo',
            'Air India / Vistara',
          ])}
        </>
      )}

      {/* -------------------- HOTELS -------------------- */}
      {form.service === 'HOTELS' && (
        <>
          <LocationSelector
            label="City / Destination"
            value={form.city || form.destination || 'Ahmedabad'}
            onChange={(val) => onChange({ city: val, destination: val })}
            placeholder="e.g. Udaipur, Ahmedabad, Mumbai, Goa..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Check-out Date
              </label>
              <input
                type="date"
                value={form.returnDate || ''}
                onChange={(e) => onChange({ returnDate: e.target.value })}
                min={form.date || undefined}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Guests"
              unit="guests"
              value={form.partySize || 2}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            '5-Star Luxury',
            'Heritage / Palace',
            'Pool & Spa',
            'Breakfast Included',
            'King Bed',
            'High Floor / City View',
            'ITC Narmada / Taj',
            'Late Check-out',
          ])}
        </>
      )}

      {/* -------------------- EVENTS -------------------- */}
      {form.service === 'EVENTS' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="City"
              value={form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Event / Pass Type
              </label>
              <input
                type="text"
                value={form.targetName || ''}
                onChange={(e) => onChange({ targetName: e.target.value })}
                placeholder="e.g. Garba passes, Live concert, Sports VIP ticket..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
              Event Date / Schedule
            </label>
            <input
              type="date"
              value={form.date || ''}
              onChange={(e) => onChange({ date: e.target.value })}
              className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Number of Passes / People"
              unit="passes"
              value={form.partySize || 2}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'VIP Pass Access',
            'All-Night Access',
            'Valet Parking',
            'Celebrity Stage View',
            'Club / Premium Arena',
          ])}
        </>
      )}

      {/* -------------------- MOVIES -------------------- */}
      {form.service === 'MOVIES' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="City"
              value={form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Movie Name (or Any Acclaimed)
              </label>
              <input
                type="text"
                value={form.targetName || ''}
                onChange={(e) => onChange({ targetName: e.target.value })}
                placeholder="e.g. Any acclaimed movie, Oppenheimer..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Preferred Show Timing
              </label>
              <select
                value={form.timeSlot || 'EVENING'}
                onChange={(e) => onChange({ timeSlot: e.target.value as any })}
                className="w-full p-2.5 bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors cursor-pointer shadow-2xs"
              >
                <option value="MORNING">Morning (09:00 AM - 12:00 PM)</option>
                <option value="AFTERNOON">Afternoon (12:00 PM - 04:00 PM)</option>
                <option value="EVENING">Prime Evening (05:00 PM - 08:30 PM)</option>
                <option value="NIGHT">Late Night (09:00 PM onwards)</option>
                <option value="ANY">Any Show Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Seats / People"
              unit="tickets"
              value={form.partySize || 2}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'IMAX Laser',
            'Insignia / Director’s Cut',
            'Recliner Seating',
            'PVR Palladium / Acropolis',
            'English Audio',
            'Prime Center Row',
          ])}
        </>
      )}

      {/* -------------------- DINING -------------------- */}
      {form.service === 'DINING' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="City"
              value={form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Cuisine or Restaurant Name
              </label>
              <input
                type="text"
                value={form.targetName || ''}
                onChange={(e) => onChange({ targetName: e.target.value })}
                placeholder="e.g. Agashiye, Modern Indian, Rooftop Italian..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Preferred Time
              </label>
              <select
                value={form.time || '8:00 PM'}
                onChange={(e) => onChange({ time: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors cursor-pointer shadow-2xs"
              >
                <option value="12:30 PM">Lunch — 12:30 PM</option>
                <option value="1:00 PM">Lunch — 1:00 PM</option>
                <option value="1:30 PM">Lunch — 1:30 PM</option>
                <option value="7:00 PM">Dinner — 7:00 PM</option>
                <option value="7:30 PM">Dinner — 7:30 PM</option>
                <option value="8:00 PM">Dinner — 8:00 PM</option>
                <option value="8:30 PM">Dinner — 8:30 PM</option>
                <option value="9:00 PM">Dinner — 9:00 PM</option>
                <option value="9:30 PM">Dinner — 9:30 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Table For"
              unit="guests"
              value={form.partySize || 2}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'Rooftop Seating',
            'Quiet Table / Discreet',
            'Heritage Gujarati Thali',
            'Pure Vegetarian / Jain Friendly',
            'Fine Dining / Michelin Guide',
            'Private Dining Room (PDR)',
            'Candlelight / Anniversary',
          ])}
        </>
      )}

      {/* -------------------- HEALTHCARE -------------------- */}
      {form.service === 'HEALTHCARE' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="City"
              value={form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Specialty / Doctor Name
              </label>
              <input
                type="text"
                value={form.targetName || ''}
                onChange={(e) => onChange({ targetName: e.target.value })}
                placeholder="e.g. Cardiologist, Dermatologist, Dental, Executive Health..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Preferred Consultation Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Preferred Slot
              </label>
              <select
                value={form.timeSlot || 'MORNING'}
                onChange={(e) => onChange({ timeSlot: e.target.value as any })}
                className="w-full p-2.5 bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors cursor-pointer shadow-2xs"
              >
                <option value="MORNING">Morning Slot (09:00 AM - 12:00 PM)</option>
                <option value="AFTERNOON">Afternoon Slot (01:00 PM - 05:00 PM)</option>
                <option value="EVENING">Evening Slot (05:00 PM - 08:30 PM)</option>
                <option value="ANY">First Available Earliest Slot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Patients"
              unit="patients"
              value={form.partySize || 1}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'Senior Consultant / Chief Specialist',
            'Apollo / Marengo CIMS / Zydus',
            'Private VIP Consultation Room',
            'Second Opinion Review',
            'Home Sample Collection',
          ])}
        </>
      )}

      {/* -------------------- TRANSPORT -------------------- */}
      {form.service === 'TRANSPORT' && (
        <>
          <LocationSelector
            label="City"
            value={form.city || 'Ahmedabad'}
            onChange={(val) => onChange({ city: val })}
            placeholder="e.g. Ahmedabad, Mumbai"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.pickupLocation || ''}
                onChange={(e) => onChange({ pickupLocation: e.target.value })}
                placeholder="e.g. SVPIA Airport T2, Home, Bodakdev..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Drop Destination
              </label>
              <input
                type="text"
                value={form.destination || ''}
                onChange={(e) => onChange({ destination: e.target.value })}
                placeholder="e.g. GIFT City Club, ITC Narmada, Airport..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Pickup Time
              </label>
              <input
                type="time"
                value={form.time || '10:00'}
                onChange={(e) => onChange({ time: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Passengers"
              unit="passengers"
              value={form.partySize || 1}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'Executive Sedan (Camry / C-Class)',
            'Luxury SUV (Fortuner / GLE)',
            'Mercedes-Benz E-Class / S-Class',
            'Uniformed Chauffeur',
            'Meet & Greet at Airport Terminal',
            'Full-Day Chauffeur Hire',
          ])}
        </>
      )}

      {/* -------------------- GIFTING -------------------- */}
      {form.service === 'GIFTING' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="Delivery City / Area"
              value={form.deliveryLocation || form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ deliveryLocation: val, city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Occasion
              </label>
              <input
                type="text"
                value={form.occasion || ''}
                onChange={(e) => onChange({ occasion: e.target.value })}
                placeholder="e.g. Birthday, Anniversary, Diwali, Corporate..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Recipient
              </label>
              <input
                type="text"
                value={form.recipient || ''}
                onChange={(e) => onChange({ recipient: e.target.value })}
                placeholder="e.g. Spouse, Corporate Client, Parents..."
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Delivery Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-1">
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'Curated Luxury Hamper',
            'Fresh Exotic Floral Arrangement',
            'Personalized Calligraphy Card',
            'Artisanal Chocolates & Sweets',
            'Discreet VIP Hand Delivery',
          ])}
        </>
      )}

      {/* -------------------- TRIPS / GETAWAYS -------------------- */}
      {form.service === 'TRIPS' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="Departure City"
              value={form.origin || 'Ahmedabad'}
              onChange={(val) => onChange({ origin: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
              required
            />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
                  Destination
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ isSurpriseDestination: !form.isSurpriseDestination })}
                  className="text-[11px] font-medium text-[#1F2933] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-[#1F2933]" />
                  <span>{form.isSurpriseDestination ? 'Enter specific' : 'Surprise me'}</span>
                </button>
              </div>
              {form.isSurpriseDestination ? (
                <div className="p-2.5 bg-[#F1F3F5] rounded-xl text-xs font-semibold text-[#1F2933] border border-[#E1E5E8] flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Curated surprise destination by Proventa</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={form.destination || ''}
                  onChange={(e) => onChange({ destination: e.target.value })}
                  placeholder="e.g. Goa, Udaipur, Rann of Kutch, Dubai..."
                  className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={form.returnDate || ''}
                onChange={(e) => onChange({ returnDate: e.target.value })}
                min={form.date || undefined}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Travelers"
              unit="people"
              value={form.partySize || 2}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>

          {renderPreferenceChips([
            'Private Luxury Villa',
            'Beach & Ocean View',
            'Heritage Fort / Palace',
            'Mountain Escape',
            'Complete Itinerary + Transfers',
            'Fine Dining Included',
          ])}
        </>
      )}

      {/* -------------------- OTHER / BESPOKE -------------------- */}
      {form.service === 'OTHER' && (
        <>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
              What can we take care of? <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.notes || ''}
              onChange={(e) => onChange({ notes: e.target.value, targetName: e.target.value })}
              placeholder="Describe your request in detail... (e.g. Schedule a private stylist, arrange courier from GIFT City, research top schools)"
              className="w-full p-3.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors placeholder:text-[#A7B0B8] resize-none shadow-2xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocationSelector
              label="Relevant City / Location"
              value={form.city || 'Ahmedabad'}
              onChange={(val) => onChange({ city: val })}
              placeholder="e.g. Ahmedabad, Mumbai"
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
                Target Date / Deadline
              </label>
              <input
                type="date"
                value={form.date || ''}
                onChange={(e) => onChange({ date: e.target.value })}
                className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <PartySizeSelector
              label="Party / Beneficiaries"
              unit="people"
              value={form.partySize || 1}
              onChange={(val) => onChange({ partySize: val })}
            />
            <BudgetSelector
              mode={form.budgetMode}
              amount={form.budgetAmount}
              onModeChange={(m) => onChange({ budgetMode: m })}
              onAmountChange={(a) => onChange({ budgetAmount: a })}
            />
          </div>
        </>
      )}

      {/* Common Special Instructions Notes (for services other than OTHER) */}
      {form.service !== 'OTHER' && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C] mb-1.5">
            Additional Notes or Special Instructions (Optional)
          </label>
          <input
            type="text"
            value={form.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="e.g. Need high floor with quiet view, billing under corporate GST, allergic to shellfish..."
            className="w-full p-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs text-[#1F2933] focus:outline-none transition-colors shadow-2xs placeholder:text-[#A7B0B8]"
          />
        </div>
      )}
    </div>
  );
}
