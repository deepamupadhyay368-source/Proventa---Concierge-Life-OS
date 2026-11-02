'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, Check, ShieldAlert, ArrowRight } from 'lucide-react';

export function AccessKeyModal() {
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Check if there is a pending one-time access key for this newly authenticated session
    async function checkOneTimeKey() {
      try {
        const res = await fetch('/api/auth/one-time-access-key');
        if (res.ok) {
          const data = await res.json();
          if (data.hasKey && data.accessKey) {
            setAccessKey(data.accessKey);
          }
        }
      } catch {
        // Silent fail if network issue
      }
    }

    void checkOneTimeKey();
  }, []);

  if (!accessKey || closed) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090B10]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#171C26] border border-[#252C38] p-8 rounded-xs shadow-2xl space-y-6 text-[#F4F6FA]">
        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2457FF]/15 text-[#2457FF] border border-[#2457FF]/30 flex items-center justify-center rounded-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-black text-xl uppercase tracking-tight text-[#F4F6FA]">
              Your PROVENTA Access Key
            </h2>
            <p className="text-xs text-[#858D9B] mt-0.5">
              Unique 128-bit emergency credential for vault recovery &amp; access
            </p>
          </div>
        </div>

        {/* Security Warning Alert */}
        <div className="p-3.5 bg-[#FF7A70]/10 border border-[#FF7A70]/40 rounded-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#FF7A70] shrink-0 mt-0.5" />
          <div className="text-xs text-[#C5CAD3] leading-relaxed">
            <strong className="text-[#FF7A70]">CRITICAL SECURITY NOTICE:</strong> This key will only be shown to you once. For zero-knowledge encryption, only a cryptographic hash is stored in our database. Store this key in a secure password manager or physical vault.
          </div>
        </div>

        {/* Key Display Card */}
        <div className="p-4 bg-[#090B10] border border-[#252C38] rounded-xs space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#858D9B]">
            CONFIDENTIAL CREDENTIAL
          </div>
          <div className="font-mono font-bold text-lg sm:text-xl tracking-wider text-[#F4F6FA] select-all break-all text-center py-2 bg-[#171C26] border border-[#252C38] rounded-xs">
            {accessKey}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 bg-[#171C26] hover:bg-[#252C38] border border-[#252C38] text-xs font-mono uppercase tracking-wider text-[#C5CAD3] hover:text-white rounded-xs transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#2457FF]" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Access Key</span>
              </>
            )}
          </button>
        </div>

        {/* Explicit Confirmation Checkbox */}
        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#2457FF] rounded-xs"
            />
            <span className="text-xs text-[#C5CAD3] leading-relaxed">
              I confirm that I have safely copied and stored my PROVENTA Access Key. I understand that PROVENTA cannot restore this plaintext key if lost.
            </span>
          </label>

          <button
            type="button"
            disabled={!confirmed}
            onClick={() => setClosed(true)}
            className="w-full py-3.5 bg-[#2457FF] text-white hover:bg-[#1D4ED8] font-heading font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <span>Confirm &amp; Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
