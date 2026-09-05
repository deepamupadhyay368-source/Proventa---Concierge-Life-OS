'use client';

import { useState } from 'react';
import { Download, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function DataControls() {
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      const res = await fetch('/api/customer/export');
      if (!res.ok) {
        throw new Error('Failed to generate export archive');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proventa-data-archive-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmInput !== 'DELETE_MY_ACCOUNT') {
      setError('Please type DELETE_MY_ACCOUNT exactly to confirm');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      const res = await fetch('/api/customer/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmInput }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }

      // Deletion succeeded, sign out user and redirect to home
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setError(err.message || 'Deletion failed');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Secure Archive...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Export My Full Data Archive (JSON)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Request Account & Data Deletion</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-semibold text-neutral-900">Irreversible Data Erasure</h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Under the DPDP Act 2023, this action permanently anonymizes your personal identity, revokes your membership, and cancels any pending requests. This operation cannot be undone.
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Type <span className="font-mono font-bold text-red-600">DELETE_MY_ACCOUNT</span> below to proceed:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE_MY_ACCOUNT"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmInput('');
                  setError(null);
                }}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmInput !== 'DELETE_MY_ACCOUNT'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Erasing Data...</span>
                  </>
                ) : (
                  <span>Permanently Erase My Data</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
