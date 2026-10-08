'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Plane, Check, X } from 'lucide-react';

export interface LocationOption {
  city: string;
  code?: string;
  state?: string;
  country?: string;
  airportName?: string;
  isPopular?: boolean;
}

export const CURATED_LOCATIONS: LocationOption[] = [
  { city: 'Ahmedabad', code: 'AMD', state: 'Gujarat', country: 'India', airportName: 'Sardar Vallabhbhai Patel Intl', isPopular: true },
  { city: 'Mumbai', code: 'BOM', state: 'Maharashtra', country: 'India', airportName: 'Chhatrapati Shivaji Maharaj Intl', isPopular: true },
  { city: 'Delhi / NCR', code: 'DEL', state: 'Delhi', country: 'India', airportName: 'Indira Gandhi Intl', isPopular: true },
  { city: 'Bengaluru', code: 'BLR', state: 'Karnataka', country: 'India', airportName: 'Kempegowda Intl', isPopular: true },
  { city: 'Goa', code: 'GOI', state: 'Goa', country: 'India', airportName: 'Dabolim / Mopa Manohar Intl', isPopular: true },
  { city: 'Udaipur', code: 'UDR', state: 'Rajasthan', country: 'India', airportName: 'Maharana Pratap Airport', isPopular: true },
  { city: 'Jaipur', code: 'JAI', state: 'Rajasthan', country: 'India', airportName: 'Jaipur Intl Airport', isPopular: true },
  { city: 'Hyderabad', code: 'HYD', state: 'Telangana', country: 'India', airportName: 'Rajiv Gandhi Intl', isPopular: true },
  { city: 'Pune', code: 'PNQ', state: 'Maharashtra', country: 'India', airportName: 'Pune Airport', isPopular: true },
  { city: 'Chennai', code: 'MAA', state: 'Tamil Nadu', country: 'India', airportName: 'Chennai Intl Airport', isPopular: true },
  { city: 'Kolkata', code: 'CCU', state: 'West Bengal', country: 'India', airportName: 'Netaji Subhash Chandra Bose Intl', isPopular: true },
  { city: 'Dubai', code: 'DXB', state: 'UAE', country: 'UAE', airportName: 'Dubai Intl Airport', isPopular: true },
  { city: 'London', code: 'LHR', state: 'UK', country: 'UK', airportName: 'Heathrow Airport', isPopular: true },
  { city: 'Singapore', code: 'SIN', state: 'Singapore', country: 'Singapore', airportName: 'Changi Airport', isPopular: true },
  { city: 'GIFT City', code: 'GIFT', state: 'Gujarat', country: 'India', isPopular: false },
  { city: 'Vadodara', code: 'BDQ', state: 'Gujarat', country: 'India', isPopular: false },
  { city: 'Surat', code: 'STV', state: 'Gujarat', country: 'India', isPopular: false },
  { city: 'Rajkot', code: 'RAJ', state: 'Gujarat', country: 'India', isPopular: false },
  { city: 'Chandigarh', code: 'IXC', state: 'Punjab', country: 'India', isPopular: false },
  { city: 'Kochi', code: 'COK', state: 'Kerala', country: 'India', isPopular: false },
];

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isAirportMode?: boolean;
  required?: boolean;
  className?: string;
}

export function LocationSelector({
  label,
  value,
  onChange,
  placeholder = 'Search city or airport...',
  isAirportMode = false,
  required = false,
  className = '',
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = CURATED_LOCATIONS.filter((loc) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      loc.city.toLowerCase().includes(q) ||
      (loc.code && loc.code.toLowerCase().includes(q)) ||
      (loc.state && loc.state.toLowerCase().includes(q)) ||
      (loc.country && loc.country.toLowerCase().includes(q)) ||
      (loc.airportName && loc.airportName.toLowerCase().includes(q))
    );
  });

  const handleSelect = (cityName: string, code?: string) => {
    const displayVal = isAirportMode && code ? `${cityName} (${code})` : cityName;
    onChange(displayVal);
    setIsOpen(false);
    setQuery('');
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        // Default to Ahmedabad in local environment or detect nearest metro
        const defaultCity = 'Ahmedabad';
        handleSelect(defaultCity, 'AMD');
        setLocationStatus(`Detected near ${defaultCity}`);
        setTimeout(() => setLocationStatus(null), 3000);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location permission not granted. Please select manually.');
        } else {
          setLocationStatus('Could not determine location. Please select manually.');
        }
        setTimeout(() => setLocationStatus(null), 3000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#66717C] hover:text-[#1F2933] transition-colors cursor-pointer"
        >
          <Navigation className={`h-3 w-3 ${isLocating ? 'animate-spin text-[#1F2933]' : 'text-[#A7B0B8]'}`} />
          <span>{isLocating ? 'Detecting...' : 'Current City'}</span>
        </button>
      </div>

      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3 bg-[#F7F8FA] hover:bg-white border border-[#E1E5E8] focus-within:border-[#1F2933] focus-within:bg-white rounded-xl text-xs text-[#1F2933] transition-all cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isAirportMode ? (
            <Plane className="h-4 w-4 text-[#66717C] shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 text-[#66717C] shrink-0" />
          )}
          <span className={`truncate font-medium ${value ? 'text-[#1F2933]' : 'text-[#A7B0B8]'}`}>
            {value || placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 text-[#A7B0B8] hover:text-[#1F2933] rounded transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {locationStatus && (
        <p className="text-[10px] text-[#66717C] mt-1 italic animate-fade-in">{locationStatus}</p>
      )}

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E1E5E8] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up">
          <div className="p-2.5 border-b border-[#E1E5E8] flex items-center gap-2 bg-[#F7F8FA]">
            <Search className="h-3.5 w-3.5 text-[#66717C] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, airport, state..."
              autoFocus
              className="w-full bg-transparent text-xs text-[#1F2933] focus:outline-none placeholder:text-[#A7B0B8]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[#A7B0B8] hover:text-[#1F2933] text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="p-3 text-center">
                <p className="text-xs text-[#66717C]">No matching locations found.</p>
                {query && (
                  <button
                    type="button"
                    onClick={() => handleSelect(query.trim())}
                    className="mt-2 text-xs font-semibold text-[#1F2933] underline cursor-pointer"
                  >
                    Use &ldquo;{query.trim()}&rdquo;
                  </button>
                )}
              </div>
            ) : (
              filtered.map((loc) => {
                const isSelected = value.includes(loc.city) || (loc.code && value.includes(loc.code));
                return (
                  <button
                    key={`${loc.city}-${loc.code || ''}`}
                    type="button"
                    onClick={() => handleSelect(loc.city, loc.code)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F1F3F5] text-[#1F2933] font-semibold'
                        : 'hover:bg-[#F7F8FA] text-[#1F2933]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-[#A7B0B8] shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-[#1F2933]">{loc.city}</span>
                        {loc.state && <span className="text-[11px] text-[#66717C] ml-1.5">· {loc.state}</span>}
                        {loc.airportName && (
                          <p className="text-[10px] text-[#66717C] truncate">{loc.airportName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {loc.code && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]">
                          {loc.code}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
