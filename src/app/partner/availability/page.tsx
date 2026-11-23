'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Save, 
  ShieldCheck, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export default function PartnerAvailabilityPage() {
  const [schedule, setSchedule] = useState({
    monday: { morning: true, afternoon: true, evening: false },
    tuesday: { morning: true, afternoon: true, evening: false },
    wednesday: { morning: true, afternoon: true, evening: false },
    thursday: { morning: true, afternoon: true, evening: false },
    friday: { morning: true, afternoon: true, evening: false },
    saturday: { morning: true, afternoon: true, evening: true },
    sunday: { morning: false, afternoon: false, evening: false },
  });

  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([
    'Bopal',
    'South Bopal',
    'Satellite',
    'Prahlad Nagar'
  ]);

  const [radiusKm, setRadiusKm] = useState('6');
  const [onCallEmergency, setOnCallEmergency] = useState(true);
  const [saved, setSaved] = useState(false);

  const toggleSlot = (day: keyof typeof schedule, slot: 'morning' | 'afternoon' | 'evening') => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot]
      }
    }));
  };

  const toggleLocality = (locName: string) => {
    if (selectedLocalities.includes(locName)) {
      if (selectedLocalities.length > 1) {
        setSelectedLocalities(selectedLocalities.filter(l => l !== locName));
      }
    } else {
      setSelectedLocalities([...selectedLocalities, locName]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday (Rest Day)' },
  ] as const;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E3DFD5] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Roster & Working Hours</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Availability & Schedule</h1>
          <p className="text-xs text-stone-500 mt-1">Configure your weekly arrival shifts, dispatch radius & emergency standby status</p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Availability schedule and operating cluster updated successfully.</span>
        </div>
      )}

      {/* Emergency On-call Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700">24/7 Breakdown Roster</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">₹150 Surge per Call</span>
          </div>
          <h3 className="text-lg font-bold text-[#171A17]">Emergency Breakdown Standby</h3>
          <p className="text-xs text-stone-500">Allow dispatch for urgent water leakages and main electrical trips during night/early hours</p>
        </div>

        <button
          onClick={() => setOnCallEmergency(!onCallEmergency)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            onCallEmergency 
              ? 'bg-[#53634A] text-white' 
              : 'bg-stone-200 text-stone-700'
          }`}
        >
          {onCallEmergency ? 'Standby Active (Opted In)' : 'Disabled'}
        </button>
      </div>

      {/* Weekly Shifts Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-[#171A17] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#53634A]" /> Standard 2-Hour Arrival Windows
        </h2>

        <div className="divide-y divide-stone-100">
          {days.map(day => (
            <div key={day.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-bold text-sm text-[#171A17] sm:w-44">{day.label}</div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSlot(day.key, 'morning')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    schedule[day.key].morning
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  Morning (09:00 - 13:00)
                </button>

                <button
                  type="button"
                  onClick={() => toggleSlot(day.key, 'afternoon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    schedule[day.key].afternoon
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  Afternoon (14:00 - 18:00)
                </button>

                <button
                  type="button"
                  onClick={() => toggleSlot(day.key, 'evening')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    schedule[day.key].evening
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  Evening (18:00 - 20:00)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operating Locality & Dispatch Radius */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-[#171A17] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#53634A]" /> Operating Localities in Ahmedabad
        </h2>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {AHMEDABAD_LOCALITIES.map(loc => {
              const isSelected = selectedLocalities.includes(loc.name);
              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => toggleLocality(loc.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#53634A] text-white font-bold shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{loc.name}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Maximum travel radius from primary hub:</span>
            <strong className="text-stone-900 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
              {radiusKm} Kilometres
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
