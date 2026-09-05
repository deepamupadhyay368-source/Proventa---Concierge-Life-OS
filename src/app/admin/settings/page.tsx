'use client';

import { useState, useEffect } from 'react';
import { Sliders, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.flags) setFlags(data.flags);
      if (data.settings) setSettings(data.settings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleFlag = async (key: string, currentVal: boolean) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: !currentVal }),
    });
    loadSettings();
  };

  const defaultFlags = [
    { key: 'FEATURE_WAVE1_REGISTRATION', desc: 'Allow public users in Ahmedabad to register for Wave 1 waitlist', defaultValue: true },
    { key: 'FEATURE_AI_ENABLED', desc: 'Enable Gemini-assisted Request Understanding and Copilot drafting', defaultValue: true },
    { key: 'FEATURE_PAYMENTS_ENABLED', desc: 'Enable live payment capture (inactive in Wave 1 by default)', defaultValue: false },
    { key: 'FEATURE_GOOGLE_AUTH', desc: 'Enable Google OAuth sign-in', defaultValue: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">System Configuration & Feature Flags</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Control live platform capabilities, operational thresholds, and Wave 1 rollout.</p>
      </div>

      {/* Feature Flags */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Live Feature Flags</h2>
        <div className="divide-y divide-neutral-100">
          {defaultFlags.map((df) => {
            const current = flags.find((f) => f.key === df.key);
            const isEnabled = current ? current.value : df.defaultValue;
            return (
              <div key={df.key} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-900 number-mono">{df.key}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{df.desc}</p>
                </div>

                <button
                  onClick={() => toggleFlag(df.key, isEnabled)}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                    isEnabled ? 'text-green-700 bg-green-50' : 'text-neutral-400 bg-neutral-100'
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Disabled</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations & SLA Settings */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Operating SLA Targets (Ahmedabad)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-neutral-500 block mb-1">Initial Response SLA</span>
            <span className="text-base font-bold text-neutral-900">30 Minutes</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-neutral-500 block mb-1">Options Prepared SLA</span>
            <span className="text-base font-bold text-neutral-900">2 Hours</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-neutral-500 block mb-1">Execution SLA</span>
            <span className="text-base font-bold text-neutral-900">4 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
