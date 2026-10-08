'use client';

import { useState } from 'react';
import { IndianRupee, Sparkles } from 'lucide-react';

interface BudgetSelectorProps {
  mode: 'FLEXIBLE' | 'MAX' | 'EXACT';
  amount?: number;
  onModeChange: (mode: 'FLEXIBLE' | 'MAX' | 'EXACT') => void;
  onAmountChange: (amount?: number) => void;
  label?: string;
  className?: string;
}

const PRESET_AMOUNTS = [
  { label: '₹5,000', value: 5000 },
  { label: '₹10,000', value: 10000 },
  { label: '₹25,000', value: 25000 },
  { label: '₹50,000', value: 50000 },
  { label: '₹1,00,000+', value: 100000 },
];

export function BudgetSelector({
  mode,
  amount,
  onModeChange,
  onAmountChange,
  label = 'Budget / Price Expectation',
  className = '',
}: BudgetSelectorProps) {
  const [customInput, setCustomInput] = useState(amount ? String(amount) : '');

  const handleCustomChange = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, '');
    setCustomInput(numeric);
    if (numeric) {
      onAmountChange(parseInt(numeric, 10));
      if (mode === 'FLEXIBLE') onModeChange('MAX');
    } else {
      onAmountChange(undefined);
    }
  };

  const handlePresetClick = (val: number) => {
    onAmountChange(val);
    setCustomInput(String(val));
    if (mode === 'FLEXIBLE') onModeChange('MAX');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
          {label}
        </label>
        <span className="text-[11px] text-[#66717C]">
          {mode === 'FLEXIBLE'
            ? 'Best options will be curated'
            : mode === 'MAX'
            ? 'Maximum ceiling'
            : 'Target estimate'}
        </span>
      </div>

      {/* Mode Selection Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F3F5] rounded-xl border border-[#E1E5E8] text-xs">
        <button
          type="button"
          onClick={() => {
            onModeChange('FLEXIBLE');
            onAmountChange(undefined);
            setCustomInput('');
          }}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
            mode === 'FLEXIBLE'
              ? 'bg-white text-[#1F2933] shadow-2xs font-semibold'
              : 'text-[#66717C] hover:text-[#1F2933]'
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-[#1F2933]" />
            <span>Flexible</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onModeChange('MAX');
            if (!amount) handlePresetClick(25000);
          }}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
            mode === 'MAX'
              ? 'bg-white text-[#1F2933] shadow-2xs font-semibold'
              : 'text-[#66717C] hover:text-[#1F2933]'
          }`}
        >
          <span>Under / Max</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onModeChange('EXACT');
            if (!amount) handlePresetClick(25000);
          }}
          className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
            mode === 'EXACT'
              ? 'bg-white text-[#1F2933] shadow-2xs font-semibold'
              : 'text-[#66717C] hover:text-[#1F2933]'
          }`}
        >
          <span>Around / Target</span>
        </button>
      </div>

      {/* Amount Controls (Active when not Flexible) */}
      {mode !== 'FLEXIBLE' && (
        <div className="space-y-2 animate-fade-in">
          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border cursor-pointer ${
                  amount === preset.value
                    ? 'bg-[#1F2933] text-white border-[#1F2933]'
                    : 'bg-[#F7F8FA] hover:bg-white text-[#1F2933] border-[#E1E5E8]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66717C]">
              <IndianRupee className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={customInput ? Number(customInput).toLocaleString('en-IN') : ''}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Or enter custom budget (e.g. 15,000)"
              className="w-full pl-8 pr-3 py-2.5 bg-[#F7F8FA] focus:bg-white border border-[#E1E5E8] focus:border-[#1F2933] rounded-xl text-xs font-mono text-[#1F2933] focus:outline-none transition-all placeholder:text-[#A7B0B8]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
