'use client';

import { Users, Minus, Plus } from 'lucide-react';

interface PartySizeSelectorProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  unit?: string;
  min?: number;
  max?: number;
  className?: string;
}

const PRESET_COUNTS = [1, 2, 3, 4, 5, 6, 8, 10];

export function PartySizeSelector({
  value,
  onChange,
  label = 'Number of People / Guests',
  unit = 'people',
  min = 1,
  max = 20,
  className = '',
}: PartySizeSelectorProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
          {label}
        </label>
        <span className="text-xs font-semibold text-[#1F2933]">
          {value} {value === 1 ? unit.replace(/s$/, '') : unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Stepper Controls */}
        <div className="flex items-center border border-[#E1E5E8] bg-[#F7F8FA] rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#F1F3F5] text-[#1F2933] disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center border border-[#E1E5E8] transition-colors cursor-pointer shadow-2xs"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-sm font-semibold text-[#1F2933]">
            {value}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#F1F3F5] text-[#1F2933] disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center border border-[#E1E5E8] transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Click Count Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {PRESET_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onChange(count)}
              className={`w-8 h-8 rounded-xl text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                value === count
                  ? 'bg-[#1F2933] text-white border-[#1F2933] font-semibold shadow-2xs'
                  : 'bg-[#F7F8FA] hover:bg-white text-[#1F2933] border-[#E1E5E8]'
              }`}
            >
              {count === 10 ? '10+' : count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
